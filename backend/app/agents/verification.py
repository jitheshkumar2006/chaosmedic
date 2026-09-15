import asyncio
import httpx
from datetime import datetime
from app.models import Incident, AgentEvent, AgentStatus, IncidentStatus
from app.database import db
from app.websocket import manager
from app.services.monitor import monitor
from app.services.memory import memory_service
from app.config import DEMO_APP_URL
import logging

logger = logging.getLogger(__name__)

async def run_verification(incident: Incident) -> Incident:
    """Verification Agent: Verify the application recovered successfully."""
    
    incident.status = IncidentStatus.VERIFYING
    incident.agents['verification'] = AgentStatus.RUNNING
    
    event = AgentEvent(
        incident_id=incident.id,
        agent='verification',
        status=AgentStatus.RUNNING,
        message='Verifying service health after recovery...',
    )
    incident.events.append(event)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    await asyncio.sleep(2)  # Wait for service to stabilize
    
    # Run verification checks
    checks = {
        'health_endpoint': False,
        'users_endpoint': False,
        'http_200': False,
        'no_errors': True,
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Check health
            health_resp = await client.get(f'{DEMO_APP_URL}/health')
            checks['health_endpoint'] = health_resp.status_code == 200
            checks['http_200'] = health_resp.status_code == 200
            
            # Check users endpoint  
            users_resp = await client.get(f'{DEMO_APP_URL}/users')
            checks['users_endpoint'] = users_resp.status_code == 200
            checks['no_errors'] = users_resp.status_code == 200
            
    except Exception as e:
        logger.error(f'Verification check failed: {e}')
        checks['no_errors'] = False
    
    all_passed = all(checks.values())
    
    if all_passed:
        incident.status = IncidentStatus.RESOLVED
        incident.resolved_at = datetime.utcnow()
        incident.recovery_duration = (incident.resolved_at - incident.created_at).total_seconds()
        incident.agents['verification'] = AgentStatus.COMPLETED
        
        # Update monitor
        monitor.demo_app_healthy = True
        
        # Remember the failure pattern
        if incident.root_cause and incident.selected_plan_id:
            selected = next((p for p in incident.recovery_plans if p.id == incident.selected_plan_id), None)
            if selected:
                memory_service.remember(
                    incident_id=incident.id,
                    error_type=incident.root_cause.error_type,
                    file=incident.root_cause.file,
                    line=incident.root_cause.line,
                    root_cause=incident.root_cause.probable_cause,
                    plan_name=selected.name,
                    patch_diff=selected.patch_diff,
                )
        
        # Pre-generate incident report PDF to disk
        try:
            from app.services.pdf_report import generate_incident_report_file
            generate_incident_report_file(incident)
            logger.info(f'Incident report PDF pre-generated for {incident.id}')
        except Exception as pe:
            logger.error(f'Failed to pre-generate PDF report for {incident.id}: {pe}')
        
        event2 = AgentEvent(
            incident_id=incident.id,
            agent='verification',
            status=AgentStatus.COMPLETED,
            message='All verification checks passed. INCIDENT RESOLVED.',
            data=checks,
        )
    else:
        incident.status = IncidentStatus.FAILED
        incident.agents['verification'] = AgentStatus.FAILED
        
        event2 = AgentEvent(
            incident_id=incident.id,
            agent='verification',
            status=AgentStatus.FAILED,
            message=f'Verification failed: {[k for k, v in checks.items() if not v]}',
            data=checks,
        )
    
    incident.events.append(event2)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event2.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    logger.info(f'Verification result: {"PASSED" if all_passed else "FAILED"}')
    return incident

import asyncio
import os
import httpx
from app.models import Incident, AgentEvent, AgentStatus, IncidentStatus, PlanStatus
from app.database import db
from app.websocket import manager
from app.config import DEMO_APP_DIR, DEMO_APP_URL
import logging

logger = logging.getLogger(__name__)

async def run_recovery(incident: Incident) -> Incident:
    """Recovery Agent: Apply the selected validated patch."""
    
    incident.status = IncidentStatus.RECOVERING
    incident.agents['recovery'] = AgentStatus.RUNNING
    
    event = AgentEvent(
        incident_id=incident.id,
        agent='recovery',
        status=AgentStatus.RUNNING,
        message='Applying validated recovery patch...',
    )
    incident.events.append(event)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    # Find selected plan
    selected_plan = None
    for plan in incident.recovery_plans:
        if plan.id == incident.selected_plan_id:
            selected_plan = plan
            break
    
    if not selected_plan:
        incident.agents['recovery'] = AgentStatus.FAILED
        fail_event = AgentEvent(
            incident_id=incident.id,
            agent='recovery',
            status=AgentStatus.FAILED,
            message='No selected plan found. Cannot proceed with recovery.',
        )
        incident.events.append(fail_event)
        db.save_incident(incident)
        await manager.broadcast('agent_event', fail_event.model_dump())
        return incident
    
    await asyncio.sleep(1.5)  # Simulate deployment time
    
    try:
        # Apply patch to the actual demo app source
        target_file = os.path.join(str(DEMO_APP_DIR), 'app', 'user_service.py')
        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(selected_plan.patch_diff)  # patch_diff contains the full patched source
        
        # Deactivate chaos
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(f'{DEMO_APP_URL}/chaos/deactivate')
        
        # Note: The FastAPI app with --reload will automatically pick up the file change
        # If not using --reload, we'd need to restart the process
        
        await asyncio.sleep(2)  # Wait for reload
        
        incident.agents['recovery'] = AgentStatus.COMPLETED
        event2 = AgentEvent(
            incident_id=incident.id,
            agent='recovery',
            status=AgentStatus.COMPLETED,
            message=f'Recovery Plan {selected_plan.plan_number:02d} applied successfully. Service reloading...',
            data={'plan_name': selected_plan.name, 'plan_number': selected_plan.plan_number},
        )
        incident.events.append(event2)
        
    except Exception as e:
        logger.error(f'Recovery failed: {e}')
        incident.agents['recovery'] = AgentStatus.FAILED
        event2 = AgentEvent(
            incident_id=incident.id,
            agent='recovery',
            status=AgentStatus.FAILED,
            message=f'Recovery failed: {str(e)}',
        )
        incident.events.append(event2)
    
    db.save_incident(incident)
    await manager.broadcast('agent_event', event2.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    return incident

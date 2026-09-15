import asyncio
from datetime import datetime
from app.models import Incident, AgentEvent, AgentStatus, IncidentStatus, Severity
from app.database import db
from app.websocket import manager
from app.services.memory import memory_service
import logging

logger = logging.getLogger(__name__)

async def run_detection(status_code: int, error_data: dict = None) -> Incident:
    """Detection Agent: Create an incident from detected failure."""
    
    # Create incident
    incident = Incident(
        service='User API',
        status=IncidentStatus.DETECTED,
        severity=Severity.CRITICAL,
        http_status=status_code,
        error_message=error_data.get('error', 'Unknown error') if error_data else 'Unknown error',
        stack_trace=error_data.get('traceback', '') if error_data else '',
    )
    
    # Update agent status
    incident.agents['detection'] = AgentStatus.RUNNING
    db.save_incident(incident)
    
    # Emit event
    event = AgentEvent(
        incident_id=incident.id,
        agent='detection',
        status=AgentStatus.RUNNING,
        message=f'Failure detected: HTTP {status_code} on {incident.service}',
    )
    incident.events.append(event)
    await manager.broadcast('agent_event', event.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    await asyncio.sleep(1)  # Simulate processing time for visual effect
    
    # Complete detection
    incident.agents['detection'] = AgentStatus.COMPLETED
    event2 = AgentEvent(
        incident_id=incident.id,
        agent='detection',
        status=AgentStatus.COMPLETED,
        message=f'Incident {incident.id} created. Service: {incident.service}, Status: HTTP {status_code}, Severity: CRITICAL',
        data={'incident_id': incident.id, 'service': incident.service, 'http_status': status_code},
    )
    incident.events.append(event2)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event2.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    logger.info(f'Incident {incident.id} created')
    return incident

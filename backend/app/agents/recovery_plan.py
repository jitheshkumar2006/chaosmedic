import asyncio
from app.models import Incident, AgentEvent, AgentStatus, IncidentStatus, RecoveryPlan, PlanStatus
from app.database import db
from app.websocket import manager
import logging

logger = logging.getLogger(__name__)

async def run_recovery_planning(incident: Incident) -> Incident:
    """Recovery Planning Agent: Create structured recovery plans from patches."""
    
    incident.status = IncidentStatus.PLANNING
    incident.agents['recovery_planning'] = AgentStatus.RUNNING
    
    event = AgentEvent(
        incident_id=incident.id,
        agent='recovery_planning',
        status=AgentStatus.RUNNING,
        message='Creating Recovery Plans...',
    )
    incident.events.append(event)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    await asyncio.sleep(1)
    
    # Get patches from patch_generation event
    patches = []
    source_code = ''
    for evt in incident.events:
        if evt.agent == 'patch_generation' and evt.data.get('patches'):
            patches = evt.data['patches']
            source_code = evt.data.get('source_code', '')
            break
    
    # Create recovery plans
    plans = []
    for i, patch in enumerate(patches):
        plan = RecoveryPlan(
            incident_id=incident.id,
            plan_number=i + 1,
            name=patch['name'],
            description=patch['description'],
            change_description=patch['change_description'],
            expected_result=patch['expected_result'],
            risk_level=patch['risk_level'],
            before_code=patch['before_code'],
            after_code=patch['after_code'],
            patch_diff=patch.get('full_source', ''),
        )
        plans.append(plan)
        
        plan_event = AgentEvent(
            incident_id=incident.id,
            agent='recovery_planning',
            status=AgentStatus.RUNNING,
            message=f'Recovery Plan {i+1:02d} created: {patch["name"]}',
        )
        incident.events.append(plan_event)
        await manager.broadcast('agent_event', plan_event.model_dump())
        await asyncio.sleep(0.5)
    
    incident.recovery_plans = plans
    incident.agents['recovery_planning'] = AgentStatus.COMPLETED
    
    event2 = AgentEvent(
        incident_id=incident.id,
        agent='recovery_planning',
        status=AgentStatus.COMPLETED,
        message=f'{len(plans)} Recovery Plans created',
    )
    incident.events.append(event2)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event2.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    return incident

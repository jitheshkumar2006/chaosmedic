import asyncio
from app.models import Incident, AgentEvent, AgentStatus, IncidentStatus, PlanStatus
from app.database import db
from app.websocket import manager
from app.services.sandbox import sandbox
import logging

logger = logging.getLogger(__name__)

async def run_validation(incident: Incident) -> Incident:
    """Validation Agent: Test each recovery plan in an isolated sandbox."""
    
    incident.status = IncidentStatus.VALIDATING
    incident.agents['validation'] = AgentStatus.RUNNING
    
    event = AgentEvent(
        incident_id=incident.id,
        agent='validation',
        status=AgentStatus.RUNNING,
        message='Starting sandbox validation for all Recovery Plans...',
    )
    incident.events.append(event)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    for plan in incident.recovery_plans:
        plan.status = PlanStatus.TESTING
        
        test_event = AgentEvent(
            incident_id=incident.id,
            agent='validation',
            status=AgentStatus.RUNNING,
            message=f'Testing Recovery Plan {plan.plan_number:02d}: {plan.name}...',
            data={'plan_id': plan.id, 'plan_number': plan.plan_number},
        )
        incident.events.append(test_event)
        db.save_incident(incident)
        await manager.broadcast('agent_event', test_event.model_dump())
        await manager.broadcast('incident_update', incident.model_dump())
        
        # Run sandbox validation
        result = await sandbox.validate_patch(
            patch_file='user_service.py',
            patch_content=plan.patch_diff,
            before_code=plan.before_code,
            after_code=plan.patch_diff,  # full source code
        )
        
        plan.test_total = result.test_total
        plan.test_passed = result.test_passed
        plan.test_failed = result.test_failed
        plan.health_check_passed = result.health_check_passed
        
        if result.success:
            plan.status = PlanStatus.APPROVED
            plan.why_selected = f'Recovery Plan {plan.plan_number:02d} passed all {plan.test_passed}/{plan.test_total} tests and health check verification.'
        else:
            plan.status = PlanStatus.REJECTED
            reasons = []
            if plan.test_failed > 0:
                reasons.append(f'{plan.test_failed} tests failed')
            if not plan.health_check_passed:
                reasons.append('health check failed')
            plan.why_rejected = f'Recovery Plan {plan.plan_number:02d} was rejected because: {";".join(reasons) if reasons else "validation did not pass"}.'
            plan.rejection_reason = plan.why_rejected
        
        status_str = 'APPROVED ✓' if result.success else 'REJECTED ✕'
        result_event = AgentEvent(
            incident_id=incident.id,
            agent='validation',
            status=AgentStatus.RUNNING,
            message=f'Recovery Plan {plan.plan_number:02d}: Tests {plan.test_passed}/{plan.test_total} — {status_str}',
            data={
                'plan_id': plan.id,
                'plan_number': plan.plan_number,
                'test_passed': plan.test_passed,
                'test_total': plan.test_total,
                'health_check': plan.health_check_passed,
                'status': plan.status.value,
            },
        )
        incident.events.append(result_event)
        db.save_incident(incident)
        await manager.broadcast('agent_event', result_event.model_dump())
        await manager.broadcast('incident_update', incident.model_dump())
    
    # Select best plan: highest test pass rate among approved plans, prefer lowest risk and smallest plan_number
    approved_plans = [p for p in incident.recovery_plans if p.status == PlanStatus.APPROVED]
    
    if approved_plans:
        # Sort by: test_passed DESC, risk_level ASC (low < medium < high), plan_number ASC
        risk_order = {'low': 0, 'medium': 1, 'high': 2}
        best = sorted(approved_plans, key=lambda p: (-p.test_passed, risk_order.get(p.risk_level, 1), p.plan_number))[0]
        best.status = PlanStatus.SELECTED
        best.is_recommended = True
        best.why_selected = f'Recovery Plan {best.plan_number:02d} passed all {best.test_passed}/{best.test_total} regression tests, has {best.risk_level.upper()} risk, and produces the smallest required code change.'
        incident.selected_plan_id = best.id
        
        select_event = AgentEvent(
            incident_id=incident.id,
            agent='validation',
            status=AgentStatus.COMPLETED,
            message=f'🏆 Recommended: Recovery Plan {best.plan_number:02d} — {best.name}',
            data={'selected_plan_id': best.id, 'plan_number': best.plan_number},
        )
        incident.events.append(select_event)
    else:
        select_event = AgentEvent(
            incident_id=incident.id,
            agent='validation',
            status=AgentStatus.FAILED,
            message='No Recovery Plan passed validation. Manual intervention required.',
        )
        incident.events.append(select_event)
    
    incident.agents['validation'] = AgentStatus.COMPLETED if approved_plans else AgentStatus.FAILED
    db.save_incident(incident)
    await manager.broadcast('agent_event', select_event.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    return incident

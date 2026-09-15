import asyncio
import logging
from datetime import datetime
from typing import TypedDict, Optional
from app.models import Incident, IncidentStatus, AgentStatus
from app.database import db
from app.websocket import manager
from app.agents.detection import run_detection
from app.agents.diagnosis import run_diagnosis
from app.agents.patch_gen import run_patch_generation
from app.agents.recovery_plan import run_recovery_planning
from app.agents.validation import run_validation
from app.agents.recovery import run_recovery
from app.agents.verification import run_verification
from app.services.memory import memory_service

logger = logging.getLogger(__name__)

# Track if recovery is already in progress
_recovery_in_progress = False
_recovery_lock = asyncio.Lock()

async def handle_failure_detected(status_code: int, error_data: dict = None):
    """Entry point called by the health monitor when a failure is detected."""
    global _recovery_in_progress
    
    async with _recovery_lock:
        if _recovery_in_progress:
            logger.info('Recovery already in progress, skipping')
            return
        _recovery_in_progress = True
    
    try:
        await run_recovery_pipeline(status_code, error_data)
    except Exception as e:
        logger.error(f'Recovery pipeline failed: {e}', exc_info=True)
    finally:
        _recovery_in_progress = False

async def run_recovery_pipeline(status_code: int, error_data: dict = None):
    """Run the complete recovery pipeline."""
    
    logger.info('='*60)
    logger.info('CHAOSMEDIC RECOVERY PIPELINE STARTED')
    logger.info('='*60)
    
    # STEP 1: Detection
    incident = await run_detection(status_code, error_data)
    
    # Check failure memory for similar incidents
    if error_data:
        error_type = 'TypeError'  # Will be refined by diagnosis
        similar = memory_service.find_similar(error_type, 'user_service.py', 42)
        if similar:
            incident.similar_incident_id = similar.incident_id
            from app.models import AgentEvent, AgentStatus
            memory_event = AgentEvent(
                incident_id=incident.id,
                agent='memory',
                status=AgentStatus.COMPLETED,
                message=f'Similar previous incident found: {similar.incident_id}. Previous solution: {similar.selected_plan_name}',
                data={'similar_incident_id': similar.incident_id, 'previous_solution': similar.selected_plan_name},
            )
            incident.events.append(memory_event)
            db.save_incident(incident)
            await manager.broadcast('agent_event', memory_event.model_dump())
            await manager.broadcast('incident_update', incident.model_dump())
    
    # STEP 2: Diagnosis
    incident = await run_diagnosis(incident)
    
    # STEP 3: Patch Generation
    incident = await run_patch_generation(incident)
    
    # STEP 4: Recovery Planning
    incident = await run_recovery_planning(incident)
    
    # STEP 5: Validation
    incident = await run_validation(incident)
    
    # Check if any plan was selected
    if not incident.selected_plan_id:
        incident.status = IncidentStatus.FAILED
        db.save_incident(incident)
        await manager.broadcast('incident_update', incident.model_dump())
        logger.error('No recovery plan was approved. Manual intervention required.')
        return
    
    # STEP 6: Recovery
    incident = await run_recovery(incident)
    
    # STEP 7: Verification
    incident = await run_verification(incident)
    
    logger.info('='*60)
    logger.info(f'RECOVERY PIPELINE COMPLETE — Status: {incident.status.value}')
    logger.info('='*60)

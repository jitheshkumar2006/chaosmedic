import asyncio
import httpx
from datetime import datetime
from app.models import Incident, AgentEvent, AgentStatus, IncidentStatus, RootCause
from app.database import db
from app.websocket import manager
from app.services.llm import llm_service
from app.config import DEMO_APP_URL
import logging
import re

logger = logging.getLogger(__name__)

async def run_diagnosis(incident: Incident) -> Incident:
    """Diagnosis Agent: Analyze stack trace and identify root cause."""
    
    incident.status = IncidentStatus.DIAGNOSING
    incident.agents['diagnosis'] = AgentStatus.RUNNING
    
    event = AgentEvent(
        incident_id=incident.id,
        agent='diagnosis',
        status=AgentStatus.RUNNING,
        message='Analyzing stack trace and source code...',
    )
    incident.events.append(event)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    await asyncio.sleep(1.5)  # Simulate analysis time
    
    # Parse stack trace to find file and line
    stack_trace = incident.stack_trace
    error_type = 'TypeError'
    error_message = incident.error_message
    file_name = 'user_service.py'
    line_number = 42
    
    # Try to extract from stack trace
    if stack_trace:
        # Look for the last file reference in traceback
        file_matches = re.findall(r'File ".*?([\w_]+\.py)",\s*line\s*(\d+)', stack_trace)
        if file_matches:
            file_name, line_str = file_matches[-1]
            line_number = int(line_str)
        
        # Extract error type
        error_lines = stack_trace.strip().split('\n')
        if error_lines:
            last_line = error_lines[-1]
            if ':' in last_line:
                error_type = last_line.split(':')[0].strip()
                error_message = last_line
    
    # Get source code
    relevant_code = ''
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f'{DEMO_APP_URL}/source/user_service.py')
            if resp.status_code == 200:
                relevant_code = resp.text
    except Exception as e:
        logger.warning(f'Could not fetch source code via HTTP: {e}')
    
    if not relevant_code:
        import os
        from app.config import DEMO_APP_DIR
        source_path = os.path.join(str(DEMO_APP_DIR), 'app', 'user_service.py')
        if os.path.exists(source_path):
            with open(source_path, 'r', encoding='utf-8') as f:
                relevant_code = f.read()
    
    # Use LLM or DEMO_MODE for root cause analysis
    demo_fallback = {
        'error_type': error_type,
        'error_message': error_message,
        'file': file_name,
        'line': line_number,
        'probable_cause': 'A null value is accessed without validation. The function attempts to access properties of a user object that is None, causing a TypeError. The code does not check whether the user object exists before accessing its attributes.',
        'confidence': 0.92,
    }
    
    if not llm_service.demo_mode and relevant_code:
        prompt = f"""Analyze this Python error and identify the root cause.

Stack Trace:
{stack_trace}

Source Code:
{relevant_code}

Provide a concise root cause analysis. What is the probable root cause?
Focus on: what variable is null, why it's null, and what check is missing."""
        llm_result = await llm_service.analyze(prompt, demo_fallback)
        if isinstance(llm_result, str):
            demo_fallback['probable_cause'] = llm_result
    
    # Create root cause
    root_cause = RootCause(
        error_type=demo_fallback['error_type'],
        error_message=demo_fallback['error_message'],
        file=demo_fallback['file'],
        line=demo_fallback['line'],
        probable_cause=demo_fallback['probable_cause'],
        confidence=demo_fallback['confidence'],
        stack_trace=stack_trace,
        relevant_code=relevant_code,
    )
    
    incident.root_cause = root_cause
    incident.agents['diagnosis'] = AgentStatus.COMPLETED
    
    event2 = AgentEvent(
        incident_id=incident.id,
        agent='diagnosis',
        status=AgentStatus.COMPLETED,
        message=f'Probable root cause identified: {root_cause.probable_cause[:100]}',
        data={
            'file': root_cause.file,
            'line': root_cause.line,
            'error_type': root_cause.error_type,
            'confidence': root_cause.confidence,
        },
    )
    incident.events.append(event2)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event2.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    logger.info(f'Diagnosis complete: {root_cause.file}:{root_cause.line}')
    return incident

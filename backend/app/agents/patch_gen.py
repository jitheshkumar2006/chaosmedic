import asyncio
import httpx
from app.models import Incident, AgentEvent, AgentStatus, IncidentStatus
from app.database import db
from app.websocket import manager
from app.services.llm import llm_service
from app.config import DEMO_APP_URL
import logging

logger = logging.getLogger(__name__)

def _get_demo_patches(source_code: str) -> list:
    """Generate deterministic patches for DEMO_MODE matching the demo failure."""
    
    # ----------------------------------------------------
    # Patch 1: Add Null Validation (BEST - will pass 18/18 tests)
    # ----------------------------------------------------
    target_line = "    formatted_name = user['name'].upper()"
    patch1_before = target_line
    patch1_after = """    if user is None:
        return {
            "id": 0,
            "name": "UNKNOWN",
            "email": "unknown@example.com",
            "role": "guest",
            "active": False
        }
    formatted_name = user['name'].upper()"""
    
    patch1_full = source_code.replace(target_line, patch1_after)
    
    # ----------------------------------------------------
    # Patch 2: Fallback Response Handling (Fails 7 tests: 11/18 PASS)
    # ----------------------------------------------------
    target_block2 = """    formatted_name = user['name'].upper()
    
    return {
        "id": user["id"],
        "name": formatted_name,
        "email": user["email"],
        "role": user["role"],
        "active": user.get("active", True)
    }"""
    
    patch2_before = """    formatted_name = user['name'].upper()
    return { "id": user["id"], "name": formatted_name, ... }"""
    
    patch2_after = """    try:
        formatted_name = user['name'].upper() if user else "UNKNOWN"
        return {
            "name": formatted_name
        }
    except Exception:
        return {}"""
    
    patch2_full = source_code.replace(target_block2, patch2_after)
    
    # ----------------------------------------------------
    # Patch 3: Input Validation (Drops inactive users: 15/18 PASS)
    # ----------------------------------------------------
    target_block3 = """    formatted_users = []
    for u in users:
        formatted_users.append(format_user(u))"""
        
    patch3_before = """    formatted_users = []
    for u in users:
        formatted_users.append(format_user(u))"""
        
    patch3_after = """    formatted_users = []
    for u in users:
        if u is not None and u.get("active", False) and u.get("id", 0) != 4:
            formatted_users.append(format_user(u))"""
            
    patch3_full = source_code.replace(target_block3, patch3_after)
    
    return [
        {
            'name': 'Add Null Validation',
            'description': 'Add a null check guard clause in format_user() to safely handle None user objects by returning a safe default record.',
            'change_description': 'Added null validation guard clause in format_user() function',
            'expected_result': 'Prevents TypeError by returning safe default values when user is None',
            'risk_level': 'low',
            'before_code': patch1_before,
            'after_code': patch1_after,
            'full_source': patch1_full,
        },
        {
            'name': 'Fallback Response Handling',
            'description': 'Wrap user data access in try/except to catch TypeError and return minimal fallback response data.',
            'change_description': 'Added try/except error handling with minimal schema',
            'expected_result': 'Catches TypeError at runtime and returns fallback user data',
            'risk_level': 'medium',
            'before_code': patch2_before,
            'after_code': patch2_after,
            'full_source': patch2_full,
        },
        {
            'name': 'Input Validation',
            'description': 'Filter out None and inactive user entries from the users list before processing in get_users().',
            'change_description': 'Added conditional filtering in the get_users() loop',
            'expected_result': 'Skips null user entries instead of processing them',
            'risk_level': 'medium',
            'before_code': patch3_before,
            'after_code': patch3_after,
            'full_source': patch3_full,
        },
    ]

async def run_patch_generation(incident: Incident) -> Incident:
    """Patch Generation Agent: Generate candidate code repairs."""
    
    incident.status = IncidentStatus.GENERATING
    incident.agents['patch_generation'] = AgentStatus.RUNNING
    
    event = AgentEvent(
        incident_id=incident.id,
        agent='patch_generation',
        status=AgentStatus.RUNNING,
        message='Generating candidate code repairs...',
    )
    incident.events.append(event)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    await asyncio.sleep(2)  # Simulate generation time
    
    # Get current source code directly from source file or demo app
    source_code = ''
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f'{DEMO_APP_URL}/source/user_service.py')
            if resp.status_code == 200:
                source_code = resp.text
    except Exception as e:
        logger.warning(f'Could not fetch source over HTTP: {e}')
    
    if not source_code:
        # Read from disk directly as fallback
        import os
        from app.config import DEMO_APP_DIR
        source_path = os.path.join(str(DEMO_APP_DIR), 'app', 'user_service.py')
        if os.path.exists(source_path):
            with open(source_path, 'r', encoding='utf-8') as f:
                source_code = f.read()
    
    # Generate patches
    patches = _get_demo_patches(source_code)
    
    incident.agents['patch_generation'] = AgentStatus.COMPLETED
    
    event2 = AgentEvent(
        incident_id=incident.id,
        agent='patch_generation',
        status=AgentStatus.COMPLETED,
        message=f'Generated {len(patches)} candidate repairs',
        data={'patches': patches, 'source_code': source_code},
    )
    incident.events.append(event2)
    db.save_incident(incident)
    await manager.broadcast('agent_event', event2.model_dump())
    await manager.broadcast('incident_update', incident.model_dump())
    
    logger.info(f'Generated {len(patches)} patches')
    return incident

import asyncio
from fastapi import APIRouter, BackgroundTasks
import httpx
from app.config import DEMO_APP_URL, DEMO_APP_DIR
from app.database import db
from app.services.monitor import monitor
import shutil
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Store original source for reset
ORIGINAL_BUGGY_SOURCE = """import os
import copy

USERS_DATA = [
    {"id": 1, "name": "Alice Smith", "email": "alice@example.com", "role": "admin", "active": True},
    {"id": 2, "name": "Bob Jones", "email": "bob@example.com", "role": "user", "active": True},
    {"id": 3, "name": "Charlie Brown", "email": "charlie@example.com", "role": "user", "active": False},
    {"id": 4, "name": "Diana Prince", "email": "diana@example.com", "role": "manager", "active": True},
    {"id": 5, "name": "Evan Wright", "email": "evan@example.com", "role": "user", "active": True},
]

CHAOS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.chaos_active')

def is_chaos_active() -> bool:
    \"\"\"Check if chaos mode is active.\"\"\"
    return os.path.exists(CHAOS_FILE)

def activate_chaos():
    \"\"\"Activate chaos mode by creating the chaos file.\"\"\"
    with open(CHAOS_FILE, 'w') as f:
        f.write('chaos=true')

def deactivate_chaos():
    \"\"\"Deactivate chaos mode by removing the chaos file.\"\"\"
    if os.path.exists(CHAOS_FILE):
        os.remove(CHAOS_FILE)

def format_user(user):
    \"\"\"
    Format user data for API response.
    Expects a user dictionary.
    \"\"\"
    # Padding line 33
    # Padding line 34
    # Padding line 35
    # Padding line 36
    # Padding line 37
    # Padding line 38
    # Padding line 39
    # Padding line 40
    # Padding line 41
    formatted_name = user['name'].upper()
    
    return {
        "id": user["id"],
        "name": formatted_name,
        "email": user["email"],
        "role": user["role"],
        "active": user.get("active", True)
    }

def get_users():
    \"\"\"Get all users, potentially with chaos applied.\"\"\"
    users = copy.deepcopy(USERS_DATA)
    
    if is_chaos_active():
        # Insert a None entry to cause a failure later
        users[2] = None
        
    formatted_users = []
    for u in users:
        formatted_users.append(format_user(u))
        
    return formatted_users

def get_user_by_id(user_id: int):
    \"\"\"Get a specific user by ID.\"\"\"
    for u in USERS_DATA:
        if u["id"] == user_id:
            return format_user(u)
    return None

def get_source_code():
    \"\"\"Return the source code of this file.\"\"\"
    with open(__file__, "r", encoding="utf-8") as f:
        return f.read()
"""

_original_source = ORIGINAL_BUGGY_SOURCE

@router.post('/api/demo/trigger-failure')
async def trigger_failure():
    """Activate the chaos bug in the demo app."""
    try:
        source_file = os.path.join(str(DEMO_APP_DIR), 'app', 'user_service.py')
        if os.path.exists(source_file):
            with open(source_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'if user is None:' in content or 'UNKNOWN' in content:
                logger.info('Restoring original buggy source before triggering incident')
                with open(source_file, 'w', encoding='utf-8') as f:
                    f.write(ORIGINAL_BUGGY_SOURCE)
                await asyncio.sleep(1.2)

        from app.agents import orchestrator
        orchestrator._recovery_in_progress = False
        monitor.demo_app_healthy = True

        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(f'{DEMO_APP_URL}/chaos/activate')
        
        # Small delay to ensure chaos file is written and demo-app sees it
        await asyncio.sleep(0.5)
        
        # Force immediate health check so the monitor detects the 500 now
        # instead of waiting for the next 3-second poll cycle
        try:
            await monitor._check_health()
            logger.info('Forced health check after chaos activation')
        except Exception as check_err:
            logger.warning(f'Forced health check error (non-fatal): {check_err}')
        
        return {'status': 'chaos_activated', 'response': resp.json()}
    except Exception as e:
        logger.error(f'Failed to trigger failure: {e}')
        return {'status': 'error', 'message': str(e)}

@router.post('/api/demo/reset')
async def reset_demo():
    """Reset the demo to healthy state."""
    global _original_source
    try:
        # Deactivate chaos
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(f'{DEMO_APP_URL}/chaos/deactivate')
        
        # Restore original source file
        if _original_source:
            source_file = os.path.join(str(DEMO_APP_DIR), 'app', 'user_service.py')
            with open(source_file, 'w', encoding='utf-8') as f:
                f.write(_original_source)
            # Wait for demo-app --reload to detect file change and restart
            await asyncio.sleep(1.5)
        
        # Clear active incidents
        db.clear()
        monitor.demo_app_healthy = True
        monitor.last_error = None
        
        return {'status': 'reset_complete'}
    except Exception as e:
        logger.error(f'Failed to reset: {e}')
        return {'status': 'error', 'message': str(e)}

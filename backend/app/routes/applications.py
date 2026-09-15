import time
from urllib.parse import urlparse
from fastapi import APIRouter, HTTPException
import httpx
from app.models import ApplicationConnectRequest, ConnectedApplication, ApplicationAccessStatus
from app.database import db
from app.config import DEMO_APP_URL
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def _is_demo_application(url: str) -> bool:
    """Check if URL points to the authorized local demo application."""
    normalized_input = url.rstrip('/')
    normalized_demo = DEMO_APP_URL.rstrip('/')
    
    # Check matching demo app URL or localhost/127.0.0.1 on port 8001
    parsed_input = urlparse(normalized_input)
    parsed_demo = urlparse(normalized_demo)
    
    if parsed_input.port == 8001 and parsed_input.hostname in ('localhost', '127.0.0.1', 'demo-app'):
        return True
    return normalized_input == normalized_demo

@router.post('/api/applications/connect')
async def connect_application(req: ApplicationConnectRequest):
    """Validate, probe, and register an application URL."""
    raw_url = req.url.strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail='Please enter an application URL.')
    
    # Ensure scheme
    if not raw_url.startswith(('http://', 'https://')):
        raw_url = 'http://' + raw_url
    
    parsed = urlparse(raw_url)
    if not parsed.hostname or parsed.scheme not in ('http', 'https'):
        raise HTTPException(status_code=400, detail='Please enter a valid application URL (e.g. http://localhost:8001 or https://app.example.com).')
    
    # Safe URL check: prevent arbitrary schemes or file protocols
    url = f"{parsed.scheme}://{parsed.netloc}"
    if parsed.path and parsed.path != '/':
        url += parsed.path
    
    is_demo = _is_demo_application(url)
    app_name = 'Demo Application (User API)' if is_demo else (parsed.hostname or 'Application')
    
    # Real HTTP probe
    start_time = time.perf_counter()
    status_code = None
    health_status = 'unhealthy'
    
    try:
        async with httpx.AsyncClient(timeout=3.0, follow_redirects=True) as client:
            # First attempt health endpoint if demo app or if /health exists
            probe_url = f"{url.rstrip('/')}/health" if is_demo else url
            
            try:
                resp = await client.get(probe_url)
                status_code = resp.status_code
                if resp.status_code in (200, 201, 204):
                    health_status = 'healthy'
                elif resp.status_code < 500:
                    health_status = 'responding'
                else:
                    health_status = 'degraded'
            except httpx.HTTPError:
                # If /health failed on external URL, try base URL
                if probe_url != url:
                    resp = await client.get(url)
                    status_code = resp.status_code
                    health_status = 'healthy' if resp.status_code < 400 else 'responding'
                else:
                    raise
                    
    except httpx.ConnectTimeout:
        raise HTTPException(status_code=504, detail=f'Application at {url} could not be reached: Connection timed out.')
    except httpx.ConnectError:
        raise HTTPException(status_code=502, detail=f'Application at {url} could not be reached: Connection refused or host not found.')
    except Exception as e:
        logger.warning(f'Probe error for {url}: {e}')
        raise HTTPException(status_code=502, detail=f'Application could not be reached: {str(e)}')
    
    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 1)
    
    # Build access status matrix
    access_status = ApplicationAccessStatus(
        runtime=True,
        monitoring=True,
        source_code=is_demo,
        deployment=is_demo
    )
    
    connected_app = ConnectedApplication(
        connected=True,
        url=url,
        name=app_name,
        status_code=status_code or 200,
        response_time_ms=elapsed_ms,
        health=health_status,
        monitoring_available=True,
        code_access_required_for_repair=not is_demo,
        is_demo_app=is_demo,
        access=access_status
    )
    
    db.set_connected_application(connected_app)
    logger.info(f'Connected application: {connected_app.name} ({url}) - status: {status_code}, time: {elapsed_ms}ms')
    
    return connected_app.model_dump()

@router.post('/api/applications/disconnect')
async def disconnect_application():
    """Disconnect current application."""
    db.set_connected_application(None)
    return {'status': 'disconnected'}

@router.get('/api/applications/status')
async def get_application_status():
    """Return currently connected application status."""
    app = db.get_connected_application()
    if not app:
        return {'connected': False}
    return app.model_dump()

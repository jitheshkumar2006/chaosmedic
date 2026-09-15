from fastapi import APIRouter
from app.models import SystemHealth
from app.services.monitor import monitor
from app.database import db
from app.config import DEMO_MODE

router = APIRouter()

@router.get('/api/health')
async def get_health():
    active = db.get_active_incident()
    return SystemHealth(
        status='incident_detected' if active else ('recovering' if any((i.status.value if hasattr(i.status, 'value') else i.status) == 'recovering' for i in db.incidents.values()) else 'healthy'),
        demo_app_healthy=monitor.demo_app_healthy,
        active_incidents=1 if active else 0,
        demo_mode=DEMO_MODE,
    ).model_dump()

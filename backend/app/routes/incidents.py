from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.database import db
from app.models import Incident
from typing import List

router = APIRouter()

@router.get('/api/incidents')
async def get_incidents():
    incidents = db.get_all_incidents()
    return [i.model_dump() for i in incidents]

@router.get('/api/incidents/{incident_id}')
async def get_incident(incident_id: str):
    incident = db.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail='Incident not found')
    return incident.model_dump()

@router.get('/api/incidents/{incident_id}/events')
async def get_incident_events(incident_id: str):
    incident = db.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail='Incident not found')
    return [e.model_dump() for e in incident.events]

@router.get('/api/incidents/active/current')
async def get_active_incident():
    incident = db.get_active_incident()
    if not incident:
        return None
    return incident.model_dump()

@router.get('/api/memory')
async def get_failure_memories():
    return [m.model_dump() for m in db.failure_memories]

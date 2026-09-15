from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from app.database import db
from app.models import IncidentStatus
from app.services.pdf_report import generate_incident_report_file, get_report_path
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get('/api/incidents/{incident_id}/report')
async def get_incident_report(
    incident_id: str,
    disposition: str = Query('attachment', pattern='^(attachment|inline)$')
):
    incident = db.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f'Incident {incident_id} not found')
    
    if incident.status != IncidentStatus.RESOLVED:
        raise HTTPException(
            status_code=409,
            detail=f'Incident {incident_id} has not completed recovery (current status: {incident.status.value})'
        )
    
    try:
        report_file = generate_incident_report_file(incident)
    except Exception as e:
        logger.error(f'Failed to generate PDF for incident {incident_id}: {e}', exc_info=True)
        raise HTTPException(status_code=500, detail=f'Failed to generate report PDF: {str(e)}')
        
    if not report_file.exists() or report_file.stat().st_size == 0:
        raise HTTPException(status_code=500, detail='Generated report file is missing or empty')
        
    filename = f'ChaosMedic_Incident_{incident.id}.pdf'
    return FileResponse(
        path=str(report_file),
        media_type='application/pdf',
        filename=filename,
        content_disposition_type=disposition
    )

@router.get('/api/incidents/{incident_id}/report/status')
async def get_incident_report_status(incident_id: str):
    incident = db.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f'Incident {incident_id} not found')
        
    report_file = get_report_path(incident_id)
    exists = report_file.exists() and report_file.stat().st_size > 0
    size = report_file.stat().st_size if exists else 0
    
    return {
        'incident_id': incident_id,
        'available': exists,
        'filename': report_file.name if exists else f'ChaosMedic_Incident_{incident.id}.pdf',
        'size_bytes': size,
        'incident_status': incident.status.value,
        'can_generate': incident.status == IncidentStatus.RESOLVED,
    }


import pytest
import os
from pathlib import Path
from httpx import AsyncClient, ASGITransport
from datetime import datetime
from app.main import app
from app.database import db
from app.models import Incident, IncidentStatus, Severity, RootCause, RecoveryPlan, PlanStatus, AgentEvent, AgentStatus
from app.config import REPORTS_DIR

@pytest.fixture(autouse=True)
def clean_db():
    db.incidents.clear()
    yield
    db.incidents.clear()

def create_sample_resolved_incident(incident_id="CM-TEST"):
    incident = Incident(
        id=incident_id,
        service="User API",
        status=IncidentStatus.RESOLVED,
        severity=Severity.CRITICAL,
        http_status=500,
        error_message="TypeError: 'NoneType' object is not subscriptable",
        stack_trace='File "user_service.py", line 42, in format_user\n    formatted_name = user[\'name\'].upper()\nTypeError: \'NoneType\' object is not subscriptable',
        root_cause=RootCause(
            error_type="TypeError",
            error_message="TypeError: 'NoneType' object is not subscriptable",
            file="user_service.py",
            line=42,
            probable_cause="A null value is accessed without validation. The function attempts to access user['name'] when user is None.",
            confidence=0.95,
            stack_trace='File "user_service.py", line 42, in format_user\n    formatted_name = user[\'name\'].upper()\nTypeError: \'NoneType\' object is not subscriptable',
            relevant_code="def format_user(user):\n    formatted_name = user['name'].upper()"
        ),
        recovery_plans=[
            RecoveryPlan(
                incident_id=incident_id,
                plan_number=1,
                name="Add null validation check",
                description="Check if user is None before accessing properties and return fallback user dictionary.",
                change_description="Added `if user is None: return default_dict` guard clause.",
                expected_result="18/18 tests pass with zero regressions",
                risk_level="low",
                status=PlanStatus.SELECTED,
                before_code="def format_user(user):\n    formatted_name = user['name'].upper()",
                after_code="def format_user(user):\n    if user is None:\n        return {'id': 0, 'name': 'Unknown'}\n    formatted_name = user['name'].upper()",
                patch_diff="--- a/user_service.py\n+++ b/user_service.py\n@@ -42,1 +42,3 @@\n+    if user is None:\n+        return {'id': 0, 'name': 'Unknown'}",
                test_total=18,
                test_passed=18,
                test_failed=0,
                health_check_passed=True,
                is_recommended=True,
                why_selected="All 18 regression tests passed with zero side effects."
            ),
            RecoveryPlan(
                incident_id=incident_id,
                plan_number=2,
                name="Try/Except Fallback",
                description="Wrap in exception handler.",
                change_description="Wrap user processing in try/except block.",
                expected_result="Some tests fail due to unexpected empty values.",
                risk_level="medium",
                status=PlanStatus.REJECTED,
                test_total=18,
                test_passed=13,
                test_failed=5,
                health_check_passed=False,
                why_rejected="5 tests failed due to silent error swallowing."
            )
        ],
        selected_plan_id="plan-1",
        events=[
            AgentEvent(
                incident_id=incident_id,
                agent="detection",
                status=AgentStatus.COMPLETED,
                message="HTTP 500 failure detected on /users endpoint."
            ),
            AgentEvent(
                incident_id=incident_id,
                agent="verification",
                status=AgentStatus.COMPLETED,
                message="All verification checks passed. HTTP 200 OK confirmed."
            )
        ],
        created_at=datetime.utcnow(),
        resolved_at=datetime.utcnow(),
        recovery_duration=28.4
    )
    return incident

@pytest.mark.anyio
async def test_pdf_report_download_endpoint():
    incident = create_sample_resolved_incident("CM-TEST1")
    db.save_incident(incident)
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/api/incidents/{incident.id}/report")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "attachment" in response.headers["content-disposition"]
        assert f"ChaosMedic_Incident_{incident.id}.pdf" in response.headers["content-disposition"]
        
        # Verify valid PDF binary magic bytes
        assert response.content[:4] == b"%PDF"
        assert len(response.content) > 2000
        
        # Verify file persisted on disk
        saved_file = REPORTS_DIR / f"ChaosMedic_Incident_{incident.id}.pdf"
        assert saved_file.exists()
        assert saved_file.stat().st_size == len(response.content)

@pytest.mark.anyio
async def test_pdf_report_inline_view():
    incident = create_sample_resolved_incident("CM-TEST2")
    db.save_incident(incident)
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/api/incidents/{incident.id}/report?disposition=inline")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "inline" in response.headers["content-disposition"]
        assert response.content[:4] == b"%PDF"

@pytest.mark.anyio
async def test_pdf_report_status():
    incident = create_sample_resolved_incident("CM-TEST3")
    db.save_incident(incident)
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Before generating
        status_resp = await client.get(f"/api/incidents/{incident.id}/report/status")
        assert status_resp.status_code == 200
        data = status_resp.json()
        assert data["incident_id"] == incident.id
        assert data["incident_status"] == "resolved"
        assert data["can_generate"] is True
        
        # Trigger download to generate file
        get_resp = await client.get(f"/api/incidents/{incident.id}/report")
        assert get_resp.status_code == 200
        
        # After generating
        status_resp2 = await client.get(f"/api/incidents/{incident.id}/report/status")
        assert status_resp2.status_code == 200
        data2 = status_resp2.json()
        assert data2["available"] is True
        assert data2["size_bytes"] > 2000

@pytest.mark.anyio
async def test_pdf_report_unresolved_incident_returns_409():
    incident = create_sample_resolved_incident("CM-TEST4")
    incident.status = IncidentStatus.DIAGNOSING
    db.save_incident(incident)
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/api/incidents/{incident.id}/report")
        assert response.status_code == 409
        assert "has not completed recovery" in response.json()["detail"]

@pytest.mark.anyio
async def test_pdf_report_nonexistent_returns_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/incidents/CM-NONEXISTENT/report")
        assert response.status_code == 404

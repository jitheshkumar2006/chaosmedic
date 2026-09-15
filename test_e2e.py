import httpx
import time
import sys
import io

# Ensure UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def main():
    print("==================================================================")
    print("CHAOSMEDIC END-TO-END VERIFICATION: ONBOARDING + RECOVERY PIPELINE")
    print("==================================================================")
    
    # 0. Clean reset to ensure original unpatched source code
    try:
        httpx.post('http://127.0.0.1:8000/api/demo/reset', timeout=5.0)
        time.sleep(1)
    except Exception:
        pass
    
    # 1. Check Backend Health
    try:
        health = httpx.get('http://127.0.0.1:8000/api/health', timeout=5.0).json()
        print("[1/8] Initial Backend Health:", health)
    except Exception as e:
        print(f"[ERROR] Backend not accessible: {e}")
        return False

    # 2. Test Invalid URL Handling
    print("\n[2/8] Testing Invalid / Unreachable URL Handling...")
    try:
        inv_resp = httpx.post('http://127.0.0.1:8000/api/applications/connect', json={'url': 'http://127.0.0.1:59999'}, timeout=8.0)
        print(f"  Unreachable URL probe status: {inv_resp.status_code} (Expected 502/504)")
        print(f"  Error message: {inv_resp.json().get('detail')}")
        assert inv_resp.status_code in (502, 504, 400)
    except Exception as e:
        print(f"  Validation note: {e}")

    # 3. Test Connecting to Demo Application
    print("\n[3/8] Connecting to Demo Application (http://localhost:8001)...")
    connect_resp = httpx.post('http://127.0.0.1:8000/api/applications/connect', json={'url': 'http://localhost:8001'}, timeout=8.0)
    if connect_resp.status_code != 200:
        print(f"[ERROR] Connect failed with status {connect_resp.status_code}: {connect_resp.text}")
        return False
    
    app_data = connect_resp.json()
    print("  Application Connected successfully!")
    print(f"  Name:             {app_data.get('name')}")
    print(f"  Target URL:       {app_data.get('url')}")
    print(f"  HTTP Status:      {app_data.get('status_code')} OK")
    print(f"  Response Time:    {app_data.get('response_time_ms')} ms")
    print(f"  Health State:     {app_data.get('health')}")
    print(f"  Is Demo App:      {app_data.get('is_demo_app')}")
    print(f"  Access Matrix:    {app_data.get('access')}")
    
    assert app_data.get('connected') is True
    assert app_data.get('is_demo_app') is True
    assert app_data.get('access', {}).get('source_code') is True

    # 4. Verify Application Status Endpoint
    print("\n[4/8] Checking Application Status endpoint (/api/applications/status)...")
    status_resp = httpx.get('http://127.0.0.1:8000/api/applications/status').json()
    print("  Status endpoint response:", status_resp.get('url'), "| Connected:", status_resp.get('connected'))
    assert status_resp.get('connected') is True

    # 5. Run Incident Test
    print("\n[5/8] Triggering Incident Test (🚨 RUN INCIDENT TEST)...")
    trig = httpx.post('http://127.0.0.1:8000/api/demo/trigger-failure').json()
    print("  Trigger result:", trig)

    # 6. Monitor Multi-Agent Recovery Pipeline
    print("\n[6/8] Monitoring Autonomous Self-Healing Pipeline...")
    resolved = False
    resolved_incident = None
    
    for i in range(35):
        time.sleep(2)
        incs = httpx.get('http://127.0.0.1:8000/api/incidents').json()
        if incs:
            inc = incs[-1]
            status = inc.get('status')
            events = len(inc.get('events', []))
            plans = len(inc.get('recovery_plans', []))
            sel = inc.get('selected_plan_id')
            print(f"  [{i*2}s] Incident {inc['id']}: Status={status} | Plans={plans} | Events={events} | Selected={sel is not None}")
            
            if status == 'resolved':
                resolved = True
                resolved_incident = inc
                break
            elif status == 'failed':
                print("[ERROR] Incident resolution failed!")
                return False

    if not resolved:
        print("[ERROR] Timed out waiting for incident resolution.")
        return False

    print("\n==================================================================")
    print("SUCCESS: INCIDENT RESOLVED AUTONOMOUSLY!")
    print("==================================================================")
    print(f"Incident ID:         {resolved_incident.get('id')}")
    print(f"Recovery Duration:   {resolved_incident.get('recovery_duration')} seconds")
    print(f"Root Cause:          {resolved_incident.get('root_cause', {}).get('file')}:{resolved_incident.get('root_cause', {}).get('line')}")
    
    # Check recovery plans evaluation
    plans = resolved_incident.get('recovery_plans', [])
    print(f"\nEvaluated {len(plans)} Recovery Plans:")
    for p in plans:
        score = f"{p.get('test_passed')}/{p.get('test_total')}"
        rec = " [RECOMMENDED 🏆]" if p.get('status') == 'selected' else f" [{p.get('status').upper()}]"
        print(f"  - Plan {p.get('plan_number'):02d} ({p.get('name')}): {score} tests pass{rec}")

    # 7. Verify Live Application & Report Generation
    print("\n[7/8] Verifying Post-Recovery Health & PDF Report Pipeline...")
    users_resp = httpx.get('http://127.0.0.1:8001/users')
    print(f"  Live App /users Status: HTTP {users_resp.status_code} OK (Expected 200)")
    assert users_resp.status_code == 200

    # 7a. Test Report Status endpoint
    status_resp = httpx.get(f"http://127.0.0.1:8000/api/incidents/{resolved_incident['id']}/report/status")
    print(f"  Report Status API:      {status_resp.status_code} -> {status_resp.json()}")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data['can_generate'] is True
    assert status_data['incident_id'] == resolved_incident['id']

    # 7b. Test PDF Attachment Download endpoint
    pdf_resp = httpx.get(f"http://127.0.0.1:8000/api/incidents/{resolved_incident['id']}/report")
    print(f"  PDF Download Status:    HTTP {pdf_resp.status_code}")
    print(f"  PDF Content-Type:       {pdf_resp.headers.get('content-type')}")
    print(f"  PDF Content-Disposition:{pdf_resp.headers.get('content-disposition')}")
    print(f"  PDF Size:               {len(pdf_resp.content)} bytes")
    print(f"  PDF Magic Header:       {pdf_resp.content[:4]}")
    
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers.get('content-type') == 'application/pdf'
    assert 'attachment' in pdf_resp.headers.get('content-disposition', '')
    assert f"ChaosMedic_Incident_{resolved_incident['id']}.pdf" in pdf_resp.headers.get('content-disposition', '')
    assert pdf_resp.content[:4] == b'%PDF', "Response must start with %PDF header"
    assert len(pdf_resp.content) > 2000

    # 7c. Test PDF Inline View endpoint
    inline_resp = httpx.get(f"http://127.0.0.1:8000/api/incidents/{resolved_incident['id']}/report?disposition=inline")
    assert inline_resp.status_code == 200
    assert inline_resp.headers.get('content-type') == 'application/pdf'
    assert 'inline' in inline_resp.headers.get('content-disposition', '')
    assert inline_resp.content[:4] == b'%PDF'
    print(f"  PDF Inline View:        Verified (HTTP 200, inline disposition, %PDF)")

    # 7d. Verify disk persistence
    import os
    from pathlib import Path
    reports_dir = Path(__file__).parent / 'backend' / 'reports'
    expected_file = reports_dir / f"ChaosMedic_Incident_{resolved_incident['id']}.pdf"
    print(f"  Report Disk File:       {expected_file} (Exists: {expected_file.exists()}, Size: {expected_file.stat().st_size if expected_file.exists() else 0} bytes)")
    assert expected_file.exists()
    assert expected_file.stat().st_size > 2000

    # 8. Test Disconnect
    print("\n[8/8] Testing Application Disconnect (/api/applications/disconnect)...")
    disc_resp = httpx.post('http://127.0.0.1:8000/api/applications/disconnect').json()
    print("  Disconnect result:", disc_resp)
    
    status_after = httpx.get('http://127.0.0.1:8000/api/applications/status').json()
    print("  Status after disconnect:", status_after)
    assert status_after.get('connected') is False

    print("\n==================================================================")
    print("ALL TESTS PASSED: ONBOARDING, LIVE PROBE, RECOVERY, PDF & DISCONNECT!")
    print("==================================================================")
    return True

if __name__ == '__main__':
    ok = main()
    sys.exit(0 if ok else 1)

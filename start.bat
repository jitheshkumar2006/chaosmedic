@echo off
echo ============================================================
echo                     CHAOSMEDIC
echo Autonomous Multi-Agent Infrastructure Self-Healing Engine
echo ============================================================
echo.

set ROOT=%~dp0

echo [1/3] Starting Demo Web App on port 8001...
start "ChaosMedic - Demo App (Port 8001)" cmd /k "cd /d %ROOT%demo-app && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

echo [2/3] Starting ChaosMedic AI Backend on port 8000...
start "ChaosMedic - AI Engine (Port 8000)" cmd /k "cd /d %ROOT%backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Starting Shadow Command Center Frontend on port 3000...
start "ChaosMedic - Frontend (Port 3000)" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo All services are launching in separate windows:
echo   - Demo App:         http://localhost:8001
echo   - ChaosMedic API:   http://localhost:8000
echo   - Command Center:   http://localhost:3000
echo.
echo Opening browser in 4 seconds...
timeout /t 4 /nobreak >nul
start http://localhost:3000
echo Done!

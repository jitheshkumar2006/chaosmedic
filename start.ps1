Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                    CHAOSMEDIC" -ForegroundColor White
Write-Host "Autonomous Multi-Agent Infrastructure Self-Healing Engine" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/3] Starting Demo Web App on port 8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\demo-app'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

Write-Host "[2/3] Starting ChaosMedic AI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[3/3] Starting Shadow Command Center Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\frontend'; npm run dev"

Write-Host ""
Write-Host "All services launching:" -ForegroundColor Green
Write-Host "  - Demo App:         http://localhost:8001"
Write-Host "  - ChaosMedic API:   http://localhost:8000"
Write-Host "  - Command Center:   http://localhost:3000"
Write-Host ""
Start-Sleep -Seconds 4
Start-Process "http://localhost:3000"

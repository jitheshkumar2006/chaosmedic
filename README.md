# ChaosMedic 🛡️
### Autonomous Multi-Agent Infrastructure Self-Healing & Incident Response Engine

> **"ChaosMedic doesn't blindly trust an AI-generated fix. It creates Recovery Plans, tests them in isolation, selects the safest validated solution, recovers the application, verifies the result, and records the incident for future use."**

---

## 🚀 Overview

ChaosMedic is an Agentic AI system designed for developers, DevOps engineers, and SRE teams. It acts as an autonomous operations center that continuously monitors your web applications and executes a closed-loop repair cycle when runtime exceptions (e.g. HTTP 500) occur:

```
DETECT ➔ DIAGNOSE ➔ GENERATE ➔ CREATE RECOVERY PLANS ➔ TEST IN ISOLATION ➔ SELECT BEST PLAN ➔ RECOVER ➔ VERIFY ➔ DOCUMENT ➔ REMEMBER
```

---

## 🏗️ Architecture & Multi-Agent Engine

```
                    USERS / TRAFFIC
                          │
                          ▼
                  ┌───────────────┐
                  │  DEMO WEB APP │ (Port 8001)
                  └───────┬───────┘
                          │
                  /health / HTTP 500 / logs / stack traces
                          │
                          ▼
            ┌───────────────────────────┐
            │    CHAOSMEDIC BACKEND     │ (Port 8000)
            │                           │
            │  1. Detection Agent       │
            │  2. Diagnosis Agent       │
            │  3. Patch Generation      │
            │  4. Recovery Planning     │
            │  5. Validation Agent      │
            │  6. Recovery Agent        │
            │  7. Verification Agent    │
            └─────────────┬─────────────┘
                          │ WebSocket / REST
                          ▼
            ┌───────────────────────────┐
            │   SHADOW COMMAND CENTER   │ (Port 3000)
            │      React + Tailwind     │
            └───────────────────────────┘
```

### Specialized Agents

| Agent | Responsibility |
|---|---|
| **1. Detection Agent** | Monitors `/health` and service endpoints, detects HTTP 500, captures stack traces and logs, creates incident tickets (e.g. `#CM-1042`). |
| **2. Diagnosis Agent** | Inspects stack traces and source code AST, pinpoints the file and line number (e.g. `user_service.py:42`), and identifies the *Probable Root Cause*. |
| **3. Patch Generation Agent** | Synthesizes 2–3 candidate code repairs with structured before/after diffs and risk assessments. Patches remain untrusted candidates until validated. |
| **4. Recovery Planning** | Structures candidate repairs into competing **Recovery Plans** (e.g., Plan 01: Null Validation Guard, Plan 02: Fallback Handling, Plan 03: Input Validation). |
| **5. Validation Agent** | Spawns an isolated sandbox, applies the candidate patch, runs the test suite (18 pytest tests), executes regression checks, and verifies the health endpoint. |
| **6. Recovery Agent** | Selects the validated plan with minimal scope and zero regressions, deploys the patch safely to the live application, and triggers a controlled reload. |
| **7. Verification Agent** | Performs post-recovery probes across all endpoints (`/health` and `/users`), confirms HTTP 200, and marks `INCIDENT RESOLVED`. |
| **8. Failure Memory** | Generates an MD5 error signature (`error_type:file:line`) and persists the solution. Similar future failures display historical candidate resolutions. |

---

## 📂 Project Structure

```
chaosmedic/
├── demo-app/                      # Monitored FastAPI Application
│   ├── app/
│   │   ├── main.py                # Endpoints: /health, /users, /chaos/*, /source/*
│   │   ├── models.py              # User Pydantic schema
│   │   └── user_service.py        # Contains controlled TypeError bug at line 42
│   ├── tests/
│   │   └── test_users.py          # 18 pytest tests covering healthy & regression states
│   ├── conftest.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── backend/                       # ChaosMedic AI Engine (FastAPI)
│   ├── app/
│   │   ├── main.py                # FastAPI lifecycle, CORS, WebSocket
│   │   ├── config.py              # Config & DEMO_MODE toggle
│   │   ├── models.py              # Incident, RecoveryPlan, RootCause schemas
│   │   ├── database.py            # In-memory / SQLite incident store
│   │   ├── websocket.py           # WebSocket broadcasting
│   │   ├── routes/
│   │   │   ├── health.py          # GET /api/health
│   │   │   ├── incidents.py       # Incident CRUD & active incident
│   │   │   ├── demo.py            # POST /api/demo/trigger-failure & reset
│   │   │   └── reports.py         # GET /api/incidents/{id}/report (PDF download)
│   │   ├── agents/
│   │   │   ├── orchestrator.py    # Multi-agent state pipeline
│   │   │   ├── detection.py       # Detection Agent
│   │   │   ├── diagnosis.py       # Diagnosis Agent
│   │   │   ├── patch_gen.py       # Patch Generation Agent (3 candidate plans)
│   │   │   ├── recovery_plan.py   # Recovery Planning Agent
│   │   │   ├── validation.py      # Sandbox Validation Agent
│   │   │   ├── recovery.py        # Recovery Agent
│   │   │   └── verification.py    # Verification Agent
│   │   └── services/
│   │       ├── monitor.py         # Asynchronous health monitor loop
│   │       ├── sandbox.py         # Isolated process sandbox with pytest execution
│   │       ├── memory.py          # Failure Memory signature store
│   │       ├── llm.py             # LLM abstraction (Gemini/OpenAI/Anthropic)
│   │       └── pdf_report.py      # ReportLab PDF report generator
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                      # Shadow Command Center UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopBar.jsx         # Live status indicator & DEMO MODE badge
│   │   │   ├── Sidebar.jsx        # Navigation (Overview, History, Memory, Replay)
│   │   │   ├── Dashboard.jsx      # Primary Command Center view
│   │   │   ├── SystemHealth.jsx   # Live system health card
│   │   │   ├── IncidentPanel.jsx  # Active incident badge & severity
│   │   │   ├── AgentActivity.jsx  # Real-time multi-agent progression pipeline
│   │   │   ├── RootCausePanel.jsx # Probable root cause, confidence & expandable trace
│   │   │   ├── RecoveryPlanCard.jsx       # Floating shadow cards with test scores
│   │   │   ├── RecoveryPlanComparison.jsx # Side-by-side plan comparison
│   │   │   ├── CodeDiff.jsx       # Clean Before/After syntax comparison
│   │   │   ├── SandboxStatus.jsx  # Visual container isolation sandbox
│   │   │   ├── RecoveryProgress.jsx       # Step-by-step progress pills
│   │   │   ├── IncidentReplay.jsx # Flight recorder event timeline player
│   │   │   ├── WhyExplanation.jsx # Interactive "Why?" explainability popups
│   │   │   ├── IncidentReport.jsx # One-click PDF report trigger
│   │   │   ├── IncidentHistory.jsx# Historical incidents archive
│   │   │   └── RecoveryMemory.jsx # Signature-indexed failure memory
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js    # Resilient WS client with auto-reconnect
│   │   │   └── useIncident.js     # State management & fallback polling
│   │   ├── utils/
│   │   │   └── api.js             # REST API client
│   │   ├── App.jsx
│   │   ├── index.css              # Custom dark theme with floating shadows
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
│
├── docker-compose.yml             # Containerized orchestration
├── start.bat                      # Windows launcher (Command Prompt)
├── start.ps1                      # Windows launcher (PowerShell)
├── .env.example                   # Environment configuration template
└── README.md
```

---

## ⚙️ Quickstart & Setup

### Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** & **npm**

### Step 1: Install Python Dependencies
```bash
# Demo App
cd demo-app
pip install -r requirements.txt

# Backend
cd ../backend
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 🏃 Running the System

### Option A: 1-Click Launch (Windows)
Double-click `start.bat` or run in PowerShell:
```powershell
.\start.ps1
```
This automatically starts all 3 services in separate windows and opens `http://localhost:3000` in your browser.

### Option B: Manual Terminal Launch

**Terminal 1 — Demo Web App:**
```bash
cd demo-app
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

**Terminal 2 — ChaosMedic AI Engine:**
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 3 — Shadow Command Center:**
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 🐳 Docker Compose Deployment

If Docker is installed on your system:
```bash
docker-compose up --build
```
Access the Command Center at `http://localhost:3000`.

---

## 🕹️ The 3-Minute Hackathon Demo Script

1. **Observe Normal State**:
   - The TopBar displays `● SYSTEM OPERATIONAL`.
   - The System Health card displays `● SYSTEM HEALTHY (3 Services, 0 Active Incidents)`.
   - Both `/health` and `/users` respond with HTTP 200.

2. **Trigger Chaos**:
   - Click the large primary button: **`🚨 TRIGGER CHAOS`**.
   - The demo application injects a controlled `NoneType` user record.
   - `/users` immediately fails with `HTTP 500` and generates a realistic Python stack trace at `user_service.py:42`.

3. **Watch Autonomous Incident Response**:
   - **Detection**: Within 3 seconds, the health monitor catches the failure and opens Incident `#CM-XXXX`.
   - **Diagnosis**: The Diagnosis Agent analyzes the stack trace, identifies line 42 in `user_service.py`, and determines `Probable Root Cause` with 92% confidence.
   - **Recovery Planning**: The Patch Generation Agent synthesizes 3 candidate recovery plans.
   - **Sandbox Validation**: The Validation Agent isolates each plan, executes 18 pytest tests, and runs health probes:
     - **Plan 01 (Add Null Validation)**: 18/18 Tests Passed (100%), Health Check PASS ✓ ➔ **APPROVED 🏆**
     - **Plan 02 (Fallback Response Handling)**: 11/18 Tests Passed, 7 schema regressions ➔ **REJECTED ✕**
     - **Plan 03 (Input Validation)**: 15/18 Tests Passed, drops inactive users ➔ **REJECTED ✕**
   - **Recovery**: The Recovery Agent applies the minimal, validated patch to `user_service.py` and triggers a hot reload.
   - **Verification**: The Verification Agent validates `/health` and `/users`, confirming HTTP 200.
   - **Resolved**: Status updates to `🟢 INCIDENT RESOLVED` with total recovery duration.

4. **Explore Explainability & Incident Replay**:
   - Click the **`Why?`** buttons on the Recovery Plan cards to inspect the algorithmic justification for why Plan 01 was approved and Plans 02 & 03 were rejected.
   - Navigate to **TOOLS ➔ Incident Replay** and click **`▶ PLAY REPLAY`** to review the flight recorder timeline.
   - Navigate to **INTELLIGENCE ➔ Recovery Memory** to see the indexed error signature and stored resolution.

5. **Generate Incident Report (PDF)**:
   - Click **`GENERATE INCIDENT REPORT`**.
   - A ReportLab PDF is generated and downloaded containing full incident telemetry, stack traces, candidate plans, before/after code diffs, validation logs, and resolution signatures.

6. **Reset Demo**:
   - Click **`RESET DEMO`** at any time to restore the original clean codebase, clear active incidents, and reset the monitor.

---

## 🤖 DEMO MODE vs. Live LLM Mode

ChaosMedic is designed with maximum hackathon resilience:

- **DEMO MODE (Default)**:
  When `LLM_API_KEY` is not provided (or if the external API times out), ChaosMedic seamlessly runs in **DEMO MODE**. All diagnostic reasoning, patch generation, and recovery plans use deterministic, production-quality structured templates for the controlled demo bug. The sandbox tests are **100% REAL** (running live `pytest` in isolation).
  
- **Live LLM Mode**:
  Set `LLM_API_KEY` in your environment or `.env` file to use live LLM reasoning (Gemini, OpenAI, or Anthropic).

---

## 🔒 Security & Safety Principles

1. **Isolation First**: No AI-generated code is ever executed directly on the host machine or deployed to production without passing through sandbox validation.
2. **Regression Gates**: Every candidate plan must pass 100% of existing regression tests and health check probes.
3. **Auditability**: Every agent action, stack trace, diff, and test score is permanently logged in the incident record and exportable as a signed PDF report.

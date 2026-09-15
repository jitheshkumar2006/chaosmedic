import subprocess
import sys
import os
import time
import signal

ROOT = os.path.dirname(os.path.abspath(__file__))
DEMO_DIR = os.path.join(ROOT, "demo-app")
BACKEND_DIR = os.path.join(ROOT, "backend")
FRONTEND_DIR = os.path.join(ROOT, "frontend")

PYTHON = sys.executable

def start_services():
    print("=" * 60)
    print("CHAOSMEDIC ALL-IN-ONE RUNNER")
    print("=" * 60)
    
    # 1. Demo App
    print("[1/3] Starting Demo App on http://127.0.0.1:8001 ...")
    demo_proc = subprocess.Popen(
        [PYTHON, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8001", "--reload"],
        cwd=DEMO_DIR
    )
    
    # 2. Backend
    print("[2/3] Starting Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [PYTHON, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=BACKEND_DIR
    )
    
    # 3. Frontend
    print("[3/3] Starting Frontend on http://localhost:3000 ...")
    npx_cmd = "npx.cmd" if os.name == "nt" else "npx"
    frontend_proc = subprocess.Popen(
        [npx_cmd, "vite", "--host", "0.0.0.0", "--port", "3000"],
        cwd=FRONTEND_DIR,
        shell=(os.name == "nt")
    )
    
    print("\n" + "=" * 60)
    print("ALL 3 SERVICES STARTED!")
    print(">> Open http://localhost:3000 in your browser <<")
    print("Press Ctrl+C to stop all services.")
    print("=" * 60 + "\n")
    
    procs = [demo_proc, backend_proc, frontend_proc]
    
    try:
        while True:
            time.sleep(1)
            for p in procs:
                if p.poll() is not None:
                    print(f"Warning: A process exited with code {p.returncode}")
    except KeyboardInterrupt:
        print("\nStopping ChaosMedic services...")
        for p in procs:
            try:
                p.terminate()
            except Exception:
                pass
        print("Done.")

if __name__ == "__main__":
    start_services()

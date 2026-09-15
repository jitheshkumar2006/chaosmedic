import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.websocket import manager
from app.services.monitor import monitor
from app.routes import health, incidents, demo, reports, applications
from app.config import DEMO_MODE

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f'ChaosMedic starting... DEMO_MODE={DEMO_MODE}')
    # Import here to avoid circular imports
    from app.agents.orchestrator import handle_failure_detected
    monitor.on_failure_detected = handle_failure_detected
    await monitor.start()
    yield
    await monitor.stop()
    logger.info('ChaosMedic shutdown')

app = FastAPI(title='ChaosMedic', description='Autonomous Multi-Agent Infrastructure Self-Healing Engine', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Routes
app.include_router(applications.router)
app.include_router(health.router)
app.include_router(incidents.router)
app.include_router(demo.router)
app.include_router(reports.router)

@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

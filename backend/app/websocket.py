from fastapi import WebSocket
from typing import List, Any
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f'WebSocket client connected. Total: {len(self.active_connections)}')
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f'WebSocket client disconnected. Total: {len(self.active_connections)}')
    
    async def broadcast(self, event_type: str, data: Any):
        message = json.dumps({'type': event_type, 'data': data if isinstance(data, (dict, list, str, int, float, bool)) else data.model_dump() if hasattr(data, 'model_dump') else str(data)}, default=str)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

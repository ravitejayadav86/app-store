from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio

router = APIRouter(prefix="/telemetry", tags=["telemetry"])

class DownloadTelemetryManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_download(self, app_name: str, username: str):
        payload = {
            "type": "DOWNLOAD_START",
            "app_name": app_name,
            "username": username,
            "timestamp": asyncio.get_event_loop().time()
        }
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(payload))
            except Exception:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

manager = DownloadTelemetryManager()

@router.websocket("/downloads")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, we primarily broadcast OUT
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# Helper for other routes to broadcast
async def notify_download(app_name: str, username: str):
    await manager.broadcast_download(app_name, username)

from typing import Dict, List, Set
from fastapi import WebSocket
from starlette.websockets import WebSocketState
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # user_id -> list of active websockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WS connected: user_id={user_id}, total={len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
            except ValueError:
                pass
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                logger.info(f"WS disconnected: user_id={user_id} (no more connections)")

    def _is_connected(self, ws: WebSocket) -> bool:
        """Check if a WebSocket is still in a connected state."""
        try:
            return ws.client_state == WebSocketState.CONNECTED
        except Exception:
            return False

    async def send_to_user(self, user_id: int, message: dict):
        if user_id not in self.active_connections:
            return

        dead: List[WebSocket] = []
        for ws in list(self.active_connections[user_id]):
            if not self._is_connected(ws):
                dead.append(ws)
                continue
            try:
                await ws.send_text(json.dumps(message, default=str))
            except Exception as e:
                logger.warning(f"WS send failed for user {user_id}: {e}")
                dead.append(ws)

        # Clean up dead connections
        for ws in dead:
            self.disconnect(ws, user_id)

    async def broadcast(self, message: dict):
        for user_id in list(self.active_connections.keys()):
            await self.send_to_user(user_id, message)

manager = ConnectionManager()


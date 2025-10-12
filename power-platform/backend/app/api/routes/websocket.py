"""
WebSocket routes for real-time updates.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import Dict, List
import json
import asyncio

from app.deps import get_current_user_ws
from app.db.models import User

router = APIRouter()

# Active WebSocket connections by user and run
connections: Dict[int, List[WebSocket]] = {}  # user_id -> [websockets]
run_connections: Dict[int, List[WebSocket]] = {}  # run_id -> [websockets]


class ConnectionManager:
    """Manages WebSocket connections."""

    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.run_subscribers: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """Connect a WebSocket for a user."""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        """Disconnect a WebSocket."""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)

    async def subscribe_to_run(self, websocket: WebSocket, run_id: int):
        """Subscribe a WebSocket to run updates."""
        if run_id not in self.run_subscribers:
            self.run_subscribers[run_id] = []
        self.run_subscribers[run_id].append(websocket)

    def unsubscribe_from_run(self, websocket: WebSocket, run_id: int):
        """Unsubscribe a WebSocket from run updates."""
        if run_id in self.run_subscribers:
            if websocket in self.run_subscribers[run_id]:
                self.run_subscribers[run_id].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific WebSocket."""
        await websocket.send_text(message)

    async def broadcast_to_user(self, message: str, user_id: int):
        """Broadcast a message to all connections for a user."""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except:
                    pass  # Connection may be closed

    async def broadcast_to_run(self, message: str, run_id: int):
        """Broadcast a message to all subscribers of a run."""
        if run_id in self.run_subscribers:
            disconnected = []
            for connection in self.run_subscribers[run_id]:
                try:
                    await connection.send_text(message)
                except:
                    disconnected.append(connection)

            # Clean up disconnected connections
            for conn in disconnected:
                self.run_subscribers[run_id].remove(conn)


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    Main WebSocket endpoint for real-time updates.

    Query params:
    - token: JWT authentication token
    """
    # Validate token and get user
    # In production, use proper JWT validation from get_current_user_ws dependency
    # For now, simplified version
    user_id = 1  # Placeholder - should decode from token

    await manager.connect(websocket, user_id)

    try:
        while True:
            # Receive messages from client
            data = await websocket.receive_text()

            try:
                message = json.loads(data)
                msg_type = message.get("type")

                if msg_type == "subscribe_run":
                    run_id = message.get("run_id")
                    await manager.subscribe_to_run(websocket, run_id)
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "subscribed",
                            "run_id": run_id,
                        }),
                        websocket
                    )

                elif msg_type == "unsubscribe_run":
                    run_id = message.get("run_id")
                    manager.unsubscribe_from_run(websocket, run_id)
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "unsubscribed",
                            "run_id": run_id,
                        }),
                        websocket
                    )

                elif msg_type == "ping":
                    await manager.send_personal_message(
                        json.dumps({"type": "pong"}),
                        websocket
                    )

            except json.JSONDecodeError:
                await manager.send_personal_message(
                    json.dumps({"type": "error", "message": "Invalid JSON"}),
                    websocket
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


# Helper functions for broadcasting updates from other parts of the application

async def send_run_update(run_id: int, status: str, data: dict = None):
    """Send run status update to all subscribers."""
    message = {
        "type": "run_update",
        "run_id": run_id,
        "status": status,
        "data": data or {},
    }
    await manager.broadcast_to_run(json.dumps(message), run_id)


async def send_run_log(run_id: int, log_level: str, message: str):
    """Send log message for a run."""
    msg = {
        "type": "run_log",
        "run_id": run_id,
        "level": log_level,
        "message": message,
    }
    await manager.broadcast_to_run(json.dumps(msg), run_id)


async def send_run_progress(run_id: int, progress: float, stage: str):
    """Send progress update for a run."""
    message = {
        "type": "run_progress",
        "run_id": run_id,
        "progress": progress,
        "stage": stage,
    }
    await manager.broadcast_to_run(json.dumps(message), run_id)


async def send_hil_telemetry(session_id: str, telemetry: dict):
    """Send HIL telemetry data."""
    message = {
        "type": "hil_telemetry",
        "session_id": session_id,
        "telemetry": telemetry,
    }
    # Broadcast to all connections (could be filtered by session)
    for connections_list in manager.active_connections.values():
        for websocket in connections_list:
            try:
                await websocket.send_text(json.dumps(message))
            except:
                pass


# Export manager and helper functions
__all__ = [
    "router",
    "manager",
    "send_run_update",
    "send_run_log",
    "send_run_progress",
    "send_hil_telemetry",
]

"""
Hardware-in-the-Loop (HIL) integration API routes.
"""
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.deps import get_current_user
from app.services.hil.base import HILChannel
from app.services.hil.mock_hil import MockHILAdapter
from app.services.hil.modbus_tcp import ModbusTCPAdapter
from app.services.hil.opcua_adapter import OPCUAAdapter
from app.services.hil.udp_stream import UDPStreamAdapter
from pydantic import BaseModel

router = APIRouter(prefix="/hil", tags=["hil"])

# Active HIL sessions (in-memory, would use Redis in production)
active_sessions: Dict[str, Any] = {}


class HILConnectRequest(BaseModel):
    adapter_type: str  # "mock", "modbus_tcp", "opcua", "udp", "ni_crio"
    config: Dict[str, Any]
    session_id: str


class HILChannelConfig(BaseModel):
    name: str
    channel_type: str  # "analog_in", "analog_out", "digital_in", "digital_out"
    units: str = ""
    scale: float = 1.0
    offset: float = 0.0
    safety_min: float | None = None
    safety_max: float | None = None


class HILConfigureRequest(BaseModel):
    session_id: str
    channels: List[HILChannelConfig]


class HILStartRequest(BaseModel):
    session_id: str
    sample_rate: float = 1000.0


class HILSetpointRequest(BaseModel):
    session_id: str
    setpoints: Dict[str, float]


@router.post("/connect")
async def connect_hil(
    request: HILConnectRequest,
    current_user: User = Depends(get_current_user),
):
    """Connect to HIL hardware."""
    try:
        # Create adapter based on type
        if request.adapter_type == "mock":
            adapter = MockHILAdapter(request.config)
        elif request.adapter_type == "modbus_tcp":
            adapter = ModbusTCPAdapter(request.config)
        elif request.adapter_type == "opcua":
            adapter = OPCUAAdapter(request.config)
        elif request.adapter_type == "udp":
            adapter = UDPStreamAdapter(request.config)
        elif request.adapter_type == "ni_crio":
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="NI cRIO adapter requires gRPC server configuration"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown adapter type: {request.adapter_type}"
            )

        # Connect
        success = await adapter.connect()
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to connect to HIL hardware"
            )

        # Store session
        active_sessions[request.session_id] = {
            "adapter": adapter,
            "user_id": current_user.id,
            "adapter_type": request.adapter_type,
            "connected": True,
            "streaming": False,
        }

        return {
            "session_id": request.session_id,
            "connected": True,
            "adapter_type": request.adapter_type,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Connection failed: {str(e)}"
        )


@router.post("/configure")
async def configure_channels(
    request: HILConfigureRequest,
    current_user: User = Depends(get_current_user),
):
    """Configure HIL channels."""
    if request.session_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    session = active_sessions[request.session_id]
    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )

    adapter = session["adapter"]

    # Convert to HILChannel objects
    channels = [
        HILChannel(
            name=ch.name,
            channel_type=ch.channel_type,
            units=ch.units,
            scale=ch.scale,
            offset=ch.offset,
            safety_min=ch.safety_min,
            safety_max=ch.safety_max,
        )
        for ch in request.channels
    ]

    success = await adapter.configure_channels(channels)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to configure channels"
        )

    return {"message": "Channels configured successfully"}


@router.post("/start")
async def start_stream(
    request: HILStartRequest,
    current_user: User = Depends(get_current_user),
):
    """Start HIL data streaming."""
    if request.session_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    session = active_sessions[request.session_id]
    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )

    adapter = session["adapter"]

    success = await adapter.start_stream(request.sample_rate)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start streaming"
        )

    session["streaming"] = True

    return {
        "message": "Streaming started",
        "sample_rate": request.sample_rate,
    }


@router.post("/stop")
async def stop_stream(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    """Stop HIL data streaming."""
    if session_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    session = active_sessions[session_id]
    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )

    adapter = session["adapter"]

    success = await adapter.stop_stream()
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop streaming"
        )

    session["streaming"] = False

    return {"message": "Streaming stopped"}


@router.get("/telemetry/{session_id}")
async def get_telemetry(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get current telemetry data."""
    if session_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    session = active_sessions[session_id]
    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )

    adapter = session["adapter"]

    telemetry = await adapter.read_channels()

    return {
        "timestamp": telemetry.timestamp,
        "values": telemetry.values,
        "faults": telemetry.faults,
    }


@router.post("/setpoints")
async def write_setpoints(
    request: HILSetpointRequest,
    current_user: User = Depends(get_current_user),
):
    """Write setpoints to HIL hardware."""
    if request.session_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    session = active_sessions[request.session_id]
    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )

    adapter = session["adapter"]

    # Check safety
    safety_warnings = adapter.check_safety(request.setpoints)
    if safety_warnings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Safety violations: {', '.join(safety_warnings)}"
        )

    success = await adapter.write_setpoints(request.setpoints)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to write setpoints"
        )

    return {"message": "Setpoints written successfully"}


@router.post("/disconnect")
async def disconnect_hil(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    """Disconnect from HIL hardware."""
    if session_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    session = active_sessions[session_id]
    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )

    adapter = session["adapter"]

    await adapter.disconnect()
    del active_sessions[session_id]

    return {"message": "Disconnected successfully"}


@router.get("/sessions")
async def list_sessions(
    current_user: User = Depends(get_current_user),
):
    """List active HIL sessions for current user."""
    user_sessions = [
        {
            "session_id": sid,
            "adapter_type": info["adapter_type"],
            "connected": info["connected"],
            "streaming": info["streaming"],
        }
        for sid, info in active_sessions.items()
        if info["user_id"] == current_user.id
    ]

    return {"sessions": user_sessions}

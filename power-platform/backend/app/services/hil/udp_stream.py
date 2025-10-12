"""UDP streaming HIL adapter for high-rate telemetry."""
import asyncio
import struct
from typing import Dict, List, Any
from .base import BaseHILAdapter, HILChannel, HILTelemetry, HILStatus
import time


class UDPStreamAdapter(BaseHILAdapter):
    """UDP streaming adapter for high-speed telemetry."""

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize UDP stream adapter.

        Config:
            host: Target host for sending
            port: Target port
            listen_port: Port to listen on for receiving
            packet_format: Struct format string
        """
        super().__init__(config)
        self.host = config.get("host", "localhost")
        self.port = config.get("port", 5000)
        self.listen_port = config.get("listen_port", 5001)
        self.packet_format = config.get("packet_format", "fff")  # 3 floats
        self.transport = None
        self.protocol = None

    async def connect(self) -> bool:
        """Setup UDP socket."""
        self.status = HILStatus.CONNECTED
        return True

    async def disconnect(self) -> bool:
        """Close UDP socket."""
        if self.transport:
            self.transport.close()
        self.status = HILStatus.DISCONNECTED
        return True

    async def configure_channels(self, channels: List[HILChannel]) -> bool:
        """Configure UDP channels."""
        for ch in channels:
            self.channels[ch.name] = ch
        return True

    async def start_stream(self, sample_rate: float = 1000.0) -> bool:
        """Start UDP streaming."""
        self.status = HILStatus.RUNNING
        return True

    async def stop_stream(self) -> bool:
        """Stop UDP streaming."""
        self.status = HILStatus.CONNECTED
        return True

    async def read_channels(self) -> HILTelemetry:
        """Read from UDP packets."""
        # Simplified - would parse incoming UDP packets
        return HILTelemetry(
            timestamp=time.time(),
            channels={},
            faults=[],
            status=self.status
        )

    async def write_setpoints(self, setpoints: Dict[str, float]) -> bool:
        """Send setpoints via UDP."""
        # Pack values into binary format
        try:
            values = [setpoints.get(ch, 0.0) for ch in list(setpoints.keys())[:3]]
            packet = struct.pack(self.packet_format, *values)
            # Send via UDP (implementation depends on transport setup)
            return True
        except Exception as e:
            print(f"UDP write error: {e}")
            return False

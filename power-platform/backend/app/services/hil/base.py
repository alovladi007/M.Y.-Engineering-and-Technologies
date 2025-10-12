"""Hardware-in-the-Loop (HIL) base adapter interface."""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum


class HILStatus(str, Enum):
    """HIL connection status."""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    RUNNING = "running"
    ERROR = "error"
    FAULT = "fault"


@dataclass
class HILChannel:
    """HIL I/O channel definition."""
    name: str
    type: str  # analog_in, analog_out, digital_in, digital_out
    unit: str  # V, A, °C, etc.
    range_min: float
    range_max: float
    channel_id: int


@dataclass
class HILTelemetry:
    """HIL telemetry data point."""
    timestamp: float
    channels: Dict[str, float]  # channel_name -> value
    faults: List[str]
    status: HILStatus


class BaseHILAdapter(ABC):
    """Base class for HIL adapters."""

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize HIL adapter.

        Args:
            config: Adapter configuration
        """
        self.config = config
        self.status = HILStatus.DISCONNECTED
        self.channels: Dict[str, HILChannel] = {}
        self.safety_limits: Dict[str, tuple] = {}  # channel -> (min, max)

    @abstractmethod
    async def connect(self) -> bool:
        """
        Establish connection to HIL hardware.

        Returns:
            True if successful
        """
        pass

    @abstractmethod
    async def disconnect(self) -> bool:
        """
        Disconnect from HIL hardware.

        Returns:
            True if successful
        """
        pass

    @abstractmethod
    async def configure_channels(self, channels: List[HILChannel]) -> bool:
        """
        Configure I/O channels.

        Args:
            channels: List of channel definitions

        Returns:
            True if successful
        """
        pass

    @abstractmethod
    async def start_stream(self, sample_rate: float = 1000.0) -> bool:
        """
        Start telemetry streaming.

        Args:
            sample_rate: Sampling rate (Hz)

        Returns:
            True if successful
        """
        pass

    @abstractmethod
    async def stop_stream(self) -> bool:
        """
        Stop telemetry streaming.

        Returns:
            True if successful
        """
        pass

    @abstractmethod
    async def read_channels(self) -> HILTelemetry:
        """
        Read current channel values.

        Returns:
            HILTelemetry with current values
        """
        pass

    @abstractmethod
    async def write_setpoints(self, setpoints: Dict[str, float]) -> bool:
        """
        Write setpoint values to output channels.

        Args:
            setpoints: Dictionary of channel_name -> value

        Returns:
            True if successful
        """
        pass

    async def set_safety_limits(self, limits: Dict[str, tuple]) -> bool:
        """
        Set safety limits for channels.

        Args:
            limits: Dictionary of channel_name -> (min_value, max_value)

        Returns:
            True if successful
        """
        self.safety_limits = limits
        return True

    def check_safety(self, values: Dict[str, float]) -> List[str]:
        """
        Check if values are within safety limits.

        Args:
            values: Dictionary of channel_name -> value

        Returns:
            List of violation messages (empty if all OK)
        """
        violations = []

        for channel, value in values.items():
            if channel in self.safety_limits:
                min_val, max_val = self.safety_limits[channel]
                if value < min_val:
                    violations.append(f"{channel}: {value} below minimum {min_val}")
                elif value > max_val:
                    violations.append(f"{channel}: {value} above maximum {max_val}")

        return violations

    async def emergency_stop(self) -> bool:
        """
        Execute emergency stop sequence.

        Returns:
            True if successful
        """
        # Default implementation: stop stream and set all outputs to zero
        await self.stop_stream()
        zero_setpoints = {ch.name: 0.0 for ch in self.channels.values() if "out" in ch.type}
        await self.write_setpoints(zero_setpoints)
        self.status = HILStatus.FAULT
        return True

    def get_status(self) -> Dict[str, Any]:
        """
        Get current adapter status.

        Returns:
            Status dictionary
        """
        return {
            "status": self.status.value,
            "channels": len(self.channels),
            "config": self.config
        }

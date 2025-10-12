"""Mock HIL adapter for testing and development."""
import asyncio
import time
import random
from typing import Dict, List, Any
from .base import BaseHILAdapter, HILChannel, HILTelemetry, HILStatus


class MockHILAdapter(BaseHILAdapter):
    """
    Mock HIL adapter that simulates hardware responses.
    Useful for testing and development without physical hardware.
    """

    def __init__(self, config: Dict[str, Any]):
        """Initialize mock HIL adapter."""
        super().__init__(config)
        self.is_streaming = False
        self.current_values: Dict[str, float] = {}
        self.setpoints: Dict[str, float] = {}
        self.inject_fault = config.get("inject_fault", False)
        self.noise_level = config.get("noise_level", 0.01)

    async def connect(self) -> bool:
        """Simulate connection."""
        self.status = HILStatus.CONNECTING
        await asyncio.sleep(0.5)  # Simulate connection delay
        self.status = HILStatus.CONNECTED
        return True

    async def disconnect(self) -> bool:
        """Simulate disconnection."""
        self.is_streaming = False
        self.status = HILStatus.DISCONNECTED
        return True

    async def configure_channels(self, channels: List[HILChannel]) -> bool:
        """Configure mock channels."""
        for ch in channels:
            self.channels[ch.name] = ch
            # Initialize with mid-range values
            mid_val = (ch.range_min + ch.range_max) / 2
            self.current_values[ch.name] = mid_val
            if "out" in ch.type:
                self.setpoints[ch.name] = mid_val

        return True

    async def start_stream(self, sample_rate: float = 1000.0) -> bool:
        """Start simulated streaming."""
        self.is_streaming = True
        self.status = HILStatus.RUNNING
        return True

    async def stop_stream(self) -> bool:
        """Stop simulated streaming."""
        self.is_streaming = False
        self.status = HILStatus.CONNECTED
        return True

    async def read_channels(self) -> HILTelemetry:
        """Read simulated channel values."""
        # Update values with random walk + noise
        for name, channel in self.channels.items():
            if "in" in channel.type:
                # Simulate measurement with noise
                current = self.current_values.get(name, 0.0)

                # Random walk
                delta = random.gauss(0, 0.1) * (channel.range_max - channel.range_min)
                new_val = current + delta

                # Add noise
                noise = random.gauss(0, self.noise_level) * (channel.range_max - channel.range_min)
                new_val += noise

                # Clamp to range
                new_val = max(channel.range_min, min(channel.range_max, new_val))

                self.current_values[name] = new_val

            elif "out" in channel.type:
                # Output channels follow setpoints
                if name in self.setpoints:
                    self.current_values[name] = self.setpoints[name]

        # Check for injected faults
        faults = []
        if self.inject_fault:
            faults.append("MOCK_FAULT: Simulated fault injection active")

        # Check safety violations
        safety_violations = self.check_safety(self.current_values)
        faults.extend(safety_violations)

        return HILTelemetry(
            timestamp=time.time(),
            channels=self.current_values.copy(),
            faults=faults,
            status=HILStatus.FAULT if faults else self.status
        )

    async def write_setpoints(self, setpoints: Dict[str, float]) -> bool:
        """Write simulated setpoints."""
        # Check safety first
        violations = self.check_safety(setpoints)
        if violations:
            return False

        # Update setpoints
        for channel, value in setpoints.items():
            if channel in self.channels and "out" in self.channels[channel].type:
                self.setpoints[channel] = value

        return True

    async def emergency_stop(self) -> bool:
        """Execute mock emergency stop."""
        await super().emergency_stop()
        # Reset all values to safe defaults
        for name, channel in self.channels.items():
            self.current_values[name] = 0.0
            if "out" in channel.type:
                self.setpoints[name] = 0.0

        return True

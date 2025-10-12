"""Modbus TCP HIL adapter."""
import asyncio
from typing import Dict, List, Any
from pymodbus.client import AsyncModbusTcpClient
from .base import BaseHILAdapter, HILChannel, HILTelemetry, HILStatus
import time


class ModbusTCPAdapter(BaseHILAdapter):
    """Modbus TCP adapter for PLC/RTU communication."""

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize Modbus TCP adapter.

        Config keys:
            host: Modbus server IP
            port: Modbus port (default 502)
            unit: Unit/slave ID
            timeout: Connection timeout (s)
        """
        super().__init__(config)
        self.host = config.get("host", "localhost")
        self.port = config.get("port", 502)
        self.unit = config.get("unit", 1)
        self.timeout = config.get("timeout", 5.0)
        self.client: AsyncModbusTcpClient = None
        self.register_map: Dict[str, int] = {}  # channel -> register address

    async def connect(self) -> bool:
        """Connect to Modbus TCP server."""
        try:
            self.status = HILStatus.CONNECTING
            self.client = AsyncModbusTcpClient(
                host=self.host,
                port=self.port,
                timeout=self.timeout
            )
            connected = await self.client.connect()
            if connected:
                self.status = HILStatus.CONNECTED
                return True
            else:
                self.status = HILStatus.ERROR
                return False
        except Exception as e:
            self.status = HILStatus.ERROR
            print(f"Modbus connection error: {e}")
            return False

    async def disconnect(self) -> bool:
        """Disconnect from Modbus server."""
        if self.client:
            self.client.close()
        self.status = HILStatus.DISCONNECTED
        return True

    async def configure_channels(self, channels: List[HILChannel]) -> bool:
        """
        Configure Modbus register mapping.

        Channel IDs are interpreted as Modbus register addresses.
        """
        for ch in channels:
            self.channels[ch.name] = ch
            self.register_map[ch.name] = ch.channel_id

        return True

    async def start_stream(self, sample_rate: float = 1000.0) -> bool:
        """Start polling Modbus registers."""
        self.status = HILStatus.RUNNING
        return True

    async def stop_stream(self) -> bool:
        """Stop polling."""
        self.status = HILStatus.CONNECTED
        return True

    async def read_channels(self) -> HILTelemetry:
        """Read input registers from Modbus."""
        if not self.client or self.status == HILStatus.DISCONNECTED:
            return HILTelemetry(
                timestamp=time.time(),
                channels={},
                faults=["Not connected"],
                status=HILStatus.ERROR
            )

        values = {}
        faults = []

        for name, channel in self.channels.items():
            if "in" in channel.type:
                try:
                    # Read holding register
                    address = self.register_map[name]
                    result = await self.client.read_holding_registers(
                        address=address,
                        count=1,
                        slave=self.unit
                    )

                    if not result.isError():
                        # Convert register value to physical units
                        raw_value = result.registers[0]
                        # Scale from 0-65535 to channel range
                        scaled = channel.range_min + (raw_value / 65535.0) * (
                            channel.range_max - channel.range_min
                        )
                        values[name] = scaled
                    else:
                        faults.append(f"Error reading {name}: {result}")

                except Exception as e:
                    faults.append(f"Exception reading {name}: {e}")

        # Check safety
        safety_violations = self.check_safety(values)
        faults.extend(safety_violations)

        return HILTelemetry(
            timestamp=time.time(),
            channels=values,
            faults=faults,
            status=HILStatus.FAULT if faults else self.status
        )

    async def write_setpoints(self, setpoints: Dict[str, float]) -> bool:
        """Write output registers to Modbus."""
        if not self.client or self.status == HILStatus.DISCONNECTED:
            return False

        # Check safety first
        violations = self.check_safety(setpoints)
        if violations:
            return False

        try:
            for channel_name, value in setpoints.items():
                if channel_name not in self.channels:
                    continue

                channel = self.channels[channel_name]
                if "out" not in channel.type:
                    continue

                # Scale physical value to register (0-65535)
                normalized = (value - channel.range_min) / (
                    channel.range_max - channel.range_min
                )
                raw_value = int(normalized * 65535)
                raw_value = max(0, min(65535, raw_value))

                # Write to register
                address = self.register_map[channel_name]
                await self.client.write_register(
                    address=address,
                    value=raw_value,
                    slave=self.unit
                )

            return True

        except Exception as e:
            print(f"Modbus write error: {e}")
            return False

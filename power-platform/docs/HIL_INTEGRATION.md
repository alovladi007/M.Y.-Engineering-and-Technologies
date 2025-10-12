# Hardware-in-the-Loop (HIL) Integration Guide

Complete guide to integrating real and simulated hardware with the Power Platform.

## Table of Contents

1. [HIL Overview](#hil-overview)
2. [Adapter Architecture](#adapter-architecture)
3. [Mock HIL (Demo)](#mock-hil-demo)
4. [Modbus TCP](#modbus-tcp)
5. [OPC UA](#opc-ua)
6. [UDP Streaming](#udp-streaming)
7. [NI cRIO (gRPC)](#ni-crio-grpc)
8. [Safety Features](#safety-features)
9. [Telemetry Logging](#telemetry-logging)

## HIL Overview

Hardware-in-the-Loop testing bridges simulation and real hardware, enabling:

- **Controller validation** before hardware assembly
- **Real-time parameter tuning** on live converters
- **Fault injection** and protection testing
- **Production line** automated testing

### Supported Use Cases

1. **Digital Twin**: Connect to simulated hardware (Mock HIL)
2. **PLC Integration**: Control industrial PLCs via Modbus TCP
3. **Industrial Automation**: SCADA systems via OPC UA
4. **High-Speed Telemetry**: Custom UDP streaming
5. **Real-Time Systems**: NI CompactRIO via gRPC

## Adapter Architecture

### Base Interface

All HIL adapters implement `BaseHILAdapter`:

```python
class BaseHILAdapter(ABC):
    @abstractmethod
    async def connect(self) -> bool:
        """Establish connection to hardware."""

    @abstractmethod
    async def configure_channels(self, channels: List[HILChannel]) -> bool:
        """Map I/O channels."""

    @abstractmethod
    async def start_stream(self, sample_rate: float) -> bool:
        """Start data acquisition."""

    @abstractmethod
    async def read_channels(self) -> HILTelemetry:
        """Read current values."""

    @abstractmethod
    async def write_setpoints(self, setpoints: Dict[str, float]) -> bool:
        """Write control outputs."""

    @abstractmethod
    def check_safety(self, values: Dict[str, float]) -> List[str]:
        """Validate safety limits."""

    @abstractmethod
    async def stop_stream(self) -> bool:
        """Stop acquisition."""

    @abstractmethod
    async def disconnect(self) -> bool:
        """Close connection."""
```

### Channel Types

```python
class HILChannel:
    name: str  # "Vin_measured"
    channel_type: str  # "analog_in", "analog_out", "digital_in", "digital_out"
    units: str = ""  # "V", "A", "°C"
    scale: float = 1.0  # Conversion factor
    offset: float = 0.0  # Bias
    safety_min: Optional[float] = None
    safety_max: Optional[float] = None
```

### Telemetry Format

```python
class HILTelemetry:
    timestamp: float  # Unix timestamp
    values: Dict[str, float]  # {"Vin": 405.2, "Iout": 12.5}
    faults: List[str] = []  # ["Overvoltage detected"]
```

## Mock HIL (Demo)

Simulated hardware for testing without real equipment.

### Features

- Random walk voltage/current with realistic noise
- Configurable fault injection
- Adjustable sample rate (up to 10kHz)

### Connection

```python
# Via API
config = {
    "adapter_type": "mock",
    "config": {
        "noise_level": 0.02,  # 2% noise
        "fault_probability": 0.001  # 0.1% chance per sample
    },
    "session_id": "demo_session_1"
}

response = requests.post(
    f"{API_URL}/sim/hil/connect",
    json=config
)
```

### Channel Configuration

```python
channels = [
    {
        "name": "Vin_measured",
        "channel_type": "analog_in",
        "units": "V",
        "scale": 1.0,
        "safety_min": 300,
        "safety_max": 500
    },
    {
        "name": "Iout_measured",
        "channel_type": "analog_in",
        "units": "A",
        "scale": 1.0,
        "safety_max": 50
    },
    {
        "name": "Phi_setpoint",
        "channel_type": "analog_out",
        "units": "rad",
        "scale": 1.0
    },
    {
        "name": "Enable",
        "channel_type": "digital_out"
    }
]

requests.post(
    f"{API_URL}/sim/hil/configure",
    json={"session_id": "demo_session_1", "channels": channels}
)
```

### Telemetry Example

```json
{
  "timestamp": 1697472000.123,
  "values": {
    "Vin_measured": 402.5,
    "Iout_measured": 12.3,
    "Phi_setpoint": 0.25,
    "Enable": 1.0
  },
  "faults": []
}
```

## Modbus TCP

Industry-standard protocol for PLCs, RTUs, and industrial controllers.

### Prerequisites

- Modbus TCP server running on target device
- Network connectivity to device
- Register map documentation

### Connection

```python
config = {
    "adapter_type": "modbus_tcp",
    "config": {
        "host": "192.168.1.100",
        "port": 502,
        "unit_id": 1,
        "timeout": 3.0
    },
    "session_id": "plc_session_1"
}
```

### Register Mapping

Map Modbus registers to channels:

```python
channels = [
    {
        "name": "Vin_measured",
        "channel_type": "analog_in",
        "modbus_register": 40001,  # Holding register
        "modbus_type": "holding",
        "scale": 0.1,  # Raw value * 0.1 = Volts
        "units": "V"
    },
    {
        "name": "Enable",
        "channel_type": "digital_out",
        "modbus_register": 1,  # Coil
        "modbus_type": "coil"
    }
]
```

### Example: Allen-Bradley PLC

```
Register Map:
  40001-40010: Analog inputs (voltage/current, 0-65535 raw)
  40101-40110: Analog outputs (setpoints)
  1-16: Digital outputs (coils)
  10001-10016: Digital inputs (discrete inputs)
```

### Python Direct Access

```python
from pymodbus.client import ModbusTcpClient

client = ModbusTcpClient('192.168.1.100', port=502)
client.connect()

# Read holding register
result = client.read_holding_registers(40001, count=1, unit=1)
vin_raw = result.registers[0]
vin = vin_raw * 0.1  # Apply scaling

# Write coil
client.write_coil(1, True, unit=1)

client.close()
```

## OPC UA

Unified Architecture for industrial IoT and SCADA systems.

### Prerequisites

- OPC UA server endpoint
- Security policy (None, Basic256, etc.)
- Authentication credentials (if required)

### Connection

```python
config = {
    "adapter_type": "opcua",
    "config": {
        "endpoint": "opc.tcp://192.168.1.100:4840",
        "security_policy": "None",
        "username": "admin",
        "password": "password123"
    },
    "session_id": "opcua_session_1"
}
```

### Node Mapping

Map OPC UA node IDs to channels:

```python
channels = [
    {
        "name": "Vin_measured",
        "channel_type": "analog_in",
        "node_id": "ns=2;s=Device1.Voltage",
        "units": "V"
    },
    {
        "name": "Phi_setpoint",
        "channel_type": "analog_out",
        "node_id": "ns=2;s=Device1.PhaseShift"
    }
]
```

### Browsing Nodes

Use OPC UA client to explore server:

```bash
# Install opcua-client
pip install opcua

# Browse nodes
python -c "
from opcua import Client
client = Client('opc.tcp://192.168.1.100:4840')
client.connect()
root = client.get_root_node()
print(root.get_children())
client.disconnect()
"
```

### Example: Siemens S7 PLC

```
Server: opc.tcp://192.168.1.100:4840
Namespace: ns=3 (PLC_1)
Nodes:
  ns=3;s=PLC_1.DB1.Voltage_Input
  ns=3;s=PLC_1.DB1.Current_Output
  ns=3;s=PLC_1.M0.0 (Enable bit)
```

## UDP Streaming

High-speed custom protocol for telemetry streaming.

### Use Cases

- Real-time oscilloscope data
- FPGA telemetry at >10kHz
- Custom embedded systems

### Connection

```python
config = {
    "adapter_type": "udp",
    "config": {
        "host": "192.168.1.100",
        "port": 5000,
        "packet_format": "binary",  # or "json"
        "byte_order": "little"  # or "big"
    },
    "session_id": "udp_session_1"
}
```

### Binary Packet Format

```c
// Example C struct (32 bytes)
struct TelemetryPacket {
    uint32_t timestamp_ms;  // 4 bytes
    float vin;              // 4 bytes
    float vout;             // 4 bytes
    float iin;              // 4 bytes
    float iout;             // 4 bytes
    float temperature;      // 4 bytes
    uint16_t status;        // 2 bytes
    uint16_t crc;           // 2 bytes
};
```

Python decoder:

```python
import struct

def decode_packet(data: bytes) -> dict:
    timestamp, vin, vout, iin, iout, temp, status, crc = struct.unpack(
        '<IfffffHH',  # Little-endian: I=uint32, f=float, H=uint16
        data
    )
    return {
        "timestamp": timestamp / 1000.0,
        "Vin": vin,
        "Vout": vout,
        "Iin": iin,
        "Iout": iout,
        "Temperature": temp,
        "status": status
    }
```

### JSON Packet Format

```json
{
  "timestamp": 1697472000123,
  "vin": 402.5,
  "vout": 805.1,
  "iin": 25.3,
  "iout": 12.5,
  "temperature": 75.2
}
```

## NI cRIO (gRPC)

National Instruments CompactRIO real-time systems.

### Prerequisites

- NI cRIO with LabVIEW Real-Time
- gRPC server running on cRIO
- Network connectivity

### gRPC Server (LabVIEW)

Implement gRPC service on cRIO:

```protobuf
// hil_service.proto
syntax = "proto3";

service HILService {
  rpc Connect(ConnectRequest) returns (ConnectResponse);
  rpc ReadChannels(ReadRequest) returns (TelemetryResponse);
  rpc WriteSetpoints(WriteRequest) returns (WriteResponse);
  rpc Disconnect(DisconnectRequest) returns (DisconnectResponse);
}

message TelemetryResponse {
  double timestamp = 1;
  map<string, double> values = 2;
  repeated string faults = 3;
}
```

### Connection

```python
config = {
    "adapter_type": "ni_crio",
    "config": {
        "grpc_host": "192.168.1.100",
        "grpc_port": 50051,
        "use_tls": false
    },
    "session_id": "crio_session_1"
}
```

### Channel Mapping

cRIO modules map to channels:

```
NI 9205 (Analog Input):
  AI0 -> Vin_measured
  AI1 -> Vout_measured
  AI2 -> Temperature

NI 9263 (Analog Output):
  AO0 -> Phi_setpoint
  AO1 -> Duty_setpoint

NI 9401 (Digital I/O):
  DIO0 -> Enable
  DIO1 -> Fault_reset
```

### Example Python Client

```python
import grpc
import hil_service_pb2
import hil_service_pb2_grpc

channel = grpc.insecure_channel('192.168.1.100:50051')
stub = hil_service_pb2_grpc.HILServiceStub(channel)

# Connect
response = stub.Connect(hil_service_pb2.ConnectRequest())

# Read telemetry
telemetry = stub.ReadChannels(hil_service_pb2.ReadRequest())
print(f"Vin: {telemetry.values['Vin']}")

# Write setpoint
stub.WriteSetpoints(hil_service_pb2.WriteRequest(
    setpoints={"Phi": 0.25, "Enable": 1.0}
))
```

## Safety Features

### Safety Limits

Channels can have safety limits:

```python
{
    "name": "Vin",
    "safety_min": 300,
    "safety_max": 500
}
```

If violated, adapter refuses to write and returns fault.

### Safety Checks

```python
def check_safety(self, setpoints):
    warnings = []
    for name, value in setpoints.items():
        channel = self.channels[name]
        if channel.safety_min and value < channel.safety_min:
            warnings.append(f"{name} below minimum: {value} < {channel.safety_min}")
        if channel.safety_max and value > channel.safety_max:
            warnings.append(f"{name} above maximum: {value} > {channel.safety_max}")
    return warnings
```

### Emergency Stop

All adapters support immediate stop:

```python
requests.post(f"{API_URL}/sim/hil/stop", json={"session_id": "demo_session_1"})
```

## Telemetry Logging

### Export CSV

Download telemetry history:

```python
# Frontend: Click "Export CSV"
# Generates: telemetry_session_1_20241012.csv

timestamp,Vin,Iout,Temperature,Enable
1697472000.123,402.5,12.3,75.2,1
1697472000.124,402.6,12.4,75.3,1
...
```

### Database Storage

Telemetry is stored in PostgreSQL (compressed):

```sql
CREATE TABLE hil_telemetry (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100),
    timestamp DOUBLE PRECISION,
    values JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Query last 100 samples
SELECT timestamp, values->>'Vin' AS vin
FROM hil_telemetry
WHERE session_id = 'demo_session_1'
ORDER BY timestamp DESC
LIMIT 100;
```

### Real-Time WebSocket

Subscribe to live updates:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws?token=YOUR_JWT');

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'hil_telemetry') {
    console.log('Telemetry:', msg.telemetry);
    // Update charts
  }
};
```

## Troubleshooting

### Connection Issues

**Problem**: `Failed to connect to HIL hardware`

**Solutions**:
- Verify network connectivity: `ping 192.168.1.100`
- Check firewall rules
- Confirm port is correct (Modbus: 502, OPC UA: 4840)
- Test with native client first

### Data Not Updating

**Problem**: Telemetry values frozen

**Solutions**:
- Check sample rate configuration
- Verify hardware is running
- Look for faults in telemetry response
- Restart streaming

### Safety Violations

**Problem**: `Setpoint write refused: safety violation`

**Solutions**:
- Check safety_min/max settings
- Verify units and scaling
- Adjust limits if appropriate for application

## Best Practices

1. **Always define safety limits** on critical channels
2. **Test with Mock HIL** before connecting real hardware
3. **Use WebSocket** for real-time monitoring
4. **Log all telemetry** for post-analysis
5. **Implement emergency stop** in UI
6. **Validate register maps** with hardware vendor
7. **Use secured connections** (TLS/SSL) in production

## References

- Modbus Protocol Specification v1.1b3
- OPC UA Specification Parts 1-14
- NI CompactRIO User Manual
- IEEE 1588 (Precision Time Protocol)

---

**Version**: 1.0.0
**Last Updated**: October 2024

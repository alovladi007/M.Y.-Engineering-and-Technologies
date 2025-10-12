# Power Platform - Cloud-Native Power Electronics Simulation

## Overview

Power Platform is a complete, production-ready cloud-native platform for designing and simulating power electronic converters. Built for engineers working on EV charging, renewable energy, motor drives, and data center power systems.

## Key Features

### ✅ **Fully Implemented**

1. **SST/DAB Native Support**
   - Single-phase DAB with full analytical model
   - Three-phase DAB for higher power applications
   - SST with MMC and CHB (interface stubs for future implementation)
   - Extensible topology registry

2. **Real-time ZVS Analysis**
   - Zero-voltage switching condition checking
   - Operating region mapping (phase shift vs. load)
   - Optimization for maximum ZVS coverage
   - Interactive heatmaps

3. **SiC/GaN Device Library**
   - 20+ real devices (Wolfspeed, Infineon, GaN Systems, etc.)
   - Temperature-dependent loss models
   - Automatic device selection and recommendation
   - CSV-based extensible database

4. **Hardware-in-the-Loop Integration**
   - Mock HIL for testing
   - Modbus TCP for PLCs
   - OPC UA interface (stub)
   - UDP streaming for high-rate data
   - NI cRIO gRPC interface (stub with documentation)

5. **Compliance Automation**
   - IEEE 1547-2018 (10 rules)
   - UL 1741 SA (10 rules)
   - IEC 61000-3-2/12 (11 rules)
   - Automated pass/fail evaluation
   - PDF report generation with plots

6. **Cloud-Native Architecture**
   - FastAPI backend with async support
   - PostgreSQL database
   - Redis job queue
   - Celery workers for simulations
   - OAuth 2.0 authentication (Google/GitHub)
   - Multi-tenant organization support

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for frontend development)

### One-Command Setup

```bash
make setup
make dev
```

This will:
1. Install all dependencies
2. Start PostgreSQL, Redis, API, Worker, and Frontend
3. Run database migrations
4. Load sample device library
5. Open the platform at http://localhost:3000

### Manual Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd power-platform

# 2. Copy environment file
cp deploy/env.example .env

# 3. Configure OAuth (optional for dev)
# Edit .env and add your Google/GitHub OAuth credentials

# 4. Start services
docker-compose -f deploy/docker-compose.yml up -d

# 5. Run migrations
docker-compose exec api alembic upgrade head

# 6. Load demo data
docker-compose exec api python -m app.db.seed
```

## Architecture

```
power-platform/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # REST API routes
│   │   ├── db/          # Database models & migrations
│   │   ├── services/    # Core services
│   │   │   ├── sim/     # Simulation engine
│   │   │   ├── hil/     # HIL adapters
│   │   │   ├── compliance/  # Rules engine
│   │   │   └── reporting/   # PDF generation
│   │   └── workers/     # Celery tasks
│   └── tests/           # Unit tests
├── frontend/            # React TypeScript frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page views
│   │   └── lib/         # API client
├── deploy/              # Docker & deployment
├── data/                # Sample data
│   └── devices/         # Device library CSV
└── docs/                # Documentation
```

## Usage Examples

### 1. Run a DAB Simulation

```python
from app.services.sim.registry import TopologyRegistry

# Create DAB converter
dab = TopologyRegistry.create(
    "dab_single",
    vin=400,           # Input voltage (V)
    vout=400,          # Output voltage (V)
    power=5000,        # Power (W)
    fsw=100e3,         # Switching frequency (Hz)
    llk=10e-6,         # Leakage inductance (H)
    n=1.0,             # Turns ratio
    phi=45,            # Phase shift (degrees)
    cdc_in=100e-6,     # Input capacitance (F)
    cdc_out=100e-6,    # Output capacitance (F)
    deadtime=100e-9    # Deadtime (s)
)

# Get device parameters
from app.services.sim.devices.library import DeviceLibrary
device_lib = DeviceLibrary(csv_path="data/devices/default_devices.csv")
device_params = device_lib.get_device_params("C2M0080120D")  # Wolfspeed SiC

# Run simulation
result = dab.simulate(device_params)

print(f"Efficiency: {result.results['efficiency']:.2f}%")
print(f"THD: {result.results['thd_current']:.2f}%")
print(f"Power Factor: {result.results['power_factor']:.3f}")
```

### 2. ZVS Analysis

```python
from app.services.sim.zvs.zvs_solver import calculate_zvs_boundary
from app.services.sim.zvs.zvs_maps import generate_zvs_heatmap

# Calculate ZVS operating region
zvs_boundary = calculate_zvs_boundary(
    vin=400,
    vout=400,
    n=1.0,
    llk=10e-6,
    fsw=100e3,
    coss=120e-12,
    deadtime=100e-9
)

# Generate heatmap
heatmap = generate_zvs_heatmap(zvs_boundary, "zvs_map.json")

# Find optimal operating point
from app.services.sim.zvs.zvs_maps import recommend_operating_points
recommendations = recommend_operating_points(zvs_boundary, target_load_percent=100)

print(f"Recommended phase shift: {recommendations[0]['phi_deg']:.1f} degrees")
print(f"ZVS margin: {recommendations[0]['zvs_margin']:.1f}%")
```

### 3. Compliance Check

```python
from app.services.compliance.rules_engine import RulesEngine

# Initialize engine
engine = RulesEngine()

# Evaluate against IEEE 1547
compliance = engine.evaluate("ieee_1547", simulation_results)

print(f"Overall: {'PASSED' if compliance.overall_passed else 'FAILED'}")
print(f"Pass rate: {compliance.pass_rate:.1f}%")

# Generate PDF report
from app.services.reporting.pdf import ReportGenerator
report_gen = ReportGenerator()
report_gen.generate_compliance_report(
    compliance,
    simulation_results,
    {"project_name": "My Project"},
    "compliance_report.pdf"
)
```

### 4. HIL Testing

```python
from app.services.hil.mock_hil import MockHILAdapter
from app.services.hil.base import HILChannel

# Create mock HIL for testing
hil = MockHILAdapter({"noise_level": 0.01})

# Configure channels
channels = [
    HILChannel("V_dc", "analog_in", "V", 0, 1000, 0),
    HILChannel("I_out", "analog_in", "A", 0, 100, 1),
    HILChannel("Temp", "analog_in", "°C", 0, 150, 2),
    HILChannel("PWM_duty", "analog_out", "%", 0, 100, 3),
]

await hil.connect()
await hil.configure_channels(channels)
await hil.start_stream(sample_rate=1000)

# Set safety limits
await hil.set_safety_limits({
    "V_dc": (0, 800),
    "I_out": (0, 80),
    "Temp": (0, 125)
})

# Write setpoint
await hil.write_setpoints({"PWM_duty": 50})

# Read telemetry
telemetry = await hil.read_channels()
print(f"Voltage: {telemetry.channels['V_dc']:.1f} V")
print(f"Current: {telemetry.channels['I_out']:.1f} A")
```

## API Reference

### Authentication

```http
GET /api/auth/oauth/google       # Initiate Google OAuth
GET /api/auth/oauth/github       # Initiate GitHub OAuth
POST /api/auth/oauth/callback    # OAuth callback
GET /api/auth/me                 # Get current user
```

### Simulations

```http
GET /api/sim/topologies/list                    # List available topologies
POST /api/sim/topologies/simulate               # Create simulation
GET /api/sim/topologies/run/{run_id}           # Get results
GET /api/sim/topologies/run/{run_id}/waveforms # Get waveforms
```

### Full API documentation available at: http://localhost:8000/api/docs

## Testing

```bash
# Run all tests
make test

# Run specific test file
pytest backend/tests/test_dab.py -v

# Run with coverage
pytest --cov=app --cov-report=html
```

## Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Adding a New Topology

1. Create topology class in `backend/app/services/sim/topologies/`
2. Inherit from `BaseTopology`
3. Implement required methods
4. Register in `registry.py`

See `dab_single.py` for complete example.

## Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for:
- Environment configuration
- SSL/TLS setup
- Database backup
- Monitoring
- Scaling strategies

## License

© 2025 M.Y. Engineering and Technologies. All rights reserved.

## Support

- Documentation: https://docs.powerplatform.io
- Issues: https://github.com/your-org/power-platform/issues
- Email: support@myengineering.tech

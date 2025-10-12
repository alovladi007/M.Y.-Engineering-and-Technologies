# Power Platform User Guide

Complete guide to using the Cloud-Native Power Electronics Simulation Platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Project](#creating-your-first-project)
3. [Running a DAB Simulation](#running-a-dab-simulation)
4. [ZVS Analysis](#zvs-analysis)
5. [Compliance Checking](#compliance-checking)
6. [Hardware-in-the-Loop Testing](#hardware-in-the-loop-testing)
7. [Generating Reports](#generating-reports)

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Modern web browser (Chrome, Firefox, Edge)
- Internet connection for OAuth login

### Quick Start

```bash
cd power-platform
make setup
make dev
```

Access the platform at http://localhost:3000

### First Login

1. Navigate to http://localhost:3000
2. Click "Login with Google" or "Login with GitHub"
3. Authorize the application
4. You'll be redirected to the dashboard

## Creating Your First Project

Projects organize your simulation runs and make collaboration easier.

### Steps:

1. From the dashboard, click **"New Project"**
2. Enter project details:
   - **Name**: "EV Charger DC-DC Converter"
   - **Description**: "20kW bidirectional DAB for 400V→800V"
3. Click **"Create Project"**

You now have a project to organize your simulations.

## Running a DAB Simulation

### Single-Phase DAB

1. Navigate to your project
2. Click **"New Simulation"**
3. Select topology: **"dab_single"** (Dual Active Bridge - Single Phase)
4. Configure parameters:

```
Input Voltage (Vin): 400 V
Output Voltage (Vout): 800 V
Power: 20000 W
Switching Frequency (fsw): 100000 Hz
Leakage Inductance (Llk): 10e-6 H (10 µH)
Turns Ratio (n): 2.0
Phase Shift (φ): 0.25 (90°)
Deadtime: 200e-9 s (200 ns)
Ambient Temperature: 25 °C
```

5. **Select Device**: Choose from library (e.g., "C2M0080120D" - Wolfspeed SiC MOSFET)
6. Click **"Start Simulation"**

### Viewing Results

After simulation completes, you'll see:

- **Summary Tab**: Efficiency, power loss breakdown, thermal
- **Waveforms Tab**: Primary/secondary current, voltage waveforms
- **Losses Tab**: Conduction, switching, transformer losses
- **ZVS Tab**: Zero-voltage switching feasibility map

### Example Output:

```
Efficiency: 97.8%
Total Losses: 448 W
  - Conduction: 180 W
  - Switching: 200 W
  - Transformer: 68 W

Junction Temperature: 95.3°C
Thermal Margin: 54.7°C (36.5% of max)

ZVS Achieved: Yes (primary & secondary)
```

## ZVS Analysis

Zero-Voltage Switching analysis optimizes converter performance.

### Generate ZVS Map

1. From a completed DAB simulation, go to **"ZVS Analysis"** tab
2. Click **"Generate ZVS Map"**
3. Configure ranges:
   - Power: 1000W to 20000W
   - Phase Shift: 0 to 0.5
4. Click **"Generate"**

The heatmap shows ZVS regions:
- **Green**: Full ZVS achieved
- **Yellow**: Partial ZVS
- **Red**: Hard switching

### Optimize for ZVS

1. Click **"Optimize ZVS"**
2. Select load points to optimize: `[5000, 10000, 15000, 20000]` W
3. Review recommended φ and deadtime for each power level

Example output:
```
Power   φ_optimal   Deadtime   ZVS Margin
5000W   0.15        250ns      15%
10000W  0.20        200ns      22%
15000W  0.23        180ns      18%
20000W  0.25        200ns      12%
```

## Compliance Checking

Ensure your design meets industry standards.

### Supported Standards

- **IEEE 1547-2018**: DER interconnection (voltage/frequency ride-through, THD)
- **UL 1741 SA**: Inverter safety and anti-islanding
- **IEC 61000**: EMC limits (harmonics, flicker)

### Running Compliance Check

1. Navigate to **"Compliance"** page
2. Select a completed simulation run
3. Choose rulesets:
   - ☑ IEEE 1547
   - ☑ UL 1741
   - ☑ IEC 61000
4. Click **"Run Compliance Check"**

### Example Results:

```
IEEE 1547-2018: PASSED (10/10 rules)
  ✓ Voltage Range: 402V (limit: 380-440V, margin: 9.5%)
  ✓ Frequency Range: 60.1Hz (limit: 59.3-60.5Hz, margin: 80%)
  ✓ THD: 3.2% (limit: <5%, margin: 36%)
  ✓ Power Factor: 0.98 (limit: >0.95, margin: 3%)
  ...

UL 1741 SA: PASSED (10/10 rules)
IEC 61000-3-2: PASSED (11/11 rules)
```

## Hardware-in-the-Loop Testing

Test your converter with real or simulated hardware.

### Connect to Mock HIL (Demo)

1. Go to **"HIL"** page
2. Select adapter: **"Mock HIL"**
3. Set sample rate: 1000 Hz
4. Click **"Connect"**

### Configure Channels

Define your I/O:

```
Channel 1: Vin_measured (analog_in, scale=1.0, safety_max=500V)
Channel 2: Iout_measured (analog_in, scale=1.0, safety_max=50A)
Channel 3: Phi_setpoint (analog_out, scale=1.0)
Channel 4: Enable (digital_out)
```

### Start Streaming

1. Click **"Start Stream"**
2. Real-time telemetry appears in plots
3. Adjust setpoints:
   - Phase Shift: 0.25
   - Enable: ON
4. Monitor voltage/current

### Exporting Data

Click **"Export CSV"** to download telemetry log for analysis.

### Real Hardware Adapters

**Modbus TCP**: Connect to PLCs
```
Host: 192.168.1.100
Port: 502
```

**OPC UA**: Industrial automation
```
Endpoint: opc.tcp://192.168.1.100:4840
```

**NI cRIO**: Real-time CompactRIO systems (requires gRPC server)

## Generating Reports

Create professional PDF reports for documentation.

### Generate Compliance Report

1. From simulation run detail page
2. Go to **"Artifacts"** tab
3. Click **"Generate PDF Report"**
4. Select options:
   - ☑ Include Waveforms
   - ☑ Include ZVS Map
   - ☑ Include Compliance Results
5. Click **"Generate"**

The PDF includes:
- Executive summary
- Simulation parameters
- Results (efficiency, losses, thermal)
- Waveform plots
- ZVS feasibility map
- Compliance pass/fail table
- Traceability (user, timestamp, git commit)

### Download Report

Click **"Download PDF"** to save locally.

## Advanced Features

### Sweep Parameters

Run parametric sweeps:

```python
# Via API
sweep_params = {
  "vin": [380, 400, 420],
  "phi": [0.2, 0.25, 0.3],
  "fsw": [80000, 100000, 120000]
}
```

### Device Recommendations

Get device suggestions based on stress:

```
Voltage Stress: 500V
Current Stress: 30A
Technology: SiC

Recommendations:
1. C2M0080120D (Wolfspeed, 1200V, 36A, 80mΩ)
2. IMW120R045M1H (Infineon, 1200V, 62A, 45mΩ)
3. SCT3080KL (Rohm, 1200V, 40A, 80mΩ)
```

### Custom Device Library

Upload your own device CSV:

```csv
name,manufacturer,technology,vds_max,id_max,rds_on_25c,...
CustomSiC_1200_40,Acme,SiC,1200,40,0.075,...
```

## Troubleshooting

### Simulation Fails

- Check device ratings vs. voltage/current stress
- Verify all parameters are positive
- Ensure fsw > 0 and φ in [0, 0.5]

### ZVS Not Achieved

- Increase leakage inductance (Llk)
- Adjust phase shift (φ)
- Reduce deadtime
- Check device Coss

### Compliance Failures

- Review measured vs. limit in results table
- Adjust fsw to reduce THD
- Tune PF with reactive power control
- Check voltage/frequency regulation

## API Usage

### Python Example

```python
import requests

API_URL = "http://localhost:8000/api"
token = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {token}",
    "X-Org-Id": "1"
}

# Start simulation
response = requests.post(
    f"{API_URL}/sim/topologies/simulate",
    json={
        "project_id": 1,
        "topology": "dab_single",
        "params": {
            "vin": 400,
            "vout": 800,
            "power": 20000,
            "fsw": 100000,
            "llk": 10e-6,
            "n": 2.0,
            "phi": 0.25,
            "deadtime": 200e-9,
            "t_ambient": 25
        },
        "device_name": "C2M0080120D"
    },
    headers=headers
)

run_id = response.json()["run_id"]
print(f"Simulation started: Run ID {run_id}")
```

## Support & Resources

- **Documentation**: /docs/
- **API Docs**: http://localhost:8000/api/docs
- **GitHub**: https://github.com/your-org/power-platform
- **Issues**: Report bugs via GitHub Issues

## Next Steps

1. Explore three-phase DAB topology
2. Integrate with CI/CD for automated regression testing
3. Connect to real hardware via Modbus or OPC UA
4. Build custom compliance rulesets
5. Deploy to production with SSL/auth hardening

---

**Version**: 1.0.0
**Last Updated**: October 2024

# Compliance Automation - Technical Notes

This document explains the compliance checking system, supported standards, and how to create custom rulesets.

## Overview

The Power Platform includes automated compliance checking against major power electronics and grid interconnection standards. The rules engine evaluates simulation results and generates pass/fail reports with margins and traceability.

## Supported Standards

### IEEE 1547-2018

**Standard**: IEEE Standard for Interconnecting Distributed Energy Resources with Electric Power Systems

**Scope**: Grid interconnection requirements for DER (PV, storage, wind, etc.)

**Implemented Checks**:

1. **Voltage Range** (Normal)
   - Limit: 0.95 to 1.05 per-unit (380V to 420V for 400V nominal)
   - Measured: `results["voltage_avg"]`
   - Pass Criteria: Within range

2. **Frequency Range** (Normal)
   - Limit: 59.3 Hz to 60.5 Hz (for 60 Hz systems)
   - Measured: `results["frequency"]`
   - Pass Criteria: Within range

3. **Total Harmonic Distortion (Current)**
   - Limit: THD < 5%
   - Measured: `results["thd"]`
   - Pass Criteria: Below limit

4. **Power Factor**
   - Limit: PF ≥ 0.95 (lagging or leading)
   - Measured: `results["power_factor"]`
   - Pass Criteria: Above threshold

5. **DC Current Injection**
   - Limit: < 0.5% of rated current
   - Measured: `results.get("dc_injection", 0)`
   - Pass Criteria: Below 0.5%

6. **Voltage Ride-Through** (Low/High)
   - Checks DER stays connected during transients
   - Not fully simulated (placeholder check)

7. **Frequency Ride-Through**
   - Checks DER stays connected during freq. events
   - Not fully simulated (placeholder check)

8. **Reconnection Delay**
   - After fault, wait 60s before reconnecting
   - Behavioral check (placeholder)

9. **Anti-Islanding**
   - Detect loss of grid within 2s
   - Behavioral check (placeholder)

10. **Ramp Rate**
    - Power change rate limits
    - Not applicable to steady-state simulation

**YAML Ruleset**: `backend/app/services/compliance/rulesets/ieee_1547.yaml`

### UL 1741 SA

**Standard**: Inverters, Converters, Controllers and Interconnection System Equipment for Use with Distributed Energy Resources (Supplement A)

**Scope**: Safety certification for grid-tied inverters with advanced functions

**Implemented Checks**:

1. **Overvoltage Protection**
   - Trip if V > 110% nominal
   - Measured: `results["voltage_peak"]`

2. **Undervoltage Protection**
   - Trip if V < 88% nominal
   - Measured: `results["voltage_avg"]`

3. **Overfrequency Protection**
   - Trip if f > 60.5 Hz
   - Measured: `results["frequency"]`

4. **Underfrequency Protection**
   - Trip if f < 59.3 Hz

5. **Overcurrent Protection**
   - Trip if I > 150% rated
   - Measured: `results["current_peak"]`

6. **Thermal Protection**
   - Junction temp < max rated
   - Measured: `results["tj_junction"]`

7. **THD Limit**
   - THD < 5%

8. **Ground Fault**
   - Detect and trip on ground faults
   - Hardware-level (placeholder)

9. **Anti-Islanding**
   - Cease to energize within 2s
   - Behavioral (placeholder)

10. **Reconnect Delay**
    - Wait 5 minutes after grid restoration

**YAML Ruleset**: `backend/app/services/compliance/rulesets/ul_1741.yaml`

### IEC 61000 (EMC)

**Standard**: Electromagnetic Compatibility - Limits for harmonic current emissions

**Scope**: Harmonic limits for equipment connected to public low-voltage systems

**Implemented Checks**:

1. **THD Current**
   - Limit: < 5%

2. **Harmonic 3rd**
   - Limit: Depends on equipment class
   - Class A: 2.3% of fundamental

3. **Harmonic 5th**
   - Limit: 1.4% of fundamental

4. **Harmonic 7th**
   - Limit: 0.77% of fundamental

5. **Harmonic 9th to 39th**
   - Decreasing limits per IEC 61000-3-2

6. **Flicker (Pst/Plt)**
   - Short/long-term flicker severity
   - Placeholder (requires voltage flicker analysis)

7. **Voltage Unbalance**
   - Limit: < 2% negative sequence
   - Placeholder (three-phase analysis)

8. **Interharmonics**
   - Between integer harmonics
   - Placeholder

9. **DC Component**
   - < 0.5% of fundamental

10. **High-Frequency Emissions**
    - 2kHz to 150kHz conducted emissions
    - Requires separate EMI filter analysis

11. **Radiated Emissions**
    - Not applicable to circuit simulation

**YAML Ruleset**: `backend/app/services/compliance/rulesets/iec_61000.yaml`

## Rules Engine Architecture

### YAML Rule Format

```yaml
name: "ieee_1547"
description: "IEEE 1547-2018 DER Interconnection"
version: "2018"
rules:
  - rule_name: "voltage_range"
    description: "Voltage must be within 0.95 to 1.05 p.u."
    check_type: "range"
    metric: "voltage_avg"
    min_limit: 380.0
    max_limit: 420.0
    unit: "V"
    severity: "critical"

  - rule_name: "thd_limit"
    description: "THD must be less than 5%"
    check_type: "max"
    metric: "thd"
    max_limit: 5.0
    unit: "%"
    severity: "major"
```

### Check Types

- **`range`**: Value must be between min and max
- **`max`**: Value must be below threshold
- **`min`**: Value must be above threshold
- **`boolean`**: True/false check

### Evaluation Logic

```python
def evaluate_rule(rule, results):
    measured = results.get(rule["metric"])

    if rule["check_type"] == "range":
        passed = rule["min_limit"] <= measured <= rule["max_limit"]
        margin = min(
            measured - rule["min_limit"],
            rule["max_limit"] - measured
        )

    elif rule["check_type"] == "max":
        passed = measured <= rule["max_limit"]
        margin = rule["max_limit"] - measured

    elif rule["check_type"] == "min":
        passed = measured >= rule["min_limit"]
        margin = measured - rule["min_limit"]

    return {
        "passed": passed,
        "measured": measured,
        "limit": rule.get("min_limit") or rule.get("max_limit"),
        "margin": margin,
        "severity": rule["severity"]
    }
```

## Creating Custom Rulesets

### Example: Custom Industrial Standard

Create `backend/app/services/compliance/rulesets/custom_industrial.yaml`:

```yaml
name: "custom_industrial"
description: "Custom Industrial Application Requirements"
version: "1.0"
rules:
  - rule_name: "efficiency_target"
    description: "Efficiency must exceed 97%"
    check_type: "min"
    metric: "efficiency"
    min_limit: 97.0
    unit: "%"
    severity: "major"

  - rule_name: "junction_temp_margin"
    description: "Junction temp must be <80% of max"
    check_type: "max"
    metric: "tj_junction"
    max_limit: 120.0  # 80% of 150°C Tj(max)
    unit: "°C"
    severity: "critical"

  - rule_name: "zvs_requirement"
    description: "ZVS must be achieved"
    check_type: "boolean"
    metric: "zvs_achieved"
    expected: true
    severity: "major"

  - rule_name: "power_density"
    description: "Power density > 5 kW/L"
    check_type: "min"
    metric: "power_density"
    min_limit: 5000.0
    unit: "W/L"
    severity: "minor"
```

### Using Custom Ruleset

```python
# Via API
response = requests.post(
    f"{API_URL}/compliance/check",
    json={
        "run_id": 42,
        "rulesets": ["custom_industrial", "ieee_1547"]
    },
    headers=headers
)
```

## Mapping Simulation Results to Metrics

The compliance engine expects specific keys in `run.results_json`:

```python
results_json = {
    # Electrical
    "voltage_avg": 405.0,       # Average voltage (V)
    "voltage_peak": 450.0,      # Peak voltage (V)
    "current_avg": 12.5,        # Average current (A)
    "current_peak": 18.3,       # Peak current (A)
    "frequency": 60.0,          # Frequency (Hz)

    # Power Quality
    "thd": 3.2,                 # Total harmonic distortion (%)
    "power_factor": 0.98,       # Power factor
    "dc_injection": 0.2,        # DC injection (%)

    # Thermal
    "tj_junction": 95.3,        # Junction temperature (°C)
    "t_ambient": 25.0,          # Ambient temperature (°C)

    # Performance
    "efficiency": 97.8,         # Efficiency (%)
    "total_loss": 448.0,        # Total losses (W)

    # ZVS
    "zvs_achieved": true,       # ZVS status (boolean)

    # Harmonics (optional)
    "harmonics": [
        {"order": 3, "magnitude": 0.5},
        {"order": 5, "magnitude": 0.3},
        ...
    ]
}
```

## PDF Report Generation

Compliance reports are generated with:

- **Header**: Standard name, version, timestamp
- **Pass/Fail Summary**: Overall result + rule count
- **Detailed Table**: Each rule with measured vs. limit, margin, status
- **Plots**: Waveforms, ZVS maps (if available)
- **Traceability**: Run ID, user, git commit, simulation params
- **Signature Block**: For certification documentation

Example API call:

```python
response = requests.post(
    f"{API_URL}/reports/generate",
    json={
        "run_id": 42,
        "compliance_report_ids": [15, 16, 17],
        "include_waveforms": true,
        "include_zvs_map": true
    }
)

pdf_url = response.json()["download_url"]
```

## Limitations & Placeholders

Some checks require dynamic/transient simulation or hardware testing:

1. **Voltage/Frequency Ride-Through**: Requires fault injection and transient response
2. **Anti-Islanding**: Requires grid disconnect detection logic
3. **Ground Fault**: Hardware-level protection
4. **Flicker**: Requires voltage variation over time
5. **Radiated Emissions**: Requires EMI chamber testing

These are marked as **placeholder** in the YAML and always pass with a note.

## Future Enhancements

- Transient simulation for ride-through
- EMI filter design and conducted emissions
- Three-phase unbalance analysis
- Real-time compliance monitoring (HIL)
- Automatic ruleset updates from standards bodies
- Multi-standard combined reports (e.g., UL + IEEE)

## References

- IEEE Std 1547-2018
- UL 1741 Supplement A (2016)
- IEC 61000-3-2 (2018)
- IEC 61000-3-12 (2011)
- IEEE 519-2014 (Harmonic Control)

---

**Version**: 1.0.0
**Last Updated**: October 2024

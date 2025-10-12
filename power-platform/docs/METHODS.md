# Technical Methods and Equations

## Power Transfer Calculations

### Dual Active Bridge (DAB)

The DAB converter transfers power through phase-shift modulation. The instantaneous power transfer is governed by:

**Power Transfer Equation:**
```
P = (n·Vin·Vout)/(ω·Llk) · φ·(1 - φ/π)
```

Where:
- `n` = transformer turns ratio (Np/Ns)
- `Vin` = input voltage
- `Vout` = output voltage
- `ω = 2πf` = angular switching frequency
- `Llk` = leakage inductance (referred to primary)
- `φ` = phase shift angle (radians, 0 to π)

**Maximum Power:**
```
Pmax occurs at φ = π/2
Pmax = (n·Vin·Vout)/(4·ω·Llk)
```

### RMS Current Calculation

Primary RMS current approximation for DAB:

```
Irms = (Vin/ω·Llk) · √[φ/3 - φ²/(2π) + φ³/(3π²)]
```

For accurate RMS, numerical integration of the trapezoidal current waveform is used.

## Loss Calculations

### Conduction Losses

**MOSFET/SiC Conduction Loss:**
```
Pcond = Irms² · Rds(on)(Tj) · D
```

Where:
- `Rds(on)(Tj)` = on-resistance at junction temperature
- `D` = duty cycle

**Temperature Dependence:**
```
Rds(on)(Tj) = Rds(on)(25°C) · [1 + α·(Tj - 25)]
```

Typical α = 0.006/°C for SiC, 0.008/°C for Si

### Switching Losses

**Turn-on and Turn-off Energy:**
```
Psw = (Eon + Eoff) · fsw
```

Where energies scale with voltage and current:
```
Eon(V,I) = Eon(Vnom,Inom) · (V/Vnom) · (I/Inom)
Eoff(V,I) = Eoff(Vnom,Inom) · (V/Vnom) · (I/Inom)
```

**Gate Drive Loss:**
```
Pgate = Qg · Vgs · fsw
```

### ZVS Loss Reduction

With zero-voltage switching achieved:
```
Psw,ZVS ≈ 0.3 · Psw,hard
```

ZVS eliminates turn-on losses (typically 60-70% of total switching loss).

## Zero-Voltage Switching (ZVS)

### ZVS Condition

ZVS is achieved when energy stored in leakage inductance exceeds energy required to discharge output capacitance:

```
½·Llk·Illk² ≥ ½·Coss·V²
```

**Minimum Current for ZVS:**
```
Illk,min = V·√(Coss/Llk)
```

### ZVS Boundary

The ZVS boundary depends on:
1. Phase shift φ
2. Load current
3. Deadtime duration
4. Device output capacitance Coss

Operating points are classified:
- **Full ZVS**: Energy margin > 20%
- **Partial ZVS**: Energy margin 0-20%
- **Hard Switching**: Energy margin < 0%

## Thermal Analysis

### Junction Temperature

Using thermal resistance network:

```
Tj = Ta + Ploss·(RθJC + RθCA)
```

Where:
- `Ta` = ambient temperature
- `RθJC` = junction-to-case thermal resistance
- `RθCA` = case-to-ambient thermal resistance (heatsink)

### Iterative Thermal-Electrical Solution

Since Rds(on) depends on Tj, and Tj depends on losses, iteration is required:

```
1. Assume Tj = 100°C
2. Calculate Rds(on)(Tj)
3. Calculate Ploss
4. Calculate new Tj
5. Repeat until |Tj,new - Tj,old| < tolerance
```

Typically converges in 3-5 iterations.

## Magnetic Component Design

### Transformer Core Loss (Steinmetz Equation)

```
Pcore = k · f^α · Bmax^β · Vcore
```

Typical ferrite parameters (3C95 at 100kHz):
- k = 0.0001
- α = 1.6
- β = 2.6

### Flux Density

From Faraday's law:

```
Bmax = Vpeak/(4.44 · f · N · Ae)
```

Where:
- `Vpeak` = peak voltage
- `f` = frequency
- `N` = number of turns
- `Ae` = core effective area

### Copper Loss

**DC Resistance:**
```
Rdc = ρ·lw/Aw
```

**AC Resistance (with skin effect):**
```
Rac = Rdc · Fr
```

Where `Fr` is frequency-dependent resistance factor (typically 1.2-2.0 at 100kHz).

**Copper Loss:**
```
Pcu = Irms² · Rac
```

### Leakage Inductance

Simplified estimation:

```
Llk ≈ μ0 · Npri² · MLT · dwinding / hwinding
```

Where:
- `MLT` = mean length per turn
- `dwinding` = winding separation
- `hwinding` = window height

## Harmonic Analysis (FFT)

### Total Harmonic Distortion (THD)

```
THD = √(Σ(Ih²)) / I1
```

Where:
- `Ih` = harmonic current magnitude (h = 2,3,4,...)
- `I1` = fundamental current

**Percentage:**
```
THD% = THD × 100
```

### Power Factor

**Displacement Power Factor:**
```
DPF = cos(θ1)
```

Where `θ1` = phase angle of fundamental

**True Power Factor:**
```
PF = (P_real)/(Vrms·Irms) = DPF/√(1 + THD²)
```

## Compliance Standards

### IEEE 1547-2018 Voltage Ranges

| Condition | Min (%) | Max (%) | Time |
|-----------|---------|---------|------|
| Normal | 88 | 110 | Continuous |
| Short Duration | 50 | 120 | 1 sec |

### IEEE 1547 Harmonic Limits

| Harmonic | Limit (% of fundamental) |
|----------|--------------------------|
| 3rd | 4.0% |
| 5th | 4.0% |
| 7th | 4.0% |
| 9th | 1.5% |
| 11th | 1.5% |
| THD | 5.0% |

### UL 1741 Anti-Islanding

Inverter must cease to energize within **2 seconds** of island detection.

### IEC 61000-3-2 (Class A Equipment)

| Harmonic | Max Current (A) |
|----------|-----------------|
| 3rd | 2.30 |
| 5th | 1.14 |
| 7th | 0.77 |
| 9th | 0.40 |
| 11th | 0.33 |

## References

1. IEEE Std 1547-2018: "Standard for Interconnection and Interoperability of Distributed Energy Resources"

2. Kheraluwala, M. et al., "Characteristics of Load Resonant Converters with Capacitive Output Filter," IEEE Trans. Power Electronics, 1991

3. De Doncker, R., "The Auxiliary Resonant Commutated Pole Converter," IEEE IAS Annual Meeting, 1990

4. Steinmetz, C.P., "On the Law of Hysteresis," AIEE Trans., 1892

5. UL 1741 SA: "Inverters, Converters, Controllers and Interconnection System Equipment for Use With Distributed Energy Resources"

6. IEC 61000-3-2: "Electromagnetic compatibility - Limits for harmonic current emissions"

7. Wolfspeed Application Notes: "Calculating Power Loss in SiC MOSFETs"

8. Infineon: "SiC MOSFET Gate Drive Optimization"

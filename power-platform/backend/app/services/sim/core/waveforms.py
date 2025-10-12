"""Waveform generation and analysis."""
import numpy as np
from typing import Dict, List, Tuple
from dataclasses import dataclass


@dataclass
class WaveformResult:
    """Waveform analysis result."""
    time: np.ndarray
    voltage: np.ndarray
    current: np.ndarray
    i_rms: float
    i_peak: float
    i_avg: float
    v_rms: float
    v_peak: float


def generate_dab_waveforms(
    vin: float,
    vout: float,
    n: float,
    llk: float,
    fsw: float,
    phi: float,
    duty: float = 0.5,
    points_per_cycle: int = 1000
) -> WaveformResult:
    """
    Generate DAB primary current waveform.

    Args:
        vin: Input voltage (V)
        vout: Output voltage (V)
        n: Transformer turns ratio
        llk: Leakage inductance (H)
        fsw: Switching frequency (Hz)
        phi: Phase shift (radians)
        duty: Duty cycle
        points_per_cycle: Number of points per switching cycle

    Returns:
        WaveformResult with time and current arrays
    """
    T = 1 / fsw
    t = np.linspace(0, T, points_per_cycle)
    omega = 2 * np.pi * fsw

    # DAB current waveform (simplified trapezoidal approximation)
    current = np.zeros_like(t)
    voltage = np.zeros_like(t)

    # Phase shift energy transfer
    vref = n * vout
    d_phi = phi / (2 * np.pi)

    for i, ti in enumerate(t):
        phase = omega * ti
        norm_phase = phase / (2 * np.pi)

        # Primary voltage (square wave)
        if norm_phase < duty:
            v_pri = vin
        else:
            v_pri = -vin

        # Secondary voltage reflected (with phase shift)
        phase_shifted = (phase - phi) % (2 * np.pi)
        norm_shifted = phase_shifted / (2 * np.pi)

        if norm_shifted < duty:
            v_sec = vref
        else:
            v_sec = -vref

        voltage[i] = v_pri

        # Current from voltage difference across leakage inductance
        # Simplified: linear ramps between switching events
        v_diff = v_pri - v_sec

        # Integrate di/dt = v_diff / Llk
        if i == 0:
            current[i] = 0
        else:
            dt = t[i] - t[i-1]
            di = v_diff * dt / llk
            current[i] = current[i-1] + di

    # Remove DC component
    current = current - np.mean(current)

    # Calculate RMS and peak
    i_rms = np.sqrt(np.mean(current**2))
    i_peak = np.max(np.abs(current))
    i_avg = np.mean(np.abs(current))

    v_rms = np.sqrt(np.mean(voltage**2))
    v_peak = np.max(np.abs(voltage))

    return WaveformResult(
        time=t,
        voltage=voltage,
        current=current,
        i_rms=i_rms,
        i_peak=i_peak,
        i_avg=i_avg,
        v_rms=v_rms,
        v_peak=v_peak
    )


def calculate_power_transfer(
    vin: float,
    vout: float,
    n: float,
    llk: float,
    fsw: float,
    phi: float
) -> float:
    """
    Calculate DAB power transfer using simplified equation.

    P = (n * Vin * Vout / (omega * Llk)) * phi * (1 - phi/(pi))

    Args:
        vin: Input voltage
        vout: Output voltage
        n: Turns ratio
        llk: Leakage inductance
        fsw: Switching frequency
        phi: Phase shift (radians, 0 to pi)

    Returns:
        Power transfer (W)
    """
    omega = 2 * np.pi * fsw

    # Clamp phi to valid range
    phi = np.clip(phi, 0, np.pi)

    # Power transfer equation
    power = (n * vin * vout) / (omega * llk) * phi * (1 - phi / np.pi)

    return max(0, power)


def calculate_rms_current(
    vin: float,
    vout: float,
    n: float,
    llk: float,
    fsw: float,
    phi: float,
    power: float
) -> Tuple[float, float]:
    """
    Calculate RMS currents (primary and secondary).

    Args:
        vin: Input voltage
        vout: Output voltage
        n: Turns ratio
        llk: Leakage inductance
        fsw: Switching frequency
        phi: Phase shift
        power: Transferred power

    Returns:
        Tuple of (primary_rms, secondary_rms)
    """
    # Generate waveform for accurate RMS
    wf = generate_dab_waveforms(vin, vout, n, llk, fsw, phi)

    i_pri_rms = wf.i_rms
    i_sec_rms = i_pri_rms / n  # Reflected through transformer

    return i_pri_rms, i_sec_rms


def calculate_capacitor_ripple(
    power: float,
    vdc: float,
    fsw: float,
    cap: float
) -> Dict[str, float]:
    """
    Calculate capacitor voltage ripple.

    Args:
        power: Power (W)
        vdc: DC voltage (V)
        fsw: Switching frequency (Hz)
        cap: Capacitance (F)

    Returns:
        Dictionary with ripple voltage and ripple current
    """
    idc = power / vdc
    t_half = 1 / (2 * fsw)

    # Ripple current (triangular approximation)
    i_ripple = idc * 0.1  # Assume 10% ripple current

    # Ripple voltage: dV = I * dt / C
    v_ripple = i_ripple * t_half / cap

    return {
        "v_ripple": v_ripple,
        "v_ripple_percent": (v_ripple / vdc) * 100,
        "i_ripple": i_ripple,
        "i_ripple_rms": i_ripple / np.sqrt(3)  # Triangular wave
    }

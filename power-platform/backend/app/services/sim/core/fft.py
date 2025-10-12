"""FFT analysis for harmonic content."""
import numpy as np
from typing import Dict, List
from dataclasses import dataclass


@dataclass
class FFTResult:
    """FFT analysis result."""
    frequencies: np.ndarray
    magnitudes: np.ndarray
    phases: np.ndarray
    thd: float
    thd_percent: float
    fundamental_freq: float
    fundamental_mag: float
    harmonics: Dict[int, float]  # harmonic number -> magnitude


def perform_fft(
    signal: np.ndarray,
    sample_rate: float,
    fundamental_freq: float
) -> FFTResult:
    """
    Perform FFT analysis on signal.

    Args:
        signal: Time-domain signal
        sample_rate: Sampling rate (Hz)
        fundamental_freq: Expected fundamental frequency (Hz)

    Returns:
        FFTResult with harmonic analysis
    """
    n = len(signal)

    # Perform FFT
    fft_vals = np.fft.rfft(signal)
    fft_freqs = np.fft.rfftfreq(n, 1/sample_rate)
    fft_mag = np.abs(fft_vals) * 2 / n
    fft_phase = np.angle(fft_vals)

    # Find fundamental frequency bin
    fund_idx = np.argmin(np.abs(fft_freqs - fundamental_freq))
    fund_mag = fft_mag[fund_idx]

    # Extract harmonics (up to 50th harmonic)
    harmonics = {}
    harmonic_powers = []

    for h in range(2, 51):
        h_freq = h * fundamental_freq
        h_idx = np.argmin(np.abs(fft_freqs - h_freq))

        if h_idx < len(fft_mag):
            h_mag = fft_mag[h_idx]
            harmonics[h] = h_mag
            harmonic_powers.append(h_mag**2)

    # Calculate THD
    if fund_mag > 0:
        thd = np.sqrt(sum(harmonic_powers)) / fund_mag
        thd_percent = thd * 100
    else:
        thd = 0
        thd_percent = 0

    return FFTResult(
        frequencies=fft_freqs,
        magnitudes=fft_mag,
        phases=fft_phase,
        thd=thd,
        thd_percent=thd_percent,
        fundamental_freq=fundamental_freq,
        fundamental_mag=fund_mag,
        harmonics=harmonics
    )


def calculate_thd(
    current: np.ndarray,
    voltage: np.ndarray,
    fsw: float
) -> Dict[str, any]:
    """
    Calculate Total Harmonic Distortion for current and voltage.

    Args:
        current: Current waveform
        voltage: Voltage waveform
        fsw: Fundamental frequency (switching frequency)

    Returns:
        Dictionary with THD analysis
    """
    # Sample rate from waveform
    n_points = len(current)
    sample_rate = fsw * n_points

    # Analyze current
    i_fft = perform_fft(current, sample_rate, fsw)

    # Analyze voltage
    v_fft = perform_fft(voltage, sample_rate, fsw)

    return {
        "current_thd": i_fft.thd_percent,
        "voltage_thd": v_fft.thd_percent,
        "current_fundamental": i_fft.fundamental_mag,
        "voltage_fundamental": v_fft.fundamental_mag,
        "current_harmonics": i_fft.harmonics,
        "voltage_harmonics": v_fft.harmonics,
        "current_fft": i_fft,
        "voltage_fft": v_fft
    }


def calculate_power_factor(
    voltage: np.ndarray,
    current: np.ndarray,
    fsw: float
) -> Dict[str, float]:
    """
    Calculate power factor and related metrics.

    Args:
        voltage: Voltage waveform
        current: Current waveform
        fsw: Fundamental frequency

    Returns:
        Dictionary with PF, DPF, distortion factor
    """
    # Real power (average of v*i)
    p_real = np.mean(voltage * current)

    # Apparent power (Vrms * Irms)
    v_rms = np.sqrt(np.mean(voltage**2))
    i_rms = np.sqrt(np.mean(current**2))
    p_apparent = v_rms * i_rms

    # Power factor
    if p_apparent > 0:
        pf = p_real / p_apparent
    else:
        pf = 0

    # FFT for displacement power factor
    n_points = len(voltage)
    sample_rate = fsw * n_points

    v_fft = perform_fft(voltage, sample_rate, fsw)
    i_fft = perform_fft(current, sample_rate, fsw)

    # Displacement power factor (phase angle between fundamental components)
    phase_diff = v_fft.phases[0] - i_fft.phases[0]
    dpf = np.cos(phase_diff)

    # Distortion factor
    if dpf != 0:
        distortion_factor = pf / dpf
    else:
        distortion_factor = 0

    return {
        "power_factor": pf,
        "displacement_pf": dpf,
        "distortion_factor": distortion_factor,
        "real_power": p_real,
        "apparent_power": p_apparent,
        "reactive_power": np.sqrt(p_apparent**2 - p_real**2) if p_apparent > abs(p_real) else 0
    }

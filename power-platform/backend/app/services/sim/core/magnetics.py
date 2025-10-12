"""Magnetic component modeling - transformers and inductors."""
import numpy as np
from typing import Dict, Tuple
from dataclasses import dataclass


@dataclass
class TransformerResult:
    """Transformer analysis result."""
    core_loss: float
    copper_loss: float
    total_loss: float
    efficiency: float
    flux_density: float
    temperature_rise: float


def calculate_core_loss_steinmetz(
    freq: float,
    bmax: float,
    volume: float,
    k: float = 0.0001,
    alpha: float = 1.6,
    beta: float = 2.6
) -> float:
    """
    Calculate core loss using Steinmetz equation.

    P_core = k * f^alpha * B^beta * Volume

    Args:
        freq: Frequency (Hz)
        bmax: Peak flux density (T)
        volume: Core volume (m³)
        k: Steinmetz coefficient (material dependent)
        alpha: Frequency exponent (typically 1.5-2.0)
        beta: Flux density exponent (typically 2.5-3.0)

    Returns:
        Core loss (W)
    """
    # Steinmetz equation
    p_v = k * (freq ** alpha) * (bmax ** beta)  # W/m³
    p_core = p_v * volume

    return p_core


def calculate_flux_density(
    voltage: float,
    turns: int,
    area: float,
    freq: float
) -> float:
    """
    Calculate peak flux density in transformer core.

    V = 4.44 * f * N * A * B
    B = V / (4.44 * f * N * A)

    Args:
        voltage: RMS voltage (V)
        turns: Number of turns
        area: Core cross-sectional area (m²)
        freq: Frequency (Hz)

    Returns:
        Peak flux density (T)
    """
    if freq == 0 or turns == 0 or area == 0:
        return 0.0

    # Peak voltage
    v_peak = voltage * np.sqrt(2)

    # Faraday's law
    b_peak = v_peak / (4.44 * freq * turns * area)

    return abs(b_peak)


def calculate_copper_loss(
    i_rms: float,
    turns: int,
    wire_length_per_turn: float,
    wire_area: float,
    resistivity: float = 1.68e-8,
    temp_coeff: float = 0.00393,
    temp: float = 100.0
) -> Dict[str, float]:
    """
    Calculate copper (winding) losses with AC effects.

    Args:
        i_rms: RMS current (A)
        turns: Number of turns
        wire_length_per_turn: Length per turn (m)
        wire_area: Wire cross-sectional area (m²)
        resistivity: Copper resistivity at 20°C (Ω⋅m)
        temp_coeff: Temperature coefficient
        temp: Operating temperature (°C)

    Returns:
        Dictionary with DC resistance, AC resistance, and copper loss
    """
    # Total wire length
    length = turns * wire_length_per_turn

    # DC resistance at 20°C
    r_dc_20 = resistivity * length / wire_area

    # Temperature correction
    r_dc = r_dc_20 * (1 + temp_coeff * (temp - 20))

    # AC resistance factor (skin and proximity effect approximation)
    # Simplified: assume 1.5x DC resistance at high frequency
    k_ac = 1.5
    r_ac = r_dc * k_ac

    # Copper loss
    p_copper = i_rms**2 * r_ac

    return {
        "r_dc": r_dc,
        "r_ac": r_ac,
        "ac_factor": k_ac,
        "copper_loss": p_copper
    }


def calculate_leakage_inductance(
    turns_pri: int,
    turns_sec: int,
    window_height: float,
    winding_separation: float,
    core_permeability: float = 2500.0
) -> float:
    """
    Estimate leakage inductance for transformer.

    Simplified model based on winding geometry.

    Args:
        turns_pri: Primary turns
        turns_sec: Secondary turns
        window_height: Core window height (m)
        winding_separation: Distance between windings (m)
        core_permeability: Relative permeability

    Returns:
        Leakage inductance referred to primary (H)
    """
    mu0 = 4 * np.pi * 1e-7  # Permeability of free space

    # Simplified leakage calculation
    # L_leak ≈ μ0 * N² * mean_length * separation / window_height

    n_eff = (turns_pri + turns_sec) / 2
    mean_length = 0.1  # Assumed mean turn length (m)

    l_leak = mu0 * n_eff**2 * mean_length * winding_separation / window_height

    return l_leak


def analyze_transformer(
    vin: float,
    vout: float,
    power: float,
    fsw: float,
    turns_ratio: float,
    core_volume: float,
    core_area: float,
    wire_area_pri: float,
    wire_area_sec: float,
    wire_length_per_turn: float,
    temp: float = 100.0
) -> TransformerResult:
    """
    Complete transformer analysis.

    Args:
        vin: Primary voltage (V)
        vout: Secondary voltage (V)
        power: Transferred power (W)
        fsw: Switching frequency (Hz)
        turns_ratio: Turns ratio (Np/Ns)
        core_volume: Core volume (m³)
        core_area: Core cross-sectional area (m²)
        wire_area_pri: Primary wire area (m²)
        wire_area_sec: Secondary wire area (m²)
        wire_length_per_turn: Wire length per turn (m)
        temp: Operating temperature (°C)

    Returns:
        TransformerResult with losses and efficiency
    """
    # Calculate turns (assume primary)
    # V = 4.44 * f * N * A * B, target B around 0.2-0.3T
    b_target = 0.25
    turns_pri = int(vin / (4.44 * fsw * core_area * b_target))
    turns_pri = max(turns_pri, 1)
    turns_sec = int(turns_pri / turns_ratio)

    # Actual flux density
    b_peak = calculate_flux_density(vin, turns_pri, core_area, fsw)

    # Core loss (using typical ferrite parameters)
    p_core = calculate_core_loss_steinmetz(
        fsw, b_peak, core_volume,
        k=0.0001, alpha=1.6, beta=2.6
    )

    # Currents
    i_pri_rms = power / vin
    i_sec_rms = power / vout

    # Primary copper loss
    cu_pri = calculate_copper_loss(
        i_pri_rms, turns_pri, wire_length_per_turn, wire_area_pri, temp=temp
    )

    # Secondary copper loss
    cu_sec = calculate_copper_loss(
        i_sec_rms, turns_sec, wire_length_per_turn, wire_area_sec, temp=temp
    )

    p_copper = cu_pri["copper_loss"] + cu_sec["copper_loss"]

    # Total loss
    p_total = p_core + p_copper

    # Efficiency
    efficiency = (power / (power + p_total)) * 100 if power > 0 else 0

    # Temperature rise (simplified)
    thermal_resistance = 10.0  # °C/W (typical for medium transformer)
    temp_rise = p_total * thermal_resistance

    return TransformerResult(
        core_loss=p_core,
        copper_loss=p_copper,
        total_loss=p_total,
        efficiency=efficiency,
        flux_density=b_peak,
        temperature_rise=temp_rise
    )


def calculate_inductor_design(
    inductance: float,
    i_peak: float,
    i_rms: float,
    fsw: float,
    window_area: float = 1e-4
) -> Dict[str, any]:
    """
    Design inductor for given specifications.

    Args:
        inductance: Required inductance (H)
        i_peak: Peak current (A)
        i_rms: RMS current (A)
        fsw: Operating frequency (Hz)
        window_area: Available window area (m²)

    Returns:
        Dictionary with design parameters
    """
    # Energy storage
    energy = 0.5 * inductance * i_peak**2

    # Core size estimation (simplified)
    # Larger current and inductance need bigger core
    core_volume = (inductance * i_peak**2) / 100  # Rough estimate

    # Number of turns (simplified)
    # L = μ * N² * A / l
    # Assume typical core parameters
    al = 100e-9  # Inductance factor (H/turn²)
    turns = int(np.sqrt(inductance / al))
    turns = max(turns, 1)

    # Wire gauge
    # Current density around 5 A/mm²
    current_density = 5e6  # A/m²
    wire_area = i_rms / current_density
    wire_diameter = np.sqrt(4 * wire_area / np.pi)

    # DCR estimation
    resistivity = 1.68e-8
    mean_turn_length = 0.05  # m
    r_dc = resistivity * turns * mean_turn_length / wire_area

    # Copper loss
    p_copper = i_rms**2 * r_dc

    return {
        "turns": turns,
        "wire_diameter_mm": wire_diameter * 1000,
        "wire_area_mm2": wire_area * 1e6,
        "dcr_ohms": r_dc,
        "copper_loss_w": p_copper,
        "energy_stored_j": energy,
        "estimated_volume_cm3": core_volume * 1e6
    }

"""Thermal analysis and junction temperature calculation."""
import numpy as np
from typing import Dict
from dataclasses import dataclass


@dataclass
class ThermalResult:
    """Thermal analysis result."""
    tj_avg: float  # Average junction temperature
    tj_max: float  # Maximum junction temperature
    tj_rise: float  # Temperature rise above ambient
    case_temp: float  # Case temperature
    power_dissipation: float  # Total power dissipation
    is_safe: bool  # Whether temperature is within limits


def calculate_junction_temp(
    power_loss: float,
    rth_jc: float,
    rth_ca: float,
    t_ambient: float,
    tj_max: float = 175.0
) -> ThermalResult:
    """
    Calculate junction temperature using thermal resistance network.

    Args:
        power_loss: Power dissipation (W)
        rth_jc: Junction-to-case thermal resistance (°C/W)
        rth_ca: Case-to-ambient thermal resistance (°C/W or heatsink)
        t_ambient: Ambient temperature (°C)
        tj_max: Maximum junction temperature rating (°C)

    Returns:
        ThermalResult with temperature analysis
    """
    # Total thermal resistance
    rth_ja = rth_jc + rth_ca

    # Temperature rise
    tj_rise = power_loss * rth_ja

    # Junction temperature
    tj = t_ambient + tj_rise

    # Case temperature
    t_case = t_ambient + power_loss * rth_ca

    # Check safety margin
    is_safe = tj < (tj_max - 10)  # 10°C safety margin

    return ThermalResult(
        tj_avg=tj,
        tj_max=tj,  # Simplified: average = max for steady-state
        tj_rise=tj_rise,
        case_temp=t_case,
        power_dissipation=power_loss,
        is_safe=is_safe
    )


def calculate_rds_on_temp(
    rds_on_25c: float,
    tj: float,
    temp_coeff: float = 0.006
) -> float:
    """
    Calculate Rds(on) at junction temperature.

    Rds_on(Tj) = Rds_on(25°C) * (1 + temp_coeff * (Tj - 25))

    Args:
        rds_on_25c: Rds(on) at 25°C
        tj: Junction temperature (°C)
        temp_coeff: Temperature coefficient (per °C), typically 0.006

    Returns:
        Rds(on) at Tj
    """
    rds_on_tj = rds_on_25c * (1 + temp_coeff * (tj - 25))
    return max(rds_on_tj, rds_on_25c)


def thermal_iteration(
    i_rms: float,
    rds_on_25c: float,
    switching_loss: float,
    rth_jc: float,
    rth_ca: float,
    t_ambient: float,
    tj_max: float = 175.0,
    max_iterations: int = 10,
    tolerance: float = 0.5
) -> ThermalResult:
    """
    Iterate thermal calculation with temperature-dependent Rds(on).

    Args:
        i_rms: RMS current (A)
        rds_on_25c: Rds(on) at 25°C
        switching_loss: Switching loss (W)
        rth_jc: Junction-to-case thermal resistance
        rth_ca: Case-to-ambient thermal resistance
        t_ambient: Ambient temperature
        tj_max: Maximum junction temperature
        max_iterations: Maximum iterations
        tolerance: Temperature convergence tolerance (°C)

    Returns:
        ThermalResult with converged temperature
    """
    tj = 25.0  # Initial guess

    for _ in range(max_iterations):
        # Update Rds(on) based on current temperature
        rds_on = calculate_rds_on_temp(rds_on_25c, tj)

        # Calculate conduction loss
        conduction_loss = i_rms**2 * rds_on

        # Total loss
        total_loss = conduction_loss + switching_loss

        # Calculate new junction temperature
        result = calculate_junction_temp(
            total_loss, rth_jc, rth_ca, t_ambient, tj_max
        )

        # Check convergence
        if abs(result.tj_avg - tj) < tolerance:
            return result

        tj = result.tj_avg

    # Return last result even if not converged
    return result


def calculate_heatsink_requirement(
    power_loss: float,
    rth_jc: float,
    t_ambient: float,
    tj_max: float,
    safety_margin: float = 20.0
) -> Dict[str, float]:
    """
    Calculate required heatsink thermal resistance.

    Args:
        power_loss: Power dissipation (W)
        rth_jc: Junction-to-case thermal resistance
        t_ambient: Ambient temperature
        tj_max: Maximum junction temperature
        safety_margin: Safety margin (°C)

    Returns:
        Dictionary with heatsink requirements
    """
    # Target junction temperature
    tj_target = tj_max - safety_margin

    # Maximum allowable temperature rise
    dt_max = tj_target - t_ambient

    # Maximum allowable total thermal resistance
    rth_ja_max = dt_max / power_loss

    # Required case-to-ambient resistance
    rth_ca_required = rth_ja_max - rth_jc

    # Heatsink performance category
    if rth_ca_required < 0:
        category = "Impossible - power loss too high"
    elif rth_ca_required < 0.5:
        category = "High-performance forced air"
    elif rth_ca_required < 2.0:
        category = "Forced air cooling"
    elif rth_ca_required < 10.0:
        category = "Large heatsink with fan"
    else:
        category = "Natural convection possible"

    return {
        "rth_ca_required": rth_ca_required,
        "rth_ja_max": rth_ja_max,
        "tj_target": tj_target,
        "cooling_category": category
    }

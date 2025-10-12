"""Zero-Voltage Switching (ZVS) analysis solver."""
import numpy as np
from typing import Dict, Tuple, List
from dataclasses import dataclass


@dataclass
class ZVSCondition:
    """ZVS condition result for a single operating point."""
    zvs_achieved: bool
    zvs_primary: bool
    zvs_secondary: bool
    energy_available: float  # Energy in leakage inductance (J)
    energy_required: float  # Energy to discharge Coss (J)
    margin: float  # Safety margin (%)
    operating_point: Dict[str, float]


def check_zvs_condition(
    vin: float,
    vout: float,
    n: float,
    llk: float,
    i_llk: float,
    coss: float,
    deadtime: float
) -> ZVSCondition:
    """
    Check if ZVS condition is met.

    ZVS is achieved when energy stored in leakage inductance
    is sufficient to discharge device output capacitance during deadtime.

    Args:
        vin: Input voltage (V)
        vout: Output voltage (V)
        n: Turns ratio
        llk: Leakage inductance (H)
        i_llk: Current in leakage inductance at switching instant (A)
        coss: Output capacitance of switch (F)
        deadtime: Deadtime duration (s)

    Returns:
        ZVSCondition with analysis results
    """
    # Energy available in leakage inductance
    e_available = 0.5 * llk * i_llk**2

    # Energy required to discharge Coss from Vin to 0
    e_required_pri = 0.5 * coss * vin**2

    # Energy required for secondary (reflected)
    vout_reflected = vout * n
    e_required_sec = 0.5 * coss * vout_reflected**2

    # Check primary ZVS
    zvs_pri = e_available > e_required_pri

    # Check secondary ZVS
    zvs_sec = e_available > e_required_sec

    # Overall ZVS
    zvs_overall = zvs_pri and zvs_sec

    # Calculate margin
    if e_required_pri > 0:
        margin_pri = ((e_available - e_required_pri) / e_required_pri) * 100
    else:
        margin_pri = 100.0

    if e_required_sec > 0:
        margin_sec = ((e_available - e_required_sec) / e_required_sec) * 100
    else:
        margin_sec = 100.0

    margin = min(margin_pri, margin_sec)

    return ZVSCondition(
        zvs_achieved=zvs_overall,
        zvs_primary=zvs_pri,
        zvs_secondary=zvs_sec,
        energy_available=e_available,
        energy_required=max(e_required_pri, e_required_sec),
        margin=margin,
        operating_point={
            "vin": vin,
            "vout": vout,
            "i_llk": i_llk,
            "coss": coss,
            "deadtime": deadtime
        }
    )


def calculate_zvs_boundary(
    vin: float,
    vout: float,
    n: float,
    llk: float,
    fsw: float,
    coss: float,
    deadtime: float,
    phi_range: Tuple[float, float] = (0, np.pi),
    load_range: Tuple[float, float] = (0.1, 1.0),
    num_points: int = 50
) -> Dict[str, np.ndarray]:
    """
    Calculate ZVS boundary over operating range.

    Args:
        vin: Input voltage
        vout: Output voltage
        n: Turns ratio
        llk: Leakage inductance
        fsw: Switching frequency
        coss: Output capacitance
        deadtime: Deadtime
        phi_range: Phase shift range (radians)
        load_range: Load range (fraction of rated)
        num_points: Number of grid points

    Returns:
        Dictionary with ZVS boundary data
    """
    phi_vals = np.linspace(phi_range[0], phi_range[1], num_points)
    load_vals = np.linspace(load_range[0], load_range[1], num_points)

    zvs_grid = np.zeros((num_points, num_points))
    margin_grid = np.zeros((num_points, num_points))

    omega = 2 * np.pi * fsw

    for i, phi in enumerate(phi_vals):
        for j, load_factor in enumerate(load_vals):
            # Calculate current at switching instant
            # Simplified: I_llk ≈ (V_diff / ω*Llk) where V_diff depends on phi
            v_diff = vin - vout * n * np.cos(phi)
            i_llk = abs(v_diff / (omega * llk)) * load_factor

            # Check ZVS
            condition = check_zvs_condition(
                vin, vout, n, llk, i_llk, coss, deadtime
            )

            zvs_grid[j, i] = 1.0 if condition.zvs_achieved else 0.0
            margin_grid[j, i] = condition.margin

    return {
        "phi": phi_vals,
        "load": load_vals,
        "zvs_map": zvs_grid,
        "margin_map": margin_grid,
        "phi_deg": np.rad2deg(phi_vals),
        "load_percent": load_vals * 100
    }


def find_zvs_optimal_point(
    vin: float,
    vout: float,
    n: float,
    llk: float,
    fsw: float,
    coss: float,
    deadtime: float,
    target_power: float,
    phi_range: Tuple[float, float] = (0, np.pi)
) -> Dict[str, float]:
    """
    Find optimal phase shift for ZVS at given power level.

    Args:
        vin, vout, n, llk, fsw, coss, deadtime: Circuit parameters
        target_power: Target power transfer (W)
        phi_range: Allowable phase shift range

    Returns:
        Dictionary with optimal operating point
    """
    best_phi = None
    best_margin = -1000
    best_zvs = False

    # Search over phase shift
    phi_test = np.linspace(phi_range[0], phi_range[1], 100)

    for phi in phi_test:
        # Calculate power transfer at this phase shift
        omega = 2 * np.pi * fsw
        power = (n * vin * vout) / (omega * llk) * phi * (1 - phi / np.pi)

        # Skip if power doesn't match (with 10% tolerance)
        if abs(power - target_power) > target_power * 0.1:
            continue

        # Calculate leakage current
        v_diff = vin - vout * n * np.cos(phi)
        i_llk = abs(v_diff / (omega * llk))

        # Check ZVS
        condition = check_zvs_condition(
            vin, vout, n, llk, i_llk, coss, deadtime
        )

        # Update if better
        if condition.zvs_achieved and condition.margin > best_margin:
            best_phi = phi
            best_margin = condition.margin
            best_zvs = True

    if best_phi is None:
        # No ZVS solution found, return closest
        best_phi = np.pi / 4  # Default 45 degrees

    return {
        "phi_optimal_rad": best_phi,
        "phi_optimal_deg": np.rad2deg(best_phi),
        "zvs_achieved": best_zvs,
        "margin_percent": best_margin,
        "recommended_deadtime_ns": deadtime * 1e9,
        "note": "ZVS optimal at target power" if best_zvs else "ZVS not achievable at this power"
    }

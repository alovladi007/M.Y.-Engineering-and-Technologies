"""Power loss calculations for semiconductors."""
import numpy as np
from typing import Dict, Tuple
from dataclasses import dataclass


@dataclass
class LossResult:
    """Loss calculation result."""
    conduction_loss: float
    switching_loss: float
    total_loss: float
    efficiency: float


def calculate_conduction_loss(
    i_rms: float,
    rds_on: float,
    duty: float = 1.0
) -> float:
    """
    Calculate conduction loss.

    P_cond = I_rms^2 * Rds_on * duty

    Args:
        i_rms: RMS current (A)
        rds_on: On-resistance (Ω)
        duty: Duty cycle (0-1)

    Returns:
        Conduction loss (W)
    """
    return i_rms**2 * rds_on * duty


def calculate_switching_loss(
    vin: float,
    iload: float,
    fsw: float,
    eon: float,
    eoff: float,
    qg: float,
    vgate: float = 15.0,
    rgate: float = 10.0
) -> Dict[str, float]:
    """
    Calculate switching losses.

    Args:
        vin: DC bus voltage (V)
        iload: Load current (A)
        fsw: Switching frequency (Hz)
        eon: Turn-on energy (J) at rated conditions
        eoff: Turn-off energy (J) at rated conditions
        qg: Gate charge (C)
        vgate: Gate drive voltage (V)
        rgate: Gate resistance (Ω)

    Returns:
        Dictionary with turn-on, turn-off, and gate drive losses
    """
    # Switching energy scales with voltage and current
    # Simplified linear scaling (actual curves are more complex)
    e_on_actual = eon * (vin / 600) * (iload / 10)  # Normalized to 600V, 10A
    e_off_actual = eoff * (vin / 600) * (iload / 10)

    # Switching loss
    p_sw_on = e_on_actual * fsw
    p_sw_off = e_off_actual * fsw

    # Gate drive loss
    p_gate = qg * vgate * fsw

    return {
        "turn_on_loss": p_sw_on,
        "turn_off_loss": p_sw_off,
        "gate_drive_loss": p_gate,
        "total_switching_loss": p_sw_on + p_sw_off + p_gate
    }


def calculate_diode_loss(
    i_avg: float,
    i_rms: float,
    vf: float,
    trr: float,
    qrr: float,
    fsw: float,
    vdc: float
) -> Dict[str, float]:
    """
    Calculate diode conduction and reverse recovery losses.

    Args:
        i_avg: Average current (A)
        i_rms: RMS current (A)
        vf: Forward voltage drop (V)
        trr: Reverse recovery time (s)
        qrr: Reverse recovery charge (C)
        fsw: Switching frequency (Hz)
        vdc: DC voltage (V)

    Returns:
        Dictionary with conduction and recovery losses
    """
    # Conduction loss
    p_cond = vf * i_avg

    # Reverse recovery loss
    if trr > 0:
        irr = 2 * qrr / trr
        e_rr = 0.5 * qrr * vdc
        p_rr = e_rr * fsw
    else:
        p_rr = 0

    return {
        "conduction_loss": p_cond,
        "reverse_recovery_loss": p_rr,
        "total_diode_loss": p_cond + p_rr
    }


def calculate_device_losses(
    i_rms: float,
    i_avg: float,
    i_peak: float,
    rds_on: float,
    vin: float,
    fsw: float,
    eon: float,
    eoff: float,
    qg: float,
    vf: float = 0.0,
    trr: float = 0.0,
    qrr: float = 0.0,
    duty: float = 0.5
) -> LossResult:
    """
    Calculate total device losses (MOSFET/IGBT with body diode).

    Args:
        i_rms: RMS current
        i_avg: Average current
        i_peak: Peak current
        rds_on: On-resistance
        vin: DC voltage
        fsw: Switching frequency
        eon: Turn-on energy
        eoff: Turn-off energy
        qg: Gate charge
        vf: Diode forward voltage
        trr: Reverse recovery time
        qrr: Reverse recovery charge
        duty: Duty cycle

    Returns:
        LossResult with breakdown
    """
    # Conduction loss
    p_cond = calculate_conduction_loss(i_rms, rds_on, duty)

    # Switching loss
    sw_losses = calculate_switching_loss(vin, i_peak, fsw, eon, eoff, qg)
    p_sw = sw_losses["total_switching_loss"]

    # Diode loss (if applicable)
    if vf > 0:
        diode_losses = calculate_diode_loss(
            i_avg * (1 - duty), i_rms * np.sqrt(1 - duty),
            vf, trr, qrr, fsw, vin
        )
        p_diode = diode_losses["total_diode_loss"]
    else:
        p_diode = 0

    p_total = p_cond + p_sw + p_diode

    return LossResult(
        conduction_loss=p_cond,
        switching_loss=p_sw + p_diode,
        total_loss=p_total,
        efficiency=0.0  # Calculated later with input power
    )


def calculate_zvs_loss_reduction(
    base_loss: float,
    zvs_achieved: bool,
    partial_zvs_factor: float = 0.5
) -> Dict[str, float]:
    """
    Calculate loss reduction due to ZVS operation.

    Args:
        base_loss: Base switching loss (W)
        zvs_achieved: Whether full ZVS is achieved
        partial_zvs_factor: Reduction factor for partial ZVS (0-1)

    Returns:
        Dictionary with adjusted losses
    """
    if zvs_achieved:
        # Full ZVS: eliminate turn-on loss (typ. 60-70% of switching loss)
        adjusted_loss = base_loss * 0.3
        reduction_percent = 70.0
    elif partial_zvs_factor > 0:
        # Partial ZVS
        reduction = base_loss * (partial_zvs_factor * 0.7)
        adjusted_loss = base_loss - reduction
        reduction_percent = (reduction / base_loss) * 100
    else:
        # No ZVS
        adjusted_loss = base_loss
        reduction_percent = 0.0

    return {
        "base_loss": base_loss,
        "adjusted_loss": adjusted_loss,
        "reduction": base_loss - adjusted_loss,
        "reduction_percent": reduction_percent
    }

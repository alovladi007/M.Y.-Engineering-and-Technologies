"""Simulation core modules."""
from .waveforms import (
    generate_dab_waveforms,
    calculate_power_transfer,
    calculate_rms_current,
    calculate_capacitor_ripple,
    WaveformResult
)
from .fft import (
    perform_fft,
    calculate_thd,
    calculate_power_factor,
    FFTResult
)
from .thermal import (
    calculate_junction_temp,
    calculate_rds_on_temp,
    thermal_iteration,
    calculate_heatsink_requirement,
    ThermalResult
)
from .losses import (
    calculate_conduction_loss,
    calculate_switching_loss,
    calculate_diode_loss,
    calculate_device_losses,
    calculate_zvs_loss_reduction,
    LossResult
)
from .magnetics import (
    calculate_core_loss_steinmetz,
    calculate_flux_density,
    calculate_copper_loss,
    calculate_leakage_inductance,
    analyze_transformer,
    calculate_inductor_design,
    TransformerResult
)

__all__ = [
    "generate_dab_waveforms",
    "calculate_power_transfer",
    "calculate_rms_current",
    "calculate_capacitor_ripple",
    "WaveformResult",
    "perform_fft",
    "calculate_thd",
    "calculate_power_factor",
    "FFTResult",
    "calculate_junction_temp",
    "calculate_rds_on_temp",
    "thermal_iteration",
    "calculate_heatsink_requirement",
    "ThermalResult",
    "calculate_conduction_loss",
    "calculate_switching_loss",
    "calculate_diode_loss",
    "calculate_device_losses",
    "calculate_zvs_loss_reduction",
    "LossResult",
    "calculate_core_loss_steinmetz",
    "calculate_flux_density",
    "calculate_copper_loss",
    "calculate_leakage_inductance",
    "analyze_transformer",
    "calculate_inductor_design",
    "TransformerResult",
]

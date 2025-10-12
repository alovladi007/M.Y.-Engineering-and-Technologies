"""Three-phase Dual Active Bridge (DAB) converter."""
import numpy as np
from typing import Dict, Any
from .dab_single import DABSinglePhase
from .base import TopologyParams


class DABThreePhase(DABSinglePhase):
    """Three-phase DAB converter - higher power density variant."""

    def __init__(
        self,
        vin: float,
        vout: float,
        power: float,
        fsw: float,
        llk: float,
        n: float,
        phi: float,
        cdc_in: float,
        cdc_out: float,
        deadtime: float = 100e-9,
        t_ambient: float = 25.0
    ):
        """Initialize three-phase DAB."""
        super().__init__(
            vin, vout, power, fsw, llk, n, phi,
            cdc_in, cdc_out, deadtime, t_ambient
        )
        self.params.name = "DAB_Three_Phase"

    def calculate_steady_state(self) -> Dict[str, Any]:
        """Calculate three-phase DAB steady state."""
        # Three-phase has 3x power capability for same components
        # Power per phase
        power_per_phase = self.params.power / 3

        # Call single-phase calculation per phase
        single_phase_result = super().calculate_steady_state()

        # Scale for three phases
        result = {
            **single_phase_result,
            "power_per_phase": power_per_phase,
            "total_power": self.params.power,
            "i_pri_rms_total": single_phase_result["i_pri_rms"] * np.sqrt(3),
            "phase_count": 3,
            "advantages": [
                "Lower ripple current",
                "Higher power density",
                "Reduced capacitor requirements",
                "Better transformer utilization"
            ]
        }

        return result

    def calculate_losses(self, device_params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate losses for three-phase DAB."""
        # Get single-phase losses
        single_losses = super().calculate_losses(device_params)

        # Three-phase uses 3x the components but shares power
        # Net effect: similar losses per phase but 3x phases
        return {
            **single_losses,
            "total_loss": single_losses["total_loss"],  # Already accounts for power
            "loss_per_phase": single_losses["total_loss"] / 3,
            "topology": "Three-Phase DAB"
        }

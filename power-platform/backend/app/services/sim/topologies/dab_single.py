"""Single-phase Dual Active Bridge (DAB) converter."""
import numpy as np
from typing import Dict, Any
from .base import BaseTopology, TopologyParams, SimulationResult
from ..core.waveforms import generate_dab_waveforms, calculate_power_transfer
from ..core.losses import calculate_device_losses
from ..core.thermal import thermal_iteration
from ..core.fft import calculate_thd, calculate_power_factor
from ..core.magnetics import analyze_transformer


class DABSinglePhase(BaseTopology):
    """Single-phase DAB converter implementation."""

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
        """
        Initialize DAB converter.

        Args:
            vin: Input voltage (V)
            vout: Output voltage (V)
            power: Power rating (W)
            fsw: Switching frequency (Hz)
            llk: Leakage inductance (H)
            n: Transformer turns ratio
            phi: Phase shift (degrees)
            cdc_in: Input DC capacitance (F)
            cdc_out: Output DC capacitance (F)
            deadtime: Deadtime (s)
            t_ambient: Ambient temperature (°C)
        """
        params = TopologyParams(
            name="DAB_Single_Phase",
            vin=vin,
            vout=vout,
            power=power,
            fsw=fsw,
            t_ambient=t_ambient,
            extra={
                "llk": llk,
                "n": n,
                "phi_deg": phi,
                "phi_rad": np.deg2rad(phi),
                "cdc_in": cdc_in,
                "cdc_out": cdc_out,
                "deadtime": deadtime
            }
        )
        super().__init__(params)

        self.llk = llk
        self.n = n
        self.phi_rad = np.deg2rad(phi)
        self.phi_deg = phi
        self.cdc_in = cdc_in
        self.cdc_out = cdc_out
        self.deadtime = deadtime

    def validate_params(self) -> tuple[bool, str]:
        """Validate DAB parameters."""
        if self.params.vin <= 0:
            return False, "Input voltage must be positive"
        if self.params.vout <= 0:
            return False, "Output voltage must be positive"
        if self.params.power <= 0:
            return False, "Power must be positive"
        if self.params.fsw <= 0 or self.params.fsw > 1e6:
            return False, "Switching frequency out of range"
        if self.llk <= 0:
            return False, "Leakage inductance must be positive"
        if self.n <= 0:
            return False, "Turns ratio must be positive"
        if self.phi_deg < 0 or self.phi_deg > 180:
            return False, "Phase shift must be 0-180 degrees"

        return True, ""

    def calculate_steady_state(self) -> Dict[str, Any]:
        """Calculate steady-state operating point."""
        # Power transfer
        p_transfer = calculate_power_transfer(
            self.params.vin,
            self.params.vout,
            self.n,
            self.llk,
            self.params.fsw,
            self.phi_rad
        )

        # Generate waveforms for current analysis
        wf = generate_dab_waveforms(
            self.params.vin,
            self.params.vout,
            self.n,
            self.llk,
            self.params.fsw,
            self.phi_rad
        )

        # DC currents
        i_in_dc = self.params.power / self.params.vin
        i_out_dc = self.params.power / self.params.vout

        # Transformer analysis
        xfmr = analyze_transformer(
            vin=self.params.vin,
            vout=self.params.vout,
            power=p_transfer,
            fsw=self.params.fsw,
            turns_ratio=self.n,
            core_volume=1e-5,  # Typical small transformer
            core_area=1e-4,
            wire_area_pri=5e-6,
            wire_area_sec=5e-6,
            wire_length_per_turn=0.05
        )

        return {
            "power_transfer": p_transfer,
            "i_pri_rms": wf.i_rms,
            "i_pri_peak": wf.i_peak,
            "i_sec_rms": wf.i_rms / self.n,
            "i_in_dc": i_in_dc,
            "i_out_dc": i_out_dc,
            "transformer_loss": xfmr.total_loss,
            "transformer_efficiency": xfmr.efficiency,
            "flux_density": xfmr.flux_density,
            "operating_point": {
                "vin": self.params.vin,
                "vout": self.params.vout,
                "phi_deg": self.phi_deg,
                "fsw_khz": self.params.fsw / 1000
            }
        }

    def calculate_losses(self, device_params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate all power losses."""
        # Get steady state
        ss = self.calculate_steady_state()

        # Device parameters
        rds_on_25c = device_params.get("rds_on_25c", 0.010)
        eon = device_params.get("eon", 100e-6)
        eoff = device_params.get("eoff", 50e-6)
        qg = device_params.get("qg", 100e-9)
        rth_jc = device_params.get("rth_jc", 0.5)
        rth_ca = device_params.get("rth_ca", 2.0)

        # Primary side switches (4 switches in full bridge)
        i_pri_rms_per_switch = ss["i_pri_rms"] / np.sqrt(2)  # Split between switches

        # Calculate with thermal iteration
        pri_thermal = thermal_iteration(
            i_rms=i_pri_rms_per_switch,
            rds_on_25c=rds_on_25c,
            switching_loss=0,  # Will be calculated
            rth_jc=rth_jc,
            rth_ca=rth_ca,
            t_ambient=self.params.t_ambient
        )

        # Recalculate with actual switching loss
        sw_loss_per_switch = (eon + eoff) * self.params.fsw * ss["i_pri_peak"] / 10  # Scaled

        pri_thermal = thermal_iteration(
            i_rms=i_pri_rms_per_switch,
            rds_on_25c=rds_on_25c,
            switching_loss=sw_loss_per_switch,
            rth_jc=rth_jc,
            rth_ca=rth_ca,
            t_ambient=self.params.t_ambient
        )

        # Total for 4 primary switches
        p_pri_total = pri_thermal.power_dissipation * 4

        # Secondary side (4 switches)
        i_sec_rms_per_switch = ss["i_sec_rms"] / np.sqrt(2)

        sec_thermal = thermal_iteration(
            i_rms=i_sec_rms_per_switch,
            rds_on_25c=rds_on_25c,
            switching_loss=sw_loss_per_switch,
            rth_jc=rth_jc,
            rth_ca=rth_ca,
            t_ambient=self.params.t_ambient
        )

        p_sec_total = sec_thermal.power_dissipation * 4

        # Transformer losses
        p_transformer = ss["transformer_loss"]

        # Capacitor ESR losses (approximate)
        esr_in = 0.01  # 10 mOhm typical
        esr_out = 0.01
        p_cap_in = ss["i_in_dc"]**2 * esr_in * 0.1  # Ripple factor
        p_cap_out = ss["i_out_dc"]**2 * esr_out * 0.1

        # Total losses
        p_total = p_pri_total + p_sec_total + p_transformer + p_cap_in + p_cap_out

        return {
            "primary_switches": p_pri_total,
            "secondary_switches": p_sec_total,
            "transformer": p_transformer,
            "capacitors": p_cap_in + p_cap_out,
            "total_loss": p_total,
            "junction_temp_pri": pri_thermal.tj_avg,
            "junction_temp_sec": sec_thermal.tj_avg,
            "thermal_safe": pri_thermal.is_safe and sec_thermal.is_safe
        }

    def calculate_efficiency(self, losses: Dict[str, Any]) -> float:
        """Calculate overall efficiency."""
        p_in = self.params.power + losses["total_loss"]
        p_out = self.params.power

        efficiency = (p_out / p_in) * 100 if p_in > 0 else 0
        return efficiency

    def generate_waveforms(self) -> Dict[str, Any]:
        """Generate voltage and current waveforms."""
        # Generate primary current waveform
        wf = generate_dab_waveforms(
            self.params.vin,
            self.params.vout,
            self.n,
            self.llk,
            self.params.fsw,
            self.phi_rad,
            points_per_cycle=2000
        )

        # FFT analysis
        thd_results = calculate_thd(
            wf.current,
            wf.voltage,
            self.params.fsw
        )

        # Power factor
        pf_results = calculate_power_factor(
            wf.voltage,
            wf.current,
            self.params.fsw
        )

        return {
            "time": wf.time.tolist(),
            "i_primary": wf.current.tolist(),
            "v_primary": wf.voltage.tolist(),
            "metrics": {
                "i_rms": wf.i_rms,
                "i_peak": wf.i_peak,
                "thd_current": thd_results["current_thd"],
                "thd_voltage": thd_results["voltage_thd"],
                "power_factor": pf_results["power_factor"],
                "displacement_pf": pf_results["displacement_pf"]
            }
        }

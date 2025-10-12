"""DAB (Dual Active Bridge) simulation correctness tests."""
import pytest
import numpy as np
from app.services.sim.topologies.dab_single import DABSinglePhase


class TestDABPowerTransfer:
    """Tests for DAB power transfer equations."""

    def test_power_transfer_basic(self, dab_params):
        """Test basic power transfer calculation."""
        dab = DABSinglePhase(**dab_params)
        device_params = {
            "rds_on_25c": 0.010,
            "eon": 100e-6,
            "eoff": 50e-6,
            "coss": 120e-12
        }

        result = dab.simulate(device_params)

        assert result.success is True
        assert "power_transfer" in result.results
        assert result.results["power_transfer"] > 0
        # Power should be close to requested output power
        assert abs(result.results["power_transfer"] - dab_params["pout"]) < 2000

    def test_power_transfer_unity_ratio(self):
        """Test power transfer with unity transformer ratio."""
        params = {
            "vin": 400.0,
            "vout": 400.0,
            "pout": 10000.0,
            "fsw": 100000.0,
            "n": 1.0,
            "llk": 10e-6,
            "deadtime": 100e-9,
            "phi_deg": 15.0
        }
        dab = DABSinglePhase(**params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        # With n=1 and Vin=Vout, phase shift should dominate power transfer
        assert result.results["phi_rad"] == pytest.approx(np.radians(15.0), rel=1e-3)

    def test_power_transfer_step_down(self):
        """Test power transfer with step-down voltage conversion."""
        params = {
            "vin": 800.0,
            "vout": 400.0,
            "pout": 10000.0,
            "fsw": 100000.0,
            "n": 2.0,  # Step-down ratio
            "llk": 10e-6,
            "deadtime": 100e-9,
            "phi_deg": 15.0
        }
        dab = DABSinglePhase(**params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        assert result.results["power_transfer"] > 0

    def test_power_transfer_step_up(self):
        """Test power transfer with step-up voltage conversion."""
        params = {
            "vin": 400.0,
            "vout": 800.0,
            "pout": 10000.0,
            "fsw": 100000.0,
            "n": 0.5,  # Step-up ratio
            "llk": 10e-6,
            "deadtime": 100e-9,
            "phi_deg": 15.0
        }
        dab = DABSinglePhase(**params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        assert result.results["power_transfer"] > 0


class TestDABCurrentCalculation:
    """Tests for RMS current calculations."""

    def test_rms_current_positive(self, dab_params):
        """Test that RMS currents are positive."""
        dab = DABSinglePhase(**dab_params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        assert "i_rms_pri" in result.results
        assert "i_rms_sec" in result.results
        assert result.results["i_rms_pri"] > 0
        assert result.results["i_rms_sec"] > 0

    def test_peak_current_exceeds_rms(self, dab_params):
        """Test that peak current exceeds RMS current."""
        dab = DABSinglePhase(**dab_params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        assert "i_peak" in result.results
        assert "i_rms_pri" in result.results
        # Peak should always be greater than RMS
        assert result.results["i_peak"] > result.results["i_rms_pri"]


class TestDABLossCalculation:
    """Tests for loss calculations."""

    def test_conduction_losses(self, dab_params):
        """Test conduction loss calculation."""
        dab = DABSinglePhase(**dab_params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        assert "p_cond_total" in result.results
        assert result.results["p_cond_total"] > 0
        # Conduction losses should be reasonable (< 10% of output power)
        assert result.results["p_cond_total"] < 0.1 * dab_params["pout"]

    def test_switching_losses(self, dab_params):
        """Test switching loss calculation."""
        dab = DABSinglePhase(**dab_params)
        device_params = {
            "rds_on_25c": 0.010,
            "eon": 100e-6,
            "eoff": 50e-6,
            "coss": 120e-12
        }

        result = dab.simulate(device_params)

        assert result.success is True
        assert "p_sw_total" in result.results
        assert result.results["p_sw_total"] > 0

    def test_total_losses(self, dab_params):
        """Test total loss calculation."""
        dab = DABSinglePhase(**dab_params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        assert "p_loss_total" in result.results
        p_cond = result.results["p_cond_total"]
        p_sw = result.results["p_sw_total"]
        p_total = result.results["p_loss_total"]

        # Total losses should equal sum of conduction and switching
        assert p_total == pytest.approx(p_cond + p_sw, rel=1e-3)


class TestDABEfficiency:
    """Tests for efficiency calculations."""

    def test_efficiency_range(self, dab_params):
        """Test that efficiency is within reasonable range."""
        dab = DABSinglePhase(**dab_params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        assert "efficiency" in result.results
        efficiency = result.results["efficiency"]
        # Efficiency should be between 80% and 100%
        assert 0.8 < efficiency < 1.0

    def test_efficiency_calculation(self, dab_params):
        """Test efficiency formula correctness."""
        dab = DABSinglePhase(**dab_params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        pout = result.results["power_transfer"]
        ploss = result.results["p_loss_total"]
        efficiency_calc = pout / (pout + ploss)

        assert result.results["efficiency"] == pytest.approx(efficiency_calc, rel=1e-3)


class TestDABWaveforms:
    """Tests for waveform generation."""

    def test_waveform_generation(self, dab_params):
        """Test that waveforms are generated."""
        dab = DABSinglePhase(**dab_params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        assert result.waveforms is not None
        assert "time" in result.waveforms
        assert "v_pri" in result.waveforms
        assert "i_pri" in result.waveforms

    def test_waveform_length(self, dab_params):
        """Test that waveforms have consistent length."""
        dab = DABSinglePhase(**dab_params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        time_length = len(result.waveforms["time"])
        assert len(result.waveforms["v_pri"]) == time_length
        assert len(result.waveforms["i_pri"]) == time_length

    def test_waveform_time_span(self, dab_params):
        """Test that waveforms span one switching period."""
        dab = DABSinglePhase(**dab_params)
        device_params = {"rds_on_25c": 0.010, "eon": 100e-6, "eoff": 50e-6, "coss": 120e-12}

        result = dab.simulate(device_params)

        assert result.success is True
        time = np.array(result.waveforms["time"])
        period = 1.0 / dab_params["fsw"]
        # Time should span approximately one period
        assert time[-1] == pytest.approx(period, rel=0.1)


class TestDABParameterValidation:
    """Tests for parameter validation."""

    def test_zero_power_fails(self):
        """Test that zero power is rejected."""
        params = {
            "vin": 400.0,
            "vout": 400.0,
            "pout": 0.0,  # Invalid
            "fsw": 100000.0,
            "n": 1.0,
            "llk": 10e-6,
            "deadtime": 100e-9,
            "phi_deg": 15.0
        }
        with pytest.raises((ValueError, AssertionError)):
            dab = DABSinglePhase(**params)

    def test_negative_voltage_fails(self):
        """Test that negative voltage is rejected."""
        params = {
            "vin": -400.0,  # Invalid
            "vout": 400.0,
            "pout": 10000.0,
            "fsw": 100000.0,
            "n": 1.0,
            "llk": 10e-6,
            "deadtime": 100e-9,
            "phi_deg": 15.0
        }
        with pytest.raises((ValueError, AssertionError)):
            dab = DABSinglePhase(**params)

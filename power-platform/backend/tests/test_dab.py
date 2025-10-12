"""Tests for DAB topology simulation."""
import pytest
from app.services.sim.topologies.dab_single import DABSinglePhase


def test_dab_creation():
    """Test DAB instantiation."""
    dab = DABSinglePhase(
        vin=400,
        vout=400,
        power=5000,
        fsw=100e3,
        llk=10e-6,
        n=1.0,
        phi=45,
        cdc_in=100e-6,
        cdc_out=100e-6
    )

    assert dab.params.vin == 400
    assert dab.params.vout == 400
    assert dab.params.power == 5000


def test_dab_validation():
    """Test parameter validation."""
    dab = DABSinglePhase(
        vin=-100,  # Invalid
        vout=400,
        power=5000,
        fsw=100e3,
        llk=10e-6,
        n=1.0,
        phi=45,
        cdc_in=100e-6,
        cdc_out=100e-6
    )

    valid, error = dab.validate_params()
    assert not valid
    assert "positive" in error.lower()


def test_dab_simulation():
    """Test complete DAB simulation."""
    dab = DABSinglePhase(
        vin=400,
        vout=400,
        power=5000,
        fsw=100e3,
        llk=10e-6,
        n=1.0,
        phi=45,
        cdc_in=100e-6,
        cdc_out=100e-6
    )

    device_params = {
        "rds_on_25c": 0.010,
        "rds_on_125c": 0.015,
        "eon": 100e-6,
        "eoff": 50e-6,
        "qg": 100e-9,
        "vf": 1.5,
        "trr": 20e-9,
        "qrr": 150e-9,
        "tj_max": 175,
        "rth_jc": 0.5,
        "rth_ja": 40,
        "coss": 120e-12
    }

    result = dab.simulate(device_params)

    assert result.success
    assert result.results["efficiency"] > 90  # Should be efficient
    assert result.results["efficiency"] < 100
    assert result.results["thd_current"] < 10  # Reasonable THD


def test_dab_waveforms():
    """Test waveform generation."""
    dab = DABSinglePhase(
        vin=400,
        vout=400,
        power=5000,
        fsw=100e3,
        llk=10e-6,
        n=1.0,
        phi=45,
        cdc_in=100e-6,
        cdc_out=100e-6
    )

    waveforms = dab.generate_waveforms()

    assert "time" in waveforms
    assert "i_primary" in waveforms
    assert "v_primary" in waveforms
    assert len(waveforms["time"]) > 0
    assert waveforms["metrics"]["i_rms"] > 0


def test_dab_efficiency_improves_with_better_device():
    """Test that efficiency improves with lower Rds(on)."""
    dab = DABSinglePhase(
        vin=400,
        vout=400,
        power=5000,
        fsw=100e3,
        llk=10e-6,
        n=1.0,
        phi=45,
        cdc_in=100e-6,
        cdc_out=100e-6
    )

    # Poor device
    device_poor = {
        "rds_on_25c": 0.050,  # High resistance
        "eon": 200e-6,
        "eoff": 100e-6,
        "qg": 200e-9,
        "rth_jc": 0.5,
        "rth_ja": 40,
        "coss": 120e-12,
        "vf": 1.5,
        "trr": 20e-9,
        "qrr": 150e-9,
        "tj_max": 175
    }

    # Good device
    device_good = {
        "rds_on_25c": 0.010,  # Low resistance
        "eon": 50e-6,
        "eoff": 25e-6,
        "qg": 50e-9,
        "rth_jc": 0.5,
        "rth_ja": 40,
        "coss": 120e-12,
        "vf": 1.5,
        "trr": 20e-9,
        "qrr": 150e-9,
        "tj_max": 175
    }

    result_poor = dab.simulate(device_poor)
    result_good = dab.simulate(device_good)

    assert result_good.results["efficiency"] > result_poor.results["efficiency"]

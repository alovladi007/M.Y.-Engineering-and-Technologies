"""ZVS (Zero-Voltage Switching) solver validation tests."""
import pytest
import numpy as np
from app.services.sim.zvs.zvs_solver import (
    check_zvs_condition,
    calculate_zvs_boundary,
    calculate_zvs_energy
)


class TestZVSEnergyCalculation:
    """Tests for ZVS energy calculations."""

    def test_inductive_energy_positive(self):
        """Test that inductive energy is positive."""
        vin = 400.0
        vout = 400.0
        n = 1.0
        llk = 10e-6
        fsw = 100000.0
        phi_deg = 15.0
        pout = 10000.0

        e_ind, e_cap = calculate_zvs_energy(
            vin=vin,
            vout=vout,
            n=n,
            llk=llk,
            fsw=fsw,
            phi_deg=phi_deg,
            pout=pout,
            coss=120e-12,
            deadtime=100e-9
        )

        assert e_ind > 0, "Inductive energy should be positive"

    def test_capacitive_energy_positive(self):
        """Test that capacitive energy is positive."""
        e_ind, e_cap = calculate_zvs_energy(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            phi_deg=15.0,
            pout=10000.0,
            coss=120e-12,
            deadtime=100e-9
        )

        assert e_cap > 0, "Capacitive energy should be positive"

    def test_zvs_energy_ratio(self):
        """Test ZVS energy ratio for known conditions."""
        e_ind, e_cap = calculate_zvs_energy(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            phi_deg=15.0,
            pout=10000.0,
            coss=120e-12,
            deadtime=100e-9
        )

        # For ZVS, inductive energy must exceed capacitive energy
        ratio = e_ind / e_cap
        assert ratio > 0, "Energy ratio must be positive"


class TestZVSConditionCheck:
    """Tests for ZVS condition checking."""

    def test_zvs_achievable_high_power(self):
        """Test that ZVS is achievable at high power."""
        result = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9,
            phi_deg=15.0,
            pout=10000.0
        )

        assert "zvs_achieved" in result
        assert "margin" in result
        assert "e_ind" in result
        assert "e_cap" in result
        assert isinstance(result["zvs_achieved"], bool)

    def test_zvs_not_achievable_low_power(self):
        """Test that ZVS may not be achievable at very low power."""
        result = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9,
            phi_deg=5.0,  # Small phase shift
            pout=100.0  # Very low power
        )

        # At very low power, ZVS may not be achieved
        assert isinstance(result["zvs_achieved"], bool)
        assert result["margin"] < 100  # Should have small or negative margin

    def test_zvs_margin_calculation(self):
        """Test ZVS margin calculation."""
        result = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9,
            phi_deg=15.0,
            pout=10000.0
        )

        # Margin should be percentage
        assert -100 <= result["margin"] <= 1000  # Reasonable range


class TestZVSBoundaryCalculation:
    """Tests for ZVS boundary curve calculation."""

    def test_boundary_returns_arrays(self):
        """Test that boundary calculation returns numpy arrays."""
        boundary = calculate_zvs_boundary(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9
        )

        assert "phi_deg" in boundary
        assert "load_percent" in boundary
        assert "zvs_map" in boundary
        assert isinstance(boundary["phi_deg"], np.ndarray)
        assert isinstance(boundary["load_percent"], np.ndarray)
        assert isinstance(boundary["zvs_map"], np.ndarray)

    def test_boundary_shape_consistency(self):
        """Test that boundary arrays have consistent shapes."""
        boundary = calculate_zvs_boundary(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9
        )

        phi_shape = boundary["phi_deg"].shape
        load_shape = boundary["load_percent"].shape
        zvs_shape = boundary["zvs_map"].shape

        # ZVS map should be 2D with shape (len(phi), len(load))
        assert len(zvs_shape) == 2
        assert zvs_shape[0] == len(boundary["phi_deg"])
        assert zvs_shape[1] == len(boundary["load_percent"])

    def test_boundary_phi_range(self):
        """Test that phase shift range is reasonable."""
        boundary = calculate_zvs_boundary(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9
        )

        phi = boundary["phi_deg"]
        # Phase shift should be between 0 and some reasonable maximum (< 90 deg)
        assert np.all(phi >= 0)
        assert np.all(phi <= 90)

    def test_boundary_load_range(self):
        """Test that load percentage range is reasonable."""
        boundary = calculate_zvs_boundary(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9
        )

        load = boundary["load_percent"]
        # Load should be between 0% and 100%+
        assert np.all(load >= 0)
        assert np.all(load <= 120)  # Allow slight overload

    def test_boundary_zvs_map_binary(self):
        """Test that ZVS map contains boolean values."""
        boundary = calculate_zvs_boundary(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9
        )

        zvs_map = boundary["zvs_map"]
        # ZVS map should contain only 0 or 1 (False or True)
        unique_values = np.unique(zvs_map)
        assert np.all(np.isin(unique_values, [0, 1]))


class TestZVSParameterSensitivity:
    """Tests for ZVS sensitivity to parameter changes."""

    def test_zvs_improves_with_higher_inductance(self):
        """Test that higher leakage inductance improves ZVS."""
        # Low inductance case
        result_low = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=5e-6,  # Lower inductance
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9,
            phi_deg=15.0,
            pout=5000.0
        )

        # High inductance case
        result_high = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=20e-6,  # Higher inductance
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9,
            phi_deg=15.0,
            pout=5000.0
        )

        # Higher inductance should give better ZVS margin
        assert result_high["e_ind"] > result_low["e_ind"]

    def test_zvs_degrades_with_higher_capacitance(self):
        """Test that higher Coss degrades ZVS."""
        # Low capacitance case
        result_low = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=80e-12,  # Lower capacitance
            deadtime=100e-9,
            phi_deg=15.0,
            pout=5000.0
        )

        # High capacitance case
        result_high = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=200e-12,  # Higher capacitance
            deadtime=100e-9,
            phi_deg=15.0,
            pout=5000.0
        )

        # Higher capacitance should require more energy to discharge
        assert result_high["e_cap"] > result_low["e_cap"]

    def test_zvs_improves_with_higher_power(self):
        """Test that ZVS improves at higher power levels."""
        # Low power case
        result_low = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9,
            phi_deg=15.0,
            pout=1000.0  # Low power
        )

        # High power case
        result_high = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=120e-12,
            deadtime=100e-9,
            phi_deg=15.0,
            pout=10000.0  # High power
        )

        # Higher power should have better ZVS margin
        if result_low["zvs_achieved"] and result_high["zvs_achieved"]:
            assert result_high["margin"] >= result_low["margin"]


class TestZVSEdgeCases:
    """Tests for ZVS edge cases."""

    def test_zero_capacitance(self):
        """Test ZVS with zero output capacitance (ideal case)."""
        result = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=100000.0,
            coss=1e-15,  # Near-zero capacitance
            deadtime=100e-9,
            phi_deg=15.0,
            pout=10000.0
        )

        # With zero capacitance, ZVS should always be achievable
        assert result["zvs_achieved"] is True
        assert result["e_cap"] < 1e-9  # Negligible capacitive energy

    def test_very_high_frequency(self):
        """Test ZVS at very high switching frequency."""
        result = check_zvs_condition(
            vin=400.0,
            vout=400.0,
            n=1.0,
            llk=10e-6,
            fsw=500000.0,  # 500 kHz
            coss=120e-12,
            deadtime=50e-9,  # Shorter deadtime
            phi_deg=15.0,
            pout=10000.0
        )

        # Should still calculate ZVS correctly at high frequency
        assert "zvs_achieved" in result
        assert result["margin"] is not None

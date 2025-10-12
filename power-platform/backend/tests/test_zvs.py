"""Tests for ZVS analysis."""
import pytest
import numpy as np
from app.services.sim.zvs.zvs_solver import check_zvs_condition, calculate_zvs_boundary


def test_zvs_condition_met():
    """Test ZVS condition when sufficient energy available."""
    result = check_zvs_condition(
        vin=400,
        vout=400,
        n=1.0,
        llk=10e-6,
        i_llk=50,  # High current
        coss=100e-12,
        deadtime=100e-9
    )

    assert result.zvs_achieved
    assert result.margin > 0


def test_zvs_condition_not_met():
    """Test ZVS condition when insufficient energy."""
    result = check_zvs_condition(
        vin=400,
        vout=400,
        n=1.0,
        llk=10e-6,
        i_llk=1,  # Low current
        coss=100e-12,
        deadtime=100e-9
    )

    assert not result.zvs_achieved
    assert result.margin < 0


def test_zvs_boundary_calculation():
    """Test ZVS boundary map generation."""
    boundary = calculate_zvs_boundary(
        vin=400,
        vout=400,
        n=1.0,
        llk=10e-6,
        fsw=100e3,
        coss=100e-12,
        deadtime=100e-9,
        num_points=20
    )

    assert "phi" in boundary
    assert "load" in boundary
    assert "zvs_map" in boundary
    assert boundary["zvs_map"].shape == (20, 20)
    assert np.all((boundary["zvs_map"] == 0) | (boundary["zvs_map"] == 1))


def test_zvs_improves_with_higher_current():
    """Test that ZVS is easier to achieve with higher current."""
    low_current = check_zvs_condition(
        vin=400, vout=400, n=1.0, llk=10e-6,
        i_llk=10, coss=100e-12, deadtime=100e-9
    )

    high_current = check_zvs_condition(
        vin=400, vout=400, n=1.0, llk=10e-6,
        i_llk=50, coss=100e-12, deadtime=100e-9
    )

    assert high_current.margin > low_current.margin

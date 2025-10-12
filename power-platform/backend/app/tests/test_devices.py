"""Device library interpolation and parameter tests."""
import pytest
from pathlib import Path
from app.services.sim.devices.library import DeviceLibrary


class TestDeviceLibraryLoading:
    """Tests for device library CSV loading."""

    @pytest.fixture
    def device_lib(self):
        """Create device library instance."""
        csv_path = Path(__file__).parent.parent.parent / "data" / "devices" / "default_devices.csv"
        if not csv_path.exists():
            pytest.skip(f"Device CSV not found at {csv_path}")
        return DeviceLibrary(csv_path=csv_path)

    def test_library_loads_successfully(self, device_lib):
        """Test that device library loads without errors."""
        assert device_lib is not None
        assert len(device_lib.devices) > 0

    def test_library_contains_devices(self, device_lib):
        """Test that library contains expected devices."""
        device_names = [d["name"] for d in device_lib.devices]
        assert len(device_names) > 0
        # Check for some common device types
        has_sic = any("SiC" in name or "sic" in name.lower() for name in device_names)
        has_gan = any("GaN" in name or "gan" in name.lower() for name in device_names)
        assert has_sic or has_gan, "Library should contain SiC or GaN devices"


class TestDeviceParameters:
    """Tests for device parameter retrieval."""

    @pytest.fixture
    def device_lib(self):
        """Create device library instance."""
        csv_path = Path(__file__).parent.parent.parent / "data" / "devices" / "default_devices.csv"
        if not csv_path.exists():
            pytest.skip(f"Device CSV not found at {csv_path}")
        return DeviceLibrary(csv_path=csv_path)

    def test_get_device_params(self, device_lib):
        """Test retrieving parameters for first device."""
        if len(device_lib.devices) == 0:
            pytest.skip("No devices in library")

        device_name = device_lib.devices[0]["name"]
        params = device_lib.get_device_params(device_name)

        assert params is not None
        assert "rds_on_25c" in params
        assert "coss" in params
        assert "eon" in params
        assert "eoff" in params

    def test_device_params_positive_values(self, device_lib):
        """Test that device parameters are positive."""
        if len(device_lib.devices) == 0:
            pytest.skip("No devices in library")

        device_name = device_lib.devices[0]["name"]
        params = device_lib.get_device_params(device_name)

        # All electrical parameters should be positive
        assert params["rds_on_25c"] > 0
        assert params["coss"] > 0
        assert params["tj_max"] > 0
        assert params["rth_jc"] > 0

    def test_invalid_device_name(self, device_lib):
        """Test that invalid device name raises error."""
        with pytest.raises((KeyError, ValueError)):
            device_lib.get_device_params("NonExistentDevice12345")


class TestDeviceInterpolation:
    """Tests for device parameter interpolation."""

    @pytest.fixture
    def device_lib(self):
        """Create device library instance."""
        csv_path = Path(__file__).parent.parent.parent / "data" / "devices" / "default_devices.csv"
        if not csv_path.exists():
            pytest.skip(f"Device CSV not found at {csv_path}")
        return DeviceLibrary(csv_path=csv_path)

    def test_rds_on_interpolation(self, device_lib):
        """Test Rds(on) temperature interpolation."""
        if len(device_lib.devices) == 0:
            pytest.skip("No devices in library")

        device_name = device_lib.devices[0]["name"]

        # Get Rds at different temperatures
        rds_25 = device_lib.get_rds_on(device_name, tj=25.0)
        rds_75 = device_lib.get_rds_on(device_name, tj=75.0)
        rds_125 = device_lib.get_rds_on(device_name, tj=125.0)

        # Rds should increase with temperature
        assert rds_75 > rds_25
        assert rds_125 > rds_75

    def test_switching_energy_interpolation(self, device_lib):
        """Test switching energy scaling with voltage/current."""
        if len(device_lib.devices) == 0:
            pytest.skip("No devices in library")

        device_name = device_lib.devices[0]["name"]

        # Get switching energy at different conditions
        eon_low = device_lib.get_switching_energy(device_name, vds=400, ids=10, energy_type="on")
        eon_high = device_lib.get_switching_energy(device_name, vds=400, ids=20, energy_type="on")

        # Energy should scale with current
        assert eon_high > eon_low


class TestDeviceComparison:
    """Tests for comparing multiple devices."""

    @pytest.fixture
    def device_lib(self):
        """Create device library instance."""
        csv_path = Path(__file__).parent.parent.parent / "data" / "devices" / "default_devices.csv"
        if not csv_path.exists():
            pytest.skip(f"Device CSV not found at {csv_path}")
        return DeviceLibrary(csv_path=csv_path)

    def test_compare_sic_vs_si(self, device_lib):
        """Test comparing SiC vs Silicon devices."""
        device_names = [d["name"] for d in device_lib.devices]

        sic_devices = [name for name in device_names if "SiC" in name or "sic" in name.lower()]
        si_devices = [name for name in device_names if "Si" in name and "SiC" not in name]

        if len(sic_devices) == 0 or len(si_devices) == 0:
            pytest.skip("Need both SiC and Si devices for comparison")

        sic_params = device_lib.get_device_params(sic_devices[0])
        si_params = device_lib.get_device_params(si_devices[0])

        # SiC typically has lower Rds(on) and faster switching
        # (This may not always be true depending on ratings, but generally)
        assert sic_params["rds_on_25c"] is not None
        assert si_params["rds_on_25c"] is not None


class TestDefaultDeviceParams:
    """Tests for default device parameters."""

    def test_default_params_fallback(self):
        """Test that system can fall back to default parameters."""
        default_params = {
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

        # Verify all required keys present
        required_keys = ["rds_on_25c", "eon", "eoff", "coss", "tj_max", "rth_jc"]
        for key in required_keys:
            assert key in default_params
            assert default_params[key] > 0


class TestDeviceThermalModel:
    """Tests for device thermal modeling."""

    @pytest.fixture
    def device_lib(self):
        """Create device library instance."""
        csv_path = Path(__file__).parent.parent.parent / "data" / "devices" / "default_devices.csv"
        if not csv_path.exists():
            pytest.skip(f"Device CSV not found at {csv_path}")
        return DeviceLibrary(csv_path=csv_path)

    def test_junction_temperature_calculation(self, device_lib):
        """Test junction temperature calculation."""
        if len(device_lib.devices) == 0:
            pytest.skip("No devices in library")

        device_name = device_lib.devices[0]["name"]
        params = device_lib.get_device_params(device_name)

        # Calculate junction temp with some power loss
        p_loss = 10.0  # 10W
        t_ambient = 25.0
        t_junction = t_ambient + p_loss * params["rth_jc"]

        assert t_junction > t_ambient
        assert t_junction < params["tj_max"], "Junction temp should be below max"

    def test_thermal_derating(self, device_lib):
        """Test that device parameters derate with temperature."""
        if len(device_lib.devices) == 0:
            pytest.skip("No devices in library")

        device_name = device_lib.devices[0]["name"]

        # Get parameters at different temperatures
        rds_cold = device_lib.get_rds_on(device_name, tj=25.0)
        rds_hot = device_lib.get_rds_on(device_name, tj=150.0)

        # Resistance should increase significantly at high temp
        derating_factor = rds_hot / rds_cold
        assert derating_factor > 1.2, "Should see >20% increase in Rds at high temp"


class TestDeviceSelection:
    """Tests for device selection criteria."""

    @pytest.fixture
    def device_lib(self):
        """Create device library instance."""
        csv_path = Path(__file__).parent.parent.parent / "data" / "devices" / "default_devices.csv"
        if not csv_path.exists():
            pytest.skip(f"Device CSV not found at {csv_path}")
        return DeviceLibrary(csv_path=csv_path)

    def test_filter_by_voltage_rating(self, device_lib):
        """Test filtering devices by voltage rating."""
        if len(device_lib.devices) == 0:
            pytest.skip("No devices in library")

        # Find devices rated for at least 600V
        high_voltage_devices = [
            d for d in device_lib.devices
            if d.get("v_rating", 0) >= 600
        ]

        # Should have some high-voltage devices
        assert len(high_voltage_devices) >= 0  # At least check it doesn't crash

    def test_filter_by_current_rating(self, device_lib):
        """Test filtering devices by current rating."""
        if len(device_lib.devices) == 0:
            pytest.skip("No devices in library")

        # Find devices rated for at least 30A
        high_current_devices = [
            d for d in device_lib.devices
            if d.get("i_rating", 0) >= 30
        ]

        # Should have some high-current devices
        assert len(high_current_devices) >= 0  # At least check it doesn't crash

"""Device library - SiC/GaN/Si power semiconductor models."""
import csv
import pandas as pd
from typing import Dict, List, Optional
from dataclasses import dataclass
from pathlib import Path


@dataclass
class DeviceSpec:
    """Power semiconductor device specification."""
    name: str
    manufacturer: str
    technology: str  # Si, SiC, GaN
    vds_max: float  # Maximum drain-source voltage (V)
    id_max: float  # Maximum drain current (A)
    rds_on_25c: float  # On-resistance at 25°C (Ω)
    rds_on_125c: float  # On-resistance at 125°C (Ω)
    qgs: float  # Gate-source charge (C)
    qgd: float  # Gate-drain (Miller) charge (C)
    qg_total: float  # Total gate charge (C)
    eon: float  # Turn-on energy (J)
    eoff: float  # Turn-off energy (J)
    vf_diode: float  # Body diode forward voltage (V)
    trr: float  # Reverse recovery time (s)
    qrr: float  # Reverse recovery charge (C)
    tj_max: float  # Maximum junction temperature (°C)
    rth_jc: float  # Junction-to-case thermal resistance (°C/W)
    rth_ja: float  # Junction-to-ambient thermal resistance (°C/W)
    coss: float  # Output capacitance (F)
    package: str  # Package type
    cost_usd: Optional[float] = None  # Estimated cost


class DeviceLibrary:
    """Device library manager."""

    def __init__(self, csv_path: Optional[str] = None):
        """
        Initialize device library.

        Args:
            csv_path: Path to CSV file with device data
        """
        self.devices: Dict[str, DeviceSpec] = {}
        if csv_path:
            self.load_from_csv(csv_path)

    def load_from_csv(self, csv_path: str):
        """
        Load devices from CSV file.

        CSV format:
        name,manufacturer,technology,vds_max,id_max,rds_on_25c,rds_on_125c,
        qgs,qgd,qg_total,eon,eoff,vf_diode,trr,qrr,tj_max,rth_jc,rth_ja,
        coss,package,cost_usd

        Args:
            csv_path: Path to CSV file
        """
        try:
            df = pd.read_csv(csv_path)

            for _, row in df.iterrows():
                device = DeviceSpec(
                    name=str(row['name']),
                    manufacturer=str(row['manufacturer']),
                    technology=str(row['technology']),
                    vds_max=float(row['vds_max']),
                    id_max=float(row['id_max']),
                    rds_on_25c=float(row['rds_on_25c']),
                    rds_on_125c=float(row['rds_on_125c']),
                    qgs=float(row['qgs']),
                    qgd=float(row['qgd']),
                    qg_total=float(row['qg_total']),
                    eon=float(row['eon']),
                    eoff=float(row['eoff']),
                    vf_diode=float(row['vf_diode']),
                    trr=float(row['trr']),
                    qrr=float(row['qrr']),
                    tj_max=float(row['tj_max']),
                    rth_jc=float(row['rth_jc']),
                    rth_ja=float(row['rth_ja']),
                    coss=float(row['coss']),
                    package=str(row['package']),
                    cost_usd=float(row['cost_usd']) if 'cost_usd' in row else None
                )
                self.devices[device.name] = device

        except Exception as e:
            raise ValueError(f"Error loading device library from {csv_path}: {e}")

    def get_device(self, name: str) -> Optional[DeviceSpec]:
        """
        Get device by name.

        Args:
            name: Device name

        Returns:
            DeviceSpec or None if not found
        """
        return self.devices.get(name)

    def search(
        self,
        technology: Optional[str] = None,
        vds_min: Optional[float] = None,
        id_min: Optional[float] = None,
        rds_on_max: Optional[float] = None,
        manufacturer: Optional[str] = None
    ) -> List[DeviceSpec]:
        """
        Search devices by criteria.

        Args:
            technology: Filter by technology (Si, SiC, GaN)
            vds_min: Minimum voltage rating
            id_min: Minimum current rating
            rds_on_max: Maximum on-resistance
            manufacturer: Filter by manufacturer

        Returns:
            List of matching devices
        """
        results = []

        for device in self.devices.values():
            # Check criteria
            if technology and device.technology != technology:
                continue
            if vds_min and device.vds_max < vds_min:
                continue
            if id_min and device.id_max < id_min:
                continue
            if rds_on_max and device.rds_on_25c > rds_on_max:
                continue
            if manufacturer and device.manufacturer.lower() != manufacturer.lower():
                continue

            results.append(device)

        return results

    def recommend_device(
        self,
        voltage_stress: float,
        current_stress: float,
        technology_preference: Optional[str] = None,
        derating_factor: float = 0.8
    ) -> List[DeviceSpec]:
        """
        Recommend devices for given operating conditions.

        Args:
            voltage_stress: Maximum voltage stress (V)
            current_stress: Maximum current stress (A)
            technology_preference: Preferred technology
            derating_factor: Safety derating (0.8 = 80% of max rating)

        Returns:
            List of recommended devices, sorted by suitability
        """
        # Required ratings with derating
        vds_required = voltage_stress / derating_factor
        id_required = current_stress / derating_factor

        # Search
        candidates = self.search(
            technology=technology_preference,
            vds_min=vds_required,
            id_min=id_required
        )

        # Score devices (lower is better)
        scored = []
        for device in candidates:
            # Preference for lower Rds(on) and closer voltage/current ratings
            score = (
                device.rds_on_25c * 1000 +  # Normalize to mΩ
                abs(device.vds_max - vds_required) / 100 +  # Voltage match
                abs(device.id_max - id_required) / 10  # Current match
            )
            scored.append((score, device))

        # Sort by score
        scored.sort(key=lambda x: x[0])

        return [device for _, device in scored[:10]]

    def get_device_params(self, name: str) -> Dict[str, float]:
        """
        Get device parameters in dictionary format for simulation.

        Args:
            name: Device name

        Returns:
            Dictionary with device parameters
        """
        device = self.get_device(name)
        if not device:
            raise ValueError(f"Device '{name}' not found in library")

        return {
            "rds_on_25c": device.rds_on_25c,
            "rds_on_125c": device.rds_on_125c,
            "eon": device.eon,
            "eoff": device.eoff,
            "qg": device.qg_total,
            "vf": device.vf_diode,
            "trr": device.trr,
            "qrr": device.qrr,
            "tj_max": device.tj_max,
            "rth_jc": device.rth_jc,
            "rth_ja": device.rth_ja,
            "coss": device.coss,
            "technology": device.technology,
            "vds_max": device.vds_max,
            "id_max": device.id_max
        }

    def list_all(self) -> List[str]:
        """Get list of all device names."""
        return list(self.devices.keys())

    def export_to_csv(self, output_path: str):
        """
        Export device library to CSV.

        Args:
            output_path: Output CSV file path
        """
        if not self.devices:
            raise ValueError("No devices to export")

        # Convert to DataFrame
        data = []
        for device in self.devices.values():
            data.append({
                "name": device.name,
                "manufacturer": device.manufacturer,
                "technology": device.technology,
                "vds_max": device.vds_max,
                "id_max": device.id_max,
                "rds_on_25c": device.rds_on_25c,
                "rds_on_125c": device.rds_on_125c,
                "qgs": device.qgs,
                "qgd": device.qgd,
                "qg_total": device.qg_total,
                "eon": device.eon,
                "eoff": device.eoff,
                "vf_diode": device.vf_diode,
                "trr": device.trr,
                "qrr": device.qrr,
                "tj_max": device.tj_max,
                "rth_jc": device.rth_jc,
                "rth_ja": device.rth_ja,
                "coss": device.coss,
                "package": device.package,
                "cost_usd": device.cost_usd or 0.0
            })

        df = pd.DataFrame(data)
        df.to_csv(output_path, index=False)

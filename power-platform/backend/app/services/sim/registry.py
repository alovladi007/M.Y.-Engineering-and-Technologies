"""Topology registry for extensible simulation system."""
from typing import Dict, Type, Any
from .topologies.base import BaseTopology
from .topologies.dab_single import DABSinglePhase
from .topologies.dab_threephase import DABThreePhase
from .topologies.sst_mmc_stub import SST_MMC
from .topologies.sst_chb_stub import SST_CHB


class TopologyRegistry:
    """Registry for all available converter topologies."""

    _topologies: Dict[str, Type[BaseTopology]] = {}

    @classmethod
    def register(cls, name: str, topology_class: Type[BaseTopology]):
        """
        Register a new topology.

        Args:
            name: Topology identifier
            topology_class: Topology class
        """
        cls._topologies[name] = topology_class

    @classmethod
    def get(cls, name: str) -> Type[BaseTopology]:
        """
        Get topology class by name.

        Args:
            name: Topology identifier

        Returns:
            Topology class

        Raises:
            KeyError: If topology not found
        """
        if name not in cls._topologies:
            raise KeyError(f"Topology '{name}' not registered")
        return cls._topologies[name]

    @classmethod
    def list_all(cls) -> Dict[str, Dict[str, Any]]:
        """
        List all registered topologies with metadata.

        Returns:
            Dictionary of topology metadata
        """
        return {
            name: {
                "class": topo.__name__,
                "module": topo.__module__,
                "doc": topo.__doc__
            }
            for name, topo in cls._topologies.items()
        }

    @classmethod
    def create(cls, name: str, **kwargs) -> BaseTopology:
        """
        Create topology instance.

        Args:
            name: Topology identifier
            **kwargs: Topology parameters

        Returns:
            Topology instance
        """
        topology_class = cls.get(name)
        return topology_class(**kwargs)


# Register built-in topologies
TopologyRegistry.register("dab_single", DABSinglePhase)
TopologyRegistry.register("dab_threephase", DABThreePhase)
TopologyRegistry.register("sst_mmc", SST_MMC)
TopologyRegistry.register("sst_chb", SST_CHB)


def get_topology_info() -> Dict[str, Any]:
    """
    Get information about all available topologies.

    Returns:
        Dictionary with topology capabilities and parameters
    """
    return {
        "dab_single": {
            "name": "Single-Phase Dual Active Bridge",
            "power_range": "100W - 10kW",
            "applications": ["DC-DC conversion", "Battery charging", "Isolated power"],
            "parameters": [
                "vin", "vout", "power", "fsw", "llk", "n", "phi",
                "cdc_in", "cdc_out", "deadtime"
            ],
            "features": ["Bidirectional", "Galvanic isolation", "ZVS capable", "High frequency"],
            "status": "Fully Implemented"
        },
        "dab_threephase": {
            "name": "Three-Phase Dual Active Bridge",
            "power_range": "10kW - 100kW",
            "applications": ["EV charging", "Grid storage", "Industrial drives"],
            "parameters": [
                "vin", "vout", "power", "fsw", "llk", "n", "phi",
                "cdc_in", "cdc_out", "deadtime"
            ],
            "features": ["Higher power density", "Lower ripple", "Bidirectional"],
            "status": "Fully Implemented"
        },
        "sst_mmc": {
            "name": "Solid-State Transformer with MMC",
            "power_range": "100kW - 10MW",
            "applications": ["MV/LV transformation", "Smart grid", "Traction"],
            "parameters": ["vin", "vout", "power", "fsw", "num_modules"],
            "features": ["High voltage", "Modular", "Fault tolerant", "Low THD"],
            "status": "Stub - Basic metrics only"
        },
        "sst_chb": {
            "name": "Solid-State Transformer with CHB",
            "power_range": "100kW - 10MW",
            "applications": ["MV drives", "STATCOM", "Renewable integration"],
            "parameters": ["vin", "vout", "power", "fsw", "num_cells"],
            "features": ["Multi-level", "Low THD", "Modular", "Medium voltage"],
            "status": "Stub - Basic metrics only"
        }
    }

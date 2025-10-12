"""Base topology class."""
from abc import ABC, abstractmethod
from typing import Dict, Any
from dataclasses import dataclass, field


@dataclass
class TopologyParams:
    """Base parameters for any topology."""
    name: str
    vin: float  # Input voltage (V)
    vout: float  # Output voltage (V)
    power: float  # Power rating (W)
    fsw: float  # Switching frequency (Hz)
    t_ambient: float = 25.0  # Ambient temperature (°C)
    extra: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SimulationResult:
    """Base simulation result."""
    success: bool
    topology: str
    params: Dict[str, Any]
    results: Dict[str, Any]
    waveforms: Dict[str, Any] = field(default_factory=dict)
    plots: Dict[str, str] = field(default_factory=dict)
    error: str = ""


class BaseTopology(ABC):
    """Base class for power converter topologies."""

    def __init__(self, params: TopologyParams):
        """Initialize topology with parameters."""
        self.params = params

    @abstractmethod
    def validate_params(self) -> tuple[bool, str]:
        """
        Validate input parameters.

        Returns:
            Tuple of (is_valid, error_message)
        """
        pass

    @abstractmethod
    def calculate_steady_state(self) -> Dict[str, Any]:
        """
        Calculate steady-state operating point.

        Returns:
            Dictionary with operating point values
        """
        pass

    @abstractmethod
    def calculate_losses(self, device_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate power losses.

        Args:
            device_params: Device parameters (Rds_on, Eon, Eoff, etc.)

        Returns:
            Dictionary with loss breakdown
        """
        pass

    @abstractmethod
    def calculate_efficiency(self, losses: Dict[str, Any]) -> float:
        """
        Calculate overall efficiency.

        Args:
            losses: Loss breakdown dictionary

        Returns:
            Efficiency (0-100%)
        """
        pass

    @abstractmethod
    def generate_waveforms(self) -> Dict[str, Any]:
        """
        Generate voltage and current waveforms.

        Returns:
            Dictionary with waveform arrays
        """
        pass

    def simulate(self, device_params: Dict[str, Any]) -> SimulationResult:
        """
        Run complete simulation.

        Args:
            device_params: Device parameters

        Returns:
            SimulationResult with all outputs
        """
        # Validate
        valid, error = self.validate_params()
        if not valid:
            return SimulationResult(
                success=False,
                topology=self.params.name,
                params={},
                results={},
                error=error
            )

        try:
            # Calculate steady state
            steady_state = self.calculate_steady_state()

            # Calculate losses
            losses = self.calculate_losses(device_params)

            # Calculate efficiency
            efficiency = self.calculate_efficiency(losses)

            # Generate waveforms
            waveforms = self.generate_waveforms()

            # Compile results
            results = {
                "steady_state": steady_state,
                "losses": losses,
                "efficiency": efficiency,
                **waveforms.get("metrics", {})
            }

            return SimulationResult(
                success=True,
                topology=self.params.name,
                params=self.params.__dict__,
                results=results,
                waveforms=waveforms,
                plots={}
            )

        except Exception as e:
            return SimulationResult(
                success=False,
                topology=self.params.name,
                params=self.params.__dict__,
                results={},
                error=str(e)
            )

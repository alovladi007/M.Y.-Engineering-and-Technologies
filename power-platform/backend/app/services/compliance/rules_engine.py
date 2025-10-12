"""Compliance rules engine - evaluates simulation results against standards."""
import yaml
from typing import Dict, List, Any
from dataclasses import dataclass
from pathlib import Path


@dataclass
class RuleResult:
    """Result of a single rule evaluation."""
    rule_id: str
    rule_name: str
    category: str
    passed: bool
    measured_value: float
    limit_value: float
    margin: float  # Percentage margin (positive = pass)
    severity: str  # critical, warning, info
    citation: str  # Standard reference


@dataclass
class ComplianceResult:
    """Overall compliance report."""
    ruleset_name: str
    ruleset_version: str
    standard: str
    overall_passed: bool
    pass_rate: float
    rule_results: List[RuleResult]
    summary: Dict[str, Any]


class RulesEngine:
    """Compliance rules evaluation engine."""

    def __init__(self, ruleset_dir: str = None):
        """
        Initialize rules engine.

        Args:
            ruleset_dir: Directory containing ruleset YAML files
        """
        self.ruleset_dir = ruleset_dir or Path(__file__).parent / "rulesets"
        self.rulesets: Dict[str, Dict] = {}

    def load_ruleset(self, ruleset_name: str) -> Dict:
        """
        Load ruleset from YAML file.

        Args:
            ruleset_name: Name of ruleset (e.g., "ieee_1547")

        Returns:
            Ruleset dictionary
        """
        ruleset_path = Path(self.ruleset_dir) / f"{ruleset_name}.yaml"

        if not ruleset_path.exists():
            raise FileNotFoundError(f"Ruleset {ruleset_name} not found at {ruleset_path}")

        with open(ruleset_path, 'r') as f:
            ruleset = yaml.safe_load(f)

        self.rulesets[ruleset_name] = ruleset
        return ruleset

    def evaluate(
        self,
        ruleset_name: str,
        simulation_results: Dict[str, Any]
    ) -> ComplianceResult:
        """
        Evaluate simulation results against ruleset.

        Args:
            ruleset_name: Name of compliance ruleset
            simulation_results: Dict with simulation metrics

        Returns:
            ComplianceResult with pass/fail for each rule
        """
        # Load ruleset if not already loaded
        if ruleset_name not in self.rulesets:
            self.load_ruleset(ruleset_name)

        ruleset = self.rulesets[ruleset_name]
        rule_results = []

        # Evaluate each rule
        for rule in ruleset.get("rules", []):
            result = self._evaluate_rule(rule, simulation_results)
            rule_results.append(result)

        # Calculate overall pass/fail
        critical_rules = [r for r in rule_results if r.severity == "critical"]
        overall_passed = all(r.passed for r in critical_rules)

        pass_count = sum(1 for r in rule_results if r.passed)
        pass_rate = (pass_count / len(rule_results) * 100) if rule_results else 0

        # Summary stats
        summary = {
            "total_rules": len(rule_results),
            "passed": pass_count,
            "failed": len(rule_results) - pass_count,
            "critical_passed": sum(1 for r in critical_rules if r.passed),
            "critical_total": len(critical_rules),
            "warnings": sum(1 for r in rule_results if r.severity == "warning" and not r.passed)
        }

        return ComplianceResult(
            ruleset_name=ruleset.get("name", ruleset_name),
            ruleset_version=ruleset.get("version", "1.0"),
            standard=ruleset.get("standard", ""),
            overall_passed=overall_passed,
            pass_rate=pass_rate,
            rule_results=rule_results,
            summary=summary
        )

    def _evaluate_rule(
        self,
        rule: Dict[str, Any],
        results: Dict[str, Any]
    ) -> RuleResult:
        """
        Evaluate a single rule.

        Args:
            rule: Rule definition
            results: Simulation results

        Returns:
            RuleResult
        """
        rule_id = rule.get("id", "unknown")
        rule_name = rule.get("name", "Unnamed Rule")
        category = rule.get("category", "general")
        severity = rule.get("severity", "critical")
        citation = rule.get("citation", "")

        # Get measured value from results
        metric_path = rule.get("metric", "")
        measured_value = self._get_nested_value(results, metric_path)

        # Get limit
        limit_type = rule.get("limit_type", "max")  # max, min, range
        limit_value = rule.get("limit", 0)

        # Evaluate
        if limit_type == "max":
            passed = measured_value <= limit_value
            margin = ((limit_value - measured_value) / limit_value * 100) if limit_value != 0 else 0
        elif limit_type == "min":
            passed = measured_value >= limit_value
            margin = ((measured_value - limit_value) / limit_value * 100) if limit_value != 0 else 0
        elif limit_type == "range":
            min_val = rule.get("min", 0)
            max_val = rule.get("max", 0)
            passed = min_val <= measured_value <= max_val
            # Margin to closest limit
            margin_to_min = ((measured_value - min_val) / min_val * 100) if min_val != 0 else 100
            margin_to_max = ((max_val - measured_value) / max_val * 100) if max_val != 0 else 100
            margin = min(margin_to_min, margin_to_max)
            limit_value = f"{min_val}-{max_val}"
        else:
            passed = False
            margin = 0

        return RuleResult(
            rule_id=rule_id,
            rule_name=rule_name,
            category=category,
            passed=passed,
            measured_value=measured_value,
            limit_value=limit_value,
            margin=margin,
            severity=severity,
            citation=citation
        )

    def _get_nested_value(self, data: Dict, path: str, default=0.0):
        """
        Get value from nested dictionary using dot notation.

        Example: "results.efficiency" -> data["results"]["efficiency"]
        """
        keys = path.split(".")
        value = data

        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default

        try:
            return float(value)
        except (ValueError, TypeError):
            return default

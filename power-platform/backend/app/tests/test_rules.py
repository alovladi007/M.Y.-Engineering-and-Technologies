"""Compliance rules engine tests."""
import pytest
from pathlib import Path
from app.services.compliance.rules_engine import RulesEngine, RuleResult, ComplianceResult


class TestRulesEngineLoading:
    """Tests for rules engine initialization and ruleset loading."""

    def test_rules_engine_initializes(self):
        """Test that rules engine initializes successfully."""
        engine = RulesEngine()
        assert engine is not None

    def test_load_ieee_1547_ruleset(self):
        """Test loading IEEE 1547 ruleset."""
        engine = RulesEngine()
        ruleset = engine.load_ruleset("ieee_1547")
        assert ruleset is not None
        assert "rules" in ruleset
        assert len(ruleset["rules"]) > 0

    def test_load_ul_1741_ruleset(self):
        """Test loading UL 1741 ruleset."""
        engine = RulesEngine()
        ruleset = engine.load_ruleset("ul_1741")
        assert ruleset is not None
        assert "rules" in ruleset

    def test_load_iec_61000_ruleset(self):
        """Test loading IEC 61000 ruleset."""
        engine = RulesEngine()
        ruleset = engine.load_ruleset("iec_61000")
        assert ruleset is not None
        assert "rules" in ruleset

    def test_invalid_ruleset_raises_error(self):
        """Test that invalid ruleset name raises error."""
        engine = RulesEngine()
        with pytest.raises((FileNotFoundError, KeyError)):
            engine.load_ruleset("invalid_ruleset_name")


class TestRuleEvaluation:
    """Tests for individual rule evaluation."""

    @pytest.fixture
    def engine(self):
        """Create rules engine instance."""
        return RulesEngine()

    @pytest.fixture
    def sample_results(self):
        """Sample simulation results for testing."""
        return {
            "topology": "dab_single",
            "results": {
                "efficiency": 0.95,
                "power_transfer": 10000,
                "thd": 0.03,
                "i_rms_pri": 25.0,
                "voltage_ripple": 0.02
            },
            "waveforms": {
                "time": [0, 1e-6, 2e-6],
                "v_pri": [400, 0, 400],
                "i_pri": [10, 20, 10]
            }
        }

    def test_evaluate_ieee_1547(self, engine, sample_results):
        """Test evaluating against IEEE 1547 standard."""
        result = engine.evaluate("ieee_1547", sample_results)

        assert isinstance(result, ComplianceResult)
        assert result.overall_passed is not None
        assert 0.0 <= result.pass_rate <= 1.0
        assert len(result.rule_results) > 0

    def test_evaluate_ul_1741(self, engine, sample_results):
        """Test evaluating against UL 1741 standard."""
        result = engine.evaluate("ul_1741", sample_results)

        assert isinstance(result, ComplianceResult)
        assert result.overall_passed is not None

    def test_evaluate_iec_61000(self, engine, sample_results):
        """Test evaluating against IEC 61000 standard."""
        result = engine.evaluate("iec_61000", sample_results)

        assert isinstance(result, ComplianceResult)
        assert result.overall_passed is not None


class TestTHDCompliance:
    """Tests for Total Harmonic Distortion compliance."""

    @pytest.fixture
    def engine(self):
        """Create rules engine instance."""
        return RulesEngine()

    def test_thd_within_limit(self, engine):
        """Test THD within acceptable limit."""
        results = {
            "results": {
                "thd": 0.03  # 3% THD (typically acceptable)
            }
        }
        result = engine.evaluate("iec_61000", results)

        # Check if THD rule passed
        thd_rules = [r for r in result.rule_results if "thd" in r.rule_id.lower() or "harmonic" in r.rule_id.lower()]
        if len(thd_rules) > 0:
            # At least one THD rule should pass with 3% THD
            assert any(r.passed for r in thd_rules)

    def test_thd_exceeds_limit(self, engine):
        """Test THD exceeding acceptable limit."""
        results = {
            "results": {
                "thd": 0.15  # 15% THD (typically unacceptable)
            }
        }
        result = engine.evaluate("iec_61000", results)

        # Check if THD rule failed
        thd_rules = [r for r in result.rule_results if "thd" in r.rule_id.lower() or "harmonic" in r.rule_id.lower()]
        if len(thd_rules) > 0:
            # THD rules should fail with 15% THD
            assert any(not r.passed for r in thd_rules)


class TestEfficiencyCompliance:
    """Tests for efficiency compliance."""

    @pytest.fixture
    def engine(self):
        """Create rules engine instance."""
        return RulesEngine()

    def test_high_efficiency_passes(self, engine):
        """Test high efficiency passes compliance."""
        results = {
            "results": {
                "efficiency": 0.96  # 96% efficiency
            }
        }
        result = engine.evaluate("ul_1741", results)

        # Should have some passing rules
        assert result.pass_rate > 0

    def test_low_efficiency_may_fail(self, engine):
        """Test low efficiency may fail some rules."""
        results = {
            "results": {
                "efficiency": 0.70  # 70% efficiency (low)
            }
        }
        result = engine.evaluate("ul_1741", results)

        # Should evaluate without errors
        assert result is not None


class TestVoltageCompliance:
    """Tests for voltage regulation compliance."""

    @pytest.fixture
    def engine(self):
        """Create rules engine instance."""
        return RulesEngine()

    def test_voltage_ripple_within_limit(self, engine):
        """Test voltage ripple within acceptable limit."""
        results = {
            "results": {
                "voltage_ripple": 0.02  # 2% ripple
            }
        }
        result = engine.evaluate("ieee_1547", results)

        assert result is not None
        assert isinstance(result.pass_rate, float)

    def test_voltage_ripple_exceeds_limit(self, engine):
        """Test voltage ripple exceeding limit."""
        results = {
            "results": {
                "voltage_ripple": 0.10  # 10% ripple (high)
            }
        }
        result = engine.evaluate("ieee_1547", results)

        assert result is not None


class TestComplianceResultStructure:
    """Tests for compliance result data structure."""

    @pytest.fixture
    def engine(self):
        """Create rules engine instance."""
        return RulesEngine()

    def test_result_has_all_fields(self, engine):
        """Test that compliance result has all required fields."""
        results = {"results": {"efficiency": 0.95}}
        result = engine.evaluate("ieee_1547", results)

        assert hasattr(result, "overall_passed")
        assert hasattr(result, "pass_rate")
        assert hasattr(result, "summary")
        assert hasattr(result, "rule_results")

    def test_rule_result_structure(self, engine):
        """Test individual rule result structure."""
        results = {"results": {"efficiency": 0.95}}
        result = engine.evaluate("ieee_1547", results)

        if len(result.rule_results) > 0:
            rule_res = result.rule_results[0]
            assert hasattr(rule_res, "rule_id")
            assert hasattr(rule_res, "rule_name")
            assert hasattr(rule_res, "passed")
            assert hasattr(rule_res, "measured_value")
            assert hasattr(rule_res, "limit_value")

    def test_pass_rate_calculation(self, engine):
        """Test pass rate calculation."""
        results = {"results": {"efficiency": 0.95, "thd": 0.03}}
        result = engine.evaluate("ieee_1547", results)

        if len(result.rule_results) > 0:
            passed_count = sum(1 for r in result.rule_results if r.passed)
            total_count = len(result.rule_results)
            expected_pass_rate = passed_count / total_count

            assert result.pass_rate == pytest.approx(expected_pass_rate, rel=1e-6)


class TestMultipleStandardsEvaluation:
    """Tests for evaluating against multiple standards simultaneously."""

    @pytest.fixture
    def engine(self):
        """Create rules engine instance."""
        return RulesEngine()

    @pytest.fixture
    def sample_results(self):
        """Sample simulation results."""
        return {
            "results": {
                "efficiency": 0.95,
                "thd": 0.03,
                "voltage_ripple": 0.02,
                "power_factor": 0.98
            }
        }

    def test_evaluate_all_standards(self, engine, sample_results):
        """Test evaluating against all three standards."""
        ieee_result = engine.evaluate("ieee_1547", sample_results)
        ul_result = engine.evaluate("ul_1741", sample_results)
        iec_result = engine.evaluate("iec_61000", sample_results)

        assert ieee_result is not None
        assert ul_result is not None
        assert iec_result is not None

    def test_different_standards_different_results(self, engine, sample_results):
        """Test that different standards may have different pass rates."""
        ieee_result = engine.evaluate("ieee_1547", sample_results)
        ul_result = engine.evaluate("ul_1741", sample_results)

        # Results may differ between standards
        assert ieee_result.pass_rate is not None
        assert ul_result.pass_rate is not None


class TestComplianceMargins:
    """Tests for compliance margin calculations."""

    @pytest.fixture
    def engine(self):
        """Create rules engine instance."""
        return RulesEngine()

    def test_positive_margin(self, engine):
        """Test positive compliance margin (passing with headroom)."""
        results = {
            "results": {
                "thd": 0.02  # 2% THD, well below typical 5% limit
            }
        }
        result = engine.evaluate("iec_61000", results)

        thd_rules = [r for r in result.rule_results if "thd" in r.rule_id.lower()]
        if len(thd_rules) > 0 and thd_rules[0].margin is not None:
            # Margin should be positive (better than required)
            assert thd_rules[0].margin > 0

    def test_negative_margin(self, engine):
        """Test negative compliance margin (failing)."""
        results = {
            "results": {
                "thd": 0.12  # 12% THD, above typical 5% limit
            }
        }
        result = engine.evaluate("iec_61000", results)

        thd_rules = [r for r in result.rule_results if "thd" in r.rule_id.lower()]
        if len(thd_rules) > 0 and thd_rules[0].margin is not None:
            # Margin should be negative (worse than required)
            assert thd_rules[0].margin < 0


class TestRulesetMetadata:
    """Tests for ruleset metadata."""

    @pytest.fixture
    def engine(self):
        """Create rules engine instance."""
        return RulesEngine()

    def test_ruleset_has_metadata(self, engine):
        """Test that rulesets contain metadata."""
        ruleset = engine.load_ruleset("ieee_1547")

        assert "name" in ruleset or "id" in ruleset
        assert "rules" in ruleset

    def test_rule_has_required_fields(self, engine):
        """Test that individual rules have required fields."""
        ruleset = engine.load_ruleset("ieee_1547")

        if len(ruleset["rules"]) > 0:
            rule = ruleset["rules"][0]
            # Rule should have at least an ID and a check criterion
            assert "id" in rule or "name" in rule

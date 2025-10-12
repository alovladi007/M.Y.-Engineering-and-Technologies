"""PDF report generator for compliance and simulation results."""
from typing import Dict, Any, List
from pathlib import Path
from datetime import datetime
import json
from jinja2 import Template
from weasyprint import HTML
import matplotlib.pyplot as plt
import io
import base64


class ReportGenerator:
    """Generate PDF reports from simulation and compliance results."""

    def __init__(self, template_dir: str = None):
        """
        Initialize report generator.

        Args:
            template_dir: Directory containing HTML templates
        """
        self.template_dir = template_dir or Path(__file__).parent / "html_templates"

    def generate_compliance_report(
        self,
        compliance_result: Any,
        simulation_results: Dict[str, Any],
        run_metadata: Dict[str, Any],
        output_path: str
    ) -> str:
        """
        Generate compliance PDF report.

        Args:
            compliance_result: ComplianceResult object
            simulation_results: Full simulation results
            run_metadata: Run metadata (project, user, timestamp)
            output_path: Output PDF file path

        Returns:
            Path to generated PDF
        """
        # Generate plots
        plots = self._generate_compliance_plots(compliance_result, simulation_results)

        # Render HTML from template
        html_content = self._render_compliance_html(
            compliance_result,
            simulation_results,
            run_metadata,
            plots
        )

        # Convert to PDF
        HTML(string=html_content).write_pdf(output_path)

        return output_path

    def generate_simulation_report(
        self,
        simulation_results: Dict[str, Any],
        run_metadata: Dict[str, Any],
        output_path: str
    ) -> str:
        """
        Generate simulation results PDF report.

        Args:
            simulation_results: Complete simulation results
            run_metadata: Run metadata
            output_path: Output PDF file path

        Returns:
            Path to generated PDF
        """
        # Generate plots
        plots = self._generate_simulation_plots(simulation_results)

        # Render HTML
        html_content = self._render_simulation_html(
            simulation_results,
            run_metadata,
            plots
        )

        # Convert to PDF
        HTML(string=html_content).write_pdf(output_path)

        return output_path

    def _generate_compliance_plots(
        self,
        compliance_result: Any,
        simulation_results: Dict[str, Any]
    ) -> Dict[str, str]:
        """Generate plots for compliance report (as base64 images)."""
        plots = {}

        # Pass/Fail summary pie chart
        fig, ax = plt.subplots(figsize=(6, 6))
        passed = compliance_result.summary["passed"]
        failed = compliance_result.summary["failed"]
        ax.pie(
            [passed, failed],
            labels=["Passed", "Failed"],
            colors=["#22c55e", "#ef4444"],
            autopct="%1.1f%%"
        )
        ax.set_title("Compliance Summary")
        plots["summary_pie"] = self._fig_to_base64(fig)
        plt.close(fig)

        # Rules by category
        categories = {}
        for rule in compliance_result.rule_results:
            cat = rule.category
            if cat not in categories:
                categories[cat] = {"passed": 0, "failed": 0}
            if rule.passed:
                categories[cat]["passed"] += 1
            else:
                categories[cat]["failed"] += 1

        fig, ax = plt.subplots(figsize=(10, 6))
        cat_names = list(categories.keys())
        passed_counts = [categories[c]["passed"] for c in cat_names]
        failed_counts = [categories[c]["failed"] for c in cat_names]

        x = range(len(cat_names))
        width = 0.35
        ax.bar(x, passed_counts, width, label="Passed", color="#22c55e")
        ax.bar([i + width for i in x], failed_counts, width, label="Failed", color="#ef4444")
        ax.set_xlabel("Category")
        ax.set_ylabel("Count")
        ax.set_title("Compliance by Category")
        ax.set_xticks([i + width/2 for i in x])
        ax.set_xticklabels(cat_names, rotation=45, ha="right")
        ax.legend()
        plt.tight_layout()
        plots["category_bar"] = self._fig_to_base64(fig)
        plt.close(fig)

        return plots

    def _generate_simulation_plots(self, results: Dict[str, Any]) -> Dict[str, str]:
        """Generate plots for simulation report."""
        plots = {}

        # Efficiency vs Load
        if "sweep_results" in results:
            fig, ax = plt.subplots(figsize=(10, 6))
            loads = [r["load"] for r in results["sweep_results"]]
            efficiencies = [r["efficiency"] for r in results["sweep_results"]]
            ax.plot(loads, efficiencies, marker="o", linewidth=2)
            ax.set_xlabel("Load (%)")
            ax.set_ylabel("Efficiency (%)")
            ax.set_title("Efficiency vs Load")
            ax.grid(True, alpha=0.3)
            plots["efficiency_curve"] = self._fig_to_base64(fig)
            plt.close(fig)

        # Waveforms
        if "waveforms" in results and "time" in results["waveforms"]:
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

            time = results["waveforms"]["time"][:200]  # First 200 points
            voltage = results["waveforms"]["v_primary"][:200]
            current = results["waveforms"]["i_primary"][:200]

            ax1.plot(time, voltage, linewidth=1.5)
            ax1.set_ylabel("Voltage (V)")
            ax1.set_title("Primary Voltage Waveform")
            ax1.grid(True, alpha=0.3)

            ax2.plot(time, current, linewidth=1.5, color="orange")
            ax2.set_xlabel("Time (s)")
            ax2.set_ylabel("Current (A)")
            ax2.set_title("Primary Current Waveform")
            ax2.grid(True, alpha=0.3)

            plt.tight_layout()
            plots["waveforms"] = self._fig_to_base64(fig)
            plt.close(fig)

        return plots

    def _render_compliance_html(
        self,
        compliance_result: Any,
        simulation_results: Dict[str, Any],
        metadata: Dict[str, Any],
        plots: Dict[str, str]
    ) -> str:
        """Render compliance report HTML."""
        template = Template("""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Compliance Report - {{ ruleset_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; border-bottom: 3px solid #667eea; }
        h2 { color: #555; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #667eea; color: white; }
        .passed { background-color: #d1fae5; color: #065f46; }
        .failed { background-color: #fee2e2; color: #991b1b; }
        .summary { background-color: #f3f4f6; padding: 20px; border-radius: 8px; }
        .plot { margin: 20px 0; text-align: center; }
        .plot img { max-width: 100%; height: auto; }
        .metadata { font-size: 0.9em; color: #666; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd;
                  font-size: 0.8em; color: #999; text-align: center; }
    </style>
</head>
<body>
    <h1>Compliance Report</h1>

    <div class="metadata">
        <p><strong>Standard:</strong> {{ standard }}</p>
        <p><strong>Ruleset:</strong> {{ ruleset_name }} v{{ version }}</p>
        <p><strong>Project:</strong> {{ project_name }}</p>
        <p><strong>Generated:</strong> {{ timestamp }}</p>
    </div>

    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Overall Result:</strong>
            <span class="{{ 'passed' if overall_passed else 'failed' }}">
                {{ 'PASSED' if overall_passed else 'FAILED' }}
            </span>
        </p>
        <p><strong>Pass Rate:</strong> {{ "%.1f"|format(pass_rate) }}%</p>
        <p><strong>Total Rules:</strong> {{ total_rules }}</p>
        <p><strong>Passed:</strong> {{ passed_count }}</p>
        <p><strong>Failed:</strong> {{ failed_count }}</p>
        <p><strong>Critical Rules:</strong> {{ critical_passed }}/{{ critical_total }}</p>
    </div>

    <div class="plot">
        <h2>Compliance Summary</h2>
        <img src="data:image/png;base64,{{ summary_pie }}" alt="Summary">
    </div>

    <div class="plot">
        <h2>Compliance by Category</h2>
        <img src="data:image/png;base64,{{ category_bar }}" alt="Categories">
    </div>

    <h2>Detailed Results</h2>
    <table>
        <thead>
            <tr>
                <th>Rule ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Measured</th>
                <th>Limit</th>
                <th>Margin</th>
                <th>Result</th>
                <th>Citation</th>
            </tr>
        </thead>
        <tbody>
            {% for rule in rules %}
            <tr class="{{ 'passed' if rule.passed else 'failed' }}">
                <td>{{ rule.rule_id }}</td>
                <td>{{ rule.rule_name }}</td>
                <td>{{ rule.category }}</td>
                <td>{{ "%.3f"|format(rule.measured_value) }}</td>
                <td>{{ rule.limit_value }}</td>
                <td>{{ "%.1f"|format(rule.margin) }}%</td>
                <td>{{ 'PASS' if rule.passed else 'FAIL' }}</td>
                <td>{{ rule.citation }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

    <div class="footer">
        <p>🤖 Generated with Power Platform - Cloud-Native Power Electronics</p>
        <p>© 2025 M.Y. Engineering and Technologies. All rights reserved.</p>
    </div>
</body>
</html>
        """)

        return template.render(
            ruleset_name=compliance_result.ruleset_name,
            version=compliance_result.ruleset_version,
            standard=compliance_result.standard,
            overall_passed=compliance_result.overall_passed,
            pass_rate=compliance_result.pass_rate,
            total_rules=compliance_result.summary["total_rules"],
            passed_count=compliance_result.summary["passed"],
            failed_count=compliance_result.summary["failed"],
            critical_passed=compliance_result.summary["critical_passed"],
            critical_total=compliance_result.summary["critical_total"],
            rules=compliance_result.rule_results,
            project_name=metadata.get("project_name", "Unknown"),
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            summary_pie=plots.get("summary_pie", ""),
            category_bar=plots.get("category_bar", "")
        )

    def _render_simulation_html(
        self,
        results: Dict[str, Any],
        metadata: Dict[str, Any],
        plots: Dict[str, str]
    ) -> str:
        """Render simulation report HTML."""
        # Similar structure to compliance report
        # Implementation would include topology details, operating point, losses, etc.
        return "<html><body><h1>Simulation Report</h1></body></html>"

    def _fig_to_base64(self, fig) -> str:
        """Convert matplotlib figure to base64 string."""
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=100, bbox_inches="tight")
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode("utf-8")
        buf.close()
        return img_base64

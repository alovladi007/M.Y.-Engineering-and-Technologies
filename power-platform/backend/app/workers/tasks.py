"""Celery tasks for asynchronous simulation execution."""
from typing import Dict, Any, Optional
from datetime import datetime
import traceback

from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.db.models import Run, RunStatus, Artifact
from app.services.sim.registry import TopologyRegistry
from app.services.sim.devices.library import DeviceLibrary
from app.services.sim.zvs.zvs_solver import calculate_zvs_boundary
from app.services.sim.zvs.zvs_maps import generate_zvs_heatmap
from app.services.compliance.rules_engine import RulesEngine
from app.services.reporting.pdf import ReportGenerator
from app.config import get_settings
from pathlib import Path
import json

settings = get_settings()


@celery_app.task(bind=True)
def run_simulation_task(
    self,
    run_id: int,
    topology: str,
    params: Dict[str, Any],
    device_name: Optional[str] = None,
    sweep: Optional[Dict[str, Any]] = None
):
    """
    Execute simulation in background.

    Args:
        run_id: Run database ID
        topology: Topology name
        params: Simulation parameters
        device_name: Device to use (optional)
        sweep: Sweep parameters (optional)
    """
    db = SessionLocal()

    try:
        # Update status
        run = db.query(Run).filter(Run.id == run_id).first()
        run.status = RunStatus.RUNNING
        db.commit()

        # Load device library
        device_lib = DeviceLibrary(
            csv_path=Path(settings.storage_path).parent / "data" / "devices" / "default_devices.csv"
        )

        # Get device parameters
        if device_name:
            device_params = device_lib.get_device_params(device_name)
        else:
            # Use default device
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

        # Create topology instance
        topo = TopologyRegistry.create(topology, **params)

        # Run simulation
        result = topo.simulate(device_params)

        if not result.success:
            raise Exception(result.error)

        # Store results
        run.results_json = {
            "topology": result.topology,
            "params": result.params,
            "results": result.results,
            "waveforms": result.waveforms
        }

        # Calculate ZVS if DAB
        if "dab" in topology.lower():
            zvs_boundary = calculate_zvs_boundary(
                vin=params.get("vin", 400),
                vout=params.get("vout", 400),
                n=params.get("n", 1.0),
                llk=params.get("llk", 10e-6),
                fsw=params.get("fsw", 100e3),
                coss=device_params["coss"],
                deadtime=params.get("deadtime", 100e-9)
            )

            # Generate ZVS heatmap
            storage_path = Path(settings.storage_path)
            zvs_map_path = storage_path / f"zvs_map_{run_id}.json"
            zvs_heatmap = generate_zvs_heatmap(zvs_boundary, str(zvs_map_path))

            run.results_json["zvs_analysis"] = {
                "boundary": {
                    "phi_deg": zvs_boundary["phi_deg"].tolist(),
                    "load_percent": zvs_boundary["load_percent"].tolist(),
                    "zvs_map": zvs_boundary["zvs_map"].tolist()
                },
                "heatmap": zvs_heatmap
            }

            # Create artifact
            artifact = Artifact(
                run_id=run_id,
                type="json",
                path=str(zvs_map_path)
            )
            db.add(artifact)

        # Mark as completed
        run.status = RunStatus.COMPLETED
        run.finished_at = datetime.utcnow()
        db.commit()

        return {"status": "success", "run_id": run_id}

    except Exception as e:
        # Mark as failed
        run = db.query(Run).filter(Run.id == run_id).first()
        run.status = RunStatus.FAILED
        run.error_message = str(e)
        run.finished_at = datetime.utcnow()
        db.commit()

        return {"status": "failed", "error": str(e), "traceback": traceback.format_exc()}

    finally:
        db.close()


@celery_app.task(bind=True)
def run_compliance_check(
    self,
    run_id: int,
    rulesets: list[str]
):
    """
    Run compliance check on simulation results.

    Args:
        run_id: Run database ID
        rulesets: List of ruleset names (e.g., ["ieee_1547", "ul_1741"])
    """
    db = SessionLocal()

    try:
        run = db.query(Run).filter(Run.id == run_id).first()

        if not run or not run.results_json:
            raise Exception("Run not found or no results available")

        # Initialize rules engine
        rules_engine = RulesEngine()

        compliance_results = {}

        for ruleset_name in rulesets:
            # Evaluate ruleset
            result = rules_engine.evaluate(ruleset_name, run.results_json)

            compliance_results[ruleset_name] = {
                "overall_passed": result.overall_passed,
                "pass_rate": result.pass_rate,
                "summary": result.summary,
                "rule_results": [
                    {
                        "rule_id": r.rule_id,
                        "rule_name": r.rule_name,
                        "passed": r.passed,
                        "measured": r.measured_value,
                        "limit": r.limit_value,
                        "margin": r.margin
                    }
                    for r in result.rule_results
                ]
            }

            # Generate PDF report
            report_gen = ReportGenerator()
            storage_path = Path(settings.storage_path)
            pdf_path = storage_path / f"compliance_{ruleset_name}_{run_id}.pdf"

            report_gen.generate_compliance_report(
                compliance_result=result,
                simulation_results=run.results_json,
                run_metadata={
                    "project_name": run.project.name,
                    "run_id": run_id,
                    "topology": run.topology
                },
                output_path=str(pdf_path)
            )

            # Create artifact
            artifact = Artifact(
                run_id=run_id,
                type="pdf",
                path=str(pdf_path),
                meta={"ruleset": ruleset_name}
            )
            db.add(artifact)

        # Store compliance results in run
        if not run.results_json.get("compliance"):
            run.results_json["compliance"] = {}

        run.results_json["compliance"].update(compliance_results)
        db.commit()

        return {"status": "success", "compliance_results": compliance_results}

    except Exception as e:
        return {"status": "failed", "error": str(e)}

    finally:
        db.close()

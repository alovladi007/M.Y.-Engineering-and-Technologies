"""Topology simulation API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

from app.db.session import get_db
from app.db.models import Run, Project, RunStatus, User, Org
from app.deps import get_current_user, get_current_org
from app.services.sim.registry import TopologyRegistry, get_topology_info
from app.services.sim.devices.library import DeviceLibrary
from app.workers.tasks import run_simulation_task

router = APIRouter(prefix="/sim/topologies", tags=["simulation"])


class SimulationRequest(BaseModel):
    """Simulation request."""
    project_id: int
    topology: str
    params: Dict[str, Any]
    device_name: Optional[str] = None
    sweep: Optional[Dict[str, Any]] = None


class SimulationResponse(BaseModel):
    """Simulation response."""
    run_id: int
    status: str
    message: str


@router.get("/list")
async def list_topologies():
    """List all available topologies."""
    return get_topology_info()


@router.post("/simulate", response_model=SimulationResponse)
async def create_simulation(
    request: SimulationRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    org: Org = Depends(get_current_org)
) -> SimulationResponse:
    """
    Create and run a new simulation.

    Args:
        request: Simulation parameters
        db: Database session
        user: Current user
        org: Current organization

    Returns:
        Run ID and status
    """
    # Validate project belongs to org
    project = db.query(Project).filter(
        Project.id == request.project_id,
        Project.org_id == org.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate topology exists
    try:
        TopologyRegistry.get(request.topology)
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Unknown topology: {request.topology}")

    # Create run record
    run = Run(
        project_id=project.id,
        topology=request.topology,
        params_json=request.params,
        status=RunStatus.PENDING,
        started_at=datetime.utcnow()
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Queue simulation task via Celery
    task = run_simulation_task.delay(
        run_id=run.id,
        topology=request.topology,
        params=request.params,
        device_name=request.device_name,
        sweep=request.sweep
    )

    return SimulationResponse(
        run_id=run.id,
        status="queued",
        message=f"Simulation queued for execution (task_id: {task.id})"
    )


@router.get("/run/{run_id}")
async def get_simulation_results(
    run_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    org: Org = Depends(get_current_org)
):
    """Get simulation run results."""
    # Get run
    run = db.query(Run).join(Project).filter(
        Run.id == run_id,
        Project.org_id == org.id
    ).first()

    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return {
        "id": run.id,
        "status": run.status.value,
        "topology": run.topology,
        "params": run.params_json,
        "results": run.results_json,
        "started_at": run.started_at,
        "finished_at": run.finished_at,
        "error_message": run.error_message
    }


@router.get("/run/{run_id}/waveforms")
async def get_waveforms(
    run_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    org: Org = Depends(get_current_org)
):
    """Get waveform data for run."""
    run = db.query(Run).join(Project).filter(
        Run.id == run_id,
        Project.org_id == org.id
    ).first()

    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    if not run.results_json:
        raise HTTPException(status_code=400, detail="No results available")

    waveforms = run.results_json.get("waveforms", {})

    return {
        "run_id": run_id,
        "waveforms": waveforms
    }

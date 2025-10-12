"""
Simulation run management API routes.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.db.models import Run, Project, User, Artifact, RunStatus
from app.deps import get_current_user, get_current_org
from pydantic import BaseModel

router = APIRouter(prefix="/runs", tags=["runs"])


class RunResponse(BaseModel):
    id: int
    project_id: int
    status: str
    topology: str
    params_json: dict
    results_json: dict | None = None
    error_message: str | None = None
    started_at: datetime
    finished_at: datetime | None = None

    class Config:
        from_attributes = True


class RunListItem(BaseModel):
    id: int
    project_id: int
    project_name: str
    status: str
    topology: str
    efficiency: float | None = None
    started_at: datetime
    finished_at: datetime | None = None

    class Config:
        from_attributes = True


class ArtifactResponse(BaseModel):
    id: int
    run_id: int
    artifact_type: str
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[RunListItem])
async def list_runs(
    project_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """List simulation runs, optionally filtered by project and status."""
    query = db.query(Run).join(Project).filter(Project.org_id == org.id)

    if project_id:
        query = query.filter(Run.project_id == project_id)

    if status_filter:
        query = query.filter(Run.status == status_filter)

    runs = query.order_by(Run.started_at.desc()).offset(skip).limit(limit).all()

    result = []
    for run in runs:
        project = db.query(Project).filter(Project.id == run.project_id).first()
        efficiency = None
        if run.results_json and "efficiency" in run.results_json:
            efficiency = run.results_json["efficiency"]

        result.append({
            "id": run.id,
            "project_id": run.project_id,
            "project_name": project.name if project else "Unknown",
            "status": run.status.value,
            "topology": run.topology,
            "efficiency": efficiency,
            "started_at": run.started_at,
            "finished_at": run.finished_at,
        })

    return result


@router.get("/{run_id}", response_model=RunResponse)
async def get_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Get simulation run details."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )

    # Check org ownership
    project = db.query(Project).filter(Project.id == run.project_id).first()
    if not project or project.org_id != org.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this run"
        )

    return run


@router.get("/{run_id}/artifacts", response_model=List[ArtifactResponse])
async def get_run_artifacts(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Get all artifacts for a simulation run."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )

    # Check org ownership
    project = db.query(Project).filter(Project.id == run.project_id).first()
    if not project or project.org_id != org.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this run"
        )

    artifacts = db.query(Artifact).filter(Artifact.run_id == run_id).all()
    return artifacts


@router.delete("/{run_id}")
async def delete_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Delete a simulation run."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )

    # Check org ownership
    project = db.query(Project).filter(Project.id == run.project_id).first()
    if not project or project.org_id != org.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this run"
        )

    # Delete associated artifacts
    db.query(Artifact).filter(Artifact.run_id == run_id).delete()

    db.delete(run)
    db.commit()

    return {"message": "Run deleted successfully"}


@router.post("/{run_id}/cancel")
async def cancel_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Cancel a running simulation."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )

    # Check org ownership
    project = db.query(Project).filter(Project.id == run.project_id).first()
    if not project or project.org_id != org.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this run"
        )

    if run.status not in [RunStatus.PENDING, RunStatus.RUNNING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Run is not in a cancellable state"
        )

    run.status = RunStatus.FAILED
    run.error_message = "Cancelled by user"
    run.finished_at = datetime.utcnow()
    db.commit()

    return {"message": "Run cancelled successfully"}

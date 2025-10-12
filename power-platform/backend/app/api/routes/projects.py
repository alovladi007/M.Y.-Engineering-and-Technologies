"""Project management API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.db.session import get_db
from app.db.models import Project, User, Org
from app.deps import get_current_user, get_current_org

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    """Project creation request."""
    name: str
    description: str = ""


class ProjectResponse(BaseModel):
    """Project response."""
    id: int
    name: str
    description: str
    created_at: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    org: Org = Depends(get_current_org)
):
    """List all projects in organization."""
    projects = db.query(Project).filter(Project.org_id == org.id).all()
    return projects


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    org: Org = Depends(get_current_org)
):
    """Create a new project."""
    db_project = Project(
        org_id=org.id,
        name=project.name,
        description=project.description
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    org: Org = Depends(get_current_org)
):
    """Get project details."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.org_id == org.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    org: Org = Depends(get_current_org)
):
    """Delete a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.org_id == org.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()

    return {"message": "Project deleted"}

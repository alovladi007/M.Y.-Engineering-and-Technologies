"""
File storage and management API routes.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import shutil
from pathlib import Path
import uuid

from app.db.session import get_db
from app.db.models import User, Artifact, Run, Project
from app.deps import get_current_user, get_current_org
from app.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/files", tags=["files"])

# Storage directory
STORAGE_DIR = Path(settings.STORAGE_PATH if hasattr(settings, 'STORAGE_PATH') else "backend/app/static/exports")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


class FileUploadResponse(BaseModel):
    file_id: str
    filename: str
    file_path: str
    size: int


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    run_id: int | None = None,
    artifact_type: str = "user_upload",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Upload a file and optionally associate it with a run."""
    if run_id:
        # Verify run exists and user has access
        run = db.query(Run).filter(Run.id == run_id).first()
        if not run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Run not found"
            )

        project = db.query(Project).filter(Project.id == run.project_id).first()
        if not project or project.org_id != org.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to upload to this run"
            )

    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    unique_filename = f"{file_id}{file_extension}"
    file_path = STORAGE_DIR / unique_filename

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = file_path.stat().st_size

    # Create artifact record if associated with a run
    if run_id:
        artifact = Artifact(
            run_id=run_id,
            artifact_type=artifact_type,
            file_path=str(file_path.relative_to(STORAGE_DIR.parent)),
        )
        db.add(artifact)
        db.commit()

    return {
        "file_id": file_id,
        "filename": file.filename,
        "file_path": str(file_path.relative_to(STORAGE_DIR.parent)),
        "size": file_size,
    }


@router.get("/download/{file_id}")
async def download_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Download a file by ID."""
    # Find file in storage
    matching_files = list(STORAGE_DIR.glob(f"{file_id}.*"))

    if not matching_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    file_path = matching_files[0]

    # Check if file is associated with an artifact
    artifact = db.query(Artifact).filter(
        Artifact.file_path.like(f"%{file_id}%")
    ).first()

    if artifact:
        # Verify user has access to the run
        run = db.query(Run).filter(Run.id == artifact.run_id).first()
        if run:
            project = db.query(Project).filter(Project.id == run.project_id).first()
            if not project or project.org_id != org.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to access this file"
                )

    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/octet-stream"
    )


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Delete a file by ID."""
    # Find file in storage
    matching_files = list(STORAGE_DIR.glob(f"{file_id}.*"))

    if not matching_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    file_path = matching_files[0]

    # Check if file is associated with an artifact
    artifact = db.query(Artifact).filter(
        Artifact.file_path.like(f"%{file_id}%")
    ).first()

    if artifact:
        # Verify user has access to the run
        run = db.query(Run).filter(Run.id == artifact.run_id).first()
        if run:
            project = db.query(Project).filter(Project.id == run.project_id).first()
            if not project or project.org_id != org.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to delete this file"
                )

        # Delete artifact record
        db.delete(artifact)
        db.commit()

    # Delete physical file
    file_path.unlink()

    return {"message": "File deleted successfully"}

"""
Studies API Endpoints
Manage DICOM studies
"""

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.study import Study
from app.models.image import MedicalImage

logger = structlog.get_logger()

router = APIRouter()


@router.get("/{study_uid}")
async def get_study(
    study_uid: str,
    db: AsyncSession = Depends(get_db),
):
    """Get study by Study Instance UID"""
    stmt = select(Study).where(Study.study_instance_uid == study_uid)
    result = await db.execute(stmt)
    study = result.scalar_one_or_none()

    if not study:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found")

    return {
        "study_instance_uid": study.study_instance_uid,
        "id": str(study.id),
        "patient_id": study.patient_id,
        "patient_age": study.patient_age,
        "patient_sex": study.patient_sex,
        "study_date": study.study_date.isoformat() if study.study_date else None,
        "study_description": study.study_description,
        "accession_number": study.accession_number,
        "status": study.status,
        "priority": study.priority,
        "num_series": study.num_series,
        "num_images": study.num_images,
        "created_at": study.created_at.isoformat(),
    }


@router.get("/{study_uid}/images")
async def get_study_images(
    study_uid: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all images in a study"""
    stmt = (
        select(MedicalImage)
        .where(MedicalImage.study_instance_uid == study_uid)
        .order_by(MedicalImage.series_instance_uid, MedicalImage.created_at)
    )

    result = await db.execute(stmt)
    images = result.scalars().all()

    if not images:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No images found for study")

    return {
        "study_instance_uid": study_uid,
        "count": len(images),
        "images": [
            {
                "id": str(img.id),
                "series_instance_uid": img.series_instance_uid,
                "sop_instance_uid": img.sop_instance_uid,
                "modality": img.modality,
                "rows": img.rows,
                "columns": img.columns,
                "acquisition_date": img.acquisition_date.isoformat() if img.acquisition_date else None,
                "status": img.status,
            }
            for img in images
        ],
    }


@router.get("/patient/{patient_id}/studies")
async def get_patient_studies(
    patient_id: str,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """Get all studies for a patient"""
    stmt = (
        select(Study)
        .where(Study.patient_id == patient_id)
        .order_by(Study.study_date.desc())
        .limit(limit)
        .offset(offset)
    )

    result = await db.execute(stmt)
    studies = result.scalars().all()

    return {
        "patient_id": patient_id,
        "count": len(studies),
        "studies": [
            {
                "study_instance_uid": study.study_instance_uid,
                "id": str(study.id),
                "study_date": study.study_date.isoformat() if study.study_date else None,
                "study_description": study.study_description,
                "num_images": study.num_images,
                "status": study.status,
                "priority": study.priority,
            }
            for study in studies
        ],
    }


@router.put("/{study_uid}/priority")
async def update_study_priority(
    study_uid: str,
    priority: str,
    db: AsyncSession = Depends(get_db),
):
    """Update study priority"""
    if priority not in ["stat", "urgent", "routine"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid priority. Must be: stat, urgent, or routine",
        )

    stmt = select(Study).where(Study.study_instance_uid == study_uid)
    result = await db.execute(stmt)
    study = result.scalar_one_or_none()

    if not study:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found")

    study.priority = priority
    await db.commit()

    logger.info("study_priority_updated", study_uid=study_uid, priority=priority)

    return {"message": "Priority updated successfully", "study_uid": study_uid, "priority": priority}


@router.get("/")
async def list_studies(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    modality: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List all studies with optional filters"""
    stmt = select(Study).order_by(Study.created_at.desc())

    if status:
        stmt = stmt.where(Study.status == status)
    if priority:
        stmt = stmt.where(Study.priority == priority)

    stmt = stmt.limit(limit).offset(offset)

    result = await db.execute(stmt)
    studies = result.scalars().all()

    return {
        "count": len(studies),
        "studies": [
            {
                "study_instance_uid": study.study_instance_uid,
                "patient_id": study.patient_id,
                "study_date": study.study_date.isoformat() if study.study_date else None,
                "study_description": study.study_description,
                "num_images": study.num_images,
                "status": study.status,
                "priority": study.priority,
                "created_at": study.created_at.isoformat(),
            }
            for study in studies
        ],
    }

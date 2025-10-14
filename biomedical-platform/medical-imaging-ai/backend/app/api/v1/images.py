"""
Images API Endpoints
Upload, retrieve, and manage medical images
"""

import structlog
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid
from pathlib import Path
import aiofiles

from app.core.database import get_db
from app.core.config import settings
from app.services.dicom_processor import DICOMProcessor
from app.models.image import MedicalImage
from app.models.study import Study
from sqlalchemy import select

logger = structlog.get_logger()

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_dicom_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload DICOM image

    - Accepts DICOM files (.dcm)
    - Validates DICOM format
    - Extracts metadata
    - Stores in database and filesystem
    """
    logger.info("uploading_dicom", filename=file.filename)

    # Validate file extension
    if not file.filename.endswith((".dcm", ".DCM", ".dicom")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only DICOM files (.dcm) are accepted.",
        )

    try:
        # Save uploaded file temporarily
        temp_path = Path(settings.DICOM_STORAGE_PATH) / "temp" / f"{uuid.uuid4()}.dcm"
        temp_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(temp_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        # Process DICOM
        dicom_processor = DICOMProcessor()
        ds = await dicom_processor.read_dicom(str(temp_path))

        # Validate DICOM
        is_valid, error_msg = await dicom_processor.validate_dicom(ds)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid DICOM file: {error_msg}",
            )

        # Extract metadata
        metadata = await dicom_processor.extract_metadata(ds)

        # Calculate file hash
        file_hash = await dicom_processor.calculate_file_hash(str(temp_path))

        # Check if image already exists
        stmt = select(MedicalImage).where(MedicalImage.sop_instance_uid == metadata["sop_instance_uid"])
        result = await db.execute(stmt)
        existing_image = result.scalar_one_or_none()

        if existing_image:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Image already exists",
            )

        # Create or get study
        study_uid = metadata["study_instance_uid"]
        stmt = select(Study).where(Study.study_instance_uid == study_uid)
        result = await db.execute(stmt)
        study = result.scalar_one_or_none()

        if not study:
            study = Study(
                study_instance_uid=study_uid,
                patient_id=metadata["patient_id"],
                patient_age=metadata["patient_age"],
                patient_sex=metadata["patient_sex"],
                study_date=metadata["acquisition_date"],
                status="pending",
            )
            db.add(study)

        # Move file to permanent storage
        final_path = (
            Path(settings.DICOM_STORAGE_PATH)
            / metadata["patient_id"]
            / study_uid
            / f"{metadata['sop_instance_uid']}.dcm"
        )
        final_path.parent.mkdir(parents=True, exist_ok=True)

        # Move file
        temp_path.rename(final_path)

        # Create database entry
        image = MedicalImage(
            study_instance_uid=metadata["study_instance_uid"],
            series_instance_uid=metadata["series_instance_uid"],
            sop_instance_uid=metadata["sop_instance_uid"],
            patient_id=metadata["patient_id"],
            patient_age=metadata["patient_age"],
            patient_sex=metadata["patient_sex"],
            modality=metadata["modality"],
            body_part=metadata["body_part"],
            image_orientation=metadata["image_orientation"],
            image_position=metadata["image_position"],
            rows=metadata["rows"],
            columns=metadata["columns"],
            pixel_spacing=metadata["pixel_spacing"],
            slice_thickness=metadata["slice_thickness"],
            bits_allocated=metadata["bits_allocated"],
            bits_stored=metadata["bits_stored"],
            acquisition_date=metadata["acquisition_date"],
            acquisition_time=metadata["acquisition_time"],
            manufacturer=metadata["manufacturer"],
            manufacturer_model=metadata["manufacturer_model"],
            institution_name=metadata["institution_name"],
            file_path=str(final_path),
            file_size=len(content),
            file_hash=file_hash,
            dicom_tags=metadata["dicom_tags"],
            status="pending",
        )

        db.add(image)
        await db.commit()
        await db.refresh(image)

        logger.info("dicom_uploaded", image_id=str(image.id), sop_instance_uid=metadata["sop_instance_uid"])

        return {
            "id": str(image.id),
            "sop_instance_uid": image.sop_instance_uid,
            "study_instance_uid": image.study_instance_uid,
            "series_instance_uid": image.series_instance_uid,
            "patient_id": image.patient_id,
            "modality": image.modality,
            "status": image.status,
            "created_at": image.created_at.isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("dicom_upload_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload DICOM: {str(e)}",
        )


@router.get("/{image_id}")
async def get_image(
    image_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get image by ID"""
    try:
        image_uuid = uuid.UUID(image_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image ID")

    stmt = select(MedicalImage).where(MedicalImage.id == image_uuid)
    result = await db.execute(stmt)
    image = result.scalar_one_or_none()

    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    return {
        "id": str(image.id),
        "sop_instance_uid": image.sop_instance_uid,
        "study_instance_uid": image.study_instance_uid,
        "series_instance_uid": image.series_instance_uid,
        "patient_id": image.patient_id,
        "patient_age": image.patient_age,
        "patient_sex": image.patient_sex,
        "modality": image.modality,
        "body_part": image.body_part,
        "rows": image.rows,
        "columns": image.columns,
        "acquisition_date": image.acquisition_date.isoformat() if image.acquisition_date else None,
        "status": image.status,
        "created_at": image.created_at.isoformat(),
        "updated_at": image.updated_at.isoformat(),
    }


@router.get("/{image_id}/download")
async def download_image(
    image_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Download DICOM file"""
    try:
        image_uuid = uuid.UUID(image_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image ID")

    stmt = select(MedicalImage).where(MedicalImage.id == image_uuid)
    result = await db.execute(stmt)
    image = result.scalar_one_or_none()

    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    if not Path(image.file_path).exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DICOM file not found on disk")

    return FileResponse(
        path=image.file_path,
        media_type="application/dicom",
        filename=f"{image.sop_instance_uid}.dcm",
    )


@router.get("/patient/{patient_id}")
async def get_patient_images(
    patient_id: str,
    modality: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """Get all images for a patient"""
    stmt = select(MedicalImage).where(MedicalImage.patient_id == patient_id)

    if modality:
        stmt = stmt.where(MedicalImage.modality == modality)

    stmt = stmt.limit(limit).offset(offset).order_by(MedicalImage.acquisition_date.desc())

    result = await db.execute(stmt)
    images = result.scalars().all()

    return {
        "patient_id": patient_id,
        "count": len(images),
        "images": [
            {
                "id": str(img.id),
                "sop_instance_uid": img.sop_instance_uid,
                "study_instance_uid": img.study_instance_uid,
                "modality": img.modality,
                "body_part": img.body_part,
                "acquisition_date": img.acquisition_date.isoformat() if img.acquisition_date else None,
                "status": img.status,
            }
            for img in images
        ],
    }


@router.delete("/{image_id}")
async def delete_image(
    image_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete image"""
    try:
        image_uuid = uuid.UUID(image_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image ID")

    stmt = select(MedicalImage).where(MedicalImage.id == image_uuid)
    result = await db.execute(stmt)
    image = result.scalar_one_or_none()

    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    # Delete file from disk
    if Path(image.file_path).exists():
        Path(image.file_path).unlink()

    # Delete from database
    await db.delete(image)
    await db.commit()

    logger.info("image_deleted", image_id=image_id)

    return {"message": "Image deleted successfully"}

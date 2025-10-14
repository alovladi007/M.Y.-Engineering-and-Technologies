"""
Inference API Endpoints
Run ML inference on medical images with Grad-CAM visualization
"""

import structlog
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import uuid
from pathlib import Path
from datetime import datetime
import numpy as np

from app.core.database import get_db
from app.models.image import MedicalImage
from app.models.inference_result import InferenceResult
from app.services.dicom_processor import DICOMProcessor
from app.services.gradcam_service import GradCAMService
from app.ml.model_loader import ModelRegistry
from sqlalchemy import select

logger = structlog.get_logger()

router = APIRouter()


@router.post("/{image_id}/analyze")
async def analyze_image(
    image_id: str,
    model_name: Optional[str] = None,
    generate_gradcam: bool = True,
    gradcam_method: str = "gradcam",
    db: AsyncSession = Depends(get_db),
    request: Request = None,
):
    """
    Run ML inference on medical image

    - Loads DICOM image
    - Preprocesses for ML model
    - Runs inference
    - Generates Grad-CAM visualization
    - Stores results in database
    """
    logger.info("analyzing_image", image_id=image_id, model_name=model_name)

    try:
        # Get image from database
        image_uuid = uuid.UUID(image_id)
        stmt = select(MedicalImage).where(MedicalImage.id == image_uuid)
        result = await db.execute(stmt)
        image = result.scalar_one_or_none()

        if not image:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

        # Auto-select model based on modality if not specified
        if model_name is None:
            models_for_modality = ModelRegistry.get_models_by_modality(image.modality)
            if models_for_modality:
                model_name = models_for_modality[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No models available for modality: {image.modality}",
                )

        # Get model loader and inference service from app state
        model_loader = request.app.state.model_loader
        inference_service = getattr(request.app.state, "inference_service", None)

        if not inference_service:
            from app.ml.inference_service import InferenceService

            inference_service = InferenceService(model_loader)
            request.app.state.inference_service = inference_service

        # Load DICOM
        dicom_processor = DICOMProcessor()
        ds = await dicom_processor.read_dicom(image.file_path)

        # Preprocess for inference
        preprocessed_image, preprocessing_info = await dicom_processor.preprocess_for_inference(ds)

        # Run inference
        inference_result = await inference_service.run_inference(
            model_name=model_name,
            image=preprocessed_image,
        )

        # Calculate triage priority
        triage_priority = await inference_service.calculate_triage_priority(inference_result)

        # Generate clinical findings
        findings = await inference_service.generate_clinical_findings(inference_result)

        # Generate Grad-CAM if requested
        gradcam_data = None
        if generate_gradcam:
            gradcam_service = GradCAMService()

            # Get model
            model = model_loader.get_model(model_name)
            if model:
                # Preprocess image for Grad-CAM
                input_tensor = await inference_service.preprocess_image(preprocessed_image)

                # Generate Grad-CAM
                try:
                    heatmap, gradcam_metadata = await gradcam_service.generate_gradcam(
                        model=model,
                        input_tensor=input_tensor,
                        target_class=inference_result["predicted_class_idx"],
                        method=gradcam_method,
                    )

                    # Create overlay
                    overlayed = await gradcam_service.overlay_heatmap(
                        original_image=preprocessed_image,
                        heatmap=heatmap,
                    )

                    # Extract attention regions
                    attention_regions = await gradcam_service.extract_attention_regions(heatmap)

                    # Calculate heatmap quality
                    heatmap_quality = await gradcam_service.calculate_heatmap_quality(heatmap)

                    # Save visualizations
                    output_dir = Path(settings.DICOM_STORAGE_PATH) / "gradcam" / str(image.id)
                    output_dir.mkdir(parents=True, exist_ok=True)

                    overlay_path = output_dir / f"overlay_{gradcam_method}.jpg"
                    await gradcam_service.save_visualization(overlayed, str(overlay_path))

                    gradcam_data = {
                        "heatmap_quality": heatmap_quality,
                        "attention_regions": attention_regions,
                        "overlay_path": str(overlay_path),
                        "metadata": gradcam_metadata,
                    }

                except Exception as e:
                    logger.error("gradcam_generation_failed", error=str(e))
                    gradcam_data = {"error": str(e)}

        # Determine confidence level
        confidence = inference_result["confidence"]
        if confidence > 0.9:
            confidence_level = "high"
        elif confidence > 0.7:
            confidence_level = "medium"
        else:
            confidence_level = "low"

        # Determine if requires radiologist review
        requires_review = "yes" if triage_priority in ["critical", "urgent"] or confidence < 0.7 else "no"

        # Create inference result record
        db_inference_result = InferenceResult(
            image_id=image.id,
            study_instance_uid=image.study_instance_uid,
            model_name=model_name,
            model_version="1.0",
            inference_time=inference_result["inference_time"],
            predictions=inference_result,
            predicted_class=inference_result["predicted_class"],
            confidence_score=confidence,
            is_high_confidence=confidence_level,
            predicted_labels=inference_result.get("multi_label_predictions", []),
            gradcam_local_path=gradcam_data["overlay_path"] if gradcam_data else None,
            heatmap_quality=gradcam_data["heatmap_quality"] if gradcam_data else None,
            attention_regions=gradcam_data["attention_regions"] if gradcam_data else None,
            findings=findings,
            triage_priority=triage_priority,
            requires_radiologist_review=requires_review,
            status="completed",
        )

        db.add(db_inference_result)

        # Update image status
        image.status = "completed"
        image.processed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(db_inference_result)

        logger.info(
            "analysis_completed",
            image_id=image_id,
            inference_id=str(db_inference_result.id),
            predicted_class=inference_result["predicted_class"],
            confidence=confidence,
        )

        return {
            "inference_id": str(db_inference_result.id),
            "image_id": image_id,
            "model_name": model_name,
            "predicted_class": inference_result["predicted_class"],
            "confidence": confidence,
            "confidence_level": confidence_level,
            "probabilities": inference_result["probabilities"],
            "classes": inference_result["classes"],
            "multi_label_predictions": inference_result.get("multi_label_predictions", []),
            "triage_priority": triage_priority,
            "requires_radiologist_review": requires_review,
            "findings": findings,
            "gradcam": gradcam_data,
            "inference_time": inference_result["inference_time"],
            "created_at": db_inference_result.created_at.isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("analysis_failed", image_id=image_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}",
        )


@router.get("/{inference_id}")
async def get_inference_result(
    inference_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get inference result by ID"""
    try:
        inference_uuid = uuid.UUID(inference_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid inference ID")

    stmt = select(InferenceResult).where(InferenceResult.id == inference_uuid)
    result = await db.execute(stmt)
    inference = result.scalar_one_or_none()

    if not inference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inference result not found")

    return {
        "id": str(inference.id),
        "image_id": str(inference.image_id),
        "model_name": inference.model_name,
        "predicted_class": inference.predicted_class,
        "confidence": inference.confidence_score,
        "confidence_level": inference.is_high_confidence,
        "predictions": inference.predictions,
        "predicted_labels": inference.predicted_labels,
        "triage_priority": inference.triage_priority,
        "requires_radiologist_review": inference.requires_radiologist_review,
        "findings": inference.findings,
        "attention_regions": inference.attention_regions,
        "heatmap_quality": inference.heatmap_quality,
        "inference_time": inference.inference_time,
        "status": inference.status,
        "created_at": inference.created_at.isoformat(),
    }


@router.get("/image/{image_id}/results")
async def get_image_inference_results(
    image_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all inference results for an image"""
    try:
        image_uuid = uuid.UUID(image_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image ID")

    stmt = (
        select(InferenceResult)
        .where(InferenceResult.image_id == image_uuid)
        .order_by(InferenceResult.created_at.desc())
    )

    result = await db.execute(stmt)
    inferences = result.scalars().all()

    return {
        "image_id": image_id,
        "count": len(inferences),
        "results": [
            {
                "id": str(inf.id),
                "model_name": inf.model_name,
                "predicted_class": inf.predicted_class,
                "confidence": inf.confidence_score,
                "triage_priority": inf.triage_priority,
                "created_at": inf.created_at.isoformat(),
            }
            for inf in inferences
        ],
    }


@router.get("/models/available")
async def list_available_models(request: Request):
    """List all available models"""
    model_loader = request.app.state.model_loader
    loaded_models = model_loader.list_models()

    models = []
    for model_name in loaded_models:
        model_config = ModelRegistry.get_model_config(model_name)
        model_info = model_loader.get_model_info(model_name)

        models.append(
            {
                "name": model_name,
                "description": model_config.get("description", ""),
                "architecture": model_config.get("architecture", ""),
                "modality": model_config.get("modality", ""),
                "num_classes": model_config.get("num_classes", 0),
                "classes": model_config.get("classes", []),
                "num_parameters": model_info.get("num_parameters", 0) if model_info else 0,
            }
        )

    return {"models": models, "count": len(models)}


@router.post("/{inference_id}/review")
async def submit_radiologist_review(
    inference_id: str,
    review: dict,
    db: AsyncSession = Depends(get_db),
):
    """
    Submit radiologist review for inference result

    Expected review format:
    {
        "radiologist_id": "string",
        "is_correct": "yes|no|partially",
        "feedback": "string",
        "true_label": "string" (optional)
    }
    """
    try:
        inference_uuid = uuid.UUID(inference_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid inference ID")

    stmt = select(InferenceResult).where(InferenceResult.id == inference_uuid)
    result = await db.execute(stmt)
    inference = result.scalar_one_or_none()

    if not inference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inference result not found")

    # Update review fields
    inference.reviewed_by = review.get("radiologist_id")
    inference.reviewed_at = datetime.utcnow()
    inference.radiologist_feedback = review.get("feedback")
    inference.is_correct = review.get("is_correct")
    inference.true_label = review.get("true_label")

    # Calculate if true/false positive
    if review.get("true_label"):
        inference.is_true_positive = (
            "yes" if inference.predicted_class == review["true_label"] else "no"
        )
        inference.is_false_positive = (
            "no" if inference.predicted_class == review["true_label"] else "yes"
        )

    await db.commit()

    logger.info(
        "review_submitted",
        inference_id=inference_id,
        radiologist=review.get("radiologist_id"),
        is_correct=review.get("is_correct"),
    )

    return {"message": "Review submitted successfully", "inference_id": inference_id}

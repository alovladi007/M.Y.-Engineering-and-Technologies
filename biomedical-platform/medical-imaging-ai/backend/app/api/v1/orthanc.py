"""
Orthanc PACS API Endpoints
Interface with Orthanc PACS server
"""

import structlog
from fastapi import APIRouter, HTTPException, status
from typing import Optional

from app.services.orthanc_client import OrthancClient

logger = structlog.get_logger()

router = APIRouter()


@router.get("/status")
async def get_orthanc_status():
    """Get Orthanc server status"""
    client = OrthancClient()

    try:
        is_available = await client.is_available()
        if not is_available:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Orthanc server not available",
            )

        system_info = await client.get_system_info()
        statistics = await client.get_statistics()

        return {
            "status": "available",
            "system_info": system_info,
            "statistics": statistics,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("orthanc_status_check_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check Orthanc status: {str(e)}",
        )


@router.get("/studies/search")
async def search_orthanc_studies(
    patient_id: Optional[str] = None,
    patient_name: Optional[str] = None,
    study_date: Optional[str] = None,
    modality: Optional[str] = None,
    limit: int = 100,
):
    """Search for studies in Orthanc"""
    client = OrthancClient()

    try:
        studies = await client.search_studies(
            patient_id=patient_id,
            patient_name=patient_name,
            study_date=study_date,
            modality=modality,
            limit=limit,
        )

        return {"count": len(studies), "studies": studies}
    except Exception as e:
        logger.error("orthanc_search_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}",
        )


@router.get("/studies/{study_id}")
async def get_orthanc_study(study_id: str):
    """Get study from Orthanc"""
    client = OrthancClient()

    try:
        study = await client.get_study(study_id)
        metadata = await client.get_study_metadata(study_id)

        return {"study": study, "metadata": metadata}
    except Exception as e:
        logger.error("orthanc_get_study_failed", study_id=study_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Study not found: {str(e)}",
        )


@router.get("/studies/{study_id}/download")
async def download_orthanc_study(study_id: str):
    """Download study from Orthanc as ZIP"""
    from fastapi.responses import Response

    client = OrthancClient()

    try:
        zip_data = await client.download_study(study_id)

        return Response(
            content=zip_data,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=study_{study_id}.zip"},
        )
    except Exception as e:
        logger.error("orthanc_download_failed", study_id=study_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Download failed: {str(e)}",
        )


@router.post("/studies/{study_id}/retrieve")
async def retrieve_study_from_pacs(
    study_id: str,
    modality: str,
):
    """Retrieve study from remote PACS"""
    client = OrthancClient()

    try:
        result = await client.retrieve_from_modality(modality, study_id)

        return {"message": "Study retrieved successfully", "result": result}
    except Exception as e:
        logger.error("pacs_retrieve_failed", study_id=study_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retrieve failed: {str(e)}",
        )


@router.delete("/studies/{study_id}")
async def delete_orthanc_study(study_id: str):
    """Delete study from Orthanc"""
    client = OrthancClient()

    try:
        await client.delete_study(study_id)

        return {"message": "Study deleted successfully"}
    except Exception as e:
        logger.error("orthanc_delete_failed", study_id=study_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}",
        )


@router.get("/modalities")
async def list_orthanc_modalities():
    """List configured DICOM modalities"""
    client = OrthancClient()

    try:
        modalities = await client.get_modalities()

        return {"modalities": modalities, "count": len(modalities)}
    except Exception as e:
        logger.error("orthanc_modalities_list_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list modalities: {str(e)}",
        )


@router.get("/worklist")
async def get_orthanc_worklist():
    """Get DICOM worklist"""
    client = OrthancClient()

    try:
        worklist = await client.get_worklist()

        return {"worklist": worklist, "count": len(worklist)}
    except Exception as e:
        logger.error("orthanc_worklist_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get worklist: {str(e)}",
        )

"""
API v1 Router
"""

from fastapi import APIRouter

from app.api.v1 import images, inference, studies, orthanc

router = APIRouter()

# Include sub-routers
router.include_router(images.router, prefix="/images", tags=["images"])
router.include_router(inference.router, prefix="/inference", tags=["inference"])
router.include_router(studies.router, prefix="/studies", tags=["studies"])
router.include_router(orthanc.router, prefix="/orthanc", tags=["orthanc"])

"""
API v1 Router
"""

from fastapi import APIRouter
from app.api.v1.endpoints import experiments, models, signals

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(
    experiments.router,
    prefix="/experiments",
    tags=["experiments"]
)

api_router.include_router(
    models.router,
    prefix="/models",
    tags=["models"]
)

api_router.include_router(
    signals.router,
    prefix="/signals",
    tags=["signals"]
)

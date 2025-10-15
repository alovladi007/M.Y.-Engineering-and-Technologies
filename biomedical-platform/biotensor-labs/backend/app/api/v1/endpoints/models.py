"""
Models API endpoints - Model registry and management
"""

from fastapi import APIRouter, HTTPException
import mlflow
from mlflow.tracking import MlflowClient
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def list_registered_models():
    """List all registered models"""
    try:
        client = MlflowClient()
        models = client.search_registered_models()
        return {
            "models": [
                {
                    "name": model.name,
                    "creation_timestamp": model.creation_timestamp,
                    "last_updated_timestamp": model.last_updated_timestamp,
                    "description": model.description,
                    "latest_versions": [
                        {
                            "version": version.version,
                            "stage": version.current_stage,
                        }
                        for version in model.latest_versions
                    ],
                }
                for model in models
            ]
        }
    except Exception as e:
        logger.error(f"Failed to list models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{model_name}")
async def get_model(model_name: str):
    """Get registered model details"""
    try:
        client = MlflowClient()
        model = client.get_registered_model(model_name)
        versions = client.search_model_versions(f"name='{model_name}'")

        return {
            "name": model.name,
            "creation_timestamp": model.creation_timestamp,
            "last_updated_timestamp": model.last_updated_timestamp,
            "description": model.description,
            "versions": [
                {
                    "version": version.version,
                    "stage": version.current_stage,
                    "status": version.status,
                    "run_id": version.run_id,
                }
                for version in versions
            ],
        }
    except Exception as e:
        logger.error(f"Failed to get model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

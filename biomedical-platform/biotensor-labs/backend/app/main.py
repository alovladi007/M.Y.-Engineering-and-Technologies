"""
BioTensor Labs Backend - Main Application
MLOps platform for biomedical signal processing and experiment tracking
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import mlflow
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1 import api_router

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("🚀 Starting BioTensor Labs Backend")

    # Initialize MLflow
    try:
        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        logger.info(f"MLflow tracking URI: {settings.MLFLOW_TRACKING_URI}")

        # Create default experiment if it doesn't exist
        try:
            experiment = mlflow.get_experiment_by_name("Default")
            if experiment is None:
                mlflow.create_experiment("Default")
                logger.info("Created default MLflow experiment")
        except Exception as e:
            logger.warning(f"Could not create default experiment: {e}")

    except Exception as e:
        logger.error(f"Failed to initialize MLflow: {e}")

    logger.info("✅ BioTensor Labs Backend started successfully")

    yield

    # Shutdown
    logger.info("👋 Shutting down BioTensor Labs Backend")


# Create FastAPI application
app = FastAPI(
    title="BioTensor Labs API",
    description="MLOps platform for biomedical signal processing and experiment tracking",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check MLflow connection
        mlflow_status = "healthy"
        try:
            mlflow.search_experiments(max_results=1)
        except Exception as e:
            mlflow_status = f"unhealthy: {str(e)}"

        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "service": "biotensor-labs-backend",
                "version": "1.0.0",
                "mlflow_status": mlflow_status,
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "BioTensor Labs API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


# Include API router
app.include_router(api_router, prefix="/api/v1")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )

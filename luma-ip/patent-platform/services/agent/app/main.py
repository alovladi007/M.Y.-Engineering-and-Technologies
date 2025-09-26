"""Main FastAPI application for the Patent Agent Service."""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.routes import runs, ingest, search
from app.db.session import engine
from app.db import models

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    # Startup
    logger.info("Starting Patent Agent Service...")
    # Create database tables
    models.Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    logger.info("Shutting down Patent Agent Service...")


app = FastAPI(
    title="Patent Agent Service",
    description="AI-powered patent drafting and analysis service",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def verify_shared_secret(x_shared_secret: str = Header(None)):
    """Verify the shared secret for inter-service communication."""
    if settings.AGENT_SHARED_SECRET and x_shared_secret != settings.AGENT_SHARED_SECRET:
        raise HTTPException(status_code=401, detail="Invalid shared secret")
    return True


# Include routers
app.include_router(runs.router, prefix="/runs", tags=["runs"])
app.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
app.include_router(search.router, prefix="/search", tags=["search"])


@app.get("/")
def root():
    """Root endpoint with service information."""
    return {
        "service": "Patent Agent Service",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "runs": "/runs",
            "ingest": "/ingest",
            "search": "/search",
        },
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "patent-agent",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
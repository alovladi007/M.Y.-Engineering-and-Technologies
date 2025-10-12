"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.config import get_settings
from app.api.routes import auth, users, orgs, projects, runs, files, compliance, reports, websocket
from app.api.routes.sim import topologies, zvs, device_lib, hil

settings = get_settings()

app = FastAPI(
    title="Power Platform API",
    description="Cloud-Native Power Electronics Simulation Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(orgs.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(runs.router, prefix="/api")
app.include_router(files.router, prefix="/api")
app.include_router(compliance.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(topologies.router, prefix="/api")
app.include_router(zvs.router, prefix="/api")
app.include_router(device_lib.router, prefix="/api")
app.include_router(hil.router, prefix="/api")
app.include_router(websocket.router)

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Power Platform API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )

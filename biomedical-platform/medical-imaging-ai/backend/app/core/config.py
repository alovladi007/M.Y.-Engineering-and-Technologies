"""
Application Configuration
Environment-based configuration using Pydantic Settings
"""

from typing import List, Optional
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "Medical Imaging AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 5002

    # Security
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
        ]
    )

    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # Database
    DATABASE_URL: str = Field(..., description="PostgreSQL connection URL")
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    REDIS_TTL: int = 3600  # 1 hour cache

    # Celery
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/1")

    # AWS Configuration
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: str = "medical-imaging-storage"
    AWS_KMS_KEY_ID: Optional[str] = None

    # DICOM Storage
    DICOM_STORAGE_PATH: str = "/data/dicom"
    DICOM_MAX_FILE_SIZE: int = 500 * 1024 * 1024  # 500 MB

    # Orthanc PACS Configuration
    ORTHANC_URL: str = "http://localhost:8042"
    ORTHANC_USERNAME: Optional[str] = "orthanc"
    ORTHANC_PASSWORD: Optional[str] = None
    ORTHANC_AET: str = "ORTHANC"

    # ML Models
    MODEL_PATH: str = "/models"
    MODEL_CACHE_SIZE: int = 5  # Number of models to keep in memory

    # Supported Models
    RESNET50_ENABLED: bool = True
    EFFICIENTNET_ENABLED: bool = True
    DENSENET_ENABLED: bool = True
    CUSTOM_MODEL_ENABLED: bool = False

    # Grad-CAM Configuration
    GRADCAM_LAYER_NAME: Optional[str] = None  # Auto-detect if None
    GRADCAM_COLORMAP: str = "jet"  # OpenCV colormap
    GRADCAM_ALPHA: float = 0.5  # Overlay transparency

    # Inference Settings
    BATCH_SIZE: int = 8
    NUM_WORKERS: int = 4
    INFERENCE_TIMEOUT: int = 300  # 5 minutes
    GPU_ENABLED: bool = True
    GPU_DEVICE_ID: int = 0

    # Image Processing
    IMAGE_SIZE: int = 512  # Default image size for models
    NORMALIZE_MEAN: List[float] = [0.485, 0.456, 0.406]
    NORMALIZE_STD: List[float] = [0.229, 0.224, 0.225]

    # KServe / Model Serving
    KSERVE_ENABLED: bool = False
    KSERVE_URL: Optional[str] = None
    TRITON_ENABLED: bool = False
    TRITON_URL: Optional[str] = None

    # MLflow
    MLFLOW_TRACKING_URI: Optional[str] = None
    MLFLOW_EXPERIMENT_NAME: str = "medical-imaging-ai"

    # Monitoring
    PROMETHEUS_ENABLED: bool = True
    SENTRY_DSN: Optional[str] = None

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # HIPAA Compliance
    AUDIT_LOG_ENABLED: bool = True
    AUDIT_LOG_S3_BUCKET: Optional[str] = None
    PHI_ENCRYPTION_ENABLED: bool = True

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

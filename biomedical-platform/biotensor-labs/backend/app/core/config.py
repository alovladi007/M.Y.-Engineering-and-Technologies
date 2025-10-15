"""
Configuration management using Pydantic Settings
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""

    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 5005
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/biotensor_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # MLflow
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MLFLOW_BACKEND_STORE_URI: str = "postgresql://user:password@localhost:5432/mlflow_db"
    MLFLOW_ARTIFACT_ROOT: str = "./mlruns"
    MLFLOW_DEFAULT_ARTIFACT_ROOT: str = "./mlruns"

    # AWS
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_DEFAULT_REGION: str = "us-east-1"
    S3_BUCKET: str = "biotensor-artifacts"

    # Weights & Biases
    WANDB_API_KEY: str = ""
    WANDB_ENTITY: str = ""
    WANDB_PROJECT: str = "biotensor-labs"

    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production"
    JWT_SECRET_KEY: str = "change-this-jwt-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3005",
    ]

    # Experiment Configuration
    MAX_PARALLEL_EXPERIMENTS: int = 5
    EXPERIMENT_TIMEOUT_HOURS: int = 24
    AUTO_LOG_MODELS: bool = True
    AUTO_LOG_METRICS: bool = True

    # Signal Processing
    DEFAULT_SAMPLING_RATE: int = 1000
    MAX_SIGNAL_LENGTH: int = 1000000

    # Model Registry
    MODEL_REGISTRY_PATH: str = "./models"
    ENABLE_MODEL_VERSIONING: bool = True

    # Feature Flags
    ENABLE_GPU: bool = False
    ENABLE_DISTRIBUTED_TRAINING: bool = False
    ENABLE_AUTO_TUNING: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

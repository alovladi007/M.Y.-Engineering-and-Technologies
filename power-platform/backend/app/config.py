"""Application configuration."""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # Database
    database_url: str = "postgresql://poweruser:powerpass@localhost:5432/powerdb"
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "powerdb"
    database_user: str = "poweruser"
    database_password: str = "powerpass"

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    secret_key: str = "change-this-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    oauth_redirect_uri: str = "http://localhost:3000/auth/callback"

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # File Storage
    storage_path: str = "/app/static/exports"
    max_upload_size: int = 52428800  # 50MB

    # Environment
    environment: str = "development"
    debug: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Create a module-level settings instance for convenience
settings = get_settings()

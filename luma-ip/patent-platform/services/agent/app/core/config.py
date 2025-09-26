"""Configuration settings for the Patent Agent Service."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""

    # General
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/patentdb"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # API URLs
    NEST_API_URL: str = "http://localhost:3001"
    AGENT_SHARED_SECRET: Optional[str] = "supersecret"

    # AI Models
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    EMBEDDINGS_MODEL: str = "text-embedding-3-small"
    CHAT_MODEL: str = "gpt-4-mini"
    ANTHROPIC_MODEL: str = "claude-3-haiku-20240307"

    # Vector Search
    VECTOR_DIMENSION: int = 1536
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
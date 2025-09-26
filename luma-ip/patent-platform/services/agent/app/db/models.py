"""Database models for the Patent Agent Service."""

from sqlalchemy import Column, String, JSON, Float, Integer, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from pgvector.sqlalchemy import Vector
import uuid

from app.db.session import Base


class AgentRun(Base):
    """Agent run model."""

    __tablename__ = "agent_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    matter_id = Column(UUID(as_uuid=True), nullable=False)
    status = Column(String, default="QUEUED")
    goals = Column(JSON)
    output = Column(JSON)
    logs = Column(ARRAY(String))
    tokens = Column(Integer)
    cost_usd = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class VectorChunk(Base):
    """Vector chunk model for RAG."""

    __tablename__ = "vector_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(String, nullable=False)  # MPEP, CFR, TEMPLATE, USER_DOC
    source_id = Column(String)
    text = Column(Text, nullable=False)
    embedding = Column(Vector(1536))  # Adjust dimension based on model
    metadata = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
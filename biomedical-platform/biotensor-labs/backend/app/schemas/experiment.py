"""
Pydantic schemas for experiments
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class ExperimentCreate(BaseModel):
    """Schema for creating a new experiment"""
    name: str = Field(..., min_length=1, max_length=255)
    artifact_location: Optional[str] = None
    tags: Optional[Dict[str, str]] = None


class ExperimentResponse(BaseModel):
    """Schema for experiment response"""
    experiment_id: str
    name: str
    artifact_location: str
    lifecycle_stage: str
    tags: Dict[str, str]
    creation_time: datetime
    last_update_time: datetime


class ExperimentRunCreate(BaseModel):
    """Schema for creating a new run"""
    run_name: Optional[str] = None
    tags: Optional[Dict[str, str]] = None
    parameters: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, float]] = None


class ExperimentRunResponse(BaseModel):
    """Schema for run response"""
    run_id: str
    experiment_id: str
    run_name: Optional[str] = None
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    artifact_uri: str
    metrics: Optional[Dict[str, float]] = None
    params: Optional[Dict[str, Any]] = None
    tags: Optional[Dict[str, str]] = None


class MetricLog(BaseModel):
    """Schema for logging a metric"""
    key: str
    value: float
    step: Optional[int] = None


class ParameterLog(BaseModel):
    """Schema for logging a parameter"""
    key: str
    value: Any

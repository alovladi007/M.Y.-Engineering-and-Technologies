"""
Experiments API endpoints - MLflow experiment tracking
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import mlflow
from mlflow.entities import ViewType
from datetime import datetime
import logging

from app.schemas.experiment import (
    ExperimentCreate,
    ExperimentResponse,
    ExperimentRunCreate,
    ExperimentRunResponse,
    MetricLog,
    ParameterLog,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[ExperimentResponse])
async def list_experiments(
    view_type: str = Query("ACTIVE_ONLY", regex="^(ACTIVE_ONLY|DELETED_ONLY|ALL)$"),
    max_results: int = Query(100, ge=1, le=1000),
):
    """List all MLflow experiments"""
    try:
        # Convert view_type string to ViewType enum
        view_type_enum = ViewType.ACTIVE_ONLY
        if view_type == "DELETED_ONLY":
            view_type_enum = ViewType.DELETED_ONLY
        elif view_type == "ALL":
            view_type_enum = ViewType.ALL

        experiments = mlflow.search_experiments(
            view_type=view_type_enum,
            max_results=max_results
        )

        return [
            ExperimentResponse(
                experiment_id=exp.experiment_id,
                name=exp.name,
                artifact_location=exp.artifact_location,
                lifecycle_stage=exp.lifecycle_stage,
                tags=exp.tags,
                creation_time=datetime.fromtimestamp(exp.creation_time / 1000),
                last_update_time=datetime.fromtimestamp(exp.last_update_time / 1000),
            )
            for exp in experiments
        ]
    except Exception as e:
        logger.error(f"Failed to list experiments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=ExperimentResponse)
async def create_experiment(experiment: ExperimentCreate):
    """Create a new MLflow experiment"""
    try:
        # Check if experiment already exists
        existing = mlflow.get_experiment_by_name(experiment.name)
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"Experiment '{experiment.name}' already exists"
            )

        # Create experiment
        experiment_id = mlflow.create_experiment(
            name=experiment.name,
            artifact_location=experiment.artifact_location,
            tags=experiment.tags or {},
        )

        # Get created experiment
        created_exp = mlflow.get_experiment(experiment_id)

        return ExperimentResponse(
            experiment_id=created_exp.experiment_id,
            name=created_exp.name,
            artifact_location=created_exp.artifact_location,
            lifecycle_stage=created_exp.lifecycle_stage,
            tags=created_exp.tags,
            creation_time=datetime.fromtimestamp(created_exp.creation_time / 1000),
            last_update_time=datetime.fromtimestamp(created_exp.last_update_time / 1000),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{experiment_id}", response_model=ExperimentResponse)
async def get_experiment(experiment_id: str):
    """Get experiment by ID"""
    try:
        exp = mlflow.get_experiment(experiment_id)
        if not exp:
            raise HTTPException(status_code=404, detail="Experiment not found")

        return ExperimentResponse(
            experiment_id=exp.experiment_id,
            name=exp.name,
            artifact_location=exp.artifact_location,
            lifecycle_stage=exp.lifecycle_stage,
            tags=exp.tags,
            creation_time=datetime.fromtimestamp(exp.creation_time / 1000),
            last_update_time=datetime.fromtimestamp(exp.last_update_time / 1000),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{experiment_id}")
async def delete_experiment(experiment_id: str):
    """Delete experiment"""
    try:
        mlflow.delete_experiment(experiment_id)
        return {"message": f"Experiment {experiment_id} deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{experiment_id}/runs", response_model=ExperimentRunResponse)
async def create_run(experiment_id: str, run_data: ExperimentRunCreate):
    """Start a new experiment run"""
    try:
        # Start MLflow run
        with mlflow.start_run(
            experiment_id=experiment_id,
            run_name=run_data.run_name,
            tags=run_data.tags or {},
        ) as run:
            # Log parameters
            if run_data.parameters:
                mlflow.log_params(run_data.parameters)

            # Log initial metrics
            if run_data.metrics:
                for metric_name, metric_value in run_data.metrics.items():
                    mlflow.log_metric(metric_name, metric_value)

            run_info = run.info

        return ExperimentRunResponse(
            run_id=run_info.run_id,
            experiment_id=run_info.experiment_id,
            run_name=run_info.run_name,
            status=run_info.status,
            start_time=datetime.fromtimestamp(run_info.start_time / 1000),
            end_time=datetime.fromtimestamp(run_info.end_time / 1000) if run_info.end_time else None,
            artifact_uri=run_info.artifact_uri,
        )
    except Exception as e:
        logger.error(f"Failed to create run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{experiment_id}/runs", response_model=List[ExperimentRunResponse])
async def list_runs(
    experiment_id: str,
    max_results: int = Query(100, ge=1, le=1000),
):
    """List all runs for an experiment"""
    try:
        runs = mlflow.search_runs(
            experiment_ids=[experiment_id],
            max_results=max_results,
            order_by=["start_time DESC"],
        )

        return [
            ExperimentRunResponse(
                run_id=run.info.run_id,
                experiment_id=run.info.experiment_id,
                run_name=run.info.run_name,
                status=run.info.status,
                start_time=datetime.fromtimestamp(run.info.start_time / 1000),
                end_time=datetime.fromtimestamp(run.info.end_time / 1000) if run.info.end_time else None,
                artifact_uri=run.info.artifact_uri,
                metrics=run.data.metrics,
                params=run.data.params,
                tags=run.data.tags,
            )
            for _, run in runs.iterrows()
        ]
    except Exception as e:
        logger.error(f"Failed to list runs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/runs/{run_id}/log-metric")
async def log_metric(run_id: str, metric: MetricLog):
    """Log a metric to a run"""
    try:
        with mlflow.start_run(run_id=run_id):
            mlflow.log_metric(
                key=metric.key,
                value=metric.value,
                step=metric.step,
            )
        return {"message": "Metric logged successfully"}
    except Exception as e:
        logger.error(f"Failed to log metric: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/runs/{run_id}/log-parameter")
async def log_parameter(run_id: str, parameter: ParameterLog):
    """Log a parameter to a run"""
    try:
        with mlflow.start_run(run_id=run_id):
            mlflow.log_param(key=parameter.key, value=parameter.value)
        return {"message": "Parameter logged successfully"}
    except Exception as e:
        logger.error(f"Failed to log parameter: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/runs/{run_id}/end")
async def end_run(run_id: str, status: str = "FINISHED"):
    """End an experiment run"""
    try:
        mlflow.end_run(status=status)
        return {"message": f"Run {run_id} ended with status {status}"}
    except Exception as e:
        logger.error(f"Failed to end run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/runs/{run_id}", response_model=ExperimentRunResponse)
async def get_run(run_id: str):
    """Get run details"""
    try:
        run = mlflow.get_run(run_id)

        return ExperimentRunResponse(
            run_id=run.info.run_id,
            experiment_id=run.info.experiment_id,
            run_name=run.info.run_name,
            status=run.info.status,
            start_time=datetime.fromtimestamp(run.info.start_time / 1000),
            end_time=datetime.fromtimestamp(run.info.end_time / 1000) if run.info.end_time else None,
            artifact_uri=run.info.artifact_uri,
            metrics=run.data.metrics,
            params=run.data.params,
            tags=run.data.tags,
        )
    except Exception as e:
        logger.error(f"Failed to get run: {e}")
        raise HTTPException(status_code=500, detail=str(e))

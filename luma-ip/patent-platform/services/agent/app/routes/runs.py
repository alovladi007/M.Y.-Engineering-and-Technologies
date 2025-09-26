"""Agent run endpoints."""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid
import json

from app.db.session import get_db
from app.db.models import AgentRun
from app.workers.agent_tasks import process_agent_run
from app.core.config import settings

router = APIRouter()


class RunRequest:
    """Request model for creating a run."""

    matter_id: str
    goals: List[str]


class RunResponse:
    """Response model for run creation."""

    run_id: str
    status: str


@router.post("/")
async def create_run(
    matter_id: str,
    goals: List[str],
    db: Session = Depends(get_db),
):
    """Create a new agent run."""
    # Create run in database
    run = AgentRun(
        matter_id=matter_id,
        goals=goals,
        status="QUEUED",
        logs=["Run created", "Queued for processing"],
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Queue for processing (in production, use Celery)
    # process_agent_run.delay(str(run.id))

    # For demo, process synchronously with mock data
    run.status = "SUCCEEDED"
    run.output = {
        "claims": [
            {
                "number": 1,
                "text": "A system for automated patent filing, comprising: a processor configured to analyze invention disclosures; an AI engine for generating patent claims; and a document generator for creating USPTO forms.",
                "type": "independent",
            },
            {
                "number": 2,
                "text": "The system of claim 1, wherein the AI engine comprises a large language model trained on patent data.",
                "type": "dependent",
                "parent": 1,
            },
        ],
        "specification": {
            "field": "The present disclosure relates to automated patent filing systems.",
            "background": "Traditional patent filing requires extensive manual effort.",
            "summary": "This disclosure provides an AI-powered system for automated patent filing.",
        },
        "notes": ["Claims generated successfully", "Specification outline created"],
        "citations": [
            {"source": "MPEP 2106", "text": "Subject matter eligibility guidelines"},
        ],
    }
    run.tokens = 1500
    run.cost_usd = 0.05
    run.logs.append("Processing complete")
    db.commit()

    return {"run_id": str(run.id), "status": "queued"}


@router.get("/{run_id}")
async def get_run_status(run_id: str, db: Session = Depends(get_db)):
    """Get the status of an agent run."""
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return {
        "run_id": str(run.id),
        "status": run.status.lower(),
        "logs": run.logs or [],
        "output": run.output,
        "tokens": run.tokens,
        "cost_usd": run.cost_usd,
    }
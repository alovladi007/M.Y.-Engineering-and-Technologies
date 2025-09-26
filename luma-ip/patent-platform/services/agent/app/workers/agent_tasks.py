"""Agent processing tasks."""

from celery import Celery
from app.core.config import settings

# Initialize Celery
celery_app = Celery("patent_agent", broker=settings.REDIS_URL)


@celery_app.task
def process_agent_run(run_id: str):
    """Process an agent run asynchronously."""
    # In production, this would run the LangGraph pipeline
    print(f"Processing agent run: {run_id}")
    return {"status": "completed"}
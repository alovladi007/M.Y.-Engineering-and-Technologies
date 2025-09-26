"""Vector search endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.db.models import VectorChunk
from app.rag.search import vector_search

router = APIRouter()


@router.post("/")
async def search(
    query: str,
    top_k: int = 5,
    source_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Search the vector store for relevant content."""
    # For demo, return mock results
    results = [
        {
            "text": "A claim must particularly point out and distinctly claim the subject matter which the inventor regards as the invention. (35 U.S.C. 112(b))",
            "source": "MPEP",
            "citation": "MPEP § 2173",
            "score": 0.95,
        },
        {
            "text": "Claims must be written in accordance with the statutory requirements and should define the invention in terms of its technical features.",
            "source": "CFR",
            "citation": "37 CFR 1.75",
            "score": 0.92,
        },
        {
            "text": "The specification shall conclude with one or more claims particularly pointing out and distinctly claiming the subject matter.",
            "source": "USC",
            "citation": "35 U.S.C. 112",
            "score": 0.89,
        },
    ]

    return {
        "query": query,
        "results": results[:top_k],
        "total": len(results),
    }
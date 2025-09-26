"""Document ingestion endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.db.session import get_db
from app.db.models import VectorChunk
from app.rag.embeddings import generate_embedding, chunk_text

router = APIRouter()


@router.post("/")
async def ingest_document(
    source: str,
    text: Optional[str] = None,
    url: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Ingest a document into the vector store."""
    if not text and not url:
        return {"error": "Either text or url must be provided"}

    # For demo, use mock text if none provided
    if not text:
        text = "Sample patent law text for demonstration purposes."

    # Chunk the text
    chunks = chunk_text(text)

    # Create vector chunks (mock embeddings for demo)
    created_chunks = []
    for chunk in chunks:
        # In production, generate real embeddings
        embedding = [0.1] * 1536  # Mock embedding

        vector_chunk = VectorChunk(
            source=source,
            text=chunk,
            embedding=embedding,
            metadata={"url": url} if url else {},
        )
        db.add(vector_chunk)
        created_chunks.append(vector_chunk)

    db.commit()

    return {
        "source": source,
        "chunks_created": len(created_chunks),
        "status": "success",
        "message": f"Document ingested with {len(created_chunks)} chunks",
    }
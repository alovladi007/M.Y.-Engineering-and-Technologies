"""Vector search utilities."""

from typing import List, Dict, Any
import numpy as np


def vector_search(
    query_embedding: List[float],
    top_k: int = 5,
    source_filter: str = None,
) -> List[Dict[str, Any]]:
    """Perform vector similarity search."""
    # In production, query PostgreSQL with pgvector
    # For demo, return mock results
    return [
        {
            "text": "Sample patent law text",
            "source": "MPEP",
            "score": 0.95,
        }
    ]


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate cosine similarity between two vectors."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
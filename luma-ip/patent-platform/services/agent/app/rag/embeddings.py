"""Embedding generation utilities."""

from typing import List
import numpy as np


def generate_embedding(text: str) -> List[float]:
    """Generate embeddings for text."""
    # In production, use OpenAI or other embedding model
    # For demo, return mock embedding
    return [0.1] * 1536


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """Chunk text into overlapping segments."""
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks
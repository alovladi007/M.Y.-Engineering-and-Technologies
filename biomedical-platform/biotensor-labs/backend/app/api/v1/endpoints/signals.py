"""
Signal Processing API endpoints
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
import numpy as np
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/preprocess")
async def preprocess_signal(
    file: UploadFile = File(...),
    sampling_rate: int = 1000,
    filter_type: str = "bandpass",
):
    """Preprocess biomedical signal"""
    try:
        # Read signal data
        content = await file.read()
        signal = np.frombuffer(content, dtype=np.float32)

        # Basic preprocessing
        # In production, this would use scipy.signal for filtering
        processed_signal = signal  # Placeholder

        return {
            "message": "Signal preprocessed successfully",
            "original_length": len(signal),
            "processed_length": len(processed_signal),
            "sampling_rate": sampling_rate,
        }
    except Exception as e:
        logger.error(f"Failed to preprocess signal: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-features")
async def extract_features(
    file: UploadFile = File(...),
    features: List[str] = ["mean", "std", "peak"],
):
    """Extract features from biomedical signal"""
    try:
        content = await file.read()
        signal = np.frombuffer(content, dtype=np.float32)

        extracted_features = {
            "mean": float(np.mean(signal)),
            "std": float(np.std(signal)),
            "min": float(np.min(signal)),
            "max": float(np.max(signal)),
            "peak_to_peak": float(np.ptp(signal)),
        }

        return {
            "features": extracted_features,
            "signal_length": len(signal),
        }
    except Exception as e:
        logger.error(f"Failed to extract features: {e}")
        raise HTTPException(status_code=500, detail=str(e))

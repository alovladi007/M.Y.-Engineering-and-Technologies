# Medical Imaging AI Backend - Production Dockerfile
# Multi-stage build for Python/FastAPI application with PyTorch

# Stage 1: Base with Python and system dependencies
FROM python:3.11-slim as base

# Install system dependencies for medical imaging
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    gdcm-tools \
    dcmtk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Stage 2: Dependencies
FROM base as dependencies

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 3: Application
FROM base as application

# Copy installed dependencies from previous stage
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copy application code
COPY app/ /app/app/

# Create directories for models and data
RUN mkdir -p /models /data/dicom /data/gradcam

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app /models /data

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5002/health')"

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=5002

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5002"]

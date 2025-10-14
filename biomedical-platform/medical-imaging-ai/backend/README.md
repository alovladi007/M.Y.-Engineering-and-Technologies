# Medical Imaging AI Backend

Advanced medical imaging analysis platform with **Explainable AI (Grad-CAM)**, DICOM processing, and Orthanc PACS integration. Built with Python, FastAPI, and PyTorch.

## 🚀 Features

### Core Capabilities

1. **DICOM Processing**
   - Full DICOM file parsing with pydicom
   - Metadata extraction (patient info, acquisition details, image properties)
   - Pixel array extraction with Hounsfield unit conversion
   - Modality-specific normalization (CT, MRI, X-Ray)
   - DICOM anonymization (PHI removal, UID regeneration)
   - Validation and integrity checking

2. **ML Inference**
   - Multiple model architectures (ResNet50, EfficientNet, DenseNet)
   - Batch inference processing
   - Ensemble predictions
   - Uncertainty quantification (Monte Carlo Dropout)
   - Multi-label classification
   - Automatic model selection by modality

3. **Grad-CAM Explainability**
   - Multiple Grad-CAM variants (Grad-CAM, Grad-CAM++, Score-CAM, XGrad-CAM)
   - Auto-detection of target convolutional layers
   - Heatmap generation and overlay visualization
   - Attention region extraction with bounding boxes
   - Multi-layer visualization support
   - Quality scoring for heatmaps

4. **Orthanc PACS Integration**
   - DICOM query/retrieve (C-FIND/C-MOVE)
   - Study upload and download
   - Remote modality communication
   - Worklist management
   - Study anonymization and modification

5. **Clinical Features**
   - Automatic triage prioritization (critical, urgent, routine, normal)
   - Clinical findings generation
   - Radiologist review workflow
   - Confidence-based review flagging

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI application entry point
│   ├── core/
│   │   ├── config.py            # Configuration management
│   │   └── database.py          # Async SQLAlchemy setup
│   ├── models/
│   │   ├── image.py             # Medical image model
│   │   ├── study.py             # DICOM study model
│   │   ├── inference_result.py  # ML inference results
│   │   └── annotation.py        # Radiologist annotations
│   ├── ml/
│   │   ├── model_loader.py      # PyTorch model management
│   │   └── inference_service.py # ML inference orchestration
│   ├── services/
│   │   ├── dicom_processor.py   # DICOM file processing
│   │   ├── gradcam_service.py   # Grad-CAM visualization
│   │   └── orthanc_client.py    # Orthanc PACS client
│   └── api/
│       └── v1/
│           ├── images.py         # Image upload/management
│           ├── inference.py      # ML inference endpoints
│           ├── studies.py        # Study management
│           └── orthanc.py        # PACS operations
├── requirements.txt             # Python dependencies
├── pyproject.toml              # Project configuration
├── Dockerfile                  # Production container
└── .env.example               # Environment variables template
```

## 🛠 Technology Stack

- **Framework**: FastAPI (async)
- **Language**: Python 3.11+
- **Database**: PostgreSQL with asyncpg
- **ML Framework**: PyTorch with timm
- **DICOM**: pydicom, pynetdicom
- **Image Processing**: OpenCV, PIL, numpy
- **Explainable AI**: pytorch-grad-cam
- **PACS**: Orthanc via REST API
- **Logging**: structlog
- **Monitoring**: Prometheus

## 📦 Installation

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Orthanc PACS Server (optional)
- CUDA-capable GPU (optional, for faster inference)

### Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations (Alembic)
alembic upgrade head
```

## 🚀 Running the Application

### Development

```bash
# With auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 5002

# Or with environment variables
PORT=5002 DEBUG=true uvicorn app.main:app --reload
```

### Production

```bash
# With Gunicorn and Uvicorn workers
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:5002 \
  --log-level info
```

### Docker

```bash
# Build image
docker build -t medical-imaging-ai:latest .

# Run container
docker run -d \
  -p 5002:5002 \
  -v /path/to/models:/models \
  -v /path/to/dicom:/data/dicom \
  --env-file .env \
  medical-imaging-ai:latest
```

## 📚 API Documentation

Once running, access interactive API docs:
- **Swagger UI**: http://localhost:5002/api/docs
- **ReDoc**: http://localhost:5002/api/redoc
- **OpenAPI JSON**: http://localhost:5002/api/openapi.json

### Key Endpoints

#### Images
- `POST /api/v1/images/upload` - Upload DICOM file
- `GET /api/v1/images/{image_id}` - Get image metadata
- `GET /api/v1/images/{image_id}/download` - Download DICOM file
- `GET /api/v1/images/patient/{patient_id}` - Get patient images
- `DELETE /api/v1/images/{image_id}` - Delete image

#### Inference
- `POST /api/v1/inference/{image_id}/analyze` - Run ML inference with Grad-CAM
- `GET /api/v1/inference/{inference_id}` - Get inference result
- `GET /api/v1/inference/image/{image_id}/results` - Get all results for image
- `GET /api/v1/inference/models/available` - List available models
- `POST /api/v1/inference/{inference_id}/review` - Submit radiologist review

#### Studies
- `GET /api/v1/studies/{study_uid}` - Get study by UID
- `GET /api/v1/studies/{study_uid}/images` - Get study images
- `GET /api/v1/studies/patient/{patient_id}/studies` - Get patient studies
- `PUT /api/v1/studies/{study_uid}/priority` - Update study priority

#### Orthanc PACS
- `GET /api/v1/orthanc/status` - Get Orthanc server status
- `GET /api/v1/orthanc/studies/search` - Search studies in PACS
- `GET /api/v1/orthanc/studies/{study_id}` - Get study from PACS
- `GET /api/v1/orthanc/studies/{study_id}/download` - Download study as ZIP
- `POST /api/v1/orthanc/studies/{study_id}/retrieve` - Retrieve from remote PACS

## 🔧 Configuration

### Environment Variables

See [.env.example](./.env.example) for all available configuration options.

Key configurations:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/medical_imaging_db

# DICOM Storage
DICOM_STORAGE_PATH=/data/dicom

# Orthanc PACS
ORTHANC_URL=http://localhost:8042
ORTHANC_USERNAME=orthanc
ORTHANC_PASSWORD=orthanc

# ML Models
MODEL_PATH=/models
GPU_ENABLED=true

# Grad-CAM
GRADCAM_COLORMAP=jet
GRADCAM_ALPHA=0.5
```

### Supported Models

The system supports multiple pre-trained models via `timm`:

1. **ResNet50** (Chest X-Ray)
   - 14 pathology classes
   - Modality: X-Ray
   - Input: 512x512

2. **EfficientNet-B0** (CT Scan)
   - COVID-19, Pneumonia, Normal
   - Modality: CT
   - Input: 512x512

3. **DenseNet121** (Brain MRI)
   - Brain tumor classification
   - Modality: MRI
   - Input: 512x512

### Adding Custom Models

```python
# app/ml/model_loader.py
await model_loader.load_model(
    model_name="custom_model",
    model_type="resnet34",
    checkpoint_path="/models/custom_weights.pth",
    num_classes=5,
    pretrained=False
)
```

## 🔬 Usage Examples

### Upload and Analyze DICOM

```python
import requests

# Upload DICOM
with open("chest_xray.dcm", "rb") as f:
    response = requests.post(
        "http://localhost:5002/api/v1/images/upload",
        files={"file": f}
    )
    image_id = response.json()["id"]

# Run inference with Grad-CAM
response = requests.post(
    f"http://localhost:5002/api/v1/inference/{image_id}/analyze",
    params={
        "model_name": "resnet50_chest_xray",
        "generate_gradcam": True,
        "gradcam_method": "gradcam"
    }
)

result = response.json()
print(f"Prediction: {result['predicted_class']}")
print(f"Confidence: {result['confidence']:.2%}")
print(f"Triage Priority: {result['triage_priority']}")
```

### Batch Processing

```python
import asyncio
from app.ml.inference_service import InferenceService

async def batch_analyze(image_paths):
    inference_service = InferenceService(model_loader)

    # Load images
    images = [load_dicom(path) for path in image_paths]

    # Batch inference
    results = await inference_service.run_batch_inference(
        model_name="efficientnet_b0_ct_scan",
        images=images
    )

    return results
```

### Uncertainty Quantification

```python
# Quantify prediction uncertainty
response = requests.post(
    f"http://localhost:5002/api/v1/inference/{image_id}/uncertainty",
    params={
        "model_name": "resnet50_chest_xray",
        "num_samples": 20
    }
)

uncertainty = response.json()
print(f"Epistemic Uncertainty: {uncertainty['epistemic_uncertainty']:.4f}")
print(f"Prediction Entropy: {uncertainty['prediction_entropy']:.4f}")
```

## 📊 Database Schema

### Medical Images
- DICOM metadata (Study/Series/SOP Instance UIDs)
- Patient information (de-identified)
- Image properties (dimensions, modality, acquisition info)
- Processing status
- Quality metrics

### Inference Results
- Model predictions with confidence scores
- Grad-CAM visualization paths
- Attention regions (bounding boxes)
- Triage priority
- Clinical findings
- Radiologist review status

### Studies
- Study-level metadata
- Patient demographics
- Study status and priority
- Statistics (num images, num series)

### Annotations
- Radiologist annotations
- Classification labels
- Segmentation masks
- Bounding boxes
- Measurements
- Clinical notes

## 🔐 Security & HIPAA Compliance

- **PHI Encryption**: All sensitive data encrypted at rest
- **Audit Logging**: Complete audit trail of all access
- **DICOM Anonymization**: Automatic PHI removal from DICOM files
- **Access Control**: Role-based access control (RBAC)
- **Secure Communication**: TLS 1.3 in production

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_dicom_processor.py

# Run with verbose output
pytest -v
```

## 📈 Monitoring

### Prometheus Metrics

Access metrics at: http://localhost:5002/metrics

Available metrics:
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency
- `ml_inferences_total` - Total ML inferences
- `ml_inference_duration_seconds` - Inference latency

### Health Checks

- `/health` - Basic health check
- `/ready` - Readiness check (models loaded)

## 🚧 Development

### Code Quality

```bash
# Format code
black app/
isort app/

# Lint
flake8 app/

# Type checking
mypy app/
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 📝 License

Proprietary - M.Y. Engineering and Technologies

## 🤝 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for better healthcare through AI**

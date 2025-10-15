# BioTensor Labs Backend

MLOps platform for biomedical signal processing and experiment tracking. Built with FastAPI, MLflow, and advanced signal processing libraries.

## 🚀 Features

### Core Capabilities

1. **MLflow Experiment Tracking**
   - Full experiment lifecycle management
   - Run tracking with parameters and metrics
   - Artifact storage (models, plots, data)
   - Experiment comparison
   - Model versioning

2. **Model Registry**
   - Centralized model storage
   - Version management
   - Stage transitions (staging, production)
   - Model lineage tracking

3. **Biomedical Signal Processing**
   - ECG, EEG, EMG signal analysis
   - Time-series preprocessing
   - Feature extraction
   - Wavelet transforms
   - Spectral analysis

4. **Automated ML Pipeline**
   - Hyperparameter tuning
   - Model training orchestration
   - Cross-validation
   - Performance metrics

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── core/
│   │   ├── config.py        # Settings management
│   │   └── logging.py       # Logging setup
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           ├── experiments.py  # Experiment tracking
│   │           ├── models.py       # Model registry
│   │           └── signals.py      # Signal processing
│   └── schemas/
│       └── experiment.py     # Pydantic models
├── requirements.txt
├── .env.example
└── README.md
```

## 🛠 Technology Stack

- **Framework**: FastAPI
- **ML Tracking**: MLflow
- **Signal Processing**: scipy, librosa, pywavelets
- **Deep Learning**: PyTorch, TensorFlow
- **Database**: PostgreSQL (MLflow backend)
- **Storage**: S3 (artifacts)
- **Job Queue**: Celery
- **Monitoring**: Prometheus, Weights & Biases

## 📦 Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run MLflow server (separate terminal)
mlflow server \
  --backend-store-uri postgresql://user:pass@localhost/mlflow_db \
  --default-artifact-root ./mlruns \
  --host 0.0.0.0 \
  --port 5000
```

## 🚀 Development

```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 5005

# Access at http://localhost:5005
# API docs at http://localhost:5005/docs
```

## 📖 API Documentation

### Base URL
```
http://localhost:5005/api/v1
```

### Endpoints

#### Experiments

- `GET /experiments` - List all experiments
- `POST /experiments` - Create experiment
- `GET /experiments/{id}` - Get experiment details
- `DELETE /experiments/{id}` - Delete experiment
- `POST /experiments/{id}/runs` - Start new run
- `GET /experiments/{id}/runs` - List runs
- `POST /runs/{id}/log-metric` - Log metric
- `POST /runs/{id}/log-parameter` - Log parameter
- `POST /runs/{id}/end` - End run

#### Models

- `GET /models` - List registered models
- `GET /models/{name}` - Get model details

#### Signals

- `POST /signals/preprocess` - Preprocess signal
- `POST /signals/extract-features` - Extract features

## 🔧 Configuration

See [.env.example](./.env.example) for all configuration options.

**Key Settings:**
- `MLFLOW_TRACKING_URI` - MLflow server URL
- `DATABASE_URL` - PostgreSQL connection
- `S3_BUCKET` - Artifact storage bucket
- `ENABLE_GPU` - Enable GPU acceleration

## 📊 MLflow Integration

### Experiment Tracking

```python
import mlflow

# Start experiment
with mlflow.start_run(experiment_id="exp_id"):
    # Log parameters
    mlflow.log_param("learning_rate", 0.01)

    # Log metrics
    mlflow.log_metric("accuracy", 0.95)

    # Log model
    mlflow.pytorch.log_model(model, "model")
```

### Model Registry

```python
# Register model
mlflow.register_model(
    model_uri=f"runs:/{run_id}/model",
    name="ECG-Classifier"
)

# Transition to production
client.transition_model_version_stage(
    name="ECG-Classifier",
    version=1,
    stage="Production"
)
```

## 🧪 Signal Processing

Supported signal types:
- ECG (Electrocardiogram)
- EEG (Electroencephalogram)
- EMG (Electromyogram)
- PPG (Photoplethysmogram)
- Respiration signals
- Blood pressure waveforms

## 🚢 Deployment

### Docker

```bash
docker build -t biotensor-labs-backend:latest .
docker run -d -p 5005:5005 biotensor-labs-backend:latest
```

## 📝 License

Proprietary - M.Y. Engineering and Technologies

---

**Built with FastAPI, MLflow, and Python**

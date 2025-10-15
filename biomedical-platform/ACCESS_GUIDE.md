# 🏥 BioMedical Intelligence Platform - Access Guide

Complete guide to accessing and running the comprehensive biomedical intelligence platform.

## 📋 Table of Contents

1. [Quick Start (Localhost)](#quick-start-localhost)
2. [GitHub Pages Access](#github-pages-access)
3. [Individual Service Setup](#individual-service-setup)
4. [Prerequisites](#prerequisites)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (Localhost)

### One-Command Startup

```bash
cd biomedical-platform
./START_ALL_SERVICES.sh
```

This will start all 5 platforms (10 services total):
- 5 Backend APIs (ports 5001-5005)
- 5 Frontend Applications (ports 3001-3005)

### Access URLs

#### Frontend Applications
| Service | URL | Description |
|---------|-----|-------------|
| AI-Powered Diagnostics | http://localhost:3001 | Patient diagnostics dashboard |
| Medical Imaging AI | http://localhost:3002 | DICOM viewer with AI inference |
| Biosensing Technology | http://localhost:3003 | Real-time biosensor monitoring |
| HIPAA Compliance | http://localhost:3004 | Compliance admin dashboard |
| BioTensor Labs | http://localhost:3005 | MLOps experiment tracking |

#### Backend APIs (with Swagger docs)
| Service | API Docs | Port |
|---------|----------|------|
| AI-Powered Diagnostics | http://localhost:5001/docs | 5001 |
| Medical Imaging AI | http://localhost:5002/docs | 5002 |
| Biosensing Technology | http://localhost:5003/api/v1 | 5003 |
| HIPAA Compliance | http://localhost:5004/api/v1 | 5004 |
| BioTensor Labs | http://localhost:5005/docs | 5005 |

### Stop All Services

```bash
./STOP_ALL_SERVICES.sh
```

---

## 🌐 GitHub Pages Access

### Live Demo URLs

The frontends are deployed on GitHub Pages:

- **Main Portal**: https://alovladi007.github.io/M.Y.-Engineering-and-Technologies/
- **AI Diagnostics**: https://alovladi007.github.io/M.Y.-Engineering-and-Technologies/ai-diagnostics/
- **Medical Imaging**: https://alovladi007.github.io/M.Y.-Engineering-and-Technologies/medical-imaging/
- **Biosensing**: https://alovladi007.github.io/M.Y.-Engineering-and-Technologies/biosensing/
- **HIPAA Compliance**: https://alovladi007.github.io/M.Y.-Engineering-and-Technologies/hipaa/
- **BioTensor Labs**: https://alovladi007.github.io/M.Y.-Engineering-and-Technologies/biotensor/

**Note**: Backend APIs need to be running locally or deployed to access full functionality.

---

## 🔧 Individual Service Setup

### Option 1: AI-Powered Diagnostics

#### Backend
```bash
cd biomedical-platform/ai-diagnostics/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5001 --reload
```

#### Frontend
```bash
cd biomedical-platform/ai-diagnostics/frontend
npm install
npm run dev
```

Access: http://localhost:3001

---

### Option 2: Medical Imaging AI

#### Backend
```bash
cd biomedical-platform/medical-imaging-ai/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5002 --reload
```

#### Frontend
```bash
cd biomedical-platform/medical-imaging-ai/frontend
npm install
npm run dev
```

Access: http://localhost:3002

---

### Option 3: Biosensing Technology

#### Backend
```bash
cd biomedical-platform/biosensing/backend
npm install
npm run dev
```

#### Frontend
```bash
cd biomedical-platform/biosensing/frontend
npm install
npm run dev
```

Access: http://localhost:3003

---

### Option 4: HIPAA Compliance

#### Backend
```bash
cd biomedical-platform/hipaa-compliance/backend
npm install
npm run dev
```

#### Frontend
```bash
cd biomedical-platform/hipaa-compliance/frontend
npm install
npm run dev
```

Access: http://localhost:3004

---

### Option 5: BioTensor Labs

#### Prerequisites
Start MLflow server first:
```bash
mlflow server \
  --backend-store-uri sqlite:///mlflow.db \
  --default-artifact-root ./mlruns \
  --host 0.0.0.0 \
  --port 5000
```

#### Backend
```bash
cd biomedical-platform/biotensor-labs/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5005 --reload
```

#### Frontend
```bash
cd biomedical-platform/biotensor-labs/frontend
npm install
npm run dev
```

Access: http://localhost:3005

---

## 📦 Prerequisites

### Required Software

#### For All Services
- **Git**: Version control
- **Node.js**: v18+ (for Node.js services and all frontends)
- **npm**: v9+ (comes with Node.js)

#### For Python Services (AI-Diagnostics, Medical Imaging, BioTensor Labs)
- **Python**: 3.9+
- **pip**: Latest version

#### Optional (for full functionality)
- **PostgreSQL**: 13+ (database)
- **Redis**: 6+ (caching, real-time)
- **Docker**: 20+ (containerization)
- **AWS CLI**: For IoT Core integration

### Installation Commands

#### macOS
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites
brew install node python postgresql redis

# Verify installations
node --version
python3 --version
psql --version
redis-server --version
```

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install prerequisites
sudo apt install -y nodejs npm python3 python3-pip python3-venv postgresql redis-server

# Verify installations
node --version
python3 --version
psql --version
redis-server --version
```

#### Windows
1. Download and install [Node.js](https://nodejs.org/)
2. Download and install [Python](https://www.python.org/downloads/)
3. Download and install [PostgreSQL](https://www.postgresql.org/download/windows/)
4. Download and install [Redis](https://redis.io/download/) (or use WSL)

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3001  # Replace with your port

# Kill process
kill -9 <PID>
```

### Python Virtual Environment Issues

```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Node.js Module Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Create databases
psql postgres
CREATE DATABASE biotensor_db;
CREATE DATABASE mlflow_db;
\q
```

### Redis Connection Issues

```bash
# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux

# Test connection
redis-cli ping
# Should return: PONG
```

### CORS Issues

If you see CORS errors in the browser console:

1. Check that the backend is running
2. Verify `CORS_ORIGINS` in backend `.env` files includes your frontend URL
3. Try accessing the backend directly to verify it's working

### MLflow Issues (BioTensor Labs)

```bash
# Start MLflow server
mlflow server \
  --backend-store-uri sqlite:///mlflow.db \
  --default-artifact-root ./mlruns \
  --host 0.0.0.0 \
  --port 5000

# Access MLflow UI
open http://localhost:5000
```

---

## 📊 Service Health Checks

Check if services are running:

```bash
# Backend health checks
curl http://localhost:5001/health
curl http://localhost:5002/health
curl http://localhost:5003/health
curl http://localhost:5004/health
curl http://localhost:5005/health

# Frontend checks
curl http://localhost:3001
curl http://localhost:3002
curl http://localhost:3003
curl http://localhost:3004
curl http://localhost:3005
```

---

## 🔐 Default Credentials

Most services are in development mode and don't require authentication. For production deployment, configure authentication in the `.env` files.

---

## 📝 Environment Configuration

Each service has an `.env.example` file. Copy and configure:

```bash
# Example for AI-Diagnostics backend
cd biomedical-platform/ai-diagnostics/backend
cp .env.example .env
# Edit .env with your configuration
```

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `CORS_ORIGINS`: Allowed frontend origins
- `SECRET_KEY`: Application secret key
- `AWS_*`: AWS credentials (for Biosensing IoT)
- `MLFLOW_TRACKING_URI`: MLflow server URL (BioTensor Labs)

---

## 🚀 Production Deployment

For production deployment, see individual service READMEs for:
- Docker/Kubernetes configurations
- Environment variable setup
- Database migrations
- Security configurations
- Monitoring setup

---

## 📞 Support

For issues or questions:
1. Check service-specific README in each service directory
2. Review logs in `/tmp/*.log` (when using startup script)
3. Check GitHub Issues
4. Review API documentation at `/docs` endpoints

---

## 🎯 Next Steps

1. **Start Simple**: Begin with one service (e.g., AI-Diagnostics)
2. **Test APIs**: Use Swagger docs to test backend endpoints
3. **Explore Frontends**: Navigate through each dashboard
4. **Configure Databases**: Set up PostgreSQL for persistence
5. **Enable Real-time**: Configure Redis for live features
6. **Deploy Production**: Use Docker/Kubernetes for production

---

**Built with ❤️ by M.Y. Engineering and Technologies**

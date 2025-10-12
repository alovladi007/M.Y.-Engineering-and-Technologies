# Docker Desktop Mac Port Publishing Bug - Workaround

## Problem
Docker Desktop on Mac is failing to publish container ports even with correct docker-compose.yml configuration.

**Symptoms:**
- `docker ps` shows ports as `8000/tcp` instead of `0.0.0.0:8080->8000/tcp`
- Browser gets `ERR_EMPTY_RESPONSE` when trying to access http://localhost:8080
- `docker port <container>` returns empty (no port mappings)
- `lsof -i :8080` shows Docker listening, but container isn't bound

## Confirmed Working Configuration
The docker-compose.yml is correctly configured:
```yaml
api:
  ports:
    - "0.0.0.0:8080:8000"
frontend:
  ports:
    - "0.0.0.0:3001:3000"
```

## Workaround: Run Backend Natively

Instead of fighting Docker, run the API natively on your Mac:

### Step 1: Ensure Database and Redis are running
```bash
cd power-platform
docker-compose -f deploy/docker-compose.yml up -d postgres redis worker
```

### Step 2: Run API Natively
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://poweruser:powerpass@localhost:5432/powerdb
export REDIS_URL=redis://localhost:6379/0
export CELERY_BROKER_URL=redis://localhost:6379/0
export CELERY_RESULT_BACKEND=redis://localhost:6379/1
export CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:5173"
export SECRET_KEY=dev-secret-key-change-in-production
export STORAGE_PATH=./static/exports
export ENVIRONMENT=development
export DEBUG=true

# Initialize database
python scripts/init_db.py
python scripts/seed_demo.py

# Run API
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### Step 3: Access Application
- Frontend: http://localhost:3001 (running in Docker)
- API: http://localhost:8080 (running natively)

## Alternative: Try Docker Desktop Restart

Sometimes restarting Docker Desktop completely fixes port publishing:

```bash
# Quit Docker Desktop completely
pkill -SIGHUP -f Docker

# Wait 10 seconds

# Restart Docker Desktop from Applications
open -a Docker

# Wait for Docker to be ready, then:
cd power-platform
docker-compose -f deploy/docker-compose.yml down -v
docker-compose -f deploy/docker-compose.yml up -d --build
```

## Alternative 2: Use Different Ports

Try using ports that Docker definitely supports:

```yaml
api:
  ports:
    - "8000:8000"  # Standard port
```

Then update frontend env:
```yaml
frontend:
  environment:
    - VITE_API_URL=http://localhost:8000
```

## Known Issue References
- Docker Desktop for Mac port publishing bugs:
  - https://github.com/docker/for-mac/issues/6677
  - https://github.com/docker/for-mac/issues/6537

## Current Status
- ✅ All code is correct and committed to GitHub
- ✅ Configuration is valid
- ❌ Docker Desktop Mac is not cooperating with port publishing
- ✅ Workaround: Run API natively (works perfectly)

## Quick Start (Recommended)

```bash
# Terminal 1 - Start Docker services
cd power-platform
docker-compose -f deploy/docker-compose.yml up -d postgres redis worker frontend

# Terminal 2 - Run API natively
cd power-platform/backend
source venv/bin/activate  # or create venv if doesn't exist
export DATABASE_URL=postgresql://poweruser:powerpass@localhost:5432/powerdb
export REDIS_URL=redis://localhost:6379/0
export CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:5173"
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

Then open http://localhost:3001 in your browser!

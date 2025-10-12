#!/bin/bash

# Power Platform - Localhost Startup Script
# This script starts all services required for local development

set -e

echo "🚀 Starting Power Platform on localhost..."
echo ""

# Change to power-platform directory
cd "$(dirname "$0")"

# Start Docker services (postgres, redis, worker, frontend)
echo "📦 Starting Docker services (database, redis, worker, frontend)..."
docker-compose -f deploy/docker-compose.yml up -d postgres redis worker frontend

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 5

# Stop the Docker API container (we'll run it natively)
echo "🛑 Stopping Docker API container..."
docker stop power_platform_api 2>/dev/null || true

# Check if API is already running
if lsof -i :8080 > /dev/null 2>&1; then
    echo "✅ API already running on port 8080"
else
    echo "🐍 Starting API natively on port 8080..."
    cd backend

    # Activate virtual environment if it exists
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    fi

    # Start API in background
    DATABASE_URL=postgresql://poweruser:powerpass@localhost:5432/powerdb \
    REDIS_URL=redis://localhost:6379/0 \
    CELERY_BROKER_URL=redis://localhost:6379/0 \
    CELERY_RESULT_BACKEND=redis://localhost:6379/1 \
    CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:5173" \
    SECRET_KEY=dev-secret-key \
    STORAGE_PATH=./static/exports \
    PYTHONDONTWRITEBYTECODE=1 \
    uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload > ../api.log 2>&1 &

    echo "✅ API started (logs in api.log)"
    cd ..
fi

echo ""
echo "✅ Power Platform is running!"
echo ""
echo "🌐 Frontend:  http://localhost:3001"
echo "🔌 API:       http://localhost:8080"
echo "📊 API Docs:  http://localhost:8080/docs"
echo ""
echo "📝 API logs:  tail -f api.log"
echo "🐳 Worker logs: docker logs -f power_platform_worker"
echo ""
echo "To stop all services:"
echo "  docker-compose -f deploy/docker-compose.yml down"
echo "  pkill -f 'uvicorn app.main:app'"
echo ""

#!/bin/bash
# Workaround for Docker Desktop Mac port publishing bug
# Run API container manually with explicit port binding

echo "🚀 Starting Power Platform API with manual port binding..."

# Stop any existing API container
docker stop power_platform_api 2>/dev/null
docker rm power_platform_api 2>/dev/null

# Run API with explicit port binding
docker run -d \
  --name power_platform_api \
  --network power_platform_network \
  -p 0.0.0.0:8080:8000 \
  -e DATABASE_URL=postgresql://poweruser:powerpass@power_platform_db:5432/powerdb \
  -e REDIS_URL=redis://power_platform_redis:6379/0 \
  -e CELERY_BROKER_URL=redis://power_platform_redis:6379/0 \
  -e CELERY_RESULT_BACKEND=redis://power_platform_redis:6379/1 \
  -e SECRET_KEY=dev-secret-key-change-in-production \
  -e STORAGE_PATH=/app/static/exports \
  -e ENVIRONMENT=development \
  -e DEBUG=true \
  -e "CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173" \
  -v "$(pwd)/backend:/app" \
  deploy-api \
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo "✅ API starting on http://localhost:8080"
echo "📊 Check status: docker ps | grep power_platform_api"
echo "📝 View logs: docker logs -f power_platform_api"

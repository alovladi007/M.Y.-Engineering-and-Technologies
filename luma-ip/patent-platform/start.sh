#!/bin/bash

# Patent Platform Startup Script

set -e

echo "🚀 Starting Patent Platform..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your configuration."
    echo ""
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker compose -f infra/docker/docker-compose.yml up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Run migrations
echo "🗄️ Running database migrations..."
docker compose -f infra/docker/docker-compose.yml exec -T api npx prisma migrate deploy --schema=/app/prisma/schema.prisma || true

# Seed database
echo "🌱 Seeding database..."
docker compose -f infra/docker/docker-compose.yml exec -T api npx ts-node /app/prisma/seed.ts || true

# Create MinIO bucket
echo "🪣 Creating MinIO bucket..."
docker compose -f infra/docker/docker-compose.yml exec -T minio mc alias set local http://localhost:9000 minioadmin minioadmin || true
docker compose -f infra/docker/docker-compose.yml exec -T minio mc mb local/patent-vault --ignore-existing || true

echo ""
echo "✅ Patent Platform is running!"
echo ""
echo "🌐 Access Points:"
echo "   Web UI:        http://localhost:3000"
echo "   API Docs:      http://localhost:3001/api/docs"
echo "   Agent API:     http://localhost:8000/docs"
echo "   MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
echo "   MailDev:       http://localhost:1080"
echo ""
echo "📧 Demo Credentials:"
echo "   Email:    demo@patentplatform.com"
echo "   Password: demo123456"
echo ""
echo "To stop all services: docker compose -f infra/docker/docker-compose.yml down"
echo "To view logs: docker compose -f infra/docker/docker-compose.yml logs -f"
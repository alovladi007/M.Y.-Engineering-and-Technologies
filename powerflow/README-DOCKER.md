# PowerFlow - Docker Deployment Guide

## 🐳 Quick Start with Docker

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available for Docker

### 🚀 Start PowerFlow (Production Mode)

```bash
# Navigate to the project directory
cd /workspace/powerflow

# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 🛠️ Development Mode with Hot Reload

```bash
# Start with hot-reload enabled
docker-compose -f docker-compose.dev.yml up

# Or using Make
make dev
```

## 📋 Available Make Commands

```bash
make help         # Show all available commands
make up           # Start production containers
make dev          # Start development containers
make down         # Stop all containers
make logs         # Show container logs
make restart      # Restart containers
make status       # Show container status
make clean        # Remove containers and volumes
```

## 🌐 Access Points

Once running, access the platform at:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs

## 📁 Docker Files Structure

```
powerflow/
├── docker-compose.yml          # Production deployment
├── docker-compose.dev.yml      # Development with hot-reload
├── apps/
│   ├── web/
│   │   └── Dockerfile         # Next.js production image
│   └── api/
│       └── Dockerfile         # NestJS production image
└── Makefile                   # Convenience commands
```

## 🔧 Container Management

### View Logs
```bash
# All containers
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### Access Container Shell
```bash
# API container
docker exec -it powerflow-api sh

# Web container
docker exec -it powerflow-web sh
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart web
```

## 🔍 Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
```bash
# Check what's using the ports
lsof -i :3000  # Frontend port
lsof -i :4000  # API port

# Kill the process or change ports in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker-compose logs api
docker-compose logs web

# Rebuild images
docker-compose build --no-cache
docker-compose up
```

### Clean Everything
```bash
# Stop and remove everything
docker-compose down -v
docker system prune -af
```

## 🏗️ Building for Production

### Build Images
```bash
# Build production images
docker-compose build

# Tag for registry
docker tag powerflow-web:latest your-registry/powerflow-web:latest
docker tag powerflow-api:latest your-registry/powerflow-api:latest

# Push to registry
docker push your-registry/powerflow-web:latest
docker push your-registry/powerflow-api:latest
```

### Deploy to Production
```bash
# On production server
docker-compose -f docker-compose.yml up -d
```

## 🔐 Environment Variables

Create `.env` file for production:
```env
# API Configuration
API_PORT=4000
NODE_ENV=production

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://your-domain.com:4000
```

## 📊 Resource Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 2GB
- **Storage**: 1GB

### Recommended for Production
- **CPU**: 4 cores
- **RAM**: 4GB
- **Storage**: 10GB

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📈 Monitoring

### Check Resource Usage
```bash
docker stats
```

### Health Check
```bash
# API health
curl http://localhost:4000/api/health

# Frontend status
curl http://localhost:3000
```

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify Docker version: `docker --version`
3. Ensure ports are available: `netstat -tulpn | grep -E '3000|4000'`
4. Check Docker daemon: `docker info`

---

Built with 🐳 Docker for easy deployment
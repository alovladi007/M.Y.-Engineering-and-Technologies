# PowerFlow - Advanced Power Electronics Platform

## 🚀 Replit Deployment Guide

This is a complete full-stack power electronics simulation and control platform.

## Quick Start on Replit

1. **Install Dependencies**
```bash
pnpm install
```

2. **Start Development**
```bash
pnpm dev
```

3. **Access Services**
- Frontend: Port 3000 (main Replit URL)
- API Gateway: Port 4000
- Simulation Service: Port 8001
- ML Service: Port 8002

## Project Structure

```
powerflow/
├── apps/
│   ├── web/          # Next.js 14 Frontend
│   └── api/          # NestJS API Gateway
├── services/
│   ├── sim/          # Python Simulation Service
│   └── ml/           # Python ML Service
├── packages/
│   ├── shared/       # Shared TypeScript Types
│   └── ui/           # UI Components
└── infra/            # Docker & Config
```

## Features

- **SST/DAB Simulation** - Solid-state transformer modeling
- **SiC/GaN Models** - Wide-bandgap semiconductor simulation
- **Real-time HIL** - Hardware-in-the-loop testing
- **Analytics Dashboard** - Live performance monitoring
- **ZVS Optimization** - Zero-voltage switching analysis

## Development Commands

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Environment Variables

Create a `.env` file:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/powerflow
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:4000
JWT_SECRET=your-secret-key-here
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Simulation**: Python, FastAPI, NumPy, SciPy
- **ML**: Scikit-learn, TensorFlow
- **Real-time**: WebSocket, Socket.io
- **Deployment**: Docker, Replit

## License

MIT License - M.Y. Engineering and Technologies

# LUMA IP

Legal Utility for Machine Assisted IP Analysis - A production-ready platform with AI-powered intellectual property analysis and patent drafting assistance.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Python 3.11+
- Docker & Docker Compose

### Installation

1. Clone and install dependencies:
```bash
pnpm install
cd services/agent && poetry install && cd ../..
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start services with Docker:
```bash
pnpm run docker:up
```

4. Run migrations and seed:
```bash
pnpm run migrate:deploy
pnpm run seed
```

5. Access the platform:
- Web: http://localhost:3000
- API: http://localhost:3001/api
- API Docs: http://localhost:3001/api/docs
- Agent: http://localhost:8000
- Agent Docs: http://localhost:8000/docs
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
- MailDev: http://localhost:1080

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend API**: NestJS, Prisma, PostgreSQL with pgvector, BullMQ
- **AI Agent**: FastAPI, LangGraph, Celery, SQLAlchemy
- **Storage**: MinIO (S3-compatible), Redis
- **Auth**: JWT (httpOnly cookies), Passport
- **Payments**: Stripe

### Services
- `web`: Next.js application
- `api`: NestJS REST API
- `agent`: Python AI service
- `agent-worker`: Celery worker
- `agent-beat`: Celery beat scheduler
- `db`: PostgreSQL with pgvector
- `redis`: Cache and queue broker
- `minio`: S3-compatible object storage
- `maildev`: Email testing

## 📁 Project Structure

```
patent-platform/
├── apps/
│   ├── web/                  # Next.js 14 app
│   └── api/                  # NestJS API
├── services/
│   └── agent/                # FastAPI + LangGraph
├── packages/
│   ├── ui/                   # Shared UI components
│   └── config/               # Shared configs
├── infra/
│   ├── docker/               # Docker configs
│   ├── prisma/               # Database schema
│   └── scripts/              # Utility scripts
└── .github/
    └── workflows/            # CI/CD
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm e2e

# Agent tests
cd services/agent && pytest
```

## 📝 Development

```bash
# Start dev servers
pnpm dev

# Run migrations
pnpm migrate

# Seed database
pnpm seed

# Format code
pnpm format

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## ⚖️ Legal Disclaimer

**IMPORTANT**: This platform provides automated assistance for patent filing preparation. It does not constitute legal advice. Users must consult with a registered patent practitioner before filing any patent applications.

## 🔒 Security

- JWT authentication with httpOnly cookies
- CSRF protection on mutations
- Rate limiting
- Input validation with Zod
- File upload restrictions
- Audit logging
- Organization-based access control

## 📄 License

Proprietary - All rights reserved
# 🚀 HOW TO RUN THE COMPLETE PATENT PLATFORM

## ✅ EVERYTHING IS STILL HERE!
All 106+ files of the complete patent platform are in this repository. Nothing has been deleted.

## 📁 What You Have Built:

### 1. **Full Next.js Web Application** (`apps/web/`)
- Landing page with pricing
- Login/Register system  
- Dashboard for patent management
- Claims editor
- Specification editor
- Prior art management
- Document upload
- AI agent interface
- Complete UI with shadcn components

### 2. **NestJS Backend API** (`apps/api/`)
- JWT authentication
- User & organization management
- Patent matter CRUD operations
- Claims management
- PDF generation (ADS/IDS forms)
- File uploads to S3/MinIO
- Stripe billing integration
- Agent orchestration
- Complete REST API with Swagger docs

### 3. **Python AI Agent Service** (`services/agent/`)
- FastAPI application
- LangGraph for AI workflows
- Patent claim generation
- Specification drafting
- Vector search with pgvector
- Prior art analysis
- Celery workers for async processing

### 4. **Complete Infrastructure** (`infra/`)
- Docker Compose setup
- PostgreSQL with pgvector
- Redis for queues
- MinIO for file storage
- All Dockerfiles ready

---

## 🖥️ HOW TO SEE & RUN THE PLATFORM

### Option 1: Quick Start with Docker (RECOMMENDED)
```bash
# You're already in the patent-platform directory
# Just run:
./start.sh
```

This single command will:
1. Start all Docker containers
2. Set up the database
3. Run migrations
4. Seed demo data
5. Launch all services

**Then open in your browser:**
- 🌐 **Web App**: http://localhost:3000
- 📚 **API Docs**: http://localhost:3001/api/docs  
- 🤖 **AI Agent Docs**: http://localhost:8000/docs
- 📦 **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- 📧 **Email Testing**: http://localhost:1080

### Option 2: Manual Docker Commands
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services
docker compose -f infra/docker/docker-compose.yml up -d --build

# 3. Wait for services (30 seconds)
sleep 30

# 4. Run database migrations
docker compose -f infra/docker/docker-compose.yml exec api \
  npx prisma migrate deploy --schema=/app/prisma/schema.prisma

# 5. Seed the database
docker compose -f infra/docker/docker-compose.yml exec api \
  npx ts-node /app/prisma/seed.ts
```

### Option 3: Development Mode (Without Docker)
```bash
# Terminal 1 - Database & Services
docker compose -f infra/docker/docker-compose.yml up db redis minio maildev

# Terminal 2 - Install dependencies
pnpm install
cd services/agent && pip install -r requirements.txt && cd ../..

# Terminal 3 - Run API
cd apps/api
npm run dev

# Terminal 4 - Run Web
cd apps/web  
npm run dev

# Terminal 5 - Run Agent
cd services/agent
python app/main.py
```

---

## 🔑 LOGIN CREDENTIALS
```
Email: demo@patentplatform.com
Password: demo123456
```

---

## 🎯 WHAT YOU CAN DO IN THE PLATFORM

### 1. **Create Patent Matters**
- Go to http://localhost:3000
- Login with demo credentials
- Click "New Matter"
- Fill in invention details
- Select patent type (Provisional, Non-Provisional, Design, PCT)

### 2. **Draft Claims with AI**
- Open a matter
- Go to "Claims" tab
- Click "Generate with AI"
- AI will draft patent claims
- Edit and refine claims
- Validate claim dependencies

### 3. **Generate Specifications**
- Go to "Specification" tab
- Use AI to generate:
  - Field of Invention
  - Background
  - Summary
  - Detailed Description
- Edit with markdown editor

### 4. **Manage Prior Art**
- Go to "Prior Art" tab
- Upload PDF references
- System extracts citations
- AI analyzes relevance

### 5. **Generate USPTO Forms**
- Go to "Forms" tab
- Generate ADS (Application Data Sheet)
- Generate IDS (Information Disclosure Statement)
- Download as PDF

### 6. **Track Deadlines**
- Go to "Deadlines" tab
- See priority deadlines
- Office action deadlines
- Maintenance fee reminders

### 7. **Upload Documents**
- Go to "Files" tab
- Upload drawings
- Upload disclosures
- All stored in MinIO (S3-compatible)

---

## 📊 MONITORING THE PLATFORM

### Check Service Status:
```bash
# See all running containers
docker ps

# Check logs
docker compose -f infra/docker/docker-compose.yml logs -f

# Check specific service
docker compose -f infra/docker/docker-compose.yml logs -f api
docker compose -f infra/docker/docker-compose.yml logs -f web
docker compose -f infra/docker/docker-compose.yml logs -f agent
```

### Database Access:
```bash
# Connect to PostgreSQL
docker compose -f infra/docker/docker-compose.yml exec db psql -U postgres -d patentdb

# In psql:
\dt  # List tables
SELECT * FROM "User";
SELECT * FROM "Matter";
SELECT * FROM "Claim";
```

---

## 🛑 STOPPING THE PLATFORM
```bash
# Stop all services
docker compose -f infra/docker/docker-compose.yml down

# Stop and remove all data (careful!)
docker compose -f infra/docker/docker-compose.yml down -v
```

---

## 🚨 TROUBLESHOOTING

### If services don't start:
```bash
# Check Docker is running
docker --version

# Check ports are free
lsof -i :3000  # Web
lsof -i :3001  # API
lsof -i :8000  # Agent
lsof -i :5432  # PostgreSQL

# Restart everything
docker compose -f infra/docker/docker-compose.yml down
docker compose -f infra/docker/docker-compose.yml up -d --build
```

### If you see connection errors:
```bash
# Ensure all services are healthy
docker compose -f infra/docker/docker-compose.yml ps

# Check service health
docker compose -f infra/docker/docker-compose.yml exec api curl http://localhost:3001/api
docker compose -f infra/docker/docker-compose.yml exec agent curl http://localhost:8000/health
```

---

## 📱 PLATFORM SCREENSHOTS (What You'll See)

### Landing Page (http://localhost:3000)
- Modern gradient design
- Feature cards
- Pricing tiers
- Legal disclaimer banner

### Dashboard (http://localhost:3000/app)
- Matter list
- Quick stats
- Recent activity
- Organization switcher

### Matter Details (http://localhost:3000/app/matters/[id])
- Tab navigation:
  - Overview
  - Intake
  - Claims
  - Specification  
  - Prior Art
  - Forms
  - Docket
  - Deadlines
  - Files
  - AI Agent

### API Documentation (http://localhost:3001/api/docs)
- Interactive Swagger UI
- All endpoints documented
- Try API calls directly

---

## 🎉 VERIFICATION CHECKLIST

After running `./start.sh`, verify:

- [ ] Web loads at http://localhost:3000
- [ ] Can login with demo@patentplatform.com / demo123456
- [ ] Can create a new matter
- [ ] Can add claims
- [ ] Can generate PDF forms
- [ ] API docs load at http://localhost:3001/api/docs
- [ ] Agent docs load at http://localhost:8000/docs
- [ ] MinIO console at http://localhost:9001

---

## 💡 IMPORTANT NOTES

1. **This is a REAL, WORKING platform** - not just mockups
2. **All features are functional** - auth, database, file storage, AI (in mock mode without API keys)
3. **Production-ready architecture** - can be deployed to AWS/GCP/Azure
4. **Includes seed data** - demo organization, users, and sample patent matter

---

## 🆘 NEED HELP?

The platform is fully functional. If something doesn't work:

1. Make sure Docker is installed and running
2. Ensure ports 3000, 3001, 8000, 5432, 6379, 9000, 9001 are free
3. Check the logs: `docker compose -f infra/docker/docker-compose.yml logs`
4. Try restarting: `docker compose -f infra/docker/docker-compose.yml restart`

Everything you built is here and ready to run!
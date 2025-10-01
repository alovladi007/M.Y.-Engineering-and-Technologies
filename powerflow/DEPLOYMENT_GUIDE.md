# 🚀 PowerFlow Complete Deployment Guide

## ✅ What's Been Implemented

### Full-Stack Platform
- ✅ **Next.js 14 Frontend** - Modern React with App Router
- ✅ **Python FastAPI Backend** - Simulation service with NumPy/SciPy
- ✅ **Monorepo Structure** - Turborepo with pnpm workspaces
- ✅ **TypeScript** - Full type safety across the stack
- ✅ **Tailwind CSS** - Beautiful, responsive UI
- ✅ **Replit Configuration** - Ready to deploy

### Features Implemented
- ✅ **SST/DAB Simulation** - Solid-state transformer modeling
- ✅ **3-Level NPC Rectifier** - Power factor correction
- ✅ **Dual Active Bridge** - ZVS optimization
- ✅ **Grid Inverter** - Three-phase control
- ✅ **Project Management** - Create and manage designs
- ✅ **Real-time Results** - Live simulation data
- ✅ **Performance Metrics** - Efficiency, THD, power factor

## 📁 Project Structure

```
powerflow/
├── .replit                    # Replit configuration
├── package.json              # Root package with scripts
├── turbo.json                # Turborepo config
├── pnpm-workspace.yaml       # Workspace definition
├── start.sh                  # Quick start script
│
├── apps/
│   └── web/                  # Next.js 14 Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx           # Home page
│       │   │   ├── layout.tsx         # Root layout
│       │   │   ├── globals.css        # Global styles
│       │   │   └── projects/
│       │   │       └── page.tsx       # Projects page
│       │   ├── components/            # React components
│       │   └── lib/                   # Utilities
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
└── services/
    └── sim/                  # Python Simulation Service
        ├── main.py           # FastAPI app
        └── requirements.txt  # Python deps
```

## 🚀 Deploying to Replit

### Step 1: Upload to Replit

1. Go to [https://replit.com](https://replit.com)
2. Click **"Create Repl"**
3. Choose **"Import from GitHub"**
4. Enter: `https://github.com/alovladi007/M.Y.-Engineering-and-Technologies`
5. Navigate to the `powerflow` directory

OR

1. Download the `powerflow` folder
2. Click **"Create Repl"** → **"Upload folder"**
3. Upload the entire powerflow directory

### Step 2: Install Dependencies

Replit will auto-detect and install, but you can manually run:

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip install -r services/sim/requirements.txt
```

### Step 3: Start the Platform

**Option A - Automatic (Recommended)**
Just click the **"Run"** button in Replit!

**Option B - Manual**
```bash
chmod +x start.sh
./start.sh
```

**Option C - Individual Services**

Terminal 1:
```bash
cd apps/web
pnpm dev
```

Terminal 2:
```bash
cd services/sim
python main.py
```

### Step 4: Access Your App

- **Frontend**: Main Replit URL (port 3000)
- **Simulation API**: Add `:8001` to your Replit URL
- **Health Check**: `https://[your-repl].repl.co:8001/health`

## 🔧 Development

### Available Commands

From the root directory:

```bash
# Start all services
pnpm dev

# Start frontend only
pnpm dev:web

# Start simulation service
pnpm dev:sim

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Clean everything
pnpm clean
```

### Adding New Features

**New Frontend Page:**
```bash
# Create new page
touch apps/web/src/app/new-page/page.tsx
```

**New API Endpoint:**
Edit `services/sim/main.py` and add:
```python
@app.get("/your-endpoint")
async def your_function():
    return {"data": "value"}
```

## 📊 Simulation API Examples

### Run SST Simulation

```bash
curl -X POST http://localhost:8001/simulate/sst/run \
  -H "Content-Type: application/json" \
  -d '{
    "topology_chain": ["NPC3L", "DAB", "INV"],
    "parameters": {
      "npc": {"vdc_ref": 800, "fsw": 10000},
      "dab": {"v1": 800, "v2": 400, "phi": 30},
      "inverter": {"vdc": 700, "vac": 400}
    },
    "time_span": 0.1,
    "time_step": 1e-5
  }'
```

### Check Simulation Status

```bash
curl http://localhost:8001/simulate/status/sst_20250101_120000
```

### Health Check

```bash
curl http://localhost:8001/health
```

## 🌐 Connecting to Main Site

Update your GitHub Pages `powerflow.html` to point to your Replit deployment:

```html
<a href="https://[your-repl-name].repl.co" target="_blank">
    Launch PowerFlow Platform
</a>
```

## 🔐 Environment Variables

Set in Replit's **"Secrets"** tab (padlock icon):

```
NEXT_PUBLIC_API_URL=https://[your-repl].repl.co:8001
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://... (if needed)
REDIS_URL=redis://... (if needed)
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
kill $(lsof -t -i:3000)
kill $(lsof -t -i:8001)
```

### Dependencies Not Installing
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install --force
```

### Build Errors
```bash
rm -rf apps/web/.next
pnpm clean
pnpm build
```

### Python Module Not Found
```bash
pip install --upgrade -r services/sim/requirements.txt
```

## 📚 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Modern Python web framework
- **NumPy** - Numerical computing
- **SciPy** - Scientific computing
- **Pydantic** - Data validation

### DevOps
- **Turborepo** - Monorepo build system
- **pnpm** - Fast package manager
- **Replit** - Cloud deployment

## 🚀 Next Steps

1. **Add Authentication** - Implement user login/signup
2. **Add Database** - PostgreSQL for project persistence
3. **Add Real-time Updates** - WebSocket for live data
4. **Add More Topologies** - DCDC, Motor drives, etc.
5. **Add Export Features** - Download simulation results
6. **Add Visualization** - Charts for waveforms

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Turborepo Docs](https://turbo.build/repo/docs)

## 💡 Tips

- Use **Replit Always On** for 24/7 availability
- Enable **Boost** for faster performance
- Set up **GitHub integration** for automatic deploys
- Use **Replit Database** for easy data persistence

## 🤝 Support

- **GitHub Issues**: Report bugs
- **Discussions**: Ask questions
- **Pull Requests**: Contribute code

---

**Built with ❤️ by M.Y. Engineering and Technologies**

PowerFlow - Advanced Power Electronics Platform v1.0.0


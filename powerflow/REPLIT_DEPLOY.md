# 🚀 Deploying PowerFlow on Replit

## Quick Deploy Steps

### 1. Create New Repl
- Go to [Replit](https://replit.com)
- Click "Create Repl"
- Choose "Import from GitHub" or "Upload folder"
- Upload the entire `powerflow` directory

### 2. Configure Replit

The `.replit` file is already configured! Replit will automatically:
- Install Node.js and Python dependencies
- Set up the development environment
- Configure ports (3000, 8001)

### 3. Install Dependencies

Run in the Replit shell:
```bash
pnpm install
pip install -r services/sim/requirements.txt
```

### 4. Start the Platform

Option A - Use the start script:
```bash
chmod +x start.sh
./start.sh
```

Option B - Start services individually:

**Terminal 1 - Frontend:**
```bash
cd apps/web
pnpm dev
```

**Terminal 2 - Simulation Service:**
```bash
cd services/sim
python main.py
```

### 5. Access Your App

- **Frontend**: The main Replit URL (automatically opens to port 3000)
- **Simulation API**: `https://[your-repl-url]:8001`

## Environment Variables

Set these in Replit's "Secrets" tab:
- `DATABASE_URL` (if using PostgreSQL)
- `REDIS_URL` (if using Redis)
- `JWT_SECRET`

## Troubleshooting

### Port Issues
If you get EADDRINUSE errors:
```bash
# Kill processes on ports
kill $(lsof -t -i:3000)
kill $(lsof -t -i:8001)
```

### Missing Dependencies
```bash
# Reinstall Node deps
rm -rf node_modules
pnpm install

# Reinstall Python deps
pip install --upgrade -r services/sim/requirements.txt
```

### Build Errors
```bash
# Clean build artifacts
pnpm clean
rm -rf apps/web/.next

# Rebuild
pnpm build
```

## Production Deployment

For production on Replit:

1. Click "Deploy" button in Replit
2. Choose deployment type (Autoscale recommended)
3. Set environment variables in deployment settings
4. Deploy!

## Features Available

✅ Full Next.js 14 frontend  
✅ Python FastAPI simulation service  
✅ SST/DAB power electronics simulation  
✅ Real-time WebSocket support  
✅ Responsive UI with Tailwind CSS  

## Need Help?

- Check the main [README.md](./README.md)
- Review [PowerFlow Documentation](./apps/web/README.md)
- Open an issue on GitHub

---

**M.Y. Engineering and Technologies** | PowerFlow Platform


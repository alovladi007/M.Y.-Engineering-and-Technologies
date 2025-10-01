#!/bin/bash

echo "🚀 Starting PowerFlow Platform..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    pnpm install
fi

# Install Python dependencies if needed
if [ ! -d "services/sim/__pycache__" ]; then
    echo "🐍 Installing Python dependencies..."
    pip install -r services/sim/requirements.txt
fi

echo "▶️ Starting services..."

# Start Python simulation service in background
cd services/sim && python main.py &
SIM_PID=$!

# Go back to root
cd ../..

# Start Next.js app
pnpm dev:web &
WEB_PID=$!

echo "✅ PowerFlow is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔬 Simulation API: http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait $SIM_PID $WEB_PID

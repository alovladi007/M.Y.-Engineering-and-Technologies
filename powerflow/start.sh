#!/bin/bash

echo "🚀 Starting PowerFlow Platform..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or higher."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start services
echo ""
echo "🔧 Starting services..."
echo ""

# Option 1: Using concurrent processes
if [ "$1" = "dev" ]; then
    echo "Starting in development mode..."
    pnpm dev:all
# Option 2: Using Docker
elif [ "$1" = "docker" ]; then
    echo "Starting with Docker..."
    docker-compose up
# Option 3: Start individually
else
    echo "Starting services individually..."
    echo ""
    echo "1. Starting API Gateway on http://localhost:4000..."
    cd apps/api && pnpm dev &
    API_PID=$!
    
    echo "2. Starting Web Frontend on http://localhost:3000..."
    cd ../web && pnpm dev &
    WEB_PID=$!
    
    echo ""
    echo "✅ PowerFlow is running!"
    echo ""
    echo "📍 Frontend: http://localhost:3000"
    echo "📍 API: http://localhost:4000"
    echo "📍 API Docs: http://localhost:4000/api/docs"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for interrupt
    trap "kill $API_PID $WEB_PID" INT
    wait
fi
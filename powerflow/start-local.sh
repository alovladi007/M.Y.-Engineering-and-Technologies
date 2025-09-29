#!/bin/bash

echo "🚀 Starting PowerFlow Platform (Local Development)..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20 or higher.${NC}"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js version is less than 20. Please upgrade to Node.js 20 or higher.${NC}"
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 pnpm is not installed. Installing pnpm...${NC}"
    npm install -g pnpm
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pnpm install
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set trap for cleanup on Ctrl+C
trap cleanup INT

# Start the API in background
echo -e "${GREEN}Starting API Gateway...${NC}"
cd apps/api
pnpm dev > /tmp/powerflow-api.log 2>&1 &
API_PID=$!
cd ../..

# Start the Frontend in background
echo -e "${GREEN}Starting Web Frontend...${NC}"
cd apps/web
pnpm dev > /tmp/powerflow-web.log 2>&1 &
WEB_PID=$!
cd ../..

# Wait a moment for services to start
sleep 3

echo ""
echo -e "${GREEN}✅ PowerFlow is starting up!${NC}"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 API: http://localhost:4000"
echo "📍 API Docs: http://localhost:4000/api/docs"
echo ""
echo "📝 Logs:"
echo "   - API: tail -f /tmp/powerflow-api.log"
echo "   - Web: tail -f /tmp/powerflow-web.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait
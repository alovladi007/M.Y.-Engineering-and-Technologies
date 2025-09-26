#!/bin/bash

echo "🚀 PowerFlow Platform Launcher"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to start with Docker
start_with_docker() {
    echo -e "${GREEN}🐳 Starting with Docker...${NC}"
    echo ""
    
    if [ "$1" == "dev" ]; then
        echo "Starting in development mode with hot-reload..."
        docker compose -f docker-compose.dev.yml up
    else
        echo "Building and starting in production mode..."
        docker compose up --build -d
        echo ""
        echo -e "${GREEN}✅ PowerFlow is running in Docker!${NC}"
    fi
}

# Function to start with Node.js
start_with_node() {
    echo -e "${BLUE}📦 Starting with Node.js...${NC}"
    echo ""
    
    # Check Node.js version
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js is not installed!${NC}"
        echo "Please install Node.js 20+ from https://nodejs.org"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        echo -e "${YELLOW}⚠️  Node.js version is less than 20. Recommended: Node.js 20+${NC}"
    fi
    
    # Install pnpm if needed
    if ! command_exists pnpm; then
        echo -e "${YELLOW}Installing pnpm...${NC}"
        npm install -g pnpm
    fi
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        pnpm install
    fi
    
    # Start services
    echo -e "${GREEN}Starting services...${NC}"
    
    # Start API
    (cd apps/api && pnpm dev) &
    API_PID=$!
    
    # Wait a bit for API to start
    sleep 3
    
    # Start Frontend
    (cd apps/web && pnpm dev) &
    WEB_PID=$!
    
    echo ""
    echo -e "${GREEN}✅ PowerFlow is running with Node.js!${NC}"
    
    # Function to cleanup
    cleanup() {
        echo -e "\n${YELLOW}Stopping services...${NC}"
        kill $API_PID $WEB_PID 2>/dev/null
        exit 0
    }
    
    trap cleanup INT
    wait
}

# Main execution
echo "Checking available runtime..."
echo ""

if command_exists docker; then
    echo -e "${GREEN}✓ Docker found${NC}"
    echo ""
    echo "Select startup mode:"
    echo "1) Production (Docker)"
    echo "2) Development with hot-reload (Docker)"
    echo "3) Node.js direct (no Docker)"
    echo ""
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1)
            start_with_docker "prod"
            ;;
        2)
            start_with_docker "dev"
            ;;
        3)
            start_with_node
            ;;
        *)
            echo -e "${YELLOW}Using default: Production mode${NC}"
            start_with_docker "prod"
            ;;
    esac
else
    echo -e "${YELLOW}Docker not found. Starting with Node.js...${NC}"
    echo ""
    start_with_node
fi

echo ""
echo "📍 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:4000"
echo "   API Docs: http://localhost:4000/api/docs"
echo ""

# Keep script running if in Docker mode
if command_exists docker && [ "$choice" != "3" ]; then
    if [ "$choice" == "1" ]; then
        echo "Run 'docker compose logs -f' to see logs"
        echo "Run 'docker compose down' to stop"
    fi
fi
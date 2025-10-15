#!/bin/bash

# BioMedical Platform - Start All Services
# This script starts all backend and frontend services locally

set -e

echo "🚀 Starting BioMedical Intelligence Platform..."
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to start a service
start_service() {
    local name=$1
    local dir=$2
    local port=$3
    local command=$4

    echo -e "${BLUE}Starting ${name} on port ${port}...${NC}"
    cd "$dir"

    # Check if node_modules exists for Node.js projects
    if [[ $command == *"npm"* ]] && [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies for ${name}...${NC}"
        npm install
    fi

    # Check if venv exists for Python projects
    if [[ $command == *"uvicorn"* ]] && [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating virtual environment for ${name}...${NC}"
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    fi

    # Start the service in background
    eval "$command > /tmp/${name}.log 2>&1 &"
    echo $! > "/tmp/${name}.pid"
    echo -e "${GREEN}✓ ${name} started (PID: $(cat /tmp/${name}.pid))${NC}"
    echo ""
}

# Get the base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📁 Base directory: $BASE_DIR"
echo ""

# Start Backend Services
echo "=== Starting Backend Services ==="
echo ""

# 1. AI-Powered Diagnostics Backend (Port 5001)
start_service \
    "AI-Diagnostics-Backend" \
    "$BASE_DIR/ai-diagnostics/backend" \
    "5001" \
    "source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 5001"

# 2. Medical Imaging AI Backend (Port 5002)
start_service \
    "Medical-Imaging-Backend" \
    "$BASE_DIR/medical-imaging-ai/backend" \
    "5002" \
    "source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 5002"

# 3. Biosensing Backend (Port 5003)
start_service \
    "Biosensing-Backend" \
    "$BASE_DIR/biosensing/backend" \
    "5003" \
    "npm run dev"

# 4. HIPAA Compliance Backend (Port 5004)
start_service \
    "HIPAA-Backend" \
    "$BASE_DIR/hipaa-compliance/backend" \
    "5004" \
    "npm run dev"

# 5. BioTensor Labs Backend (Port 5005)
start_service \
    "BioTensor-Backend" \
    "$BASE_DIR/biotensor-labs/backend" \
    "5005" \
    "source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 5005"

echo ""
echo "=== Starting Frontend Services ==="
echo ""

# Start Frontend Services

# 1. AI-Powered Diagnostics Frontend (Port 3001)
start_service \
    "AI-Diagnostics-Frontend" \
    "$BASE_DIR/ai-diagnostics/frontend" \
    "3001" \
    "npm run dev"

# 2. Medical Imaging AI Frontend (Port 3002)
start_service \
    "Medical-Imaging-Frontend" \
    "$BASE_DIR/medical-imaging-ai/frontend" \
    "3002" \
    "npm run dev"

# 3. Biosensing Frontend (Port 3003)
start_service \
    "Biosensing-Frontend" \
    "$BASE_DIR/biosensing/frontend" \
    "3003" \
    "npm run dev"

# 4. HIPAA Compliance Frontend (Port 3004)
start_service \
    "HIPAA-Frontend" \
    "$BASE_DIR/hipaa-compliance/frontend" \
    "3004" \
    "npm run dev"

# 5. BioTensor Labs Frontend (Port 3005)
start_service \
    "BioTensor-Frontend" \
    "$BASE_DIR/biotensor-labs/frontend" \
    "3005" \
    "npm run dev"

echo ""
echo "================================================"
echo -e "${GREEN}✓ All services started successfully!${NC}"
echo "================================================"
echo ""
echo "Access your services at:"
echo ""
echo "Frontend Services:"
echo "  • AI-Powered Diagnostics:  http://localhost:3001"
echo "  • Medical Imaging AI:      http://localhost:3002"
echo "  • Biosensing Technology:   http://localhost:3003"
echo "  • HIPAA Compliance:        http://localhost:3004"
echo "  • BioTensor Labs:          http://localhost:3005"
echo ""
echo "Backend APIs:"
echo "  • AI-Powered Diagnostics:  http://localhost:5001/docs"
echo "  • Medical Imaging AI:      http://localhost:5002/docs"
echo "  • Biosensing Technology:   http://localhost:5003/api/v1"
echo "  • HIPAA Compliance:        http://localhost:5004/api/v1"
echo "  • BioTensor Labs:          http://localhost:5005/docs"
echo ""
echo "To stop all services, run: ./STOP_ALL_SERVICES.sh"
echo ""
echo "Logs are available in /tmp/*.log"
echo "PIDs are stored in /tmp/*.pid"
echo ""

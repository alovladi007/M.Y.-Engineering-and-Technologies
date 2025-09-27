#!/bin/bash

# M.Y. Engineering and Technologies - Server Startup Script
# This script starts all the required servers for the M.Y. Engineering platform

echo "🚀 Starting M.Y. Engineering and Technologies Platform..."
echo "=================================================="

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ Port $1 is already in use"
        return 0
    else
        echo "❌ Port $1 is available"
        return 1
    fi
}

# Function to start server
start_server() {
    local port=$1
    local name=$2
    local command=$3
    
    if check_port $port; then
        echo "⚠️  $name server already running on port $port"
    else
        echo "🔄 Starting $name server on port $port..."
        eval "$command" &
        sleep 2
        if check_port $port; then
            echo "✅ $name server started successfully on port $port"
        else
            echo "❌ Failed to start $name server on port $port"
        fi
    fi
}

echo ""
echo "📋 Server Status Check:"
echo "======================="

# Check main M.Y. Engineering site
start_server 8081 "Main M.Y. Engineering Site" "python3 -m http.server 8081"

# Check PowerFlow division
start_server 5001 "PowerFlow Division" "cd powerflow/apps/web && npm run dev -- --port 5001"

# Check LUMA IP division
start_server 5003 "LUMA IP Division" "cd luma-ip && python3 -m http.server 5003"

# Check ORION division
start_server 5004 "ORION Division" "cd orion && python3 -m http.server 5004"

# Check AI Assistant
start_server 5005 "AI Assistant" "cd ai-assistant && npm start"

# Check GAIA division
start_server 5006 "GAIA Division" "cd gaia && python3 -m http.server 5006"

echo ""
echo "🌐 Access URLs:"
echo "==============="
echo "🏠 Main Site:           http://127.0.0.1:8081"
echo "⚡ PowerFlow:           http://127.0.0.1:5001"
echo "⚖️  LUMA IP:            http://127.0.0.1:5003"
echo "🔬 ORION:               http://127.0.0.1:5004"
echo "🤖 AI Assistant:        http://127.0.0.1:5005"
echo "🌱 GAIA:                http://127.0.0.1:5006"
echo ""
echo "📱 All servers are now running!"
echo "💡 Use 'pkill -f python3' and 'pkill -f node' to stop all servers"
echo "=================================================="

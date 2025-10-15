#!/bin/bash

# BioMedical Platform - Stop All Services

echo "🛑 Stopping all BioMedical Platform services..."
echo ""

# Stop all services by PID
for pid_file in /tmp/*-Backend.pid /tmp/*-Frontend.pid; do
    if [ -f "$pid_file" ]; then
        service_name=$(basename "$pid_file" .pid)
        pid=$(cat "$pid_file")

        if ps -p $pid > /dev/null 2>&1; then
            echo "Stopping $service_name (PID: $pid)..."
            kill $pid
            rm "$pid_file"
        else
            echo "$service_name is not running"
            rm "$pid_file"
        fi
    fi
done

echo ""
echo "✓ All services stopped"
echo ""

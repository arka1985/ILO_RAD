#!/bin/bash

echo "==================================================="
echo "    ILO Radiograph Suite - Startup Menu"
echo "==================================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed or not in your PATH."
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

while true; do
    echo "Please select your role:"
    echo "[1] Viewer (Interpreter / Doctor)"
    echo "[2] Pusher (Image Sender / X-Ray Tech)"
    read -p "Enter 1 or 2: " role
    
    if [ "$role" = "1" ]; then
        echo ""
        echo "==================================================="
        echo "Starting VIEWER Application..."
        echo "==================================================="
        echo "[1/2] Installing dependencies..."
        npm install --prefix viewer-app
        
        echo "[2/2] Launching Viewer..."
        echo "The Viewer App will be available at: http://localhost:3000"
        echo "Leave this window open to keep the server running."
        echo "Press Ctrl+C to stop."
        echo ""
        (sleep 5 && (open "http://localhost:3000" || xdg-open "http://localhost:3000" || start "http://localhost:3000")) &
        npm run dev --prefix viewer-app
        break
    elif [ "$role" = "2" ]; then
        echo ""
        echo "==================================================="
        echo "Starting PUSHER Application..."
        echo "==================================================="
        echo "[1/2] Installing dependencies..."
        npm install --prefix pusher-app
        
        echo "[2/2] Launching Pusher..."
        echo "The Pusher App will be available at: http://localhost:3002"
        echo "Leave this window open to keep the server running."
        echo "Press Ctrl+C to stop."
        echo ""
        (sleep 4 && (open "http://localhost:3002" || xdg-open "http://localhost:3002" || start "http://localhost:3002")) &
        npm run dev --prefix pusher-app
        break
    else
        echo "Invalid choice. Please try again."
        echo ""
    fi
done

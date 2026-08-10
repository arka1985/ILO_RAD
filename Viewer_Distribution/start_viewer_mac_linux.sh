#!/bin/bash

echo "==================================================="
echo "    Viewer Apps - Startup Script"
echo "==================================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed or not in your PATH."
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/2] Installing dependencies for all applications..."
npm install
npm run install:all

echo "[2/2] Starting the suite..."
echo ""
echo "The applications will be available at:"
echo "- Full Viewer:        http://localhost:3000"
echo "- Abbreviated Viewer: http://localhost:3001"
echo ""
echo "Leave this window open to keep the servers running."
echo "Press Ctrl+C to stop."
echo ""

# Open browsers in background
(sleep 5 && (open "http://localhost:3000" || xdg-open "http://localhost:3000" || start "http://localhost:3000")) &
(sleep 6 && (open "http://localhost:3001" || xdg-open "http://localhost:3001" || start "http://localhost:3001")) &

npm run dev

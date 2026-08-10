#!/bin/bash

echo "==================================================="
echo "    ILO Radiograph Suite - Startup Script"
echo "==================================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js could not be found."
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/3] Installing root dependencies..."
npm install

echo "[2/3] Installing dependencies for all applications..."
npm run install:all

echo "[3/3] Starting the suite..."
echo ""
echo "The applications will be available at:"
echo "- Full Viewer:        http://localhost:3000"
echo "- Abbreviated Viewer: http://localhost:3001"
echo "- Pusher App:         http://localhost:3002"
echo ""
echo "Leave this terminal open to keep the servers running."
echo "Press Ctrl+C to stop."
echo ""

npm run dev

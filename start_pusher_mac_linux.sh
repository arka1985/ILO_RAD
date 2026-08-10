#!/bin/bash

echo "==================================================="
echo "    Pusher App - Startup Script"
echo "==================================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed or not in your PATH."
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/2] Installing dependencies for Pusher App..."
cd pusher-app || exit
npm install

echo "[2/2] Starting the Pusher App..."
echo ""
echo "The Pusher App will be available at: http://localhost:3002"
echo "Leave this window open to keep the server running."
echo "Press Ctrl+C to stop."
echo ""

# Open browser in background
(sleep 4 && (open "http://localhost:3002" || xdg-open "http://localhost:3002" || start "http://localhost:3002")) &

npm run dev

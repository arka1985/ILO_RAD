#!/bin/bash
echo "==============================================================================="
echo "PRIVACY AND CONFIDENTIALITY DISCLAIMER & TERMS OF USE"
echo "==============================================================================="
echo "1. This software suite operates completely LOCALLY on your network."
echo "2. NO patient data, DICOM files, or reports are sent to any external server or cloud."
echo "3. We do NOT collect telemetry or usage data."
echo "4. You are responsible for ensuring HIPAA/GDPR or local compliance regarding"
echo "   the security of the machine you are running this software on."
echo "==============================================================================="
read -p "Type Y to accept these terms and continue: " accept
if [[ "$accept" != "Y" && "$accept" != "y" ]]; then
    echo "You must accept the terms to use this software. Exiting..."
    sleep 3
    exit 1
fi
echo "Terms accepted. Launching..."


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

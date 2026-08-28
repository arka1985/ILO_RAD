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
echo "    PulmoView: ILO Radiograph Suite - Startup Menu"
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
        npm install --no-audit --no-fund --prefix viewer-app
        
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
        npm install --no-audit --no-fund --prefix pusher-app
        
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

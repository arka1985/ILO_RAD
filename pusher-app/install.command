#!/bin/bash
echo "==================================================="
echo "DICOM Push Utility - Automated Web Installer (Mac/Linux)"
echo "==================================================="
echo ""
echo "Step 1: Checking for Node.js..."
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    echo "Then run this installer again."
    read -p "Press Enter to exit..."
    exit 1
fi

# Navigate to the script's directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo ""
echo "Step 2: Installing Dependencies..."
npm install

echo ""
echo "Step 3: Compiling Application for Production..."
npm run build

echo ""
echo "Step 4: Making Start Script Executable..."
chmod +x start.command

echo ""
echo "==================================================="
echo "Installation Complete!"
echo "Double-click 'start.command' to launch the app."
echo "==================================================="
read -p "Press Enter to close this window..."

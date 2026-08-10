@echo off
TITLE ILO Radiograph - Pusher App

echo ===================================================
echo     Pusher App - Startup Script
echo ===================================================
echo.

echo Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo [1/2] Installing dependencies for Pusher App...
cd pusher-app
call npm install

echo [2/2] Starting the Pusher App...
echo.
echo The Pusher App will be available at: http://localhost:3002
echo Leave this window open to keep the server running.
echo Press Ctrl+C to stop.
echo.

start /B powershell -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3002'"
call npm run dev

pause

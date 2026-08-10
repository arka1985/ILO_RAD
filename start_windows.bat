@echo off
TITLE ILO Radiograph Suite

echo ===================================================
echo     ILO Radiograph Suite - Startup Script
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

echo [1/3] Installing root dependencies...
call npm install

echo [2/3] Installing dependencies for all applications...
call npm run install:all

echo [3/3] Starting the suite...
echo.
echo The applications will be available at:
echo - Full Viewer:        http://localhost:3000
echo - Abbreviated Viewer: http://localhost:3001
echo - Pusher App:         http://localhost:3002
echo.
echo Leave this window open to keep the servers running.
echo Press Ctrl+C to stop.
echo.

call npm run dev

pause

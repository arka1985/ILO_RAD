@echo off
TITLE ILO Radiograph - Viewer Apps

echo ===================================================
echo     Viewer Apps - Startup Script
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

echo [1/2] Installing dependencies for all applications...
call npm install
call npm run install:all

echo [2/2] Starting the suite...
echo.
echo The applications will be available at:
echo - Full Viewer:        http://localhost:3000
echo - Abbreviated Viewer: http://localhost:3001
echo.
echo Leave this window open to keep the servers running.
echo Press Ctrl+C to stop.
echo.

start /B powershell -Command "Start-Sleep -Seconds 5; Start-Process 'http://localhost:3000'"
start /B powershell -Command "Start-Sleep -Seconds 5; Start-Process 'http://localhost:3001'"

call npm run dev

pause

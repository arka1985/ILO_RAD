@echo off
ECHO ===============================================================================
ECHO PRIVACY AND CONFIDENTIALITY DISCLAIMER AND TERMS OF USE
ECHO ===============================================================================
ECHO 1. This software suite operates completely LOCALLY on your network.
ECHO 2. NO patient data, DICOM files, or reports are sent to any external server or cloud.
ECHO 3. We do NOT collect telemetry or usage data.
ECHO 4. You are responsible for ensuring HIPAA/GDPR or local compliance regarding
ECHO    the security of the machine you are running this software on.
ECHO ===============================================================================
set /p "accept=Type Y to accept these terms and continue: "
if /I not "%accept%"=="Y" (
    ECHO You must accept the terms to use this software. Exiting...
    timeout /t 3 >nul
    exit /b
)
ECHO Terms accepted. Launching...

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

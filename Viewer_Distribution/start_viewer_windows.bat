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

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

TITLE ILO Radiograph Suite - Startup

echo ===================================================
echo     ILO Radiograph Suite - Startup Menu
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

:MENU
echo Please select your role:
echo [1] Viewer (Interpreter / Doctor)
echo [2] Pusher (Image Sender / X-Ray Tech)
echo.
set /p role="Enter 1 or 2: "

if "%role%"=="1" goto VIEWER
if "%role%"=="2" goto PUSHER
echo Invalid choice. Please try again.
echo.
goto MENU

:VIEWER
echo.
echo ===================================================
echo Starting VIEWER Application...
echo ===================================================
echo [1/2] Installing dependencies...
call npm install --prefix viewer-app
echo [2/2] Launching Viewer...
echo The Viewer App will be available at: http://localhost:3000
echo Leave this window open to keep the server running.
echo Press Ctrl+C to stop.
echo.
start /B powershell -Command "Start-Sleep -Seconds 5; Start-Process 'http://localhost:3000'"
call npm run dev --prefix viewer-app
pause
exit /b

:PUSHER
echo.
echo ===================================================
echo Starting PUSHER Application...
echo ===================================================
echo [1/2] Installing dependencies...
call npm install --prefix pusher-app
echo [2/2] Launching Pusher...
echo The Pusher App will be available at: http://localhost:3002
echo Leave this window open to keep the server running.
echo Press Ctrl+C to stop.
echo.
start /B powershell -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3002'"
call npm run dev --prefix pusher-app
pause
exit /b

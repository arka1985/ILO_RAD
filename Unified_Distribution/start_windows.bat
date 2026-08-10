@echo off
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

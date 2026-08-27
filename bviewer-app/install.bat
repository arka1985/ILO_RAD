@echo off
echo ===================================================
echo ILO Radiograph Viewer - Automated Web Installer
echo ===================================================
echo.
echo Step 1: Checking for Node.js...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed! 
    echo Please download and install Node.js from https://nodejs.org/ (LTS version)
    echo Make sure to check the box that says "Add to PATH" during installation.
    echo Then run this installer again.
    pause
    exit /b
)

echo.
echo Step 2: Installing Dependencies...
call npm install --no-audit --no-fund

echo.
echo Step 3: Compiling Application for Production...
call npm run build

echo.
echo Step 4: Creating Desktop Shortcut...
set SCRIPT="%TEMP%\CreateShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = "%USERPROFILE%\Desktop\ILO Radiograph Viewer.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%~dp0start.vbs" >> %SCRIPT%
echo oLink.WorkingDirectory = "%~dp0" >> %SCRIPT%
echo oLink.IconLocation = "imageres.dll, 109" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%

echo.
echo ===================================================
echo Installation Complete! 
echo An icon has been placed on your Desktop.
echo Double-click "ILO Radiograph Viewer" to start the app.
echo ===================================================
pause

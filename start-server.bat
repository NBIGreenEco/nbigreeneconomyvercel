@echo off
cd /d C:\Users\user\Documents\GitHub\NBI-Green-Economy

:: Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install it from https://nodejs.org.
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python is not installed. Please install it from https://www.python.org.
    pause
    exit /b 1
)

:: Check if port 3000 is in use
netstat -a -n -o | find "3000" >nul
if %ERRORLEVEL% equ 0 (
    echo Port 3000 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -a -n -o ^| find "3000"') do taskkill /PID %%a /F
)

:: Start Node.js server
start /min cmd /c "node start-server.js"
timeout /t 5
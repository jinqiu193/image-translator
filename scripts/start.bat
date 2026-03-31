@echo off
cd /d "%~dp0.."

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo Starting server on http://localhost:5000 ...
start /min cmd /k "node_modules\.bin\next.cmd dev --port 5000"

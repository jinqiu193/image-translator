@echo off
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000.*LISTENING"') do (
    echo Stopping PID %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo Done.

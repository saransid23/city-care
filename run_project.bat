@echo off
rem Set PowerShell execution policy for the session
powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force"

rem Install frontend dependencies if needed
if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  cd frontend
  powershell -ExecutionPolicy Bypass -Command "npm install"
  cd ..
) else (
  echo Frontend dependencies already installed.
)

rem Start frontend dev server in a new window
start "Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

rem Start backend server in a new window
start "Backend" cmd /c "cd /d %~dp0backend && node src\server.js"

exit /b 0

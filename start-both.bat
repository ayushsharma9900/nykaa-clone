@echo off
echo Starting Nykaa Clone - Frontend and Backend
echo ==========================================

REM Start backend in a new command window
echo Starting Backend Server...
start "Nykaa Backend" cmd /k "cd /d "C:\Users\resale gallery\nykaa-clone\backend" && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new command window
echo Starting Frontend Server...
start "Nykaa Frontend" cmd /k "cd /d "C:\Users\resale gallery\nykaa-clone" && npm run dev"

echo.
echo Both servers are starting in separate windows:
echo - Backend: http://localhost:5001
echo - Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul

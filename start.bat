@echo off
echo ===================================================
echo Starting PRISM AI Full-Stack Reviewer...
echo ===================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "PRISM AI - Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak > nul

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "PRISM AI - Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo PRISM AI is launching!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo ===================================================

@echo off
cd /d "%~dp0server"
if not exist node_modules (
 echo Installing backend dependencies...
 call npm install
 if errorlevel 1 pause & exit /b 1
)
if not exist data.json (
 echo Creating demo data...
 call npm run seed
)
call npm run dev
pause

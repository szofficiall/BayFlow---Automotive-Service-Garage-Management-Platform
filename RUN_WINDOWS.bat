@echo off
cd /d "%~dp0"
call npm install
call npm run install:all
if not exist "server\data.json" call npm run seed
call npm run dev
pause

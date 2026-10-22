@echo off
start "" /MIN node src\index.js
timeout /t 3 /nobreak >nul
start http://localhost:3000

@echo off
cd /d "%~dp0"
echo 正在啟動即時字幕服務...
start http://localhost:5173
npm run dev
pause

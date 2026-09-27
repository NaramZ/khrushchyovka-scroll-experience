@echo off
REM Serves this folder locally and opens DOMA in your default browser.
cd /d "%~dp0"
start "" "http://localhost:8000/index.html"
echo DOMA is running at http://localhost:8000 - close this window to stop.
python -m http.server 8000 || py -m http.server 8000
pause

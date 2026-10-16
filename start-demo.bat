@echo off
echo ========================================================
echo   Launching Mautic Demo UI
echo ========================================================
python server.py
if errorlevel 1 (
    echo Python not found. Opening index.html directly in your default browser...
    start index.html
)
pause

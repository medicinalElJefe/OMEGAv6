@echo off
setlocal
title OMEGA Local Studio
cd /d "%~dp0"
echo.
echo ===================================
echo          OMEGA LOCAL STUDIO
echo ===================================
echo.
echo Opening OMEGA7 in your browser from this computer.
echo No installation, Node, Python, Git or administrator setup required.
echo Keep this window open while using the local studio.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-OMEGA-Local.ps1"
set "OMEGA_EXIT=%ERRORLEVEL%"
if not "%OMEGA_EXIT%"=="0" (
  echo.
  echo Local studio could not start. Check the message above.
  echo Be sure you extracted the full OMEGA portable package.
  pause
)
exit /b %OMEGA_EXIT%

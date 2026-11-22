@echo off
setlocal
title OMEGA Windows Check
cd /d "%~dp0"
echo.
echo OMEGA WINDOWS CHECK
echo Checking this PC and OMEGA source safely. Nothing will be installed.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-r895-windows-preflight.ps1"
set "OMEGA_RESULT=%ERRORLEVEL%"
echo.
if "%OMEGA_RESULT%"=="0" (
  echo Basic checks completed. Full PC execution proof is still separate.
) else (
  echo Check needs attention. See the message above.
)
echo.
pause
exit /b %OMEGA_RESULT%

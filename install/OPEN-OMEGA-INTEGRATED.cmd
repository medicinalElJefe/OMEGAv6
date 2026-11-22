@echo off
setlocal EnableExtensions DisableDelayedExpansion
title OMEGA7 Integrated Local Studio
cd /d "%~dp0"
echo.
echo ===================================
echo     OMEGA7 INTEGRATED WINDOWS
echo ===================================
echo One verified launcher, one bounded local worker, one existing OMEGA7 studio.
echo Cloud Hybrid Link pairing remains explicit and separately authenticated.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-OMEGA-Integrated.ps1" -ApprovedRoot "%~1"
set "OMEGA_EXIT=%ERRORLEVEL%"
if not "%OMEGA_EXIT%"=="0" (
  echo.
  echo OMEGA integrated session was refused or stopped with an error.
  echo No native-host or GPU acceptance is claimed.
  pause
)
exit /b %OMEGA_EXIT%

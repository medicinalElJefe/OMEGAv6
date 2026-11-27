@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Install OMEGA7 for this Windows user
cd /d "%~dp0"
echo OMEGA7 managed per-user install
echo Copies only a SHA-256 verified application package.
echo Does not require administrator rights or change your approved project data.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-OMEGA-Windows.ps1"
if errorlevel 1 (
  echo OMEGA installation failed; no acceptance is claimed.
  pause
  exit /b 1
)
echo Open OMEGA7 Local Studio from the Start menu.
pause
exit /b 0

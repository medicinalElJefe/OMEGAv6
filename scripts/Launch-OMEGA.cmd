@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-OMEGA.ps1"
if errorlevel 1 exit /b 1

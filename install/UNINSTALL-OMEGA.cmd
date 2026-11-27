@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Uninstall managed OMEGA7
cd /d "%~dp0"
echo This removes ONLY the verified, managed OMEGA7 application folder.
echo Approved project files, model files and worker SQLite roots are not removed.
set /p "OMEGA_CONFIRM=Type REMOVE to confirm uninstall: "
if /I not "%OMEGA_CONFIRM%"=="REMOVE" exit /b 1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Uninstall-OMEGA-Windows.ps1" -ConfirmRemove
if errorlevel 1 (
  echo Uninstall refused. Unknown or changed files were not deleted.
  pause
  exit /b 1
)
echo The managed OMEGA7 application has been removed.
pause
exit /b 0

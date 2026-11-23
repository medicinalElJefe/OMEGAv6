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
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "%~dp0Verify-OMEGA-Package.ps1" -PackageRoot "%~dp0."
if errorlevel 1 (
  echo OMEGA package integrity verification failed. Do not use a modified or incomplete package.
  if "%OMEGA_OPERATOR_SMOKE%"=="1" exit /b 1
  pause
  exit /b 1
)
if "%OMEGA_OPERATOR_SMOKE%"=="1" (
  if not defined OMEGA_OPERATOR_READY_FILE (
    echo R911 smoke requested without a readiness file. Refusing.
    exit /b 1
  )
  powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "%~dp0Start-OMEGA-Local.ps1" -NoBrowser -ReadyFile "%OMEGA_OPERATOR_READY_FILE%"
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-OMEGA-Local.ps1"
)
set "OMEGA_EXIT=%ERRORLEVEL%"
if not "%OMEGA_EXIT%"=="0" (
  echo.
  echo Local studio could not start. Check the message above.
  echo Be sure you extracted the full OMEGA portable package.
  if "%OMEGA_OPERATOR_SMOKE%"=="1" exit /b %OMEGA_EXIT%
  pause
)
exit /b %OMEGA_EXIT%

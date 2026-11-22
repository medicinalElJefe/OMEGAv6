@echo off
setlocal EnableExtensions DisableDelayedExpansion
title OMEGA7 Integrated Local Studio
cd /d "%~dp0"
echo.
echo OMEGA7 INTEGRATED LOCAL STUDIO
echo UI + governed local worker. Hybrid Link pairing remains authenticated in-app.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Verify-OMEGA-Package.ps1"
if errorlevel 1 (
  echo Package verification failed. The integrated studio will not launch.
  pause
  exit /b 1
)
set "OMEGA_ROOT=%~1"
if not defined OMEGA_ROOT (
  set /p "OMEGA_ROOT=Existing approved NON-SYSTEM project folder: "
)
if not defined OMEGA_ROOT goto :invalid
if not exist "%OMEGA_ROOT%\." goto :invalid
for %%I in ("%OMEGA_ROOT%") do set "OMEGA_FULL_ROOT=%%~fI"
if /I "%OMEGA_FULL_ROOT:~0,2%"=="%SystemDrive%" goto :invalid
if not exist "%~dp0OMEGA-Local-Hub.exe" (
  echo The compiled local worker is missing.
  goto :failure
)
echo.
echo Starting bounded local worker with the selected approved root.
start "OMEGA7 LOCAL HUB" "%~dp0OMEGA-Local-Hub.exe" --root "%OMEGA_FULL_ROOT%" --port 8765
if errorlevel 1 goto :failure
echo Opening the existing OMEGA7 local interface.
echo The private Hub token is in the approved root's .omega folder.
echo Enter it only in the OMEGA Local / Edge Hub panel.
echo For cloud and native-PC commands, use the separate governed Hybrid Link pairing.
call "%~dp0OPEN-OMEGA.cmd"
exit /b %ERRORLEVEL%
:invalid
echo Invalid approved root. Use an existing non-system project directory.
:failure
echo Integrated startup was refused; no host acceptance is claimed.
pause
exit /b 1

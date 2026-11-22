@echo off
setlocal EnableExtensions DisableDelayedExpansion
title OMEGA Local Automation Hub
cd /d "%~dp0"
echo.
echo OMEGA LOCAL AUTOMATION HUB - OPTIONAL
echo This is the bounded R881 worker, not the Hybrid Link native agent.
echo Python 3.12 or newer must already be installed for this optional service.
echo No project files are modified without a submitted, allowed local job.
echo.
set "OMEGA_ROOT=%~1"
if not defined OMEGA_ROOT (
  set /p "OMEGA_ROOT=Enter your EXISTING approved non-system project folder: "
)
if not defined OMEGA_ROOT goto :invalid
if not exist "%OMEGA_ROOT%\." goto :invalid
if /I "%OMEGA_ROOT%"=="C:\" goto :invalid
if /I "%OMEGA_ROOT%"=="C:" goto :invalid
if /I "%OMEGA_ROOT%"=="%SystemRoot%" goto :invalid
echo.
echo Your local Hub stores its private access token within this approved folder.
echo Never publish the token or paste it into cloud chats.
echo.
set "OMEGA_PYTHON="
where py >nul 2>&1
if not errorlevel 1 set "OMEGA_PYTHON=py -3"
if not defined OMEGA_PYTHON (
  where python >nul 2>&1
  if not errorlevel 1 set "OMEGA_PYTHON=python"
)
if not defined OMEGA_PYTHON (
  echo Python was not found. The UI still works with OPEN-OMEGA.cmd.
  goto :failure
)
%OMEGA_PYTHON% --version
if errorlevel 1 goto :failure
echo.
echo Starting token-protected Hub on 127.0.0.1:8765.
echo Open OMEGA7 and select Local / Edge Automation Hub, then enter
echo the private token from the approved folder's .omega directory.
echo Close this window to stop the worker.
%OMEGA_PYTHON% "%~dp0omega_local_hub_r881.py" --root "%OMEGA_ROOT%" --port 8765
if errorlevel 1 goto :failure
exit /b 0
:invalid
echo Invalid approved folder. Choose an existing non-system project directory.
:failure
echo No Hub acceptance or native-host proof established.
pause
exit /b 1

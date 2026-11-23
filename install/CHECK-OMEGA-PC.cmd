@echo off
setlocal EnableExtensions DisableDelayedExpansion
title OMEGA7 Local Acceptance Observations
cd /d "%~dp0"
echo.
echo OMEGA7 WINDOWS LOCAL OBSERVATION
echo Verifies application bytes and the live local UI, checks GPU adapter
echo inventory and optional local-model availability. This does not pair
echo Hybrid Link or claim native GPU execution.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Check-OMEGA-Windows.ps1"
if errorlevel 1 (
  echo Local acceptance was held; inspect the evidence receipt when present.
  pause
  exit /b 1
)
echo.
echo Local observations written under LOCALAPPDATAOMEGA7-Evidence.
echo Authenticated physical PC proof remains governed by Hybrid Link.
pause
exit /b 0

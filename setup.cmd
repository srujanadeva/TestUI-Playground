@echo off
rem Test Playground: one-click setup for Windows. Double-click this file, or run it from Command Prompt.
rem Runs scripts\setup.ps1 with Windows PowerShell; nothing needs administrator rights.
rem Options: -NoStart (don't start the app at the end), -CaCert C:\path\company-root.cer
setlocal
cd /d "%~dp0"

where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo.
    echo X Setup stopped: Windows PowerShell was not found on this computer.
    echo   It is part of Windows 10 and 11. Ask IT to enable "Windows PowerShell", then run setup.cmd again.
    echo.
    if not defined npm_lifecycle_event pause
    exit /b 1
)

rem Files downloaded as a zip carry a "came from the internet" mark that can block the scripts.
powershell.exe -NoProfile -Command "Get-ChildItem -LiteralPath '%~dp0scripts' -Filter *.ps1 | Unblock-File" >nul 2>&1

rem setup.ps1 writes logs\setup.started first; without it, PowerShell refused to run the script.
del "%~dp0logs\setup.started" >nul 2>&1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup.ps1" %*
set RESULT=%ERRORLEVEL%

if not %RESULT%==0 if not exist "%~dp0logs\setup.started" (
    echo.
    echo X Setup could not start.
    echo   If the message above says "running scripts is disabled" or "not digitally signed",
    echo   your company blocks PowerShell scripts. Ask IT to allow scripts\setup.ps1 from this
    echo   folder, then run setup.cmd again.
    echo.
)

rem Keep the window open when setup.cmd was double-clicked, not when npm or a terminal ran it.
if defined npm_lifecycle_event goto done
echo %cmdcmdline% | find /i "%~nx0" >nul
if not errorlevel 1 pause
:done
exit /b %RESULT%

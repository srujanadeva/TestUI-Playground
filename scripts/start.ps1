# Starts MongoDB (if not already running), then the Vite frontend + Express API.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ErrorActionPreference = 'Stop'

$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

function Test-Port([int]$Port) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $async = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
    return ($async.AsyncWaitHandle.WaitOne(500) -and $client.Connected)
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

Write-Host "==> Checking MongoDB (127.0.0.1:27017)..."
if (Test-Port 27017) {
  Write-Host "    Mongo already running."
} else {
  if (-not (Get-Service -Name MongoDB -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: No 'MongoDB' Windows service found. Run 'npm run setup:win' first." -ForegroundColor Red
    exit 1
  }
  Write-Host "    Mongo not running - starting the MongoDB service..."
  try {
    Start-Service -Name MongoDB
  } catch {
    Write-Host "ERROR: Could not start the MongoDB service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Run 'Start-Service MongoDB' from an Administrator PowerShell, then try again." -ForegroundColor Red
    exit 1
  }

  Write-Host -NoNewline "    Waiting for Mongo to accept connections"
  $up = $false
  for ($i = 0; $i -lt 30 -and -not $up; $i++) {
    Start-Sleep -Seconds 1
    Write-Host -NoNewline "."
    $up = Test-Port 27017
  }
  Write-Host ""
  if (-not $up) {
    Write-Host "ERROR: MongoDB did not start within 30s. Check 'Get-Service MongoDB' and the MongoDB logs." -ForegroundColor Red
    exit 1
  }
}

Write-Host "==> Starting web (Vite) + api (Express) via 'npm run dev'..."
& npm run dev
exit $LASTEXITCODE

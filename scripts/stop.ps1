# Stops the Vite frontend and Express API (and their npm/concurrently wrappers),
# then stops MongoDB.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ProjectDir = Split-Path -Parent $PSScriptRoot

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

function Stop-Tree([int]$ProcessId, [string]$Reason) {
  Write-Host "    Stopping PID $ProcessId ($Reason)"
  # /T also kills child processes; Stop-Process would orphan nodemon's server child.
  & taskkill /PID $ProcessId /T /F 2>&1 | Out-Null
}

Write-Host "==> Stopping dev processes for $ProjectDir ..."

# Node processes whose command line references this project (vite, nodemon, concurrently).
$projectProcs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object {
  $_.CommandLine -and
  $_.CommandLine.IndexOf($ProjectDir, [StringComparison]::OrdinalIgnoreCase) -ge 0
}
foreach ($proc in $projectProcs) {
  Stop-Tree $proc.ProcessId 'project node process'
}

# Whatever still listens on the web/API ports, e.g. the API child that nodemon
# started with a relative path that doesn't contain the project directory.
$listeners = Get-NetTCPConnection -LocalPort 3000, 4000 -State Listen -ErrorAction SilentlyContinue
foreach ($conn in $listeners) {
  if ($conn.OwningProcess -gt 0) {
    Stop-Tree $conn.OwningProcess "listening on port $($conn.LocalPort)"
  }
}

Write-Host "==> Stopping MongoDB (Windows service)..."
if (Get-Service -Name MongoDB -ErrorAction SilentlyContinue) {
  try {
    Stop-Service -Name MongoDB -ErrorAction Stop
    Write-Host "    MongoDB service stopped."
  } catch {
    Write-Host "    Could not stop the MongoDB service: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "    Run 'Stop-Service MongoDB' from an Administrator PowerShell." -ForegroundColor Yellow
  }
} else {
  Write-Host "    No 'MongoDB' service found - nothing to stop."
}

Start-Sleep -Seconds 1
Write-Host "==> Final status:"
foreach ($port in 3000, 4000, 27017) {
  if (Test-Port $port) {
    Write-Host "    Port ${port}: still in use"
  } else {
    Write-Host "    Port ${port}: free"
  }
}

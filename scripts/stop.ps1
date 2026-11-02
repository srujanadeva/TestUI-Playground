# Stops the Vite frontend and Express API (and their npm/concurrently wrappers), then MongoDB:
# the Windows service when it runs as one, otherwise a clean shutdown through the database.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ProjectDir = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'lib.ps1')
Use-OwnTools

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

Write-Host "==> Stopping MongoDB..."
if (-not (Test-MongoUp)) {
  Write-Host "    MongoDB is not running."
} elseif (Stop-Mongo $ProjectDir) {
  Write-Host "    MongoDB stopped."
} else {
  Write-Host "    MongoDB is still running. If it is the 'MongoDB' Windows service, stop it from an Administrator PowerShell: Stop-Service MongoDB" -ForegroundColor Yellow
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

# Checks Node and the npm packages, starts MongoDB if it isn't running (whichever one setup
# chose: the MongoDB service or setup's own copy), then the Vite frontend + Express API.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ErrorActionPreference = 'Stop'

$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir
. (Join-Path $PSScriptRoot 'lib.ps1')
# The system Path comes before the user Path, so an older Node there would otherwise win.
Use-OwnTools

if (-not (Has-Command node)) {
  Write-Host 'ERROR: Node.js is not installed. Run setup first: double-click setup.cmd' -ForegroundColor Red
  exit 1
}

Write-Host '==> Checking Node and npm packages...'
& node scripts/check-deps.js
if ($LASTEXITCODE -eq 2) {
  Write-Host 'ERROR: This Node.js is too old. Run setup.cmd, which updates it.' -ForegroundColor Red
  exit 1
} elseif ($LASTEXITCODE -ne 0) {
  Write-Host 'ERROR: The npm packages are missing or out of date (usually after pulling changes). Run setup.cmd.' -ForegroundColor Red
  exit 1
}

Write-Host '==> Checking MongoDB (127.0.0.1:27017)...'
if (-not (Start-Mongo)) {
  if ($script:MongoHow -eq 'not installed') {
    Write-Host "ERROR: MongoDB $MongoMin or later is not installed. Run setup.cmd." -ForegroundColor Red
  } else {
    $why = Get-MongoLogExplanation $script:MongoLogFile
    Write-Host "ERROR: MongoDB did not start ($($script:MongoHow)). $($why[0])" -ForegroundColor Red
    Write-Host "       Fix: $($why[1] -replace '::', ': ')" -ForegroundColor Red
  }
  exit 1
}
Write-Host "    MongoDB is running ($($script:MongoHow))."

Write-Host "==> Starting web (Vite) + api (Express) via 'npm run dev'..."
Write-Host '    Open https://localhost:3000 (Ctrl+C stops it)'
& npm run dev
exit $LASTEXITCODE

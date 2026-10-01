# One-time bootstrap for a fresh clone on Windows: Node, npm deps, MongoDB,
# dev TLS certs, server\.env, and sample users. Safe to re-run: every step
# detects existing state and skips it.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ErrorActionPreference = 'Stop'

$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

$NodeMinMajor = 18
# The only place the Windows MongoDB version is set. Keep it on the same line as
# MONGO_FORMULA in scripts/mongo.sh (macOS).
$MongoVersion = '8.0.32'
$MongoLine = ($MongoVersion.Split('.')[0..1]) -join '.'
$Summary = New-Object System.Collections.Generic.List[string]

function Note-Done($msg)    { $Summary.Add("  [done] $msg") }
function Note-Skipped($msg) { $Summary.Add("  [skip] $msg (already set up)") }
function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path', 'User')
}

function Winget-Install($id) {
  & winget install -e --id $id --accept-source-agreements --accept-package-agreements
  if ($LASTEXITCODE -ne 0) { Fail "winget install $id failed (exit code $LASTEXITCODE)." }
  Refresh-Path
}

function Get-NodeMajor {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { return 0 }
  $version = (& node -v) -replace '^v', ''
  return [int]($version.Split('.')[0])
}

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

function Find-OpenSSL {
  $onPath = Get-Command openssl -ErrorAction SilentlyContinue
  if ($onPath) { return $onPath.Source }
  $candidates = @(
    "$env:ProgramFiles\Git\usr\bin\openssl.exe",
    "$env:ProgramFiles\Git\mingw64\bin\openssl.exe",
    "$env:ProgramFiles\OpenSSL-Win64\bin\openssl.exe"
  )
  foreach ($path in $candidates) {
    if (Test-Path $path) { return $path }
  }
  return $null
}

Write-Host "==> Setting up $ProjectDir"
Write-Host ""

# -- 1. winget -----------------------------------------------------------------
Write-Host "==> Checking winget..."
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Fail "winget is required. Install 'App Installer' from the Microsoft Store, then re-run this script."
}
Write-Host "    winget found."

# -- 2. Node.js ----------------------------------------------------------------
Write-Host "==> Checking Node.js (need >= $NodeMinMajor.x)..."
if ((Get-NodeMajor) -ge $NodeMinMajor) {
  Write-Host "    Node $(& node -v) found."
  Note-Skipped "Node.js"
} else {
  Write-Host "    Node missing or older than v$NodeMinMajor - installing Node.js LTS via winget..."
  Winget-Install 'OpenJS.NodeJS.LTS'
  if ((Get-NodeMajor) -lt $NodeMinMajor) {
    Fail "Node.js was installed but isn't visible yet. Open a new PowerShell window and re-run this script."
  }
  Write-Host "    Installed Node $(& node -v)."
  Note-Done "Node.js installed via winget"
}

# -- 3. npm dependencies -------------------------------------------------------
Write-Host "==> Installing npm dependencies..."
& npm install
if ($LASTEXITCODE -ne 0) { Fail "npm install failed." }
Note-Done "npm dependencies installed"

# -- 4. MongoDB ----------------------------------------------------------------
Write-Host "==> Checking MongoDB ($MongoVersion)..."
$mongoService = Get-CimInstance Win32_Service -Filter "Name = 'MongoDB'" -ErrorAction SilentlyContinue
if ($mongoService) {
  if ($mongoService.PathName -like "*\Server\$MongoLine\*") {
    Write-Host "    MongoDB $MongoLine service found."
    Note-Skipped "MongoDB"
  } else {
    # Don't replace someone else's MongoDB: other projects may depend on it or its data.
    Fail ("A different MongoDB is installed as the 'MongoDB' service ($($mongoService.PathName)). " +
          "This project uses MongoDB $MongoLine. Uninstall the other version (Settings > Apps) and move its " +
          "data folder aside, then re-run this script.")
  }
} else {
  $msiName = "mongodb-windows-x86_64-$MongoVersion-signed.msi"
  $msiPath = Join-Path $env:TEMP $msiName
  Write-Host "    Downloading the MongoDB $MongoVersion installer (about 750 MB)..."
  # The progress bar makes large downloads very slow in Windows PowerShell 5.1.
  $previousProgress = $ProgressPreference
  $ProgressPreference = 'SilentlyContinue'
  Invoke-WebRequest -Uri "https://fastdl.mongodb.org/windows/$msiName" -OutFile $msiPath -UseBasicParsing
  $ProgressPreference = $previousProgress

  Write-Host "    Installing MongoDB $MongoVersion as the 'MongoDB' service (approve the UAC prompt)..."
  $msiArgs = "/qb /i `"$msiPath`" ADDLOCAL=`"ServerService`" SHOULD_INSTALL_COMPASS=`"0`""
  $installer = Start-Process msiexec.exe -ArgumentList $msiArgs -Verb RunAs -Wait -PassThru
  Remove-Item $msiPath -ErrorAction SilentlyContinue
  # 3010 = installed successfully, reboot recommended.
  if ($installer.ExitCode -notin 0, 3010) { Fail "The MongoDB installer failed (exit code $($installer.ExitCode))." }
  if (-not (Get-Service -Name MongoDB -ErrorAction SilentlyContinue)) {
    Fail "MongoDB $MongoVersion was installed but no 'MongoDB' Windows service exists."
  }
  Note-Done "MongoDB $MongoVersion installed (Windows service 'MongoDB')"
}
if (-not (Get-Command mongosh -ErrorAction SilentlyContinue)) {
  Write-Host "    mongosh not found - installing via winget..."
  Winget-Install 'MongoDB.Shell'
  Note-Done "mongosh installed via winget"
}

# -- 5. Dev TLS certs ----------------------------------------------------------
Write-Host "==> Checking dev TLS certs (certs\key.pem, certs\cert.pem)..."
if ((Test-Path certs\key.pem) -and (Test-Path certs\cert.pem)) {
  Write-Host "    Certs already present."
  Note-Skipped "Dev TLS certs"
} else {
  $openssl = Find-OpenSSL
  if (-not $openssl) {
    Write-Host "    OpenSSL not found - installing via winget..."
    Winget-Install 'ShiningLight.OpenSSL.Light'
    $openssl = Find-OpenSSL
    if (-not $openssl) { Fail "OpenSSL was installed but couldn't be located. Open a new PowerShell window and re-run." }
  }
  Write-Host "    Generating self-signed localhost cert with $openssl ..."
  New-Item -ItemType Directory -Force -Path certs | Out-Null
  # openssl prints progress to stderr; under 'Stop', PowerShell 5.1 would treat that as a fatal error.
  $previous = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & $openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/key.pem -out certs/cert.pem -days 365 -subj "/CN=localhost" 2>&1 | Out-Null
  $code = $LASTEXITCODE
  $ErrorActionPreference = $previous
  if ($code -ne 0 -or -not (Test-Path certs\cert.pem)) { Fail "openssl failed to generate the dev certs (exit code $code)." }
  Note-Done "Dev TLS certs generated (certs\key.pem, certs\cert.pem)"
}

# -- 6. server\.env ------------------------------------------------------------
Write-Host "==> Checking server\.env..."
if (Test-Path server\.env) {
  Write-Host "    server\.env already present."
  Note-Skipped "server\.env"
} else {
  Write-Host "    Creating server\.env from server\.env.example with a generated JWT secret..."
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $secret = -join ($bytes | ForEach-Object { $_.ToString('x2') })
  $content = (Get-Content server\.env.example -Raw) -replace '(?m)^JWT_SECRET=.*$', "JWT_SECRET=$secret"
  # Write without a BOM: a BOM would become part of the first variable name for dotenv.
  [System.IO.File]::WriteAllText((Join-Path $ProjectDir 'server\.env'), $content, (New-Object System.Text.UTF8Encoding($false)))
  Note-Done "server\.env created with a freshly generated JWT_SECRET"
}

# -- 7. Seed sample users ------------------------------------------------------
Write-Host "==> Seeding sample users (alice@example.com, bob@example.com)..."
$mongoUp = Test-Port 27017
if (-not $mongoUp) {
  Write-Host "    Starting the MongoDB service to seed sample data..."
  try {
    Start-Service -Name MongoDB
  } catch {
    Write-Host "    Could not start the MongoDB service: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "    Run 'Start-Service MongoDB' from an Administrator PowerShell, then 'npm run seed'." -ForegroundColor Yellow
  }
  for ($i = 0; $i -lt 30 -and -not $mongoUp; $i++) {
    Start-Sleep -Seconds 1
    $mongoUp = Test-Port 27017
  }
}
if ($mongoUp) {
  & node server/seed.js
  if ($LASTEXITCODE -ne 0) { Fail "Seeding failed." }
  Note-Done "Sample users seeded (alice@example.com / bob@example.com)"
} else {
  Write-Host "    MongoDB isn't reachable on 127.0.0.1:27017 - skipping seed. Run 'npm run seed' once it's up." -ForegroundColor Yellow
}
# Leave MongoDB running either way; start.ps1 just detects it's already up.

# -- 8. Summary ----------------------------------------------------------------
Write-Host ""
Write-Host "==> Setup complete:"
$Summary | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Next step:"
Write-Host "  npm run start:all:win   # starts MongoDB + the API + the frontend"

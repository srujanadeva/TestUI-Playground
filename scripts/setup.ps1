# One-time bootstrap (Windows). Every step checks the machine first: whatever already
# exists is used as is, and only missing pieces are created or installed. Nothing
# existing is replaced. Safe to re-run.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ErrorActionPreference = 'Stop'

$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

$NodeMinMajor = 18
# Installed only when the machine has no MongoDB at all.
$MongoInstallVersion = '8.0.32'

$Summary = New-Object System.Collections.Generic.List[string]
$script:Failed = $false
function Note-Done($msg)    { $Summary.Add("  [done] $msg") }
function Note-Skipped($msg) { $Summary.Add("  [skip] $msg (already present)") }
function Note-Failed($msg)  { $Summary.Add("  [FAIL] $msg"); $script:Failed = $true }

function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path', 'User')
}

function Has-Command($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

# Returns $true on success. Needs winget, which is only required when something is missing.
function Winget-Install($id) {
  if (-not (Has-Command winget)) {
    Write-Host "    winget isn't available to install $id. Install 'App Installer' from the Microsoft Store." -ForegroundColor Yellow
    return $false
  }
  & winget install -e --id $id --accept-source-agreements --accept-package-agreements
  $ok = ($LASTEXITCODE -eq 0)
  Refresh-Path
  return $ok
}

function Get-NodeMajor {
  if (-not (Has-Command node)) { return 0 }
  $version = (& node -v) -replace '^v', ''
  return [int]($version.Split('.')[0])
}
function Node-Ok { return ((Get-NodeMajor) -ge $NodeMinMajor) }

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

function Get-MongoService { Get-CimInstance Win32_Service -Filter "Name = 'MongoDB'" -ErrorAction SilentlyContinue }

Write-Host "==> Setting up $ProjectDir"

# -- 1. Node.js ----------------------------------------------------------------
Write-Host ""
Write-Host "==> Node.js (need $NodeMinMajor+)"
if (Node-Ok) {
  Write-Host "    Found Node $(& node -v)."
  Note-Skipped "Node.js $(& node -v)"
} else {
  Write-Host "    Node $NodeMinMajor+ missing - installing Node.js LTS via winget..."
  if ((Winget-Install 'OpenJS.NodeJS.LTS') -and (Node-Ok)) {
    Note-Done "Node.js $(& node -v) installed via winget"
  } else {
    Note-Failed "Node.js missing or not visible yet (if it was just installed, open a new PowerShell window and re-run)"
  }
}

# -- 2. npm dependencies -------------------------------------------------------
Write-Host ""
Write-Host "==> npm dependencies"
if (-not (Node-Ok)) {
  Write-Host "    Skipped: needs Node."
  Note-Failed "npm dependencies not installed (needs Node)"
} else {
  & npm install
  if ($LASTEXITCODE -eq 0) { Note-Done "npm dependencies installed" } else { Note-Failed "npm install failed (see output above)" }
}

# -- 3. Dev TLS certs ----------------------------------------------------------
Write-Host ""
Write-Host "==> Dev TLS certs (certs\cert.pem, certs\key.pem)"
if ((Test-Path certs\cert.pem) -and (Test-Path certs\key.pem)) {
  Write-Host "    Both present."
  Note-Skipped "Dev TLS certs"
} else {
  $openssl = Find-OpenSSL
  if (-not $openssl) {
    Write-Host "    OpenSSL not found - installing via winget..."
    if (Winget-Install 'ShiningLight.OpenSSL.Light') { $openssl = Find-OpenSSL }
  }
  if (-not $openssl) {
    Note-Failed "Dev TLS certs couldn't be created (OpenSSL not available)"
  } else {
    Write-Host "    Missing - generating a self-signed localhost certificate with $openssl ..."
    New-Item -ItemType Directory -Force -Path certs | Out-Null
    # openssl prints progress to stderr; under 'Stop', PowerShell 5.1 would treat that as a fatal error.
    $ErrorActionPreference = 'Continue'
    $certOutput = & $openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/key.pem -out certs/cert.pem -days 365 -subj "/CN=localhost" 2>&1
    $code = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($code -eq 0 -and (Test-Path certs\cert.pem) -and (Test-Path certs\key.pem)) {
      Note-Done "Dev TLS certs created (certs\cert.pem, certs\key.pem)"
    } else {
      $certOutput | ForEach-Object { Write-Host "    $_" }
      Note-Failed "Dev TLS certs couldn't be created (openssl output above)"
    }
  }
}

# -- 4. server\.env ------------------------------------------------------------
Write-Host ""
Write-Host "==> server\.env"
if (Test-Path server\.env) {
  Write-Host "    Present."
  Note-Skipped "server\.env"
} else {
  Write-Host "    Missing - creating it from server\.env.example with a generated JWT secret..."
  try {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secret = -join ($bytes | ForEach-Object { $_.ToString('x2') })
    $content = (Get-Content server\.env.example -Raw) -replace '(?m)^JWT_SECRET=.*$', "JWT_SECRET=$secret"
    # Write without a BOM: a BOM would become part of the first variable name for dotenv.
    [System.IO.File]::WriteAllText((Join-Path $ProjectDir 'server\.env'), $content, (New-Object System.Text.UTF8Encoding($false)))
    Note-Done "server\.env created with a generated JWT_SECRET"
  } catch {
    Write-Host "    $($_.Exception.Message)"
    Note-Failed "server\.env couldn't be created"
  }
}

# -- 5. MongoDB installed ------------------------------------------------------
Write-Host ""
Write-Host "==> MongoDB"
$mongoService = Get-MongoService
if ($mongoService) {
  Write-Host "    Found the 'MongoDB' service ($($mongoService.PathName)) - using it."
  Note-Skipped "MongoDB (Windows service)"
} elseif (Has-Command mongod) {
  Write-Host "    Found mongod ($((Get-Command mongod).Source)) - using it."
  Note-Skipped "MongoDB"
} else {
  $msiName = "mongodb-windows-x86_64-$MongoInstallVersion-signed.msi"
  $msiPath = Join-Path $env:TEMP $msiName
  try {
    Write-Host "    MongoDB isn't installed - downloading the $MongoInstallVersion installer (about 750 MB)..."
    # The progress bar makes large downloads very slow in Windows PowerShell 5.1.
    $previousProgress = $ProgressPreference
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri "https://fastdl.mongodb.org/windows/$msiName" -OutFile $msiPath -UseBasicParsing
    $ProgressPreference = $previousProgress

    Write-Host "    Installing MongoDB $MongoInstallVersion as the 'MongoDB' service (approve the UAC prompt)..."
    $msiArgs = "/qb /i `"$msiPath`" ADDLOCAL=`"ServerService`" SHOULD_INSTALL_COMPASS=`"0`""
    $installer = Start-Process msiexec.exe -ArgumentList $msiArgs -Verb RunAs -Wait -PassThru
    # 3010 = installed successfully, reboot recommended.
    if (($installer.ExitCode -in 0, 3010) -and (Get-MongoService)) {
      Note-Done "MongoDB $MongoInstallVersion installed (Windows service 'MongoDB')"
    } else {
      Note-Failed "MongoDB install failed (installer exit code $($installer.ExitCode))"
    }
  } catch {
    Write-Host "    $($_.Exception.Message)"
    Note-Failed "MongoDB install failed"
  } finally {
    Remove-Item $msiPath -ErrorAction SilentlyContinue
  }
}
if (-not (Has-Command mongosh)) {
  Write-Host "    mongosh (optional shell) not found - installing via winget..."
  if (Winget-Install 'MongoDB.Shell') {
    Note-Done "mongosh installed via winget"
  } else {
    Write-Host "    Couldn't install mongosh; the app doesn't need it."
  }
}

# -- 6. MongoDB running --------------------------------------------------------
Write-Host ""
Write-Host "==> MongoDB running on 127.0.0.1:27017"
if (Test-Port 27017) {
  Write-Host "    Already running."
  Note-Skipped "MongoDB running"
} elseif (-not (Get-MongoService)) {
  if (Has-Command mongod) {
    Write-Host "    mongod is installed but not as a service, so it can't be started automatically. Start it the way you normally do, then re-run."
    Note-Failed "MongoDB isn't running"
  } else {
    Write-Host "    Skipped: MongoDB isn't installed."
    Note-Failed "MongoDB not running (not installed)"
  }
} else {
  Write-Host "    Starting the MongoDB service..."
  $up = $false
  try {
    Start-Service -Name MongoDB
    for ($i = 0; $i -lt 30 -and -not $up; $i++) {
      Start-Sleep -Seconds 1
      $up = Test-Port 27017
    }
  } catch {
    Write-Host "    Could not start the MongoDB service: $($_.Exception.Message)"
    Write-Host "    Run 'Start-Service MongoDB' from an Administrator PowerShell, then re-run."
  }
  if ($up) { Note-Done "MongoDB started" } else { Note-Failed "MongoDB couldn't be started (see messages above)" }
}

# -- 7. Sample users -----------------------------------------------------------
Write-Host ""
Write-Host "==> Sample users (alice@example.com, bob@example.com)"
if (-not (Test-Port 27017)) {
  Write-Host "    Skipped: MongoDB isn't running."
  Note-Failed "Sample users not seeded (MongoDB isn't running)"
} elseif (-not (Node-Ok) -or -not (Test-Path node_modules)) {
  Write-Host "    Skipped: needs Node and npm dependencies."
  Note-Failed "Sample users not seeded (needs Node and npm dependencies)"
} else {
  & node server/seed.js
  if ($LASTEXITCODE -eq 0) { Note-Done "Sample users ready (existing ones are left as is)" } else { Note-Failed "Seeding failed (see output above)" }
}
# MongoDB is left running; start:all:win just detects that it's already up.

# -- Summary -------------------------------------------------------------------
Write-Host ""
Write-Host "==> Summary"
$Summary | ForEach-Object { Write-Host $_ }
Write-Host ""
if ($script:Failed) {
  Write-Host "Some steps failed ([FAIL] above). Fix them and re-run: npm run setup:win" -ForegroundColor Yellow
  exit 1
}
Write-Host "All set. Next step:"
Write-Host "  npm run start:all:win   # starts MongoDB + the API + the frontend"

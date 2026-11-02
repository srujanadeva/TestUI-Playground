# Shared by setup.ps1, start.ps1 and stop.ps1 (Windows): minimum versions, where setup keeps its
# own tools (%LOCALAPPDATA%\TestPlayground, outside the project), and how MongoDB is found,
# started and stopped. Dot-sourced, not run. Keep this file ASCII-only (Windows PowerShell 5.1).

# The minimums are the versions of the reference machine. Keep $NodeMin in step with
# "engines" in package.json, which start.ps1 checks through check-deps.js.
$NodeMin = '26.3.1'
$MongoMin = '8.0.32'
$MongoshMin = '2.12.0'

$TpHome = Join-Path $env:LOCALAPPDATA 'TestPlayground'
$TpTools = Join-Path $TpHome 'tools'          # setup's own Node, MongoDB and mongosh, one folder each
$TpDb = Join-Path $TpHome 'mongodb-data'      # data folder of a mongod that setup starts itself
$TpDbConf = Join-Path $TpHome 'mongod.conf'
$TpDbLog = Join-Path $TpHome 'mongod.log'

$OwnNode = Join-Path $TpTools 'node\node.exe'
$OwnMongod = Join-Path $TpTools 'mongodb\bin\mongod.exe'
$OwnMongosh = Join-Path $TpTools 'mongosh\bin\mongosh.exe'

function Has-Command([string]$Name) { [bool](Get-Command $Name -ErrorAction SilentlyContinue) }

# Output of a quick command as one string; never throws (native stderr would, under 'Stop')
function Get-Output([string]$File, [string[]]$Arguments) {
    $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    try { return ((& $File @Arguments 2>&1 | ForEach-Object { "$_" }) -join "`n") }
    catch { return '' }
    finally { $ErrorActionPreference = $prev }
}

# "v26.3.1", "db version v8.0.32" and "2.12.0" are all read as dotted numbers
function ConvertTo-Version([string]$Text) {
    if ($Text -match '(\d+)\.(\d+)(\.\d+)?') { return [version]($Matches[0] + $(if ($Matches[3]) { '' } else { '.0' })) }
    return $null
}
function Test-VersionAtLeast([string]$Have, [string]$Want) {
    $h = ConvertTo-Version $Have; $w = ConvertTo-Version $Want
    return ($h -and $w -and $h -ge $w)
}

function Get-NodeVersion([string]$Exe) {
    if (-not $Exe -or -not (Test-Path $Exe)) { return '' }
    return (Get-Output $Exe @('-p', 'process.versions.node')).Trim()
}
function Get-MongodVersion([string]$Exe) {
    if (-not $Exe -or -not (Test-Path $Exe)) { return '' }
    if ((Get-Output $Exe @('--version')) -match 'db version v(\d+\.\d+\.\d+)') { return $Matches[1] }
    return ''
}
function Get-MongoshVersion([string]$Exe) {
    if (-not $Exe -or -not (Test-Path $Exe)) { return '' }
    $v = ((Get-Output $Exe @('--version')) -split "`n")[0].Trim()
    if ($v -match '^\d+\.\d+') { return $v } else { return '' }
}

function Get-CommandPath([string]$Name) {
    $c = Get-Command $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($c) { return $c.Source } else { return '' }
}

# Puts setup's own copy of a tool first on PATH for this window, but only when the one already on
# PATH is missing or older than the minimum, so a newer tool the user installed keeps winning.
function Use-OwnTool([string]$Command, [string]$OwnExe, [scriptblock]$VersionOf, [string]$Min) {
    if (-not (Test-Path $OwnExe)) { return }
    $v = & $VersionOf (Get-CommandPath $Command)
    if (-not (Test-VersionAtLeast $v $Min)) { $env:Path = (Split-Path $OwnExe) + ';' + $env:Path }
}
function Use-OwnTools {
    Use-OwnTool 'node' $OwnNode ${function:Get-NodeVersion} $NodeMin
    Use-OwnTool 'mongod' $OwnMongod ${function:Get-MongodVersion} $MongoMin
    Use-OwnTool 'mongosh' $OwnMongosh ${function:Get-MongoshVersion} $MongoshMin
}

# --- MongoDB -------------------------------------------------------------------

function Test-Port([int]$Port) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $async = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
        return ($async.AsyncWaitHandle.WaitOne(500) -and $client.Connected)
    } catch { return $false } finally { $client.Close() }
}
function Test-MongoUp { Test-Port 27017 }

# The process listening on a TCP port, or $null
function Get-PortProcess([int]$Port) {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $conn) { return $null }
    return Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
}

function Get-MongoService { Get-CimInstance Win32_Service -Filter "Name = 'MongoDB'" -ErrorAction SilentlyContinue }

# The mongod.exe of the 'MongoDB' Windows service (installed by MongoDB's .msi), or ''
function Get-ServiceMongod {
    $svc = Get-MongoService
    if ($svc -and $svc.PathName -match '^\s*"?([^"]+?mongod\.exe)') { return $Matches[1] }
    return ''
}

# Every mongod.exe on this computer, the first one found first
function Get-MongodCandidates {
    $list = @((Get-CommandPath 'mongod'), (Get-ServiceMongod))
    $list += @(Get-ChildItem "$env:ProgramFiles\MongoDB\Server\*\bin\mongod.exe" -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | ForEach-Object { $_.FullName })
    $list += $OwnMongod
    return @($list | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique)
}

# The mongod to use: the first candidate that meets $MongoMin. Setup, start and stop pick it the same way.
function Find-Mongod {
    foreach ($c in Get-MongodCandidates) { if (Test-VersionAtLeast (Get-MongodVersion $c) $MongoMin) { return $c } }
    return ''
}

# Writes the config used when mongod is started directly (not as the Windows service)
function Write-MongoConf {
    New-Item -ItemType Directory -Force -Path $TpDb | Out-Null
    # Single-quoted YAML strings: backslashes in Windows paths are taken literally.
    $text = "# Written by test-playground setup. MongoDB for this project, reachable only from this computer.`r`n" +
            "storage:`r`n  dbPath: '$TpDb'`r`n" +
            "systemLog:`r`n  destination: file`r`n  path: '$TpDbLog'`r`n  logAppend: true`r`n" +
            "net:`r`n  bindIp: 127.0.0.1`r`n  port: 27017`r`n"
    [IO.File]::WriteAllText($TpDbConf, $text, (New-Object System.Text.UTF8Encoding($false)))
}

# Starts MongoDB if it isn't running and waits up to 30 s. Returns $true when it is up;
# $script:MongoHow says how it was started and $script:MongoLogFile which log to read.
function Start-Mongo {
    $script:MongoLogFile = $TpDbLog
    if (Test-MongoUp) { $script:MongoHow = 'already running'; return $true }
    $bin = Find-Mongod
    if (-not $bin) { $script:MongoHow = 'not installed'; return $false }

    $started = $false
    if ($bin -eq (Get-ServiceMongod)) {
        try {
            Start-Service -Name MongoDB -ErrorAction Stop
            $script:MongoHow = "the 'MongoDB' Windows service"
            $svcLog = Join-Path (Split-Path (Split-Path $bin)) 'log\mongod.log'
            if (Test-Path $svcLog) { $script:MongoLogFile = $svcLog }
            $started = $true
        } catch {
            # Starting a service usually needs administrator rights; run it directly instead.
        }
    }
    if (-not $started) {
        Write-MongoConf
        Start-Process -FilePath $bin -ArgumentList @('--config', "`"$TpDbConf`"") -WindowStyle Hidden | Out-Null
        $script:MongoHow = "$bin with $TpDbConf"
    }
    for ($i = 0; $i -lt 30; $i++) {
        if (Test-MongoUp) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}

# @(cause, fix) from the end of a mongod log, for a mongod that didn't start
function Get-MongoLogExplanation([string]$LogFile) {
    $t = ''
    if (Test-Path $LogFile) { $t = (Get-Content $LogFile -Tail 300 -ErrorAction SilentlyContinue) -join "`n" }
    $readLog = "Read the end of the MongoDB log::Get-Content '$LogFile' -Tail 40"
    if ($t -match 'Address already in use|10048') { return @('Another program took port 27017 while MongoDB was starting.', 'Find it::Get-NetTCPConnection -LocalPort 27017 -State Listen') }
    if ($t -match 'Unable to lock the lock file|Another mongod instance is already running') { return @('Another MongoDB is already using the data folder.', 'Stop the other MongoDB (Task Manager > mongod.exe > End task).') }
    if ($t -match 'featureCompatibilityVersion|UPGRADE PROBLEM|Wrong mongod version|unsupported WiredTiger file version') {
        return @('The data folder was created by a different MongoDB version, which this one cannot open.', "Start the MongoDB that created it, or, if its data isn't needed, move $TpDb aside and run setup again.") }
    if ($t -match 'There is not enough space|No space left') { return @('The disk is full.', 'Free at least 4 GB of disk space.') }
    if ($t -match 'Access is denied|Permission denied') { return @('MongoDB may not write to its data or log folder. Antivirus software or a folder created by another user can cause this.', "Check that you can write to $TpHome, or ask IT to allow it in the antivirus software.") }
    return @('MongoDB did not start within 30 seconds; its log says why.', $readLog)
}

# Stops MongoDB whichever way it was started. Returns $true when port 27017 is free afterwards.
function Stop-Mongo([string]$ProjectDir) {
    if (-not (Test-MongoUp)) { return $true }
    $svc = Get-MongoService
    if ($svc -and $svc.State -eq 'Running') {
        try { Stop-Service -Name MongoDB -ErrorAction Stop } catch { }
    }
    if ((Test-MongoUp) -and (Test-Path (Join-Path $ProjectDir 'node_modules\mongoose'))) {
        # A clean shutdown through the database itself; works without administrator rights.
        Get-Output 'node' @((Join-Path $ProjectDir 'scripts\mongo-admin.js'), 'shutdown') | Out-Null
    }
    for ($i = 0; $i -lt 15 -and (Test-MongoUp); $i++) { Start-Sleep -Seconds 1 }
    if (Test-MongoUp) {
        $p = Get-PortProcess 27017
        if ($p -and $p.ProcessName -eq 'mongod') { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2 }
    }
    return -not (Test-MongoUp)
}

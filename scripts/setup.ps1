<#
Test Playground: one-click setup for Windows 10 and 11. Start it with setup.cmd (double-click).

For every tool: not installed -> installed; the minimum version or newer -> kept; older -> updated.
Tools are downloaded from their official sites (checksum-verified) into
%LOCALAPPDATA%\TestPlayground\tools. An older copy owned by another installer is left as it is:
the new one is installed next to it and put first on your user Path.

Minimum versions: Node.js 26.3.1, MongoDB 8.0.32, mongosh 2.12.0 (optional)
Then: npm packages, the HTTPS certificate, server\.env, MongoDB running, sample users, and
finally the app itself (npm run start:all:win). Nothing needs administrator rights.

On a company network that inspects HTTPS traffic, pass the company root certificate:
  setup.cmd -CaCert C:\path\company-root.cer

Usage: setup.cmd [-NoStart] [-CaCert <file>]        Full log: logs\setup.log
This file is plain ASCII on purpose: Windows PowerShell 5.1 misreads other characters.
#>
param([string]$CaCert = $env:TEST_PLAYGROUND_CA_CERT, [switch]$NoStart)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'   # the progress bar makes Invoke-WebRequest many times slower
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

$NodePin = '26.3.1'
$MongoPin = '8.0.32'
$MongoshPin = '2.12.0'
# mongosh publishes no checksum files, so this was taken from the official download.
$MongoshSha = 'd9dfc366a8a6b6771fcb05fe582d4b1bfe567f7a1ed7a72194dcf5b8202e9db3'
$MinFreeGB = 4
$TotalSteps = 11

$ProjectDir = Split-Path -Parent $PSScriptRoot
$LogDir = Join-Path $ProjectDir 'logs'
$Log = Join-Path $LogDir 'setup.log'
$LogRel = 'logs\setup.log'

$script:StepNo = 0
$script:StepName = ''
$script:Attention = New-Object System.Collections.ArrayList
$script:Summary = New-Object System.Collections.ArrayList
$script:PathAdd = New-Object System.Collections.ArrayList
$script:ProxyShown = ''
$script:CaPem = ''
$script:TailLines = 0
$script:SoftFail = $false
$script:Width = 100
try { $w = $Host.UI.RawUI.WindowSize.Width; if ($w -ge 60) { $script:Width = [math]::Min($w - 1, 100) } } catch { }

# --- Output -------------------------------------------------------------------

function Write-Log([string]$Text) {
    try { Add-Content -Path $Log -Value ("{0} {1}" -f (Get-Date -Format 'HH:mm:ss'), $Text) -Encoding UTF8 } catch { }
}

# Word-wraps $Text to the window: $Prefix before the first line, $Indent before the others
function Write-Para([string]$Prefix, [string]$Indent, [string]$Text, [string]$PrefixColor = '') {
    $max = $script:Width - $Indent.Length
    $lines = New-Object System.Collections.ArrayList
    $line = ''
    foreach ($word in ($Text -split ' ')) {
        if ($line.Length -gt 0 -and ($line.Length + 1 + $word.Length) -gt $max) { [void]$lines.Add($line); $line = $word }
        elseif ($line.Length -gt 0) { $line += " $word" }
        else { $line = $word }
    }
    [void]$lines.Add($line)
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($i -eq 0) {
            if ($PrefixColor) { Write-Host $Prefix -ForegroundColor $PrefixColor -NoNewline } else { Write-Host $Prefix -NoNewline }
        } else { Write-Host $Indent -NoNewline }
        Write-Host $lines[$i]
    }
}

function Step([string]$Title) {
    $script:StepNo++; $script:StepName = $Title
    Write-Host ''
    Write-Host ("[{0}/{1}] {2}" -f $script:StepNo, $TotalSteps, $Title) -ForegroundColor Cyan
    Write-Log "=== [$($script:StepNo)/$TotalSteps] $Title ==="
}
function Skipped([string]$Text)   { Write-Para '  [ok]  ' '        ' $Text Green;  Write-Log "skip: $Text" }
function Installed([string]$Text) { Write-Para '  [new] ' '        ' $Text Green;  Write-Log "installed: $Text" }
function Updated([string]$Text)   { Write-Para '  [upd] ' '        ' $Text Green;  Write-Log "updated: $Text" }
function Ok([string]$Text)        { Write-Para '  [ok]  ' '        ' $Text Green;  Write-Log "ok: $Text" }
function Info([string]$Text)      { Write-Para '   -    ' '        ' $Text;        Write-Log "info: $Text" }
function Warn([string]$Text)      { Write-Para '  [!]   ' '        ' $Text Yellow; Write-Log "warn: $Text" }
function Add-Summary([string]$Status, [string]$Name, [string]$Version, [string]$Result) { [void]$script:Summary.Add(@($Status, $Name, $Version, $Result)) }
function Add-Attention([string]$Title, [string]$Fix) { [void]$script:Attention.Add(@($Title, $Fix)); Warn $Title }

# A fix: the text wrapped, then the command (after "::") on its own line
function Write-Fix([string]$Prefix, [string]$Indent, [string]$Fix) {
    $parts = $Fix -split '::', 2
    Write-Para $Prefix $Indent $parts[0]
    $script:LastFixHadCommand = ($parts.Count -gt 1)
    if ($script:LastFixHadCommand) { Write-Host ''; Write-Host "$Indent  $($parts[1])" -ForegroundColor Cyan; Write-Host '' }
}

# Thrown by Stop-Setup while an optional step runs, so setup can carry on
class OptionalStepFailed : System.Exception { OptionalStepFailed([string]$m) : base($m) { } }

# Prints Problem / Cause / Details / Fix and stops. A fix "text::command" shows the command on its own line.
function Stop-Setup([string]$Problem, [string]$Cause, [string[]]$Fix) {
    if ($script:SoftFail) {
        Warn "$Problem $Cause"
        Write-Log "optional step failed: $Problem | $Cause"
        throw [OptionalStepFailed]::new($Problem)
    }
    $pad = '           '
    Write-Host ''
    Write-Host ("X Step {0} of {1} failed: {2}" -f $script:StepNo, $TotalSteps, $script:StepName) -ForegroundColor Red
    Write-Host ''
    Write-Para '  Problem  ' $pad $Problem; Write-Host ''
    Write-Para '  Cause    ' $pad $Cause; Write-Host ''
    if ($script:TailLines -gt 0 -and (Test-Path $Log)) {
        Write-Host "  Details  last lines of ${LogRel}:"
        Get-Content $Log -Tail $script:TailLines | ForEach-Object {
            $l = "$_"; if ($l.Length -gt $script:Width - 13) { $l = $l.Substring(0, $script:Width - 13) }
            Write-Host "$pad| $l" -ForegroundColor DarkGray
        }
        Write-Host ''
    }
    $n = 1
    foreach ($f in $Fix) {
        if (-not $f) { continue }
        $label = if ($n -eq 1) { '  Fix      ' } else { $pad }
        Write-Fix "$label$n. " '              ' $f
        $n++
    }
    if ($n -gt 1 -and -not $script:LastFixHadCommand) { Write-Host '' }
    Write-Para '  Then     ' $pad 'Run setup.cmd again. Finished steps are skipped.'
    Write-Host ''
    Write-Host "  Log      $LogRel"
    Write-Log "FAILED: $Problem | $Cause"
    exit 1
}

# Runs a command with its output in the log only; returns the exit code. $script:LastOut holds the output.
function Invoke-Logged([string]$File, [string[]]$Arguments) {
    $argLine = ($Arguments | ForEach-Object { if ($_ -match '[\s"]') { '"' + ($_ -replace '"', '\"') + '"' } else { $_ } }) -join ' '
    return (Invoke-LoggedRaw $File $argLine)
}

# Invoke-Logged with the argument line passed as is (cmd.exe has its own quoting rules)
function Invoke-LoggedRaw([string]$File, [string]$ArgLine) {
    $out = Join-Path $TpHome 'out.tmp'; $err = Join-Path $TpHome 'err.tmp'
    Write-Log "`$ $File $ArgLine"
    try {
        $p = Start-Process -FilePath $File -ArgumentList $ArgLine -WorkingDirectory $ProjectDir -NoNewWindow -PassThru `
            -RedirectStandardOutput $out -RedirectStandardError $err
        $null = $p.Handle   # without reading the handle first, ExitCode can come back empty
        $p.WaitForExit()
        $code = $p.ExitCode
    } catch {
        Write-Log "could not start ${File}: $($_.Exception.Message)"
        $script:LastOut = $_.Exception.Message
        return 9009
    }
    $script:LastOut = ((@(Get-Content $out -ErrorAction SilentlyContinue) + @(Get-Content $err -ErrorAction SilentlyContinue)) -join "`n")
    if ($script:LastOut) { Add-Content -Path $Log -Value $script:LastOut -Encoding UTF8 }
    Remove-Item $out, $err -Force -ErrorAction SilentlyContinue
    return $code
}

# --- Start-up checks that need no tools -----------------------------------------

try {
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
    Add-Content -Path $Log -Value "`r`n===== setup.ps1 started $(Get-Date) =====" -Encoding UTF8
    # setup.cmd looks for this file to tell "PowerShell refused to run the script" from a failed step
    Set-Content -Path (Join-Path $LogDir 'setup.started') -Value '' -Encoding ASCII
} catch {
    Write-Host ''
    Write-Host 'X Setup cannot write to the project folder.' -ForegroundColor Red
    Write-Host "  Cause    $ProjectDir is read-only, or belongs to another user."
    Write-Host '  Fix      Clone the repository into a folder of your own (for example C:\Users\<you>\Projects) and run setup.cmd there.'
    exit 1
}

$libFile = Join-Path $PSScriptRoot 'lib.ps1'
if (-not (Test-Path $libFile)) {
    Write-Host ''
    Write-Host 'X Setup cannot start: scripts\lib.ps1 is missing.' -ForegroundColor Red
    Write-Host '  Fix      Clone the whole repository and run setup.cmd from its folder.'
    exit 1
}
. $libFile
$TpWork = Join-Path $TpHome 'downloads'
Set-Location $ProjectDir

# --- Network ------------------------------------------------------------------

$ProxyFix = 'On a company network, ask IT for the proxy address. Set it in Command Prompt, then run setup.cmd from the same window::set HTTPS_PROXY=http://<proxy-host>:<port>'
$CaFix = 'Ask IT for the company root certificate (a .cer or .pem file), then run setup with it::setup.cmd -CaCert C:\path\company-root.cer'

# @(cause, fix1, fix2) for a failed request to $HostName
function Get-NetExplanation($Exception, [string]$HostName) {
    $status = ''; $http = 0; $e = $Exception
    while ($e) {
        if ($e -is [System.Net.WebException]) {
            if (-not $status) { $status = [string]$e.Status }
            if ($e.Response -and -not $http) { $http = [int]$e.Response.StatusCode }
        }
        if ($e -is [System.Security.Authentication.AuthenticationException]) { $status = 'TrustFailure' }
        $e = $e.InnerException
    }
    $msg = "$($Exception.Message)"
    if (-not $status -and $msg -match '\((\d{3})\)') { $status = 'ProtocolError'; $http = [int]$Matches[1] }
    $check = "Check that the site opens in a browser: https://$HostName"
    switch -regex ($status) {
        'ProxyNameResolutionFailure' {
            return @("The proxy server ($($script:ProxyShown)) could not be found.",
                'Check the proxy address with IT and set it again in Command Prompt::set HTTPS_PROXY=http://<proxy-host>:<port>', $check) }
        'NameResolutionFailure' {
            return @("The address $HostName could not be found. Either there is no internet connection, a VPN is not connected, or the company network requires a proxy.",
                'Connect to the internet or the VPN.', $ProxyFix) }
        'ConnectFailure|Timeout|ConnectionClosed|ReceiveFailure|KeepAliveFailure' {
            return @("The connection to $HostName was refused or timed out. This is usually a firewall, or a proxy that is not set.", $ProxyFix, $check) }
        'TrustFailure|SecureChannelFailure' {
            return @("The secure (HTTPS) connection to $HostName is not trusted. Company networks that inspect HTTPS traffic replace the site's certificate with their own.", $CaFix, '') }
        'ProtocolError' {
            switch ($http) {
                407 { return @("The proxy ($($script:ProxyShown)) needs a user name and password.",
                        'Put them in the proxy address in Command Prompt::set HTTPS_PROXY=http://<user>:<password>@<proxy-host>:<port>', '') }
                403 { return @("$HostName refused the download (HTTP 403). A company web filter usually causes this.", "Ask IT to allow https://$HostName.", '') }
                404 { return @("The file is not on $HostName (HTTP 404): the download address in setup.ps1 is out of date.",
                        'Get the latest version of the repository::git pull', '') }
                default { return @("$HostName answered with an error (HTTP $http). This is usually a short problem on their side.", 'Wait a few minutes.', '') }
            }
        }
    }
    return @("The request to $HostName failed: $msg", 'Check the internet connection.', $check)
}

function Get-HostName([string]$Url) { try { return ([uri]$Url).Host } catch { return $Url } }

# Downloads to a file with 3 attempts; returns $null or the last exception
function Get-WebFile([string]$Url, [string]$OutFile) {
    Write-Log "download $Url"
    $last = $null
    for ($i = 1; $i -le 3; $i++) {
        try {
            $req = @{ Uri = $Url; OutFile = $OutFile; UseBasicParsing = $true; TimeoutSec = 3600; Headers = @{ 'User-Agent' = 'test-playground-setup' } }
            if ($script:ProxyUrl) { $req.Proxy = $script:ProxyUrl; $req.ProxyUseDefaultCredentials = $true }
            Invoke-WebRequest @req
            return $null
        } catch {
            $last = $_.Exception
            Write-Log "attempt ${i}: $($last.Message)"
            $code = 0; if ($last.Response) { $code = [int]$last.Response.StatusCode }
            if ($code -ge 400 -and $code -lt 500) { break }   # 403/404/407 do not get better on retry
            Start-Sleep -Seconds 3
        }
    }
    Remove-Item $OutFile -Force -ErrorAction SilentlyContinue
    return $last
}

# Text of a URL; stops with the explanation on failure
function Get-WebText([string]$Url, [string]$What) {
    $tmp = Join-Path $TpWork 'fetch.tmp'
    $ex = Get-WebFile $Url $tmp
    if ($ex) {
        $why = Get-NetExplanation $ex (Get-HostName $Url)
        Stop-Setup "$What could not be downloaded." $why[0] @($why[1], $why[2])
    }
    $text = [IO.File]::ReadAllText($tmp)
    Remove-Item $tmp -Force
    return $text
}

# Verified download; stops on failure
function Save-Download([string]$Url, [string]$Dest, [string]$Expected, [string]$What) {
    $part = "$Dest.part"
    $ex = Get-WebFile $Url $part
    if ($ex) {
        $why = Get-NetExplanation $ex (Get-HostName $Url)
        Stop-Setup "$What could not be downloaded." $why[0] @($why[1], $why[2])
    }
    $actual = (Get-FileHash -Path $part -Algorithm SHA256).Hash
    if (-not $Expected -or $actual -ne $Expected.ToUpper()) {
        Remove-Item $part -Force
        Write-Log "checksum mismatch: expected $Expected got $actual"
        Stop-Setup "The downloaded $What is damaged: its checksum does not match." `
            'The download was cut off, or a company proxy changed the file.' `
            @('Run setup.cmd again.', "If it happens again, try another network, or ask IT whether downloads from $(Get-HostName $Url) are changed by the proxy.")
    }
    Move-Item -Path $part -Destination $Dest -Force
}

# Runs $Action until it stops throwing, up to $Tries times 2 s apart. Antivirus software
# (Microsoft Defender) scans freshly unpacked .exe files and holds them open meanwhile, so a
# move or delete right after unpacking fails with "being used by another process" for a while.
function Invoke-Retry([scriptblock]$Action, [string]$What, [int]$Tries = 15) {
    for ($i = 1; $i -le $Tries; $i++) {
        try { & $Action; return $true }
        catch { Write-Log "$What, attempt ${i}: $($_.Exception.Message)"; Start-Sleep -Seconds 2 }
    }
    return $false
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
# Unpacks a zip with one top folder and puts that folder at $Target (replacing it)
function Expand-ToolZip([string]$Zip, [string]$Target, [string]$What) {
    # A new folder each time: one left over from an interrupted run may still be locked.
    $stage = Join-Path $TpWork ('stage-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
    try { [IO.Compression.ZipFile]::ExtractToDirectory($Zip, $stage) }
    catch {
        Write-Log $_.Exception.Message
        Stop-Setup "$What could not be unpacked." 'The disk is full, the download is damaged, or antivirus software locked a file.' `
            @("Free at least $MinFreeGB GB of disk space.", "If antivirus software reported something, ask IT to allow the folder $TpHome.")
    }
    $inner = Get-ChildItem $stage -Directory | Select-Object -First 1
    New-Item -ItemType Directory -Force -Path (Split-Path $Target) | Out-Null
    if (Test-Path $Target) {
        if (-not (Invoke-Retry { Remove-Item $Target -Recurse -Force -ErrorAction Stop } "remove old $Target" 5)) {
            Stop-Setup "The old $What in $Target could not be replaced." 'A program is still using it (the running app, a terminal, or VS Code).' @('Stop the app::npm run stop:all:win', 'Close VS Code and every Command Prompt and PowerShell window except this one.')
        }
    }
    Info "Putting $What in place (antivirus software may scan it first; this can take a minute)"
    # Moving a folder is a rename and needs every file in it free; copying only reads them, so it
    # works while they are being scanned. Try the fast move first.
    $placed = Invoke-Retry { Move-Item -Path $inner.FullName -Destination $Target -ErrorAction Stop } "move to $Target"
    if (-not $placed) {
        Remove-Item $Target -Recurse -Force -ErrorAction SilentlyContinue
        $placed = Invoke-Retry { Copy-Item -Path $inner.FullName -Destination $Target -Recurse -Force -ErrorAction Stop } "copy to $Target" 5
    }
    if (-not $placed) {
        Remove-Item $Target -Recurse -Force -ErrorAction SilentlyContinue
        Stop-Setup "$What could not be put in place in $Target." 'Antivirus software kept the unpacked files locked for more than a minute.' `
            @('Wait a minute, then run setup.cmd again.', "If it happens again, ask IT to exclude the folder $TpHome from antivirus scanning.")
    }
    Remove-Item $stage, $Zip -Recurse -Force -ErrorAction SilentlyContinue
}

# --- Generic tool check ---------------------------------------------------------

# Who owns an installation: 'ours' (setup's copy), 'service' (the MongoDB .msi) or 'other'
function Get-ToolSource([string]$Path) {
    if (($Path -replace '/', '\') -like (($TpTools -replace '/', '\') + '\*')) { return 'ours' }
    if ($Path -and $Path -eq (Get-ServiceMongod)) { return 'service' }
    return 'other'
}

# Not installed -> download; minimum or newer -> kept; older -> setup's copy replaced, or a new
# copy installed next to another installer's. Returns @(exe, version, result, isOwn).
function Confirm-Tool([string]$Label, [string]$Min, [scriptblock]$VersionOf, [scriptblock]$Install, [string]$Own, [string[]]$Candidates) {
    $old = ''; $oldExe = ''
    foreach ($c in (@($Candidates) + $Own | Where-Object { $_ } | Select-Object -Unique)) {
        $v = & $VersionOf $c
        if (-not $v) { continue }
        if (Test-VersionAtLeast $v $Min) {
            if ($v -eq $Min) { Skipped "$Label $v is already installed ($c). Nothing to do." }
            else { Skipped "$Label $v is already installed ($c). It is newer than $Min, so it is kept." }
            return @($c, $v, 'already installed', ($c -eq $Own))
        }
        if (-not $old) { $old = $v; $oldExe = $c }
    }
    if ($old) {
        Info "$Label $old ($oldExe) is older than $Min. Updating it."
        & $Install
        $v = & $VersionOf $Own
        if ((Get-ToolSource $oldExe) -eq 'ours') { Updated "Updated $Label $old -> $v." }
        else { Updated "Installed $Label $v in $(Split-Path $Own) and made it the default. The old version ($oldExe) belongs to another installer and is left as it is." }
        return @($Own, $v, "updated from $old", $true)
    }
    & $Install
    $v = & $VersionOf $Own
    Installed "Installed $Label $v in $(Split-Path $Own)."
    return @($Own, $v, 'installed', $true)
}

# Tells Explorer that the user environment changed, so windows opened from now on see the new Path
function Send-EnvironmentChanged {
    try {
        if (-not ('TestPlayground.Native' -as [type])) {
            Add-Type -Namespace 'TestPlayground' -Name 'Native' -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("user32.dll", CharSet = System.Runtime.InteropServices.CharSet.Auto)]
public static extern System.IntPtr SendMessageTimeout(System.IntPtr hWnd, uint Msg, System.UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out System.UIntPtr lpdwResult);
'@
        }
        $result = [UIntPtr]::Zero
        # HWND_BROADCAST, WM_SETTINGCHANGE, SMTO_ABORTIFHUNG, 5 s
        [void][TestPlayground.Native]::SendMessageTimeout([IntPtr]0xffff, 0x1A, [UIntPtr]::Zero, 'Environment', 2, 5000, [ref]$result)
    } catch { Write-Log "environment broadcast failed: $($_.Exception.Message)" }
}

function Add-ToolPath([string]$Dir) {
    if (-not $script:PathAdd.Contains($Dir)) { [void]$script:PathAdd.Add($Dir) }
    $env:Path = "$Dir;$env:Path"
}

# Puts setup's tool folders first on the user Path (other entries and unexpanded %VARS% kept).
# Returns present | set | updated | removed | not needed.
function Save-UserPath {
    $envKey = Get-Item 'HKCU:\Environment'
    $raw = [string]$envKey.GetValue('Path', '', 'DoNotExpandEnvironmentNames')
    $first = @($script:PathAdd)
    $kept = @($raw -split ';' | Where-Object { $_ -and ($_ -notlike "$TpTools\*") -and ($first -notcontains $_) })
    $newPath = ($first + $kept) -join ';'
    $hadOurs = [bool]($raw -split ';' | Where-Object { $_ -like "$TpTools\*" })
    $oldCa = [Environment]::GetEnvironmentVariable('NODE_EXTRA_CA_CERTS', 'User')
    if ($raw -eq $newPath -and (-not $script:CaPem -or $oldCa -eq $script:CaPem)) {
        if ($first.Count) { return 'present' } else { return 'not needed' }
    }
    # Written as ExpandString through the registry: .NET's SetEnvironmentVariable would store it as a
    # plain string and break entries such as %USERPROFILE%\bin.
    Set-ItemProperty -Path 'HKCU:\Environment' -Name Path -Value $newPath -Type ExpandString
    if ($script:CaPem) { Set-ItemProperty -Path 'HKCU:\Environment' -Name NODE_EXTRA_CA_CERTS -Value $script:CaPem }
    Send-EnvironmentChanged
    if (-not $first.Count) { return 'removed' }
    if ($hadOurs) { return 'updated' } else { return 'set' }
}

# --- Archive installs ----------------------------------------------------------

function Install-Node {
    $base = "https://nodejs.org/dist/v$NodePin"
    $sums = Get-WebText "$base/SHASUMS256.txt" 'The Node.js download list'
    $file = "node-v$NodePin-win-$NodeArch.zip"
    $sha = ''
    foreach ($line in ($sums -split "`n")) { $p = $line.Trim() -split '\s+'; if ($p.Count -eq 2 -and $p[1] -eq $file) { $sha = $p[0] } }
    Info "Downloading Node.js $NodePin (about 35 MB)"
    $zip = Join-Path $TpWork 'node.zip'
    Save-Download "$base/$file" $zip $sha "Node.js $NodePin"
    Expand-ToolZip $zip (Join-Path $TpTools 'node') 'Node.js'
    if (-not (Get-NodeVersion $OwnNode)) {
        Stop-Setup 'The installed Node.js does not start.' 'Antivirus software may have blocked it.' @("Delete the folder $TpTools\node so it is downloaded again, or ask IT to allow it.")
    }
}

function Install-Mongo {
    $url = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-$MongoPin.zip"
    $sha = ((Get-WebText "$url.sha256" 'The MongoDB checksum') -split '\s+')[0]
    Info "Downloading MongoDB $MongoPin (about 800 MB; this takes a while)"
    $zip = Join-Path $TpWork 'mongodb.zip'
    Save-Download $url $zip $sha "MongoDB $MongoPin"
    # Replacing setup's own copy while it runs would fail on locked files.
    $p = Get-PortProcess 27017
    if ($p -and $p.Path -like "$TpTools\*") { Info "Stopping setup's old MongoDB before replacing it"; Stop-Mongo $ProjectDir | Out-Null }
    Expand-ToolZip $zip (Join-Path $TpTools 'mongodb') 'MongoDB'
    # Debug symbols: most of the download, never needed to run it.
    Remove-Item (Join-Path $TpTools 'mongodb\bin\*.pdb') -Force -ErrorAction SilentlyContinue
    if (-not (Get-MongodVersion $OwnMongod)) {
        Stop-Setup 'The installed MongoDB does not start.' 'Antivirus software may have blocked it, or the Microsoft Visual C++ runtime is missing.' `
            @('Install the Microsoft Visual C++ Redistributable (x64) from https://aka.ms/vs/17/release/vc_redist.x64.exe', "Or delete the folder $TpTools\mongodb so it is downloaded again.")
    }
}

function Install-Mongosh {
    Info "Downloading mongosh $MongoshPin (about 80 MB)"
    $zip = Join-Path $TpWork 'mongosh.zip'
    Save-Download "https://downloads.mongodb.com/compass/mongosh-$MongoshPin-win32-x64.zip" $zip $MongoshSha "mongosh $MongoshPin"
    Expand-ToolZip $zip (Join-Path $TpTools 'mongosh') 'mongosh'
    if (-not (Get-MongoshVersion $OwnMongosh)) {
        Stop-Setup 'The installed mongosh does not start.' 'Antivirus software may have blocked it.' @("Delete the folder $TpTools\mongosh so it is downloaded again.")
    }
}

# --- npm diagnosis -------------------------------------------------------------

function Stop-Npm([string]$Problem) {
    $t = $script:LastOut
    $script:TailLines = 10
    if ($t -match 'SELF_SIGNED_CERT_IN_CHAIN|UNABLE_TO_GET_ISSUER_CERT|UNABLE_TO_VERIFY_LEAF_SIGNATURE|CERT_UNTRUSTED|unable to verify the first certificate') {
        Stop-Setup $Problem 'Node does not trust the HTTPS connection to the npm registry. Company networks that inspect HTTPS traffic (Zscaler, Netskope ...) cause this.' `
            @($CaFix, "Don't turn off npm's SSL checks (strict-ssl false) to get past this.")
    }
    if ($t -match 'E407|407 Proxy') {
        Stop-Setup $Problem 'The proxy needs a user name and password.' @('Put them in the proxy address in Command Prompt::set HTTPS_PROXY=http://<user>:<password>@<proxy-host>:<port>')
    }
    if ($t -match 'E401|E403|401 Unauthorized|403 Forbidden') {
        Stop-Setup $Problem 'The package registry refused access. Either .npmrc points npm at a company registry that needs a login, or a web filter blocks registry.npmjs.org or cdn.sheetjs.com.' `
            @('See which registry npm uses::npm config get registry', 'Log in to the company registry (npm login), or ask IT to allow https://registry.npmjs.org and https://cdn.sheetjs.com.')
    }
    if ($t -match 'ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|socket hang up|network request') {
        Stop-Setup $Problem 'npm could not reach registry.npmjs.org or cdn.sheetjs.com (SheetJS is installed from its own site). Either there is no internet connection, a VPN is not connected, or a proxy is needed.' `
            @('Connect to the internet or the VPN.', $ProxyFix)
    }
    if ($t -match 'EINTEGRITY|integrity checksum failed') {
        Stop-Setup $Problem "A downloaded package does not match its checksum in package-lock.json: npm's cache is damaged, or a proxy changed the file." `
            @("Clear npm's cache::npm cache clean --force", 'If it happens again, try another network.')
    }
    if ($t -match 'ENOSPC|not enough space') { Stop-Setup $Problem 'The disk is full.' @("Free at least $MinFreeGB GB of disk space.") }
    if ($t -match 'EBUSY|EPERM|resource busy|operation not permitted') {
        Stop-Setup $Problem 'A file in node_modules is locked: the app is still running, or VS Code, antivirus software or OneDrive is using it.' `
            @('Stop the app::npm run stop:all:win', 'Close VS Code and other terminals, then run setup.cmd again. If the project is inside OneDrive, move it to a folder such as C:\Users\<you>\Projects.')
    }
    if ($t -match 'EACCES|permission denied') {
        Stop-Setup $Problem 'npm may not write to the project folder or its cache.' @('Check that the project folder belongs to you, or clone it into a folder of your own.')
    }
    if ($t -match 'can only install packages when your package.json and package-lock.json|are in sync|Missing: .* from lock file') {
        Stop-Setup $Problem "package.json and package-lock.json don't match, so the checked-out code is incomplete or was edited locally." `
            @('Get the latest version of the repository::git pull', 'If you changed package.json yourself, update the lock file::npm install')
    }
    Stop-Setup $Problem 'npm reported an error; the Details above show it.' @('Read the lines starting with "npm error" in the Details.', "If it fails the same way again, send $LogRel to the team.")
}

# "<name> (PID <pid>)" for the process on a port, or "another program"
function Get-PortHolder([int]$Port) {
    $p = Get-PortProcess $Port
    if ($p) { return "$($p.ProcessName) (PID $($p.Id))" } else { return 'another program' }
}

# True when the process on a port is this project's dev server
function Test-PortIsOurs([int]$Port) {
    $p = Get-PortProcess $Port
    if (-not $p) { return $false }
    $cim = Get-CimInstance Win32_Process -Filter "ProcessId = $($p.Id)" -ErrorAction SilentlyContinue
    if (-not $cim -or -not $cim.CommandLine) { return $false }
    if ($cim.CommandLine.IndexOf($ProjectDir, [StringComparison]::OrdinalIgnoreCase) -ge 0) { return $true }
    # nodemon starts the API as "node server/index.js", so check its parent too.
    $parent = Get-CimInstance Win32_Process -Filter "ProcessId = $($cim.ParentProcessId)" -ErrorAction SilentlyContinue
    return ($cim.CommandLine -match 'server[\\/]index\.js' -and $parent -and $parent.CommandLine -and
            $parent.CommandLine.IndexOf($ProjectDir, [StringComparison]::OrdinalIgnoreCase) -ge 0)
}

function Invoke-Node([string[]]$Arguments) {
    $code = Invoke-Logged $script:NodeExe $Arguments
    return @($code, "$($script:LastOut)".Trim())
}

# ==============================================================================

Write-Host "Test Playground setup - $ProjectDir"
Write-Para '' '' 'Each tool is checked: missing tools are installed, older ones are updated, the rest are kept. The first run takes 10-20 minutes. Nothing needs administrator rights.'

try {
    # --- 1. This computer ---------------------------------------------------------
    Step 'Checking this computer'

    $os = [Environment]::OSVersion.Version
    if ($os.Major -lt 10) {
        Stop-Setup "Windows $($os.Major).$($os.Minor) is too old." "Node.js $($NodeMin.Split('.')[0]) needs Windows 10 or later." @('Use a computer with Windows 10 or 11.')
    }
    $arch = if ($env:PROCESSOR_ARCHITEW6432) { $env:PROCESSOR_ARCHITEW6432 } else { $env:PROCESSOR_ARCHITECTURE }
    switch ($arch) {
        'AMD64' { $NodeArch = 'x64'; $chip = '64-bit Intel/AMD' }
        'ARM64' { $NodeArch = 'arm64'; $chip = 'ARM64'; Info 'MongoDB has no ARM build for Windows; its Intel build runs through Windows 11 emulation.' }
        default { Stop-Setup "This is a 32-bit ($arch) Windows." 'Node.js and MongoDB need 64-bit Windows.' @('Use a computer with 64-bit Windows 10 or 11.') }
    }
    Ok "Windows $($os.Major) build $($os.Build) ($chip)"

    foreach ($f in @('package.json', 'package-lock.json', 'server\.env.example', 'server\seed.js', 'scripts\check-deps.js',
                     'scripts\make-cert.js', 'scripts\make-env.js', 'scripts\mongo-admin.js', 'scripts\start.ps1')) {
        if (-not (Test-Path (Join-Path $ProjectDir $f))) {
            Stop-Setup "The project file $f is missing." 'setup.cmd was copied on its own, or the repository download is incomplete.' @('Clone the whole repository and run setup.cmd from its folder.')
        }
    }
    if ($ProjectDir -match '\\OneDrive') {
        Warn 'The project is inside OneDrive. Syncing node_modules (thousands of files) can lock files and make installs fail; a folder such as C:\Users\<you>\Projects works best.'
    }
    Ok 'Project folder is complete and writable'

    $drive = (Split-Path -Qualifier $env:LOCALAPPDATA).TrimEnd(':')
    $freeGB = [math]::Floor((Get-PSDrive $drive).Free / 1GB)
    if ($freeGB -lt $MinFreeGB) {
        Stop-Setup "Only $freeGB GB of disk space is free on ${drive}:." 'Setup downloads Node.js, MongoDB and the npm packages, and needs room to unpack them.' @("Free at least $MinFreeGB GB: empty the Recycle Bin and remove large files.")
    }
    Ok "$freeGB GB of free disk space on ${drive}:"

    try { New-Item -ItemType Directory -Force -Path $TpTools, $TpWork | Out-Null }
    catch { Stop-Setup "Setup cannot write to $TpHome." 'The folder is blocked by a policy or belongs to another user.' @('Ask IT to allow writing to %LOCALAPPDATA%\TestPlayground.') }

    if ($CaCert) {
        if (-not (Test-Path $CaCert)) { Stop-Setup "The certificate file $CaCert does not exist." 'The path given to -CaCert is wrong.' @('Check the path. Tip: Shift + right-click the file > Copy as path.') }
        try {
            $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 -ArgumentList (Resolve-Path $CaCert).Path
            $script:CaPem = Join-Path $TpHome 'company-ca.pem'
            $b64 = [Convert]::ToBase64String($cert.RawData, 'InsertLineBreaks')
            [IO.File]::WriteAllText($script:CaPem, "-----BEGIN CERTIFICATE-----`r`n$b64`r`n-----END CERTIFICATE-----`r`n", (New-Object System.Text.ASCIIEncoding))
            $env:NODE_EXTRA_CA_CERTS = $script:CaPem
            Ok "Company certificate loaded ($($cert.Subject))"
        } catch {
            Stop-Setup "$CaCert is not a certificate setup can read." 'It must be a .cer, .crt or .pem certificate, not a .pfx bundle.' @('Export it again: certmgr.msc > the certificate > All Tasks > Export > Base-64 encoded X.509 (.cer).')
        }
    }
    # Node also trusts certificates in the Windows certificate store, where IT installs a company
    # proxy's certificate, so npm usually works behind such a proxy without -CaCert.
    $env:NODE_USE_SYSTEM_CA = '1'

    $script:ProxyUrl = @($env:HTTPS_PROXY, $env:https_proxy, $env:HTTP_PROXY, $env:http_proxy) | Where-Object { $_ } | Select-Object -First 1
    $proxySource = 'environment'
    if (-not $script:ProxyUrl) {
        try {
            $probe = [uri]'https://registry.npmjs.org/'
            $sys = [System.Net.WebRequest]::GetSystemWebProxy().GetProxy($probe)
            if ($sys -and $sys.Host -ne $probe.Host) { $script:ProxyUrl = $sys.AbsoluteUri.TrimEnd('/'); $proxySource = 'Windows proxy settings' }
        } catch { }
    }
    if ($script:ProxyUrl) {
        if ($script:ProxyUrl -notmatch '://') { $script:ProxyUrl = "http://$($script:ProxyUrl)" }
        # npm reads the proxy only from these variables, not from the Windows settings.
        $env:HTTPS_PROXY = $script:ProxyUrl; $env:HTTP_PROXY = $script:ProxyUrl
        $env:NO_PROXY = 'localhost,127.0.0.1' + $(if ($env:NO_PROXY) { ",$env:NO_PROXY" } else { '' })
        $script:ProxyShown = $script:ProxyUrl -replace '//[^@/]*@', '//***@'
        Ok "Proxy $($script:ProxyShown) (from $proxySource)"
    }

    # --- 2. Node.js ---------------------------------------------------------------
    Step "Node.js ($NodeMin or later)"

    $r = Confirm-Tool 'Node.js' $NodeMin ${function:Get-NodeVersion} ${function:Install-Node} $OwnNode @(Get-CommandPath 'node')
    $script:NodeExe = $r[0]
    if ($r[3]) { Add-ToolPath (Split-Path $OwnNode) }
    elseif ((Get-CommandPath 'node') -ne $r[0]) { $env:Path = (Split-Path $r[0]) + ";$env:Path" }
    Add-Summary 'ok' 'Node.js' $r[1] $r[2]

    # --- 3. MongoDB ---------------------------------------------------------------
    Step "MongoDB ($MongoMin or later)"

    $r = Confirm-Tool 'MongoDB' $MongoMin ${function:Get-MongodVersion} ${function:Install-Mongo} $OwnMongod (Get-MongodCandidates)
    if ($r[3]) { Add-ToolPath (Split-Path $OwnMongod); Info "MongoDB keeps this project's data in $TpDb." }
    Add-Summary 'ok' 'MongoDB' $r[1] $r[2]
    $MongoVersion = $r[1]

    # --- 4. mongosh (optional) ----------------------------------------------------
    Step "mongosh $MongoshMin or later (optional MongoDB shell)"

    # Optional: Stop-Setup only warns here, so a failure is reported at the end instead.
    $script:SoftFail = $true
    try {
        $r = Confirm-Tool 'mongosh' $MongoshMin ${function:Get-MongoshVersion} ${function:Install-Mongosh} $OwnMongosh @(Get-CommandPath 'mongosh')
        if ($r[3]) { Add-ToolPath (Split-Path $OwnMongosh) }
        Add-Summary 'ok' 'mongosh' $r[1] $r[2]
    } catch [OptionalStepFailed] {
        Add-Attention 'mongosh could not be installed (reason above). The app does not need it; it is only for looking at the data yourself.' `
            'Run setup.cmd again later, or download it from https://www.mongodb.com/try/download/shell.'
        Add-Summary 'warn' 'mongosh' '' 'needs attention'
    } finally { $script:SoftFail = $false }

    # --- 5. New windows -----------------------------------------------------------
    Step 'Making these tools the default in new windows'

    try {
        $pathResult = Save-UserPath
        switch ($pathResult) {
            'present'    { Skipped 'Your user Path already puts setup''s tools first. Nothing to do.' }
            'not needed' { Skipped 'No setup copies are in use, so your user Path needs no change.' }
            'set'        { Installed 'Put setup''s tools first on your user Path.' }
            'updated'    { Updated 'Updated setup''s tools on your user Path.' }
            'removed'    { Updated 'Removed setup''s tools from your user Path; they are no longer needed.' }
        }
        # The system Path comes before the user Path: an older Node there still answers "node -v".
        if ($script:PathAdd -contains (Split-Path $OwnNode)) {
            foreach ($dir in ([Environment]::GetEnvironmentVariable('Path', 'Machine') -split ';')) {
                $exe = Join-Path ([Environment]::ExpandEnvironmentVariables($dir)) 'node.exe'
                if ($dir -and (Test-Path $exe)) {
                    Info "The system Path also has Node.js $(Get-NodeVersion $exe) in $dir, so typing node -v in a new window shows that one. npm run start:all:win always uses the right one. To change it, an administrator removes $dir from the system Path or uninstalls that Node.js."
                    break
                }
            }
        }
        Add-Summary 'ok' 'User Path' '' $pathResult
    } catch {
        Write-Log $_.Exception.Message
        Add-Attention 'Your user Path could not be changed, so new windows may use older tools.' "Add these folders to Path yourself: Start > 'Edit environment variables for your account' > Path > New: $($script:PathAdd -join ', ')"
        Add-Summary 'warn' 'User Path' '' 'needs attention'
    }

    # --- 6. npm packages ----------------------------------------------------------
    Step 'npm packages'

    $d = Invoke-Node @('scripts\check-deps.js')
    if ($d[0] -eq 0) {
        Skipped 'All packages are installed at the versions in package-lock.json. Nothing to do.'
        Add-Summary 'ok' 'npm packages' '' 'already installed'
    } else {
        if ($d[0] -eq 3) { Info 'The installed packages were built for another computer or processor. Installing them again.' }
        else { Info $d[1] }
        Info 'Installing the packages from package-lock.json (1-3 minutes)'
        $npm = Join-Path (Split-Path $script:NodeExe) 'npm.cmd'
        if (-not (Test-Path $npm)) { $npm = 'npm.cmd' }
        # npm is a .cmd file, so it runs through cmd.exe; /s strips the outer quotes of the command.
        if ((Invoke-LoggedRaw 'cmd.exe' "/d /s /c `"`"$npm`" ci --no-audit --no-fund`"") -ne 0) { Stop-Npm 'The npm packages could not be installed.' }
        $d = Invoke-Node @('scripts\check-deps.js')
        if ($d[0] -ne 0) {
            $script:TailLines = 4
            Stop-Setup 'The npm packages are still incomplete after installing them.' $d[1] @('Delete the node_modules folder so it is installed again from scratch, then run setup.cmd again.')
        }
        $x = Invoke-Node @('-p', "require('./node_modules/xlsx/package.json').version")
        Installed "Installed the npm packages (SheetJS $($x[1]) from cdn.sheetjs.com)."
        Add-Summary 'ok' 'npm packages' '' 'installed'
    }

    # --- 7. HTTPS certificate -----------------------------------------------------
    Step 'HTTPS certificate for localhost (certs\)'

    $c = Invoke-Node @('scripts\make-cert.js')
    switch -wildcard ($c[1]) {
        'present*' { Skipped "The certificate is $($c[1]). Nothing to do."; Add-Summary 'ok' 'Certificate' '' 'already present' }
        'created*' { Installed "Created a self-signed certificate for localhost, $($c[1] -replace '^created, ', '')."; Add-Summary 'ok' 'Certificate' '' 'created' }
        'renewed*' {
            # Built outside the string: Windows PowerShell 5.1 can't parse a "(" inside a quoted
            # literal within "...$( )...".
            $reason = $c[1].Substring('renewed ('.Length)
            Updated "Renewed the certificate: the old one was $reason"
            Add-Summary 'ok' 'Certificate' '' 'renewed'
        }
        default    { Stop-Setup 'The HTTPS certificate could not be created.' ($c[1] -replace '^failed: ', '') @("Check that you can write to $ProjectDir\certs.") }
    }

    # --- 8. server\.env -----------------------------------------------------------
    Step 'Server settings (server\.env)'

    $e = Invoke-Node @('scripts\make-env.js')
    switch -wildcard ($e[1]) {
        'present'  { Skipped 'server\.env has every setting. Nothing to do.'; Add-Summary 'ok' 'server\.env' '' 'already present' }
        'created*' { Installed "Created server\.env $($e[1] -replace '^created, ', '')."; Add-Summary 'ok' 'server\.env' '' 'created' }
        'added*'   { Updated "server\.env was missing $($e[1] -replace '^added ', ''); added them. Your existing values are unchanged."; Add-Summary 'ok' 'server\.env' '' 'updated' }
        default    { Stop-Setup 'server\.env could not be created.' ($e[1] -replace '^failed: ', '') @("Check that you can write to $ProjectDir\server.") }
    }

    # --- 9. MongoDB running -------------------------------------------------------
    Step 'MongoDB running on 127.0.0.1:27017'

    if (Test-MongoUp) {
        $v = Invoke-Node @('scripts\mongo-admin.js', 'version')
        if ($v[0] -ne 0 -or -not $v[1]) {
            Stop-Setup "Port 27017, which MongoDB needs, is used by $(Get-PortHolder 27017)." 'Another program is listening on MongoDB''s port, and it does not answer as MongoDB.' `
                @('Quit that program (Task Manager > Details), or see what it is::Get-NetTCPConnection -LocalPort 27017 -State Listen')
        }
        if (-not (Test-VersionAtLeast $v[1] $MongoMin)) {
            $p = Get-PortProcess 27017
            $svc = Get-MongoService
            # A service runs as SYSTEM, so its process path is often hidden from a normal user.
            if ($svc -and $svc.State -eq 'Running' -and -not (Test-VersionAtLeast (Get-MongodVersion (Get-ServiceMongod)) $MongoMin)) {
                $stopFix = "Stop the old 'MongoDB' service and keep it from starting with Windows, in an Administrator PowerShell::Stop-Service MongoDB; Set-Service MongoDB -StartupType Manual"
            } elseif ($p) { $stopFix = "Stop it::Stop-Process -Id $($p.Id)" }
            else { $stopFix = 'Stop the other MongoDB (Task Manager > Details > mongod.exe > End task).' }
            Stop-Setup "An older MongoDB ($($v[1])) is already running on port 27017." `
                "Only one MongoDB can use the port, and this project needs $MongoMin or later, which is installed but can't start while the old one runs. The old one and its data are not changed." @($stopFix)
        }
        Skipped "MongoDB $($v[1]) is already running. Nothing to do."
        Add-Summary 'ok' 'MongoDB running' $v[1] 'already running'
    } else {
        Info 'Starting MongoDB'
        if (Start-Mongo) {
            Installed "Started MongoDB ($($script:MongoHow))."
            Add-Summary 'ok' 'MongoDB running' $MongoVersion 'started'
        } elseif ($script:MongoHow -eq 'not installed') {
            Stop-Setup "No MongoDB $MongoMin or later could be found." 'Step 3 should have installed it; it may have been removed since.' @('Run setup.cmd again.')
        } else {
            Write-Log "--- end of $($script:MongoLogFile) ---"
            if (Test-Path $script:MongoLogFile) { Get-Content $script:MongoLogFile -Tail 20 | Add-Content -Path $Log -Encoding UTF8 }
            $why = Get-MongoLogExplanation $script:MongoLogFile
            $script:TailLines = 6
            Stop-Setup "MongoDB did not start ($($script:MongoHow))." $why[0] @($why[1])
        }
    }

    # --- 10. Sample users ---------------------------------------------------------
    Step 'Sample users (alice@example.com, bob@example.com)'

    $s = Invoke-Node @('server\seed.js')
    if ($s[0] -eq 0) {
        Ok 'Sample users are ready (existing ones are left as they are).'
        Add-Summary 'ok' 'Sample users' '' 'ready'
    } else {
        $script:TailLines = 8
        if ($s[1] -match 'Authentication failed|requires authentication|Unauthorized') {
            Stop-Setup 'The sample users could not be created.' 'The running MongoDB requires a user name and password, and MONGO_URI in server\.env has none.' `
                @('Put the credentials in MONGO_URI in server\.env::MONGO_URI=mongodb://<user>:<password>@127.0.0.1:27017/test-playground?authSource=admin')
        }
        Stop-Setup 'The sample users could not be created.' 'server\seed.js reported an error; the Details above show it.' `
            @('Check MONGO_URI in server\.env points to this MongoDB (mongodb://127.0.0.1:27017/test-playground).', "If it fails the same way again, send $LogRel to the team.")
    }

    # --- 11. Start the app --------------------------------------------------------
    Step 'Starting the app'

    $appRunning = $false
    if (-not $NoStart) {
        foreach ($port in 3000, 4000) {
            if (-not (Test-Port $port)) { continue }
            if (Test-PortIsOurs $port) { $appRunning = $true; continue }
            Stop-Setup "Port $port, which the app needs, is used by $(Get-PortHolder $port)." `
                "Another program is listening on port $port (the app uses 3000 for the website and 4000 for the API)." `
                @("Quit that program, or see what it is::Get-NetTCPConnection -LocalPort $port -State Listen")
        }
    }
    if ($appRunning) { Skipped 'The app is already running: https://localhost:3000' }
    elseif ($NoStart) { Info 'Not started (-NoStart). Start it with: npm run start:all:win' }
    else { Ok 'Ports 3000 and 4000 are free' }
} catch {
    # Anything unexpected still gets the Problem / Cause / Fix layout instead of a red PowerShell trace.
    Write-Log "unexpected: $($_.Exception.Message) $($_.ScriptStackTrace)"
    Stop-Setup 'Setup hit an unexpected error.' "$($_.Exception.Message)" @("Send $LogRel to the team.")
}

# --- Summary --------------------------------------------------------------------

Remove-Item $TpWork -Recurse -Force -ErrorAction SilentlyContinue
Write-Host ''
Write-Host 'Summary'
Write-Host ''
foreach ($row in $script:Summary) {
    $mark = if ($row[0] -eq 'ok') { '[ok]' } else { '[!] ' }
    $color = if ($row[0] -eq 'ok') { 'Green' } else { 'Yellow' }
    Write-Host "  $mark " -ForegroundColor $color -NoNewline
    Write-Host ('{0,-16} {1,-10} {2}' -f $row[1], $row[2], $row[3])
}

if ($script:Attention.Count) {
    Write-Host ''
    Write-Host 'Setup finished, but these need your attention:' -ForegroundColor Yellow
    Write-Host ''
    foreach ($a in $script:Attention) {
        Write-Para '  [!] ' '      ' $a[0] Yellow
        Write-Fix '      Fix: ' '           ' $a[1]
        if (-not $script:LastFixHadCommand) { Write-Host '' }
    }
} else {
    Write-Host ''
    Write-Host 'Setup complete.' -ForegroundColor Green
}
Write-Host ''
Write-Host 'Next'
if ($script:PathAdd.Count) { Write-Para '  - ' '    ' 'Open a NEW Command Prompt or PowerShell window before using node or npm yourself, so it picks up the updated tools.' }
Write-Para '  - ' '    ' 'Sign in at https://localhost:3000 as alice@example.com / hunter2pass. The browser warns about the self-signed certificate once: choose Advanced > Continue.'
Write-Para '  - ' '    ' 'Later: npm run start:all:win to start, npm run stop:all:win to stop. Run setup.cmd again any time; it only changes what is missing or out of date.'
Write-Log 'finished'

if (-not $NoStart -and -not $appRunning) {
    Write-Host ''
    Write-Host 'Starting the app (Ctrl+C stops it)'
    Write-Host ''
    & (Join-Path $PSScriptRoot 'start.ps1')
    exit $LASTEXITCODE
}
exit 0

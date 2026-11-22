# Real Windows loopback HTTP smoke for packaged OMEGA UI.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$PackageRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$package = (Resolve-Path -LiteralPath $PackageRoot).Path
$server = Join-Path $package 'Start-OMEGA-Local.ps1'
$token = [guid]::NewGuid().ToString('N')
$ready = Join-Path $env:RUNNER_TEMP ('omega-r896-' + $token + '.txt')
$stderrFile = Join-Path $env:RUNNER_TEMP ('omega-r896-' + $token + '.stderr.txt')
$stdoutFile = Join-Path $env:RUNNER_TEMP ('omega-r896-' + $token + '.stdout.txt')
$process = $null
try {
    $arguments = @('-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',
                   ('"' + $server + '"'),'-NoBrowser','-ReadyFile',('"' + $ready + '"'))
    $process = Start-Process -FilePath 'powershell.exe' -ArgumentList $arguments -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdoutFile -RedirectStandardError $stderrFile
    $url = $null
    for ($attempt=0;$attempt -lt 120;$attempt++) {
        if (Test-Path -LiteralPath $ready) {
            $url = (Get-Content -LiteralPath $ready -Raw).Trim()
            break
        }
        if ($process.HasExited) {
            $errors = if (Test-Path $stderrFile) { Get-Content $stderrFile -Raw } else { '(no stderr file)' }
            $output = if (Test-Path $stdoutFile) { Get-Content $stdoutFile -Raw } else { '(no stdout file)' }
            throw "OMEGA local server exited early with code $($process.ExitCode). stderr: $errors stdout: $output"
        }
        Start-Sleep -Milliseconds 250
    }
    if (-not $url -or $url -notmatch '^http://127\.0\.0\.1:[0-9]+/$') {
        throw 'Local server did not start on the loopback address'
    }
    # The optional Hub must be the exact existing bounded Python implementation,
    # not a second unaudited worker or a missing-file launcher.
    $hubLauncher = Join-Path $package 'OPEN-OMEGA-HUB.cmd'
    $hubScript = Join-Path $package 'omega_local_hub_r881.py'
    if (-not (Test-Path -LiteralPath $hubLauncher -PathType Leaf) -or -not (Test-Path -LiteralPath $hubScript -PathType Leaf)) {
        throw 'Optional authenticated local Hub is missing from the portable package'
    }
    $sourceHub = Join-Path (Get-Location).Path 'tools/omega_local_hub_r881.py'
    if ((Get-FileHash -LiteralPath $hubScript -Algorithm SHA256).Hash -ne
        (Get-FileHash -LiteralPath $sourceHub -Algorithm SHA256).Hash) {
        throw 'Packaged local Hub bytes diverge from the governed source implementation'
    }
    $verifier = Join-Path $package 'omega_absolute_truth_verifier_r884.py'
    $verifierSource = Join-Path (Get-Location).Path 'tools/omega_absolute_truth_verifier_r884.py'
    if (-not (Test-Path -LiteralPath $verifier -PathType Leaf)) {
        throw 'R884 canonical ten-ledger verifier missing from packaged local worker'
    }
    if ((Get-FileHash -LiteralPath $verifier -Algorithm SHA256).Hash -ne
        (Get-FileHash -LiteralPath $verifierSource -Algorithm SHA256).Hash) {
        throw 'Packaged R884 verifier bytes differ from the canonical source'
    }
    $hubLauncherText = Get-Content -LiteralPath $hubLauncher -Raw
    if ($hubLauncherText -notmatch 'omega_local_hub_r881[.]py' -or $hubLauncherText -notmatch '8765') {
        throw 'Optional Hub launcher does not execute the pinned local Hub endpoint'
    }
    $index = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
    if ($index.StatusCode -ne 200 -or $index.Content -notmatch 'OMEGA') { throw 'Local OMEGA index is not served' }
    $nested = Invoke-WebRequest -Uri ($url+'sphere/collective') -UseBasicParsing -TimeoutSec 10
    if ($nested.StatusCode -ne 200 -or $nested.Content -notmatch 'OMEGA') { throw 'SPA nested route did not resolve locally' }
    $head = Invoke-WebRequest -Uri $url -UseBasicParsing -Method Head -TimeoutSec 10
    if ($head.StatusCode -ne 200) { throw 'Local HEAD request failed' }
    $blocked = $false
    try { $null = Invoke-WebRequest -Uri ($url+'api/health') -UseBasicParsing -TimeoutSec 10 }
    catch {
        $response = $_.Exception.Response
        if ($null -ne $response -and [int]$response.StatusCode -eq 503) { $blocked = $true }
    }
    if (-not $blocked) { throw 'Offline local server must refuse unavailable cloud API rather than fake a healthy response' }
    $missing = $false
    try { $null = Invoke-WebRequest -Uri ($url+'assets/does-not-exist.js') -UseBasicParsing -TimeoutSec 10 }
    catch {
        $response = $_.Exception.Response
        if ($null -ne $response -and [int]$response.StatusCode -eq 404) { $missing = $true }
    }
    if (-not $missing) { throw 'Missing assets must return 404 instead of SPA HTML' }
    # A Windows junction inside dist must never expose a file outside dist.
    $outside = Join-Path $env:RUNNER_TEMP ('omega-r896-outside-' + $token)
    $junction = Join-Path (Join-Path $package 'dist') ('omega-r896-link-' + $token)
    try {
        New-Item -ItemType Directory -Path $outside -Force | Out-Null
        [System.IO.File]::WriteAllText((Join-Path $outside 'private.txt'),'OUTSIDE_PACKAGE_SENTINEL')
        New-Item -ItemType Junction -Path $junction -Target $outside -ErrorAction Stop | Out-Null
        $forbidden = $false
        try { $null = Invoke-WebRequest -Uri ($url + (Split-Path $junction -Leaf) + '/private.txt') -UseBasicParsing -TimeoutSec 10 }
        catch {
            $response = $_.Exception.Response
            if ($null -ne $response -and [int]$response.StatusCode -eq 403) { $forbidden = $true }
        }
        if (-not $forbidden) { throw 'Portable server followed a junction outside dist' }
    } finally {
        if (Test-Path -LiteralPath $junction) { Remove-Item -LiteralPath $junction -Force -ErrorAction SilentlyContinue }
        if (Test-Path -LiteralPath $outside) { Remove-Item -LiteralPath $outside -Recurse -Force -ErrorAction SilentlyContinue }
    }
    Write-Host "R896 LOCAL WINDOWS STUDIO PASS: loopback-only URL, real index and nested route, HEAD, unavailable API 503, asset 404, junction escape 403. $url"
} finally {
    if ($null -ne $process -and -not $process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $ready) { Remove-Item -LiteralPath $ready -Force -ErrorAction SilentlyContinue }
    foreach ($file in @($stderrFile,$stdoutFile)) { if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file -Force -ErrorAction SilentlyContinue } }
}

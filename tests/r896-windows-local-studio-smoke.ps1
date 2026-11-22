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
    Write-Host "R896 LOCAL WINDOWS STUDIO PASS: loopback-only URL, real index and nested route, HEAD, unavailable API 503, asset 404. $url"
} finally {
    if ($null -ne $process -and -not $process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $ready) { Remove-Item -LiteralPath $ready -Force -ErrorAction SilentlyContinue }
    foreach ($file in @($stderrFile,$stdoutFile)) { if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file -Force -ErrorAction SilentlyContinue } }
}

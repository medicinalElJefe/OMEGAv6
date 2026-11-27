# OMEGA Windows Check — read-only. Run directly or double-click OMEGA-Windows-Check.cmd.
[CmdletBinding()]
param(
    [ValidatePattern('^[0-9a-f]{40}$')]
    [string] $ExpectedCommit,
    [string] $Output
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$sourceRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$scriptPath = Join-Path $sourceRoot 'scripts\r895_windows_host_preflight.py'
if (-not (Test-Path -LiteralPath $scriptPath -PathType Leaf)) {
    throw 'OMEGA check cannot find its required files. Use the complete repository folder.'
}
if (-not $Output) {
    $Output = Join-Path $sourceRoot 'omega-windows-check.json'
}
if (-not $ExpectedCommit) {
    $git = Get-Command git -ErrorAction SilentlyContinue
    if (-not $git) { throw 'Git is needed to verify the original OMEGA source. Install Git for Windows, then run the check again.' }
    $detected = (& $git.Source -C $sourceRoot rev-parse HEAD 2>$null | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $detected -cnotmatch '^[0-9a-f]{40}$') {
        throw 'OMEGA source revision could not be verified. Open a complete Git checkout of OMEGA.'
    }
    $ExpectedCommit = $detected
}
$launcher = Get-Command py -ErrorAction SilentlyContinue
if ($launcher) {
    & $launcher.Source -3 $scriptPath --root $sourceRoot --expected-commit $ExpectedCommit --output $Output
} else {
    $launcher = Get-Command python -ErrorAction SilentlyContinue
    if (-not $launcher) { throw 'Python 3.10 or newer is needed for this check. Install Python and run it again.' }
    & $launcher.Source $scriptPath --root $sourceRoot --expected-commit $ExpectedCommit --output $Output
}
$resultCode = $LASTEXITCODE
if ($resultCode -notin @(0,2)) {
    throw 'OMEGA could not complete the Windows check. No PC settings were changed.'
}
if (-not (Test-Path -LiteralPath $Output -PathType Leaf)) {
    throw 'OMEGA check did not produce its evidence file.'
}
$result = Get-Content -LiteralPath $Output -Raw | ConvertFrom-Json
if ($result.schema -ne 'OMEGA_R895_WINDOWS_HOST_PREFLIGHT' -or $result.receipt_sha256 -notmatch '^[a-f0-9]{64}$') {
    throw 'OMEGA check produced an invalid evidence file.'
}
Write-Host ''
if ($resultCode -eq 0 -and $result.status -eq 'READY_FOR_PAIRED_HOST_PROOF') {
    Write-Host 'OMEGA WINDOWS CHECK: READY' -ForegroundColor Green
    Write-Host 'This PC passed the basic source, runtime and device checks.'
    Write-Host 'The actual installer, paired connection and GPU workload still require separate proof.'
} elseif ($resultCode -eq 2 -and $result.status -eq 'HOLD') {
    Write-Host 'OMEGA WINDOWS CHECK: NEEDS ATTENTION' -ForegroundColor Yellow
    $labels = @{
        windows_observed = 'This check must run on Windows.'
        python_supported = 'Python 3.10 or newer is required.'
        exact_source_commit = 'The OMEGA source files or revision could not be verified.'
        base_sha256_verified = 'The original Hybrid Link base did not match.'
        wrapper_present = 'The Hybrid Link wrapper is missing.'
        gpu_device_observed = 'Windows did not return a graphics-controller observation.'
    }
    foreach ($item in $result.held_conditions) {
        $key = [string]$item
        if ($labels.ContainsKey($key)) { Write-Host ('- ' + $labels[$key]) } else { Write-Host ('- ' + $key) }
    }
} else {
    throw 'OMEGA check returned inconsistent evidence. Do not treat it as passed.'
}
Write-Host ('Report: ' + $Output)
Write-Host 'Read-only check complete. Nothing was installed or paired.'
exit $resultCode

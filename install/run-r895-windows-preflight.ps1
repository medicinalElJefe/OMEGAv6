# R895 target-machine launcher. Read-only; PowerShell 5.1+ / Windows 10+.
# Run from an exact checked-out OMEGA source revision with Python 3.10+.
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidatePattern('^[0-9a-f]{40}$')]
    [string] $ExpectedCommit,
    [string] $Output = (Join-Path $PWD.Path 'omega-r895-windows-preflight-receipt.json')
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$sourceRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$scriptPath = Join-Path $sourceRoot 'scripts\r895_windows_host_preflight.py'
if (-not (Test-Path -LiteralPath $scriptPath -PathType Leaf)) {
    throw 'R895 Python preflight source is missing; no machine proof attempted.'
}
$python = Get-Command py -ErrorAction SilentlyContinue
if ($python) {
    & $python.Source -3 $scriptPath --root $sourceRoot --expected-commit $ExpectedCommit --output $Output
} else {
    $python = Get-Command python -ErrorAction Stop
    & $python.Source $scriptPath --root $sourceRoot --expected-commit $ExpectedCommit --output $Output
}
if ($LASTEXITCODE -ne 0) {
    Write-Warning "R895 Windows host preflight held or failed (code $LASTEXITCODE). Inspect the local receipt. This is not installer or GPU-execution proof."
    exit $LASTEXITCODE
}
Write-Host 'R895 local host conditions observed; paired native workload, full installer lifecycle, and governed return proof are still required.'
exit 0

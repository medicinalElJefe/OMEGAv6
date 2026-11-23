# R903 parse every packaged Windows operator entry and smoke before assembly.
# This is a syntax-only gate; it does not execute installers or weaken runtime tests.
[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$required = @(
  'install/Verify-OMEGA-Package.ps1',
  'install/Start-OMEGA-Local.ps1',
  'install/Start-OMEGA-Integrated.ps1',
  'install/Install-OMEGA-Windows.ps1',
  'install/Uninstall-OMEGA-Windows.ps1',
  'install/Check-OMEGA-Windows.ps1',
  'tests/r896-windows-local-studio-smoke.ps1',
  'tests/r897-windows-packaged-hub-smoke.ps1',
  'tests/r899-windows-compiled-inference-smoke.ps1',
  'tests/r900-windows-install-lifecycle-smoke.ps1',
  'tests/r901-windows-host-observation-smoke.ps1',
  'tests/r911-windows-double-click-operator-smoke.ps1'
)
foreach($relative in $required) {
  $path = Join-Path $root $relative
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw ('Required Windows operator script is absent: ' + $relative)
  }
  $tokens = $null
  $errors = $null
  $null = [System.Management.Automation.Language.Parser]::ParseFile(
    $path, [ref]$tokens, [ref]$errors)
  if ($null -ne $errors -and $errors.Count -gt 0) {
    $messages = @($errors | ForEach-Object {
      $_.Extent.StartLineNumber.ToString() + ':' +
      $_.Extent.StartColumnNumber.ToString() + ' ' + $_.Message
    })
    throw ('Windows PowerShell syntax held in ' + $relative + ': ' + ($messages -join '; '))
  }
}
Write-Host ('R903 WINDOWS POWERSHELL PARSE PASS: ' + $required.Count + ' required scripts.')

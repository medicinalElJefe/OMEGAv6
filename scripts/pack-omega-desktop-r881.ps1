param([Parameter(Mandatory=$true)][string]$SourceSha)
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target=Join-Path $root 'artifacts\omega7-portable-windows'
$output=Join-Path $root 'artifacts\OMEGA7-portable-win-x64.zip'
if ($SourceSha -notmatch '^[0-9a-f]{40}$') { throw 'Expected exact 40-character Git SHA' }
if (!(Test-Path (Join-Path $root 'dist\index.html'))) { throw 'Missing dist/index.html. Build first.' }
# The packaged front-end and bridge must describe the SAME source head as
# the Windows executable bundle. A synthetic PR merge SHA is not admitted.
$buildReceipt=Get-Content -LiteralPath (Join-Path $root 'dist\omega-build-receipt.json') -Raw | ConvertFrom-Json
$bridgeReceipt=Get-Content -LiteralPath (Join-Path $root 'dist\omega-bridge-continuity-r499.json') -Raw | ConvertFrom-Json
if ($buildReceipt.source.sha -ne $SourceSha -or $bridgeReceipt.sourceSha -ne $SourceSha) {
 throw "R882 source identity mismatch: expected=$SourceSha build=$($buildReceipt.source.sha) bridge=$($bridgeReceipt.sourceSha)"
}

$node=(Get-Command node).Source
if ($node -notmatch '\.exe$') { throw 'Packaging requires Windows node.exe' }
$nodeHome=Split-Path -Parent $node
$license=Join-Path $nodeHome 'LICENSE'
if (!(Test-Path $license)) { throw 'Node redistribution license missing: cannot package' }
if (Test-Path $target) { Remove-Item -LiteralPath $target -Recurse -Force }
New-Item -ItemType Directory -Force -Path (Join-Path $target 'runtime'),(Join-Path $target 'server') | Out-Null
Copy-Item -LiteralPath $node -Destination (Join-Path $target 'runtime\node.exe')
Copy-Item -LiteralPath $license -Destination (Join-Path $target 'runtime\NODE-LICENSE.txt')
Copy-Item -LiteralPath (Join-Path $root 'scripts\omega-desktop-server.mjs') -Destination (Join-Path $target 'server\omega-desktop-server.mjs')
Copy-Item -LiteralPath (Join-Path $root 'scripts\Start-OMEGA.ps1') -Destination $target
Copy-Item -LiteralPath (Join-Path $root 'scripts\Launch-OMEGA.cmd') -Destination $target
Copy-Item -LiteralPath (Join-Path $root 'docs\R881_WINDOWS_PORTABLE_FIRST_LAUNCH.md') -Destination (Join-Path $target 'README.md')
Copy-Item -LiteralPath (Join-Path $root 'dist') -Destination $target -Recurse
Get-ChildItem -Path (Join-Path $target 'dist') -Filter '*.map' -Recurse -File | Remove-Item -Force
$manifest=[ordered]@{schema='OMEGA_DESKTOP_PORTABLE_R881';sourceSha=$SourceSha;kind='LOCAL_WEB_SHELL_NOT_NATIVE_HOST';build='Vite';generatedUtc=(Get-Date).ToUniversalTime().ToString('o');cloudBackendIncluded=$false;nativeDeviceProof=$false}
$manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $target 'dist\omega-desktop-package.json') -Encoding UTF8
# Integrity manifest is outside the served dist and binds every packaged file.
$entries=@(Get-ChildItem -LiteralPath $target -File -Recurse | ForEach-Object {
 $relative=$_.FullName.Substring($target.Length+1).Replace('\\','/')
 [ordered]@{path=$relative;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant();bytes=$_.Length}
} | Sort-Object path)
[ordered]@{schema='OMEGA_PORTABLE_INTEGRITY_R883';sourceSha=$SourceSha;entries=$entries} | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $target 'package-integrity.json') -Encoding UTF8
if (Test-Path $output) { Remove-Item -LiteralPath $output -Force }
Compress-Archive -Path (Join-Path $target '*') -DestinationPath $output -CompressionLevel Optimal
$bytes=(Get-Item $output).Length
if ($bytes -gt 160MB) { throw "Portable ZIP exceeds 160MiB limit ($bytes bytes); split packaging required." }
$hash=(Get-FileHash -Algorithm SHA256 $output).Hash.ToLowerInvariant()
Write-Host "R881 packaged $output ($bytes bytes) SHA256=$hash source=$SourceSha"

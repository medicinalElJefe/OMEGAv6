param([Parameter(Mandatory=$true)][string]$SourceSha)
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$zip=Join-Path $root 'artifacts\OMEGA7-portable-win-x64.zip'
$install=Join-Path $env:RUNNER_TEMP 'omega-r881-clean-extract'
if (Test-Path $install) { Remove-Item -LiteralPath $install -Force -Recurse }
Expand-Archive -LiteralPath $zip -DestinationPath $install
$env:OMEGA_PORTABLE_NO_BROWSER='1'
try {
  & (Join-Path $install 'Launch-OMEGA.cmd')
  if ($LASTEXITCODE -ne 0) { throw "Portable launcher returned $LASTEXITCODE" }
  $sessionPath=Join-Path $env:LOCALAPPDATA 'OMEGA7\Portable\logs\active-session.json'
  $session=Get-Content -LiteralPath $sessionPath -Raw | ConvertFrom-Json
  if ($session.state -ne 'LOCAL_HTTP_READY') { throw 'Launcher missing healthy session receipt' }
  try {
    $health=Invoke-RestMethod -Uri ($session.url+'__omega_local_health') -TimeoutSec 10
    if ($health.state -ne 'LOCAL_HTTP_READY' -or $health.sourceSha -ne $SourceSha) { throw 'Packaged runtime SHA or liveness mismatch' }
    $html=Invoke-WebRequest -UseBasicParsing -Uri $session.url -TimeoutSec 10
    if ($html.StatusCode -ne 200 -or $html.Content -notmatch '<html') { throw 'Packaged application did not serve HTML' }
    $assets=[regex]::Matches($html.Content,'(?:src|href)="(/assets/[^" ]+)"')
    if ($assets.Count -lt 1) { throw 'Built HTML has no bundled application assets' }
    $asset=Invoke-WebRequest -UseBasicParsing -Uri ($session.url.TrimEnd('/')+$assets[0].Groups[1].Value) -TimeoutSec 10
    if ($asset.StatusCode -ne 200 -or $asset.RawContentLength -lt 1) { throw 'Bundled application asset failed to load' }
    $apiStatus=$null
    try { Invoke-WebRequest -UseBasicParsing -Uri ($session.url+'api/hybrid/status') -TimeoutSec 10 | Out-Null } catch { $apiStatus=[int]$_.Exception.Response.StatusCode }
    if ($apiStatus -ne 503) { throw 'Offline package must not impersonate real Hybrid device status' }
    Write-Host "R881 CLEAN-EXTRACT FIRST-LAUNCH PASS source=$SourceSha assetCount=$($assets.Count)"
  } finally { Stop-Process -Id ([int]$session.pid) -ErrorAction SilentlyContinue }
} finally { Remove-Item Env:OMEGA_PORTABLE_NO_BROWSER -ErrorAction SilentlyContinue }

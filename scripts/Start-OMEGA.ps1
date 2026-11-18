$ErrorActionPreference = 'Stop'
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Join-Path $base 'runtime\node.exe'
$server = Join-Path $base 'server\omega-desktop-server.mjs'
$dist = Join-Path $base 'dist'
$logDir = Join-Path $env:LOCALAPPDATA 'OMEGA7\Portable\logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir 'startup.txt'
function Say([string]$message) { $line="$(Get-Date -Format o) $message"; Add-Content -Path $log -Value $line; Write-Host $message }
try {
  if (!(Test-Path -LiteralPath $node)) { throw 'Bundled runtime\node.exe not found. Re-extract the complete ZIP.' }
  if (!(Test-Path -LiteralPath $server) -or !(Test-Path -LiteralPath (Join-Path $dist 'index.html'))) { throw 'Missing server or built application files. Re-extract the complete ZIP.' }
  $nodeVersion = (& $node --version)
  if ($LASTEXITCODE -ne 0) { throw 'Bundled Node runtime did not start.' }
  Say "Starting OMEGA7 portable ($nodeVersion)."
  $ready = $false
  $lastError = ''
  for ($attempt=0; $attempt -lt 5 -and !$ready; $attempt++) {
    $port = Get-Random -Minimum 43000 -Maximum 53000
    $uri = "http://127.0.0.1:$port/"
    $stdout=Join-Path $logDir "server-$port.stdout.log"
    $stderr=Join-Path $logDir "server-$port.stderr.log"
    $process = Start-Process -FilePath $node -ArgumentList @('"'+$server+'"','--root','"'+$dist+'"','--port',"$port") -WindowStyle Hidden -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    for ($i=0; $i -lt 30; $i++) {
      Start-Sleep -Milliseconds 200
      if ($process.HasExited) { $lastError = "Server exited ($($process.ExitCode)); inspect $stderr"; break }
      try {
        $response = Invoke-RestMethod -Uri "${uri}__omega_local_health" -TimeoutSec 2
        if ($response.state -eq 'LOCAL_HTTP_READY' -and $response.schema -eq 'OMEGA_DESKTOP_PORTABLE_R881') { $ready = $true; break }
      } catch { $lastError = $_.Exception.Message }
    }
    if (!$ready -and !$process.HasExited) { Stop-Process -Id $process.Id -ErrorAction SilentlyContinue }
  }
  if (!$ready) { throw "The local application did not become healthy. $lastError" }
  Say "HTTP shell healthy: $uri (PID $($process.Id)). Native host and cloud APIs are separately gated."
  $session=@{schema='OMEGA_DESKTOP_SESSION_R881';pid=$process.Id;url=$uri;state='LOCAL_HTTP_READY'} | ConvertTo-Json -Compress
  Set-Content -LiteralPath (Join-Path $logDir 'active-session.json') -Value $session -Encoding UTF8
  if ($env:OMEGA_PORTABLE_NO_BROWSER -eq '1') { Say 'Smoke mode: browser launch disabled.'; exit 0 }
  $edgePaths=@("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe", "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe")
  $edge=$edgePaths | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if ($edge) { Start-Process -FilePath $edge -ArgumentList @("--app=$uri",'--no-first-run') | Out-Null }
  else { Start-Process -FilePath $uri | Out-Null; Say 'Edge not detected; opened default browser.' }
  Say "Running. Logs: $logDir. To stop this copy, close server process PID $($process.Id)."
} catch {
  Say "STARTUP FAILED: $($_.Exception.Message)"
  Write-Host "Review startup diagnostics: $log"
  Read-Host 'Press Enter to close'
  exit 1
}

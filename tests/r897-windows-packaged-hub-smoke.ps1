# Windows CI proof for the exact Python Hub shipped inside the extracted portable UI.
# This CI runner is NOT the user's PC and does not prove R141/GPU/installer acceptance.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$PackageRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$package = (Resolve-Path -LiteralPath $PackageRoot).Path
$worker = Join-Path $package 'omega_local_hub_r881.py'
if (-not (Test-Path -LiteralPath $worker -PathType Leaf)) { throw 'Packaged local worker missing' }
$root = Join-Path $env:RUNNER_TEMP ('omega-r897-hub-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $root -Force | Out-Null
$stdout = Join-Path $root 'stdout.txt'
$stderr = Join-Path $root 'stderr.txt'
$port = 8765
$endpoint = "http://127.0.0.1:$port/api/hub/status"
$process = $null
try {
    # Bound loopback-only worker process; no native host pairing or shell jobs.
    $workerArgs = @('-u',('"' + $worker + '"'),'--root',('"' + $root + '"'),'--port',"$port")
    $process = Start-Process -FilePath 'python' -ArgumentList $workerArgs -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    $tokenPath = Join-Path $root '.omega/hub-r881.token'
    $token = $null
    for ($attempt=0;$attempt -lt 100;$attempt++) {
        if (Test-Path -LiteralPath $tokenPath) {
            $token = (Get-Content -LiteralPath $tokenPath -Raw).Trim()
            try {
                $null = Invoke-WebRequest -Uri $endpoint -UseBasicParsing -TimeoutSec 1
            } catch {
                $response = $_.Exception.Response
                if ($null -ne $response -and [int]$response.StatusCode -eq 401) { break }
            }
        }
        if ($process.HasExited) { throw "Packaged hub process exited early: $(Get-Content $stderr -Raw)" }
        Start-Sleep -Milliseconds 100
    }
    if (-not $token -or $token.Length -lt 32) { throw 'Packaged worker token was not established' }
    $headers = @{'X-Omega-Local-Token'=$token;'Origin'='http://127.0.0.1:49152'}
    $ok = Invoke-WebRequest -Uri $endpoint -Headers $headers -UseBasicParsing -TimeoutSec 5
    if ($ok.StatusCode -ne 200) { throw 'Authenticated packaged worker did not respond' }
    if ($ok.Headers['Access-Control-Allow-Origin'] -ne $headers['Origin']) { throw 'Portable ephemeral origin not allowed' }
    $status = $ok.Content | ConvertFrom-Json
    if ($status.schema -ne 'OMEGA_LOCAL_EDGE_HUB_R881' -or $status.physicalPcAccepted -ne $false) { throw 'Hub source or proof boundary mismatch' }
    foreach ($badHeaders in @(
        @{'Origin'=$headers['Origin']},
        @{'X-Omega-Local-Token'='bad';'Origin'=$headers['Origin']},
        @{'X-Omega-Local-Token'=$token;'Origin'='http://evil.example:49152'}
    )) {
        $refused = $false
        try { $null = Invoke-WebRequest -Uri $endpoint -Headers $badHeaders -UseBasicParsing -TimeoutSec 5 }
        catch { if ($null -ne $_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 401) { $refused = $true } }
        if (-not $refused) { throw 'Packaged worker accepted unauthorized browser request' }
    }
    $body = '{"operation":"HASH_TREE","args":{"path":"."}}'
    $queued = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 5
    $receipt = $queued.Content | ConvertFrom-Json
    if ($queued.StatusCode -ne 202 -or -not $receipt.job.id -or $receipt.job.state -ne 'QUEUED') { throw 'Packaged worker did not persist a bounded job' }
    $finished = $null
    for ($poll=0;$poll -lt 80;$poll++) {
        $read = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $receipt.job.id) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $finished = ($read.Content | ConvertFrom-Json).job
        if ($finished.state -in @('COMPLETED','FAILED','HELD')) { break }
        Start-Sleep -Milliseconds 100
    }
    if ($null -eq $finished -or $finished.state -ne 'COMPLETED' -or
        $finished.result.state -ne 'INTERNAL_FILE_HASHES_ONLY' -or
        -not $finished.result_sha256 -or $finished.result.nativePcAccepted -ne $false) {
        throw "Packaged Hub did not execute and receipt-bound the actual local hash job: $($finished.state) $($finished.error)"
    }
    Write-Host 'R897 PACKAGED WINDOWS HUB PASS: authentic Python worker, ephemeral loopback origin, private token refusal, completed local HASH_TREE and SHA-256 receipt. CI RUNNER ONLY.'
} finally {
    if ($null -ne $process -and -not $process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $root) { Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue }
}

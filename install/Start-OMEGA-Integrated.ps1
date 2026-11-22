# OMEGA7 R898 integrated Windows supervisor.
# Preserves native Hub root, token and worker authority. Does not auto-pair Hybrid Link.
[CmdletBinding()]
param(
    [string]$ApprovedRoot,
    [switch]$NoBrowser,
    [switch]$SelfTest
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$hubProcess = $null
$uiProcess = $null
$readyFile = $null
try {
    $package = $PSScriptRoot
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File (Join-Path $package 'Verify-OMEGA-Package.ps1') -PackageRoot $package
    if ($LASTEXITCODE -ne 0) { throw 'Package integrity refused integrated startup' }
    if (-not $ApprovedRoot) {
        if ($SelfTest) { throw 'Self-test requires an explicit approved root' }
        $ApprovedRoot = Read-Host 'Existing approved NON-SYSTEM project folder'
    }
    if (-not $ApprovedRoot -or -not (Test-Path -LiteralPath $ApprovedRoot -PathType Container)) {
        throw 'Existing approved project directory required'
    }
    $rootItem = Get-Item -LiteralPath (Resolve-Path -LiteralPath $ApprovedRoot).Path -Force
    $root = $rootItem.FullName.TrimEnd([char[]]@('\','/'))
    $drive = [System.IO.Path]::GetPathRoot($root)
    if (-not $drive -or $drive.StartsWith('\\') -or
        $drive.TrimEnd([char[]]@('\','/')).Equals($env:SystemDrive,[System.StringComparison]::OrdinalIgnoreCase)) {
        throw 'Approved root must be on a local non-system drive'
    }
    $cursor = $rootItem
    while ($null -ne $cursor) {
        if (($cursor.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw 'Approved root contains an untrusted junction or symbolic link'
        }
        $cursor = $cursor.Parent
    }
    $worker = Join-Path $package 'OMEGA-Local-Hub\OMEGA-Local-Hub.exe'
    $server = Join-Path $package 'Start-OMEGA-Local.ps1'
    if (-not (Test-Path -LiteralPath $worker -PathType Leaf) -or
        -not (Test-Path -LiteralPath $server -PathType Leaf)) {
        throw 'Complete native worker and studio server are required'
    }
    Write-Host 'OMEGA7 LOCAL STUDIO + BOUNDED WORKER' -ForegroundColor Cyan
    Write-Host ('Approved root: ' + $root)
    $hubArgs = @('--root',('"' + $root + '"'),'--port','8765')
    $hubProcess = Start-Process -FilePath $worker -ArgumentList $hubArgs -PassThru
    $tokenFile = Join-Path $root '.omega\hub-r881.token'
    $endpoint = 'http://127.0.0.1:8765/api/hub/status'
    $accepted = $false
    for ($attempt = 0; $attempt -lt 120; $attempt++) {
        if ($hubProcess.HasExited) { throw 'Native local worker exited without authenticated readiness' }
        if (Test-Path -LiteralPath $tokenFile -PathType Leaf) {
            $token = (Get-Content -LiteralPath $tokenFile -Raw -ErrorAction Stop).Trim()
            if ($token.Length -ge 32 -and $token.Length -le 256) {
                try {
                    $status = Invoke-RestMethod -Uri $endpoint -Headers @{'X-Omega-Local-Token'=$token} -TimeoutSec 2 -ErrorAction Stop
                    if ($status.schema -eq 'OMEGA_LOCAL_EDGE_HUB_R881' -and $status.physicalPcAccepted -eq $false) {
                        $accepted = $true
                        break
                    }
                } catch {
                    # Worker may still be starting; never weaken authentication.
                }
            }
        }
        Start-Sleep -Milliseconds 250
    }
    if (-not $accepted) { throw 'Authenticated local worker never reached the expected bounded Hub schema' }
    Write-Host 'Local Hub authenticated on 127.0.0.1:8765. No native GPU or paired-PC claim.'
    Write-Host 'Select Local / Edge Hub in OMEGA7 and load your private token file.'
    if ($SelfTest) {
        $readyFile = Join-Path (Join-Path $root '.omega') ('omega-r898-integrated-' + [guid]::NewGuid().ToString('N') + '.txt')
        $args = @('-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass',
                  '-File',('"' + $server + '"'),'-NoBrowser','-ReadyFile',('"' + $readyFile + '"'))
        $uiProcess = Start-Process -FilePath 'powershell.exe' -ArgumentList $args -PassThru -WindowStyle Hidden
        $url = $null
        for ($attempt = 0; $attempt -lt 80; $attempt++) {
            if ($uiProcess.HasExited) { throw 'Integrated UI exited before readiness' }
            if (Test-Path -LiteralPath $readyFile) {
                $url = (Get-Content -LiteralPath $readyFile -Raw).Trim()
                break
            }
            Start-Sleep -Milliseconds 250
        }
        if (-not $url -or $url -notmatch '^http://127\.0\.0\.1:[0-9]+/$') { throw 'Integrated UI loopback readiness failed' }
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 8
        if ($response.StatusCode -ne 200 -or $response.Content -notmatch 'OMEGA') { throw 'Integrated UI content failed' }
        $post = Invoke-RestMethod -Uri $endpoint -Headers @{'X-Omega-Local-Token'=$token} -TimeoutSec 8
        if ($post.schema -ne 'OMEGA_LOCAL_EDGE_HUB_R881' -or $post.physicalPcAccepted -ne $false) {
            throw 'Integrated Hub was not ready alongside the UI'
        }
        Write-Host 'R898 INTEGRATED WIN PASS: compiled Hub + authenticated localhost + OMEGA7 real HTTP, governed boundary retained.'
    } else {
        # Foreground UI keeps the integrated launcher attached to one lifecycle.
        & $server -NoBrowser:$NoBrowser
    }
} finally {
    if ($null -ne $uiProcess -and -not $uiProcess.HasExited) {
        Stop-Process -Id $uiProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($null -ne $hubProcess -and -not $hubProcess.HasExited) {
        Stop-Process -Id $hubProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($readyFile -and (Test-Path -LiteralPath $readyFile)) {
        Remove-Item -LiteralPath $readyFile -Force -ErrorAction SilentlyContinue
    }
    Remove-Variable token -ErrorAction SilentlyContinue
}

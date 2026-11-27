# R901 operator-run Windows evidence: actual application bytes and local machine
# observations only. Never fabricates R141/R237 authenticated PC acceptance.
[CmdletBinding()]
param(
    [string]$EvidenceRoot=(Join-Path $env:LOCALAPPDATA 'OMEGA7-Evidence'),
    [switch]$SkipBrowser
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$package=$PSScriptRoot
$ready=$null
$webProcess=$null
try {
    $fullEvidence=[System.IO.Path]::GetFullPath($EvidenceRoot).TrimEnd([char[]]@('\','/'))
    $fullPackage=[System.IO.Path]::GetFullPath($package).TrimEnd([char[]]@('\','/'))
    $drive=[System.IO.Path]::GetPathRoot($fullEvidence)
    if (-not $drive -or $fullEvidence -eq $drive.TrimEnd([char[]]@('\','/')) -or
        $fullEvidence.Equals($fullPackage,[StringComparison]::OrdinalIgnoreCase) -or
        $fullEvidence.StartsWith($fullPackage+'\',[StringComparison]::OrdinalIgnoreCase) -or
        $fullEvidence.StartsWith('\\')) { throw 'Evidence destination must be outside the app on a local directory' }
    $parent=Split-Path -Path $fullEvidence -Parent
    if(-not(Test-Path -LiteralPath $parent -PathType Container)){
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    $cursor=Get-Item -LiteralPath $parent -Force
    while($null -ne $cursor){
        if(($cursor.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0){
            throw 'Evidence destination passes through junction/symbolic link'
        }
        $cursor=$cursor.Parent
    }
    if(-not(Test-Path -LiteralPath $fullEvidence -PathType Container)){
        New-Item -ItemType Directory -Path $fullEvidence -Force | Out-Null
    }
    $evidenceItem=Get-Item -LiteralPath $fullEvidence -Force
    if(($evidenceItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0){
        throw 'Evidence directory is a junction/symbolic link'
    }
    $verifier=Join-Path $package 'Verify-OMEGA-Package.ps1'
    if(-not(Test-Path -LiteralPath $verifier -PathType Leaf)){throw 'Exact package verifier missing'}
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $verifier -PackageRoot $package
    if($LASTEXITCODE -ne 0){throw 'Installed package integrity failed; no local acceptance'}
    $manifest=Get-Content -LiteralPath (Join-Path $package 'OMEGA-PACKAGE-EVIDENCE.json') -Raw | ConvertFrom-Json
    $worker=Join-Path $package 'OMEGA-Local-Hub\OMEGA-Local-Hub.exe'
    $workerPresent=Test-Path -LiteralPath $worker -PathType Leaf
    $browser=@{attempted=$false;responded=$false;scope='LOCAL_HTTP_ONLY';status='NOT_CHECKED'}
    if(-not $SkipBrowser){
        $browser.attempted=$true
        $ready=Join-Path $fullEvidence ('omega-r901-readiness-'+[guid]::NewGuid().ToString('N')+'.txt')
        $server=Join-Path $package 'Start-OMEGA-Local.ps1'
        $args=@('-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',('"' + $server + '"'),'-NoBrowser','-ReadyFile',('"' + $ready + '"'))
        $webProcess=Start-Process -FilePath 'powershell.exe' -ArgumentList $args -PassThru -WindowStyle Hidden
        for($attempt=0;$attempt -lt 80;$attempt++){
            if($webProcess.HasExited){$browser.status='LOCAL_SERVER_EXITED';break}
            if(Test-Path -LiteralPath $ready -PathType Leaf){
                $url=(Get-Content -LiteralPath $ready -Raw).Trim()
                if($url -notmatch '^http://127\.0\.0\.1:[0-9]+/$'){
                    throw 'Local UI readiness origin unexpectedly remote'
                }
                try{
                    $response=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5
                    if($response.StatusCode -eq 200 -and $response.Content -match 'OMEGA'){
                        $browser.responded=$true;$browser.status='ACTUAL_LOCAL_UI_HTTP_200'
                    }else{$browser.status='LOCAL_UI_UNEXPECTED_RESPONSE'}
                }catch{$browser.status='LOCAL_UI_REQUEST_FAILED'}
                break
            }
            Start-Sleep -Milliseconds 250
        }
        if($browser.status -eq 'NOT_CHECKED'){$browser.status='LOCAL_UI_READINESS_TIMEOUT'}
    }
    $gpuList=@()
    $gpuQuery='UNAVAILABLE'
    try{
        $controllers=@(Get-CimInstance -ClassName Win32_VideoController -ErrorAction Stop)
        foreach($controller in $controllers){
            $gpuList+=@{
                description=[string]$controller.Name
                driverVersion=[string]$controller.DriverVersion
                operationalStatus=[string]$controller.Status
            }
        }
        $gpuQuery='ADAPTER_INVENTORY_OBSERVED'
    }catch{$gpuQuery='HARDWARE_QUERY_UNAVAILABLE'}
    $localModel='UNTESTED'
    try{
        $uri='http://127.0.0.1:11434/api/tags'
        $response=Invoke-WebRequest -UseBasicParsing -Uri $uri -TimeoutSec 2 -MaximumRedirection 0 -ErrorAction Stop
        if($response.StatusCode -eq 200){$localModel='LOCAL_MODEL_TAGS_HTTP_200'}
        else{$localModel='LOCAL_MODEL_TAGS_REFUSED'}
    }catch{$localModel='LOCAL_MODEL_BACKEND_UNAVAILABLE'}
    $receipt=[ordered]@{
        schema='OMEGA_WINDOWS_LOCAL_OBSERVATION_R901'
        observedUtc=[DateTime]::UtcNow.ToString('o')
        sourceCommit=[string]$manifest.source_commit
        packageIntegrity='EXACT_SHA256_PACKAGE_VERIFIED'
        localWorkerExePresent=[bool]$workerPresent
        localUi=$browser
        gpuAdapterInventoryState=$gpuQuery
        gpuAdapters=$gpuList
        localModelInventoryState=$localModel
        authenticatedHybridLinkPcAccepted=$false
        physicalPcAccepted=$false
        nativeGpuWorkloadProven=$false
        observedOn='CURRENT_WINDOWS_PROCESS_HOST'
        evidenceScope='UNSIGNED_OPERATOR_LOCAL_OBSERVATIONS_NOT_R141_R237'
    }
    $json=$receipt|ConvertTo-Json -Depth 8
    $file=Join-Path $fullEvidence ('OMEGA-R901-LOCAL-OBSERVATION-'+[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')+'-'+[guid]::NewGuid().ToString('N')+'.json')
    [IO.File]::WriteAllText($file,$json,[Text.Encoding]::UTF8)
    $digest=(Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
    Write-Host 'R901 LOCAL OBSERVATIONS WRITTEN. Not R141 host acceptance, and not proof of GPU compute.' -ForegroundColor Cyan
    Write-Host ('Evidence: '+$file)
    Write-Host ('SHA-256: '+$digest)
    if(-not $workerPresent -or (-not $SkipBrowser -and -not $browser.responded)){
        throw 'Required installed worker or live local UI probe failed; read evidence for held scope'
    }
} finally {
    if($null -ne $webProcess -and -not $webProcess.HasExited){
        Stop-Process -Id $webProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if($ready -and (Test-Path -LiteralPath $ready -PathType Leaf)){
        Remove-Item -LiteralPath $ready -Force -ErrorAction SilentlyContinue
    }
}

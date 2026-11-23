# R899 Windows *compiled EXE* end-to-end local model request/receipt evidence.
# Uses a deterministic loopback-only test server; proves transport and persistence,
# not a trained model, target physical GPU, or semantic model correctness.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$PackageRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$package=(Resolve-Path -LiteralPath $PackageRoot).Path
$worker=Join-Path $package 'OMEGA-Local-Hub\OMEGA-Local-Hub.exe'
$fixture=(Resolve-Path -LiteralPath '.\tests\r899-windows-ollama-fixture.py').Path
if (-not (Test-Path -LiteralPath $worker -PathType Leaf)) { throw 'Compiled Hub missing' }
$root=Join-Path $env:RUNNER_TEMP ('omega-r899-model-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $root -Force | Out-Null
$mock=$null
$hub=$null
$endpoint='http://127.0.0.1:8765'
$model='omega-ci-fixture:latest'
$expected='R899_COMPILED_WORKER_RETURNED_ACTUAL_LOCAL_HTTP_RESPONSE'
try {
    # Prove fixture startup is owned by this test, never use a pre-existing model
    # process or an uncontrolled backend response as proof.
    $mock=Start-Process -FilePath 'python' -ArgumentList @('-u',('"' + $fixture + '"')) -PassThru -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'mock-out.txt') -RedirectStandardError (Join-Path $root 'mock-err.txt')
    $mockReady=$false
    for($n=0;$n -lt 80;$n++){
        if($mock.HasExited){ throw 'CI model fixture exited; port 11434 may be occupied' }
        try{
            $response=Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 1 -ErrorAction Stop
            if($response.models.Count -eq 1 -and $response.models[0].name -eq $model){$mockReady=$true;break}
        } catch{}
        Start-Sleep -Milliseconds 100
    }
    if(-not $mockReady){throw 'CI loopback model fixture did not become ready'}
    $hub=Start-Process -FilePath $worker -ArgumentList @('--root',('"' + $root + '"'),'--port','8765') -PassThru -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'hub-out.txt') -RedirectStandardError (Join-Path $root 'hub-err.txt')
    $tokenPath=Join-Path $root '.omega\hub-r881.token'
    $token=$null
    for($n=0;$n -lt 100;$n++){
        if($hub.HasExited){throw 'Compiled Hub exited before local model acceptance'}
        if(Test-Path -LiteralPath $tokenPath -PathType Leaf){
            $token=(Get-Content -LiteralPath $tokenPath -Raw).Trim()
            try{
                $status=Invoke-RestMethod -Uri ($endpoint+'/api/hub/status') -Headers @{'X-Omega-Local-Token'=$token} -TimeoutSec 1 -ErrorAction Stop
                if($status.schema -eq 'OMEGA_LOCAL_EDGE_HUB_R881' -and $status.physicalPcAccepted -eq $false){break}
            }catch{}
        }
        Start-Sleep -Milliseconds 100
    }
    if(-not $token -or $status.schema -ne 'OMEGA_LOCAL_EDGE_HUB_R881'){throw 'Compiled Hub authentication failed'}
    $headers=@{'X-Omega-Local-Token'=$token;'Origin'='http://127.0.0.1:49152'}
    $models=Invoke-RestMethod -Uri ($endpoint+'/api/hub/models') -Headers $headers -TimeoutSec 5 -ErrorAction Stop
    if($models.schema -ne 'OMEGA_LOCAL_MODELS_R899' -or
       $models.models.Count -ne 1 -or $models.models[0] -ne $model -or
       $models.gpuProven -ne $false){throw 'Authenticated installed model inventory failed inside compiled EXE'}
    $payload=@{
        operation='LOCAL_INFER'
        args=@{model=$model;prompt='R899_EXECUTION_PROOF_PROMPT';num_predict=32}
    }|ConvertTo-Json -Depth 5 -Compress
    $queued=Invoke-RestMethod -Uri ($endpoint+'/api/hub/jobs') -Headers $headers -Method Post -ContentType 'application/json' -Body $payload -TimeoutSec 5
    if(-not $queued.job.id -or $queued.job.state -ne 'QUEUED'){throw 'Live local model job was not persisted'}
    $final=$null
    for($n=0;$n -lt 100;$n++){
        $read=Invoke-RestMethod -Uri ($endpoint+'/api/hub/jobs/'+$queued.job.id) -Headers $headers -TimeoutSec 5
        $final=$read.job
        if($final.state -in @('COMPLETED','HELD','FAILED')){break}
        Start-Sleep -Milliseconds 100
    }
    if($null -eq $final -or $final.state -ne 'COMPLETED' -or
       $final.result.schema -ne 'OMEGA_LOCAL_INFER_R899' -or
       $final.result.response -ne $expected -or
       $final.result.model -ne $model -or
       $final.result.nativePcAccepted -ne $false -or
       $final.result.gpuProven -ne $false -or
       -not $final.result_sha256){
        throw ('Compiled local inference/receipt mismatch: '+$final.state+' '+$final.error)
    }
    Write-Host 'R899 WINDOWS EXE LOCAL INFERENCE PASS: authenticated installed-model discovery, exact fake local HTTP generation, completed durable SHA-256 receipt. No trained model/GPU claim.'
} finally {
    if($null -ne $hub -and -not $hub.HasExited){Stop-Process -Id $hub.Id -Force -ErrorAction SilentlyContinue}
    if($null -ne $mock -and -not $mock.HasExited){Stop-Process -Id $mock.Id -Force -ErrorAction SilentlyContinue}
    if(Test-Path -LiteralPath $root){Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue}
}

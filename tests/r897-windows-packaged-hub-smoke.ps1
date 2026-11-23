# Windows CI proof for the standalone EXE compiled from the governed local Hub.
# This CI runner is NOT the user's PC and does not prove R141/GPU/installer acceptance.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$PackageRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$package = (Resolve-Path -LiteralPath $PackageRoot).Path
$worker = Join-Path $package 'OMEGA-Local-Hub\OMEGA-Local-Hub.exe'
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
    $workerArgs = @('--root',('"' + $root + '"'),'--port',"$port")
    $process = Start-Process -FilePath $worker -ArgumentList $workerArgs -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr
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
    # Prove the R884 verifier is bundled *inside* the executable at runtime,
    # rather than passing HASH_TREE while VERIFY_LEDGER_SET remains broken.
    $invalidManifest = Join-Path $root 'invalid-ledgers.json'
    [System.IO.File]::WriteAllText($invalidManifest,'{"schema":"OMEGA_TEN_LEDGER_INPUT_R884","ledgers":[]}')
    $verifyPayload = '{"operation":"VERIFY_LEDGER_SET","args":{"source":"invalid-ledgers.json"}}'
    $verifyQueued = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $verifyPayload -TimeoutSec 5
    $verifyJob = ($verifyQueued.Content | ConvertFrom-Json).job
    if (-not $verifyJob.id) { throw 'Bundled ledger verification did not queue' }
    $verifyResult = $null
    for ($poll=0;$poll -lt 80;$poll++) {
        $read = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $verifyJob.id) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $verifyResult = ($read.Content | ConvertFrom-Json).job
        if ($verifyResult.state -in @('COMPLETED','FAILED','HELD')) { break }
        Start-Sleep -Milliseconds 100
    }
    if ($null -eq $verifyResult -or $verifyResult.state -ne 'HELD' -or
        $verifyResult.error -notmatch 'LEDGER_SET_EXACT_TEN_LEDGERS_REQUIRED_HELD') {
        throw "R884 verifier was not executed inside packaged Hub: $($verifyResult.state) $($verifyResult.error)"
    }
    # Prove R899 adapter is executable inside the compiled worker, not merely copied.
    # Invalid model must be rejected by R899 itself without contacting any model.
    $inferPayload = '{"operation":"LOCAL_INFER","args":{"model":"invalid model name","prompt":"test"}}'
    $inferQueued = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $inferPayload -TimeoutSec 5
    $inferJob = ($inferQueued.Content | ConvertFrom-Json).job
    if (-not $inferJob.id) { throw 'R899 local model adapter did not queue' }
    $inferResult = $null
    for ($poll=0;$poll -lt 80;$poll++) {
        $read = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $inferJob.id) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $inferResult = ($read.Content | ConvertFrom-Json).job
        if ($inferResult.state -in @('COMPLETED','FAILED','HELD')) { break }
        Start-Sleep -Milliseconds 100
    }
    if ($null -eq $inferResult -or $inferResult.error -notmatch 'LOCAL_INFER_MODEL_REQUIRED') {
        throw "R899 local model adapter not executing inside bundled EXE: $($inferResult.state) $($inferResult.error)"
    }
    # R902: actual nested-state computation executed by the compiled worker.
    $tensorPayload = '{"operation":"SPHERE_TENSOR_STEP","args":{"seeds":[{"cell":0,"lane":0,"mass":4096}],"steps":4,"cell_axis":0,"lane_axis":1}}'
    $tensorQueued = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $tensorPayload -TimeoutSec 5
    $tensorId = ($tensorQueued.Content | ConvertFrom-Json).job.id
    if (-not $tensorId) { throw 'R902 compiled state-space operator did not queue' }
    $tensorResult = $null
    for ($poll=0;$poll -lt 100;$poll++) {
        $read = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $tensorId) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $tensorResult = ($read.Content | ConvertFrom-Json).job
        if ($tensorResult.state -in @('COMPLETED','FAILED','HELD')) { break }
        Start-Sleep -Milliseconds 100
    }
    if ($null -eq $tensorResult -or $tensorResult.state -ne 'COMPLETED' -or
        $tensorResult.result.schema -ne 'OMEGA_IMPLICIT_CELL_LANE_TENSOR_R902' -or
        $tensorResult.result.implicitComponents -ne 429981696 -or
        $tensorResult.result.totalMassBefore -ne 4096 -or
        $tensorResult.result.totalMassAfter -ne 4096 -or
        $tensorResult.result.conservationExact -ne $true -or
        $tensorResult.result.denseTensorAllocated -ne $false -or
        $tensorResult.result.gpuComputeProven -ne $false -or
        $tensorResult.result.fullStateSha256 -notmatch '^[a-f0-9]{64}$' -or
        $tensorResult.result_sha256 -notmatch '^[a-f0-9]{64}$') {
        throw "R902 compiled tensor execution or receipt failed: $($tensorResult.state) $($tensorResult.error)"
    }
    $replayResponse = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/replay/" + $tensorId) -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body '{}' -TimeoutSec 8
    $replayReceipt = $replayResponse.Content | ConvertFrom-Json
    if ($replayReceipt.state -ne 'MATCH' -or $replayReceipt.ok -ne $true) {
        throw 'R902 packaged tensor replay did not reproduce its full state receipt'
    }
    # R904 full sparse state CSV must be written by the *compiled* EXE,
    # with both exact canonical full-state and independent artifact hashes.
    $exportPayload = '{"operation":"SPHERE_TENSOR_EXPORT","args":{"seeds":[{"cell":0,"lane":0,"mass":4096}],"steps":4,"cell_axis":0,"lane_axis":1,"destination":"complete-tensor.csv"}}'
    $exportQueued = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $exportPayload -TimeoutSec 5
    $exportId = ($exportQueued.Content | ConvertFrom-Json).job.id
    if (-not $exportId) { throw 'R904 packaged full-state CSV export did not queue' }
    $exportResult = $null
    for ($poll=0;$poll -lt 100;$poll++) {
        $read = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $exportId) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $exportResult = ($read.Content | ConvertFrom-Json).job
        if ($exportResult.state -in @('COMPLETED','FAILED','HELD')) { break }
        Start-Sleep -Milliseconds 100
    }
    $exportFile = Join-Path $root 'complete-tensor.csv'
    if ($null -eq $exportResult -or $exportResult.state -ne 'COMPLETED' -or
        $exportResult.result.schema -ne 'OMEGA_SPARSE_TENSOR_EXPORT_R904' -or
        $exportResult.result.canonicalFullStateSha256 -ne $tensorResult.result.fullStateSha256 -or
        $exportResult.result.exportedRows -ne $tensorResult.result.activeComponents -or
        -not (Test-Path -LiteralPath $exportFile -PathType Leaf) -or
        $exportResult.result.artifact.sha256 -ne (Get-FileHash -LiteralPath $exportFile -Algorithm SHA256).Hash.ToLowerInvariant()) {
        throw "R904 packaged complete CSV state or file SHA receipt failed: $($exportResult.state) $($exportResult.error)"
    }
    $csvRows = @(Import-Csv -LiteralPath $exportFile)
    $sumMass = 0L
    foreach ($entry in $csvRows) { $sumMass += [long]$entry.mass }
    if ($csvRows.Count -ne $tensorResult.result.activeComponents -or $sumMass -ne 4096) {
        throw 'R904 packaged CSV does not contain the complete conserved tensor state'
    }
    # Fail-close: no replacement of an existing full-state artifact.
    $second = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $exportPayload -TimeoutSec 5
    $secondId = ($second.Content | ConvertFrom-Json).job.id
    $secondResult = $null
    for ($poll=0;$poll -lt 100;$poll++) {
        $read = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $secondId) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $secondResult = ($read.Content | ConvertFrom-Json).job
        if ($secondResult.state -in @('COMPLETED','FAILED','HELD')) { break }
        Start-Sleep -Milliseconds 100
    }
    if ($null -eq $secondResult -or $secondResult.state -ne 'HELD' -or
        $secondResult.error -notmatch 'R904_EXPORT_TARGET_EXISTS_HELD') {
        throw 'R904 permitted overwriting complete sparse state artifact'
    }
    # R905 verify every exported CSV component against its originating
    # immutable completed export job and durable original result SHA.
    $verifyPayload = @{operation='SPHERE_TENSOR_VERIFY';args=@{export_job_id=$exportId}} | ConvertTo-Json -Compress -Depth 4
    $roundtripQueued = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $verifyPayload -TimeoutSec 5
    $roundtripId = ($roundtripQueued.Content | ConvertFrom-Json).job.id
    if (-not $roundtripId) { throw 'R905 round-trip job did not queue' }
    $roundtrip = $null
    for ($poll=0;$poll -lt 100;$poll++) {
        $read = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $roundtripId) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $roundtrip = ($read.Content | ConvertFrom-Json).job
        if ($roundtrip.state -in @('COMPLETED','FAILED','HELD')) { break }
        Start-Sleep -Milliseconds 100
    }
    if ($null -eq $roundtrip -or $roundtrip.state -ne 'COMPLETED' -or
        $roundtrip.result.schema -ne 'OMEGA_SPARSE_EXPORT_ROUNDTRIP_R905' -or
        $roundtrip.result.exactStateMatched -ne $true -or
        $roundtrip.result.exactFileBytesMatched -ne $true -or
        $roundtrip.result.fullStateSha256 -ne $tensorResult.result.fullStateSha256 -or
        $roundtrip.result.originalExportReceiptSha256 -ne $exportResult.result_sha256) {
        throw "R905 compiled verifier failed complete CSV receipt match: $($roundtrip.state) $($roundtrip.error)"
    }
    # R906 live continuation of the verified full sparse checkpoint, with
    # a new immutable artifact and lineage to its original SQLite receipt.
    $continuePayload = @{operation='SPHERE_TENSOR_CONTINUE';args=@{
        export_job_id=$exportId;destination='tensor-next.csv';
        steps=1;cell_axis=0;lane_axis=1
    }} | ConvertTo-Json -Compress -Depth 5
    $continueQueued = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $continuePayload -TimeoutSec 5
    $continueId = ($continueQueued.Content | ConvertFrom-Json).job.id
    if (-not $continueId) { throw 'R906 native Windows checkpoint continuation not queued' }
    $continueResult = $null
    for ($poll=0;$poll -lt 100;$poll++) {
        $read = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $continueId) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $continueResult = ($read.Content | ConvertFrom-Json).job
        if ($continueResult.state -in @('COMPLETED','FAILED','HELD')) { break }
        Start-Sleep -Milliseconds 100
    }
    $continueFile=Join-Path $root 'tensor-next.csv'
    if ($null -eq $continueResult -or $continueResult.state -ne 'COMPLETED' -or
        $continueResult.result.schema -ne 'OMEGA_SPARSE_TENSOR_CONTINUATION_R906' -or
        $continueResult.result.sourceExportJobId -ne $exportId -or
        $continueResult.result.sourceExportReceiptSha256 -ne $exportResult.result_sha256 -or
        $continueResult.result.sourceStateSha256 -ne $exportResult.result.canonicalFullStateSha256 -or
        $continueResult.result.tensor.totalMassAfter -ne 4096 -or
        $continueResult.result.tensor.steps -ne 1 -or
        -not (Test-Path -LiteralPath $continueFile -PathType Leaf) -or
        $continueResult.result.artifact.sha256 -ne (Get-FileHash -LiteralPath $continueFile -Algorithm SHA256).Hash.ToLowerInvariant()) {
        throw "R906 packaged native checkpoint continuation/lineage failed: $($continueResult.state) $($continueResult.error)"
    }
    $continueRows=@(Import-Csv -LiteralPath $continueFile)
    $continueMass=0L
    foreach ($entry in $continueRows) { $continueMass += [long]$entry.mass }
    if ($continueRows.Count -ne $continueResult.result.exportedRows -or $continueMass -ne 4096) {
        throw 'R906 continued state CSV rows do not conserve original total mass'
    }
    # A continuation is itself a checkpoint accepted by the roundtrip verifier.
    $nextVerifyPayload=@{operation='SPHERE_TENSOR_VERIFY';args=@{export_job_id=$continueId}} | ConvertTo-Json -Compress -Depth 4
    $nextQueued=Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $nextVerifyPayload -TimeoutSec 5
    $nextId=($nextQueued.Content|ConvertFrom-Json).job.id
    $nextResult=$null
    for($poll=0;$poll -lt 100;$poll++){
        $read=Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $nextId) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $nextResult=($read.Content|ConvertFrom-Json).job
        if($nextResult.state -in @('COMPLETED','FAILED','HELD')){break}
        Start-Sleep -Milliseconds 100
    }
    if($null -eq $nextResult -or $nextResult.state -ne 'COMPLETED' -or
       $nextResult.result.fullStateSha256 -ne $continueResult.result.canonicalFullStateSha256){
        throw 'R906 continued native checkpoint could not be independently roundtrip verified'
    }
    # R907 the same compiled Windows Hub must render a genuine SVG from the
    # independently verified full 20,736D cell-state checkpoint.
    $renderPayload = @{operation='SPHERE_TENSOR_RENDER';args=@{
        export_job_id=$continueId;destination='verified-cell-projection.svg'
    }} | ConvertTo-Json -Compress -Depth 4
    $renderQueued=Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $renderPayload -TimeoutSec 5
    $renderId=($renderQueued.Content|ConvertFrom-Json).job.id
    if(-not $renderId){throw 'R907 native SVG projection did not queue'}
    $renderResult=$null
    for($poll=0;$poll -lt 100;$poll++){
        $read=Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $renderId) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $renderResult=($read.Content|ConvertFrom-Json).job
        if($renderResult.state -in @('COMPLETED','FAILED','HELD')){break}
        Start-Sleep -Milliseconds 100
    }
    $svgFile=Join-Path $root 'verified-cell-projection.svg'
    if($null -eq $renderResult -or $renderResult.state -ne 'COMPLETED' -or
       $renderResult.result.schema -ne 'OMEGA_SPARSE_PROJECTION_ARTIFACT_R907' -or
       $renderResult.result.projection.addressableCells -ne 20736 -or
       $renderResult.result.projection.totalMass -ne 4096 -or
       $renderResult.result.projection.projectionGrid.Length -ne 20736 -or
       $renderResult.result.sourceExportJobId -ne $continueId -or
       $renderResult.result.sourceFullStateSha256 -ne $continueResult.result.canonicalFullStateSha256 -or
       -not(Test-Path -LiteralPath $svgFile -PathType Leaf) -or
       $renderResult.result.artifact.sha256 -ne (Get-FileHash -LiteralPath $svgFile -Algorithm SHA256).Hash.ToLowerInvariant()){
        throw "R907 compiled Windows projection integrity failed: $($renderResult.state) $($renderResult.error)"
    }
    $historyResponse = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -TimeoutSec 5
    $historyJob = @((($historyResponse.Content | ConvertFrom-Json).jobs) | Where-Object { $_.id -eq $renderId })
    if ($historyJob.Count -ne 1 -or
        $historyJob[0].result.projection.projectionGridOmittedFromJobList -ne $true -or
        ($historyJob[0].result.projection.PSObject.Properties.Name -contains 'projectionGrid')) {
        throw 'R907 full visual preview incorrectly expanded in bulk job history'
    }
    [xml]$svgDocument=Get-Content -LiteralPath $svgFile -Raw
    if($svgDocument.DocumentElement.LocalName -ne 'svg'){
        throw 'R907 generated file is not a parseable SVG'
    }
    # The same path cannot be overwritten by an export retry.
    $repeat=Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $renderPayload -TimeoutSec 5
    $repeatId=($repeat.Content|ConvertFrom-Json).job.id
    $repeatJob=$null
    for($poll=0;$poll -lt 100;$poll++){
        $read=Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $repeatId) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $repeatJob=($read.Content|ConvertFrom-Json).job
        if($repeatJob.state -in @('COMPLETED','FAILED','HELD')){break}
        Start-Sleep -Milliseconds 100
    }
    if($null -eq $repeatJob -or $repeatJob.state -ne 'HELD' -or
       $repeatJob.error -notmatch 'R907_PROJECTION_TARGET_EXISTS_HELD'){
        throw 'R907 compiled SVG projection overwrote existing artwork'
    }
    # R910 retrieve full R904 and chained R906 CSV bytes by exact original
    # job receipt; unrelated jobs and missing token must fail closed.
    foreach($row in @(
        @{id=$exportId;file=$exportFile;hash=$exportResult.result.artifact.sha256},
        @{id=$continueId;file=$continueFile;hash=$continueResult.result.artifact.sha256}
    )){
        $csvUri="http://127.0.0.1:$port/api/hub/artifacts/csv/$($row.id)"
        $csvDownload=Join-Path $root ("r910-"+$row.id+".csv")
        $csvResponse=Invoke-WebRequest -Uri $csvUri -Headers $headers -UseBasicParsing -OutFile $csvDownload -PassThru -TimeoutSec 5
        if($csvResponse.StatusCode -ne 200 -or
           $csvResponse.Headers['Content-Type'] -notmatch '^text/csv' -or
           $csvResponse.Headers['X-Omega-Artifact-Sha256'] -ne $row.hash -or
           $csvResponse.Headers['X-Content-Type-Options'] -ne 'nosniff' -or
           (Get-FileHash -LiteralPath $csvDownload -Algorithm SHA256).Hash.ToLowerInvariant() -ne $row.hash){
           throw 'R910 compiled Windows protected CSV bytes differ from original export receipt'
        }
        $noToken=$false
        try{$null=Invoke-WebRequest -Uri $csvUri -UseBasicParsing -TimeoutSec 5}
        catch{if($null -ne $_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 401){$noToken=$true}}
        if(-not $noToken){throw 'R910 exposed a full checkpoint without loopback authentication'}
    }
    $badCsv=$false
    try{$null=Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/artifacts/csv/$renderId" -Headers $headers -UseBasicParsing -TimeoutSec 5}
    catch{if($null -ne $_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 403){$badCsv=$true}}
    if(-not $badCsv){throw 'R910 incorrectly served an SVG job as CSV checkpoint'}
    # R909 original R907 SVG bytes must be downloadable only by an
    # authenticated loopback token, bound to the exact durable job receipt.
    $svgUri="http://127.0.0.1:$port/api/hub/artifacts/$renderId"
    $downloaded=Join-Path $root 'r909-download.svg'
    $downloadResponse=Invoke-WebRequest -Uri $svgUri -Headers $headers -UseBasicParsing -OutFile $downloaded -PassThru -TimeoutSec 5
    if($downloadResponse.StatusCode -ne 200 -or
       $downloadResponse.Headers['Content-Type'] -notmatch '^image/svg\+xml' -or
       $downloadResponse.Headers['X-Content-Type-Options'] -ne 'nosniff' -or
       $downloadResponse.Headers['Content-Disposition'] -notmatch 'attachment' -or
       $downloadResponse.Headers['X-Omega-Artifact-Sha256'] -ne $renderResult.result.artifact.sha256 -or
       (Get-FileHash -LiteralPath $downloaded -Algorithm SHA256).Hash.ToLowerInvariant() -ne $renderResult.result.artifact.sha256){
       throw 'R909 packaged Hub returned unverified or unsafe SVG download'
    }
    $deniedNoToken=$false
    try{$null=Invoke-WebRequest -Uri $svgUri -Headers @{'Origin'=$headers['Origin']} -UseBasicParsing -TimeoutSec 5}
    catch{if($null -ne $_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 401){$deniedNoToken=$true}}
    if(-not $deniedNoToken){throw 'R909 served protected SVG without authentication'}
    $deniedUnrelated=$false
    try{$null=Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/artifacts/"+$exportId) -Headers $headers -UseBasicParsing -TimeoutSec 5}
    catch{if($null -ne $_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 403){$deniedUnrelated=$true}}
    if(-not $deniedUnrelated){throw 'R909 disclosed unrelated source CSV via artifact route'}
    # Mutation of the exact original SVG must immediately refuse retrieval.
    [System.IO.File]::AppendAllText($svgFile,'X')
    $deniedChanged=$false
    try{$null=Invoke-WebRequest -Uri $svgUri -Headers $headers -UseBasicParsing -TimeoutSec 5}
    catch{if($null -ne $_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 403){$deniedChanged=$true}}
    if(-not $deniedChanged){throw 'R909 served SVG after its SHA-256 receipt diverged'}
    # A one-byte change must HELD, without overwriting the first export.
    [System.IO.File]::AppendAllText($exportFile, 'X')
    $csvTamperDenied=$false
    try{$null=Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/artifacts/csv/"+$exportId) -Headers $headers -UseBasicParsing -TimeoutSec 5}
    catch{if($null -ne $_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 403){$csvTamperDenied=$true}}
    if(-not $csvTamperDenied){throw 'R910 served a modified complete CSV checkpoint after source SHA drift'}

    $tamperQueued = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/hub/jobs" -Headers $headers -UseBasicParsing -Method Post -ContentType 'application/json' -Body $verifyPayload -TimeoutSec 5
    $tamperId = ($tamperQueued.Content | ConvertFrom-Json).job.id
    $tamperResult = $null
    for ($poll=0;$poll -lt 100;$poll++) {
        $read = Invoke-WebRequest -Uri ("http://127.0.0.1:$port/api/hub/jobs/" + $tamperId) -Headers $headers -UseBasicParsing -TimeoutSec 5
        $tamperResult = ($read.Content | ConvertFrom-Json).job
        if ($tamperResult.state -in @('COMPLETED','FAILED','HELD')) { break }
        Start-Sleep -Milliseconds 100
    }
    if ($null -eq $tamperResult -or $tamperResult.state -ne 'HELD' -or
        $tamperResult.error -notmatch 'R905_') {
        throw 'R905 compiled verifier did not refuse modified full state CSV'
    }
    Write-Host 'R902 PACKAGED WINDOWS HUB EXE PASS: authenticated bounded tensor execution, exact mass conservation, full-state SHA-256, replay MATCH. CI RUNNER ONLY.'
} finally {
    if ($null -ne $process -and -not $process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $root) { Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue }
}

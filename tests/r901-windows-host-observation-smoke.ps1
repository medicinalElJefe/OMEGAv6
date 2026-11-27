# R901 Windows CI proof that operator diagnostic outputs bounded unsiged
# local observations, without manufacturing R141/GPU or touching project files.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$PackageRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$package=(Resolve-Path -LiteralPath $PackageRoot).Path
$script=Join-Path $package 'Check-OMEGA-Windows.ps1'
if(-not(Test-Path -LiteralPath $script -PathType Leaf)){throw 'R901 local observation diagnostic missing'}
$root=Join-Path $env:RUNNER_TEMP ('omega-r901-observation-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $root -Force | Out-Null
$sentinel=Join-Path $root 'user-project.txt'
[IO.File]::WriteAllText($sentinel,'PRESERVE_PROJECT_DATA_R901')
try{
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $script -EvidenceRoot $root
    if($LASTEXITCODE -ne 0){throw 'R901 actual Windows package and local UI observation failed'}
    $receipts=@(Get-ChildItem -LiteralPath $root -Filter 'OMEGA-R901-LOCAL-OBSERVATION-*.json' -File)
    if($receipts.Count -ne 1){throw 'R901 did not emit one evidence receipt'}
    $evidence=Get-Content -LiteralPath $receipts[0].FullName -Raw | ConvertFrom-Json
    if($evidence.schema -ne 'OMEGA_WINDOWS_LOCAL_OBSERVATION_R901' -or
       $evidence.packageIntegrity -ne 'EXACT_SHA256_PACKAGE_VERIFIED' -or
       $evidence.localWorkerExePresent -ne $true -or
       $evidence.localUi.responded -ne $true -or
       $evidence.physicalPcAccepted -ne $false -or
       $evidence.nativeGpuWorkloadProven -ne $false -or
       $evidence.authenticatedHybridLinkPcAccepted -ne $false -or
       $evidence.evidenceScope -ne 'UNSIGNED_OPERATOR_LOCAL_OBSERVATIONS_NOT_R141_R237'){
       throw 'R901 local observation schema or proof boundary mismatch'
    }
    if((Get-Content -LiteralPath $sentinel -Raw) -ne 'PRESERVE_PROJECT_DATA_R901'){
       throw 'R901 observation affected unrelated data'
    }
    Write-Host 'R901 WINDOWS OBSERVATION PASS: exact package + real local UI + bounded adapter inventory; no falsely promoted native acceptance.'
}finally{
    if(Test-Path -LiteralPath $root){Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue}
}

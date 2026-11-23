# R911 true operator path: copied package, whitespace directory, no -PackageRoot,
# actual OPEN-OMEGA.cmd, live local HTTP, intact hash and tamper refusal.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$PackageRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$package=(Resolve-Path -LiteralPath $PackageRoot).Path
$copy=Join-Path $env:RUNNER_TEMP ('OMEGA Operator Extracted With Spaces '+[guid]::NewGuid().ToString('N'))
$ready=Join-Path $env:RUNNER_TEMP ('omega-r911-'+[guid]::NewGuid().ToString('N')+'.ready')
$stdout=Join-Path $env:RUNNER_TEMP ('omega-r911-'+[guid]::NewGuid().ToString('N')+'.out')
$stderr=Join-Path $env:RUNNER_TEMP ('omega-r911-'+[guid]::NewGuid().ToString('N')+'.err')
$process=$null
$previousSmoke=$env:OMEGA_OPERATOR_SMOKE
$previousReady=$env:OMEGA_OPERATOR_READY_FILE
$previousDirectory=(Get-Location).Path
try {
    Copy-Item -LiteralPath $package -Destination $copy -Recurse -Force
    $verifier=Join-Path $copy 'Verify-OMEGA-Package.ps1'
    $launcher=Join-Path $copy 'OPEN-OMEGA.cmd'
    $index=Join-Path $copy 'dist\index.html'
    foreach($path in @($verifier,$launcher,$index)){
        if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw ('R911 packaged entry missing: '+$path)}
    }
    Set-Location -LiteralPath $env:RUNNER_TEMP
    # This is precisely the zero-argument path the user's screenshot found.
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $verifier
    if($LASTEXITCODE -ne 0){throw 'R911 no-argument package verifier failed from unrelated working directory'}
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $verifier -PackageRoot $copy
    if($LASTEXITCODE -ne 0){throw 'R911 explicit extracted package verification failed'}
    # Invoke the actual double-click batch launcher with its built-in
    # no-browser readiness probe; do not substitute Start-OMEGA-Local.ps1.
    $env:OMEGA_OPERATOR_SMOKE='1'
    $env:OMEGA_OPERATOR_READY_FILE=$ready
    $process=Start-Process -FilePath $env:ComSpec -ArgumentList @('/d','/c',('""'+$launcher+'""')) -WorkingDirectory $env:RUNNER_TEMP -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    $url=$null
    for($attempt=0;$attempt -lt 120;$attempt++){
        if(Test-Path -LiteralPath $ready -PathType Leaf){
            $url=(Get-Content -LiteralPath $ready -Raw).Trim()
            break
        }
        if($process.HasExited){
            $errorText=if(Test-Path -LiteralPath $stderr){Get-Content -LiteralPath $stderr -Raw}else{''}
            $outText=if(Test-Path -LiteralPath $stdout){Get-Content -LiteralPath $stdout -Raw}else{''}
            throw ("R911 operator cmd exited before ready: "+$process.ExitCode+" stdout="+$outText+" stderr="+$errorText)
        }
        Start-Sleep -Milliseconds 250
    }
    if(-not $url -or $url -notmatch '^http://127\.0\.0\.1:[0-9]+/$'){
        throw 'R911 original OPEN-OMEGA.cmd did not start an HTTP loopback UI'
    }
    $response=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
    if($response.StatusCode -ne 200 -or $response.Content -notmatch 'OMEGA'){
        throw 'R911 actual operator-launched UI returned incorrect content'
    }
    # Kill the full test-only subprocess tree before modifying any manifest file.
    & taskkill.exe /PID $process.Id /T /F 2>$null | Out-Null
    $process.WaitForExit(4000) | Out-Null
    $process=$null
    $original=[IO.File]::ReadAllBytes($index)
    try{
        [IO.File]::AppendAllText($index,'R911_TAMPER_TEST')
        & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $verifier
        if($LASTEXITCODE -eq 0){throw 'R911 modified original package passed zero-argument verifier'}
    }finally{
        [IO.File]::WriteAllBytes($index,$original)
    }
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $verifier
    if($LASTEXITCODE -ne 0){throw 'R911 original restored extracted package failed exact verification'}
    Write-Host 'R911 DOUBLE-CLICK WINDOWS OPERATOR PASS: exact no-arg verifier, path with spaces, real CMD HTTP startup, tamper refusal, restored package.'
}finally{
    Set-Location -LiteralPath $previousDirectory
    if($null -ne $process -and -not $process.HasExited){
        & taskkill.exe /PID $process.Id /T /F 2>$null | Out-Null
    }
    $env:OMEGA_OPERATOR_SMOKE=$previousSmoke
    $env:OMEGA_OPERATOR_READY_FILE=$previousReady
    foreach($path in @($ready,$stdout,$stderr)){
        if(Test-Path -LiteralPath $path -PathType Leaf){Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue}
    }
    if(Test-Path -LiteralPath $copy){Remove-Item -LiteralPath $copy -Recurse -Force -ErrorAction SilentlyContinue}
}

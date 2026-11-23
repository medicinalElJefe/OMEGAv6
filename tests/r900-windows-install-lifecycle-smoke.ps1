# R900 Windows CI-managed installation lifecycle proof. Never touches user folders.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$PackageRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$package=(Resolve-Path -LiteralPath $PackageRoot).Path
$parent=Join-Path $env:RUNNER_TEMP ('omega-r900-install-proof-'+[guid]::NewGuid().ToString('N'))
$install=Join-Path $parent 'OMEGA7'
$unknown=Join-Path $parent 'Unknown'
$sentinel=Join-Path $parent 'keep-user-data.txt'
$marker=$install+'.omega-install.json'
New-Item -ItemType Directory -Path $parent -Force | Out-Null
[System.IO.File]::WriteAllText($sentinel,'PROJECT_DATA_MUST_SURVIVE_R900')
$installer=Join-Path $package 'Install-OMEGA-Windows.ps1'
$uninstaller=Join-Path $package 'Uninstall-OMEGA-Windows.ps1'
try {
    if (-not (Test-Path -LiteralPath $installer -PathType Leaf) -or
        -not (Test-Path -LiteralPath $uninstaller -PathType Leaf)) {
        throw 'Managed installer and uninstaller are missing'
    }
    New-Item -ItemType Directory -Path $unknown -Force | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $unknown 'do-not-overwrite.txt'),'R900_UNMANAGED_FILE')
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $installer -InstallRoot $unknown -NoShortcut 2>$null
    if ($LASTEXITCODE -eq 0 -or
        (Get-Content -LiteralPath (Join-Path $unknown 'do-not-overwrite.txt') -Raw) -ne 'R900_UNMANAGED_FILE') {
        throw 'Installer overwrote an unmanaged target'
    }
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $installer -InstallRoot $install -NoShortcut
    if ($LASTEXITCODE -ne 0) { throw 'Fresh managed install failed' }
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File (Join-Path $install 'Verify-OMEGA-Package.ps1') -PackageRoot $install
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $marker)) { throw 'Installed package failed integrity or owner marker' }
    $receipt=Get-Content -LiteralPath $marker -Raw | ConvertFrom-Json
    if ($receipt.schema -ne 'OMEGA_WINDOWS_MANAGED_INSTALL_R900' -or $receipt.physicalPcAccepted -ne $false) {
        throw 'Installed ownership evidence violates proof scope'
    }
    # An update must perform verified replacement, not append extra files or
    # destroy a neighboring project. Full package check is repeated afterward.
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $installer -InstallRoot $install -NoShortcut
    if ($LASTEXITCODE -ne 0) { throw 'Managed reinstall/upgrade failed' }
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File (Join-Path $install 'Verify-OMEGA-Package.ps1') -PackageRoot $install
    if ($LASTEXITCODE -ne 0) { throw 'Managed upgrade did not preserve exact package' }
    $tampered=Join-Path $install 'dist\index.html'
    $bytes=[System.IO.File]::ReadAllBytes($tampered)
    try {
        [System.IO.File]::AppendAllText($tampered,'R900_TAMPER_PROOF')
        & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $uninstaller -InstallRoot $install -ConfirmRemove -NoShortcut 2>$null
        if ($LASTEXITCODE -eq 0 -or -not (Test-Path -LiteralPath $tampered)) {
            throw 'Changed/unrecognized installation was deleted'
        }
    } finally {
        [System.IO.File]::WriteAllBytes($tampered,$bytes)
    }
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $uninstaller -InstallRoot $install -ConfirmRemove -NoShortcut
    if ($LASTEXITCODE -ne 0 -or (Test-Path -LiteralPath $install) -or (Test-Path -LiteralPath $marker)) {
        throw 'Verified managed uninstall failed'
    }
    if ((Get-Content -LiteralPath $sentinel -Raw) -ne 'PROJECT_DATA_MUST_SURVIVE_R900') {
        throw 'Uninstall altered adjacent user data'
    }
    Write-Host 'R900 WINDOWS INSTALL LIFECYCLE PASS: fresh install, exact upgrade, tamper-refusal uninstall, verified removal, neighboring project preserved. CI runner only.'
} finally {
    if(Test-Path -LiteralPath $parent){Remove-Item -LiteralPath $parent -Recurse -Force -ErrorAction SilentlyContinue}
}

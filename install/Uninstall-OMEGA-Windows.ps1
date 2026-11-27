# R900 managed uninstall. Only OMEGA-owned, intact package; preserves all
# approved project directories, worker SQLite ledgers and unrelated files.
[CmdletBinding()]
param(
    [string]$InstallRoot = (Join-Path $env:LOCALAPPDATA 'OMEGA7'),
    [switch]$ConfirmRemove,
    [switch]$NoShortcut
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
if (-not $ConfirmRemove) { throw 'Explicit -ConfirmRemove required to uninstall OMEGA7' }
$root=[System.IO.Path]::GetFullPath($InstallRoot).TrimEnd([char[]]@('\','/'))
$drive=[System.IO.Path]::GetPathRoot($root)
if (-not $drive -or $root -eq $drive.TrimEnd([char[]]@('\','/')) -or $root.StartsWith('\\')) {
    throw 'Uninstall refused for a drive root or network path'
}
# Refuse junctions in either the managed target or any parent path.
$ancestor=Split-Path -Path $root -Parent
while ($ancestor) {
    $node=Get-Item -LiteralPath $ancestor -Force
    if (($node.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw 'Uninstall path crosses a junction or symbolic link'
    }
    $next=Split-Path -Path $ancestor -Parent
    if ($next -eq $ancestor) { break }
    $ancestor=$next
}
if (Test-Path -LiteralPath $root) {
    $target=Get-Item -LiteralPath $root -Force
    if (($target.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw 'Uninstall target is a junction or symbolic link'
    }
}
$marker=$root+'.omega-install.json'
if (-not (Test-Path -LiteralPath $marker -PathType Leaf) -or
    -not (Test-Path -LiteralPath $root -PathType Container)) { throw 'No managed OMEGA7 installation at requested path' }
$receipt=Get-Content -LiteralPath $marker -Raw | ConvertFrom-Json
if ($receipt.schema -ne 'OMEGA_WINDOWS_MANAGED_INSTALL_R900' -or
    -not $receipt.root.Equals($root,[System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Uninstall ownership receipt mismatch'
}
$verifier=Join-Path $root 'Verify-OMEGA-Package.ps1'
if (-not (Test-Path -LiteralPath $verifier -PathType Leaf)) { throw 'Managed package verifier missing' }
& powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $verifier -PackageRoot $root
if ($LASTEXITCODE -ne 0) { throw 'Managed installation is changed; cannot safely delete unknown content' }
if (-not $NoShortcut) {
    $shortcut=Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\OMEGA7 Local Studio.lnk'
    if (Test-Path -LiteralPath $shortcut -PathType Leaf) {
        $shell=New-Object -ComObject WScript.Shell
        $link=$shell.CreateShortcut($shortcut)
        if ($link.TargetPath -eq (Join-Path $root 'OPEN-OMEGA-INTEGRATED.cmd')) {
            Remove-Item -LiteralPath $shortcut -Force -ErrorAction Stop
        }
    }
}
Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction Stop
Remove-Item -LiteralPath $marker -Force -ErrorAction Stop
Write-Host 'R900 OMEGA7 MANAGED UNINSTALL PASS: only verified application files removed. User project root untouched.'

# R900 per-user OMEGA7 Windows installer: verified portable package -> managed folder.
# No administrator rights, runtime downloads, native-pairing claims, or project-data changes.
[CmdletBinding()]
param(
    [string]$InstallRoot = (Join-Path $env:LOCALAPPDATA 'OMEGA7'),
    [switch]$NoShortcut
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$source = $PSScriptRoot
$stage = $null
$backup = $null
$marker = $null
$cutover = $false
try {
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File (Join-Path $source 'Verify-OMEGA-Package.ps1') -PackageRoot $source
    if ($LASTEXITCODE -ne 0) { throw 'Source package integrity refused installation' }
    $full = [System.IO.Path]::GetFullPath($InstallRoot).TrimEnd([char[]]@('\','/'))
    $src = [System.IO.Path]::GetFullPath($source).TrimEnd([char[]]@('\','/'))
    $drive = [System.IO.Path]::GetPathRoot($full)
    if (-not $drive -or $full -eq $drive.TrimEnd([char[]]@('\','/')) -or
        $full.StartsWith('\\') -or
        $full.Equals($src,[System.StringComparison]::OrdinalIgnoreCase) -or
        $full.StartsWith($src + '\',[System.StringComparison]::OrdinalIgnoreCase) -or
        $src.StartsWith($full + '\',[System.StringComparison]::OrdinalIgnoreCase)) {
        throw 'Install target cannot be root, source or ancestor/child of the extracted package'
    }
    $parent = Split-Path -Path $full -Parent
    if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    $cursor = Get-Item -LiteralPath $parent -Force
    while ($null -ne $cursor) {
        if (($cursor.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw 'Install path contains a reparse/junction boundary'
        }
        $cursor = $cursor.Parent
    }
    $marker = $full + '.omega-install.json'
    if (Test-Path -LiteralPath $full) {
        $existing = Get-Item -LiteralPath $full -Force
        if (($existing.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw 'Existing install target is a junction or symbolic link'
        }
        if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) {
            throw 'Existing unmanaged target refuses overwrite'
        }
        $previous = Get-Content -LiteralPath $marker -Raw | ConvertFrom-Json
        if ($previous.schema -ne 'OMEGA_WINDOWS_MANAGED_INSTALL_R900' -or
            -not $previous.root.Equals($full,[System.StringComparison]::OrdinalIgnoreCase)) {
            throw 'Existing target lacks matching managed installation authority'
        }
    }
    $stage = $full + '.stage-' + [guid]::NewGuid().ToString('N')
    New-Item -ItemType Directory -Path $stage -ErrorAction Stop | Out-Null
    Get-ChildItem -LiteralPath $source -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $stage -Recurse -Force -ErrorAction Stop
    }
    & powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File (Join-Path $stage 'Verify-OMEGA-Package.ps1') -PackageRoot $stage
    if ($LASTEXITCODE -ne 0) { throw 'Staged installation differs from source package' }
    if (Test-Path -LiteralPath $full) {
        $backup = $full + '.rollback-' + [guid]::NewGuid().ToString('N')
        Move-Item -LiteralPath $full -Destination $backup -ErrorAction Stop
    }
    Move-Item -LiteralPath $stage -Destination $full -ErrorAction Stop
    $stage = $null
    $cutover = $true
    $evidence = Get-Content -LiteralPath (Join-Path $full 'OMEGA-PACKAGE-EVIDENCE.json') -Raw | ConvertFrom-Json
    $metadata = @{
        schema = 'OMEGA_WINDOWS_MANAGED_INSTALL_R900'
        root = $full
        sourceCommit = $evidence.source_commit
        installedUtc = [DateTime]::UtcNow.ToString('o')
        adminRequired = $false
        physicalPcAccepted = $false
    } | ConvertTo-Json -Depth 4
    [System.IO.File]::WriteAllText($marker,$metadata,[System.Text.Encoding]::UTF8)
    if ($backup) { Remove-Item -LiteralPath $backup -Recurse -Force -ErrorAction Stop; $backup = $null }
    if (-not $NoShortcut) {
        try {
            $programs = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'
            if (Test-Path -LiteralPath $programs -PathType Container) {
                $shortcut = Join-Path $programs 'OMEGA7 Local Studio.lnk'
                $shell = New-Object -ComObject WScript.Shell
                $link = $shell.CreateShortcut($shortcut)
                $link.TargetPath = Join-Path $full 'OPEN-OMEGA-INTEGRATED.cmd'
                $link.WorkingDirectory = $full
                $link.Description = 'OMEGA7 verified local studio and bounded worker'
                $link.Save()
            }
        } catch {
            Write-Warning 'Managed install succeeded; optional Start Menu shortcut was not created.'
        }
    }
    Write-Host ('R900 OMEGA7 MANAGED INSTALL PASS: '+$full+'; exact packaged bytes verified. Native device proof NOT asserted.')
} catch {
    if ($stage -and (Test-Path -LiteralPath $stage)) { Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue }
    if ($backup -and (Test-Path -LiteralPath $backup)) {
        if (Test-Path -LiteralPath $full) { Remove-Item -LiteralPath $full -Recurse -Force -ErrorAction SilentlyContinue }
        Move-Item -LiteralPath $backup -Destination $full -ErrorAction SilentlyContinue
    } elseif ($cutover -and $marker -and -not (Test-Path -LiteralPath $marker)) {
        # Fresh install failed before ownership receipt: undo only our own staging.
        if (Test-Path -LiteralPath $full) { Remove-Item -LiteralPath $full -Recurse -Force -ErrorAction SilentlyContinue }
    }
    throw
}

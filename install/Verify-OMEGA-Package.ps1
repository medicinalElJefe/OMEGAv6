# R897 portable OMEGA7 package integrity check. Detects accidental package drift.
# SHA-256 manifest is not a signature or external source-authentication proof.
[CmdletBinding()]
param([string]$PackageRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try {
    # A PowerShell param() default is evaluated before $PSScriptRoot is
    # reliably available in the operator's powershell.exe -File context.
    # Resolve the actual script directory only after param binding.
    if ([string]::IsNullOrWhiteSpace($PackageRoot)) {
        $PackageRoot = $PSScriptRoot
    }
    if ([string]::IsNullOrWhiteSpace($PackageRoot)) {
        throw 'Cannot resolve package script directory'
    }
    $root = (Resolve-Path -LiteralPath $PackageRoot -ErrorAction Stop).Path.TrimEnd([char[]]@('\','/'))
    if ([string]::IsNullOrWhiteSpace($root)) {
        throw 'Package path resolved to an empty root'
    }
    $manifestPath = Join-Path $root 'OMEGA-PACKAGE-EVIDENCE.json'
    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw 'Package evidence manifest missing' }
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    if ($manifest.schema -ne 'OMEGA_WINDOWS_PORTABLE_UI_R896' -or
        $manifest.hash_schema -ne 'OMEGA_WINDOWS_PACKAGE_FILES_SHA256_R897' -or
        -not ($manifest.files -is [array]) -or $manifest.files.Count -lt 5) {
        throw 'Invalid or incomplete package manifest'
    }
    $expected = @{}
    foreach ($entry in $manifest.files) {
        $rel = [string]$entry.path
        if ($rel -notmatch '^[A-Za-z0-9_.\\/-]+$' -or
            $rel.StartsWith('/') -or $rel.Contains('\') -or
            $rel -match '(^|/)\.\.?(/|$)' -or $rel.Contains(':') -or
            $rel -eq 'OMEGA-PACKAGE-EVIDENCE.json' -or
            $rel -notmatch '[^/]') {
            throw 'Unsafe package manifest path'
        }
        $key = $rel.ToLowerInvariant()
        if ($expected.ContainsKey($key)) { throw 'Duplicate package manifest path' }
        if ([string]$entry.sha256 -notmatch '^[a-f0-9]{64}$' -or
            -not ($entry.bytes -is [long] -or $entry.bytes -is [int]) -or
            $entry.bytes -lt 0) { throw 'Invalid package file receipt' }
        $expected[$key] = $entry
    }
    $actual = @(Get-ChildItem -LiteralPath $root -Recurse -File -Force)
    $all = @(Get-ChildItem -LiteralPath $root -Recurse -Force)
    foreach ($item in $all) {
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw 'Reparse or junction content is not allowed inside package'
        }
    }
    $actual = @($actual | Where-Object { $_.FullName -ne $manifestPath })
    if ($actual.Count -ne $expected.Count) { throw 'Package file count differs from manifest' }
    foreach ($file in $actual) {
        $rel = $file.FullName.Substring($root.Length + 1).Replace('\','/')
        $key = $rel.ToLowerInvariant()
        if (-not $expected.ContainsKey($key)) { throw ('Unlisted package file: ' + $rel) }
        $entry = $expected[$key]
        if ($rel -cne [string]$entry.path -or $file.Length -ne [long]$entry.bytes) {
            throw ('Package file name/length mismatch: ' + $rel)
        }
        # SHA256.Create / FileStream are built into Windows .NET. They do
        # not depend on PSModulePath, Get-FileHash module discovery, network
        # access, profile scripts, or a separately installed runtime.
        $sha = [System.Security.Cryptography.SHA256]::Create()
        $stream = $null
        try {
            $stream = [System.IO.File]::OpenRead($file.FullName)
            $digest = [System.BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '').ToLowerInvariant()
        } finally {
            if ($null -ne $stream) { $stream.Dispose() }
            $sha.Dispose()
        }
        if ($digest -cne [string]$entry.sha256) {
            throw ('Package file SHA-256 mismatch: ' + $rel)
        }
    }
    Write-Host ('OMEGA PACKAGE VERIFY PASS: ' + $actual.Count + ' exact files, SHA-256 matched. Not signed provenance.')
    exit 0
} catch {
    Write-Error ('OMEGA PACKAGE VERIFY HELD: ' + $_.Exception.Message)
    exit 1
}

# R897 portable OMEGA7 package integrity check. Detects accidental package drift.
# SHA-256 manifest is not a signature or external source-authentication proof.
[CmdletBinding()]
param([string]$PackageRoot = $PSScriptRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try {
    $root = (Resolve-Path -LiteralPath $PackageRoot -ErrorAction Stop).Path.TrimEnd([char[]]@('\','/'))
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
            $rel.StartsWith('/') -or $rel.Contains('\\') -or
            $rel -match '(^|/)\\.\\.?(/|$)' -or $rel.Contains(':') -or
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
        $rel = $file.FullName.Substring($root.Length + 1).Replace('\\','/')
        $key = $rel.ToLowerInvariant()
        if (-not $expected.ContainsKey($key)) { throw ('Unlisted package file: ' + $rel) }
        $entry = $expected[$key]
        if ($rel -cne [string]$entry.path -or $file.Length -ne [long]$entry.bytes) {
            throw ('Package file name/length mismatch: ' + $rel)
        }
        if ((Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$entry.sha256) {
            throw ('Package file SHA-256 mismatch: ' + $rel)
        }
    }
    Write-Host ('OMEGA PACKAGE VERIFY PASS: ' + $actual.Count + ' exact files, SHA-256 matched. Not signed provenance.')
    exit 0
} catch {
    Write-Error ('OMEGA PACKAGE VERIFY HELD: ' + $_.Exception.Message)
    exit 1
}

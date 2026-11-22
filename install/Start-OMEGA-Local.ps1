# OMEGA portable Windows UI server — loopback-only and read-only.
# No Node, Python, Git, admin rights, installation, or cloud pairing required on the end-user PC.
[CmdletBinding()]
param(
    [string] $SiteRoot = (Join-Path $PSScriptRoot 'dist'),
    [switch] $NoBrowser,
    [string] $ReadyFile
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $SiteRoot -PathType Container)) {
    throw 'OMEGA application files are missing. Extract the complete portable ZIP before launching.'
}
$root = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $SiteRoot).Path).TrimEnd([char[]]@('\','/'))
$rootPrefix = $root + [System.IO.Path]::DirectorySeparatorChar
if (-not (Test-Path -LiteralPath (Join-Path $root 'index.html') -PathType Leaf)) {
    throw 'OMEGA built entry file is missing from dist. Use a complete verified portable package.'
}

function Get-OmegaMime([string]$file) {
    switch ([System.IO.Path]::GetExtension($file).ToLowerInvariant()) {
        '.html' { return 'text/html; charset=utf-8' }
        '.js' { return 'text/javascript; charset=utf-8' }
        '.mjs' { return 'text/javascript; charset=utf-8' }
        '.css' { return 'text/css; charset=utf-8' }
        '.json' { return 'application/json; charset=utf-8' }
        '.svg' { return 'image/svg+xml' }
        '.png' { return 'image/png' }
        '.jpg' { return 'image/jpeg' }
        '.jpeg' { return 'image/jpeg' }
        '.webp' { return 'image/webp' }
        '.gif' { return 'image/gif' }
        '.ico' { return 'image/x-icon' }
        '.wasm' { return 'application/wasm' }
        '.woff' { return 'font/woff' }
        '.woff2' { return 'font/woff2' }
        '.ttf' { return 'font/ttf' }
        '.txt' { return 'text/plain; charset=utf-8' }
        '.xml' { return 'application/xml; charset=utf-8' }
        '.pdf' { return 'application/pdf' }
        default { return 'application/octet-stream' }
    }
}

function Send-OmegaResponse($stream,[int]$code,[string]$reason,[string]$mime,[byte[]]$body,[bool]$headOnly) {
    $headers = "HTTP/1.1 $code $reason`r`nContent-Type: $mime`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nCache-Control: no-store`r`nX-Content-Type-Options: nosniff`r`nX-Frame-Options: DENY`r`nReferrer-Policy: no-referrer`r`n`r`n"
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
    $stream.Write($bytes,0,$bytes.Length)
    if (-not $headOnly -and $body.Length -gt 0) { $stream.Write($body,0,$body.Length) }
    $stream.Flush()
}
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,0)
$listener.Start()
try {
    $port = ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
    $url = "http://127.0.0.1:$port/"
    if ($ReadyFile) {
        $readyPath = [System.IO.Path]::GetFullPath($ReadyFile)
        [System.IO.File]::WriteAllText($readyPath,$url,[System.Text.Encoding]::ASCII)
    }
    Write-Host 'OMEGA LOCAL STUDIO' -ForegroundColor Cyan
    Write-Host "Opening $url"
    Write-Host 'Browser UI is local. Cloud AI, Worker jobs, and authenticated PC control require separate connected services.'
    Write-Host 'Close this window to stop the local studio.'
    if (-not $NoBrowser) { Start-Process $url | Out-Null }
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $client.ReceiveTimeout = 6000
            $client.SendTimeout = 6000
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream,[System.Text.Encoding]::ASCII,$false,1024,$true)
            $requestLine = $reader.ReadLine()
            if (-not $requestLine -or $requestLine.Length -gt 4096) { continue }
            $headersRead = 0
            do {
                $line = $reader.ReadLine()
                if ($null -eq $line) { break }
                $headersRead += $line.Length
                if ($headersRead -gt 16384) { break }
            } while ($line.Length -gt 0)
            if ($headersRead -gt 16384) { continue }
            if ($requestLine -notmatch '^(GET|HEAD) (/[^ ]*) HTTP/1\.[01]$') {
                Send-OmegaResponse $stream 405 'Method Not Allowed' 'text/plain' ([System.Text.Encoding]::UTF8.GetBytes('GET and HEAD only')) $false
                continue
            }
            $isHead = $matches[1] -eq 'HEAD'
            $rawPath = ($matches[2] -split '[?#]',2)[0]
            try { $decoded = [System.Uri]::UnescapeDataString($rawPath) } catch { $decoded = '' }
            if (-not $decoded.StartsWith('/') -or $decoded.Contains('\') -or $decoded.Contains([char]0) -or
                $decoded -match '(^|/)\.\.?(/|$)' -or $decoded -match '[\x00-\x1f:]') {
                Send-OmegaResponse $stream 403 'Forbidden' 'text/plain' ([System.Text.Encoding]::UTF8.GetBytes('Forbidden path')) $isHead
                continue
            }
            if ($decoded -match '^/(api|admin|internal)(/|$)') {
                Send-OmegaResponse $stream 503 'Service Unavailable' 'application/json' ([System.Text.Encoding]::UTF8.GetBytes('{"status":"CLOUD_SERVICE_NOT_AVAILABLE_LOCALLY"}')) $isHead
                continue
            }
            $relative = $decoded.TrimStart('/')
            if (-not $relative) { $relative = 'index.html' }
            $candidate = [System.IO.Path]::GetFullPath((Join-Path $root $relative))
            if (-not $candidate.StartsWith($rootPrefix,[System.StringComparison]::OrdinalIgnoreCase)) {
                Send-OmegaResponse $stream 403 'Forbidden' 'text/plain' ([System.Text.Encoding]::UTF8.GetBytes('Forbidden path')) $isHead
                continue
            }
            if (-not [System.IO.File]::Exists($candidate)) {
                if ($relative -notmatch '\.[^/]+$') { $candidate = Join-Path $root 'index.html' }
                else {
                    Send-OmegaResponse $stream 404 'Not Found' 'text/plain' ([System.Text.Encoding]::UTF8.GetBytes('Not found')) $isHead
                    continue
                }
            }
            $body = [System.IO.File]::ReadAllBytes($candidate)
            Send-OmegaResponse $stream 200 'OK' (Get-OmegaMime $candidate) $body $isHead
        } catch {
            Write-Warning ('Local request refused: ' + $_.Exception.Message)
        } finally {
            if ($null -ne $client) { $client.Close() }
        }
    }
} finally {
    $listener.Stop()
    if ($ReadyFile -and (Test-Path -LiteralPath $ReadyFile)) { Remove-Item -LiteralPath $ReadyFile -Force }
}

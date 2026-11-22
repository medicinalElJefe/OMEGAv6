import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const server=readFileSync('install/Start-OMEGA-Local.ps1','utf8');
const launch=readFileSync('install/OPEN-OMEGA.cmd','utf8');
const smoke=readFileSync('tests/r896-windows-local-studio-smoke.ps1','utf8');
for(const key of [
 '[System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,0)',
 'Get-OmegaMime','Send-OmegaResponse','[switch] $NoBrowser','ReadyFile',
 "CLOUD_SERVICE_NOT_AVAILABLE_LOCALLY","'index.html'","Method Not Allowed",
 'Forbidden path','Forbidden reparse path','ReparsePoint','Not found','GetFullPath','Content-Length','X-Content-Type-Options'
])assert.ok(server.includes(key),'R896 local server contract missing: '+key);
assert.ok(!server.includes('0.0.0.0'),'R896 must not accept public TCP binding');
assert.ok(!server.includes('HttpListener'),'R896 should not require administrator URLACL');
assert.ok(!server.includes("[string] $SiteRoot = (Join-Path $PSScriptRoot"),'R896 must not resolve PSScriptRoot before PowerShell parameter binding');
assert.ok(server.includes("if (-not $SiteRoot) { $SiteRoot = Join-Path $PSScriptRoot 'dist' }"),'R896 must choose packaged dist after PowerShell parameter binding');

assert.ok(server.includes("HTTP/1\\.[01]$')"),'R896 request parser regex must retain its literal closing dollar and quote');
assert.ok(server.includes('$rawPath = ($requestMatch.Groups[2].Value'),'R896 request parser must preserve exact captured path');
assert.equal(server.split('try { $decoded = [System.Uri]::UnescapeDataString').length,2,'R896 must contain exactly one intact URI decode block');
assert.equal(server.split('$requestMatch = [System.Text.RegularExpressions.Regex]::Match').length,2,'R896 must contain exactly one intact HTTP request parser');

assert.ok(launch.includes('Start-OMEGA-Local.ps1'),'R896 must be double-click launchable');
assert.ok(launch.includes('Verify-OMEGA-Package.ps1')&&launch.includes('if errorlevel 1'),'R897 startup must fail closed when package integrity is not verified');
const verify=readFileSync('install/Verify-OMEGA-Package.ps1','utf8');
assert.ok(verify.includes(String.raw`.Replace('\\','/')`),'R897 must normalize a single Windows path separator');
assert.ok(!verify.includes(String.raw`.Replace('\\\\','/')`),'R897 must not require doubled Windows backslashes');
for(const key of ['OMEGA_WINDOWS_PACKAGE_FILES_SHA256_R897','Get-FileHash','SHA256','ReparsePoint','Package file count differs','Duplicate package manifest path'])
 assert.ok(verify.includes(key),'R897 manifest integrity guard missing: '+key);
const workflow=readFileSync('.github/workflows/ci.yml','utf8');
for(const key of ['hash_schema = \'OMEGA_WINDOWS_PACKAGE_FILES_SHA256_R897\'','Verify-OMEGA-Package.ps1','hash_authentication_signature = $false'])
 assert.ok(workflow.includes(key),'R897 package assembly and evidence contract missing: '+key);

for(const key of ['Invoke-WebRequest','Start-Process','127','api/health','StatusCode -eq 503','StatusCode -eq 404','ItemType Junction','StatusCode -eq 403','Stop-Process'])
 assert.ok(smoke.includes(key),'R896 Windows smoke contract missing: '+key);
console.log('R896 LOCAL STUDIO PASS: read-only loopback-only, SPA fallback, unavailable APIs, no-runtime double-click and real Windows smoke contracts.');

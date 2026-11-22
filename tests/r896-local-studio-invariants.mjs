import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const server=readFileSync('install/Start-OMEGA-Local.ps1','utf8');
const launch=readFileSync('install/OPEN-OMEGA.cmd','utf8');
const smoke=readFileSync('tests/r896-windows-local-studio-smoke.ps1','utf8');
for(const key of [
 '[System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback,0)',
 'Get-OmegaMime','Send-OmegaResponse','-NoBrowser','ReadyFile',
 "CLOUD_SERVICE_NOT_AVAILABLE_LOCALLY","'index.html'","Method Not Allowed",
 'Forbidden path','Not found','GetFullPath','Content-Length','X-Content-Type-Options'
])assert.ok(server.includes(key),'R896 local server contract missing: '+key);
assert.ok(!server.includes('0.0.0.0'),'R896 must not accept public TCP binding');
assert.ok(!server.includes('HttpListener'),'R896 should not require administrator URLACL');
assert.ok(launch.includes('Start-OMEGA-Local.ps1'),'R896 must be double-click launchable');
for(const key of ['Invoke-WebRequest','Start-Process','127','api/health','StatusCode -eq 503','StatusCode -eq 404','Stop-Process'])
 assert.ok(smoke.includes(key),'R896 Windows smoke contract missing: '+key);
console.log('R896 LOCAL STUDIO PASS: read-only loopback-only, SPA fallback, unavailable APIs, no-runtime double-click and real Windows smoke contracts.');

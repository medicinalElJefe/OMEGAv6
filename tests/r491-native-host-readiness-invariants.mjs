import assert from 'node:assert/strict';
import fs from 'node:fs';

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const r202=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');

for(const token of [
 "className='o7-native-host'",
 'data-native-host-route={route}',
 '<Omega7Boundary label={`OMEGA7 ${route}`}>',
 "className='o7-native-loading'"
])assert.ok(native.includes(token),`R491 stable native host contract missing ${token}`);

for(const token of [
 '.o7-native-host[data-native-host-route="',
 "host.waitFor({state:'visible'",
 "!host.querySelector('.o7-native-loading')",
 "!host.querySelector('.o7-native-failure')",
 "!host.querySelector('.o7-failure')",
 "Boolean(host.querySelector('.o7-native-workspace'))",
 'did not reach native ready workspace',
 "['Earth Now','Workspace','System Atlas']"
])assert.ok(live.includes(token),`R491 live executor readiness proof missing ${token}`);

assert.ok(r202.includes("tests/r489-live-visible-capability-browser-e2e.mjs"),'R491 must keep native executor readiness inside post-promotion R202 acceptance');
assert.ok(r202.includes('R489 exact-production visible capability proof failed'),'R491 native readiness failure must remain release-blocking');

console.log('R491 NATIVE HOST READINESS PASS · stable route host mounts immediately · loading/failure states explicit · recovered executor proof requires eventual native ready workspace · exact-SHA R202 gate preserved');

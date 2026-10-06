import assert from 'node:assert/strict';
import fs from 'node:fs';

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const local=fs.readFileSync('tests/r496-local-omega7-candidate-browser-e2e.mjs','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const coherence=fs.readFileSync('scripts/verify_omega7_asset_coherence_r491.mjs','utf8');
const convergence=fs.readFileSync('scripts/verify_promotion_convergence_r491.mjs','utf8');
const r202=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');

assert.equal((root.match(/className='o7-native-host'/g)||[]).length,1,'R491 must preserve exactly one accepted outer native host');
assert.ok(root.includes("className='o7-native-host' data-native-host-route={state.selectedRoute}"),'R491 outer native host must carry exact route identity');
assert.equal((native.match(/className='o7-native-host'/g)||[]).length,0,'R491 native surface must not create a competing host');
assert.ok(native.includes('<Omega7Boundary label={`OMEGA7 ${route}`}>')&&native.includes("className='o7-native-loading'"),'R491 must preserve lazy boundary/loading truth state');

for(const token of [
 "'Cloudflare-Workers-Version-Key'",
 "'Cloudflare-Workers-Version-Overrides'",
 '.o7-native-host[data-native-host-route="',
 "host?.querySelector('.o7-native-workspace,.o7-native-failure,.o7-failure')",
 'never reached a terminal native state',
 'assetFailures=',
 'requestFailures=',
 'boundaryErrors=',
 "if(route==='Earth Now')",
 "['Earth Now','Workspace','System Atlas']"
])assert.ok(live.includes(token),`R491 live executor/asset proof missing ${token}`);

for(const token of [
 'node tests/r496-local-omega7-candidate-browser-e2e.mjs',
 'verify_promotion_convergence_r491.mjs',
 'verify_omega7_asset_coherence_r491.mjs promoted'
])assert.ok(staged.includes(token),`R491/R496 release gate missing ${token}`);
assert.ok(!staged.includes('verify_omega7_asset_coherence_r491.mjs staged'),'0%-traffic release path must not claim version override owns canonical static assets');
assert.ok(local.includes('OMEGA_GOVERNED_BUILD_RECEIPT_V1')&&local.includes('data-r495-operational-truth'),'local package proof must bind exact receipt and canonical OMEGA7 Home before upload');

for(const token of [
 "['staged','promoted']",
 'OMEGA_VERSION_AFFINITY_KEY',
 'tests/r489-live-visible-capability-browser-e2e.mjs',
 'R491 ${phase.toUpperCase()} OMEGA7 ASSET COHERENCE PASS'
])assert.ok(coherence.includes(token),`R491 asset coherence wrapper missing ${token}`);

for(const token of [
 'wrangler',
 'deployments',
 'status',
 'rows.length===1',
 'rows[0].id===candidate',
 'rows[0].pct>=99.999',
 'R491 PROMOTION CONVERGENCE PASS'
])assert.ok(convergence.includes(token),`R491 promotion convergence verifier missing ${token}`);

assert.ok(r202.includes("tests/r489-live-visible-capability-browser-e2e.mjs"),'R491 must keep visible/native proof inside post-promotion R202 acceptance');
assert.ok(r202.includes('R489 exact-production visible capability proof failed'),'R491 post-promotion visible failure must remain release-blocking');

console.log('R491/R496 NATIVE ASSET COHERENCE PASS · one native host · exact package browser proof before upload · no false staged ASSETS claim · sole-100% promotion convergence · promoted visible/executor proof · R202 authority retained');

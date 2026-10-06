import assert from 'node:assert/strict';
import fs from 'node:fs';

const generator=fs.readFileSync('scripts/generate_bridge_continuity_r499.mjs','utf8');
const verifier=fs.readFileSync('scripts/verify_promoted_bridge_continuity_r499.mjs','utf8');
const browser=fs.readFileSync('tests/r499-sequential-bridge-browser-e2e.mjs','utf8');
const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of [
 'OMEGA_BRIDGE_CONTINUITY_R499',
 'CANONICAL_OMEGA7',
 'BRIDGE_INTENT',
 'BRIDGE_DEPENDENCY_GRAPH',
 'BRIDGE_ASSET_CONVERGENCE',
 'OMEGA6_HOME',
 'OMEGA6_WORKSTATION',
 'LIVE_ROUTE_PROOF',
 'OmegaHomeR71',
 'OmegaWorkstationFullV2',
 'BRIDGE_ROOT',
 'BRIDGE_DEPENDENCY',
 'canonicalMutation:false'
])assert.ok(generator.includes(token),`R499 generator missing ${token}`);

assert.ok(generator.includes("createHash('sha256')"),'R499 manifest must hash exact deferred assets');
assert.ok(generator.includes('while(queue.length)'),'R499 must compute a dependency closure, not only two root filenames');
assert.ok(pkg.scripts.build.includes('generate_bridge_continuity_r499.mjs'),'R499 bridge manifest must be part of every production build');

for(const token of [
 'OMEGA_R499_BRIDGE_ATTEMPTS',
 'OMEGA_R499_BRIDGE_DELAY_MS',
 'manifestSha256',
 'asset.sha256',
 "'cache-control':'no-cache'",
 "'pragma':'no-cache'",
 "'accept-encoding':'identity'",
 'R499 BRIDGE ASSET CONVERGENCE PASS',
 'did not converge'
])assert.ok(verifier.includes(token),`R499 verifier missing ${token}`);
assert.ok(!verifier.includes('Cloudflare-Workers-Version-Overrides'),'R499 promoted bridge proof must use canonical ordinary routing');

for(const token of [
 "OMEGA_R499_BROWSER_ATTEMPTS||'20'",
 "OMEGA_R499_BROWSER_DELAY_MS||'1000'",
 '?r499-browser=${Date.now()}-${label}-${attempt}',
 "cache:'no-store'",
 'source===expected&&promoted===expected',
 'marker>0&&laneReceipt.exact',
 'R499 R489 BROWSER EDGE PASS',
 'did not converge to exact promoted shell within bounded window'
])assert.ok(live.includes(token),`R499 promoted OMEGA7 browser-edge convergence missing ${token}`);
assert.ok(live.includes("extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache',...overrideHeaders}"),'R499 OMEGA7 browser context must request no-cache canonical assets');
assert.ok(live.indexOf('R499 R489 BROWSER EDGE PASS')<live.indexOf("await operational.waitFor({state:'visible',timeout:5000})"),'R499 exact promoted-shell convergence must precede R495 operational acceptance');
for(const token of [
 "?omega7=1&r499-canonical",
 ".o7-v6",
 "main.r71-home",
 "omega7.enabled",
 "omega.v6.address",
 "?omega7=1&r499-reentry",
 "?omega6=1&r499-oneshot",
 "R499 SEQUENTIAL BRIDGE BROWSER PASS"
])assert.ok(browser.includes(token),`R499 browser transition proof missing ${token}`);

const r497=staged.indexOf('verify_promoted_asset_convergence_r497.mjs');
const r489=staged.indexOf('verify_omega7_asset_coherence_r491.mjs promoted');
const r499Assets=staged.indexOf('verify_promoted_bridge_continuity_r499.mjs');
const r499Browser=staged.indexOf('r499-sequential-bridge-browser-e2e.mjs');
const release=staged.indexOf('OMEGA RELEASE PASS');
assert.ok(r497>=0&&r489>r497&&r499Assets>r489&&r499Browser>r499Assets&&release>r499Browser,
 'R499 continuity order must be entry convergence -> exact OMEGA7 browser lane -> OMEGA7 proof -> bridge dependency convergence -> reversible bridge proof -> release acceptance');

assert.equal(pkg.scripts['test:r499'],'node tests/r499-sequential-bridge-continuity-invariants.mjs');
assert.ok(pkg.scripts.check.includes('npm run test:r498 && npm run test:r499'),'R499 must remain release-blocking after R498');

console.log('R499 SEQUENTIAL BRIDGE CONTINUITY PASS · receipt → entry assets → exact OMEGA7 browser edge → OMEGA7 live proof → bridge dependency graph → exact bridge assets → reversible OMEGA7↔OMEGA6 transition → downstream deep-route proof');

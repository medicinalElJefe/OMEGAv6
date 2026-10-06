import assert from 'node:assert/strict';
import fs from 'node:fs';

const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of [
 "OMEGA_R499_BROWSER_ATTEMPTS||'20'",
 "OMEGA_R499_BROWSER_DELAY_MS||'1000'",
 "?r499-browser=${Date.now()}-${label}-${attempt}",
 "cache:'no-store'",
 "source===expected&&promoted===expected",
 "marker>0&&laneReceipt.exact",
 "R499 R489 BROWSER EDGE PASS",
 "did not converge to exact promoted shell within bounded window"
])assert.ok(live.includes(token),`R499 browser convergence missing ${token}`);

assert.ok(live.includes("extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache',...overrideHeaders}"),'R499 browser context must request no-cache canonical assets');
assert.ok(live.indexOf('R499 R489 BROWSER EDGE PASS')<live.indexOf("await operational.waitFor({state:'visible',timeout:5000})"),'R499 convergence must precede R495 operational-surface acceptance');
assert.ok(staged.indexOf('verify_promoted_asset_convergence_r497.mjs')<staged.indexOf('verify_omega7_asset_coherence_r491.mjs promoted'),'R497 Node-side asset convergence must remain upstream of R489/R499 browser convergence');
assert.equal(pkg.scripts['test:r499'],'node tests/r499-r489-browser-edge-convergence-invariants.mjs');
assert.ok(pkg.scripts.check.includes('npm run test:r498 && npm run test:r499'),'R499 must remain release-blocking after R498');

console.log('R499 R489 BROWSER EDGE CONVERGENCE PASS · each desktop/mobile browser lane cache-busts canonical navigation · requires exact in-page receipt + R495 promoted-shell marker · bounded retry only · R493/R497/R498 truth gates preserved');

import assert from 'node:assert/strict';
import fs from 'node:fs';

const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of [
 "OMEGA_R498_RECEIPT_ATTEMPTS||'30'",
 "OMEGA_R498_RECEIPT_DELAY_MS||'1000'",
 "'cache-control':'no-cache'",
 "'pragma':'no-cache'",
 "'accept-encoding':'identity'",
 "?r489=${Date.now()}-${attempt}",
 "R498 R489 EDGE RECEIPT PASS",
 "exact promoted receipt did not converge within bounded window"
])assert.ok(live.includes(token),`R498 R489 convergence missing ${token}`);

assert.ok(live.includes("source===expectedSha&&promoted===expectedSha"),'R498 must retain exact source + promoted SHA equality');
assert.ok(!live.includes("source===expectedSha||promoted===expectedSha"),'R498 must not weaken exact-SHA truth to either/or');
assert.ok(staged.indexOf('verify_promoted_asset_convergence_r497.mjs')<staged.indexOf('verify_omega7_asset_coherence_r491.mjs promoted'),'R497 entry-asset convergence must still precede R489/R498');
assert.equal(pkg.scripts['test:r498'],'node tests/r498-r489-edge-receipt-convergence-invariants.mjs');
assert.ok(pkg.scripts.check.includes('npm run test:r497 && npm run test:r498'),'R498 must be release-blocking after R497');

console.log('R498 R489 EDGE RECEIPT CONVERGENCE PASS · bounded cache-busted exact-SHA wait on the same browser-proof lane · source + promoted merge SHA both required · R497 asset gate remains upstream');

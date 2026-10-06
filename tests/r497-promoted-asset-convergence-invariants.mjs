import assert from 'node:assert/strict';
import fs from 'node:fs';

const proof=fs.readFileSync('scripts/verify_promoted_asset_convergence_r497.mjs','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const r491=fs.readFileSync('tests/r491-native-host-readiness-invariants.mjs','utf8');
const policy=JSON.parse(fs.readFileSync('public/omega-r240-recursive-exact-self-promotion.json','utf8'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of [
 "readFileSync('dist/index.html','utf8')",
 "startsWith('/assets/')",
 "createHash('sha256')",
 "OMEGA_R497_ASSET_ATTEMPTS||'40'",
 "OMEGA_R497_ASSET_DELAY_MS||'3000'",
 "'cache-control':'no-cache'",
 "'pragma':'no-cache'",
 "'accept-encoding':'identity'",
 "R497 PROMOTED ASSET CONVERGENCE PASS",
 "R497 promoted asset convergence timeout"
])assert.ok(proof.includes(token),`R497 promoted asset verifier missing ${token}`);

assert.ok(!proof.includes('Cloudflare-Workers-Version-Overrides'),'R497 canonical promoted asset proof must use ordinary public routing, not version override');
assert.ok(proof.includes('expectedAssets')&&proof.includes('hashMismatches'),'R497 must compare canonical root-entry asset bytes against exact promoted dist');

const receipt=staged.indexOf('verify_promotion_convergence_r491.mjs');
const assets=staged.indexOf('verify_promoted_asset_convergence_r497.mjs');
const browser=staged.indexOf('verify_omega7_asset_coherence_r491.mjs promoted');
assert.ok(receipt>=0&&assets>receipt&&browser>assets,'R497 release order must be receipt convergence -> exact entry-asset byte convergence -> promoted OMEGA7/R489 browser proof');
assert.ok(!staged.includes('verify_omega7_asset_coherence_r491.mjs staged'),'R497 must preserve R496 no-false-staged-ASSETS boundary');

assert.ok(r491.includes('verify_promoted_asset_convergence_r497.mjs'),'R491 invariant must bind R497 before promoted browser coherence');
assert.equal(policy.deployment.postPromotionEntryAssetByteConvergenceRequired,true);
assert.equal(policy.deployment.postPromotionEntryAssetByteConvergenceRevision,'R497');
assert.match(policy.truthBoundary,/entry-asset byte convergence/i);
assert.equal(pkg.scripts['test:r497'],'node tests/r497-promoted-asset-convergence-invariants.mjs');
assert.ok(pkg.scripts.check.includes('npm run test:r496 && npm run test:r497'),'R497 must remain release-blocking after R496');

console.log('R497 PROMOTED ASSET CONVERGENCE PASS · exact root entry refs + SHA-256 bytes converge before promoted R491/R489 browser proof · bounded edge wait · no version-override asset claim · R496 staged boundary preserved');

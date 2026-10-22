import assert from 'node:assert/strict';
import fs from 'node:fs';

const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const verifier=fs.readFileSync('scripts/verify_staged_release.mjs','utf8');
const local=fs.readFileSync('tests/r496-local-omega7-candidate-browser-e2e.mjs','utf8');
const policy=JSON.parse(fs.readFileSync('public/omega-r240-recursive-exact-self-promotion.json','utf8'));

const localProof=staged.indexOf('node tests/r496-local-omega7-candidate-browser-e2e.mjs');
const upload=staged.indexOf('npx wrangler versions upload');
const overrideProof=staged.indexOf('node scripts/verify_staged_release.mjs');
const promotion=staged.indexOf('"${CANDIDATE_VERSION_ID}@100%"',overrideProof);
const convergence=staged.indexOf('verify_promotion_convergence_r491.mjs');
const promotedAssets=staged.indexOf('verify_omega7_asset_coherence_r491.mjs promoted');

assert.ok(localProof>=0&&upload>localProof,'R496 must browser-prove exact packaged assets before candidate upload');
assert.ok(overrideProof>upload,'R496 Worker override semantics must run only after candidate upload/admission');
assert.ok(promotion>overrideProof,'R496 normal promotion must follow exact Worker semantic proof');
assert.ok(convergence>promotion&&promotedAssets>convergence,'R496 canonical asset receipt/graph proof must follow promotion convergence');
assert.ok(staged.includes('http://127.0.0.1:4173'),'R496 packaged browser proof must use the exact local dist preview');
assert.ok(staged.includes('LOCAL_PREVIEW_PID'),'R496 local proof process must be bounded and cleaned up');
assert.ok(!staged.includes('verify_omega7_asset_coherence_r491.mjs staged'),'R496 release path must not claim staged Worker version affinity proves canonical static assets');
assert.ok(!/OMEGA_WORKER_VERSION_ID="\$CANDIDATE_VERSION_ID"[^\n]*tests\/r200-current-browser-proof-e2e\.mjs/.test(staged),'R496 must not run remote staged R200 against production-owned ASSETS');

assert.ok(verifier.includes("readFileSync('dist/omega-build-receipt.json','utf8')"),'R496 staged semantic proof must bind exact packaged receipt locally');
assert.ok(!verifier.includes('/omega-build-receipt.json?staged='),'R496 staged semantic proof must not require candidate identity from canonical production assets');
assert.ok(verifier.includes('Cloudflare-Workers-Version-Overrides'),'R496 Worker semantics must remain exact-version override proof');

for(const token of ['OMEGA_GOVERNED_BUILD_RECEIPT_V1','.o7-app[data-omega7="true"]','.o7-operational-truth[data-r495-operational-truth="true"]','Refresh','desktop','mobile'])assert.ok(local.includes(token),`R496 local browser proof missing ${token}`);

assert.equal(policy.deployment.assetProofBoundaryRevision,'R496');
assert.equal(policy.deployment.exactPackagedBrowserProofRequiredBeforePromotion,true);
assert.equal(policy.deployment.versionOverrideBrowserProofRequiredBeforePromotion,false);
assert.equal(policy.deployment.versionOverrideStaticAssetProofSupported,false);
assert.equal(policy.deployment.postPromotionCanonicalAssetProofRequired,true);
assert.match(policy.truthBoundary,/version override is authoritative for Worker code semantics but not for the canonical ASSETS binding/i);

console.log('R496 STAGED ASSET TRUTH BOUNDARY PASS · exact dist receipt/browser proof before upload · 0%-traffic override proves Worker semantics only · canonical static receipt and OMEGA7 asset graph remain post-promotion proof · no false candidate-ASSETS attribution');

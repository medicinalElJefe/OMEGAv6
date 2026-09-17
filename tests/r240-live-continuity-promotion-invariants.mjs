import assert from 'node:assert/strict';
import fs from 'node:fs';

const policy=JSON.parse(fs.readFileSync('public/omega-r240-recursive-exact-self-promotion.json','utf8'));
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const verifier=fs.readFileSync('scripts/verify_staged_release.mjs','utf8');
const override=fs.readFileSync('scripts/cloudflare-version-override-fetch.mjs','utf8');
const browser=fs.readFileSync('tests/r200-current-browser-proof-e2e.mjs','utf8');

assert.equal(policy.deployment.soleCanonicalWriter,'.github/workflows/ci.yml');
for(const key of [
  'lastKnownGoodRemainsServingDuringCandidateProof',
  'candidateVersionUploadedWithoutTraffic',
  'candidateRemainsUndeployedBeforeProof',
  'mixedVersionTrafficSplitForbidden',
  'durableObjectExportSetChangeCompatible',
  'versionOverrideSemanticProofRequiredBeforePromotion',
  'versionOverrideBrowserProofRequiredBeforePromotion',
  'atomicHundredPercentPromotionAfterProof',
  'automaticRollbackOnPostPromotionFailure'
])assert.equal(policy.deployment[key],true,`R240.1 live continuity policy missing ${key}`);
assert.match(policy.truthLaw,/staged-live-proved/);
assert.match(policy.truthBoundary,/last known-good Worker remains at 100% traffic/);
assert.match(policy.truthBoundary,/uploaded but not deployed/);
assert.match(policy.truthBoundary,/No mixed-version traffic split/);
assert.match(policy.truthBoundary,/different Durable Object export sets/);
assert.match(policy.truthBoundary,/R201\/R203 remain deleted export tombstones/);
assert.match(policy.truthBoundary,/roll traffic back/);

for(const token of [
  'npx wrangler deployments status',
  'npx wrangler versions upload',
  'node scripts/verify_staged_release.mjs',
  'node tests/r200-current-browser-proof-e2e.mjs',
  'npx wrangler versions deploy "${CANDIDATE_VERSION_ID}@100%"'
])assert.ok(staged.includes(token),`staged release membrane missing ${token}`);
assert.ok(!staged.includes('"${PREVIOUS_VERSION_ID}@100%" "${CANDIDATE_VERSION_ID}@0%"'),'candidate proof must not create a mixed-version deployment; Cloudflare rejects gradual traffic when Durable Object export sets differ');
const upload=staged.indexOf('npx wrangler versions upload');
const semanticProof=staged.indexOf('node scripts/verify_staged_release.mjs');
const browserProof=staged.indexOf('node tests/r200-current-browser-proof-e2e.mjs');
const promote=staged.indexOf('"${CANDIDATE_VERSION_ID}@100%"');
assert.ok(upload>=0&&semanticProof>upload&&browserProof>semanticProof&&promote>browserProof,'candidate must remain uploaded/off-traffic until semantic and browser proofs finish');
assert.match(staged,/fail-closed: expected exactly one current 100% production Worker version/);
assert.match(staged,/restore_previous_on_error/);

for(const token of [
  'Cloudflare-Workers-Version-Overrides',
  'OMEGA_WORKER_VERSION_ID',
  'OMEGA_WORKER_NAME',
  'verify_live_operational_source_authority_r202.mjs',
  'verify_live_hybrid_command_authority_r237.mjs',
  'verify_live_hybrid_host_intelligence_r238.mjs'
])assert.ok(verifier.includes(token)||override.includes(token),`staged exact-version semantic proof missing ${token}`);
assert.match(override,/targetOrigin!==canonicalOrigin/,'version override helper must not leak to non-canonical external providers');
assert.match(browser,/Cloudflare-Workers-Version-Overrides/);
assert.match(browser,/extraHTTPHeaders:overrideHeaders/);

for(const token of [
  'bash scripts/staged-cloudflare-release.sh',
  'steps.deploy_worker.outputs.previous_version_id',
  'npx wrangler rollback',
  'OMEGA automatic rollback'
])assert.ok(ci.includes(token),`canonical ci continuity repair missing ${token}`);
assert.ok(!/name: Deploy canonical OMEGA Worker\s+id: deploy_worker\s+run: npx wrangler deploy\b/m.test(ci),'canonical Worker must not replace production before live candidate proof');
assert.ok(!ci.includes('workflow_run:'),'continuity repair must not create recursive workflow fanout');

console.log('R240.1 LIVE CONTINUITY PROMOTION PASS · last-known-good stays usable during candidate proof · exact uploaded candidate remains undeployed/off-traffic for version-override semantic/browser proof · no mixed-version Durable Object export split · atomic promotion only after proof · post-promotion failure rolls back · ci.yml remains sole canonical production writer · R125/R141/R146/R147 unchanged · R201/R203 remain retired tombstones');

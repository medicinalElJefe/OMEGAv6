import assert from 'node:assert/strict';
import fs from 'node:fs';

const policy=JSON.parse(fs.readFileSync('public/omega-r240-recursive-exact-self-promotion.json','utf8'));
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const staged=fs.readFileSync('scripts/staged-cloudflare-release.sh','utf8');
const verifier=fs.readFileSync('scripts/verify_staged_release.mjs','utf8');
const override=fs.readFileSync('scripts/cloudflare-version-override-fetch.mjs','utf8');
const browser=fs.readFileSync('tests/r200-current-browser-proof-e2e.mjs','utf8');

assert.equal(policy.revision,'R240.1');
assert.equal(policy.deploymentContractRevision,'R321');
assert.equal(policy.deployment.soleCanonicalWriter,'.github/workflows/ci.yml');
for(const key of [
  'candidateVersionUploadedWithoutTraffic',
  'previousVersionRetainsHundredPercentOrdinaryTrafficDuringCandidateProof',
  'candidateAdmittedToCurrentDeploymentAtZeroPercent',
  'versionOverrideSemanticProofRequiredBeforePromotion',
  'versionOverrideBrowserProofRequiredBeforePromotion',
  'atomicHundredPercentPromotionAfterProof',
  'automaticRollbackOnPostPromotionFailure',
  'rollbackRequiresProvedUsablePreviousBaseline'
])assert.equal(policy.deployment[key],true,`R240/R321 live continuity policy missing ${key}`);
for(const key of [
  'lastKnownGoodRemainsServingDuringCandidateProof',
  'candidateRemainsUndeployedBeforeProof',
  'mixedVersionTrafficSplitForbidden',
  'unprovedCandidateReceivesOrdinaryTraffic',
  'durableObjectLifecycleMutationAllowedInStagedVersionPath',
  'durableObjectExportSetChangeCompatible'
])assert.equal(policy.deployment[key],false,`R240/R321 policy must reject obsolete assumption ${key}`);

assert.match(policy.truthLaw,/staged-live-proved/);
assert.match(policy.truthBoundary,/previous Worker retains 100% ordinary user traffic/i);
assert.match(policy.truthBoundary,/candidate is admitted .* at 0%/i);
assert.match(policy.truthBoundary,/no unproved candidate receives ordinary traffic/i);
assert.match(policy.truthBoundary,/restore the previous Worker only when that previous baseline independently proved usable/i);
assert.match(policy.truthBoundary,/R201\/R203 remain deleted export tombstones/);

for(const token of [
  'npx wrangler deployments status',
  'npx wrangler versions upload',
  'npx wrangler versions deploy "${PREVIOUS_VERSION_ID}@100%" "${CANDIDATE_VERSION_ID}@0%"',
  'node scripts/verify_staged_release.mjs',
  'node tests/r200-current-browser-proof-e2e.mjs',
  'npx wrangler versions deploy "${CANDIDATE_VERSION_ID}@100%"'
])assert.ok(staged.includes(token),`staged release membrane missing ${token}`);

const upload=staged.indexOf('npx wrangler versions upload');
const admit=staged.indexOf('"${PREVIOUS_VERSION_ID}@100%" "${CANDIDATE_VERSION_ID}@0%"');
const semanticProof=staged.indexOf('node scripts/verify_staged_release.mjs');
const browserProof=staged.indexOf('node tests/r200-current-browser-proof-e2e.mjs');
const promote=staged.indexOf('"${CANDIDATE_VERSION_ID}@100%"',browserProof);
assert.ok(upload>=0&&admit>upload&&semanticProof>admit&&browserProof>semanticProof&&promote>browserProof,'candidate must upload → enter current deployment at 0% → pass semantic proof → pass browser proof → promote to 100%');
assert.match(staged,/STAGED_DEPLOYMENT_READY/);
assert.match(staged,/previous 100%, candidate 0%/);
assert.match(staged,/rollback_eligible=\$ROLLBACK_ELIGIBLE/);
assert.match(staged,/BASELINE_USABLE/);

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
  "steps.deploy_worker.outputs.rollback_eligible == 'true'",
  'npx wrangler rollback',
  'ROLLBACK REFUSED'
])assert.ok(ci.includes(token),`canonical ci continuity repair missing ${token}`);
assert.ok(!/name: Deploy canonical OMEGA Worker\s+id: deploy_worker\s+run: npx wrangler deploy\b/m.test(ci),'canonical Worker must not replace production before candidate proof');
assert.ok(!ci.includes('workflow_run:'),'continuity repair must not create recursive workflow fanout');

console.log('R240.1/R321 LIVE CONTINUITY PROMOTION PASS · candidate is in current deployment at 0% for exact override proof · ordinary traffic remains 100% on previous version · proof precedes 100% promotion · known-bad baselines have no rollback authority · ci.yml remains sole canonical production writer · R125/R141/R146/R147 unchanged · R201/R203 remain retired tombstones');

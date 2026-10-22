import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const staged=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');
const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const policy=JSON.parse(readFileSync(new URL('../public/omega-r240-recursive-exact-self-promotion.json',import.meta.url),'utf8'));

for(const token of [
  'STAGING_MODE="ZERO_PERCENT_OVERRIDE"',
  'STAGING_MODE="FORWARD_RECOVERY_EXPORT_SET"',
  'BASELINE_PROBE_RC" == "42"',
  'All versions in a multi-version deployment must declare identical',
  'R322 forward recovery export-set transition',
  'candidate 100%, obsolete baseline no longer serving',
  'R322 forward-recovery packaged-browser + Worker-semantic proof passed',
  'release_mode=$STAGING_MODE'
])assert.ok(staged.includes(token),`R322 forward-recovery membrane missing ${token}`);

const packagedBrowser=staged.indexOf('node tests/r496-local-omega7-candidate-browser-e2e.mjs');
const upload=staged.indexOf('npx wrangler versions upload');
const split=staged.indexOf('"$'+'{PREVIOUS_VERSION_ID}@100%" "$'+'{CANDIDATE_VERSION_ID}@0%"');
const forward=staged.indexOf('"$'+'{CANDIDATE_VERSION_ID}@100%" --name "$WORKER_NAME" --message "OMEGA R322 forward recovery');
const semantic=staged.indexOf('node scripts/verify_staged_release.mjs');
assert.ok(packagedBrowser>=0&&upload>packagedBrowser,'forward recovery must begin from an exact source/build/browser-proved package');
assert.ok(split>upload&&forward>split,'forward recovery must exist only after normal 100/0 staging attempt');
assert.ok(semantic>forward,'forward-recovery candidate must enter immediate exact-version Worker semantic proof after the export-set transition');

assert.match(staged,/if \[\[ "\$BASELINE_PROBE_RC" == "42" \]\] && grep -Eqi/,'forward recovery must require positive R319.9 blocking-baseline proof plus exact Cloudflare export incompatibility evidence');
assert.ok(!staged.includes('if [[ "$BASELINE_USABLE" != "1" ]] && grep -Eqi'),'indeterminate baseline must not qualify for automatic forward recovery');
assert.ok(staged.includes('ROLLBACK_ELIGIBLE=false'),'forward recovery must begin with rollback disabled');
assert.ok(staged.includes('if [[ "$BASELINE_USABLE" == "1" ]]'),'rollback authority still requires independent usable-baseline proof');

assert.equal(policy.deploymentContractRevision,'R324');
assert.equal(policy.deployment.assetProofBoundaryRevision,'R496');
assert.equal(policy.deployment.forwardRecoveryAllowed,true);
assert.equal(policy.deployment.forwardRecoveryRequiresPositiveBlockingBaselineProof,true);
assert.equal(policy.deployment.forwardRecoveryTrigger,'CLOUDFLARE_DURABLE_OBJECT_EXPORT_SET_SPLIT_REJECTED');
assert.equal(policy.deployment.forwardRecoveryCandidateMustBeSourceBuildProved,true);
assert.equal(policy.deployment.forwardRecoveryImmediateSemanticBrowserProof,false);
assert.equal(policy.deployment.forwardRecoveryRequiresPreprovedPackageBrowserAndImmediateSemanticProof,true);
assert.equal(policy.deployment.forwardRecoveryRollbackToBlockingBaseline,false);

assert.ok(ci.includes("if: always() && steps.deploy_worker.outcome == 'success'"),'post-deploy Hybrid closure must not fabricate exact-SHA failure when canonical deployment never succeeded');
assert.ok(ci.includes("steps.deploy_worker.outputs.rollback_eligible == 'true'"),'known-bad prior Worker must never regain rollback authority');
assert.ok(ci.includes('Release mode:'),'deployment receipt must expose whether normal staging or forward recovery ran');

console.log('R322/R496 FORWARD RECOVERY PASS · exact packaged browser proof precedes all traffic mutation · DO export-set recovery crosses only a positively proved blocking baseline · exact Worker semantic proof immediately follows · no rollback to interlock');

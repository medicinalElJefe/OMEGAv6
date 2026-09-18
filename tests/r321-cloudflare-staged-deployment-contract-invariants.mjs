import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const staged=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');
const verifier=readFileSync(new URL('../scripts/verify_staged_release.mjs',import.meta.url),'utf8');
const preload=readFileSync(new URL('../scripts/cloudflare-version-override-fetch.mjs',import.meta.url),'utf8');
const browser=readFileSync(new URL('./r200-current-browser-proof-e2e.mjs',import.meta.url),'utf8');
const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const policy=JSON.parse(readFileSync(new URL('../public/omega-r240-recursive-exact-self-promotion.json',import.meta.url),'utf8'));

const pair='"$'+'{PREVIOUS_VERSION_ID}@100%" "$'+'{CANDIDATE_VERSION_ID}@0%"';
const promoteNeedle='"$'+'{CANDIDATE_VERSION_ID}@100%"';
const upload=staged.indexOf('npx wrangler versions upload');
const admit=staged.indexOf(pair);
const membership=staged.indexOf('STAGED_DEPLOYMENT_READY=1');
const semantic=staged.indexOf('node scripts/verify_staged_release.mjs');
const browserProof=staged.indexOf('node tests/r200-current-browser-proof-e2e.mjs');
const promote=staged.indexOf(promoteNeedle,browserProof);

assert.ok(upload>=0,'candidate upload missing');
assert.ok(admit>upload,'candidate must be admitted to current deployment at 0% only after version upload');
assert.ok(membership>admit,'deployment membership must be observed before override proof');
assert.ok(semantic>membership,'semantic proof must wait for exact staged deployment membership');
assert.ok(browserProof>semantic,'browser proof must follow semantic proof');
assert.ok(promote>browserProof,'candidate may receive 100% traffic only after semantic + browser proof');

for(const source of [verifier,preload,browser])assert.ok(source.includes('Cloudflare-Workers-Version-Overrides'),'all staged HTTP proof paths must use the documented Cloudflare version-override header');
assert.ok(verifier.includes('workerName}="')&&verifier.includes('versionId'),'semantic override must use dictionary member worker="version"');
assert.ok(preload.includes('workerName}="')&&preload.includes('candidateVersion'),'child-process override must use dictionary member worker="version"');
assert.ok(browser.includes('overrideWorker}="')&&browser.includes('overrideVersion'),'browser override must use dictionary member worker="version"');

assert.ok(staged.includes('ROLLBACK_ELIGIBLE=false'),'rollback eligibility must fail closed');
assert.ok(staged.includes('if [[ "$BASELINE_USABLE" == "1" ]]'),'only a proved-usable baseline may become rollback eligible');
assert.ok(staged.includes('rollback_eligible=$ROLLBACK_ELIGIBLE'),'release must expose rollback eligibility to canonical CI');
assert.ok(ci.includes("steps.deploy_worker.outputs.rollback_eligible == 'true'"),'post-promotion rollback must require positive usability authority');
assert.ok(ci.includes('Refuse rollback to an unproved or known-bad baseline'),'CI must explicitly preserve the no-resurrection rule');

assert.equal(policy.deploymentContractRevision,'R322');
assert.equal(policy.deployment.candidateAdmittedToCurrentDeploymentAtZeroPercent,true);
assert.equal(policy.deployment.previousVersionRetainsHundredPercentOrdinaryTrafficDuringCandidateProof,true);
assert.equal(policy.deployment.unprovedCandidateReceivesOrdinaryTraffic,false);
assert.equal(policy.deployment.rollbackRequiresProvedUsablePreviousBaseline,true);
assert.equal(policy.deployment.durableObjectLifecycleMutationAllowedInStagedVersionPath,false);

console.log('R321/R322 CLOUDFLARE STAGED DEPLOYMENT CONTRACT PASS · normal path remains upload → current deployment old@100/candidate@0 → exact override semantic/browser proof → candidate@100 · bounded R322 recovery is separate');

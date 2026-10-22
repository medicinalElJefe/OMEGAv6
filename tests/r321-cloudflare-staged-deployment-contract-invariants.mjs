import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const staged=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');
const verifier=readFileSync(new URL('../scripts/verify_staged_release.mjs',import.meta.url),'utf8');
const preload=readFileSync(new URL('../scripts/cloudflare-version-override-fetch.mjs',import.meta.url),'utf8');
const localBrowser=readFileSync(new URL('./r496-local-omega7-candidate-browser-e2e.mjs',import.meta.url),'utf8');
const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const policy=JSON.parse(readFileSync(new URL('../public/omega-r240-recursive-exact-self-promotion.json',import.meta.url),'utf8'));

const pair='"$'+'{PREVIOUS_VERSION_ID}@100%" "$'+'{CANDIDATE_VERSION_ID}@0%"';
const promoteNeedle='"$'+'{CANDIDATE_VERSION_ID}@100%"';
const packagedBrowser=staged.indexOf('node tests/r496-local-omega7-candidate-browser-e2e.mjs');
const upload=staged.indexOf('npx wrangler versions upload');
const admit=staged.indexOf(pair);
const membership=staged.indexOf('STAGED_DEPLOYMENT_READY=1');
const semantic=staged.indexOf('node scripts/verify_staged_release.mjs');
const promote=staged.indexOf(promoteNeedle,semantic);

assert.ok(packagedBrowser>=0&&packagedBrowser<upload,'exact packaged browser proof must complete before candidate upload');
assert.ok(admit>upload,'candidate must be admitted to current deployment at 0% only after version upload');
assert.ok(membership>admit,'deployment membership must be observed before Worker override proof');
assert.ok(semantic>membership,'Worker semantic proof must wait for exact staged deployment membership');
assert.ok(promote>semantic,'candidate may receive 100% traffic only after packaged browser + staged Worker semantic proof');

for(const source of [verifier,preload])assert.ok(source.includes('Cloudflare-Workers-Version-Overrides'),'all 0%-traffic remote Worker proof paths must use the documented Cloudflare version-override header');
assert.ok(verifier.includes('workerName}="')&&verifier.includes('versionId'),'semantic override must use dictionary member worker="version"');
assert.ok(preload.includes('workerName}="')&&preload.includes('candidateVersion'),'child-process override must use dictionary member worker="version"');
assert.ok(verifier.includes("readFileSync('dist/omega-build-receipt.json','utf8')"),'staged verifier must prove candidate receipt from exact packaged dist');
assert.ok(!verifier.includes('/omega-build-receipt.json?staged='),'0%-traffic Worker proof must not mislabel canonical production ASSETS as candidate assets');
assert.ok(!staged.includes('verify_omega7_asset_coherence_r491.mjs staged'),'release path must not claim version override proves candidate static assets');
assert.ok(!/OMEGA_WORKER_VERSION_ID="\$CANDIDATE_VERSION_ID"[^\n]*tests\/r200-current-browser-proof-e2e\.mjs/.test(staged),'remote staged R200 must not pretend canonical production assets belong to the candidate');

for(const token of ['OMEGA_GOVERNED_BUILD_RECEIPT_V1','data-r495-operational-truth','desktop','mobile'])assert.ok(localBrowser.includes(token),`R496 packaged browser proof missing ${token}`);

assert.ok(staged.includes('ROLLBACK_ELIGIBLE=false'),'rollback eligibility must fail closed');
assert.ok(staged.includes('if [[ "$BASELINE_USABLE" == "1" ]]'),'only a proved-usable baseline may become rollback eligible');
assert.ok(staged.includes('rollback_eligible=$ROLLBACK_ELIGIBLE'),'release must expose rollback eligibility to canonical CI');
assert.ok(ci.includes("steps.deploy_worker.outputs.rollback_eligible == 'true'"),'post-promotion rollback must require positive usability authority');
assert.ok(ci.includes('Refuse rollback to an unproved or known-bad baseline'),'CI must explicitly preserve the no-resurrection rule');

assert.equal(policy.deploymentContractRevision,'R324');
assert.equal(policy.deployment.assetProofBoundaryRevision,'R496');
assert.equal(policy.deployment.candidateAdmittedToCurrentDeploymentAtZeroPercent,true);
assert.equal(policy.deployment.previousVersionRetainsHundredPercentOrdinaryTrafficDuringCandidateProof,true);
assert.equal(policy.deployment.unprovedCandidateReceivesOrdinaryTraffic,false);
assert.equal(policy.deployment.exactPackagedBrowserProofRequiredBeforePromotion,true);
assert.equal(policy.deployment.versionOverrideBrowserProofRequiredBeforePromotion,false);
assert.equal(policy.deployment.versionOverrideStaticAssetProofSupported,false);
assert.equal(policy.deployment.postPromotionCanonicalAssetProofRequired,true);

console.log('R321/R496 CLOUDFLARE STAGED DEPLOYMENT CONTRACT PASS · exact dist browser proof precedes upload · old@100/candidate@0 Worker semantics use exact version override · canonical ASSETS are not falsely attributed to a 0%-traffic Worker · candidate@100 only after both proof lanes');

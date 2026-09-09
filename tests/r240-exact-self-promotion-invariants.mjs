import assert from 'node:assert/strict';
import fs from 'node:fs';

const policy=JSON.parse(fs.readFileSync('public/omega-r240-exact-self-promotion.json','utf8'));
const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));
const selfbuild=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const verifier=fs.readFileSync('scripts/verify_live_hybrid_command_authority_r237.mjs','utf8');
const r239=JSON.parse(fs.readFileSync('public/omega-r239-recursive-build-fabric.json','utf8'));

assert.equal(policy.schema,'OMEGA_EXACT_SELF_PROMOTION_R240');
assert.equal(policy.revision,'R240');
assert.equal(policy.gates.exactSuccessfulProductionBase,true);
assert.equal(policy.gates.r164ResidualGate,'PASS');
assert.equal(policy.gates.highOrCriticalResidualAllowed,false);
assert.equal(policy.gates.postCommitExactCandidateReproof,true);
assert.equal(policy.gates.unchangedBaseImmediatelyBeforeMerge,true);
assert.equal(policy.gates.expectedHeadShaRequired,true);
assert.equal(policy.gates.allowlistedDiffOnly,true);
assert.equal(policy.gates.mergeMethod,'merge');
assert.equal(policy.gates.twoParentMergeRequired,true);
assert.equal(policy.deployment.soleCanonicalWriter,'.github/workflows/ci.yml');
assert.equal(policy.deployment.explicitWorkflowDispatchAfterTokenMerge,true);
assert.equal(policy.deployment.selfBuilderMayDeployDirectly,false);
assert.equal(policy.deployment.selfBuilderMayDispatchItself,false);
assert.equal(policy.deployment.exactMergedShaProductionSuccessRequired,true);
assert.equal(policy.authority.githubAutoMergeFeature,false);
assert.equal(policy.authority.canonAdmissionClaimed,false);
assert.equal(policy.authority.canonStateAdmission,'R125');
assert.equal(r239.admission.schedulerAutoMerge,false,'R239 scheduler must not gain merge authority');

assert.equal(governor.selfPromotion.revision,'R240');
assert.equal(governor.selfPromotion.enabled,true);
assert.equal(governor.selfPromotion.githubAutoMergeFeature,false);
assert.equal(governor.selfPromotion.exactExpectedHeadMergeRequired,true);
assert.equal(governor.selfPromotion.exactUnchangedBaseRequired,true);
assert.equal(governor.selfPromotion.allowlistedDiffRequired,true);
assert.equal(governor.selfPromotion.highOrCriticalResidualPromotion,false);
assert.equal(governor.selfPromotion.canonicalDeploymentWorkflow,'.github/workflows/ci.yml');
assert.equal(governor.selfPromotion.selfWorkflowDispatchAllowed,false);
assert.equal(governor.selfPromotion.canonStateAdmission,false);
assert.equal(governor.selfPromotion.canonicalAdmissionAuthority,'R125');

for(const token of [
 "actions: write",
 "['push','workflow_dispatch'].includes(r.event)",
 "node tests/r239-recursive-canon-build-fabric-invariants.mjs",
 "node tests/r240-exact-self-promotion-invariants.mjs",
 "git diff --name-only",
 "R240 autonomous diff escaped allowlist",
 "gh pr view \"$PR_NUMBER\"",
 "headRefOid",
 "git fetch origin main",
 "pulls/$PR_NUMBER/merge",
 "-f merge_method=merge",
 "-f sha=\"$CANDIDATE_SHA\"",
 "two-parent merge",
 "actions/workflows/ci.yml/dispatches",
 "-f ref=main",
 "--event workflow_dispatch",
 "gh run watch \"$RUN_ID\"",
 "r.headSha!==process.env.MERGE_SHA",
 "git push origin --delete",
 "Direct production deployment by self-builder: forbidden"
])assert.ok(selfbuild.includes(token),`R240 self-build workflow missing ${token}`);
assert.ok(!selfbuild.includes('npx wrangler deploy\n'),'R240 self-builder may not directly deploy canonical production');
assert.ok(!/gh\s+pr\s+merge/.test(selfbuild),'R240 uses expected-head REST merge rather than GitHub auto-merge/CLI merge');
assert.ok(!/actions\/workflows\/r170-governed-selfbuild\.yml\/dispatches/.test(selfbuild),'R240 may not dispatch itself recursively');

assert.ok(ci.includes('workflow_dispatch:'),'canonical ci.yml must be explicitly dispatchable after an Actions-token source merge');
assert.ok(ci.includes("github.event_name == 'workflow_dispatch'"),'canonical deploy job must allow exact explicit dispatch on main');
assert.ok(ci.includes("github.ref == 'refs/heads/main'"),'canonical deploy dispatch must remain main-only');
assert.ok(ci.includes('Promoted main commit must be an exact two-parent merge commit'),'canonical deployment must retain exact two-parent lineage proof');
assert.ok(!ci.includes('workflow_run:'),'canonical deployment must not introduce recursive workflow fanout');

for(const token of ['HOST / JOB / MISSION / EPOCH','R141','R146','R147','R125','intentionally contain no APPLY_PATCH or WRITE_TEXT'])assert.ok(verifier.includes(token),`R240 semantic live verifier missing ${token}`);
assert.ok(!verifier.includes('R141/R146/R147/R125 authority remains unchanged'),'stale prose-coupled R237 verifier must be removed');

console.log('OMEGA R240 EXACT SELF-PROMOTION PASS · R170-generated bounded candidates only · R239 scheduler cannot merge · exact production base + residual PASS + all tests + allowlisted diff + unchanged base + expected head · two-parent source merge · canonical ci.yml explicit dispatch · exact production success required · R125 Canon admission unchanged');

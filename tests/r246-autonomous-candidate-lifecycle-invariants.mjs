import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decideAutonomousCandidateLifecycleR246,R246_AUTONOMOUS_CANDIDATE_LIFECYCLE} from '../scripts/reconcile_autonomous_candidate_lifecycle_r246.mjs';

assert.equal(R246_AUTONOMOUS_CANDIDATE_LIFECYCLE,'OMEGA_AUTONOMOUS_CANDIDATE_LIFECYCLE_R246');

const base={branch:'selfbuild/r170-g1-sg001-1',baseSha:'A',currentMainSha:'A',productionProven:false};
const orphan=decideAutonomousCandidateLifecycleR246({...base,prState:'NONE'});
assert.equal(orphan.action,'DELETE_BRANCH');
assert.equal(orphan.reason,'ORPHAN_BRANCH_WITHOUT_PR');
assert.equal(orphan.deleteBranch,true);
assert.equal(orphan.closePr,false);
assert.equal(orphan.requiresAttention,false);

const stale=decideAutonomousCandidateLifecycleR246({...base,currentMainSha:'B',prState:'OPEN',prCi:'PASS'});
assert.equal(stale.action,'CLOSE_PR_DELETE_BRANCH');
assert.equal(stale.reason,'STALE_BASE_AFTER_LEGITIMATE_MAIN_ADVANCEMENT');
assert.equal(stale.closePr,true);
assert.equal(stale.deleteBranch,true);
assert.equal(stale.requiresAttention,false);

const failedGate=decideAutonomousCandidateLifecycleR246({...base,prState:'OPEN',prCi:'FAIL'});
assert.equal(failedGate.action,'PRESERVE');
assert.equal(failedGate.requiresAttention,true,'a real exact-head gate failure must stay visible for attention');
assert.equal(failedGate.deleteBranch,false);

const greenOpen=decideAutonomousCandidateLifecycleR246({...base,prState:'OPEN',prCi:'PASS'});
assert.equal(greenOpen.action,'PRESERVE');
assert.equal(greenOpen.requiresAttention,false);

const mergedRed=decideAutonomousCandidateLifecycleR246({...base,prState:'MERGED'});
assert.equal(mergedRed.action,'PRESERVE');
assert.equal(mergedRed.requiresAttention,true,'merged source without production proof is a meaningful problem');

const proven=decideAutonomousCandidateLifecycleR246({...base,prState:'MERGED',productionProven:true});
assert.equal(proven.action,'DELETE_BRANCH');
assert.equal(proven.deleteBranch,true);

const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
for(const token of [
  'Reconcile unpromoted autonomous candidate lifecycle',
  'reconcile_autonomous_candidate_lifecycle_r246.mjs',
  'STALE_BASE_AFTER_LEGITIMATE_MAIN_ADVANCEMENT',
  'CLOSE_PR_DELETE_BRANCH',
  'PRESERVE',
])assert.ok(workflow.includes(token),`R246 workflow lifecycle closure missing ${token}`);
assert.ok(workflow.includes("steps.deployment.outputs.status != 'PRODUCTION_PROVEN'"),'R246 fallback reconciler must not race successful post-production cleanup');
assert.ok(workflow.includes('gh pr close'),'R246 stale autonomous PR must be explicitly closable');
assert.ok(workflow.includes('git push origin --delete'),'R246 orphan/stale branch cleanup must be executable');

console.log('R246 AUTONOMOUS CANDIDATE LIFECYCLE PASS · orphan branches cleaned · stale-base PRs closed safely · real exact-head gate failures remain visible · merged-but-red production remains attention-worthy');

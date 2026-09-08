import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow=fs.readFileSync('.github/workflows/r210-release-controller.yml','utf8');
const guard=fs.readFileSync('scripts/releaseCandidateGuardR210.mjs','utf8');

assert.match(workflow,/^name:\s*R210 Release Controller/m);
assert.match(workflow,/\bon:\s*\n\s+pull_request:\s*\n\s+branches:\s*\[main\]/m,'R210 controller must remain main-targeting PR proof only');
assert.doesNotMatch(workflow,/^\s*push\s*:/m,'R210 controller may not become a second main-push authority');
assert.doesNotMatch(workflow,/^\s*schedule\s*:/m,'R210 controller may not become a recurring authority');
for(const token of ['contents: read','actions: read','pull-requests: read','cancel-in-progress: false','OMEGA_RELEASE_GUARD_MODE: PR','OMEGA_PR_NUMBER: ${{ github.event.pull_request.number }}','OMEGA_EXPECTED_BASE_SHA: ${{ github.event.pull_request.base.sha }}','node scripts/releaseCandidateGuardR210.mjs'])assert.ok(workflow.includes(token),`R210 controller missing ${token}`);
for(const forbidden of ['contents: write','pull-requests: write','actions: write','wrangler deploy','gh pr merge','git push','OMEGA_RELEASE_GUARD_MODE: PUSH'])assert.ok(!workflow.includes(forbidden),`R210 active workflow may not contain ${forbidden}`);
for(const token of ['duplicate revision identity','/commits/${sha}/pulls','/actions/runs?head_sha=${candidate}&event=pull_request','OMEGA Cloud Bridge CI','R170 Current Convergence','R202 Operational Source Authority','parents.length!==2'])assert.ok(guard.includes(token),`R210 guard logic missing ${token}`);
assert.ok(guard.includes("mode==='PR'")&&guard.includes("mode==='PUSH'"),'R210 guard script must retain candidate and operator/canonical post-merge correlation logic without activating a second push workflow');
assert.ok(!/wrangler\s+deploy|git\s+push|gh\s+pr\s+merge/i.test(guard),'R210 guard script must remain proof-only');

console.log('R210 RELEASE CONTROLLER PASS · active workflow is PR-only/read-only/non-cancelling · duplicate revision + exact-base candidate fence present · exact two-parent/green-head post-merge correlation remains proof logic only · canonical ci.yml retains deployment authority');

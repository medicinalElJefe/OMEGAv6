import assert from'node:assert/strict';
import fs from'node:fs';

const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const topology=fs.readFileSync('scripts/verify_workflow_topology_r170.mjs','utf8');
const cloudMachine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
const policy=JSON.parse(fs.readFileSync('public/omega-r240-recursive-exact-self-promotion.json','utf8'));
const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));

for(const token of [
 'gh workflow run ci.yml --repo "$GITHUB_REPOSITORY" --ref main',
 '--workflow ci.yml --branch main --event workflow_dispatch',
 "x.headSha===process.env.MERGE_SHA&&x.event==='workflow_dispatch'",
 'Canonical ci.yml workflow_dispatch run did not appear for exact promoted merge.',
 "r.event!=='workflow_dispatch'",
 'R240 exact promoted merge is production-proven by canonical ci.yml workflow_dispatch'
])assert.ok(workflow.includes(token),`R340 workflow closure missing ${token}`);

assert.ok(!workflow.includes('Canonical ci.yml push run did not appear for exact promoted merge.'),'R340 must not wait for a recursive push event that GITHUB_TOKEN cannot emit');
assert.equal((workflow.match(/gh\s+workflow\s+run\s+ci\.yml/g)||[]).length,1,'R340 may dispatch the canonical writer exactly once per promoted source merge');
assert.ok(!/gh\s+workflow\s+run\s+r170-governed-selfbuild\.yml/i.test(workflow),'R340 may not recursively dispatch itself');

assert.equal(policy.deployment.soleCanonicalWriter,'.github/workflows/ci.yml');
assert.equal(policy.deployment.explicitWorkflowDispatchAfterActionsTokenMerge,true);
assert.equal(policy.deployment.canonicalDeploymentPushTrigger,false);
assert.equal(policy.deployment.canonicalDeploymentDispatchTrigger,true);
assert.equal(policy.deployment.selfBuilderMayDeployDirectly,false);
assert.equal(policy.deployment.selfBuilderMayDispatchItself,false);
assert.equal(policy.deployment.selfBuilderMayDispatchCanonicalWriter,true);

assert.equal(governor.selfPromotion.canonicalDeploymentWorkflow,'.github/workflows/ci.yml');
assert.equal(governor.selfPromotion.canonicalDeploymentPushTrigger,false);
assert.equal(governor.selfPromotion.canonicalDeploymentDispatchTrigger,true);
assert.equal(governor.selfPromotion.canonicalDeploymentDispatchAllowed,true);
assert.equal(governor.selfPromotion.selfWorkflowDispatchAllowed,false);

assert.ok(topology.includes("text.match(/gh\\s+workflow\\s+run\\s+ci\\.yml/g)"),'workflow topology must explicitly allow only the canonical ci.yml dispatch in R170');
assert.ok(cloudMachine.includes("['push','workflow_dispatch'].includes(r.event)"),'CLOUD-01 must recognize both ordinary push proof and exact R340 dispatch proof on the current main SHA');
assert.match(policy.truthBoundary,/GITHUB_TOKEN does not recursively emit another push-triggered workflow/);
assert.match(policy.truthBoundary,/ci.yml remains the sole production writer/);

console.log('R340 CANONICAL PRODUCTION DISPATCH CLOSURE PASS · exact two-parent source merge → one explicit ci.yml dispatch → exact-SHA canonical deployment/live proof → continuation · no direct self-builder deployment · no recursive self-dispatch · CLOUD-01 recognizes dispatched proof');

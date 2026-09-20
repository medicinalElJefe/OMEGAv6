import assert from'node:assert/strict';
import fs from'node:fs';

const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const policy=JSON.parse(fs.readFileSync('public/omega-r240-recursive-exact-self-promotion.json','utf8'));

for(const token of [
  'gh workflow run ci.yml --repo "$GITHUB_REPOSITORY" --ref main',
  '--workflow ci.yml --branch main --event workflow_dispatch',
  "x.headSha===process.env.MERGE_SHA&&x.event==='workflow_dispatch'",
  'Canonical ci.yml workflow_dispatch run did not appear for exact promoted merge.',
  "r.event!=='workflow_dispatch'",
  'R240 exact promoted merge is production-proven by canonical ci.yml workflow_dispatch'
])assert.ok(workflow.includes(token),`R339 dispatch closure missing ${token}`);

assert.ok(!workflow.includes('Canonical ci.yml push run did not appear for exact promoted merge.'),'R339 must not wait for a recursive push event that GITHUB_TOKEN cannot emit');
assert.equal(policy.deployment.soleCanonicalWriter,'.github/workflows/ci.yml');
assert.equal(policy.deployment.explicitWorkflowDispatchAfterActionsTokenMerge,true);
assert.equal(policy.deployment.canonicalDeploymentPushTrigger,false);
assert.equal(policy.deployment.canonicalDeploymentDispatchTrigger,true);
assert.equal(policy.deployment.selfBuilderMayDeployDirectly,false);
assert.equal(policy.deployment.selfBuilderMayDispatchItself,false);
assert.equal(policy.deployment.selfBuilderMayDispatchCanonicalWriter,true);
assert.match(policy.truthBoundary,/GITHUB_TOKEN does not recursively create a push-triggered workflow/);
assert.match(policy.truthBoundary,/ci.yml remains the sole production writer/);

console.log('R339 CANONICAL DISPATCH CLOSURE PASS · exact two-parent source promotion dispatches existing ci.yml on exact main SHA · workflow_dispatch is bound and watched · self-builder still cannot deploy · ci.yml remains sole production writer');

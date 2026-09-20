// R339 exact canonical CI dispatch fallback regression.
import assert from'node:assert/strict';
import fs from'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const workflow=read('.github/workflows/r170-governed-selfbuild.yml');
const governor=JSON.parse(read('public/omega-r170-self-build-governor.json'));
const promotion=JSON.parse(read('public/omega-r240-recursive-exact-self-promotion.json'));
const r240=read('tests/r240-recursive-exact-self-promotion-invariants.mjs');
const topo=read('scripts/verify_workflow_topology_r170.mjs');

for(const token of [
 'gh workflow run ci.yml --repo "$GITHUB_REPOSITORY" --ref main',
 '--event workflow_dispatch',
 "['push','workflow_dispatch'].includes(r.event)",
 'main moved before canonical ci.yml dispatch',
 'Canonical ci.yml run did not bind the exact promoted merge by push or explicit main dispatch.'
])assert.ok(workflow.includes(token),`R339 canonical production fallback missing ${token}`);

assert.equal(governor.selfPromotion.canonicalDeploymentDispatchAllowed,true);
assert.equal(governor.selfPromotion.selfWorkflowDispatchAllowed,false);
assert.equal(promotion.deployment.explicitWorkflowDispatchAfterActionsTokenMerge,true);
assert.equal(promotion.deployment.selfBuilderMayDeployDirectly,false);
assert.equal(promotion.deployment.selfBuilderMayDispatchItself,false);
assert.equal(promotion.deployment.soleCanonicalWriter,'.github/workflows/ci.yml');
assert.ok(r240.includes('gh workflow run ci.yml --repo "$GITHUB_REPOSITORY" --ref main'),'R240 inherited proof must require the canonical dispatch fallback');
assert.ok(topo.includes('gh workflow run ci.yml --repo "$GITHUB_REPOSITORY" --ref main'),'workflow topology must recognize canonical ci.yml dispatch');
assert.ok(!workflow.includes('gh workflow run r170-governed-selfbuild.yml'),'self-builder must never recursively dispatch itself');

console.log('R339 CANONICAL CI DISPATCH PROOF PASS · exact two-parent source promotion remains R240 · Actions-token push suppression falls back only to the same canonical ci.yml on exact main SHA · self-builder never deploys directly or dispatches itself · ci.yml remains sole production writer');

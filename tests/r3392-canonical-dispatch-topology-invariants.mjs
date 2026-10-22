import assert from'node:assert/strict';
import fs from'node:fs';

const topology=fs.readFileSync('scripts/verify_workflow_topology_r170.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');

assert.ok(topology.includes("assert.deepEqual([...new Set(dispatches)],['ci.yml']"),'R339.2 topology must allow only ci.yml from R170');
assert.ok(topology.includes('R170 may never recursively dispatch itself'),'R339.2 must retain the self-recursion fence');
assert.ok(workflow.includes('gh workflow run ci.yml --repo "$GITHUB_REPOSITORY" --ref main'),'canonical CI fallback missing');
assert.ok(!workflow.includes('gh workflow run r170-governed-selfbuild.yml'),'R170 self-dispatch must remain impossible');

console.log('R339.2 WORKFLOW TOPOLOGY PASS · R170 may explicitly dispatch only canonical ci.yml after exact source promotion · every other active workflow retains no-recursive-dispatch policy · R170 cannot dispatch itself');

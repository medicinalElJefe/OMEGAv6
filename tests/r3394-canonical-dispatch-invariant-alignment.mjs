import assert from'node:assert/strict';
import fs from'node:fs';

const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const governorTest=fs.readFileSync('tests/r170-self-build-governor-invariants.mjs','utf8');
const topology=fs.readFileSync('scripts/verify_workflow_topology_r170.mjs','utf8');

for(const token of [
 'gh workflow run ci.yml --repo "$GITHUB_REPOSITORY" --ref main',
 '--event workflow_dispatch',
 'gh run watch'
])assert.ok(workflow.includes(token),`R339.4 canonical dispatch missing ${token}`);

assert.ok(governorTest.includes("assert.deepEqual([...new Set(dispatches)],['ci.yml']"),'R339.4 inherited R170 governor proof must allow only canonical ci.yml dispatch');
assert.ok(governorTest.includes('self-builder may not recursively dispatch itself'),'R339.4 self-recursion fence missing');
assert.ok(!governorTest.includes("'--event push'"),'R339.4 must not require the retired push-event proof after explicit canonical dispatch');
assert.ok(topology.includes("assert.deepEqual([...new Set(dispatches)],['ci.yml']"),'R339.4 must agree with active topology authority');
assert.ok(topology.includes("'--event workflow_dispatch'"),'R339.4 topology must expect workflow_dispatch production proof');

console.log('R339.4 CANONICAL DISPATCH INVARIANT ALIGNMENT PASS · inherited R170 governor proof matches R339.2 topology · only ci.yml may be dispatched · self-recursion remains forbidden · retired push-event assertion removed');

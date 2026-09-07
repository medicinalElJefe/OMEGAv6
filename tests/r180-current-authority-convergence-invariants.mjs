import assert from 'node:assert/strict';
import fs from 'node:fs';

const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));
const convergence=fs.readFileSync('.github/workflows/r170-current-convergence.yml','utf8');
const topology=fs.readFileSync('scripts/verify_workflow_topology_r170.mjs','utf8');
const selfbuild=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const selfbuildTest=fs.readFileSync('tests/r170-self-build-governor-invariants.mjs','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const mobile=fs.readFileSync('.github/workflows/r176-r164-mobile-containment-proof.yml','utf8');
const r176=fs.readFileSync('.github/workflows/r176-living-world-intent-proposal.yml','utf8');
const r177=fs.readFileSync('.github/workflows/r177-living-world-mission-composer.yml','utf8');
const r178=fs.readFileSync('.github/workflows/r178-living-world-contract-resolution.yml','utf8');
const r179=fs.readFileSync('.github/workflows/r179-living-world-durable-authorization.yml','utf8');

assert.equal(governor.revision,'R170.3');
assert.equal(governor.currentCapabilityFloor,'R179');
assert.deepEqual(governor.promotedSuccessorContinuity,['R175','R176','R177','R178','R179']);
assert.equal(governor.selfBuild.schedule,'17 * * * *');
assert.equal(governor.selfBuild.observationCadence,'HOURLY');
assert.equal(governor.selfBuild.expensiveProofMode,'PROPOSE_ONLY');
assert.equal(governor.selfBuild.latestExplicitSuccessorProof,'tests/r179-living-world-durable-authorization-invariants.mjs');
assert.equal(governor.selfBuild.directMainMutation,false);
assert.equal(governor.selfBuild.autoMerge,false);
assert.equal(governor.selfBuild.recursiveTriggerChain,false);
assert.equal(governor.selfBuild.highOrCriticalAutoRepair,false);
assert.equal(governor.selfBuild.canonicalAdmissionAuthority,'R125');
assert.equal(governor.preservedRuntime.livingWorldTruthSurface,'R175_READ_ONLY_MULTI_DOMAIN');
assert.equal(governor.preservedRuntime.livingWorldIntentProposal,'R176_INTENT_ONLY');
assert.equal(governor.preservedRuntime.livingWorldMissionComposer,'R177_STAGED_NOT_DISPATCHED');
assert.equal(governor.preservedRuntime.livingWorldContractResolution,'R178_RESOLVED_NOT_AUTHORIZED');
assert.equal(governor.preservedRuntime.livingWorldExecutionAuthorization,'R179_AUTHORIZED_NOT_DISPATCHED');

for(const token of [
  'r180-current-authority-convergence-invariants.mjs',
  'r179-living-world-durable-authorization-invariants.mjs',
  'r178-living-world-contract-resolution-invariants.mjs',
  'r177-living-world-mission-composer-invariants.mjs',
  'r176-living-world-intent-proposal-invariants.mjs',
  'r176-r164-mobile-containment-invariants.mjs',
  'r175-multidomain-living-world-truth-invariants.mjs',
  'prove_successor_workflow_invariants_r175.mjs',
  'r162-governed-reflex-execution-invariants.mjs',
  'r147-unified-executor-fabric-invariants.mjs',
  'r146-durable-operation-execution-invariants.mjs',
  'npm run check',
  'wrangler.optical-machine-r1532.jsonc',
  'R179 stops AUTHORIZED_NOT_DISPATCHED',
  'R125 remains sole CanonState admission authority',
])assert.ok(convergence.includes(token),`R180 current convergence missing ${token}`);

assert.match(selfbuild,/cron: '17 \* \* \* \*'/,'R170.3 self-build hourly cadence must remain intact');
assert.ok(selfbuild.includes('r179-living-world-durable-authorization-invariants.mjs'),'R170.3 must prove R179 before generation');
assert.ok(selfbuildTest.includes("governor.currentCapabilityFloor,'R179'"),'self-build invariants must enforce R179 floor');
assert.ok(topology.includes('highestSuccessorRevision'),'topology must derive current floor from active successors');
assert.ok(topology.includes('currentCapabilityFloor'),'topology must verify the capability floor');

for(const [name,text] of [['R176',r176],['R176-mobile',mobile],['R177',r177],['R178',r178],['R179',r179]]){
  assert.match(text,/permissions:\s*\n\s+contents:\s*read/i,`${name} successor authority must remain read-only`);
  assert.ok(!/contents:\s*write/i.test(text),`${name} successor authority may not gain contents write`);
  assert.ok(!/git\s+push\s+origin\s+HEAD:main|gh\s+pr\s+merge|gh\s+workflow\s+run/i.test(text),`${name} successor authority may not mutate or recursively promote main`);
}
assert.ok(mobile.includes('node tests/r164-reflex-autonomic-browser-e2e.mjs'),'deployed mobile repair must retain exact browser proof');
assert.ok(r179.includes('node tests/r178-living-world-contract-resolution-invariants.mjs'),'R179 must preserve R178 contract resolution');
assert.ok(r179.includes('node tests/r147-unified-executor-fabric-invariants.mjs'),'R179 must preserve R147 dispatch authority');
assert.ok(r179.includes('node tests/r162-governed-reflex-execution-invariants.mjs'),'R179 must preserve R162 reflex execution authority');

assert.ok(ci.includes('Promoted main commit must be an exact two-parent merge commit'),'canonical deployment must keep two-parent promotion law');
assert.ok(ci.includes('Deploy canonical OMEGA Worker'),'canonical Worker deployment authority must remain in ci.yml');
assert.ok(!/R180.*CanonState.*admit/i.test(convergence),'R180 convergence must not claim Canon admission');

console.log('R180 CURRENT AUTHORITY CONVERGENCE PASS · scheduled convergence now names the full R175→R179 chain and deployed mobile repair while preserving R170.3 hourly governance, R147/R162 execution boundaries, R125 Canon admission, and canonical CI deployment law');

import assert from 'node:assert/strict';
import fs from 'node:fs';

const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const engine=fs.readFileSync('scripts/r170-selfbuild-engine.mjs','utf8');
const collector=fs.readFileSync('scripts/collect_selfbuild_residual_gate_r170.mjs','utf8');

assert.equal(state.schema,'OMEGA_GOVERNED_SELFBUILD_STATE_R170');
assert.equal(state.revision,'R170');
assert.equal(state.active,true);
assert.equal(state.generation,0);
assert.equal(state.maxAutonomousGenerations,5);
assert.equal(state.roadmap.length,5);
assert.equal(new Set(state.roadmap.map(x=>x.id)).size,5);
for(const capsule of state.roadmap){
  assert.match(capsule.id,/^SG00[1-5]$/);
  assert.match(capsule.target,/^src\/generated\/selfbuildR170\//);
  assert.ok(['LOW','MEDIUM'].includes(capsule.risk));
}
for(const law of [
  'AUTONOMOUS_BUILD_MAY_PROPOSE_SOURCE_BUT_MAY_NOT_MUTATE_MAIN_DIRECTLY',
  'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
  'HIGH_OR_CRITICAL_RESIDUALS_BLOCK_AUTONOMOUS_CANDIDATE_GENERATION',
  'NO_RECURSIVE_PUSH_OR_WORKFLOW_RUN_TRIGGER_CHAIN'
])assert.ok(state.laws.includes(law),`missing R170 law ${law}`);

assert.match(engine,/OMEGA_R170_RESIDUAL_EVIDENCE_PATH/);
assert.match(engine,/BLOCKED_BY_RESIDUAL_GATE/);
assert.match(engine,/PROVED_PENDING_PR/);
assert.match(engine,/SOURCE_MERGE_OBSERVED/);
assert.match(engine,/canonicalAdmission:false/);
assert.match(engine,/Refusing to overwrite existing generated target/);
assert.ok(!/git\s+push/i.test(engine),'engine itself must not mutate Git refs');
assert.ok(!/gh\s+pr\s+merge/i.test(engine),'engine itself must not merge PRs');
assert.ok(!/Math\.random|crypto\.random/i.test(engine),'self-build generation must remain deterministic');
assert.match(collector,/buildDevelopmentResidualGraphR164/);
assert.match(collector,/api\/core-health/);
assert.match(collector,/api\/release-evidence/);
assert.match(collector,/api\/runtime-attestation/);
assert.match(collector,/api\/hybrid\/status/);
assert.match(collector,/UNREACHABLE/,'evidence collection failure must fail closed into a core-health residual');

const prereqMap=new Map(state.roadmap.map(x=>[x.id,new Set(x.prerequisites||[])]));
for(const [id,prereqs] of prereqMap)for(const p of prereqs)assert.ok(prereqMap.has(p),`${id} has unknown prerequisite ${p}`);

console.log('R170 GOVERNED SELF-BUILD INVARIANTS PASS');

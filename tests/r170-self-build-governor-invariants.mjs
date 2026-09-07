import assert from 'node:assert/strict';
import fs from 'node:fs';
const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const engine=fs.readFileSync('scripts/r170-selfbuild-engine.mjs','utf8');
const collector=fs.readFileSync('scripts/collect_selfbuild_residual_gate_r170.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));
assert.equal(state.schema,'OMEGA_GOVERNED_SELFBUILD_STATE_R170');
assert.equal(state.revision,'R170.2');
assert.equal(state.active,true);
assert.equal(state.maxAutonomousGenerations,5);
assert.equal(state.roadmap.length,5);
assert.ok(Number.isInteger(state.generation)&&state.generation>=0&&state.generation<=state.maxAutonomousGenerations,`generation out of governed range: ${state.generation}`);
const roadmapIds=new Set(state.roadmap.map(x=>x.id));
const admitted=Array.isArray(state.admittedSourceCapsules)?state.admittedSourceCapsules:[];
assert.equal(new Set(admitted).size,admitted.length,'admitted source capsules must be unique');
for(const id of admitted)assert.ok(roadmapIds.has(id),`unknown admitted capsule ${id}`);
assert.ok(admitted.length<=state.generation,'admitted capsule count cannot exceed generation');
if(state.currentCapsuleId){assert.ok(roadmapIds.has(state.currentCapsuleId),`unknown current capsule ${state.currentCapsuleId}`);assert.ok(!admitted.includes(state.currentCapsuleId),'current capsule cannot already be admitted')}
for(const receipt of state.receipts||[]){assert.equal(receipt.canonicalAdmission,false,'self-build receipt may never claim Canon admission');assert.ok(roadmapIds.has(receipt.capsuleId),`receipt references unknown capsule ${receipt.capsuleId}`);assert.ok(Number(receipt.generation)>=1&&Number(receipt.generation)<=state.maxAutonomousGenerations,`receipt generation out of range ${receipt.generation}`)}
for(const law of ['EXACT_CURRENT_MAIN_REQUIRES_SUCCESSFUL_PRODUCTION_CLOUD_BRIDGE_PUSH_PROOF','UNPROVEN_OR_RED_PRODUCTION_HEAD_FORCES_OBSERVE_ONLY','AUTONOMOUS_BUILD_MAY_PROPOSE_SOURCE_BUT_MAY_NOT_MUTATE_MAIN_DIRECTLY','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY','HIGH_OR_CRITICAL_RESIDUALS_BLOCK_AUTONOMOUS_CANDIDATE_GENERATION','NO_RECURSIVE_PUSH_OR_WORKFLOW_RUN_TRIGGER_CHAIN','CURRENT_READ_ONLY_SUCCESSOR_CHAIN_MUST_PROVE_BEFORE_AUTONOMOUS_CANDIDATE'])assert.ok(state.laws.includes(law),`missing ${law}`);
for(const capsule of state.roadmap){assert.match(capsule.id,/^SG00[1-5]$/);assert.match(capsule.target,/^src\/generated\/selfbuildR170\//);assert.ok(['LOW','MEDIUM'].includes(capsule.risk))}
assert.match(engine,/BLOCKED_BY_RESIDUAL_GATE/);assert.match(engine,/PROVED_PENDING_PR/);assert.match(engine,/canonicalAdmission:false/);assert.match(engine,/revision:'R170\.2'/);assert.ok(!/git\s+push/i.test(engine));assert.ok(!/Math\.random|crypto\.random/i.test(engine));
for(const needle of ['api/core-health','api/release-evidence','api/runtime-attestation','api/hybrid/status','UNREACHABLE'])assert.ok(collector.includes(needle));
for(const needle of ['gh run list','headSha','production_ready','OBSERVE_ONLY','prove_successor_workflow_invariants_r175.mjs'])assert.ok(workflow.includes(needle),`self-build workflow missing ${needle}`);
assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(workflow));assert.ok(!/gh\s+pr\s+merge/i.test(workflow));assert.ok(!/gh\s+workflow\s+run/i.test(workflow));assert.ok(!/^\s*workflow_run\s*:/m.test(workflow));
assert.equal(governor.currentSuccessorFloor,'R175');for(const revision of ['R171','R172','R173','R174','R175'])assert.ok(governor.promotedSuccessorContinuity.includes(revision),`missing promoted successor ${revision}`);
assert.equal(governor.successorWorkflowPolicy.readOnly,true);assert.equal(governor.successorWorkflowPolicy.mainPushAllowed,false);assert.equal(governor.successorWorkflowPolicy.recurringScheduleAllowed,false);assert.equal(governor.successorWorkflowPolicy.dynamicProofRunner,'scripts/prove_successor_workflow_invariants_r175.mjs');
console.log(`R170.2 / R175.2 GOVERNED SELF-BUILD INVARIANTS PASS · generation ${state.generation}/${state.maxAutonomousGenerations} · admitted ${admitted.length} · floor ${governor.currentSuccessorFloor}`);

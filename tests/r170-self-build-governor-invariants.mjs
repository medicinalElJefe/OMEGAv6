import assert from 'node:assert/strict';
import fs from 'node:fs';
const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const engine=fs.readFileSync('scripts/r170-selfbuild-engine.mjs','utf8');
const collector=fs.readFileSync('scripts/collect_selfbuild_residual_gate_r170.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
assert.equal(state.schema,'OMEGA_GOVERNED_SELFBUILD_STATE_R170');
assert.equal(state.active,true);assert.equal(state.generation,0);assert.equal(state.maxAutonomousGenerations,5);assert.equal(state.roadmap.length,5);
for(const law of ['EXACT_CURRENT_MAIN_REQUIRES_SUCCESSFUL_PRODUCTION_CLOUD_BRIDGE_PUSH_PROOF','UNPROVEN_OR_RED_PRODUCTION_HEAD_FORCES_OBSERVE_ONLY','AUTONOMOUS_BUILD_MAY_PROPOSE_SOURCE_BUT_MAY_NOT_MUTATE_MAIN_DIRECTLY','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY','HIGH_OR_CRITICAL_RESIDUALS_BLOCK_AUTONOMOUS_CANDIDATE_GENERATION','NO_RECURSIVE_PUSH_OR_WORKFLOW_RUN_TRIGGER_CHAIN'])assert.ok(state.laws.includes(law),`missing ${law}`);
for(const capsule of state.roadmap){assert.match(capsule.id,/^SG00[1-5]$/);assert.match(capsule.target,/^src\/generated\/selfbuildR170\//);assert.ok(['LOW','MEDIUM'].includes(capsule.risk))}
assert.match(engine,/BLOCKED_BY_RESIDUAL_GATE/);assert.match(engine,/PROVED_PENDING_PR/);assert.match(engine,/canonicalAdmission:false/);assert.ok(!/git\s+push/i.test(engine));assert.ok(!/Math\.random|crypto\.random/i.test(engine));
for(const needle of ['api/core-health','api/release-evidence','api/runtime-attestation','api/hybrid/status','UNREACHABLE'])assert.ok(collector.includes(needle));
assert.match(workflow,/gh run list/,'self-build must query canonical production proof');
assert.match(workflow,/headSha/,'self-build must match exact main SHA');
assert.match(workflow,/production_ready/,'self-build must expose production readiness');
assert.match(workflow,/OBSERVE_ONLY/,'red/unproven production must remain observe-only');
assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(workflow));assert.ok(!/gh\s+pr\s+merge/i.test(workflow));assert.ok(!/gh\s+workflow\s+run/i.test(workflow));assert.ok(!/^\s*workflow_run\s*:/m.test(workflow));
console.log('R170.1 GOVERNED SELF-BUILD INVARIANTS PASS');

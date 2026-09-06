import fs from 'node:fs';
import assert from 'node:assert/strict';

const runtime=fs.readFileSync('src/accuracyResidualEngineR125.ts','utf8');
const engine=fs.readFileSync('scripts/r125-accuracy-engine.mjs','utf8');
const r124=JSON.parse(fs.readFileSync('public/omega-r124-selfbuild-state.json','utf8'));

assert.match(runtime,/NO_PROPOSAL_WITHOUT_EXPLICIT_EVIDENCE/);
assert.match(runtime,/UNVERIFIED_EVIDENCE_CANNOT_AUTHORIZE_MUTATION/);
assert.match(runtime,/AUTO_REPAIR_REQUIRES_REPRODUCIBLE_RESIDUAL_CONFIDENCE_GTE_0_92_AND_LOW_RISK_REGISTERED_RECIPE/);
assert.match(runtime,/TRUTH_BOUNDARY_RISK_ALWAYS_BLOCKS_AUTONOMOUS_MUTATION/);
assert.match(engine,/OMEGA_R125_APPLY/);
assert.match(engine,/AUTO_REPAIR/);
assert.match(engine,/QUEUE_FOR_REVIEW/);
assert.match(engine,/OBSERVE_ONLY/);
assert.match(engine,/Refuse index generation: missing admitted target/);
assert.match(engine,/githubRunsObserved/);
assert.equal(r124.generation,8);
assert.deepEqual(r124.admitted,['SB001','SB002','SB003','SB004','SB005','SB006','SB007','SB008']);
for(const c of r124.roadmap)assert.equal(fs.existsSync(c.target),true,`admitted target missing: ${c.target}`);
console.log('R125 accuracy-first residual engine invariants: PASS');

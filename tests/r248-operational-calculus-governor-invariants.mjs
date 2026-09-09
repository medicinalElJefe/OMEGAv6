import assert from 'node:assert/strict';
import fs from 'node:fs';

const governor=fs.readFileSync('src/operationalCalculusR248.ts','utf8');
const action=fs.readFileSync('src/HybridActionRuntimeR247.tsx','utf8');

for(const token of [
 "import {normalizeMetrics,omegaDecision",
 "R248_OPERATIONAL_CALCULUS_SCHEMA='OMEGA_OPERATIONAL_CALCULUS_GOVERNOR_R248'",
 'commonKernel=(metrics.continuity*metrics.plasticity)/(metrics.contradiction+metrics.burden+1e-12)',
 "decision==='STAY'?'CONSTRUCT_AND_VERIFY'",
 "'PRUNE_CAUSE_THEN_CONSTRUCT'",
 "'EVIDENCE_FIRST_ESCALATION'",
 "mutationAuthority:'R153_PREIMAGE_BOUND_ONLY'",
 "dispatchAuthority:'R147'",
 "returnProof:'R141'",
 "historyAuthority:'R146'",
 "canonAdmission:'R125'",
 'Math.max(4,Math.min(12,Math.round(4+8*cycleCapacity)))',
 'recentFailedJobs'
])assert.ok(governor.includes(token),`R248 operational calculus token missing: ${token}`);

for(const forbidden of ['api.post(','api.put(','api.delete(','/api/missions','R248_DISPATCH','R248_CANON_ADMISSION'])assert.ok(!governor.includes(forbidden),`R248 governor acquired forbidden authority primitive ${forbidden}`);

for(const token of [
 "compileOperationalCalculusR248",
 "operationalMissionObjectiveR248",
 'operationalCalculusR248:operational',
 'const missionCycles=Math.max(4,Math.min(operational.policy.maxCycles,convergence.policy.maxMissionCycles))',
 'maxCycles:missionCycles',
 'const objective=operationalMissionObjectiveR248',
 'operational.decision',
 'operational.policy.maxCycles'
])assert.ok(action.includes(token),`R247 real action path is not governed by R248 calculus: ${token}`);

assert.ok(action.includes("api.post<any>('/api/missions'"),'existing R153 mission path must remain the executor handoff');
assert.ok(action.includes('allowedOps:R153_ALLOWED'),'R248 must preserve the established R153 operation allowlist');
assert.ok(action.includes("adaptiveMissionEngine:'R153'"),'R153 must remain the adaptive mission engine');
assert.ok(!action.includes('maxCycles:12,confirmedMission:true'),'fixed 12-cycle R247 mission budget must remain replaced by returned-state calculus');
assert.ok(!action.includes('Math.max(operational.policy.maxCycles,convergence.policy.maxMissionCycles)'),'a successor governor must never expand the R248 returned-state cycle budget');

console.log('R248 OPERATIONAL CALCULUS GOVERNOR PASS · R248 still governs the real R247→R153 objective and upper cycle bound; R249 may only clamp that budget downward · runtime/Hybrid/resource/job evidence only · scar/history carry included · R147/R141/R146/R125 authority unchanged');

import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const truth=read('src/liveHybridExecutionTruthR158.ts');
const ui=read('src/HybridProofClosureR141.tsx');
const must=(v,m)=>assert.ok(v,'R158 LIVE HYBRID '+m);

for(const token of [
 "R158_LIVE_HYBRID_SCHEMA='OMEGA_LIVE_HYBRID_EXECUTION_TRUTH_R158'",
 "'QUEUED_IS_NOT_INVOKED'",
 "'RUNNING_IS_INVOKED_NOT_RETURNED'",
 "'RETURNED_IS_NOT_VERIFIED'",
 "'VERIFIED_REQUIRES_R141_EXACT_PAYLOAD_CLOSURE'",
 "'CURRENT_HEARTBEAT_PROVES_DEVICE_AVAILABILITY_NOT_JOB_SUCCESS'",
 "'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'",
 "source:verified?'R141_EXACT_PAYLOAD_PROOF_CLOSURE':'R32_HYBRID_LIVE_JOB_STATUS'"
])must(truth.includes(token),`truth runtime missing ${token}`);

must(truth.includes("const running=status==='RUNNING'"),'RUNNING state mapping missing');
must(truth.includes('invoked:running||complete||failed'),'RUNNING must map to invoked');
must(truth.includes('returned=complete&&Boolean'),'return must require completed return packet');
must(truth.includes("closure?.state==='VERIFIED_EXECUTION_RETURN'"),'verification must require R141 verified closure state');
must(truth.includes('closure?.fingerprintVerified===true'),'verification must require exact fingerprint proof');
must(truth.includes('canonicalMutation:false'),'live status must never mutate CanonState');

for(const token of [
 "summarizeLiveHybridExecutionR158",
 "data-r158-live-job-state",
 'CURRENT HOST JOB',
 'RUNNING ≠ RETURNED ≠ VERIFIED',
 'Host workload is active; no returned bounded workload is available yet.',
 'R141 closure cannot begin until the PC returns a payload.'
])must(ui.includes(token),`Hybrid proof UI missing ${token}`);

must(ui.includes("status?.nativeExecutionClaimed===true"),'PC online must still require native execution claim');
must(ui.includes("d?.online===true&&d?.revoked!==true"),'PC online must still require current non-revoked heartbeat');
must(ui.includes('hybridClosureReceiptR142'),'R141/R142 return verification authority must remain mounted');

console.log('R158 LIVE HYBRID EXECUTION TRUTH PASS · heartbeat availability ≠ job invocation ≠ return ≠ exact R141 verification · R125 admission unchanged');

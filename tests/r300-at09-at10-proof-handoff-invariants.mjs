import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const client=read('public/omega-pc-proof-r205.js');
const html=read('public/omega-pc-proof-r205.html');
const contract=JSON.parse(read('public/omega-r205-pc-proof-contract.json'));
const must=(ok,msg)=>assert.ok(ok,`R300 AT09/AT10 handoff failed: ${msg}`);

must(contract.schema==='OMEGA_PC_PROOF_CLOSURE_R205','R205 proof contract identity drifted');
must(contract.authority?.explicitConfirmationRequired===true,'explicit confirmation requirement must remain true');
must(contract.authority?.r141FingerprintVerificationRequired===true,'R141 verification requirement must remain true');
must(contract.authority?.canonicalAdmissionAuthority==='R125'&&contract.authority?.canonicalMutation===false,'R125 sole admission/no-Canon-mutation boundary drifted');

for(const token of [
 "const ARM_KEY='omega.r300.pcProofArmed'",
 "localStorage.getItem(ARM_KEY)==='1'",
 "localStorage.setItem(ARM_KEY,'1')",
 "state.armed&&state.device&&!state.busy&&(!state.job||terminalJob(state.job))&&state.autoAttemptedDeviceId!==state.device.id",
 "queueMicrotask(()=>runProof({automatic:true}))",
 "handoff:'R300_ARMED_EXPLICIT_CONFIRMATION'",
 "post('/api/missions'",
 "targetDeviceId:state.device.id",
 "allowedOps:['DESKTOP_HEALTH','FORENSIC_HASH_LEDGER']",
 'confirmedMission:true',
 "state.armed=false;writeArmed(false)",
 "$('jobState').textContent=job?.status||(state.armed?'ARMED · WAITING':'NO JOB')",
 "btn.setAttribute('aria-pressed',state.armed?'true':'false')",
 "if(!m?.id||!m?.currentJob?.id)throw new Error('No durable R205 mission/job identity returned; nothing was queued.')"
])must(client.includes(token),`required handoff token missing: ${token}`);

const postCount=(client.match(/post\('\/api\/missions'/g)||[]).length;
must(postCount===1,`R300 must retain exactly one mission-submission path, found ${postCount}`);
must(!client.includes("post('/api/hybrid/")&&!client.includes("post('/api/canon")&&!client.includes("post('/api/deploy"),'R300 introduced a second direct execution/Canon/deployment POST path');
for(const forbidden of ["op:'APPLY_PATCH'","op:'WRITE_TEXT'","op:'BUILD'","op:'TEST'","op:'PACKAGE'","op:'RUN_COMMAND'"])must(!client.includes(forbidden),`armed proof widened operation scope with ${forbidden}`);

const durableGate=client.indexOf("if(!m?.id||!m?.currentJob?.id)throw new Error('No durable R205 mission/job identity returned; nothing was queued.')");
const disarm=client.indexOf('state.armed=false;writeArmed(false)');
must(durableGate>=0&&disarm>durableGate,'armed confirmation may only clear after durable mission/job identity exists');
must(client.includes("state.armed=!state.armed;writeArmed(state.armed)")&&client.includes("state.armed=false;writeArmed(false);state.autoAttemptedDeviceId=null"),'offline arm/cancel must remain explicit and reversible');
must(client.includes("state.autoAttemptedDeviceId=state.device.id")&&client.includes("state.autoAttemptedDeviceId!==state.device.id"),'automatic submission must be one-shot per observed device in the current page lifetime');

for(const token of [
 'data-r300-handoff="ARMED_EXPLICIT_CONFIRMATION"',
 'Run or arm current PC proof closure',
 'Arm once even when the host is offline.',
 'no command is queued while no eligible authenticated R205 host exists',
 'Armed state alone is not execution evidence.',
 'R300 adds no execution, dispatch, Canon, device, or deployment authority.',
 'aria-pressed="false"'
])must(html.includes(token),`visible truth/arming boundary missing: ${token}`);

const liveVerifier=read('scripts/verify_live_r300_at09_at10_handoff.mjs');
for(const token of ["if(!r.ok)", "r.headers.get('cf-ray')", "r.headers.get('content-type')", "OMEGA_STAGED_READ_ONLY", "body.slice(0,240)"]){
 must(liveVerifier.includes(token),`R690 diagnostic source lost fail-closed HTTP evidence: ${token}`);
}
must(!liveVerifier.includes('if(r.status===500)continue')&&!liveVerifier.includes('if(r.status===500)return'),'R690 cannot bypass an HTTP 500');

const workerR101=read('src/workerR101.js');
const statusStart=workerR101.indexOf('async function hybridStatusR101('),statusEnd=workerR101.indexOf('async function reconnectHybridR101(',statusStart);
must(statusStart>=0&&statusEnd>statusStart,'R691 Hybrid status path not present');
const statusSource=workerR101.slice(statusStart,statusEnd);
for(const token of ["HYBRID_STATUS_RUNTIME_UNREACHABLE","HYBRID_STATUS_UPSTREAM_FAILURE","HYBRID_STATUS_MALFORMED_UPSTREAM","HYBRID_STATUS_INVALID_UPSTREAM_SCHEMA","RUNTIME_STATUS_UNKNOWN","if(!response.ok)","if(!data||typeof data!=='object'"]){
 must(statusSource.includes(token),`R691 missing upstream error gate ${token}`);
}
must(statusSource.indexOf('if(!response.ok)')<statusSource.indexOf('const devices='),'R691 upstream failure must veto derived online/offline status');

console.log('R300 AT09/AT10 PROOF HANDOFF PASS · explicit browser-local arm · offline remains non-execution · one-shot eligible-host submission through existing /api/missions authority · DESKTOP_HEALTH + FORENSIC_HASH_LEDGER only · durable identity before disarm · R141 verification and R125 Canon boundary preserved');

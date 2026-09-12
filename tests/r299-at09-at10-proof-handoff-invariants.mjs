import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const client=read('public/omega-pc-proof-r205.js');
const html=read('public/omega-pc-proof-r205.html');
const contract=JSON.parse(read('public/omega-r205-pc-proof-contract.json'));
const must=(ok,msg)=>assert.ok(ok,`R299 AT09/AT10 handoff failed: ${msg}`);

must(contract.schema==='OMEGA_PC_PROOF_CLOSURE_R205','R205 proof contract identity drifted');
must(contract.authority?.explicitConfirmationRequired===true,'explicit confirmation requirement must remain true');
must(contract.authority?.r141FingerprintVerificationRequired===true,'R141 verification requirement must remain true');
must(contract.authority?.canonicalAdmissionAuthority==='R125'&&contract.authority?.canonicalMutation===false,'R125 sole admission/no-Canon-mutation boundary drifted');

for(const token of [
 "const ARM_KEY='omega.r299.pcProofArmed'",
 "localStorage.getItem(ARM_KEY)==='1'",
 "localStorage.setItem(ARM_KEY,'1')",
 "state.armed&&state.device&&!state.busy&&(!state.job||terminalJob(state.job))&&state.autoAttemptedDeviceId!==state.device.id",
 "queueMicrotask(()=>runProof({automatic:true}))",
 "handoff:'R299_ARMED_EXPLICIT_CONFIRMATION'",
 "post('/api/missions'",
 "targetDeviceId:state.device.id",
 "allowedOps:['DESKTOP_HEALTH','FORENSIC_HASH_LEDGER']",
 'confirmedMission:true',
 "state.armed=false;writeArmed(false)",
 "if(!m?.id||!m?.currentJob?.id)throw new Error('No durable R205 mission/job identity returned; nothing was queued.')"
])must(client.includes(token),`required handoff token missing: ${token}`);

const postCount=(client.match(/post\('\/api\/missions'/g)||[]).length;
must(postCount===1,`R299 must retain exactly one mission-submission path, found ${postCount}`);
must(!client.includes("post('/api/hybrid/")&&!client.includes("post('/api/canon")&&!client.includes("post('/api/deploy"),'R299 introduced a second direct execution/Canon/deployment POST path');
for(const forbidden of ["op:'APPLY_PATCH'","op:'WRITE_TEXT'","op:'BUILD'","op:'TEST'","op:'PACKAGE'","op:'RUN_COMMAND'"])must(!client.includes(forbidden),`armed proof widened operation scope with ${forbidden}`);

const durableGate=client.indexOf("if(!m?.id||!m?.currentJob?.id)throw new Error('No durable R205 mission/job identity returned; nothing was queued.')");
const disarm=client.indexOf('state.armed=false;writeArmed(false)');
must(durableGate>=0&&disarm>durableGate,'armed confirmation may only clear after durable mission/job identity exists');
must(client.includes("state.armed=!state.armed;writeArmed(state.armed)")&&client.includes("state.armed=false;writeArmed(false);state.autoAttemptedDeviceId=null"),'offline arm/cancel must remain explicit and reversible');
must(client.includes("state.autoAttemptedDeviceId=state.device.id")&&client.includes("state.autoAttemptedDeviceId!==state.device.id"),'automatic submission must be one-shot per observed device in the current page lifetime');

for(const token of [
 'data-r299-handoff="ARMED_EXPLICIT_CONFIRMATION"',
 'Run or arm current PC proof closure',
 'Arm once even when the host is offline.',
 'no command is queued while no eligible authenticated R205 host exists',
 'Armed state alone is not execution evidence.',
 'R299 adds no execution, dispatch, Canon, device, or deployment authority.'
])must(html.includes(token),`visible truth/arming boundary missing: ${token}`);

console.log('R299 AT09/AT10 PROOF HANDOFF PASS · explicit browser-local arm · offline remains non-execution · one-shot eligible-host submission through existing /api/missions authority · DESKTOP_HEALTH + FORENSIC_HASH_LEDGER only · durable identity before disarm · R141 verification and R125 Canon boundary preserved');

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

// R692: execute the real production Worker route with a controlled Durable Object.
// This proves negative HTTP and malformed bytes cannot be mislabeled as offline.
const {default:hybridWorker}=await import('../src/workerR101.js');
const hybridRequest=new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/hybrid/status',{headers:{'x-omega-bridge-id':'r692_fixture'}});
async function exerciseHybridStatus(upstream){
 const env={OMEGA_RUNTIME:{idFromName:name=>name,get:()=>({fetch:async()=>{if(upstream instanceof Error)throw upstream;return upstream}})}};
 const response=await hybridWorker.fetch(hybridRequest,env);
 return {status:response.status,body:await response.json()};
}
for(const [name,source,expectedCode] of [
 ['upstream 500',new Response(JSON.stringify({state:'PAIRING_REQUIRED',devices:[]}),{status:500}),'HYBRID_STATUS_UPSTREAM_FAILURE'],
 ['upstream transport error',new Error('runtime unavailable'),'HYBRID_STATUS_RUNTIME_UNREACHABLE'],
 ['invalid JSON',new Response('not json',{status:200}),'HYBRID_STATUS_MALFORMED_UPSTREAM'],
 ['missing device array',new Response(JSON.stringify({state:'PAIRING_REQUIRED'}),{status:200}),'HYBRID_STATUS_INVALID_UPSTREAM_SCHEMA']
]){
 const result=await exerciseHybridStatus(source);
 must(result.status>=500&&result.body.code===expectedCode&&result.body.state==='RUNTIME_STATUS_UNKNOWN',`R692 ${name} must remain explicit non-success unknown runtime state`);
 must(result.body.state!=='DEVICE_PROOF_REQUIRED'&&result.body.state!=='VERIFIED_DEVICE_ONLINE',`R692 ${name} cannot fabricate native-host status`);
}
const healthy=await exerciseHybridStatus(new Response(JSON.stringify({state:'PAIRING_REQUIRED',devices:[]}),{status:200}));
must(healthy.status===200&&healthy.body.state==='DEVICE_PROOF_REQUIRED'&&healthy.body.nativeExecutionClaimed===false,'R692 healthy no-host status must preserve truthful offline projection');

// R693: upstream online flags alone cannot establish current host execution proof.
for(const [label,lastSeen] of [['absent',undefined],['stale',Date.now()-120000],['future',Date.now()+120000]]){
 const source={state:'VERIFIED_DEVICE_ONLINE',devices:[{id:'fixture',online:true,lastSeen}]};
 const result=await exerciseHybridStatus(new Response(JSON.stringify(source),{status:200}));
 must(result.status===200&&result.body.state==='DEVICE_PROOF_REQUIRED'&&result.body.nativeExecutionClaimed===false,`R693 ${label} heartbeat cannot establish native online status`);
}
const fresh=await exerciseHybridStatus(new Response(JSON.stringify({state:'VERIFIED_DEVICE_ONLINE',devices:[{id:'fixture',online:true,revoked:false,lastSeen:Date.now()}]}),{status:200}));
must(fresh.status===200&&fresh.body.state==='VERIFIED_DEVICE_ONLINE'&&fresh.body.nativeExecutionClaimed===true,'R693 current heartbeat must retain verified online claim');

// R694: future-dated heartbeat cannot pollute historical authenticated proof.
const futureProof=await exerciseHybridStatus(new Response(JSON.stringify({state:'VERIFIED_DEVICE_ONLINE',devices:[{id:'future',online:true,lastSeen:Date.now()+120000}]}),{status:200}));
must(futureProof.body.state==='DEVICE_PROOF_REQUIRED'&&futureProof.body.lastAuthenticatedHeartbeat===null,'R694 future heartbeat must not be asserted as historical authentication');
const oldProofAt=Date.now()-120000;
const oldProof=await exerciseHybridStatus(new Response(JSON.stringify({state:'PAIRING_REQUIRED',devices:[{id:'stale',online:false,lastSeen:oldProofAt}]}),{status:200}));
must(oldProof.body.state==='DEVICE_PROOF_REQUIRED'&&oldProof.body.lastAuthenticatedHeartbeat===oldProofAt,'R694 valid stale authenticated proof must remain historical without implying current PC online');

const stagedRelease=read('scripts/staged-cloudflare-release.sh');
for(const token of ['stage_candidate_with_visibility_retry()',"'[code: 100146]'","'The requested Worker version could not be found'",'assert_current_main_owner || return $?','if [[ "$attempt" == "4" ]]','if stage_candidate_with_visibility_retry; then']){
 must(stagedRelease.includes(token),`R695 bounded Cloudflare version visibility gate missing: ${token}`);
}
must(stagedRelease.includes('STAGED_DEPLOYMENT_READY=0')&&stagedRelease.includes('R322 forward deployment confirmed'),'R695 must retain 100/0 membership proof and exceptional R322 recovery gate');


const {spawnSync}=await import('node:child_process');
const retryStart=stagedRelease.indexOf('stage_candidate_with_visibility_retry(){');
const retryEnd=stagedRelease.indexOf('\nif stage_candidate_with_visibility_retry; then',retryStart);
must(retryStart>=0&&retryEnd>retryStart,'R696 exact deploy retry function extraction');
const retryFunction=stagedRelease.slice(retryStart,retryEnd);
const fakeWrangler=[
'set -Eeuo pipefail',
'WORKER_NAME=omegav6',
'GITHUB_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
'PREVIOUS_VERSION_ID=previous',
'CANDIDATE_VERSION_ID=candidate',
'SPLIT_LOG="$(mktemp)"',
'COUNT_FILE="$(mktemp)"',
'printf 0 > "$COUNT_FILE"',
"trap 'rm -f \"$SPLIT_LOG\" \"$COUNT_FILE\"' EXIT",
'assert_current_main_owner(){ if [[ "$TEST_SCENARIO" == "superseded_initial" ]] || [[ "$TEST_SCENARIO" == "superseded" && "$(cat "$COUNT_FILE")" -ge 1 ]]; then return 75; fi; return 0; }',
'sleep(){ :; }',
'npx(){',
' local count',
' count="$(cat "$COUNT_FILE")"',
' count=$((count+1))',
' printf "%s" "$count" > "$COUNT_FILE"',
' if [[ ( "$TEST_SCENARIO" == "transient" || "$TEST_SCENARIO" == "superseded" ) && "$count" == "1" ]] || [[ "$TEST_SCENARIO" == "persistent" ]]; then',
'  echo "The requested Worker version could not be found, please check the ID being passed and try again. [code: 100146]" >&2',
'  return 1',
' fi',
' if [[ "$TEST_SCENARIO" == "other" ]]; then',
'  echo "Cloudflare credentials invalid [code: 10000]" >&2',
'  return 1',
' fi',
' echo "mock staging success"',
' return 0',
'}'
].join('\n');
for(const [scenario,expectedCode,expectedAttempts] of [['transient',0,2],['persistent',1,4],['other',1,1],['superseded',75,1],['superseded_initial',75,0],['clean',0,1]]){
 const output=spawnSync('bash',['-c',fakeWrangler+'\n'+retryFunction+'\nstage_candidate_with_visibility_retry'],{env:{...process.env,TEST_SCENARIO:scenario},encoding:'utf8',timeout:10000});
 must(!output.error&&output.status===expectedCode,'R696 '+scenario+' exit '+output.status+' stderr '+output.stderr);
 const attempts=(output.stdout.match(/mock staging success|The requested Worker version could not be found|Cloudflare credentials invalid/g)||[]).length;
 must(attempts===expectedAttempts,'R696 '+scenario+' retry count '+attempts+' versus '+expectedAttempts);
 if(scenario==='persistent')must(output.stdout.includes('VERSION VISIBILITY EXHAUSTED'),'R696 persistent code 100146 must exhaust');
 if(scenario==='other')must(!output.stdout.includes('VERSION VISIBILITY PENDING'),'R696 other errors must not retry');
 if(scenario==='superseded')must(output.stdout.includes('VERSION VISIBILITY PENDING'),'R697 superseded run must reach second ownership gate after initial transient 100146');
 if(scenario==='superseded_initial')must(!output.stdout.includes('VERSION VISIBILITY PENDING')&&!output.stdout.includes('mock staging success'),'R698 preflight supersession must veto staging before first attempt');
}

console.log('R300 AT09/AT10 PROOF HANDOFF PASS · explicit browser-local arm · offline remains non-execution · one-shot eligible-host submission through existing /api/missions authority · DESKTOP_HEALTH + FORENSIC_HASH_LEDGER only · durable identity before disarm · R141 verification and R125 Canon boundary preserved');

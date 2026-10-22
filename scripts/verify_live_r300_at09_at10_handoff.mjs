const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
async function text(path){const r=await fetch(base+path,{headers:{'cache-control':'no-cache'},cache:'no-store'}),body=await r.text();if(!r.ok)throw new Error(`R300 ${path} HTTP ${r.status}: ${body.slice(0,240)}`);return body}
const [html,client,contractRaw,statusRaw]=await Promise.all([text('/omega-pc-proof-r205.html'),text('/omega-pc-proof-r205.js'),text('/omega-r205-pc-proof-contract.json'),text('/api/hybrid/status')]);
const contract=JSON.parse(contractRaw),status=JSON.parse(statusRaw);const must=(ok,msg)=>{if(!ok)throw new Error(`R300 live handoff failed: ${msg}`)};
must(html.includes('data-r300-handoff="ARMED_EXPLICIT_CONFIRMATION"'),'served proof surface lacks R300 handoff identity');
must(html.includes('Arm once even when the host is offline.'),'served proof surface lacks offline-arm instruction');
must(html.includes('no command is queued while no eligible authenticated R205 host exists'),'served proof surface lost non-execution truth boundary');
must(html.includes('Armed state alone is not execution evidence.'),'served proof surface can confuse armed state with execution evidence');
for(const token of ["const ARM_KEY='omega.r300.pcProofArmed'","state.armed&&state.device&&!state.busy&&(!state.job||terminalJob(state.job))&&state.autoAttemptedDeviceId!==state.device.id","queueMicrotask(()=>runProof({automatic:true}))","handoff:'R300_ARMED_EXPLICIT_CONFIRMATION'","post('/api/missions'","targetDeviceId:state.device.id","allowedOps:['DESKTOP_HEALTH','FORENSIC_HASH_LEDGER']",'confirmedMission:true',"state.armed=false;writeArmed(false)","$('jobState').textContent=job?.status||(state.armed?'ARMED · WAITING':'NO JOB')","btn.setAttribute('aria-pressed',state.armed?'true':'false')"])must(client.includes(token),`served client missing ${token}`);
must((client.match(/post\('\/api\/missions'/g)||[]).length===1,'served client must contain exactly one governed mission-submission path');
must(!client.includes("post('/api/hybrid/")&&!client.includes("post('/api/canon")&&!client.includes("post('/api/deploy"),'served client gained a direct execution/Canon/deployment POST path');
must(contract.schema==='OMEGA_PC_PROOF_CLOSURE_R205','R205 contract identity drifted');
must(contract.authority?.explicitConfirmationRequired===true,'explicit confirmation requirement drifted');
must(contract.authority?.r141FingerprintVerificationRequired===true,'R141 fingerprint requirement drifted');
must(contract.authority?.canonicalAdmissionAuthority==='R125'&&contract.authority?.canonicalMutation===false,'R125/no-Canon-mutation boundary drifted');
const current=Array.isArray(status.devices)?status.devices.filter(d=>d?.online&&!d?.revoked):[];
if(status.state==='VERIFIED_DEVICE_ONLINE')must(status.nativeExecutionClaimed===true&&current.length>0,'live status claims verified device without current authenticated heartbeat');else if(status.state==='DEVICE_PROOF_REQUIRED')must(status.nativeExecutionClaimed===false&&current.length===0,'device-proof-required state conflicts with current heartbeat truth');else throw new Error(`R300 live handoff received unsupported Hybrid truth state ${status.state}`);
console.log(`R300 LIVE AT09/AT10 HANDOFF PASS · ${base}/omega-pc-proof-r205.html · ${current.length} current authenticated host(s) · armed state remains non-execution · one governed /api/missions path · DESKTOP_HEALTH + FORENSIC_HASH_LEDGER only · R141 verification + R125 Canon authority preserved`);

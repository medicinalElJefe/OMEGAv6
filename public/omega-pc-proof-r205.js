const SESSION_KEY='omega.v6.runtime.session.r32';
const BRIDGE_KEY='omega.v6.hybrid.bridge.r32';
const JOB_KEY='omega.r205.pcProofJob';
const MISSION_KEY='omega.r205.pcProofMission';
const ARM_KEY='omega.r299.pcProofArmed';

const $=id=>document.getElementById(id);
const state={live:null,device:null,missionId:null,jobId:null,job:null,closure:null,busy:false,armed:readArmed(),autoAttemptedDeviceId:null,autoError:''};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function readArmed(){try{return localStorage.getItem(ARM_KEY)==='1'}catch{return false}}
function writeArmed(value){try{value?localStorage.setItem(ARM_KEY,'1'):localStorage.removeItem(ARM_KEY)}catch{}}
function session(){let x='';try{x=localStorage.getItem(SESSION_KEY)||''}catch{}if(!/^[A-Za-z0-9._:-]{8,128}$/.test(x)){x=`session_${crypto.randomUUID?.()||Date.now().toString(36)}`;try{localStorage.setItem(SESSION_KEY,x)}catch{}}return x}
function authHeaders(json=false){const h={'x-omega-session-id':session(),'cache-control':'no-cache'};try{const b=JSON.parse(localStorage.getItem(BRIDGE_KEY)||'null');if(b?.bridgeId&&b?.secret){h['x-omega-bridge-id']=b.bridgeId;h['x-omega-bridge-secret']=b.secret}}catch{}if(json)h['content-type']='application/json';return h}
async function get(path){const r=await fetch(path,{headers:authHeaders(false),cache:'no-store',credentials:'same-origin'}),raw=await r.text();if(!r.ok)throw new Error(`${path} HTTP ${r.status}: ${raw.slice(0,300)}`);return raw?JSON.parse(raw):null}
async function post(path,body){const r=await fetch(path,{method:'POST',headers:authHeaders(true),body:JSON.stringify(body),cache:'no-store',credentials:'same-origin'}),raw=await r.text();let data=null;try{data=raw?JSON.parse(raw):null}catch{}if(!r.ok)throw new Error(data?.reply||data?.code||`${path} HTTP ${r.status}: ${raw.slice(0,300)}`);return data}

const currentDevices=live=>(Array.isArray(live?.devices)?live.devices:[]).filter(d=>d?.online&&!d?.revoked);
const r205Capable=d=>Array.isArray(d?.proofExtensions)&&d.proofExtensions.includes('R205')&&Array.isArray(d?.capabilities)&&d.capabilities.includes('DESKTOP_HEALTH')&&d.capabilities.includes('FORENSIC_HASH_LEDGER');
const hex64=v=>/^[0-9a-f]{64}$/i.test(String(v||''));
const terminalJob=job=>['COMPLETE','FAILED','HOLD_REPAIR_REQUIRED','CANCELLED'].includes(String(job?.status||''));

function closureVerified(){const c=state.closure;return Boolean(c?.schema==='OMEGA_HYBRID_PROOF_SCAR_REPLAY_R141'&&c?.revision==='R141'&&c?.fingerprint?.verified===true&&hex64(c?.fingerprint?.supplied)&&hex64(c?.finalHeadSha256))}
function rawStepResult(op){return state.job?.returnPacket?.stepProofs?.find(x=>x?.op===op&&x?.ok===true)?.result||null}
function closureStepResult(op){return state.closure?.input?.core?.stepProofs?.find(x=>x?.op===op&&x?.ok===true)?.result||null}
function setResidual(id,label,kind,proof){const card=$(id),stateEl=$(id+'State'),proofEl=$(id+'Proof');card.classList.remove('pass','hold');if(kind==='pass')card.classList.add('pass');if(kind==='hold')card.classList.add('hold');stateEl.textContent=label;proofEl.textContent=proof}

function render(){
 const live=state.live||{},devices=currentDevices(live),device=devices.find(r205Capable)||devices[0]||null,capable=device&&r205Capable(device),verified=closureVerified();
 state.device=capable?device:null;
 $('hostState').textContent=devices.length?'PC ONLINE':live.state==='DEVICE_PROOF_REQUIRED'?'DEVICE PROOF REQUIRED':live.state||'PAIRING REQUIRED';
 $('hostDetail').textContent=devices.length?`${devices.length} current authenticated non-revoked heartbeat${devices.length===1?'':'s'} · ${device?.name||device?.id||'host'} · ${device?.platform||'platform unknown'}`:'No current authenticated host heartbeat is available to execute R205.';
 $('extensionState').textContent=capable?'R205 READY':devices.length?'AGENT UPDATE REQUIRED':'HELD';
 $('extensionDetail').textContent=capable?`${device.version||'R34.1'} / ${device.capabilityRevision||'R132'} · DESKTOP_HEALTH + FORENSIC_HASH_LEDGER advertised`:(devices.length?'The current host is online but does not advertise the R205 proof extension. Download/run the current canonical connector.':'R205 capability is never inferred without a current registered device.');
 $('identityState').textContent=state.missionId?`MISSION ${state.missionId}`:state.armed?'ARMED':'NONE';
 $('identityDetail').textContent=state.jobId?`Current durable job ${state.jobId}`:state.armed?'AT09 + AT10 are armed in this browser. No command is queued until a current authenticated non-revoked R205-capable host appears.':'No R205 mission/job identity has been admitted in this browser session.';

 const rawHealth=rawStepResult('DESKTOP_HEALTH'),rawLedger=rawStepResult('FORENSIC_HASH_LEDGER'),health=closureStepResult('DESKTOP_HEALTH')||rawHealth,ledger=closureStepResult('FORENSIC_HASH_LEDGER')||rawLedger;
 const healthPass=verified&&health?.schema==='OMEGA_DESKTOP_HEALTH_R205'&&health?.state==='PASS'&&hex64(health?.healthSha256);
 const ledgerPass=verified&&ledger?.schema==='OMEGA_FORENSIC_HASH_LEDGER_RECEIPT_R205'&&ledger?.state==='PASS'&&ledger?.complete===true&&hex64(ledger?.ledgerSha256)&&hex64(ledger?.treeSha256)&&String(ledger?.ledgerPath||'').startsWith('.omega_hybrid/forensics/');
 if(healthPass)setResidual('at09','PASS · R141 VERIFIED','pass',`healthSha256 ${health.healthSha256}\nR141 fingerprint ${state.closure.fingerprint.supplied}\nfinal head ${state.closure.finalHeadSha256}\ncanonical health ${health.checks?.canonicalHealthReachable}\nWindows host ${health.checks?.windowsHost}\nnon-system root ${health.checks?.nonSystemRoot}\nwrite smoke ${health.checks?.approvedRootWriteSmoke}\nroot ${health.rootLabel} · free ${health.disk?.freeBytes??'unknown'} bytes`);
 else if(health)setResidual('at09',verified?String(health.state||'HOLD'):'RETURNED · R141 VERIFICATION REQUIRED','hold',verified?JSON.stringify(health,null,2):`Raw DESKTOP_HEALTH return exists but exact R141 payload SHA + semantic equality has not been proved.\nhealthSha256 ${health.healthSha256||'—'}\nLegacy/raw return is evidence, not verified historical proof.`);
 else setResidual('at09',capable?'READY · RETURN REQUIRED':state.armed?'ARMED · WAITING FOR HOST':'HOST PROOF REQUIRED','hold',state.armed?'Explicit proof request is armed. No DESKTOP_HEALTH command exists yet because no eligible current host is available.':'No returned DESKTOP_HEALTH proof. Current heartbeat/capability alone is not AT09 completion.');
 if(ledgerPass)setResidual('at10','PASS · COMPLETE + R141 VERIFIED','pass',`ledger ${ledger.ledgerPath}\nledgerSha256 ${ledger.ledgerSha256}\ntreeSha256 ${ledger.treeSha256}\nR141 fingerprint ${state.closure.fingerprint.supplied}\nfinal head ${state.closure.finalHeadSha256}\nfiles ${ledger.files}\ntotalBytes ${ledger.totalBytes}\ncomplete ${ledger.complete}`);
 else if(ledger)setResidual('at10',verified?String(ledger.state||'HOLD'):'RETURNED · R141 VERIFICATION REQUIRED','hold',verified?JSON.stringify(ledger,null,2):`Raw FORENSIC_HASH_LEDGER return exists but exact R141 payload SHA + semantic equality has not been proved.\ncomplete ${ledger.complete}\nledgerSha256 ${ledger.ledgerSha256||'—'}\ntreeSha256 ${ledger.treeSha256||'—'}\nA raw tree/ledger return is not promoted into verified historical proof.`);
 else setResidual('at10',capable?'READY · COMPLETE MANIFEST REQUIRED':state.armed?'ARMED · WAITING FOR HOST':'HOST PROOF REQUIRED','hold',state.armed?'Explicit proof request is armed. No FORENSIC_HASH_LEDGER command exists yet because no eligible current host is available.':'No returned FORENSIC_HASH_LEDGER proof. A tree hash or sample is not promoted into a complete-manifest claim.');

 const btn=$('run'),complete=healthPass&&ledgerPass,active=state.job&&!terminalJob(state.job);
 if(complete){btn.disabled=true;btn.textContent='AT09 + AT10 verified'}
 else if(state.busy){btn.disabled=true;btn.textContent='Submitting governed proof…'}
 else if(active){btn.disabled=true;btn.textContent='Proof mission active'}
 else if(capable){btn.disabled=false;btn.textContent=state.armed?(state.autoError?'Retry armed proof':'Proof armed · submit now'):'Run AT09 + AT10 proof'}
 else{btn.disabled=false;btn.textContent=state.armed?'Cancel armed proof':'Arm AT09 + AT10 proof'}

 const job=state.job;
 $('jobState').textContent=job?.status||state.armed?'ARMED · WAITING':'NO JOB';
 if(job)$('jobState').textContent=job.status||'JOB';
 $('jobDetail').textContent=job?`mission ${state.missionId||'unknown'}\njob ${job.id}\nstatus ${job.status}\ninput ${job.inputFingerprint||'pending'}\nlegacy return ${job.returnPacket?.resultFingerprint||'pending'}\nR141 ${state.closure?.state||'pending'}\nfingerprint verified ${state.closure?.fingerprint?.verified===true}\nR141 fingerprint ${state.closure?.fingerprint?.supplied||'pending'}\nfinal head ${state.closure?.finalHeadSha256||'pending'}\nproof extension ${job.returnPacket?.proofExtensions?.join(', ')||job.targetProofExtensions?.join(', ')||'pending'}\nCanon mutation: false · Canon admission authority: R125`:(state.autoError?`Armed handoff is still held after the last submission attempt: ${state.autoError}\nNo operation was promoted to PASS.`:state.armed?'Explicit confirmation is retained locally. The existing governed mission path will be used once a current R205-capable host is observed.':'No R205 job has been returned. Nothing is treated as executed or closed.');
}

async function refresh(){
 try{
  const live=await get('/api/hybrid/status');state.live=live;
  const savedJob=(()=>{try{return localStorage.getItem(JOB_KEY)}catch{return null}})(),savedMission=(()=>{try{return localStorage.getItem(MISSION_KEY)}catch{return null}})();
  if(savedMission)state.missionId=savedMission;if(savedJob)state.jobId=savedJob;
  const jobs=Array.isArray(live?.jobs)?live.jobs:[];
  state.job=state.jobId?jobs.find(x=>x.id===state.jobId)||null:[...jobs].reverse().find(x=>x?.schema==='OMEGA_MISSION_JOB_R32'&&Array.isArray(x?.steps)&&x.steps.some(s=>s?.op==='DESKTOP_HEALTH')&&x.steps.some(s=>s?.op==='FORENSIC_HASH_LEDGER'))||null;
  if(state.job&&!state.jobId){state.jobId=state.job.id;try{localStorage.setItem(JOB_KEY,state.jobId)}catch{}}
  state.closure=null;
  if(state.job?.id&&(state.job?.returnPacket||['COMPLETE','FAILED','HOLD_REPAIR_REQUIRED'].includes(String(state.job?.status||'')))){try{const closed=await get(`/api/hybrid/jobs/${encodeURIComponent(state.job.id)}/closure`);state.closure=closed?.closure||null}catch{state.closure=null}}
  render();
  if(state.armed&&state.device&&!state.busy&&(!state.job||terminalJob(state.job))&&state.autoAttemptedDeviceId!==state.device.id){
   state.autoAttemptedDeviceId=state.device.id;
   queueMicrotask(()=>runProof({automatic:true}));
  }
 }catch(e){state.live=null;state.device=null;state.closure=null;$('hostState').textContent='STATUS ERROR';$('hostDetail').textContent=e.message;render()}
}

async function runProof({automatic=false}={}){
 if(state.busy)return;
 if(!state.device){
  if(automatic)return;
  state.armed=!state.armed;writeArmed(state.armed);state.autoError='';if(!state.armed)state.autoAttemptedDeviceId=null;render();return;
 }
 state.busy=true;state.autoError='';if(!automatic)state.autoAttemptedDeviceId=state.device.id;render();
 try{
  const objective='Close OMEGA archive residual AT09 desktop health and AT10 forensic hash ledger using only authenticated returned host proof. Prove canonical runtime/CLI smoke and approved-root health, then generate a complete bounded file-hash manifest under .omega_hybrid/forensics. Do not patch source, build, deploy, mutate model weights, claim RCWA validity, close federation, or admit CanonState.';
  const steps=[{id:'S01',op:'DESKTOP_HEALTH',label:'Prove current desktop/runtime health from the authenticated host',path:'.'},{id:'S02',op:'FORENSIC_HASH_LEDGER',label:'Generate complete bounded forensic file-hash ledger',path:'.'}];
  const draft={schema:'OMEGA_PC_PROOF_AUDIT_R205',action:'PC_PROOF_AUDIT',profile:'AUTO_BUILD',projectPath:'.',instructions:objective,allowedDomains:[],steps};
  const data=await post('/api/missions',{objective,threadId:'',stateContext:JSON.stringify({surface:'OMEGA_PC_PROOF_CLOSURE_R205',handoff:'R299_ARMED_EXPLICIT_CONFIRMATION',archiveResiduals:['AT09','AT10'],transport:'R34.1',capability:'R132',proofExtension:'R205',proofClosure:'R141',hostEvidenceProjection:'R206.1',canonicalAdmissionAuthority:'R125',truth:'returned host proof requires exact R141 payload verification'}),draft,targetDeviceId:state.device.id,allowedOps:['DESKTOP_HEALTH','FORENSIC_HASH_LEDGER'],maxCycles:2,confirmedMission:true});
  const m=data?.mission;if(!m?.id||!m?.currentJob?.id)throw new Error('No durable R205 mission/job identity returned; nothing was queued.');
  state.missionId=m.id;state.jobId=m.currentJob.id;state.job=m.currentJob;state.closure=null;state.armed=false;writeArmed(false);state.autoError='';
  try{localStorage.setItem(MISSION_KEY,m.id);localStorage.setItem(JOB_KEY,m.currentJob.id)}catch{}
  render();
 }catch(e){state.armed=true;writeArmed(true);state.autoError=e.message;$('jobState').textContent='HELD';$('jobDetail').textContent=e.message}
 finally{state.busy=false;render()}
}

$('refresh').onclick=()=>refresh();
$('run').onclick=()=>{if(state.armed&&!state.device&&!state.busy){state.armed=false;writeArmed(false);state.autoAttemptedDeviceId=null;state.autoError='';render();return}runProof({automatic:false})};
refresh();
setInterval(()=>refresh(),3000);

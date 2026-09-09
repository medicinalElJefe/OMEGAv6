import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const worker=read('src/workerR32.js');
const worker116=read('src/workerR116.js');
const worker117=read('src/workerR117.js');
const bootstrap117=read('src/hybridBootstrapR117.ts');
const deck=read('src/HybridCommandDeckR237.tsx');
const hybrid=read('src/HybridLinkR32.tsx');
const snapshot=read('src/HybridRuntimeSnapshotR238.tsx');
const liveVerifier=read('scripts/verify_live_hybrid_command_authority_r237.mjs');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
 "code:'DEVICE_BUSY'",
 "activeJobId:blocking.id",
 "path.startsWith('/jobs/')&&path.endsWith('/cancel')",
 "code:'RUNNING_JOB_NOT_INTERRUPTIBLE'",
 "if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED'},401)",
 "clamp(b.maxCycles,2,12)",
 "status:'CANCELLED'",
 "JOB_CANCELLED"
])must(worker.includes(token),`R237 runtime command-authority guard missing ${token}`);

const pairRoute=worker.indexOf("if(path==='/pair'&&request.method==='POST')");
const rotationGate=worker.indexOf("existing&&body.rotate&&!await this.authorized(request)",pairRoute);
const secretIssue=worker.indexOf("const secret=randomToken(24)",pairRoute);
must(pairRoute>=0&&rotationGate>pairRoute&&secretIssue>rotationGate,'R237 existing-pair rotation must authenticate before any replacement secret is issued');
must(worker.includes("reply:'Existing pairing must authenticate before rotation.'"),'R237 authenticated rotation refusal truth copy missing');
must(worker.includes("path.startsWith('/api/hybrid/jobs/')&&path.endsWith('/cancel')"),'R237 public queued-job cancellation route missing');
must(worker.includes("The selected host already has active native work"),'R237 per-device backpressure truth copy missing');
must(!worker.includes("status:'KILLED'"),'R237 must not fake force-killing a running native process');

for(const token of [
 "const pairHeaders=new Headers({'content-type':'application/json','x-omega-session-id':sid})",
 "const currentSecret=text(request.headers.get('x-omega-bridge-secret'))",
 "if(currentSecret)pairHeaders.set('x-omega-bridge-secret',currentSecret)",
 "body:JSON.stringify({rotate:true})",
 "Cross-session or stale credentials cannot seize pairing authority"
])must(worker116.includes(token),`R237 canonical deployed R116 bootstrap authority missing ${token}`);
for(const token of [
 "const currentSecret=text(request.headers.get('x-omega-bridge-secret'))",
 "if(currentSecret)headers.set('x-omega-bridge-secret',currentSecret)",
 "body:JSON.stringify({rotate:true})",
 "rotates an existing credential only when the caller proves the current bridge secret"
])must(worker117.includes(token),`R237 R117 successor bootstrap continuity missing ${token}`);
for(const token of [
 "getHybridBridge",
 "const session=runtimeSessionId()",
 "const current=getHybridBridge()",
 "current?.bridgeId===session&&current.secret",
 "headers['x-omega-bridge-secret']=current.secret"
])must(bootstrap117.includes(token),`R237 browser bootstrap credential continuity missing ${token}`);
must(!bootstrap117.includes("headers['x-omega-bridge-secret']=current.secret;\n  if(current?.bridgeId!==session"),'R237 must never forward a saved bridge secret before session identity is matched');

for(const token of [
 "useHybridRuntimeSnapshotR238",
 "api.post<any>('/api/hybrid/jobs'",
 "/cancel`,{})",
 "/api/missions/${encodeURIComponent(currentMission.id)}/${action}",
 "confirmed:true",
 "OMEGA_HYBRID_OPERATOR_JOB_R237",
 "PROVE_HOST",
 "VERIFY_PROJECT",
 "PACKAGE_VERIFIED",
 "TRAIN_LOCAL_INDEX",
 "BACKPRESSURE ACTIVE",
 "Cancel before host claim",
 "executing local process",
 "R125"
])must(deck.includes(token),`R237 operator deck missing ${token}`);

for(const token of [
 "selectedDeviceJobs",
 "targetForMission",
 "const correlationLocked=",
 "data-r237-selected-device",
 "data-r237-correlation",
 "data-r237-snapshot-epoch",
 "HOST / JOB / MISSION / EPOCH LOCKED",
 "activeJob.targetDeviceId!==device?.id",
 "targetForMission(currentMission,missionJob)!==device.id",
 "Worker returned a job for a different device; execution is held.",
 "Mission control response lost the selected host binding; execution state is held.",
 "snapshotCurrent",
 "requireCurrentSnapshot"
])must(deck.includes(token),`R237 device/epoch correlation authority missing ${token}`);
must(!deck.includes("api.get<any>('/api/hybrid/status')"),'R237 must not independently poll Hybrid status after R238');
must(!deck.includes("api.get<any>('/api/missions')"),'R237 must not independently poll missions after R238');
must(!deck.includes("setInterval(()=>void refresh(),2500)"),'R237 must not own a duplicate polling loop after R238');

for(const forbidden of ["op:'APPLY_PATCH'","op:'WRITE_TEXT'",'shell=True','child_process','powershell.exe','cmd.exe'])must(!deck.includes(forbidden),`R237 primary command deck must not introduce direct source/shell mutation primitive ${forbidden}`);
must(deck.includes("preset.ops.every(op=>advertised.has(op))"),'R237 must capability-negotiate every preset before queueing');
must(deck.includes("activeJobs.length===0"),'R237 UI backpressure gate missing');
must(deck.includes("safeRoot(root)"),'R237 root-relative confinement preflight missing');
must(deck.includes("nativeReady&&correlationLocked&&rootValid&&queueClear"),'R237 queue admission must fail closed unless host/job/mission/epoch correlation is locked');

for(const token of [
 "Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')])",
 "inFlight.current",
 "omega:hybrid:selectedDeviceId",
 "selectedDeviceJobs",
 "targetForMission(mission,job)===device.id"
])must(snapshot.includes(token),`R238 shared snapshot prerequisite missing ${token}`);

must(hybrid.includes("import {HybridRuntimeSnapshotProviderR238} from './HybridRuntimeSnapshotR238'"),'Hybrid Link must import R238 snapshot provider');
must(hybrid.includes('<HybridRuntimeSnapshotProviderR238>'),'Hybrid Link must mount R238 snapshot provider');
must(hybrid.indexOf('<HybridCommandDeckR237/>')>hybrid.indexOf('<HybridHostEffectsR212/>')&&hybrid.indexOf('<HybridCommandDeckR237/>')<hybrid.indexOf('<HybridProofClosureR141/>'),'R237 command deck must remain between first-hand R212 host effects and R141 closure');
for(const token of ['R125 admission authority','R141 exact return closure','R146 history','R147 executor/dispatch authority'])must(hybrid.includes(token),`R237 Hybrid Link authority boundary regressed ${token}`);

for(const token of [
  "[data-r237-command-authority=\"AUTHENTICATED_BOUNDED_NATIVE_CONTROL\"]",
  "data-r237-snapshot-epoch",
  "R238 changes correlation and sampling, not execution or Canon authority",
  "R212/R141",
  "R146",
  "R147",
  "R125",
  "Refresh shared snapshot"
])must(liveVerifier.includes(token),`R238.1 live R237 verifier missing durable Woven authority marker ${token}`);
must(!liveVerifier.includes('R141/R146/R147/R125 authority remains unchanged'),'R238.1 live verifier must not depend on the retired pre-Woven literal authority sentence');
must(liveVerifier.includes("if(!Number.isFinite(epoch)||epoch<1)throw new Error"),'R238.1 live verifier must prove a completed shared snapshot epoch before accepting the command surface');

console.log('OMEGA R237 HYBRID COMMAND AUTHORITY PASS · authenticated secret rotation + same-session reconnect continuity · authenticated mission control · one-active-job-per-device backpressure · R238 shared host/job/mission/epoch correlation · stale fail-closed writes · capability-negotiated native command deck · no direct source/shell mutation primitive · durable Woven live-verifier markers · R141/R146/R147/R125 preserved');

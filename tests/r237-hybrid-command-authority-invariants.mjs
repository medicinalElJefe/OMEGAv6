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
const adapter=read('src/platformAdapter.ts');
const bridge=read('src/system/hybridBridgeCalculusR240.ts');
const proofAgent=read('public/omega-hybrid-agent-r141.py');
const ci=read('.github/workflows/ci.yml');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
 "code:'DEVICE_BUSY'","activeJobId:blocking.id","path.startsWith('/jobs/')&&path.endsWith('/cancel')","code:'RUNNING_JOB_NOT_INTERRUPTIBLE'","if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED'},401)","clamp(b.maxCycles,2,12)","status:'CANCELLED'","JOB_CANCELLED"
])must(worker.includes(token),`R237 runtime command-authority guard missing ${token}`);
const pairRoute=worker.indexOf("if(path==='/pair'&&request.method==='POST')");
const rotationGate=worker.indexOf("existing&&body.rotate&&!await this.authorized(request)",pairRoute);
const secretIssue=worker.indexOf("const secret=randomToken(24)",pairRoute);
must(pairRoute>=0&&rotationGate>pairRoute&&secretIssue>rotationGate,'R237 existing-pair rotation must authenticate before any replacement secret is issued');
must(worker.includes("reply:'Existing pairing must authenticate before rotation.'"),'R237 authenticated rotation refusal truth copy missing');
must(worker.includes("path.startsWith('/api/hybrid/jobs/')&&path.endsWith('/cancel')"),'R237 public queued-job cancellation route missing');
must(worker.includes("The selected host already has active native work"),'R237 per-device backpressure truth copy missing');
must(!worker.includes("status:'KILLED'"),'R237 must not fake force-killing a running native process');

for(const token of ["const pairHeaders=new Headers({'content-type':'application/json','x-omega-session-id':sid})","const currentSecret=text(request.headers.get('x-omega-bridge-secret'))","if(currentSecret)pairHeaders.set('x-omega-bridge-secret',currentSecret)","body:JSON.stringify({rotate:true})","Cross-session or stale credentials cannot seize pairing authority"])must(worker116.includes(token),`R237 canonical deployed R116 bootstrap authority missing ${token}`);
for(const token of ["const currentSecret=text(request.headers.get('x-omega-bridge-secret'))","if(currentSecret)headers.set('x-omega-bridge-secret',currentSecret)","body:JSON.stringify({rotate:true})","rotates an existing credential only when the caller proves the current bridge secret"])must(worker117.includes(token),`R237 R117 successor bootstrap continuity missing ${token}`);
for(const token of ["getHybridBridge","const session=runtimeSessionId()","const current=getHybridBridge()","current?.bridgeId===session&&current.secret","headers['x-omega-bridge-secret']=current.secret"])must(bootstrap117.includes(token),`R237 browser bootstrap credential continuity missing ${token}`);
must(!bootstrap117.includes("headers['x-omega-bridge-secret']=current.secret;\n  if(current?.bridgeId!==session"),'R237 must never forward a saved bridge secret before session identity is matched');

for(const token of ["useHybridRuntimeSnapshotR238","api.post<any>('/api/hybrid/jobs'","/cancel`,{})","/api/missions/${encodeURIComponent(currentMission.id)}/${action}","confirmed:true","OMEGA_HYBRID_OPERATOR_JOB_R237","PROVE_HOST","VERIFY_PROJECT","PACKAGE_VERIFIED","TRAIN_LOCAL_INDEX","BACKPRESSURE ACTIVE","Cancel before host claim","executing local process","R125"])must(deck.includes(token),`R237 operator deck missing ${token}`);
for(const token of ["selectedDeviceJobs","targetForMission","const correlationLocked=","data-r237-selected-device","data-r237-correlation","data-r237-snapshot-epoch","HOST / JOB / MISSION / EPOCH LOCKED","EXECUTION CONTEXT HELD","activeJob.targetDeviceId!==device?.id","targetForMission(currentMission,missionJob)!==device.id","Worker returned a job for a different device; execution is held.","Mission control response lost the selected host binding; execution state is held.","snapshotCurrent","requireCurrentSnapshot"])must(deck.includes(token),`R237 device/epoch correlation authority missing ${token}`);
must(!deck.includes("api.get<any>('/api/hybrid/status')"),'R237 must not independently poll Hybrid status after R238');
must(!deck.includes("api.get<any>('/api/missions')"),'R237 must not independently poll missions after R238');
must(!deck.includes("setInterval(()=>void refresh(),2500)"),'R237 must not own a duplicate polling loop after R238');
for(const forbidden of ["op:'APPLY_PATCH'","op:'WRITE_TEXT'",'shell=True','child_process','powershell.exe','cmd.exe'])must(!deck.includes(forbidden),`R237 primary command deck must not introduce direct source/shell mutation primitive ${forbidden}`);
must(deck.includes("preset.ops.every(op=>advertised.has(op))"),'R237 must capability-negotiate every preset before queueing');
must(deck.includes("activeJobs.length===0"),'R237 UI backpressure gate missing');
must(deck.includes("safeRoot(root)"),'R237 root-relative confinement preflight missing');
must(deck.includes("nativeReady&&correlationLocked&&rootValid&&queueClear"),'R237 queue admission must fail closed unless host/job/mission/epoch correlation is locked');
for(const token of ["Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')])","inFlight.current","omega:hybrid:selectedDeviceId","selectedDeviceJobs","targetForMission(mission,job)===device.id"])must(snapshot.includes(token),`R238 shared snapshot prerequisite missing ${token}`);

for(const token of ["bindHybridJobBridgeCalculusR240","url==='/api/hybrid/jobs'||url==='/api/missions'","outboundBody=calculusBoundBody","JSON.stringify(outboundBody)"])must(adapter.includes(token),`R240 browser bridge-calculus binding missing ${token}`);
for(const token of ["R240_BRIDGE_SCHEMA='OMEGA_HYBRID_BRIDGE_CALCULUS_R240'",'targetDeviceId','snapshotEpoch','sourceProfileSha256','SAME_CALCULUS_ADDRESS_ACROSS_BRIDGE','R32_INPUT_FINGERPRINT_BINDS_COMPLETE_STEP','R141_RETURN_FINGERPRINT_BINDS_ECHOED_CALCULUS'])must(bridge.includes(token),`R240 bridge-calculus contract missing ${token}`);
must(worker.includes("inputFingerprint:await sha256({steps:v.steps,targetDeviceId:target.id,projectPath:b.projectPath||'.'})"),'R240 calculus step envelope must ride inside R32 durable job input fingerprint');
for(const token of ["BRIDGE_CALCULUS_EXTENSION='R240'",'bridge_by_step=validate_bridge_calculus_r240(job)',"proof['calculusBridgeR240Return']=returned", "returned['orientation']=-1"])must(proofAgent.includes(token),`R240 R141 bridge return closure missing ${token}`);

must(hybrid.includes("import {HybridRuntimeSnapshotProviderR238} from './HybridRuntimeSnapshotR238'"),'Hybrid Link must import R238 snapshot provider');
must(hybrid.includes('<HybridRuntimeSnapshotProviderR238>'),'Hybrid Link must mount R238 snapshot provider');
must(hybrid.indexOf('<HybridCommandDeckR237/>')>hybrid.indexOf('<HybridHostEffectsR212/>')&&hybrid.indexOf('<HybridCommandDeckR237/>')<hybrid.indexOf('<HybridProofClosureR141/>'),'R237 command deck must remain between first-hand R212 host effects and R141 closure');
for(const token of ['R125 admission authority','R141 exact return closure','R146 history','R147 executor/dispatch authority'])must(hybrid.includes(token),`R237 Hybrid Link authority boundary regressed ${token}`);

for(const token of [
 "get('/api/core-health')","get('/api/system/convergence')","fetch(base+'/omega-hybrid-agent-r141.py'",
 "proofClosureRevision!=='R141'","durableExecutionRevision!=='R146'","executorFabricRevision!=='R147'","canonicalAdmission?.authority!=='R125'",
 "BRIDGE_CALCULUS_EXTENSION='R240'",'validate_bridge_calculus_r240','calculusBridgeR240Return',
 "[data-r237-command-authority=\"AUTHENTICATED_BOUNDED_NATIVE_CONTROL\"]",'data-r237-correlation','data-r237-selected-device','data-r237-snapshot-epoch','data-r239-resource-tier',
 "[data-r238-host-intelligence]",'data-r238-selected-device','data-r238-snapshot-epoch','RETURNED_HOST_PROOF','AWAITING_RETURNED_PROFILE',
 'intelligenceDevice!==commandDevice','intelligenceEpoch!==epoch','.r237-presets article','.r237-state-grid article','refreshedIntelligenceEpoch!==refreshedEpoch','Refresh shared snapshot'
])must(liveVerifier.includes(token),`R240.1 live R237 verifier missing machine-semantic authority marker ${token}`);
must(!liveVerifier.includes('const deckText=await deck.innerText()'),'R240.1 live verifier must not derive release authority from rendered explanatory prose');
must(!liveVerifier.includes("'HOST / JOB / MISSION / EPOCH','R239 RESOURCE ENVELOPE'"),'R240.1 live verifier must not retain obsolete display-copy release gates');
must(!liveVerifier.includes('R238 changes correlation and sampling, not execution or Canon authority'),'R240.1 live verifier must not depend on retired explanatory R238 prose');
must(!liveVerifier.includes('R141/R146/R147/R125 authority remains unchanged'),'R240.1 live verifier must not depend on retired pre-Woven prose');
must(liveVerifier.includes("if(!['LOCKED','HELD'].includes(correlation))throw new Error"),'R240.1 live verifier must accept only declared LOCKED or fail-closed HELD correlation states');
must(liveVerifier.includes("if(!Number.isFinite(epoch)||epoch<1)throw new Error"),'R240.1 live verifier must prove a completed shared snapshot epoch before accepting the command surface');
must(liveVerifier.includes("if(!tier)throw new Error('R239 live browser did not expose selected-host resource-envelope tier')"),'R240.1 live verifier must prove that R239 resource admission remains visible on the command surface');

for(const token of [
 'id: deploy_worker','id: live_runtime','id: hybrid_agent','id: federation_rcwa','id: earth_r8','id: earth_r9','id: live_ai','id: browser_r200','id: live_r202','id: live_r237','id: live_r238',
 'continue-on-error: true','if: always()','Enforce complete Hybrid live-proof closure',
 '${{ steps.live_r237.outcome }}','${{ steps.live_r238.outcome }}','R240.1 production truth closure'
])must(ci.includes(token),`R240.1 canonical deployment topology missing ${token}`);
const r237Step=ci.indexOf('- name: Verify live R237 authenticated Hybrid command authority');
const r238Step=ci.indexOf('- name: Verify live R238 Hybrid host intelligence');
const closureStep=ci.indexOf('- name: Enforce complete Hybrid live-proof closure');
const receiptStep=ci.indexOf('- name: Record deployment receipt');
must(r237Step>=0&&r238Step>r237Step&&closureStep>r238Step&&receiptStep>closureStep,'R240.1 production proof order must run R237 then independently R238, enforce both outcomes, then record truth receipt');
const r238Window=ci.slice(r238Step,closureStep);
must(r238Window.includes('if: always()')&&r238Window.includes('continue-on-error: true'),'R240.1 R238 live proof must still execute after a red R237 gate so failures cannot hide one another');
const receiptWindow=ci.slice(receiptStep);
for(const id of ['deploy_worker','live_runtime','hybrid_agent','federation_rcwa','earth_r8','earth_r9','live_ai','browser_r200','live_r202','live_r237','live_r238'])must(receiptWindow.includes(`steps.${id}.outcome`),`R240.1 deployment receipt must report actual ${id} outcome`);
must(!receiptWindow.includes('required for deployment PASS'),'R240.1 deployment receipt must not print unconditional PASS claims');

console.log('OMEGA R237/R239.3/R240.1 HYBRID COMMAND AUTHORITY PASS · authenticated rotation + same-session reconnect · per-device backpressure · shared selected-device/epoch/resource envelope · machine-semantic R141/R146/R147/R125 + R240 bridge proof · both live Hybrid gates independently execute before fail-closed closure · deployment receipt reports actual step outcomes · no rendered-prose release gate · no direct source/shell mutation');

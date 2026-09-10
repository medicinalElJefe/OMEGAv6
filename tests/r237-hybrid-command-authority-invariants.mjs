import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const worker=read('src/workerR32.js');
const worker116=read('src/workerR116.js');
const worker117=read('src/workerR117.js');
const bootstrap117=read('src/hybridBootstrapR117.ts');
const deck=read('src/HybridCommandDeckR237.tsx');
const hybrid=read('src/HybridLinkR32.tsx');
const app=read('src/App.tsx');
const snapshot=read('src/HybridRuntimeSnapshotR238.tsx');
const liveVerifier=read('scripts/verify_live_hybrid_command_authority_r237.mjs');
const adapter=read('src/platformAdapter.ts');
const bridge=read('src/system/hybridBridgeCalculusR240.ts');
const proofAgent=read('public/omega-hybrid-agent-r141.py');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of ["code:'DEVICE_BUSY'","activeJobId:blocking.id","path.startsWith('/jobs/')&&path.endsWith('/cancel')","code:'RUNNING_JOB_NOT_INTERRUPTIBLE'","if(!await this.authorized(request))return json({ok:false,code:'PAIR_AUTH_FAILED'},401)","clamp(b.maxCycles,2,12)","status:'CANCELLED'","JOB_CANCELLED"])must(worker.includes(token),`R237 runtime command-authority guard missing ${token}`);
const pairRoute=worker.indexOf("if(path==='/pair'&&request.method==='POST')"),rotationGate=worker.indexOf("existing&&body.rotate&&!await this.authorized(request)",pairRoute),secretIssue=worker.indexOf("const secret=randomToken(24)",pairRoute);
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
must(!deck.includes("api.get<any>('/api/hybrid/status')")&&!deck.includes("api.get<any>('/api/missions')")&&!deck.includes("setInterval(()=>void refresh(),2500)"),'R237 must consume, not duplicate, the R238 polling owner');
for(const forbidden of ["op:'APPLY_PATCH'","op:'WRITE_TEXT'",'shell=True','child_process','powershell.exe','cmd.exe'])must(!deck.includes(forbidden),`R237 primary command deck must not introduce direct source/shell mutation primitive ${forbidden}`);
must(deck.includes("preset.ops.every(op=>advertised.has(op))")&&deck.includes("activeJobs.length===0")&&deck.includes("safeRoot(root)")&&deck.includes("nativeReady&&correlationLocked&&rootValid&&queueClear"),'R237 bounded queue admission contract regressed');
for(const token of ["Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')])","inFlight.current","omega:hybrid:selectedDeviceId","selectedDeviceJobs","targetForMission(mission,job)===device.id"])must(snapshot.includes(token),`R238 shared snapshot prerequisite missing ${token}`);
for(const token of ["bindHybridJobBridgeCalculusR240","url==='/api/hybrid/jobs'||url==='/api/missions'","outboundBody=calculusBoundBody","JSON.stringify(outboundBody)"])must(adapter.includes(token),`R240 browser bridge-calculus binding missing ${token}`);
for(const token of ["R240_BRIDGE_SCHEMA='OMEGA_HYBRID_BRIDGE_CALCULUS_R240'",'targetDeviceId','snapshotEpoch','sourceProfileSha256','SAME_CALCULUS_ADDRESS_ACROSS_BRIDGE','R32_INPUT_FINGERPRINT_BINDS_COMPLETE_STEP','R141_RETURN_FINGERPRINT_BINDS_ECHOED_CALCULUS'])must(bridge.includes(token),`R240 bridge-calculus contract missing ${token}`);
must(worker.includes("inputFingerprint:await sha256({steps:v.steps,targetDeviceId:target.id,projectPath:b.projectPath||'.'})"),'R240 calculus step envelope must ride inside R32 durable job input fingerprint');
for(const token of ["BRIDGE_CALCULUS_EXTENSION='R240'",'bridge_by_step=validate_bridge_calculus_r240(job)',"proof['calculusBridgeR240Return']=returned", "returned['orientation']=-1"])must(proofAgent.includes(token),`R240 R141 bridge return closure missing ${token}`);

must(app.includes("import {HybridRuntimeSnapshotProviderR238} from './HybridRuntimeSnapshotR238'"),'R270 workstation root must import R238 snapshot provider');
must(app.includes('<HybridRuntimeSnapshotProviderR238><OmegaWorkstation/></HybridRuntimeSnapshotProviderR238>'),'R270 sole R238 snapshot provider must wrap the specialist workstation');
must(!hybrid.includes("import {HybridRuntimeSnapshotProviderR238} from './HybridRuntimeSnapshotR238'")&&!hybrid.includes('<HybridRuntimeSnapshotProviderR238>'),'R270 Hybrid Link must not import or mount a duplicate snapshot provider');
must(hybrid.indexOf('<HybridCommandDeckR237/>')>hybrid.indexOf('<HybridHostEffectsR212/>')&&hybrid.indexOf('<HybridCommandDeckR237/>')<hybrid.indexOf('<HybridProofClosureR141/>'),'R237 command deck must remain between first-hand R212 host effects and R141 closure');
for(const token of ['R125 admission authority','R141 exact return closure','R146 history','R147 executor/dispatch authority'])must(hybrid.includes(token),`R237 Hybrid Link explanatory boundary regressed ${token}`);

for(const token of ["get('/api/core-health')","get('/api/system/convergence')","fetch(base+'/omega-hybrid-agent-r141.py'","OMEGA_CANONICAL_CORE_HEALTH_R163","R163-FIRST-HAND","executionPlanes?.canonicalAdmission?.authority!=='R125'","OMEGA_SYSTEM_CONVERGENCE_R116","['proofClosureRevision','R141']","['durableExecutionRevision','R146']","['executorFabricRevision','R147']","connectorPolicy?.proofClosureRevision!=='R141'","BRIDGE_CALCULUS_EXTENSION='R240'","FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'","[data-r237-command-authority=\"AUTHENTICATED_BOUNDED_NATIVE_CONTROL\"]","data-r237-selected-device","data-r237-snapshot-epoch","[data-r238-host-intelligence]","data-r238-selected-device","data-r238-snapshot-epoch","RETURNED_HOST_PROOF","AWAITING_RETURNED_PROFILE","data-r237-correlation","['LOCKED','HELD']","correlation==='LOCKED'","HOST / JOB / MISSION / EPOCH LOCKED","EXECUTION CONTEXT HELD","R239 RESOURCE ENVELOPE","data-r239-resource-tier","['UNPROVED','HOLD','CONSTRAINED','READY','HIGH_CAPACITY']","Refresh shared snapshot","refreshedIntelligenceEpoch!==refreshedEpoch","refreshedDeckSelected!==refreshedIntelligenceSelected"])must(liveVerifier.includes(token),`R241 live R237 verifier missing machine-semantic proof token ${token}`);
must(!liveVerifier.includes('R238 changes correlation and sampling, not execution or Canon authority')&&!liveVerifier.includes('R141/R146/R147/R125 authority remains unchanged'),'R241 live verifier must not depend on retired explanatory prose');
must(liveVerifier.includes('deckSelected!==intelligenceSelected')&&liveVerifier.includes("if(!Number.isFinite(epoch)||epoch<1)throw new Error")&&liveVerifier.includes('intelligenceEpoch!==epoch')&&liveVerifier.includes('refreshedEpoch<epoch'),'R241 live selected-host/epoch semantic verifier regressed');

console.log('OMEGA R237/R239.2/R240/R241/R270 HYBRID COMMAND AUTHORITY PASS · one workstation-scoped R238 truth owner · authenticated rotation/backpressure · selected-host shared-epoch continuity · R239 tier · no direct source/shell mutation · R125/R141/R146/R147/R240 preserved');

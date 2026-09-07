export const R200_REVISION='R200';
export const R200_SCHEMA='OMEGA_OPERATIONAL_LIFECYCLE_R200';
export const R200_STAGES=Object.freeze([
  'REGISTERED','ROUTE_READY','CAPACITY_PLANNED','EXECUTOR_AVAILABLE','AUTHORIZED','DISPATCHED','RUNNING','RETURNED','VERIFIED','ADMISSIBLE'
]);
export const R200_LAWS=Object.freeze([
  'REGISTERED_ROUTE_IS_NOT_EXECUTION',
  'ROUTE_READY_IS_NOT_CAPACITY_PLANNED',
  'CAPACITY_PLAN_IS_NOT_EXECUTOR_AVAILABILITY',
  'EXECUTOR_AVAILABLE_IS_NOT_AUTHORIZATION',
  'AUTHORIZATION_IS_NOT_DISPATCH',
  'DISPATCH_ACCEPTANCE_IS_NOT_INVOCATION',
  'RUNNING_IS_INVOKED_NOT_RETURNED',
  'RETURNED_IS_NOT_VERIFIED',
  'VERIFIED_EXECUTION_IS_NOT_R125_ADMISSION',
  'R159_ADMISSION_CANDIDATE_IS_NOT_CANONSTATE',
  'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const R146_ORDER=Object.freeze({DISCOVERED:0,AUTHORIZED:1,AVAILABLE:2,INVOKED:3,RETURNED:4,VERIFIED:5});
const TERMINAL_FAILURES=new Set(['UNAVAILABLE','FAILED','REJECTED','STALE']);
const DOMAIN_EXECUTORS=Object.freeze({
  AI:['WORKERS_AI','AUTONOMIC_SWARM','FEDERATION_CHAIN'],
  SAI:['WORKERS_AI','AUTONOMIC_SWARM','FEDERATION_CHAIN'],
  HYBRID:['HYBRID_HOST'],
  BUILD:['HYBRID_HOST','AUTONOMIC_SWARM'],
  PROOF:['LOCAL_PROOF','AUTONOMIC_SWARM','FEDERATION_CHAIN'],
  LOCAL:['LOCAL_RUNTIME','AUTONOMIC_SWARM','FEDERATION_CHAIN'],
  PLUGIN:['PLUGIN_CONNECTOR']
});
const text=v=>String(v??'').trim();
const stage=(id,state,authority,evidence,detail,action=null)=>({id,state,authority,evidence:evidence??null,detail,action,canonicalMutation:false});
const atLeast=(runState,target)=>Number.isFinite(R146_ORDER[runState])&&R146_ORDER[runState]>=R146_ORDER[target];
const runDomain=run=>text(run?.contract?.executionDomain).toUpperCase();
const eligibleExecutors=domain=>DOMAIN_EXECUTORS[domain]||[];

export function executorEvidenceR200(run,directory,resultView=null){
  const binding=resultView?.binding||null;
  if(binding?.executorId)return{state:'PROVED',executorId:binding.executorId,evidence:`R147 binding ${binding.bindingSha256||binding.artifactId||binding.executorId}`,detail:'A concrete R147 executor binding exists for this run.'};
  const domain=runDomain(run),ids=eligibleExecutors(domain),rows=directory?.executors||{};
  const available=ids.find(id=>rows[id]?.state==='AVAILABLE');
  if(available)return{state:'AVAILABLE',executorId:available,evidence:`R147 directory ${available}=AVAILABLE`,detail:'At least one eligible executor is currently available. Availability is not dispatch or invocation.'};
  const deviceProof=ids.find(id=>rows[id]?.state==='DEVICE_PROOF_REQUIRED');
  if(deviceProof)return{state:'HELD',executorId:deviceProof,evidence:`R147 directory ${deviceProof}=DEVICE_PROOF_REQUIRED`,detail:'The eligible native executor requires a current authenticated device heartbeat.'};
  if(directory?.executors)return{state:'UNAVAILABLE',executorId:null,evidence:`R147 directory has no AVAILABLE executor for ${domain||'UNKNOWN'}`,detail:'No eligible executor is currently proven available for this execution domain.'};
  return{state:'UNKNOWN',executorId:null,evidence:null,detail:'Authenticated executor-directory evidence is not available in this browser session.'};
}

export function reconcileRunLifecycleR200({run,resultView=null,directory=null,convergence=null}={}){
  if(!run)return null;
  const contract=run.contract||{},state=text(run.state).toUpperCase(),route=text(contract.route),domain=runDomain(run),metadata=run.metadata||{},capacity=metadata.relativeCapacityR154||null;
  const registered=contract.schema==='OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143'&&contract.revision==='R143'&&Boolean(contract.routeId&&contract.capabilityId&&domain);
  const routeReady=registered&&contract.state==='AVAILABLE';
  const capacityPlanned=capacity?.state==='PLANNED_NOT_EXECUTED'&&capacity?.routeId===contract.routeId&&capacity?.capabilityId===contract.capabilityId;
  const executor=executorEvidenceR200(run,directory,resultView);
  const binding=resultView?.binding||null,result=resultView?.result||null;
  const dispatched=Boolean(binding)||atLeast(state,'INVOKED');
  const invoked=atLeast(state,'INVOKED');
  const returned=atLeast(state,'RETURNED')||Boolean(result);
  const verified=state==='VERIFIED';
  const candidate=convergence?.admissionCandidate||result?.payload?.sovereignConvergence?.admissionCandidate||null;
  const admissible=candidate?.state==='READY_FOR_R125_PROOF_GATE';
  const failed=TERMINAL_FAILURES.has(state);
  const stages=[
    stage('REGISTERED',registered?'PROVED':'HELD','R139/R143',registered?`${contract.routeId} → ${contract.capabilityId} → ${domain}`:null,registered?'The durable run is bound to an R143 registered route/capability/domain contract.':'The run does not carry a valid R143 route contract.'),
    stage('ROUTE_READY',routeReady?'PROVED':registered?'HELD':'UNKNOWN','R140/R143',registered?`contract.state=${contract.state||'UNKNOWN'}`:null,routeReady?'The selected route was available when the durable contract was created.':'Registered does not mean route-ready; the contract remains visibly held.'),
    stage('CAPACITY_PLANNED',capacityPlanned?'PROVED':capacity?.state==='UNAVAILABLE'?'UNAVAILABLE':'HELD','R154',capacityPlanned?`${capacity.capacity?.tier||'PLAN'} · ${capacity.capacity?.logicalLanes||'—'} lanes · ${capacity.capacity?.temporalHz||'—'} Hz`:capacity?.error||null,capacityPlanned?'A route-specific R154 capacity plan is preserved in R146 metadata; it is planning, not execution.':'No matching route-specific R154 plan is bound to this run.'),
    stage('EXECUTOR_AVAILABLE',executor.state,'R147',executor.evidence,executor.detail),
    stage('AUTHORIZED',atLeast(state,'AUTHORIZED')?'PROVED':failed?'HELD':'PENDING','R146',`run.state=${state||'UNKNOWN'}`,atLeast(state,'AUTHORIZED')?'R146 records authenticated operator authorization or a later lawful state.':'The durable run has not reached AUTHORIZED.',atLeast(state,'AUTHORIZED')&&!failed?'DISPATCH':null),
    stage('DISPATCHED',dispatched?'PROVED':failed?'HELD':atLeast(state,'AUTHORIZED')?'READY':'PENDING','R147',binding?`${binding.executorId||'executor'} · ${binding.kind||'binding'} · ${binding.artifactId||binding.bindingSha256||'bound'}`:invoked?'R146 INVOKED implies an accepted synchronous dispatch path':null,dispatched?'A concrete R147 binding exists or the synchronous path already advanced to INVOKED. Dispatch acceptance alone is not success.':'No R147 dispatch/binding evidence is attached yet.',atLeast(state,'AUTHORIZED')&&!dispatched&&!failed?'DISPATCH':null),
    stage('RUNNING',invoked?'PROVED':failed?'HELD':'PENDING','R146/R147',`run.state=${state||'UNKNOWN'}`,invoked?(state==='INVOKED'?'The executor has accepted/invoked the run; no return is claimed yet.':'Invocation is preserved in the durable history; the run has since advanced.'):'No INVOKED transition is proven.',state==='INVOKED'?'POLL':null),
    stage('RETURNED',returned?'PROVED':failed?'HELD':'PENDING','R146/R147',result?.resultFingerprint||`run.state=${state||'UNKNOWN'}`,returned?'A returned payload/result fingerprint is present or R146 has advanced through RETURNED. Returned is not verified.':'No returned payload is proven.',state==='INVOKED'?'POLL':null),
    stage('VERIFIED',verified?'PROVED':failed?'HELD':returned?'HELD':'PENDING','R141/R146/R147',verified?(run.headSha256||result?.resultFingerprint||'R146 VERIFIED'):null,verified?'The execution return passed its executor-specific verification path. This is execution verification, not factual truth or CanonState.':returned?'Returned data is still awaiting or has failed the required verification gate.':'No verified execution return exists.'),
    stage('ADMISSIBLE',admissible?'CANDIDATE_READY':verified?'HELD':'PENDING','R159 → R125',candidate?.state||null,admissible?'R159 has assembled a candidate ready for the separate R125 proof gate. It is still not CanonState.':verified?'Verified execution remains held until separate R159 convergence evidence exists; R125 alone may admit CanonState.':'Admission is not considered before verified execution.',null)
  ];
  const next=failed?'INSPECT_FAILURE':!registered?'REPAIR_ROUTE_CONTRACT':!routeReady?'REPAIR_ROUTE_READINESS':!capacityPlanned?'REPLAN_CAPACITY':executor.state==='HELD'?'PROVE_DEVICE':executor.state==='UNAVAILABLE'?'RESTORE_EXECUTOR':!atLeast(state,'AUTHORIZED')?'AUTHORIZE':!dispatched?'DISPATCH':state==='INVOKED'?'POLL':state==='RETURNED'?'VERIFY':state==='VERIFIED'?(admissible?'R125_SEPARATE_PROOF_GATE':'R159_CONVERGENCE_REQUIRED'):'OBSERVE';
  return{
    schema:R200_SCHEMA,revision:R200_REVISION,runId:run.id,route,routeId:contract.routeId||null,capabilityId:contract.capabilityId||null,executionDomain:domain||null,r146State:state,terminalFailure:failed,stages,nextLawfulAction:next,
    authority:{registry:'R139',operationProjection:'R140',lifecycle:'R142',routeIdentity:'R143',capacity:'R154',history:'R146',executor:'R147',hybridProof:'R141',verifiedReturnReconciliation:'R182',convergence:'R159',admission:'R125'},
    canonicalMutation:false,canonicalAdmissionAuthority:'R125',
    truthBoundary:'R200 reconciles already-existing authorities into one operator lifecycle. It does not create route readiness, capacity, executor availability, authorization, dispatch, invocation, return, verification, scientific truth, R159 convergence, PC-online proof, solver validity, deployment proof or CanonState admission. Missing evidence stays visible.'
  };
}

export function reconcileSystemLifecycleR200({core=null,operational=null,hybrid=null,directory=null,runs=[]}={}){
  const coreLive=core?.schema==='OMEGA_CANONICAL_CORE_HEALTH_R163'&&core?.state==='LIVE'&&core?.ok===true;
  const routeCount=Number(operational?.summary?.fullSystem?.routes||0),routeSpine=operational?.summary?.missing?.length===0&&operational?.summary?.state==='REACHABLE';
  const executorRows=directory?.executors||{},availableExecutors=Object.entries(executorRows).filter(([,v])=>v?.state==='AVAILABLE').map(([id])=>id);
  const list=Array.isArray(runs)?runs:[],counts={};for(const key of ['DISCOVERED','AUTHORIZED','AVAILABLE','INVOKED','RETURNED','VERIFIED','UNAVAILABLE','FAILED','REJECTED','STALE'])counts[key]=list.filter(r=>r?.state===key).length;
  return{
    schema:'OMEGA_SYSTEM_OPERATIONAL_LIFECYCLE_R200',revision:R200_REVISION,observedAt:new Date().toISOString(),
    core:{state:coreLive?'LIVE':'UNPROVED',workerVersion:core?.runtimeVersion?.id||null},
    registeredRoutes:{state:routeCount>0?'OBSERVED':'UNPROVED',count:routeCount,authority:'R139/R143'},
    routeSpine:{state:routeSpine?'REACHABLE':'DEGRADED_OR_UNPROVED',authority:'R130/R140/R143'},
    executors:{state:directory?.executors?'OBSERVED':'PRIVATE_PROOF_REQUIRED',available:availableExecutors,total:Object.keys(executorRows).length,authority:'R147'},
    hybrid:{state:hybrid?.state||'UNPROVED',nativeExecutionClaimed:hybrid?.nativeExecutionClaimed===true,currentOnlineDevices:Array.isArray(hybrid?.devices)?hybrid.devices.filter(d=>d?.online&&!d?.revoked).length:0,authority:'CURRENT_AUTHENTICATED_HEARTBEAT_ONLY'},
    durableRuns:{state:directory?.executors?'SESSION_BOUND':'PRIVATE_PROOF_REQUIRED',count:list.length,counts,authority:'R146'},
    canonicalMutation:false,canonicalAdmissionAuthority:'R125',
    truthBoundary:'System lifecycle observation summarizes first-hand public runtime evidence plus authenticated session evidence when available. Aggregate reachability never substitutes for per-run execution proof, and a missing private session is not converted into an empty execution history.'
  };
}

export function manifestR200(){return{ok:true,schema:R200_SCHEMA,revision:R200_REVISION,stages:R200_STAGES,laws:R200_LAWS,authority:{registry:'R139',operationProjection:'R140',lifecycle:'R142',routeIdentity:'R143',capacity:'R154',history:'R146',executor:'R147',hybridProof:'R141',verifiedReturnReconciliation:'R182',convergence:'R159',admission:'R125'},operatorActions:['REFRESH','SELECT_RUN','DISPATCH_AUTHORIZED_RUN','POLL_INVOKED_RUN','REPLAY_R146_CHAIN'],nativeHybridDispatchRequiresExplicitConfirmation:true,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R200 is an operator reconciliation and control surface over existing authorities. It adds no executor, no queue, no shadow state authority and no automatic Canon admission.'};}

export const R245_SCHEMA='OMEGA_FULL_OVERALL_CANON_R245';
export const R245_REVISION='R245';
export const R245_CONTINUITY_OPERATOR='PARTITION → EXCHANGE/TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/REPARTITION';

export const R245_CANON_AXES=Object.freeze([
 'STATE','RELATION','MEMORY','COMPUTATION','OBSERVATION','ACTION','PROOF'
]);

export const R245_STRATA=Object.freeze([
 Object.freeze({id:'CANON_KERNEL',label:'Canon Kernel',purpose:'Identity, authority, admissibility and invariant carry.'}),
 Object.freeze({id:'CALCULUS_ENGINE',label:'Calculus Engine',purpose:'Frame-relative transforms, continuity, orientation and residual calculus.'}),
 Object.freeze({id:'EVIDENCE_WORLD',label:'Evidence / World Engine',purpose:'Returned evidence, source provenance, spatial/world state and uncertainty.'}),
 Object.freeze({id:'COMPUTE_FABRIC',label:'Compute Fabric',purpose:'Cloud, Hybrid, solver, swarm and bounded execution resources.'}),
 Object.freeze({id:'INTELLIGENCE_ENGINE',label:'Intelligence Engine',purpose:'Diagnosis, candidate generation, forecast and bounded planning.'}),
 Object.freeze({id:'PROOF_GOVERNANCE',label:'Proof / Governance Engine',purpose:'Verification, durable history, release gates and Canon admission boundaries.'}),
 Object.freeze({id:'INSTRUMENT_RENDERER',label:'Instrument / Renderer',purpose:'Read-only projection of Canon state into operator-visible surfaces.'})
]);

export const R245_ORGANS=Object.freeze([
 'KERNEL','STATE','CALCULUS','EVIDENCE','WORLD','HYBRID','CLOUD','INTELLIGENCE','MEMORY','PROOF','RENDERER','OPERATOR_UX'
]);

export const R245_SCHEDULER_LEVELS=Object.freeze([
 Object.freeze({level:12,role:'ORGANS',physicalDimensions:false}),
 Object.freeze({level:144,role:'BOUNDED_WORK_SURFACES',physicalDimensions:false}),
 Object.freeze({level:1728,role:'ADDRESSABLE_WORK_CELLS',physicalDimensions:false}),
 Object.freeze({level:20736,role:'CANONICAL_PACKET_ADDRESS_LEVEL',physicalDimensions:false}),
 Object.freeze({level:248832,role:'REPRESENTATIONAL_REFINEMENT_LEVEL',physicalDimensions:false})
]);

export const R245_AUTHORITY_LAWS=Object.freeze([
 'R125_SOLE_CANONSTATE_ADMISSION',
 'R141_EXACT_HYBRID_RETURN_PROOF',
 'R146_DURABLE_EXECUTION_HISTORY',
 'R147_EXECUTOR_SELECTION_AND_DISPATCH',
 'R239_RESOURCE_GOVERNANCE',
 'R240_EXACT_SOURCE_PROMOTION',
 'R210_RELEASE_CONTROL',
 'R223_CLOUDFLARE_EVOLUTION_AUTHORITY',
 'CI_YML_SOLE_CANONICAL_PRODUCTION_WORKER_WRITER',
 'PROPOSAL_NE_AUTHORIZATION_NE_EXECUTION_NE_RETURN_NE_VERIFIED_PROOF_NE_CANON_ADMISSION',
 'ATLAS_ADDRESS_LEVELS_ARE_NOT_LITERAL_PHYSICAL_DIMENSIONS'
]);

const list=v=>Array.isArray(v)?v:[];
const number=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
const text=(v,fallback='UNKNOWN')=>String(v??fallback).trim()||fallback;
const currentOnlineDevices=hybrid=>list(hybrid?.devices).filter(d=>d?.online===true&&d?.revoked!==true);

export function roadmapPressureR245(selfbuild={}){
 const roadmap=list(selfbuild?.roadmap),admitted=new Set(list(selfbuild?.admittedSourceCapsules)),rejected=new Set(list(selfbuild?.rejected).map(x=>typeof x==='string'?x:x?.id)),blocked=new Set(list(selfbuild?.blocked).map(x=>typeof x==='string'?x:x?.id));
 return roadmap.map((item,index)=>{
  const prerequisites=list(item?.prerequisites),missing=prerequisites.filter(id=>!admitted.has(id));
  const status=admitted.has(item?.id)?'ADMITTED':rejected.has(item?.id)?'REJECTED':blocked.has(item?.id)?'BLOCKED_RECORDED':missing.length?'WAITING_DEPENDENCY':'READY';
  const gain=number(item?.expectedGain),complexity=Math.max(.01,number(item?.complexity,.5)),contradiction=Math.max(0,number(item?.contradictionRisk));
  const pressure=Number((gain*(1-contradiction)/complexity).toFixed(4));
  return Object.freeze({
   id:text(item?.id,`ROADMAP_${index+1}`),title:text(item?.title,'Unnamed roadmap capsule'),objective:text(item?.objective,''),target:text(item?.target,''),risk:text(item?.risk,'UNKNOWN'),prerequisites,missingPrerequisites:missing,status,expectedGain:gain,complexity,contradictionRisk:contradiction,pressure
  });
 }).sort((a,b)=>{
  const ar=a.status==='READY'?0:a.status==='WAITING_DEPENDENCY'?1:2,br=b.status==='READY'?0:b.status==='WAITING_DEPENDENCY'?1:2;
  return ar-br||b.pressure-a.pressure||a.id.localeCompare(b.id);
 });
}

function productionProjection(receipt={}){
 const promotedSha=text(receipt?.promotion?.promotedMergeSha||receipt?.source?.sha||receipt?.sourceSha,'');
 const state=promotedSha?'RECEIPT_RETURNED':'RECEIPT_NOT_RETURNED';
 return Object.freeze({state,promotedSha:promotedSha||null,workerVersion:receipt?.runtime?.workerVersion||receipt?.workerVersion||null,canonicalAdmissionClaimed:false});
}

function runtimeProjection(core={},operational={},convergence={}){
 const coreLive=core?.ok===true&&(core?.state==='LIVE'||core?.state==='READY'||core?.state===undefined);
 return Object.freeze({
  state:coreLive?'LIVE':text(core?.state,'UNPROVEN'),
  coreLive,
  operationalState:text(operational?.state||operational?.overallState,'UNPROVEN'),
  convergenceState:text(convergence?.state||convergence?.canonical?.state,'UNPROVEN'),
  canonicalRequest:core?.canonicalRequest===true,
  runtimeVersion:core?.runtimeVersion||null,
  truthBoundary:'Worker/core liveness is runtime substrate evidence only. It is not PC execution, scientific validity, returned host proof, release admission or CanonState admission.'
 });
}

function hybridProjection(hybrid={}){
 const online=currentOnlineDevices(hybrid),proved=hybrid?.nativeExecutionClaimed===true&&online.length>0;
 return Object.freeze({
  state:text(hybrid?.state,proved?'VERIFIED_DEVICE_ONLINE':'DEVICE_PROOF_REQUIRED'),
  authenticatedCurrentDeviceProved:proved,
  currentOnlineDeviceCount:proved?online.length:0,
  executionMotionRevision:hybrid?.executionMotionRevision||null,
  staleReconciliationRevision:hybrid?.staleReconciliationRevision||null,
  truthBoundary:'PC online is true only from nativeExecutionClaimed=true plus a current online non-revoked device returned by the authenticated Hybrid authority. Queue state, browser state, CI, deployment or a display-state label never substitutes for private-host proof.'
 });
}

function capabilityProjection(capabilities={}){
 const families=list(capabilities?.families),counts=capabilities?.stateCounts||{};
 return Object.freeze({
  familyCount:families.length,
  admittedOwners:number(counts.ADMITTED_MAIN,families.filter(x=>x?.state==='ADMITTED_MAIN').length),
  proofGated:number(counts.INTEGRATED_CANDIDATE,families.filter(x=>x?.state==='INTEGRATED_CANDIDATE').length),
  integrationTargets:number(counts.INTEGRATION_TARGET,families.filter(x=>x?.state==='INTEGRATION_TARGET').length),
  families:families.map(x=>({family:x?.family,state:x?.state,purpose:x?.purpose,boundary:x?.boundary}))
 });
}

export function compileFullOverallCanonR245(input={}){
 const selfbuild=input?.selfbuild||{},roadmap=roadmapPressureR245(selfbuild),ready=roadmap.filter(x=>x.status==='READY'),production=productionProjection(input?.receipt||{}),runtime=runtimeProjection(input?.core||{},input?.operational||{},input?.convergence||{}),hybrid=hybridProjection(input?.hybrid||{}),capabilities=capabilityProjection(input?.capabilities||{});
 const selfBuildState=Object.freeze({
  active:selfbuild?.active===true,
  generation:number(selfbuild?.generation),
  maxAutonomousGenerations:number(selfbuild?.maxAutonomousGenerations),
  maxParallelPlanningCells:number(selfbuild?.maxParallelPlanningCells),
  recursiveSchedulerRevision:selfbuild?.recursiveSchedulerRevision||null,
  exactSelfPromotionRevision:selfbuild?.exactSelfPromotionRevision||null,
  readyCapsules:ready.length,
  recommendedCapsule:ready[0]||null,
  roadmap
 });
 const sourceTruth=Object.freeze({schema:R245_SCHEMA,revision:R245_REVISION,capabilities});
 return Object.freeze({
  schema:R245_SCHEMA,
  revision:R245_REVISION,
  observedAt:number(input?.observedAt,Date.now()),
  continuityOperator:R245_CONTINUITY_OPERATOR,
  axes:R245_CANON_AXES,
  strata:R245_STRATA,
  organs:R245_ORGANS,
  schedulerLevels:R245_SCHEDULER_LEVELS,
  authorityLaws:R245_AUTHORITY_LAWS,
  source:sourceTruth,
  runtime,
  hybrid,
  production,
  selfBuild:selfBuildState,
  admission:Object.freeze({authority:'R125',admittedByR245:false,reason:'R245 is an observation/orchestration projection. It owns no CanonState admission path.'}),
  actionBoundary:Object.freeze({
   mutationAuthority:'EXISTING_GOVERNED_BUILD_PATH_ONLY',
   executionAuthority:'EXISTING_R147_HYBRID_AND_SPECIALIST_EXECUTORS_ONLY',
   productionWriter:'.github/workflows/ci.yml',
   r245Mutates:false,
   r245Executes:false
  }),
  truthBoundary:'R245 correlates source, runtime, Hybrid, production, capability and self-build observations into one epoch. Missing evidence stays missing. Availability is not invocation; invocation is not return; return is not verified proof; verified proof is not CanonState admission.'
 });
}

export function assertFullOverallCanonR245(){
 if(R245_CANON_AXES.length!==7||R245_STRATA.length!==7||R245_ORGANS.length!==12)throw new Error('R245 topology invariant failed.');
 if(R245_SCHEDULER_LEVELS.some(x=>x.physicalDimensions!==false))throw new Error('R245 address levels must never claim literal physical dimensions.');
 if(!R245_AUTHORITY_LAWS.includes('R125_SOLE_CANONSTATE_ADMISSION'))throw new Error('R245 lost R125 sole CanonState admission.');
 return true;
}

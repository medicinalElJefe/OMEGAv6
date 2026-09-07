import {compileUnifiedCapabilityRuntimeR139} from './unifiedCapabilityEngineR139';
import {rankUnifiedCapabilityActionsR140,type OperationActionR140} from './unifiedOperationFabricR140';
import {compileLemmaMotionNowR153,type R153Input} from './lemmaMotionNowContinuityR153';

export const R154_SCHEMA='OMEGA_RELATIVE_CAPACITY_FABRIC_R154' as const;
export const R154_LAWS=Object.freeze([
  'ONE_CANONICAL_STATE_MANY_RELATIVE_OPERATIONAL_CAPACITY_PROJECTIONS',
  'DIMENSIONAL_RELATIVITY_CHANGES_ROLE_AND_RESOLUTION_NOT_PHYSICAL_DIMENSION_COUNT',
  'MOTION_PRESSURE_MAY_RAISE_SAMPLING_AND_COMPUTE_WITHOUT_RAISING_TRUTH_AUTHORITY',
  'COHERENCE_GUIDES_RESOURCE_ALLOCATION_BUT_CANNOT_OVERRIDE_EMPIRICAL_EVIDENCE',
  'VIEW_RESOLUTION_AND_ACCURACY_COMPUTE_REMAIN_SEPARATE_BUDGETS',
  'SWARM_FANOUT_IS_LOGICAL_PLANNING_UNTIL_EXECUTION_RECEIPTS_EXIST',
  'HYBRID_NATIVE_EXECUTION_REMAINS_DEVICE_PROOF_GATED',
  'BUILD_AND_SELF_DEVELOPMENT_REMAIN_SANDBOX_PROPOSE_TEST_COMPARE_ADMIT',
  'SOLVER_FIDELITY_ESCALATION_REQUIRES_ROUTE_AND_EVIDENCE_PRESSURE',
  'WOVEN_SCAR_AND_LINEAGE_CARRY_SURVIVE_CAPACITY_REPARTITION',
  'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
]);

export type RelativeCapacityTierR154='REFLEX'|'ORGAN'|'BRANCH'|'CELL_SWARM'|'EXECUTION_LANES';
export type RelativeSolverFidelityR154='NONE'|'REDUCED_ORDER'|'SPECTRAL_FULL_MODE'|'SPECTRAL_RCWA'|'MULTI_RES_RCWA'|'FDTD_CROSSCHECK';
export type RelativeExecutionReadinessR154='ROUTE_READY'|'EVIDENCE_REQUIRED'|'DEVICE_PROOF_REQUIRED'|'PROOF_REQUIRED'|'SANDBOX_ONLY';
export type RelativeOperationPlanR154={
  route:string;
  kind:string;
  executionDomain:string;
  capabilityId:string|null;
  routeId:string|null;
  basePriority:number;
  relativePriority:number;
  readiness:RelativeExecutionReadinessR154;
  capacity:{tier:RelativeCapacityTierR154;logicalLanes:number;logicalFanout:number;temporalHz:number;historyDepth:number;viewResolution:12|144|1728|20736|248832;accuracyLanes:number;solverFidelity:RelativeSolverFidelityR154};
  relativity:{whole:string;part:string;inner:string;outer:string;observer:string;orientation:-1|0|1;projectionAddress:number;canonicalAddress:number;nowAddress:string};
  pressures:{motion:number;residual:number;truthGap:number;coherenceGap:number;temporalError:number;observer:number;operation:number;combined:number};
  lineage:{r153Fingerprint:string;truthFingerprint:string;lemmaFingerprint:string;nowAddress:string;canonicalStateId:number};
  boundary:string;
};

const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const mean=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const choose=<T>(score:number,rows:Array<[number,T]>,fallback:T)=>{for(const [cut,value] of rows)if(score<cut)return value;return fallback};
const kindPressure=(kind:string)=>kind==='PROVE'?1:kind==='EXECUTE'?.94:kind==='BUILD'?.88:kind==='INTELLIGENCE'?.76:kind==='GOVERN'?.72:kind==='SYSTEM'?.68:.60;
const historyDepth=(score:number)=>choose(score,[[.22,12],[.42,144],[.68,1728],[.86,20736]],20736);
const temporalHz=(score:number)=>choose(score,[[.18,1],[.34,2],[.50,6],[.66,12],[.82,30]],60);
const fanout=(score:number)=>choose(score,[[.20,1],[.38,12],[.58,144],[.78,1728]],20736);
function tierFromLanes(lanes:number):RelativeCapacityTierR154{return lanes<=1?'REFLEX':lanes<=12?'ORGAN':lanes<=144?'BRANCH':lanes<=1728?'CELL_SWARM':'EXECUTION_LANES'}
function readiness(action:OperationActionR140,truth:any):RelativeExecutionReadinessR154{
  if(action.kind==='EXECUTE')return'DEVICE_PROOF_REQUIRED';
  if(action.kind==='BUILD')return'SANDBOX_ONLY';
  if(action.kind==='PROVE'&&truth.evidenceStatus!=='EMPIRICAL_STRONG')return'PROOF_REQUIRED';
  if(truth.responsePath==='MEASURE_OR_FETCH'||truth.responsePath==='VERIFY_CONTRADICTION')return'EVIDENCE_REQUIRED';
  return'ROUTE_READY';
}
function solverFidelity(route:string,kind:string,pressure:number,truth:any):RelativeSolverFidelityR154{
  const scientific=/validation|optical|matter|reality lab|physics|spectral/i.test(route);
  if(!scientific)return kind==='PROVE'?'SPECTRAL_FULL_MODE':'NONE';
  if(truth.evidenceStatus==='CONTRADICTED_EVIDENCE'||pressure>=.90)return'FDTD_CROSSCHECK';
  if(pressure>=.76)return'MULTI_RES_RCWA';
  if(pressure>=.60)return'SPECTRAL_RCWA';
  if(pressure>=.42)return'SPECTRAL_FULL_MODE';
  return'REDUCED_ORDER';
}

export function compileRelativeCapacityFabricR154(input:R153Input&{panel?:string;intent?:string}){
  const now=compileLemmaMotionNowR153(input);
  const record=(now as any).truth?undefined:undefined;
  const runtimeRecord=(globalThis as any).__OMEGA_R154_RECORD_OVERRIDE__||null;
  const sourceRecord=runtimeRecord;
  if(!sourceRecord)throw new Error('R154 requires compileRelativeCapacityFabricForRecordR154(record,input) so route capability state and R153 canonical state are evaluated from the same source packet.');
  return compileRelativeCapacityFabricForRecordR154(sourceRecord,input);
}

export function compileRelativeCapacityFabricForRecordR154(record:any,input:R153Input&{panel?:string;intent?:string}){
  const now=compileLemmaMotionNowR153(input),runtime=compileUnifiedCapabilityRuntimeR139(record,input.panel||'',input.intent||''),operation=rankUnifiedCapabilityActionsR140(runtime,record),truth=now.truth;
  const motion=cl(now.motion.motionPressure),residual=cl(Math.max(truth.uncertainty,truth.evidence.contradictionMass,(1-now.atlasCoherence.compound))),truthGap=cl(1-truth.truthConfidence),coherenceGap=cl(1-now.atlasCoherence.compound),temporalError=cl(1-now.now.temporalAccuracy),observer=cl(input.observerRelevance??.5);
  const plans:RelativeOperationPlanR154[]=operation.actions.map(action=>{
    const operationP=kindPressure(action.kind),routeBase=cl(action.score),combined=cl(.20*routeBase+.18*motion+.16*residual+.13*truthGap+.10*coherenceGap+.09*temporalError+.06*observer+.08*operationP),logicalFanout=fanout(combined),logicalLanes=Math.max(now.promotion.accuracy.lanes,logicalFanout),tier=tierFromLanes(logicalLanes),viewResolution=Math.max(now.promotion.view.resolution,choose(combined,[[.24,12],[.42,144],[.60,1728],[.78,20736]],248832)) as 12|144|1728|20736|248832,solver=solverFidelity(action.route,action.kind,combined,truth),ready=readiness(action,truth),relativePriority=cl(.70*routeBase+.30*combined);
    return{
      route:action.route,kind:action.kind,executionDomain:String((action as any).executionDomain||'REGISTERED_ROUTE_DOMAIN'),capabilityId:String((action as any).capabilityId||'')||null,routeId:String((action as any).routeId||'')||null,basePriority:routeBase,relativePriority,readiness:ready,
      capacity:{tier,logicalLanes,logicalFanout,temporalHz:temporalHz(cl(.55*motion+.25*temporalError+.20*combined)),historyDepth:historyDepth(cl(.45*residual+.25*motion+.20*coherenceGap+.10*combined)),viewResolution,accuracyLanes:now.promotion.accuracy.lanes,solverFidelity:solver},
      relativity:{whole:`CANON_STATE:${now.canonical.stateId}`,part:`CAPABILITY:${action.route}`,inner:`EXECUTION_DOMAIN:${String((action as any).executionDomain||'REGISTERED')}`,outer:`SYSTEM:R154`,observer:input.frame.observerFrame,orientation:input.frame.orientation,projectionAddress:now.motion.projection.temporalProjectionAddress,canonicalAddress:now.canonical.address,nowAddress:now.now.id},
      pressures:{motion,residual,truthGap,coherenceGap,temporalError,observer,operation:operationP,combined},
      lineage:{r153Fingerprint:now.fingerprint,truthFingerprint:truth.fingerprint,lemmaFingerprint:now.selfModel.currentLemmaFingerprint,nowAddress:now.now.id,canonicalStateId:now.canonical.stateId},
      boundary:'R154 capacity is a relative execution/projection budget over one canonical source state. Logical lanes/fanout are scheduling plans until R146/R147 receipts prove actual invocation. Higher resolution, solver fidelity or compute pressure never increases empirical truth authority or admits CanonState.'
    };
  }).sort((a,b)=>b.relativePriority-a.relativePriority||a.route.localeCompare(b.route));
  const summary={plannedRoutes:plans.length,maxLogicalLanes:Math.max(1,...plans.map(x=>x.capacity.logicalLanes)),maxViewResolution:Math.max(12,...plans.map(x=>x.capacity.viewResolution)),maxTemporalHz:Math.max(1,...plans.map(x=>x.capacity.temporalHz)),meanCombinedPressure:mean(plans.map(x=>x.pressures.combined)),deviceProofRequired:plans.filter(x=>x.readiness==='DEVICE_PROOF_REQUIRED').length,evidenceRequired:plans.filter(x=>x.readiness==='EVIDENCE_REQUIRED').length,proofRequired:plans.filter(x=>x.readiness==='PROOF_REQUIRED').length,sandboxOnly:plans.filter(x=>x.readiness==='SANDBOX_ONLY').length};
  return{schema:R154_SCHEMA,laws:R154_LAWS,canonical:now.canonical,now:now.now,motion:now.motion,atlasCoherence:now.atlasCoherence,lemma:{exchangeCount:now.lemma.exchangeCount,fingerprint:now.selfModel.currentLemmaFingerprint},truth:{status:truth.evidenceStatus,confidence:truth.truthConfidence,uncertainty:truth.uncertainty,responsePath:truth.responsePath,fingerprint:truth.fingerprint},plans,summary,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R154 applies motion, dimensional relativity, Woven Continuity and compounded atlas coherence to software capacity allocation across every registered operation. Whole/part and inner/outer are declared frame roles. 12/144/1,728/20,736/248,832 remain representational or scheduling resolution levels, not literal physical dimensions. Capacity planning is not execution proof, and coherence is not empirical replication.'};
}

export function relativeCapacityManifestR154(){return{schema:R154_SCHEMA,laws:R154_LAWS,inputs:['canonical packet','R153 causal NOW','R152 truth envelope','R151 all-mode fusion','R140 registered operation routes'],outputs:['relative operation priority','logical compute lanes','logical swarm fanout','temporal sampling','history/scar depth','view resolution','solver fidelity','readiness gate','lineage receipt context'],topology:{addressLevels:[12,144,1728,20736,248832],logicalExecutionLevels:[1,12,144,1728,20736]},authority:{canonicalMutation:false,admission:'R125',nativeExecution:'R146/R147 receipt-gated',truth:'R152 external-evidence precedence'},boundary:'Manifest describes implemented R154 planning semantics. It does not claim planned lanes, clouds, solvers or Hybrid operations executed until their own first-hand receipts exist.'}}

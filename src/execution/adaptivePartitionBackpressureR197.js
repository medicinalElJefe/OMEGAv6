import {runtimeStorageR168} from './runtimeStorageR168.js';
import {executeBoundedPartitionsR196,manifestR196,planPartitionConcurrencyR196} from './boundedPartitionSchedulerR196.js';

export const R197_REVISION='R197';
export const R197_SCHEMA='OMEGA_ADAPTIVE_PARTITION_BACKPRESSURE_R197';
export const R197_LAWS=Object.freeze([
 'R196_REMAINS_THE_HARD_BOUNDED_SCHEDULER_AND_R193_DERIVED_CEILING_AUTHORITY',
 'R197_MAY_ONLY_REDUCE_OR_RECOVER_WITHIN_THE_CURRENT_R196_CEILING',
 'FAILURE_CAUSES_MULTIPLICATIVE_DECREASE',
 'TWO_CONSECUTIVE_HEALTHY_UNCAPPED_BATCHES_ALLOW_ONE_ADDITIVE_RECOVERY_STEP',
 'CURRENT_R193_R196_CEILING_REDUCTION_CLAMPS_IMMEDIATELY',
 'OPERATOR_PARTITION_CONCURRENCY_REMAINS_A_HARD_CURRENT_RUN_LOWER_CAP',
 'OPERATOR_LIMITED_SUCCESS_DOES_NOT_INFLATE_THE_REMEMBERED_CONTROLLER_WINDOW',
 'R196_STAY_WITH_ZERO_DIRTY_WORK_DOES_NOT_MATURE_PROVIDER_SUCCESS_HISTORY',
 'FEEDBACK_SCOPE_IS_ROUTE_DOMAIN_EXECUTOR_MODEL_LOCAL_NOT_GLOBAL',
 'LATENCY_AND_THROUGHPUT_METRICS_ARE_MEASURED_INFORMATION_NOT_TRUTH_EVIDENCE',
 'R197_TURN_DIRECTION_IS_SCHEDULING_FEEDBACK_NOT_A_PHYSICAL_OR_TRUTH_STATE',
 'BACKPRESSURE_NEVER_AUTHORIZES_EXECUTION_OR_ESCALATES_EXECUTOR_AUTHORITY',
 'R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY',
 'R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY',
 'R182_REMAINS_VERIFIED_RETURN_WORLD_RECONCILIATION_AUTHORITY',
 'R159_REMAINS_CONVERGENCE_CANDIDATE_AUTHORITY',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const PREFIX='execution:r197:partition-feedback:';
const ALPHA=.25;
const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
const int=(v,f=0)=>Math.max(0,Math.floor(finite(v,f)));
const txt=(v,n=180)=>String(v??'').trim().slice(0,n);
const safe=(v,n=120)=>txt(v,n).replace(/[^A-Za-z0-9._:-]/g,'_')||'unknown';
const ewma=(prior,next,alpha=ALPHA)=>Number.isFinite(Number(prior))?(1-alpha)*Number(prior)+alpha*Number(next):Number(next);
const routeIdentity=run=>safe(run?.contract?.routeId||run?.contract?.capabilityId||run?.contract?.route||run?.contract?.executionDomain||'unknown');
const domainIdentity=run=>safe(String(run?.contract?.executionDomain||'UNKNOWN').toUpperCase(),40);
export const feedbackScopeR197=({run,executorId='WORKERS_AI',model='unknown'}={})=>`${routeIdentity(run)}|${domainIdentity(run)}|${safe(String(executorId).toUpperCase(),48)}|${safe(model,96)}`;
const feedbackKey=scope=>PREFIX+safe(scope,360);
const storage=runtime=>runtimeStorageR168(runtime);

function neutralState(scope,baseWindow=1){return{schema:R197_SCHEMA,revision:R197_REVISION,scope,controllerWindow:Math.max(1,int(baseWindow,1)),successStreak:0,sampleCount:0,successCount:0,failureCount:0,lastOutcome:'NONE',lastAdjustment:'NONE',lastBaseCeiling:Math.max(1,int(baseWindow,1)),updatedAt:0,canonicalMutation:false,canonicalAdmissionAuthority:'R125'}}
export async function readPartitionFeedbackR197(runtime,scopeOrContext){const scope=typeof scopeOrContext==='string'?scopeOrContext:feedbackScopeR197(scopeOrContext||{});return await storage(runtime).get(feedbackKey(scope))||null}

export function evolvePartitionFeedbackR197(prior,{ok=false,started=0,completed=0,durationMs=0,observedMaxActive=0,baseCeiling=1,operatorLimited=false,scope='unknown'}={}){
 const ceiling=Math.max(1,int(baseCeiling,1)),old=prior&&typeof prior==='object'?prior:neutralState(scope,ceiling),oldWindow=Math.max(1,int(old.controllerWindow,ceiling)),boundedOld=Math.min(oldWindow,ceiling),hasProviderSample=int(started)>0;
 if(!hasProviderSample)return{state:{...old,lastBaseCeiling:ceiling},recorded:false,reason:'R196_STAY_OR_NO_PROVIDER_PARTITION_SAMPLE'};
 let controllerWindow=boundedOld,successStreak=int(old.successStreak),lastAdjustment='NONE';
 if(!ok){controllerWindow=Math.max(1,Math.floor(boundedOld/2));successStreak=0;lastAdjustment=controllerWindow<boundedOld?'DOWN':'NONE'}
 else if(operatorLimited){successStreak=int(old.successStreak);lastAdjustment=oldWindow>ceiling?'CLAMP':'NONE'}
 else{
  successStreak+=1;
  if(oldWindow>ceiling){controllerWindow=ceiling;successStreak=0;lastAdjustment='CLAMP'}
  else if(successStreak>=2&&boundedOld<ceiling){controllerWindow=Math.min(ceiling,boundedOld+1);successStreak=0;lastAdjustment='UP'}
 }
 const duration=Math.max(0,finite(durationMs)),perPartition=int(completed)>0?duration/Math.max(1,int(completed)):duration,next={...old,schema:R197_SCHEMA,revision:R197_REVISION,scope,controllerWindow,successStreak,sampleCount:int(old.sampleCount)+1,successCount:int(old.successCount)+(ok?1:0),failureCount:int(old.failureCount)+(ok?0:1),lastOutcome:ok?'SUCCESS':'FAILURE',lastAdjustment,lastBaseCeiling:ceiling,lastStarted:int(started),lastCompleted:int(completed),lastObservedMaxActive:int(observedMaxActive),lastDurationMs:duration,durationEwmaMs:ewma(old.durationEwmaMs,duration),perPartitionEwmaMs:ewma(old.perPartitionEwmaMs,perPartition),updatedAt:Date.now(),canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 return{state:next,recorded:true,reason:ok?(operatorLimited?'SUCCESS_OPERATOR_LIMITED_NO_RECOVERY_CREDIT':lastAdjustment==='UP'?'HEALTHY_STREAK_ADDITIVE_RECOVERY':'HEALTHY_SAMPLE_ACCUMULATED'):'FAILURE_MULTIPLICATIVE_DECREASE'};
}

export async function planAdaptivePartitionWindowR197(runtime,{run,multiAxis=null,input={},dirtyCount=0,executorId='WORKERS_AI',model='unknown'}={}){
 const basePlan=planPartitionConcurrencyR196({multiAxis,input,dirtyCount}),scope=feedbackScopeR197({run,executorId,model}),prior=await readPartitionFeedbackR197(runtime,scope),axisCeiling=Math.max(1,int(basePlan.derivedMax,1)),remembered=Math.max(1,int(prior?.controllerWindow,axisCeiling)),controllerWindow=Math.min(remembered,axisCeiling),effectiveConcurrency=basePlan.concurrency===0?0:Math.max(1,Math.min(basePlan.concurrency,controllerWindow)),naturalCurrentMax=Math.max(0,Math.min(int(dirtyCount),axisCeiling)),operatorLimited=basePlan.requested!==null&&basePlan.requested<naturalCurrentMax;
 let turnDirection='NONE',feedbackReason='NO_BACKPRESSURE_REQUIRED';
 if(basePlan.turn==='STAY'){feedbackReason='NO_DIRTY_PROVIDER_WORK'}
 else if(remembered>axisCeiling){turnDirection='CLAMP';feedbackReason='CURRENT_R193_R196_CEILING_BELOW_REMEMBERED_WINDOW'}
 else if(effectiveConcurrency<basePlan.concurrency){turnDirection=prior?.lastAdjustment==='UP'?'UP':'DOWN';feedbackReason='DURABLE_FEEDBACK_WINDOW_BELOW_CURRENT_R196_BASE_WINDOW'}
 else if(prior?.lastAdjustment==='UP'){turnDirection='UP';feedbackReason='RECOVERED_WINDOW_REACHED_CURRENT_R196_BASE_WINDOW'}
 return{ok:true,schema:'OMEGA_ADAPTIVE_PARTITION_WINDOW_PLAN_R197',revision:R197_REVISION,scope,runId:run?.id||null,basePlan,prior:prior?{controllerWindow:int(prior.controllerWindow),successStreak:int(prior.successStreak),sampleCount:int(prior.sampleCount),successCount:int(prior.successCount),failureCount:int(prior.failureCount),lastOutcome:prior.lastOutcome||'NONE',lastAdjustment:prior.lastAdjustment||'NONE',durationEwmaMs:finite(prior.durationEwmaMs),perPartitionEwmaMs:finite(prior.perPartitionEwmaMs)}:null,controllerWindow,effectiveConcurrency,operatorLimited,turn:basePlan.turn,turnDirection,feedbackReason,dynamic:true,durableFeedback:true,replanOnEveryRun:true,selfEscalation:false,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R197 reads route/domain/executor/model-local measured execution feedback and can only lower or cautiously recover the current execution window within the current R196 plan and R193-derived ceiling. STAY/TURN and DOWN/UP/CLAMP are scheduling feedback states only; they do not authorize execution, prove provider truth, upgrade evidence, validate a solver, or mutate CanonState.'};
}

export async function recordPartitionFeedbackR197(runtime,{plan,batch}={}){
 if(!plan?.scope||!plan?.basePlan)return{ok:false,status:400,code:'R197_PLAN_REQUIRED'};
 const prior=await readPartitionFeedbackR197(runtime,plan.scope),metrics=batch?.metrics||{},evolved=evolvePartitionFeedbackR197(prior,{ok:batch?.ok===true,started:metrics.started,completed:metrics.completed,durationMs:metrics.durationMs,observedMaxActive:metrics.observedMaxActive,baseCeiling:plan.basePlan.derivedMax,operatorLimited:plan.operatorLimited,scope:plan.scope});
 if(!evolved.recorded)return{ok:true,recorded:false,reason:evolved.reason,state:prior||null,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 await storage(runtime).put(feedbackKey(plan.scope),evolved.state);return{ok:true,recorded:true,reason:evolved.reason,state:evolved.state,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R197 recorded measured batch performance only. This durable controller state may alter a later bounded scheduling window but is not execution proof, factual evidence, scientific validation, or CanonState.'};
}

export async function executeAdaptivePartitionsR197(runtime,items,worker,{run,multiAxis=null,input={},executorId='WORKERS_AI',model='unknown'}={}){
 if(!Array.isArray(items))return{ok:false,status:400,code:'R197_ITEMS_ARRAY_REQUIRED'};
 if(typeof worker!=='function')return{ok:false,status:400,code:'R197_WORKER_FUNCTION_REQUIRED'};
 const adaptivePlan=await planAdaptivePartitionWindowR197(runtime,{run,multiAxis,input,dirtyCount:items.length,executorId,model}),effectiveInput={...input};
 if(adaptivePlan.effectiveConcurrency>0)effectiveInput.partitionConcurrency=adaptivePlan.effectiveConcurrency;
 const batch=await executeBoundedPartitionsR196(items,worker,{multiAxis,input:effectiveInput}),feedback=await recordPartitionFeedbackR197(runtime,{plan:adaptivePlan,batch});
 return{...batch,revision:R197_REVISION,schedulerRevision:'R196',adaptivePlan,feedback,truthBoundary:batch?.ok===true?'R197 adapted only the bounded execution window; R196 still executed the dirty partition pool. Measured feedback changes future scheduling pressure only and does not change result truth, proof authority, or CanonState.':'R197/R196 failed closed. The measured failed batch may reduce the next scheduling window, but failure creates no R195 partition publication, no R194 whole-result publication, and no truth or Canon promotion.'};
}

export function manifestR197(){return{ok:true,schema:'OMEGA_ADAPTIVE_PARTITION_BACKPRESSURE_MANIFEST_R197',revision:R197_REVISION,laws:R197_LAWS,controller:{type:'BOUNDED_AIMD',failure:'MULTIPLICATIVE_DECREASE_FLOOR_HALF_MIN_ONE',recovery:'TWO_HEALTHY_UNCAPPED_PROVIDER_BATCHES_THEN_ADDITIVE_PLUS_ONE',hardCeiling:'CURRENT_R196_PLAN_UNDER_R193_COMPUTE_AXIS',operatorCap:'CURRENT_RUN_HARD_LOWER_CAP',stay:'ZERO_DIRTY_WORK_DOES_NOT_MATURE_PROVIDER_HISTORY',scope:'ROUTE_DOMAIN_EXECUTOR_MODEL_LOCAL',latencyControl:'MEASURED_AND_REPORTED_NOT_YET_USED_TO_RAISE_OR_LOWER_WINDOW'},dynamicTurn:{states:['STAY','TURN'],directions:['NONE','DOWN','UP','CLAMP'],selfEscalation:false},process:['R193_CURRENT_COMPUTE_CEILING','R194_WHOLE_REUSE_CHECK','R195_PARTITION_DIFF_AND_CARRY','R196_BASE_DIRTY_SET_PLAN','R197_DURABLE_FEEDBACK_READ','R197_EFFECTIVE_WINDOW_CLAMP_OR_RECOVERY','R196_BOUNDED_DIRTY_EXECUTION','R197_MEASURED_OUTCOME_RECORD','R195_ORDERED_REASSEMBLY','R147_PERSIST_RETURN','R146_RETURNED','R147_RETURN_SHA_VERIFY','R146_VERIFIED','R195_VERIFIED_PARTITION_PUBLICATION','R194_VERIFIED_WHOLE_RESULT_PUBLICATION','R182_VERIFIED_RETURN_RECONCILIATION','R159_CONVERGENCE_CANDIDATE','R125_SEPARATE_ADMISSION_AUTHORITY','NEXT_RUN_REEVALUATES_FROM_CURRENT_STATE'],storage:'R168_EXISTING_DURABLE_RUNTIME_STORAGE',boundedScheduler:manifestR196(),authority:{multiAxis:'R193',wholeReuse:'R194',differentialCarry:'R195',boundedScheduler:'R196',feedbackPolicy:'R197',dispatch:'R147',history:'R146',verifiedReturnReconciliation:'R182',convergence:'R159',admission:'R125'},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R197 is a durable performance-feedback policy over the already bounded R196 dirty-work scheduler. It can reduce execution pressure after failure and recover one bounded step after repeated healthy uncapped batches, never above the current R193/R196 ceiling. It does not create a physical primitive, authorize work, claim provider execution before R147/R146, change R141 proof, infer scientific validity, self-escalate authority, or admit CanonState.'}};

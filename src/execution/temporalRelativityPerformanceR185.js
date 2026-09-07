import {runtimeStorageR168} from './runtimeStorageR168.js';

export const R185_REVISION='R185';
export const R185_SCHEMA='OMEGA_TEMPORAL_RELATIVITY_PERFORMANCE_R185';
export const R185_LAWS=Object.freeze([
 'PREDICT_CARRY_CORRECT_REALLOCATE',
 'TIME_AND_MOTION_REDUCE_RECOMPUTATION_BY_TRACKING_DELTA_NOT_REBUILDING_ABSOLUTE_STATE',
 'R154_RELATIVE_CAPACITY_IS_AN_INPUT_SIGNAL_NOT_EXECUTION_PROOF',
 'VERIFIED_HISTORY_MAY_CHANGE_EXECUTOR_PRIORITY_BUT_NEVER_TRUTH_AUTHORITY',
 'IMMATURE_HISTORY_PRESERVES_EXISTING_R147_DEFAULT_SELECTION',
 'EXPLICIT_EXECUTOR_OR_NON_AUTO_STRATEGY_OVERRIDES_ADAPTIVE_SELECTION',
 'STABLE_STATE_INCREASES_CARRY_FRACTION_AND_CHANGE_PRESSURE_INCREASES_RECOMPUTE_FRACTION',
 'MOTION_VELOCITY_AND_ACCELERATION_MAY_PREWARM_WORK_WITHOUT_PRETENDING_PREDICTION_IS_OBSERVATION',
 'DISPATCH_ACCEPTANCE_IS_NOT_EXECUTION_SUCCESS',
 'ONLY_TERMINAL_OUTCOMES_MATURE_EXECUTOR_RELIABILITY_HISTORY',
 'FAILED_OR_SLOW_EXECUTION_DECREASES_FUTURE_PERFORMANCE_SCORE',
 'R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY',
 'R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const ROUTE_PREFIX='execution:r185:route:';
const ALPHA=.22;
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
const txt=(v,n=180)=>String(v??'').trim().slice(0,n);
const safe=v=>txt(v,180).replace(/[^A-Za-z0-9._:-]/g,'_')||'unknown';
const ewma=(prior,next,alpha=ALPHA)=>Number.isFinite(Number(prior))?(1-alpha)*Number(prior)+alpha*Number(next):Number(next);
const routeIdentity=run=>safe(run?.contract?.routeId||run?.contract?.capabilityId||run?.contract?.route||run?.contract?.executionDomain||'unknown');
const routeKey=run=>ROUTE_PREFIX+routeIdentity(run);
const availableState=v=>v==='AVAILABLE';
const chosen=(score,rows,fallback)=>{for(const [cut,value] of rows)if(score<cut)return value;return fallback};

function performanceHint(run,input={}){
 const explicit=input?.performanceHint&&typeof input.performanceHint==='object'?input.performanceHint:{};
 const metadata=run?.metadata&&typeof run.metadata==='object'?run.metadata:{};
 const direct=metadata.relativeCapacityR154&&typeof metadata.relativeCapacityR154==='object'?metadata.relativeCapacityR154:{};
 const adaptive=metadata.adaptiveContext&&typeof metadata.adaptiveContext==='object'?metadata.adaptiveContext:{};
 const nested=adaptive.relativeCapacityR154&&typeof adaptive.relativeCapacityR154==='object'?adaptive.relativeCapacityR154:adaptive.capacityR154&&typeof adaptive.capacityR154==='object'?adaptive.capacityR154:{};
 const r154=Object.keys(direct).length?direct:nested,p=r154.pressures||{};
 return{
  motion:cl(explicit.motion??p.motion),
  residual:cl(explicit.residual??p.residual),
  truthGap:cl(explicit.truthGap??p.truthGap),
  coherenceGap:cl(explicit.coherenceGap??p.coherenceGap),
  temporalError:cl(explicit.temporalError??p.temporalError),
  combined:cl(explicit.combined??p.combined),
  priority:cl(explicit.priority??r154.relativePriority??.5),
  source:Object.keys(direct).length?'R154_RUN_METADATA_PLUS_OPTIONAL_EXECUTION_HINT':Object.keys(nested).length?'R154_ADAPTIVE_CONTEXT_PLUS_OPTIONAL_EXECUTION_HINT':'OPTIONAL_EXECUTION_HINT_OR_NEUTRAL_DEFAULT'
 };
}
function pressureOf(h){return cl(.27*h.motion+.25*h.residual+.12*h.truthGap+.10*h.coherenceGap+.12*h.temporalError+.14*h.combined)}
function modeOf(recompute,predicted){if(predicted>=.82||recompute>=.82)return'ESCALATE';if(predicted>=.58||recompute>=.58)return'REFINE';if(predicted>=.28||recompute>=.28)return'DELTA_UPDATE';return'CARRY'}
function workingSetOf(p){return chosen(p,[[.18,12],[.36,144],[.58,1728],[.80,20736]],248832)}
function hzOf(p){return chosen(p,[[.18,1],[.34,2],[.50,6],[.66,12],[.82,30]],60)}
function executorChangeFit(id,p){
 if(p>=.72){if(id==='AUTONOMIC_SWARM')return 1;if(id==='FEDERATION_CHAIN')return .90;if(id==='WORKERS_AI')return .75;if(id==='HYBRID_HOST')return .82;return .60}
 if(p<=.32){if(id==='LOCAL_RUNTIME'||id==='LOCAL_PROOF')return 1;if(id==='WORKERS_AI')return .94;if(id==='HYBRID_HOST')return .80;if(id==='FEDERATION_CHAIN')return .62;if(id==='AUTONOMIC_SWARM')return .55}
 return .76;
}
function executorMetric(state,id){const row=state?.executors?.[id]||{};return{count:finite(row.count),dispatchCount:finite(row.dispatchCount),successEwma:Number.isFinite(Number(row.successEwma))?cl(row.successEwma):.70,verifiedEwma:Number.isFinite(Number(row.verifiedEwma))?cl(row.verifiedEwma):.50,latencyEwmaMs:Math.max(0,finite(row.latencyEwmaMs,1000)),dispatchLatencyEwmaMs:Math.max(0,finite(row.dispatchLatencyEwmaMs,250)),latencyVelocityMs:finite(row.latencyVelocityMs),latencyAccelerationMs:finite(row.latencyAccelerationMs),lastAt:finite(row.lastAt)}}

export async function readTemporalPerformanceR185(runtime,runOrRoute){
 const storage=runtimeStorageR168(runtime),key=typeof runOrRoute==='string'?ROUTE_PREFIX+safe(runOrRoute):routeKey(runOrRoute);return await storage.get(key)||null;
}

export async function planTemporalPerformanceR185(runtime,{run,directory,eligible=[],defaultExecutorId=null,input={}}={}){
 const state=await readTemporalPerformanceR185(runtime,run)||{},hint=performanceHint(run,input),currentPressure=pressureOf(hint),prior=state.route||{},velocity=currentPressure-finite(prior.pressure,currentPressure),acceleration=velocity-finite(prior.velocity,0),predictedPressure=cl(currentPressure+.46*velocity+.18*acceleration),carryFraction=cl(.91-.69*predictedPressure-.17*hint.residual,0,.92),recomputeFraction=cl(1-carryFraction),mode=modeOf(recomputeFraction,predictedPressure),workingSetResolution=workingSetOf(predictedPressure),targetTemporalHz=hzOf(predictedPressure);
 const explicitExecutor=txt(input?.executorId,64).toUpperCase(),strategy=txt(input?.strategy,32).toUpperCase(),explicitStrategy=Boolean(strategy&&strategy!=='AUTO'),candidates=eligible.map(id=>{const metric=executorMetric(state,id),dir=directory?.executors?.[id]||{},available=availableState(dir.state),maturity=cl(metric.count/12),latencyEfficiency=1/(1+metric.latencyEwmaMs/1000),trendPenalty=cl(Math.max(0,metric.latencyVelocityMs)/Math.max(250,metric.latencyEwmaMs),0,.25),defaultBias=id===defaultExecutorId?.18:0,score=available?cl(.28*metric.successEwma+.18*metric.verifiedEwma+.18*latencyEfficiency+.16*executorChangeFit(id,predictedPressure)+.10*maturity+.10*hint.priority+defaultBias-trendPenalty,0,1):0;return{id,state:dir.state||'UNAVAILABLE',available,count:metric.count,dispatchCount:metric.dispatchCount,maturity,reliability:metric.successEwma,verifiedRate:metric.verifiedEwma,latencyEwmaMs:metric.latencyEwmaMs,dispatchLatencyEwmaMs:metric.dispatchLatencyEwmaMs,latencyVelocityMs:metric.latencyVelocityMs,latencyAccelerationMs:metric.latencyAccelerationMs,score}}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 let recommendedExecutorId=defaultExecutorId,recommendationReason='R147_DEFAULT_PRESERVED_WHILE_HISTORY_MATURES';
 const defaultRow=candidates.find(x=>x.id===defaultExecutorId),best=candidates.find(x=>x.available&&x.count>=3);
 if(explicitExecutor||explicitStrategy){recommendedExecutorId=defaultExecutorId;recommendationReason='EXPLICIT_R147_SELECTION_POLICY_PRESERVED'}
 else if(best&&best.id!==defaultExecutorId&&best.maturity>=.25&&best.score>finite(defaultRow?.score)+.06){recommendedExecutorId=best.id;recommendationReason='MEASURED_TERMINAL_HISTORY_OUTPERFORMS_DEFAULT_WITH_MARGIN'}
 else if(defaultRow?.available){recommendationReason=defaultRow.count>=3?'DEFAULT_REMAINS_BEST_MEASURED_CHOICE':'R147_DEFAULT_PRESERVED_WHILE_HISTORY_MATURES'}
 const prewarm=candidates.filter(x=>x.available).slice(0,2).map(x=>({executorId:x.id,score:x.score,reason:'PREPARE_ONLY_NOT_INVOCATION'})),totalSamples=candidates.reduce((n,x)=>n+x.count,0),dispatchSamples=candidates.reduce((n,x)=>n+x.dispatchCount,0),historyMaturity=cl(totalSamples/24);
 return{ok:true,schema:R185_SCHEMA,revision:R185_REVISION,routeId:routeIdentity(run),runId:run?.id||null,mode,temporal:{currentPressure,velocity,acceleration,predictedPressure,targetTemporalHz},work:{carryFraction,recomputeFraction,workingSetResolution,prewarm},history:{terminalSamples:totalSamples,dispatchSamples,maturity:historyMaturity},selection:{defaultExecutorId,recommendedExecutorId,recommendationReason,adaptiveApplied:recommendedExecutorId!==defaultExecutorId&&!explicitExecutor&&!explicitStrategy,candidates},hint,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R185 converts measured terminal execution history plus R154 motion/residual pressure into scheduling and executor-priority advice. Dispatch acceptance is tracked separately and never matures reliability. Carry, prewarm, predicted pressure and adaptive executor choice are performance operations only; they do not prove observation, invocation, return, scientific validity, or CanonState admission.'};
}

export async function recordTemporalPerformanceR185(runtime,{run,executorId,ok=false,status=0,latencyMs=0,phase='DISPATCH',verified=false,terminal=true,input={}}={}){
 if(!run||!executorId)return null;
 const storage=runtimeStorageR168(runtime),key=routeKey(run),prior=await storage.get(key)||{schema:R185_SCHEMA,revision:R185_REVISION,routeId:routeIdentity(run),route:{},executors:{},updatedAt:0,canonicalMutation:false,canonicalAdmissionAuthority:'R125'},hint=performanceHint(run,input),pressure=pressureOf(hint),routePrior=prior.route||{},velocity=pressure-finite(routePrior.pressure,pressure),acceleration=velocity-finite(routePrior.velocity,0),id=txt(executorId,64).toUpperCase(),old=prior.executors?.[id]||{},latency=Math.max(0,Math.min(86400000,finite(latencyMs))),terminalSample=terminal!==false;
 let row;
 if(terminalSample){
  const oldLatency=finite(old.latencyEwmaMs,latency),newLatency=ewma(old.latencyEwmaMs,latency),latencyVelocity=newLatency-oldLatency,latencyAcceleration=latencyVelocity-finite(old.latencyVelocityMs,0),success=ok?1:0,verifiedValue=verified?1:0;
  row={...old,executorId:id,count:finite(old.count)+1,dispatchCount:finite(old.dispatchCount),successEwma:ewma(old.successEwma,success),verifiedEwma:ewma(old.verifiedEwma,verifiedValue),latencyEwmaMs:newLatency,dispatchLatencyEwmaMs:Number.isFinite(Number(old.dispatchLatencyEwmaMs))?Number(old.dispatchLatencyEwmaMs):undefined,latencyVelocityMs:latencyVelocity,latencyAccelerationMs:latencyAcceleration,lastLatencyMs:latency,lastStatus:finite(status),lastPhase:txt(phase,40),lastOutcome:ok?'TERMINAL_SUCCESS':'TERMINAL_FAILURE',lastRunId:run.id,lastAt:Date.now()};
 }else{
  row={...old,executorId:id,count:finite(old.count),dispatchCount:finite(old.dispatchCount)+1,dispatchLatencyEwmaMs:ewma(old.dispatchLatencyEwmaMs,latency),lastDispatchLatencyMs:latency,lastStatus:finite(status),lastPhase:txt(phase,40),lastOutcome:'DISPATCH_ACCEPTED_NOT_TERMINAL',lastRunId:run.id,lastAt:Date.now()};
 }
 const next={...prior,route:{pressure,velocity,acceleration,predictedPressure:cl(pressure+.46*velocity+.18*acceleration),lastHint:hint,lastAt:Date.now()},executors:{...(prior.executors||{}),[id]:row},updatedAt:Date.now(),canonicalMutation:false,canonicalAdmissionAuthority:'R125'};await storage.put(key,next);return{schema:R185_SCHEMA,revision:R185_REVISION,routeId:next.routeId,route:next.route,executor:row,terminalRecorded:terminalSample,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
}

export function manifestR185(){return{ok:true,schema:'OMEGA_TEMPORAL_RELATIVITY_PERFORMANCE_MANIFEST_R185',revision:R185_REVISION,laws:R185_LAWS,loop:['PREDICT','CARRY','CORRECT','REALLOCATE'],inputs:['R146 durable run metadata','R154 motion/residual/capacity envelope','R147 executor availability','measured dispatch latency','measured terminal return latency','measured terminal success/failure','verified-return state'],outputs:['predicted change pressure','carry/recompute fraction','adaptive working-set resolution','target temporal cadence','prewarm candidates','history-matured executor recommendation'],historyPolicy:{dispatchAcceptance:'TRACKED_SEPARATELY_NOT_SUCCESS',terminalOutcome:'REQUIRED_TO_MATURE_RELIABILITY',verification:'SEPARATE_RATE'},authority:{executorDispatch:'R147',durableHistory:'R146',relativeCapacity:'R154',canonicalAdmission:'R125'},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R185 is a performance adaptation fabric. It learns execution cost and temporal trend from first-hand runtime history and may reprioritize eligible executors after sufficient terminal samples. Dispatch acceptance never counts as execution success. It cannot authorize execution, invent observations, change R141/R159 proof closure, validate scientific claims, or admit CanonState.'}}

export const R196_REVISION='R196';
export const R196_SCHEMA='OMEGA_BOUNDED_PARTITION_SCHEDULER_R196';
export const R196_HARD_CONCURRENCY_MAX=12;
export const R196_LAWS=Object.freeze([
 'ONLY_R195_DIRTY_PARTITIONS_ENTER_THE_PARALLEL_SCHEDULER',
 'R193_COMPUTE_AXIS_SETS_THE_CONCURRENCY_CEILING',
 'EACH_RUN_REPLANS_FROM_CURRENT_R193_COMPUTE_AXIS_AND_CURRENT_R195_DIRTY_SET',
 'R195_CARRY_TO_DIRTY_TRANSITION_IS_A_SCHEDULING_TURN_NOT_A_TRUTH_PROMOTION',
 'OPERATOR_PARTITION_CONCURRENCY_MAY_LOWER_BUT_NEVER_RAISE_THE_R193_CEILING',
 'DIRTY_PARTITION_COUNT_BOUNDS_ACTUAL_CONCURRENCY',
 'GLOBAL_PROVIDER_CONCURRENCY_IS_HARD_CAPPED_AT_TWELVE',
 'NO_UNBOUNDED_PROMISE_FANOUT_IS_PERMITTED',
 'RESULT_ORDER_IS_DECLARED_PARTITION_ORDER_NOT_COMPLETION_ORDER',
 'FIRST_FAILURE_STOPS_NEW_SCHEDULING_WHILE_ALREADY_RUNNING_BOUNDED_WORK_MAY_SETTLE',
 'FAILED_BATCHES_PUBLISH_NO_NEW_R195_PARTITION_CACHE_ENTRIES',
 'PARALLELISM_CHANGES_LATENCY_NOT_TRUTH_AUTHORITY',
 'R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY',
 'R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);

const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
const int=(v,f=0)=>Math.max(0,Math.floor(finite(v,f)));
const txt=(v,n=300)=>String(v??'').trim().slice(0,n);

function derivedCeiling(logicalLanes){
 const lanes=Math.max(1,int(logicalLanes,1));
 if(lanes<=1)return 1;
 if(lanes<=12)return 2;
 if(lanes<=144)return 4;
 if(lanes<=1728)return 8;
 return R196_HARD_CONCURRENCY_MAX;
}

export function planPartitionConcurrencyR196({multiAxis=null,input={},dirtyCount=0}={}){
 const dirty=Math.max(0,int(dirtyCount)),logicalLanes=Math.max(1,int(multiAxis?.axes?.compute?.logicalLanes,1)),derivedMax=Math.min(R196_HARD_CONCURRENCY_MAX,derivedCeiling(logicalLanes));
 const requestedRaw=Number(input?.partitionConcurrency),requested=Number.isFinite(requestedRaw)&&requestedRaw>=1?Math.max(1,Math.floor(requestedRaw)):null;
 const requestedCeiling=requested===null?derivedMax:Math.min(requested,derivedMax),concurrency=dirty===0?0:Math.max(1,Math.min(dirty,requestedCeiling,R196_HARD_CONCURRENCY_MAX));
 const turn=dirty===0?'STAY':'TURN',turnReason=dirty===0?'R195_ALL_PARTITIONS_CARRIED_OR_NO_DIRTY_WORK':concurrency<dirty?'R195_DIRTY_SET_REQUIRES_BOUNDED_WAVES':'R195_DIRTY_SET_FITS_CURRENT_BOUNDED_PARALLEL_WINDOW';
 return{ok:true,schema:'OMEGA_PARTITION_CONCURRENCY_PLAN_R196',revision:R196_REVISION,dirtyCount:dirty,logicalLanes,derivedMax,requested,concurrency,hardMax:R196_HARD_CONCURRENCY_MAX,requestedRaisedAboveDerived:Boolean(requested!==null&&requested>derivedMax),turn,turnReason,dynamic:true,replanOnEveryRun:true,source:'R193_COMPUTE_AXIS_WITH_OPTIONAL_OPERATOR_LOWER_CAP',canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R196 concurrency is a bounded scheduling parameter derived afresh from the current R193 compute axis and current R195 dirty set. STAY/TURN here describes execution scheduling behavior only. More parallel calls can reduce wall-clock latency but do not increase evidence quality, provider truth, execution authority, proof depth, or CanonState authority.'};
}

export async function executeBoundedPartitionsR196(items,worker,{multiAxis=null,input={}}={}){
 if(!Array.isArray(items))return{ok:false,status:400,code:'R196_ITEMS_ARRAY_REQUIRED'};
 if(typeof worker!=='function')return{ok:false,status:400,code:'R196_WORKER_FUNCTION_REQUIRED'};
 const plan=planPartitionConcurrencyR196({multiAxis,input,dirtyCount:items.length});
 if(!items.length)return{ok:true,schema:R196_SCHEMA,revision:R196_REVISION,plan,results:[],metrics:{started:0,completed:0,unscheduled:0,observedMaxActive:0,durationMs:0,waves:0},canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const results=new Array(items.length);let cursor=0,active=0,observedMaxActive=0,started=0,completed=0,firstFailure=null;const startedAt=Date.now();
 const loop=async()=>{while(true){if(firstFailure)return;const index=cursor;if(index>=items.length)return;cursor+=1;active+=1;started+=1;observedMaxActive=Math.max(observedMaxActive,active);try{results[index]=await worker(items[index],index);completed+=1}catch(error){if(!firstFailure)firstFailure={index,code:'R196_PARTITION_EXECUTION_FAILED',message:txt(error instanceof Error?error.message:error,1000)}}finally{active-=1}}};
 const runners=[];for(let i=0;i<plan.concurrency;i+=1)runners.push(loop());await Promise.all(runners);const durationMs=Math.max(0,Date.now()-startedAt),metrics={started,completed,unscheduled:Math.max(0,items.length-started),observedMaxActive,durationMs,waves:plan.concurrency?Math.ceil(started/plan.concurrency):0};
 if(firstFailure)return{ok:false,status:502,schema:R196_SCHEMA,revision:R196_REVISION,code:firstFailure.code,failure:firstFailure,plan,metrics,results:results.map((value,index)=>value===undefined?null:{index,value}),canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'The bounded partition batch failed. R196 stops assigning new partitions after the first observed failure; already-running bounded calls may settle. The enclosing R147/R146 run must fail and no new R195 partition cache entries may be published from this batch.'};
 return{ok:true,status:200,schema:R196_SCHEMA,revision:R196_REVISION,plan,metrics,results,canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R196 completed bounded dirty-partition scheduling. Result order is input partition order even when provider calls finish out of order. Dynamic STAY/TURN and parallel completion are execution-performance behavior only and do not change proof or CanonState authority.'};
}

export function manifestR196(){return{ok:true,schema:'OMEGA_BOUNDED_PARTITION_SCHEDULER_MANIFEST_R196',revision:R196_REVISION,laws:R196_LAWS,hardConcurrencyMax:R196_HARD_CONCURRENCY_MAX,derivedConcurrency:[{logicalLanes:'1',max:1},{logicalLanes:'2-12',max:2},{logicalLanes:'13-144',max:4},{logicalLanes:'145-1728',max:8},{logicalLanes:'>1728',max:12}],dynamicTurn:{states:['STAY','TURN'],stay:'no dirty work enters provider execution',turn:'current R195 dirty set enters a newly replanned bounded provider window',replanInputs:['current R195 dirty count','current R193 compute logicalLanes','optional operator lower cap'],selfEscalation:false},process:['R193_AXIS_PLAN','R194_WHOLE_REUSE_CHECK','R195_PARTITION_DIFF','R196_DIRTY_SET','R196_BOUNDED_PARALLEL_EXECUTE','R195_ORDERED_REASSEMBLY','R147_PERSIST_RETURN','R146_RETURNED','R147_RETURN_SHA_VERIFY','R146_VERIFIED','R195_VERIFIED_PARTITION_PUBLICATION','R194_VERIFIED_WHOLE_RESULT_PUBLICATION','R182_VERIFIED_RETURN_RECONCILIATION','R159_CONVERGENCE_CANDIDATE','R125_SEPARATE_ADMISSION_AUTHORITY'],inputs:['R195 dirty partitions only','R193 compute logical-lane target','optional operator partitionConcurrency lower cap'],outputs:['bounded concurrency plan','STAY/TURN scheduling decision','ordered results','observed active-call metrics','fail-closed batch result'],failurePolicy:'FIRST_FAILURE_STOPS_NEW_ASSIGNMENTS_ALREADY_RUNNING_BOUNDED_CALLS_SETTLE_NO_R195_PUBLICATION',authority:{multiAxis:'R193',wholeReuse:'R194',differentialCarry:'R195',dispatch:'R147',history:'R146',verifiedReturnReconciliation:'R182',convergence:'R159',admission:'R125'},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R196 is a dynamic latency/throughput scheduler over already-authorized dirty work. Its STAY/TURN state is local scheduling behavior, not a new physical primitive, truth state, proof promotion, or Canon mutation. It cannot authorize execution, fabricate provider returns, upgrade carried evidence, establish factual truth, validate a solver, self-escalate authority, or admit CanonState.'}};

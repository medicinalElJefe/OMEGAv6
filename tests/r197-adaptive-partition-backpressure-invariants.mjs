import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRunR146,transitionRunR146} from '../src/execution/durableOperationExecutionR146.js';
import {dispatchRunR147,manifestR147} from '../src/execution/unifiedExecutorFabricR147.js';
import {executeAdaptivePartitionsR197,feedbackScopeR197,manifestR197,planAdaptivePartitionWindowR197,readPartitionFeedbackR197,R197_LAWS} from '../src/execution/adaptivePartitionBackpressureR197.js';

class Storage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
class Runtime{constructor(env={}){this.state={storage:new Storage()};this.env=env}async devices(){return[]}}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const multi4={axes:{compute:{logicalLanes:144}}};
const multi2={axes:{compute:{logicalLanes:12}}};
const items=Array.from({length:8},(_,i)=>i);
const runA={id:'r197-direct-a',contract:{routeId:'route:r197-a',executionDomain:'AI'}};
const runB={id:'r197-direct-b',contract:{routeId:'route:r197-b',executionDomain:'AI'}};
const directRuntime=new Runtime();

// Initial state uses the current R193/R196 ceiling and contains no invented history.
let plan=await planAdaptivePartitionWindowR197(directRuntime,{run:runA,multiAxis:multi4,dirtyCount:8,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(plan.basePlan.derivedMax,4);assert.equal(plan.basePlan.concurrency,4);assert.equal(plan.effectiveConcurrency,4);assert.equal(plan.prior,null);assert.equal(plan.turn,'TURN');assert.equal(plan.turnDirection,'NONE');

// A failed four-wide batch reduces the next remembered window to two and stops new assignments after the bounded in-flight wave.
const failed=await executeAdaptivePartitionsR197(directRuntime,items,async item=>{if(item===0){await sleep(1);throw new Error('intentional-r197-failure')}await sleep(12);return item},{run:runA,multiAxis:multi4,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(failed.ok,false);assert.equal(failed.code,'R196_PARTITION_EXECUTION_FAILED');assert.equal(failed.adaptivePlan.effectiveConcurrency,4);assert.equal(failed.metrics.started,4);assert.equal(failed.metrics.unscheduled,4);assert.equal(failed.feedback.recorded,true);assert.equal(failed.feedback.state.controllerWindow,2);assert.equal(failed.feedback.state.lastAdjustment,'DOWN');assert.equal(failed.feedback.state.failureCount,1);
plan=await planAdaptivePartitionWindowR197(directRuntime,{run:runA,multiAxis:multi4,dirtyCount:8,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(plan.effectiveConcurrency,2);assert.equal(plan.turnDirection,'DOWN');assert.equal(plan.prior.controllerWindow,2);

// Two consecutive healthy uncapped batches grant exactly one additive recovery step: 2 -> 3.
let active=0,maxActive=0;
let success=await executeAdaptivePartitionsR197(directRuntime,items,async item=>{active++;maxActive=Math.max(maxActive,active);await sleep(4);active--;return item},{run:runA,multiAxis:multi4,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(success.ok,true);assert.equal(success.adaptivePlan.effectiveConcurrency,2);assert.equal(success.metrics.observedMaxActive,2);assert.equal(maxActive,2);assert.equal(success.feedback.state.controllerWindow,2);assert.equal(success.feedback.state.successStreak,1);assert.equal(success.feedback.state.lastAdjustment,'NONE');
maxActive=0;success=await executeAdaptivePartitionsR197(directRuntime,items,async item=>{active++;maxActive=Math.max(maxActive,active);await sleep(4);active--;return item},{run:runA,multiAxis:multi4,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(success.ok,true);assert.equal(success.adaptivePlan.effectiveConcurrency,2);assert.equal(maxActive,2);assert.equal(success.feedback.state.controllerWindow,3);assert.equal(success.feedback.state.successStreak,0);assert.equal(success.feedback.state.lastAdjustment,'UP');
plan=await planAdaptivePartitionWindowR197(directRuntime,{run:runA,multiAxis:multi4,dirtyCount:8,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(plan.effectiveConcurrency,3);assert.equal(plan.turnDirection,'UP');

// Another two healthy uncapped batches recover 3 -> 4, and healthy work at the ceiling cannot accumulate stale recovery credit or exceed the ceiling.
success=await executeAdaptivePartitionsR197(directRuntime,items,async item=>{await sleep(3);return item},{run:runA,multiAxis:multi4,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(success.feedback.state.controllerWindow,3);assert.equal(success.feedback.state.successStreak,1);
success=await executeAdaptivePartitionsR197(directRuntime,items,async item=>{await sleep(3);return item},{run:runA,multiAxis:multi4,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(success.feedback.state.controllerWindow,4);assert.equal(success.feedback.state.lastAdjustment,'UP');
success=await executeAdaptivePartitionsR197(directRuntime,items,async item=>item,{run:runA,multiAxis:multi4,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(success.adaptivePlan.effectiveConcurrency,4);assert.equal(success.feedback.state.controllerWindow,4);assert.equal(success.feedback.state.successStreak,0);assert.ok(success.feedback.state.controllerWindow<=success.adaptivePlan.basePlan.derivedMax);

// A lower current R193/R196 ceiling clamps immediately even when durable history remembers a larger window.
plan=await planAdaptivePartitionWindowR197(directRuntime,{run:runA,multiAxis:multi2,dirtyCount:8,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(plan.basePlan.derivedMax,2);assert.equal(plan.controllerWindow,2);assert.equal(plan.effectiveConcurrency,2);assert.equal(plan.turnDirection,'CLAMP');
success=await executeAdaptivePartitionsR197(directRuntime,items,async item=>item,{run:runA,multiAxis:multi2,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(success.feedback.state.controllerWindow,2);assert.equal(success.feedback.state.lastAdjustment,'CLAMP');assert.equal(success.feedback.state.successStreak,0);

// Operator caps are current-run lower caps only and break recovery-credit consecutiveness rather than inflating remembered capacity.
plan=await planAdaptivePartitionWindowR197(directRuntime,{run:runA,multiAxis:multi4,input:{partitionConcurrency:1},dirtyCount:8,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(plan.effectiveConcurrency,1);assert.equal(plan.operatorLimited,true);assert.equal(plan.controllerWindow,2);
success=await executeAdaptivePartitionsR197(directRuntime,items,async item=>item,{run:runA,multiAxis:multi4,input:{partitionConcurrency:1},executorId:'WORKERS_AI',model:'model-a'});
assert.equal(success.feedback.state.controllerWindow,2);assert.equal(success.feedback.state.successStreak,0);assert.equal(success.feedback.reason,'SUCCESS_OPERATOR_LIMITED_NO_RECOVERY_CREDIT');

// STAY/zero-dirty work records no provider sample and cannot mature recovery history.
const scopeA=feedbackScopeR197({run:runA,executorId:'WORKERS_AI',model:'model-a'}),beforeStay=await readPartitionFeedbackR197(directRuntime,scopeA);let zeroWorkerCalls=0;
const stay=await executeAdaptivePartitionsR197(directRuntime,[],async()=>{zeroWorkerCalls++;return null},{run:runA,multiAxis:multi4,executorId:'WORKERS_AI',model:'model-a'});
const afterStay=await readPartitionFeedbackR197(directRuntime,scopeA);
assert.equal(stay.ok,true);assert.equal(stay.adaptivePlan.turn,'STAY');assert.equal(stay.adaptivePlan.effectiveConcurrency,0);assert.equal(stay.feedback.recorded,false);assert.equal(zeroWorkerCalls,0);assert.equal(afterStay.sampleCount,beforeStay.sampleCount);assert.equal(afterStay.successStreak,beforeStay.successStreak);

// Feedback is route/domain/executor/model local; another route starts from the current base ceiling instead of inheriting route A pressure.
const scopeB=feedbackScopeR197({run:runB,executorId:'WORKERS_AI',model:'model-a'});assert.notEqual(scopeA,scopeB);assert.equal(await readPartitionFeedbackR197(directRuntime,scopeB),null);
plan=await planAdaptivePartitionWindowR197(directRuntime,{run:runB,multiAxis:multi4,dirtyCount:8,executorId:'WORKERS_AI',model:'model-a'});
assert.equal(plan.effectiveConcurrency,4);assert.equal(plan.prior,null);

// Failure during an operator-limited one-wide batch must not rebound to unexecuted remembered capacity.
const limitedRuntime=new Runtime(),limitedRun={id:'r197-limited-failure',contract:{routeId:'route:r197-limited-failure',executionDomain:'AI'}};
const limitedFail=await executeAdaptivePartitionsR197(limitedRuntime,items,async item=>{if(item===0)throw new Error('one-wide-failure');return item},{run:limitedRun,multiAxis:multi4,input:{partitionConcurrency:1},executorId:'WORKERS_AI',model:'model-a'});
assert.equal(limitedFail.adaptivePlan.effectiveConcurrency,1);assert.equal(limitedFail.feedback.state.controllerWindow,1,'failure backpressure must halve the observed bounded active window, not unused controller capacity');

// Integrated R147/R195/R196/R197 proof: a failed Workers AI partition wave lowers the next run's actual provider concurrency without publishing failed partition carry.
const contract=()=>({schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:'route:r197-integrated',route:'R197 Integrated Lab',workspaceId:'ws',capabilityId:'capability:r197-integrated',executionDomain:'AI',state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'});
const stableR154={relativePriority:.10,capacity:{viewResolution:12,temporalHz:1,logicalLanes:144,solverFidelity:'NONE'},pressures:{motion:.01,residual:.01,truthGap:.01,coherenceGap:.01,temporalError:.01,observer:.05,combined:.01},relativity:{observer:'FRAME_STABLE'},lineage:{routeContract:'route:r197-integrated|capability:r197-integrated|AI|AVAILABLE'}};
async function authorized(runtime,label){const made=await createRunR146(runtime,{intent:'adaptive bounded partition synthesis',contract:contract(),metadata:{relativeCapacityR154:stableR154}});assert.equal(made.ok,true);const moved=await transitionRunR146(runtime,made.run.id,{state:'AUTHORIZED',reason:label});assert.equal(moved.ok,true);return moved.run}
const baseInput={operatorFingerprint:'7'.repeat(64),frameFingerprint:'8'.repeat(64),temperature:.2,maxTokens:256,requireFreshPartitions:true};
const parts=[{id:'A',prompt:'fail-fast'},...Array.from({length:7},(_,i)=>({id:String.fromCharCode(66+i),prompt:`integrated-${i}`}))];
let failMode=true,providerActive=0,providerMax=0,providerCalls=0;
const integratedRuntime=new Runtime({AI:{run:async(_model,body)=>{providerCalls++;providerActive++;providerMax=Math.max(providerMax,providerActive);const prompt=body?.messages?.find(x=>x.role==='user')?.content||'';try{if(failMode&&prompt==='fail-fast'){await sleep(1);throw new Error('integrated-provider-failure')}await sleep(8);return{response:`return:${prompt}`}}finally{providerActive--}}}});
let run=await authorized(integratedRuntime,'R197 integrated failure');let out=await dispatchRunR147(integratedRuntime,run.id,{...baseInput,inputFingerprint:'1'.repeat(64),partitions:parts});
assert.equal(out.ok,false);assert.equal(out.code,'R196_PARTITION_EXECUTION_FAILED');assert.equal(out.run.state,'FAILED');assert.equal(out.differential.scheduling.adaptivePlan.effectiveConcurrency,4);assert.equal(out.differential.scheduling.feedback.state.controllerWindow,2);assert.equal(out.differential.publication,undefined);assert.equal(providerMax,4);assert.ok(providerCalls<=4);
failMode=false;providerMax=0;providerCalls=0;run=await authorized(integratedRuntime,'R197 integrated recovery sample one');out=await dispatchRunR147(integratedRuntime,run.id,{...baseInput,inputFingerprint:'2'.repeat(64),partitions:parts});
assert.equal(out.ok,true);assert.equal(out.run.state,'VERIFIED');assert.equal(out.differential.plan.recompute,8);assert.equal(out.differential.scheduling.adaptivePlan.effectiveConcurrency,2);assert.equal(out.differential.scheduling.plan.concurrency,2);assert.equal(out.differential.scheduling.metrics.observedMaxActive,2);assert.equal(providerMax,2);assert.equal(providerCalls,8);assert.equal(out.differential.scheduling.feedback.state.controllerWindow,2);assert.equal(out.differential.scheduling.feedback.state.successStreak,1);assert.equal(out.result.payload.differential.adaptiveRevision,'R197');assert.equal(out.differential.publication.published,8);
providerMax=0;providerCalls=0;run=await authorized(integratedRuntime,'R197 integrated recovery sample two');out=await dispatchRunR147(integratedRuntime,run.id,{...baseInput,inputFingerprint:'3'.repeat(64),partitions:parts});
assert.equal(out.ok,true);assert.equal(out.differential.scheduling.adaptivePlan.effectiveConcurrency,2);assert.equal(out.differential.scheduling.feedback.state.controllerWindow,3);assert.equal(out.differential.scheduling.feedback.state.lastAdjustment,'UP');assert.equal(providerMax,2);
providerMax=0;providerCalls=0;run=await authorized(integratedRuntime,'R197 integrated recovered window');out=await dispatchRunR147(integratedRuntime,run.id,{...baseInput,inputFingerprint:'4'.repeat(64),partitions:parts});
assert.equal(out.ok,true);assert.equal(out.differential.scheduling.adaptivePlan.effectiveConcurrency,3);assert.equal(out.differential.scheduling.plan.concurrency,3);assert.equal(providerMax,3);

for(const law of ['R196_REMAINS_THE_HARD_BOUNDED_SCHEDULER_AND_R193_DERIVED_CEILING_AUTHORITY','R197_MAY_ONLY_REDUCE_OR_RECOVER_WITHIN_THE_CURRENT_R196_CEILING','FAILURE_CAUSES_MULTIPLICATIVE_DECREASE','FAILURE_DECREASE_IS_BOUNDED_BY_OBSERVED_ACTIVE_WORK_NOT_UNEXECUTED_CAPACITY','TWO_CONSECUTIVE_HEALTHY_UNCAPPED_BATCHES_ALLOW_ONE_ADDITIVE_RECOVERY_STEP','RECOVERY_CREDIT_REQUIRES_CONSECUTIVE_UNCAPPED_BATCHES_AND_RESETS_AT_CEILING_OR_OPERATOR_CAP','R196_STAY_WITH_ZERO_DIRTY_WORK_DOES_NOT_MATURE_PROVIDER_SUCCESS_HISTORY','FEEDBACK_SCOPE_IS_ROUTE_DOMAIN_EXECUTOR_MODEL_LOCAL_NOT_GLOBAL','BACKPRESSURE_NEVER_AUTHORIZES_EXECUTION_OR_ESCALATES_EXECUTOR_AUTHORITY','R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R197_LAWS.includes(law),`missing R197 law ${law}`);
const manifest=manifestR197();assert.equal(manifest.revision,'R197');assert.equal(manifest.controller.type,'BOUNDED_AIMD');assert.deepEqual(manifest.dynamicTurn.states,['STAY','TURN']);assert.deepEqual(manifest.dynamicTurn.directions,['NONE','DOWN','UP','CLAMP']);assert.equal(manifest.dynamicTurn.selfEscalation,false);assert.equal(manifest.boundedScheduler.revision,'R196');assert.equal(manifest.authority.multiAxis,'R193');assert.equal(manifest.authority.differentialCarry,'R195');assert.equal(manifest.authority.boundedScheduler,'R196');assert.equal(manifest.authority.feedbackPolicy,'R197');assert.equal(manifest.authority.dispatch,'R147');assert.equal(manifest.authority.history,'R146');assert.equal(manifest.authority.verifiedReturnReconciliation,'R182');assert.equal(manifest.authority.convergence,'R159');assert.equal(manifest.authority.admission,'R125');assert.equal(manifest.canonicalMutation,false);
const r147=manifestR147();assert.equal(r147.adaptivePartitionBackpressure.revision,'R197');assert.equal(r147.upstream.adaptivePartitionBackpressure,'R197');assert.equal(r147.boundedPartitionParallelism.revision,'R196');
const source=fs.readFileSync('src/execution/unifiedExecutorFabricR147.js','utf8'),r197=fs.readFileSync('src/execution/adaptivePartitionBackpressureR197.js','utf8');
for(const token of ['executeAdaptivePartitionsR197','adaptivePartitionBackpressure:manifestR197()','R197_SCOPE_LOCAL_AIMD_WITHIN_R196_CEILING','R195_R196_R197_DIFFERENTIAL_EXECUTION_RETURN_INTEGRITY_NOT_FACTUAL_TRUTH','R197_FEEDBACK_MAY_ONLY_REDUCE_OR_RECOVER_WITHIN_THE_CURRENT_R196_CEILING'])assert.ok(source.includes(token),`R147 missing R197 runtime integration ${token}`);
for(const token of ['executeBoundedPartitionsR196','MULTIPLICATIVE_DECREASE_FROM_OBSERVED_BOUNDED_WINDOW_FLOOR_HALF_MIN_ONE','TWO_CONSECUTIVE_HEALTHY_UNCAPPED_PROVIDER_BATCHES_THEN_ADDITIVE_PLUS_ONE','RESETS_AT_CURRENT_CEILING_AND_OPERATOR_LIMITED_BATCHES','selfEscalation:false','canonicalAdmissionAuthority:\'R125\''])assert.ok(r197.includes(token),`R197 feedback policy missing ${token}`);assert.ok(!r197.includes('canonicalMutation:true'),'R197 must never mutate CanonState');
console.log('R197 ADAPTIVE PARTITION BACKPRESSURE PASS · failed bounded provider waves reduce only their route/domain/executor/model-local future window, two consecutive healthy uncapped batches recover one step, current R193/R196 ceilings and operator caps always dominate, STAY creates no false learning, integrated R147 uses the reduced window, and R147/R146/R182/R159/R125 authority remains distinct');

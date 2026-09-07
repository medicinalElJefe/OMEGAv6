import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRunR146,transitionRunR146} from '../src/execution/durableOperationExecutionR146.js';
import {dispatchRunR147,manifestR147} from '../src/execution/unifiedExecutorFabricR147.js';
import {planDifferentialPartitionsR195} from '../src/execution/differentialPartitionExecutionR195.js';
import {executeBoundedPartitionsR196,manifestR196,planPartitionConcurrencyR196,R196_HARD_CONCURRENCY_MAX,R196_LAWS} from '../src/execution/boundedPartitionSchedulerR196.js';

class Storage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
class Runtime{constructor(env={}){this.state={storage:new Storage()};this.env=env}async devices(){return[]}}
const contract=()=>({schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:'route:r196-parallel-lab',route:'R196 Parallel Lab',workspaceId:'ws',capabilityId:'capability:r196-parallel-lab',executionDomain:'AI',state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'});
const stableR154={relativePriority:.10,capacity:{viewResolution:12,temporalHz:1,logicalLanes:144,solverFidelity:'NONE'},pressures:{motion:.01,residual:.01,truthGap:.01,coherenceGap:.01,temporalError:.01,observer:.05,combined:.01},relativity:{observer:'FRAME_STABLE'},lineage:{routeContract:'route:r196-parallel-lab|capability:r196-parallel-lab|AI|AVAILABLE'}};
async function authorized(runtime,label='R196 test authorization'){const made=await createRunR146(runtime,{intent:'bounded partition synthesis',contract:contract(),metadata:{relativeCapacityR154:stableR154}});assert.equal(made.ok,true);const moved=await transitionRunR146(runtime,made.run.id,{state:'AUTHORIZED',reason:label});assert.equal(moved.ok,true);return moved.run}
const baseInput={operatorFingerprint:'d'.repeat(64),frameFingerprint:'e'.repeat(64),temperature:.2,maxTokens:256};
const eight=(changes={})=>Array.from({length:8},(_,i)=>{const id=String.fromCharCode(65+i);return{id,prompt:changes[id]??`part-${id}`}});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

// Direct dynamic planning: STAY for no dirty work, TURN for dirty work, and R193 remains the ceiling.
let p=planPartitionConcurrencyR196({multiAxis:{axes:{compute:{logicalLanes:144}}},dirtyCount:0});
assert.equal(p.turn,'STAY');assert.equal(p.concurrency,0);assert.equal(p.derivedMax,4);assert.equal(p.replanOnEveryRun,true);
p=planPartitionConcurrencyR196({multiAxis:{axes:{compute:{logicalLanes:144}}},dirtyCount:8});
assert.equal(p.turn,'TURN');assert.equal(p.concurrency,4);assert.equal(p.derivedMax,4);
const lowered=planPartitionConcurrencyR196({multiAxis:{axes:{compute:{logicalLanes:144}}},input:{partitionConcurrency:2},dirtyCount:8});
assert.equal(lowered.concurrency,2);assert.equal(lowered.requestedRaisedAboveDerived,false);
const over=planPartitionConcurrencyR196({multiAxis:{axes:{compute:{logicalLanes:144}}},input:{partitionConcurrency:99},dirtyCount:64});
assert.equal(over.concurrency,4);assert.equal(over.requestedRaisedAboveDerived,true);
const hard=planPartitionConcurrencyR196({multiAxis:{axes:{compute:{logicalLanes:20736}}},input:{partitionConcurrency:999},dirtyCount:64});
assert.equal(hard.concurrency,R196_HARD_CONCURRENCY_MAX);assert.equal(hard.hardMax,12);

// Direct bounded worker-pool proof: reach four active calls, retain declared result order, and never unbounded-fanout.
let active=0,maxActive=0;
const directItems=Array.from({length:8},(_,i)=>i);
const direct=await executeBoundedPartitionsR196(directItems,async item=>{active++;maxActive=Math.max(maxActive,active);await sleep((8-item)*2);active--;return`v${item}`},{multiAxis:{axes:{compute:{logicalLanes:144}}}});
assert.equal(direct.ok,true);assert.equal(direct.plan.concurrency,4);assert.equal(direct.metrics.observedMaxActive,4);assert.equal(maxActive,4);assert.deepEqual(direct.results,directItems.map(i=>`v${i}`));assert.equal(direct.metrics.started,8);assert.equal(direct.metrics.completed,8);assert.equal(direct.metrics.unscheduled,0);

// Fail-closed worker-pool proof: first failure stops new assignments while only already-running bounded work settles.
const failedDirect=await executeBoundedPartitionsR196(Array.from({length:12},(_,i)=>i),async item=>{if(item===0){await sleep(1);throw new Error('intentional-r196-failure')}await sleep(15);return item},{multiAxis:{axes:{compute:{logicalLanes:144}}}});
assert.equal(failedDirect.ok,false);assert.equal(failedDirect.code,'R196_PARTITION_EXECUTION_FAILED');assert.equal(failedDirect.plan.concurrency,4);assert.equal(failedDirect.metrics.started,4);assert.equal(failedDirect.metrics.unscheduled,8);assert.ok(failedDirect.metrics.observedMaxActive<=4);

// Integrated R147/R195/R196 dynamic process.
let modelCalls=0,providerActive=0,providerMax=0;
const runtime=new Runtime({AI:{run:async(_model,body)=>{modelCalls++;providerActive++;providerMax=Math.max(providerMax,providerActive);const prompt=body?.messages?.find(x=>x.role==='user')?.content||'';await sleep(prompt.endsWith('A')?16:6);providerActive--;return{response:`return:${prompt}`}}}});

const first=await authorized(runtime);let out=await dispatchRunR147(runtime,first.id,{...baseInput,inputFingerprint:'a'.repeat(64),partitions:eight()});
assert.equal(out.ok,true);assert.equal(out.run.state,'VERIFIED');assert.equal(out.differential.plan.carried,0);assert.equal(out.differential.plan.recompute,8);assert.equal(out.differential.scheduling.plan.turn,'TURN');assert.equal(out.differential.scheduling.plan.logicalLanes,144);assert.equal(out.differential.scheduling.plan.concurrency,4);assert.equal(out.differential.scheduling.metrics.observedMaxActive,4);assert.equal(out.result.payload.differential.schedulerRevision,'R196');assert.equal(out.result.payload.differential.freshProviderCalls,8);assert.equal(modelCalls,8);assert.equal(providerMax,4);assert.equal(out.differential.publication.published,8);

// Change two of eight partitions. Six carry; only the two dirty partitions TURN into a two-wide window.
providerMax=0;const second=await authorized(runtime);out=await dispatchRunR147(runtime,second.id,{...baseInput,inputFingerprint:'b'.repeat(64),partitions:eight({C:'part-C changed',F:'part-F changed'})});
assert.equal(out.ok,true);assert.equal(out.run.state,'VERIFIED');assert.equal(out.contentReuse.lookup.hit,false);assert.equal(out.differential.plan.carried,6);assert.equal(out.differential.plan.recompute,2);assert.equal(out.differential.scheduling.plan.turn,'TURN');assert.equal(out.differential.scheduling.plan.concurrency,2);assert.equal(out.result.payload.differential.freshProviderCalls,2);assert.equal(modelCalls,10);assert.equal(providerMax,2);assert.equal(out.differential.publication.published,2);assert.equal(out.result.payload.text,eight({C:'part-C changed',F:'part-F changed'}).map(x=>`return:${x.prompt}`).join('\n\n'));

// Change only top-level request identity. Whole-result reuse misses, R195 carries all partitions, and R196 dynamically STAYs with zero provider calls.
providerMax=0;const third=await authorized(runtime);out=await dispatchRunR147(runtime,third.id,{...baseInput,inputFingerprint:'c'.repeat(64),partitions:eight({C:'part-C changed',F:'part-F changed'})});
assert.equal(out.ok,true);assert.equal(out.contentReuse.lookup.hit,false);assert.equal(out.differential.plan.carried,8);assert.equal(out.differential.plan.recompute,0);assert.equal(out.differential.scheduling.plan.turn,'STAY');assert.equal(out.differential.scheduling.plan.concurrency,0);assert.equal(out.differential.scheduling.metrics.started,0);assert.equal(out.result.payload.differential.freshProviderCalls,0);assert.equal(modelCalls,10);assert.equal(providerMax,0);

// Operator may lower concurrency but cannot raise the current R193-derived ceiling.
providerMax=0;const capped=await authorized(runtime);out=await dispatchRunR147(runtime,capped.id,{...baseInput,inputFingerprint:'f'.repeat(64),partitions:eight(),requireFreshPartitions:true,partitionConcurrency:2});
assert.equal(out.ok,true);assert.equal(out.differential.plan.recompute,8);assert.equal(out.differential.scheduling.plan.concurrency,2);assert.equal(out.differential.scheduling.metrics.observedMaxActive,2);assert.equal(providerMax,2);

// Integrated failure: R146 must terminate FAILED and no fresh partition bytes from the failed batch may become carryable.
let failCalls=0;const failingRuntime=new Runtime({AI:{run:async(_model,body)=>{failCalls++;const prompt=body?.messages?.find(x=>x.role==='user')?.content||'';if(prompt==='fail-fast'){await sleep(1);throw new Error('provider-fail-fast')}await sleep(12);return{response:`return:${prompt}`}}}});
const failRun=await authorized(failingRuntime);const failParts=[{id:'A',prompt:'fail-fast'},...Array.from({length:7},(_,i)=>({id:String.fromCharCode(66+i),prompt:`failure-part-${i}`}))];
out=await dispatchRunR147(failingRuntime,failRun.id,{...baseInput,inputFingerprint:'9'.repeat(64),partitions:failParts,requireFreshPartitions:true});
assert.equal(out.ok,false);assert.equal(out.code,'R196_PARTITION_EXECUTION_FAILED');assert.equal(out.run.state,'FAILED');assert.equal(out.differential.scheduling.plan.concurrency,4);assert.equal(out.differential.scheduling.metrics.started,4);assert.equal(out.differential.scheduling.metrics.unscheduled,4);assert.equal(out.differential.publication,undefined);assert.ok(failCalls<=4);
const afterFailure=await authorized(failingRuntime);const failurePlan=await planDifferentialPartitionsR195(failingRuntime,{run:afterFailure,input:{...baseInput,partitions:failParts},multiAxis:{axes:{compute:{logicalLanes:144},proof:{required:'RETURN_RECEIPT_REQUIRED'}}},model:'@cf/google/gemma-4-26b-a4b-it'});
assert.equal(failurePlan.carried,0);assert.equal(failurePlan.recompute,8,'failed R196 batch must publish no new R195 carry entries');

for(const law of ['ONLY_R195_DIRTY_PARTITIONS_ENTER_THE_PARALLEL_SCHEDULER','EACH_RUN_REPLANS_FROM_CURRENT_R193_COMPUTE_AXIS_AND_CURRENT_R195_DIRTY_SET','R195_CARRY_TO_DIRTY_TRANSITION_IS_A_SCHEDULING_TURN_NOT_A_TRUTH_PROMOTION','NO_UNBOUNDED_PROMISE_FANOUT_IS_PERMITTED','FAILED_BATCHES_PUBLISH_NO_NEW_R195_PARTITION_CACHE_ENTRIES','R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R196_LAWS.includes(law),`missing R196 law ${law}`);
const manifest=manifestR196();assert.equal(manifest.revision,'R196');assert.equal(manifest.hardConcurrencyMax,12);assert.deepEqual(manifest.dynamicTurn.states,['STAY','TURN']);assert.equal(manifest.dynamicTurn.selfEscalation,false);assert.equal(manifest.authority.multiAxis,'R193');assert.equal(manifest.authority.differentialCarry,'R195');assert.equal(manifest.authority.dispatch,'R147');assert.equal(manifest.authority.history,'R146');assert.equal(manifest.authority.verifiedReturnReconciliation,'R182');assert.equal(manifest.authority.convergence,'R159');assert.equal(manifest.authority.admission,'R125');for(const phase of ['R193_AXIS_PLAN','R194_WHOLE_REUSE_CHECK','R195_PARTITION_DIFF','R196_DIRTY_SET','R196_BOUNDED_PARALLEL_EXECUTE','R195_ORDERED_REASSEMBLY','R146_VERIFIED','R182_VERIFIED_RETURN_RECONCILIATION','R159_CONVERGENCE_CANDIDATE','R125_SEPARATE_ADMISSION_AUTHORITY'])assert.ok(manifest.process.includes(phase),`R196 full process missing ${phase}`);
const r147=manifestR147();assert.equal(r147.boundedPartitionParallelism.revision,'R196');assert.equal(r147.upstream.boundedPartitionParallelism,'R196');

const source=fs.readFileSync('src/execution/unifiedExecutorFabricR147.js','utf8'),r196=fs.readFileSync('src/execution/boundedPartitionSchedulerR196.js','utf8');for(const token of ['executeBoundedPartitionsR196','R196_BOUNDED_PARTITION_BATCH_FAILURE','schedulerRevision:\'R196\'','boundedPartitionParallelism:manifestR196()','R196_STAY_TURN_IS_SCHEDULING_BEHAVIOR_NOT_TRUTH_PROMOTION'])assert.ok(source.includes(token),`R147 missing R196 runtime integration ${token}`);for(const token of ['R196_HARD_CONCURRENCY_MAX=12','replanOnEveryRun:true','turn=dirty===0?\'STAY\':\'TURN\'','FIRST_FAILURE_STOPS_NEW_ASSIGNMENTS_ALREADY_RUNNING_BOUNDED_CALLS_SETTLE_NO_R195_PUBLICATION','selfEscalation:false'])assert.ok(r196.includes(token),`R196 scheduler invariant missing ${token}`);assert.ok(!r196.includes('canonicalMutation:true'),'R196 must never mutate CanonState');
console.log('R196 BOUNDED PARTITION PARALLELISM PASS · R193 compute-axis ceilings dynamically replan each R195 dirty set; STAY carries without provider work, TURN executes only dirty partitions through a capped worker pool, ordered reassembly is preserved, failure stops new scheduling and publishes no partial carry, and R147/R146/R182/R159/R125 authority remains distinct');

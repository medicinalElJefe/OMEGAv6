import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRunR146,transitionRunR146} from '../src/execution/durableOperationExecutionR146.js';
import {dispatchRunR147,readResultR147,syncHybridClaimR147,syncHybridReturnR147} from '../src/execution/unifiedExecutorFabricR147.js';
import {manifestR185,planTemporalPerformanceR185,readTemporalPerformanceR185,recordTemporalPerformanceR185,R185_LAWS} from '../src/execution/temporalRelativityPerformanceR185.js';

class MemoryStorage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
const runtime={state:{storage:new MemoryStorage()}};
const directory={executors:{WORKERS_AI:{state:'AVAILABLE'},FEDERATION_CHAIN:{state:'AVAILABLE'},AUTONOMIC_SWARM:{state:'AVAILABLE'},LOCAL_PROOF:{state:'AVAILABLE'},LOCAL_RUNTIME:{state:'AVAILABLE'}}};
const makeRun=(id,pressures)=>({id,contract:{routeId:'route:ai-lab',capabilityId:'capability:ai-lab',route:'AI Lab',executionDomain:'AI'},metadata:{relativeCapacityR154:{relativePriority:.72,pressures}}});
const stable=makeRun('run_stable',{motion:.02,residual:.03,truthGap:.04,coherenceGap:.03,temporalError:.02,combined:.04});
const volatile=makeRun('run_volatile',{motion:.95,residual:.92,truthGap:.70,coherenceGap:.74,temporalError:.82,combined:.91});

const stablePlan=await planTemporalPerformanceR185(runtime,{run:stable,directory,eligible:['WORKERS_AI','FEDERATION_CHAIN','AUTONOMIC_SWARM'],defaultExecutorId:'WORKERS_AI'});
assert.equal(stablePlan.selection.recommendedExecutorId,'WORKERS_AI');
assert.equal(stablePlan.selection.adaptiveApplied,false);
assert.ok(stablePlan.work.carryFraction>stablePlan.work.recomputeFraction,'stable state should favor invariant carry');
assert.ok(stablePlan.work.workingSetResolution<=144,'stable state should keep a bounded working set');
assert.equal(stablePlan.canonicalMutation,false);assert.equal(stablePlan.canonicalAdmissionAuthority,'R125');

const volatileRuntime={state:{storage:new MemoryStorage()}};
const volatilePlan=await planTemporalPerformanceR185(volatileRuntime,{run:volatile,directory,eligible:['WORKERS_AI','FEDERATION_CHAIN','AUTONOMIC_SWARM'],defaultExecutorId:'WORKERS_AI'});
assert.ok(volatilePlan.work.recomputeFraction>stablePlan.work.recomputeFraction,'high motion/residual must increase recomputation');
assert.ok(volatilePlan.temporal.targetTemporalHz>=stablePlan.temporal.targetTemporalHz,'high motion/residual must not lower sampling cadence');
assert.ok(volatilePlan.work.workingSetResolution>=stablePlan.work.workingSetResolution,'high motion/residual must not reduce working-set resolution');

const nestedRun={...stable,id:'run_nested',metadata:{adaptiveContext:{relativeCapacityR154:{relativePriority:.88,pressures:{motion:.8,residual:.7,truthGap:.5,coherenceGap:.4,temporalError:.6,combined:.72}}}}};
const nestedPlan=await planTemporalPerformanceR185({ctx:{storage:new MemoryStorage()}},{run:nestedRun,directory,eligible:['WORKERS_AI'],defaultExecutorId:'WORKERS_AI'});
assert.equal(nestedPlan.hint.source,'R154_ADAPTIVE_CONTEXT_PLUS_OPTIONAL_EXECUTION_HINT');
assert.ok(nestedPlan.temporal.currentPressure>.5,'living-world adaptive R154 context must feed temporal pressure');

const dispatchOnlyRuntime={ctx:{storage:new MemoryStorage()}};
await recordTemporalPerformanceR185(dispatchOnlyRuntime,{run:stable,executorId:'WORKERS_AI',ok:true,status:202,latencyMs:8,phase:'DISPATCH_ACCEPTED',verified:false,terminal:false});
let dispatchOnly=await readTemporalPerformanceR185(dispatchOnlyRuntime,stable);
assert.equal(dispatchOnly.executors.WORKERS_AI.dispatchCount,1,'dispatch acceptance should be tracked');
assert.equal(dispatchOnly.executors.WORKERS_AI.count,0,'dispatch acceptance must not mature terminal reliability history');
assert.equal(dispatchOnly.executors.WORKERS_AI.lastOutcome,'DISPATCH_ACCEPTED_NOT_TERMINAL');

for(let i=0;i<6;i++)await recordTemporalPerformanceR185(runtime,{run:stable,executorId:'WORKERS_AI',ok:false,status:502,latencyMs:4000,phase:'RETURN_OR_TERMINAL',verified:false,terminal:true});
for(let i=0;i<6;i++)await recordTemporalPerformanceR185(runtime,{run:stable,executorId:'FEDERATION_CHAIN',ok:true,status:200,latencyMs:200,phase:'RETURN_OR_TERMINAL',verified:true,terminal:true});
const mature=await planTemporalPerformanceR185(runtime,{run:stable,directory,eligible:['WORKERS_AI','FEDERATION_CHAIN','AUTONOMIC_SWARM'],defaultExecutorId:'WORKERS_AI'});
assert.equal(mature.selection.recommendedExecutorId,'FEDERATION_CHAIN','measured mature terminal performance should be able to outrank the default executor');
assert.equal(mature.selection.adaptiveApplied,true);
assert.ok(mature.selection.candidates.find(x=>x.id==='FEDERATION_CHAIN').score>mature.selection.candidates.find(x=>x.id==='WORKERS_AI').score);
assert.equal(mature.history.terminalSamples,12);
const explicit=await planTemporalPerformanceR185(runtime,{run:stable,directory,eligible:['WORKERS_AI','FEDERATION_CHAIN','AUTONOMIC_SWARM'],defaultExecutorId:'WORKERS_AI',input:{executorId:'WORKERS_AI'}});
assert.equal(explicit.selection.recommendedExecutorId,'WORKERS_AI','explicit executor authority must override adaptation');
assert.equal(explicit.selection.adaptiveApplied,false);

const contract=(domain,route)=>({schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:`route:${route.toLowerCase().replaceAll(' ','-')}`,route,workspaceId:'ws-r186',capabilityId:`capability:${route.toLowerCase().replaceAll(' ','-')}`,executionDomain:domain,state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'});
class CtxOnlyRuntime{constructor(devices=[]){this.ctx={storage:new MemoryStorage()};this.env={};this.deviceRows=devices}async devices(){return this.deviceRows}}
const host={id:'device-r186',name:'OMEGA PC',online:true,revoked:false,lastSeen:Date.now(),capabilityRevision:'R132',capabilities:['INDEX','HASH_TREE','BUILD','TEST']};
const liveShape=new CtxOnlyRuntime([host]);
let created=await createRunR146(liveShape,{intent:'ctx-only hybrid proof',contract:contract('HYBRID','Hybrid Link'),metadata:{relativeCapacityR154:{relativePriority:.7,pressures:{motion:.2,residual:.2,truthGap:.1,coherenceGap:.1,temporalError:.2,combined:.2}}}});assert.equal(created.ok,true);
let moved=await transitionRunR146(liveShape,created.run.id,{state:'AUTHORIZED',reason:'R186 ctx-only runtime proof'});assert.equal(moved.ok,true);
let out=await dispatchRunR147(liveShape,created.run.id,{confirmed:true,targetDeviceId:host.id,steps:[{id:'S01',op:'INDEX',label:'index',path:'.'}]},{queueHybrid:async()=>({ok:true,status:200,job:{id:'job-r186',status:'QUEUED',inputFingerprint:'a'.repeat(64)}})});
assert.equal(out.ok,true);assert.equal(out.status,202);assert.equal(out.run.state,'AVAILABLE');
let liveHistory=await readTemporalPerformanceR185(liveShape,out.run);assert.equal(liveHistory.executors.HYBRID_HOST.dispatchCount,1);assert.equal(liveHistory.executors.HYBRID_HOST.count,0);
let linked=await syncHybridClaimR147(liveShape,{id:'job-r186',inputFingerprint:'a'.repeat(64)});assert.equal(linked.state,'INVOKED');
linked=await syncHybridReturnR147(liveShape,{id:'job-r186',status:'FAILED',returnPacket:{resultFingerprint:'b'.repeat(64),stepProofs:[]}},{state:'VERIFIED_FAILED_EXECUTION_RETURN',fingerprint:{verified:true,digestMatch:true,semanticMatch:true},finalHeadSha256:'c'.repeat(64)});assert.equal(linked.state,'FAILED','failed host execution must terminate R146 as FAILED rather than a successful RETURNED state');
liveHistory=await readTemporalPerformanceR185(liveShape,linked);assert.equal(liveHistory.executors.HYBRID_HOST.count,1);assert.equal(liveHistory.executors.HYBRID_HOST.successEwma,0);assert.equal(liveHistory.executors.HYBRID_HOST.verifiedEwma,0);
const view=await readResultR147(liveShape,created.run.id);assert.equal(view.state,'FAILED');assert.equal(view.runtimeStorageCompatibility,'R168');assert.equal(view.temporalHistory.executors.HYBRID_HOST.lastOutcome,'TERMINAL_FAILURE');

for(const law of ['PREDICT_CARRY_CORRECT_REALLOCATE','DISPATCH_ACCEPTANCE_IS_NOT_EXECUTION_SUCCESS','ONLY_TERMINAL_OUTCOMES_MATURE_EXECUTOR_RELIABILITY_HISTORY','IMMATURE_HISTORY_PRESERVES_EXISTING_R147_DEFAULT_SELECTION','R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY','R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R185_LAWS.includes(law),`missing R185 law ${law}`);
const manifest=manifestR185();assert.equal(manifest.revision,'R185');assert.deepEqual(manifest.loop,['PREDICT','CARRY','CORRECT','REALLOCATE']);assert.equal(manifest.historyPolicy.dispatchAcceptance,'TRACKED_SEPARATELY_NOT_SUCCESS');assert.equal(manifest.authority.executorDispatch,'R147');assert.equal(manifest.authority.canonicalAdmission,'R125');assert.equal(manifest.canonicalMutation,false);

const r147=fs.readFileSync('src/execution/unifiedExecutorFabricR147.js','utf8');
for(const token of ['runtimeStorageR168','planTemporalPerformanceR185','readTemporalPerformanceR185','recordTemporalPerformanceR185','DISPATCH_ACCEPTED_NOT_TERMINAL','R147_HYBRID_FAILED_RETURN','runtimeStorageCompatibility'])assert.ok(r147.includes(token),`R147 missing R186 integration token ${token}`);
assert.ok(!r147.includes('runtime.state.storage'),'R147 must use R168 rather than the legacy-only state.storage shape');
assert.ok(r147.includes("canonicalAdmissionAuthority:'R125'"),'R147 must preserve R125 admission authority');
console.log('R186 RUNTIME PERFORMANCE CLOSURE PASS · real ctx.storage + terminal-only learning + failed Hybrid truth + R154 adaptive carry preserve R147/R146/R141/R125 authority');

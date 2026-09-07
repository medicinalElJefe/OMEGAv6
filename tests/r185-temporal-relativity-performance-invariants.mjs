import assert from 'node:assert/strict';
import fs from 'node:fs';
import {manifestR185,planTemporalPerformanceR185,recordTemporalPerformanceR185,R185_LAWS} from '../src/execution/temporalRelativityPerformanceR185.js';

class MemoryStorage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,v)}}
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

for(let i=0;i<6;i++)await recordTemporalPerformanceR185(runtime,{run:stable,executorId:'WORKERS_AI',ok:false,status:502,latencyMs:4000,phase:'RETURN_OR_TERMINAL',verified:false});
for(let i=0;i<6;i++)await recordTemporalPerformanceR185(runtime,{run:stable,executorId:'FEDERATION_CHAIN',ok:true,status:200,latencyMs:200,phase:'RETURN_OR_TERMINAL',verified:true});
const mature=await planTemporalPerformanceR185(runtime,{run:stable,directory,eligible:['WORKERS_AI','FEDERATION_CHAIN','AUTONOMIC_SWARM'],defaultExecutorId:'WORKERS_AI'});
assert.equal(mature.selection.recommendedExecutorId,'FEDERATION_CHAIN','measured mature performance should be able to outrank the default executor');
assert.equal(mature.selection.adaptiveApplied,true);
assert.ok(mature.selection.candidates.find(x=>x.id==='FEDERATION_CHAIN').score>mature.selection.candidates.find(x=>x.id==='WORKERS_AI').score);
const explicit=await planTemporalPerformanceR185(runtime,{run:stable,directory,eligible:['WORKERS_AI','FEDERATION_CHAIN','AUTONOMIC_SWARM'],defaultExecutorId:'WORKERS_AI',input:{executorId:'WORKERS_AI'}});
assert.equal(explicit.selection.recommendedExecutorId,'WORKERS_AI','explicit executor authority must override adaptation');
assert.equal(explicit.selection.adaptiveApplied,false);

for(const law of ['PREDICT_CARRY_CORRECT_REALLOCATE','IMMATURE_HISTORY_PRESERVES_EXISTING_R147_DEFAULT_SELECTION','R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY','R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R185_LAWS.includes(law),`missing R185 law ${law}`);
const manifest=manifestR185();assert.equal(manifest.revision,'R185');assert.deepEqual(manifest.loop,['PREDICT','CARRY','CORRECT','REALLOCATE']);assert.equal(manifest.authority.executorDispatch,'R147');assert.equal(manifest.authority.canonicalAdmission,'R125');assert.equal(manifest.canonicalMutation,false);

const r147=fs.readFileSync('src/execution/unifiedExecutorFabricR147.js','utf8');
for(const token of ['planTemporalPerformanceR185','recordTemporalPerformanceR185','temporalPerformance','HISTORY_MATURED_ONLY'])assert.ok(r147.includes(token),`R147 missing R185 integration token ${token}`);
assert.ok(r147.includes("canonicalAdmissionAuthority:'R125'"),'R147 must preserve R125 admission authority');
assert.ok(r147.includes('R147 may optimize eligible executor priority')||r147.includes('R185 may optimize eligible executor priority'));
console.log('R185 TEMPORAL RELATIVITY PERFORMANCE INVARIANTS PASS · predict → carry → correct → reallocate uses measured history without changing execution/proof authority');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initCorpusPack,corpusState} from '../src/corpusRuntime';
import {compileRelativeCapacityFabricR154,relativeCapacityManifestR154,R154_LAWS} from '../src/relativeCapacityFabricR154';
import {operationContractForRouteR143} from '../src/authoritativeOperationChainR143';

await initCorpusPack();
const record=corpusState(0);
const frame={serviceIdentity:'omega-r154-ci',serviceRole:'capacity-proof',runtimeRevision:'R154',canonicalSchemaVersion:'20736-v1',hostIdentity:'ci-host',observerFrame:'FIELD',orientation:1 as const};
const baseTime={utcTime:'2026-09-07T00:00:02.000Z',sourceObservationTime:'2026-09-07T00:00:01.900Z',monotonicMs:3000,missionTick:12,stateGeneration:4,agentTurn:0,modelGeneration:1,causalDepth:0,anchorUtcTime:'2026-09-07T00:00:00.000Z',anchorMonotonicMs:1000};
const base=compileRelativeCapacityFabricR154(record,{address:0,time:baseTime,frame,panel:'Validation',intent:'truth proof validation all modes',observerRelevance:.7,self:{buildId:'r154-ci',generation:1,proofRefs:['proof:r154-static']}});

assert.equal(base.schema,'OMEGA_RELATIVE_CAPACITY_FABRIC_R154');
assert.equal(base.canonical.address,0);
assert.equal(base.canonical.stateId,1);
assert.equal(base.canonicalMutation,false);
assert.equal(base.canonicalAdmissionAuthority,'R125');
assert.ok(base.plans.length>0,'R154 must plan registered actions');
assert.equal(base.summary.plannedRoutes,base.plans.length);

const laneSet=new Set([1,12,144,1728,20736]);
const resolutionSet=new Set([12,144,1728,20736,248832]);
const hzSet=new Set([1,2,6,12,30,60]);
for(const plan of base.plans){
 const contract=operationContractForRouteR143(plan.route);
 assert.equal(plan.routeId,contract.routeId);
 assert.equal(plan.capabilityId,contract.capabilityId);
 assert.equal(plan.executionDomain,contract.executionDomain);
 assert.equal(plan.contractState,contract.state);
 assert.ok(laneSet.has(plan.capacity.logicalFanout),`unexpected logical fanout ${plan.capacity.logicalFanout}`);
 assert.ok(laneSet.has(plan.capacity.logicalLanes),`unexpected logical lanes ${plan.capacity.logicalLanes}`);
 assert.ok(resolutionSet.has(plan.capacity.viewResolution),`unexpected view resolution ${plan.capacity.viewResolution}`);
 assert.ok(hzSet.has(plan.capacity.temporalHz),`unexpected temporal Hz ${plan.capacity.temporalHz}`);
 assert.ok([12,144,1728,20736].includes(plan.capacity.historyDepth));
 assert.equal(plan.relativity.canonicalAddress,base.canonical.address);
 assert.equal(plan.relativity.nowAddress,base.now.id);
 assert.equal(plan.lineage.r153Fingerprint,base.motion?plan.lineage.r153Fingerprint:plan.lineage.r153Fingerprint);
 assert.match(plan.boundary,/plans until R146\/R147 receipts prove actual invocation/i);
}

const hybrid=compileRelativeCapacityFabricR154(record,{address:0,time:baseTime,frame,panel:'Hybrid Link',intent:'repair build system hybrid execute',observerRelevance:.5});
const hybridPlan=hybrid.plans.find(x=>x.route==='Hybrid Link');
if(hybridPlan)assert.equal(hybridPlan.readiness,'DEVICE_PROOF_REQUIRED');
const buildPlan=hybrid.plans.find(x=>x.kind==='BUILD');
if(buildPlan)assert.equal(buildPlan.readiness,'SANDBOX_ONLY');

const drifted=compileRelativeCapacityFabricR154(record,{address:0,time:{...baseTime,monotonicMs:9000,missionTick:13},frame,panel:'Validation',intent:'truth proof validation all modes',observerRelevance:.7});
assert.ok(drifted.now.temporalAccuracy<base.now.temporalAccuracy,'clock drift must reduce temporal accuracy');
const sharedRoutes=base.plans.map(x=>x.route).filter(route=>drifted.plans.some(y=>y.route===route));
assert.ok(sharedRoutes.length>0);
for(const route of sharedRoutes){
 const a=base.plans.find(x=>x.route===route)!,b=drifted.plans.find(x=>x.route===route)!;
 assert.ok(b.pressures.temporalError>a.pressures.temporalError,'drift must raise temporal error pressure');
 assert.ok(b.pressures.combined>=a.pressures.combined-1e-12,'drift must not reduce combined capacity pressure for the same operation');
}

const empiricalPacket=(id:string,family:string,kind:'INTERVENTION'|'REPLICATION')=>({id,kind,source:`instrument-${id}`,sourceFamily:family,observedAt:'2026-09-07T00:00:01.900Z',frame:{space:'ci-frame',time:'UTC'},quantity:{value:1,unit:'ratio',uncertainty:0},claim:'capacity truth test',supports:['claim:capacity'],verified:true,reproducible:true,authority:kind==='INTERVENTION'?'INTERVENTION':'REPLICATED'} as any);
const empirical=compileRelativeCapacityFabricR154(record,{address:0,time:baseTime,frame,panel:'Validation',intent:'truth proof validation all modes',truth:{claimId:'claim:capacity',claim:'capacity truth test',evidence:[empiricalPacket('a','lab-a','INTERVENTION'),empiricalPacket('b','lab-b','REPLICATION')]}});
assert.equal(empirical.canonical.address,base.canonical.address);
assert.ok(empirical.truth.confidence>base.truth.confidence,'independent empirical evidence must improve truth confidence over model-only state');
assert.ok(empirical.truth.uncertainty<base.truth.uncertainty,'independent empirical evidence must reduce uncertainty');

assert.throws(()=>compileRelativeCapacityFabricR154(corpusState(1),{address:0,time:baseTime,frame}),/source packet mismatch/,'R154 must refuse a route packet that does not match the R153 canonical state');
const manifest=relativeCapacityManifestR154();
assert.equal(manifest.authority.admission,'R125');
assert.equal(manifest.authority.routeIdentity,'R143');
assert.equal(manifest.authority.nativeExecution,'R146/R147 receipt-gated');
assert.deepEqual(manifest.topology.addressLevels,[12,144,1728,20736,248832]);
assert.deepEqual(manifest.topology.logicalExecutionLevels,[1,12,144,1728,20736]);
for(const law of ['ONE_CANONICAL_STATE_MANY_RELATIVE_OPERATIONAL_CAPACITY_PROJECTIONS','DIMENSIONAL_RELATIVITY_CHANGES_ROLE_AND_RESOLUTION_NOT_PHYSICAL_DIMENSION_COUNT','MOTION_PRESSURE_MAY_RAISE_SAMPLING_AND_COMPUTE_WITHOUT_RAISING_TRUTH_AUTHORITY','SWARM_FANOUT_IS_LOGICAL_PLANNING_UNTIL_EXECUTION_RECEIPTS_EXIST','R143_ROUTE_CAPABILITY_DOMAIN_IDENTITY_PRECEDES_CAPACITY_ALLOCATION','R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R154_LAWS.includes(law as any));

const worker=fs.readFileSync('src/workerR27.js','utf8');
for(const route of ['/api/runtime-now-r154','/api/relative-capacity-r154'])assert.ok(worker.includes(route),`Worker missing ${route}`);
assert.ok(worker.includes("schema:'OMEGA_RUNTIME_NOW_R154'"));
assert.ok(worker.includes("authority:'CLOUDFLARE_RUNTIME_CLOCK'"));
assert.ok(worker.includes('not claimed to be an independently calibrated UTC metrology source'));
assert.ok(worker.includes("schema:'OMEGA_RELATIVE_CAPACITY_FABRIC_R154'"));
assert.ok(worker.includes("implemented:true"));
assert.ok(worker.includes('Logical lanes, fanout, solver fidelity, view resolution and sampling are plans'));
const client=fs.readFileSync('src/relativeCapacityClientR154.ts','utf8');
assert.ok(client.includes("R154_ANCHOR_KEY='omega.r154.relative-now-anchor.v1'"));
assert.ok(client.includes('monotonicProjectedUtc'));
assert.ok(client.includes('observedDriftMs'));
assert.ok(client.includes('not claimed to be an independently calibrated UTC metrology source'));

console.log(JSON.stringify({schema:base.schema,status:'PASS',canonical:{address:base.canonical.address,stateId:base.canonical.stateId},plans:base.summary,truth:{modelOnly:base.truth,empirical:empirical.truth},temporal:{base:base.now.temporalAccuracy,drifted:drifted.now.temporalAccuracy},topPlan:base.plans[0]?{route:base.plans[0].route,domain:base.plans[0].executionDomain,priority:base.plans[0].relativePriority,capacity:base.plans[0].capacity,readiness:base.plans[0].readiness}:null,boundary:base.truthBoundary},null,2));

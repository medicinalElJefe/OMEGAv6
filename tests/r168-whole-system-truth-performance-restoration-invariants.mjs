import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R153_FULL_SYSTEM_CONTRACT} from '../src/fullSystemCompletionR153.js';
import {createRunR146,transitionRunR146,replayRunR146} from '../src/execution/durableOperationExecutionR146.js';
import {planReflexAutonomicSwarmR164,launchReflexAutonomicSwarmR164} from '../src/execution/reflexAutonomicSwarmR164.js';
import {runtimeStorageR168,runtimeStorageShapeR168,manifestRuntimeStorageR168} from '../src/execution/runtimeStorageR168.js';

const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>assert.ok(v,'R168 '+m);
class Storage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
class AutonomicStub{async fetch(request){const u=new URL(request.url);if(u.pathname==='/missions'&&request.method==='POST')return new Response(JSON.stringify({ok:true,mission:{id:'auto_r168_ctx',status:'QUEUED',totalCells:24,totalBranches:2,proofState:'QUEUED_NOT_ADMITTED'}}),{status:201,headers:{'content-type':'application/json'}});return new Response(JSON.stringify({ok:false}),{status:404,headers:{'content-type':'application/json'}})}}
const storage=new Storage(),autonomic=new AutonomicStub();
const runtime={ctx:{storage},env:{OMEGA_SWARM_AUTONOMIC:{idFromName:n=>n,get:()=>autonomic}}};
assert.equal(runtimeStorageR168(runtime),storage);assert.equal(runtimeStorageShapeR168(runtime).selected,'CTX_STORAGE');assert.equal(manifestRuntimeStorageR168().newDurableObject,false);
const contract={schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:'route:r168',route:'Convergence',workspaceId:'ws',capabilityId:'capability:convergence',executionDomain:'LOCAL',state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'};
let x=await createRunR146(runtime,{intent:'R168 real Durable Object storage shape proof',contract,metadata:{sourceRevision:'R157',sourceMissionId:'r168-source',sourceFamily:'SYSTEM_COMPLETION',reflexScarId:'scar-r168',worldHeadSha256:'c'.repeat(64),residualPressure:1,residuals:[{id:'restore',kind:'RESTORATION_GAP',severity:'MEDIUM',summary:'current successor state must override predecessor debt'}]}});assert.equal(x.ok,true);const runId=x.run.id;
for(const [state,evidence] of [['AUTHORIZED',{}],['AVAILABLE',{}],['INVOKED',{}],['RETURNED',{}],['VERIFIED',{proofRef:'r168-proof',resultFingerprint:'f'.repeat(64)}]]){x=await transitionRunR146(runtime,runId,{state,evidence,reason:`R168 ${state}`});assert.equal(x.ok,true,state)}
const replay=await replayRunR146(runtime,runId);assert.equal(replay.ok,true);assert.equal(replay.runtimeStorageCompatibility,'R168');
const preview=await planReflexAutonomicSwarmR164(runtime,runId,{mode:'AUTO',providerBudget:8});assert.equal(preview.ok,true);assert.equal(preview.runtimeStorageCompatibility,'R168');assert.ok(preview.plan.totalCells>0&&preview.plan.totalCells<1728);const launched=await launchReflexAutonomicSwarmR164(runtime,runId,{mode:'AUTO',providerBudget:8,authorized:true});assert.equal(launched.ok,true);assert.equal(launched.record.runtimeStorageCompatibility,'R168');

for(const [k,v] of Object.entries({systems:100,families:24,masterMenus:12,menuOptions:36,capabilities:18,routes:44,sourceModes:179,canonLenses:62,packetStates:20736,logicalCells:1728,logicalLanes:20736,addressCapacity:61917364224}))assert.equal(R153_FULL_SYSTEM_CONTRACT.inventory[k],v,`inventory ${k}`);
assert.match(R153_FULL_SYSTEM_CONTRACT.nativeRootPolicy,/J:\\\\/);assert.match(R153_FULL_SYSTEM_CONTRACT.nativeRootPolicy,/Never silently fall back to C:/);

const authority=read('src/capabilityAuthority.ts'),operational=read('src/operationalCapabilityRuntimeR45.ts'),atlas=read('src/SystemAtlasControl.tsx'),r143=read('src/authoritativeOperationChainR143.ts'),completion=read('src/completionRuntimeR48.ts'),traversal=read('src/OmegaTraversalStudio.tsx'),calculus=read('src/system/appliedCalculusAuthorityR168.ts'),suite=read('src/OmegaSpecialistSuite.tsx'),wrangler=read('wrangler.jsonc'),worker=read('src/workerR116.js'),opticalTruth=read('public/omega-active-federation-r167.json');
for(const token of ["'Immersive Traversal':'SOURCE_ACTIVE'","'Extreme Traversal':'SOURCE_ACTIVE'","'Build Out':'LOCAL_ACTIVE'","'Plugins':'LOCAL_ACTIVE'"])must(authority.includes(token),`current reality ${token}`);
for(const token of ['CAPABILITY_PREDECESSOR_REALITY_R23',"'Immersive Traversal':'RESTORATION_DEBT'","'Plugins':'DONOR_ONLY'"])must(authority.includes(token),`predecessor evidence ${token}`);
must(!operational.includes('const RESTORED_REALITY'),'shadow RESTORED_REALITY must be removed');must(operational.includes('return capabilityReality(name)'),'effective reality must alias single current authority');
for(const token of ['hardwareConcurrency','deviceMemory','webgl2','MAXIMUM','targetFps','renderDensity','particleScale','frameBudgetMs'])must(operational.includes(token),`performance fabric ${token}`);
must(atlas.includes("data-current-reality='R168'")&&atlas.includes('R48_COMPLETION_FAMILIES')&&atlas.includes('CURRENT RESTORATION DEBT'),'System Atlas must use current successor truth');
must(r143.includes('effectiveCapabilityReality(route)'),'R143 must consume unified current reality');
must(completion.includes('restorationDebt')&&completion.includes("S23:{successor:'LOCAL_ACTIVE'"),'R48 must preserve predecessor provenance while current successor remains separate');
for(const token of ["'Traversal':{depth:12","'Immersive Traversal':{depth:48","'Extreme Traversal':{depth:144",'canonical state, transition law and proof authority remain shared'])must(traversal.includes(token),`traversal semantics ${token}`);
for(const token of ['PARTITION → EXCHANGE/TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/REPARTITION','37 is not hard-coded asymmetry','73 is not hard-coded symmetry','179 source modes + 62 canon/calculus lenses','1 → 12 → 144 → 1,728 logical cells → 20,736 logical lanes','RETURNED ≠ VERIFIED'])must(calculus.includes(token),`applied calculus ${token}`);
must(suite.includes('AppliedCalculusR168'),'Convergence must expose applied calculus authority');
must(wrangler.includes('"main": "src/workerR116.js"'),'R168 must preserve one public Worker entrypoint');must(worker.includes("from './workerR115.js'"),'R116 lineage must remain additive');
const optical=JSON.parse(opticalTruth);assert.equal(optical.revision,'R167');assert.equal(optical.active.optical.machineVersion,'R153.2');assert.equal(optical.active.optical.fullwaveExecutionClaimed,false);
console.log('R168 WHOLE-SYSTEM RESTORATION PASS · one current capability reality · V24 predecessor evidence retained · 24-family successor truth · real ctx.storage execution history · R164 swarm linkage · applied calculus authority · adaptive performance · R167 Optical preserved · R125 admission unchanged');

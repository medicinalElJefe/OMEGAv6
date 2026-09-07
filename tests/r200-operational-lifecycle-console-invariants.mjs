import assert from 'node:assert/strict';
import fs from 'node:fs';
import {R200_REVISION,R200_SCHEMA,R200_STAGES,R200_LAWS,manifestR200,reconcileRunLifecycleR200,reconcileSystemLifecycleR200} from '../public/omega-operational-lifecycle-r200-core.js';

assert.equal(R200_REVISION,'R200');
assert.equal(R200_SCHEMA,'OMEGA_OPERATIONAL_LIFECYCLE_R200');
assert.deepEqual(R200_STAGES,['REGISTERED','ROUTE_READY','CAPACITY_PLANNED','EXECUTOR_AVAILABLE','AUTHORIZED','DISPATCHED','RUNNING','RETURNED','VERIFIED','ADMISSIBLE']);
for(const law of ['DISPATCH_ACCEPTANCE_IS_NOT_INVOCATION','RUNNING_IS_INVOKED_NOT_RETURNED','RETURNED_IS_NOT_VERIFIED','VERIFIED_EXECUTION_IS_NOT_R125_ADMISSION','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R200_LAWS.includes(law),`missing R200 law ${law}`);
const manifest=manifestR200();assert.equal(manifest.canonicalMutation,false);assert.equal(manifest.canonicalAdmissionAuthority,'R125');assert.equal(manifest.nativeHybridDispatchRequiresExplicitConfirmation,true);assert.equal(manifest.authority.history,'R146');assert.equal(manifest.authority.executor,'R147');assert.equal(manifest.authority.convergence,'R159');

const contract={schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:'route:modes',route:'Modes',workspaceId:'INTELLIGENCE',capabilityId:'capability:modes',executionDomain:'AI',state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'};
const capacity={schema:'OMEGA_RELATIVE_CAPACITY_FABRIC_R154',state:'PLANNED_NOT_EXECUTED',route:'Modes',routeId:'route:modes',capabilityId:'capability:modes',executionDomain:'AI',capacity:{tier:'BRANCH',logicalLanes:144,temporalHz:12,viewResolution:1728}};
const baseRun={schema:'OMEGA_DURABLE_OPERATION_EXECUTION_R146',revision:'R146',id:'run_test_r200',intent:'Modes synthesis',contract,state:'AUTHORIZED',metadata:{relativeCapacityR154:capacity},canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
const directory={schema:'OMEGA_EXECUTOR_DIRECTORY_R147',revision:'R147',executors:{WORKERS_AI:{state:'AVAILABLE',domains:['AI','SAI']},AUTONOMIC_SWARM:{state:'AVAILABLE',domains:['AI']},FEDERATION_CHAIN:{state:'AVAILABLE',domains:['AI']}},canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
let life=reconcileRunLifecycleR200({run:baseRun,directory});
for(const id of ['REGISTERED','ROUTE_READY','CAPACITY_PLANNED','EXECUTOR_AVAILABLE','AUTHORIZED'])assert.equal(life.stages.find(x=>x.id===id)?.state,'PROVED',`${id} must be proved from exact inputs`);
assert.equal(life.stages.find(x=>x.id==='DISPATCHED')?.state,'READY');assert.equal(life.nextLawfulAction,'DISPATCH');assert.equal(life.canonicalAdmissionAuthority,'R125');

const invoked={...baseRun,state:'INVOKED'};
life=reconcileRunLifecycleR200({run:invoked,directory,resultView:{binding:{executorId:'WORKERS_AI',kind:'MODEL',bindingSha256:'a'.repeat(64)}}});
assert.equal(life.stages.find(x=>x.id==='DISPATCHED')?.state,'PROVED');assert.equal(life.stages.find(x=>x.id==='RUNNING')?.state,'PROVED');assert.equal(life.stages.find(x=>x.id==='RETURNED')?.state,'PENDING');assert.equal(life.nextLawfulAction,'POLL');

const returned={...baseRun,state:'RETURNED'};
life=reconcileRunLifecycleR200({run:returned,directory,resultView:{result:{resultFingerprint:'b'.repeat(64),payload:{response:'returned'}}}});
assert.equal(life.stages.find(x=>x.id==='RETURNED')?.state,'PROVED');assert.equal(life.stages.find(x=>x.id==='VERIFIED')?.state,'HELD');assert.equal(life.nextLawfulAction,'VERIFY');

const verified={...baseRun,state:'VERIFIED',headSha256:'c'.repeat(64)};
life=reconcileRunLifecycleR200({run:verified,directory});
assert.equal(life.stages.find(x=>x.id==='VERIFIED')?.state,'PROVED');assert.equal(life.stages.find(x=>x.id==='ADMISSIBLE')?.state,'HELD');assert.equal(life.nextLawfulAction,'R159_CONVERGENCE_REQUIRED');
life=reconcileRunLifecycleR200({run:verified,directory,convergence:{admissionCandidate:{state:'READY_FOR_R125_PROOF_GATE'}}});
assert.equal(life.stages.find(x=>x.id==='ADMISSIBLE')?.state,'CANDIDATE_READY');assert.equal(life.nextLawfulAction,'R125_SEPARATE_PROOF_GATE');

const hybridRun={...baseRun,contract:{...contract,routeId:'route:hybrid-link',route:'Hybrid Link',capabilityId:'capability:hybrid-link',executionDomain:'HYBRID'},metadata:{relativeCapacityR154:{...capacity,route:'Hybrid Link',routeId:'route:hybrid-link',capabilityId:'capability:hybrid-link',executionDomain:'HYBRID'}}};
const hybridDirectory={...directory,executors:{HYBRID_HOST:{state:'DEVICE_PROOF_REQUIRED',domains:['HYBRID','BUILD']}}};
life=reconcileRunLifecycleR200({run:hybridRun,directory:hybridDirectory});
assert.equal(life.stages.find(x=>x.id==='EXECUTOR_AVAILABLE')?.state,'HELD');assert.equal(life.nextLawfulAction,'PROVE_DEVICE');

const system=reconcileSystemLifecycleR200({core:{schema:'OMEGA_CANONICAL_CORE_HEALTH_R163',state:'LIVE',ok:true,runtimeVersion:{id:'worker-test'}},operational:{summary:{state:'REACHABLE',missing:[],fullSystem:{routes:44}}},hybrid:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[]},directory:null,runs:[]});
assert.equal(system.core.state,'LIVE');assert.equal(system.registeredRoutes.count,44);assert.equal(system.routeSpine.state,'REACHABLE');assert.equal(system.executors.state,'PRIVATE_PROOF_REQUIRED');assert.equal(system.durableRuns.state,'PRIVATE_PROOF_REQUIRED','missing private session must not be represented as empty proven history');assert.equal(system.canonicalAdmissionAuthority,'R125');

const html=fs.readFileSync('public/omega-operational-lifecycle-r200.html','utf8'),js=fs.readFileSync('public/omega-operational-lifecycle-r200.js','utf8'),css=fs.readFileSync('public/omega-operational-lifecycle-r200.css','utf8');
for(const token of ['OMEGA_OPERATIONAL_LIFECYCLE_R200','Operational Lifecycle Console','REGISTERED ≠ EXECUTED','VERIFIED ≠ CANONSTATE','confirmExecution','dispatchBtn','pollBtn','replayBtn'])assert.ok(html.includes(token),`R200 HTML missing ${token}`);
for(const token of ['./omega-operational-lifecycle-r200-core.js','omega.v6.runtime.session.r32','omega.v6.hybrid.bridge.r32','/api/core-health','/api/system/operational','/api/hybrid/status','/api/execution/r147/manifest','/api/relative-capacity-r154','/api/execution/executors','/api/execution/runs','/dispatch','/poll','/replay','ui.confirm.checked','currentHybridOnline','safe relative project path','setInterval'])assert.ok(js.includes(token),`R200 browser runtime missing ${token}`);
assert.ok(!js.includes('/api/hybrid/pair'),'R200 lifecycle console must reuse existing paired credentials rather than silently pairing/rotating a device');
assert.ok(!js.includes('canonicalMutation:true'),'R200 must never claim Canon mutation');
assert.ok(!js.includes('dispatchSelected()\nsetInterval'),'R200 must never auto-dispatch from the observation loop');
assert.ok(css.includes('@media (max-width:720px)')&&css.includes('@media (max-width:430px)'),'R200 console must preserve mobile containment');
assert.equal(fs.existsSync('.github/workflows/r200-operational-lifecycle-console.yml'),false,'R200 must not create another workflow authority');

console.log('R200 OPERATIONAL LIFECYCLE CONSOLE PASS · truthful REGISTERED→ROUTE_READY→CAPACITY_PLANNED→EXECUTOR_AVAILABLE→AUTHORIZED→DISPATCHED→RUNNING→RETURNED→VERIFIED→ADMISSIBLE reconciliation + explicit R147 dispatch/poll + R146 replay + private-proof holds + mobile containment + R125-only admission');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRunR146,transitionRunR146,readRunR146,authorizeOperatorRunR146} from '../src/execution/durableOperationExecutionR146.js';
import {dispatchRunR147,executorDirectoryR147,manifestR147,pollRunR147,readResultR147,syncHybridClaimR147,syncHybridReturnR147,R147_LAWS} from '../src/execution/unifiedExecutorFabricR147.js';
import {buildSaiInspectionDraft,verifySaiInspectionDraft,saiInspectionSteps} from '../src/execution/saiHostInspectionR209.js';
const must=(v,m)=>assert.ok(v,'R147 '+m);
class Storage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
class Runtime{constructor(env={},devices=[]){this.state={storage:new Storage()};this.env=env;this.deviceRows=devices}async devices(){return this.deviceRows}}
const contract=(domain,route)=>({schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:`route:${route.toLowerCase().replaceAll(' ','-')}`,route,workspaceId:'ws',capabilityId:`capability:${route.toLowerCase().replaceAll(' ','-')}`,executionDomain:domain,state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'});
async function authorized(runtime,domain,route){const created=await createRunR146(runtime,{intent:`execute ${route}`,contract:contract(domain,route)});assert.equal(created.ok,true);const moved=await transitionRunR146(runtime,created.run.id,{state:'AUTHORIZED',reason:'test authorized'});assert.equal(moved.ok,true);return moved.run}

const aiEnv={AI:{run:async()=>({response:'bounded model return'})}},aiRuntime=new Runtime(aiEnv),aiRun=await authorized(aiRuntime,'AI','Modes');
const dir=await executorDirectoryR147(aiRuntime);assert.equal(dir.executors.WORKERS_AI.state,'AVAILABLE');assert.equal(dir.canonicalAdmissionAuthority,'R125');
let out=await dispatchRunR147(aiRuntime,aiRun.id,{prompt:'synthesize current state',temperature:.2});assert.equal(out.ok,true);assert.equal(out.run.state,'VERIFIED');assert.equal(out.result.payload.executionTruth,'RETURNED_MODEL_OUTPUT_NOT_FACTUAL_VERIFICATION');let view=await readResultR147(aiRuntime,aiRun.id);assert.equal(view.state,'VERIFIED');assert.equal(view.result.executorId,'WORKERS_AI');

const host={id:'device-r147',name:'OMEGA PC',online:true,revoked:false,lastSeen:Date.now(),capabilityRevision:'R132',capabilities:['INDEX','HASH_TREE','BUILD','TEST']},hyRuntime=new Runtime({},[host]),hyRun=await authorized(hyRuntime,'HYBRID','Hybrid Link');
out=await dispatchRunR147(hyRuntime,hyRun.id,{confirmed:true,targetDeviceId:host.id,steps:[{id:'S01',op:'INDEX',label:'index',path:'.'}]}, {queueHybrid:async()=>({ok:true,status:200,job:{id:'job-r147',status:'QUEUED',inputFingerprint:'1'.repeat(64)}})});assert.equal(out.ok,true);assert.equal(out.run.state,'AVAILABLE');assert.equal(out.truthBoundary.includes('QUEUED is not INVOKED'),true);
let duplicateCalls=0;
const duplicate=await dispatchRunR147(hyRuntime,hyRun.id,{confirmed:true,targetDeviceId:host.id},{queueHybrid:async()=>{duplicateCalls++;return{ok:true,job:{id:'duplicate'}}}});
assert.equal(duplicate.code,'R147_DISPATCH_ALREADY_BOUND_OR_RESERVED');assert.equal(duplicateCalls,0);
const concurrentRuntime=new Runtime({},[host]),concurrentRun=await authorized(concurrentRuntime,'HYBRID','Hybrid Link');
let release,entered;const gate=new Promise(r=>{release=r}),startedQueue=new Promise(r=>{entered=r});
const first=dispatchRunR147(concurrentRuntime,concurrentRun.id,{confirmed:true,targetDeviceId:host.id,steps:[{id:'S01',op:'INDEX',path:'.'}]},{queueHybrid:async()=>{entered();await gate;return{ok:true,job:{id:'job-concurrent-r147'}}}});
await startedQueue;const racing=await dispatchRunR147(concurrentRuntime,concurrentRun.id,{confirmed:true,targetDeviceId:host.id},{queueHybrid:async()=>{duplicateCalls++;return{ok:true,job:{id:'racing'}}}});
assert.equal(racing.code,'R147_DISPATCH_IN_FLIGHT');release();assert.equal((await first).ok,true);assert.equal(duplicateCalls,0);
const heldRuntime=new Runtime({},[host]),heldRun=await authorized(heldRuntime,'HYBRID','Hybrid Link');
const invalidTarget=await dispatchRunR147(heldRuntime,heldRun.id,{confirmed:true,targetDeviceId:'other-host'},{queueHybrid:async()=>{duplicateCalls++;return{ok:true,job:{id:'wrong'}}}});
assert.equal(invalidTarget.code,'R147_EXPLICIT_HOST_NOT_CURRENT');assert.equal(duplicateCalls,0);
const uncertain=await dispatchRunR147(heldRuntime,heldRun.id,{confirmed:true,targetDeviceId:host.id},{queueHybrid:async()=>({ok:false,status:502,code:'AMBIGUOUS_QUEUE'})});
assert.equal(uncertain.dispatchReservation,'HELD_FOR_RECONCILIATION_NO_AUTOMATIC_RETRY');
const retry=await dispatchRunR147(heldRuntime,heldRun.id,{confirmed:true,targetDeviceId:host.id},{queueHybrid:async()=>{duplicateCalls++;return{ok:true,job:{id:'unsafe'}}}});
assert.equal(retry.code,'R147_DISPATCH_ALREADY_BOUND_OR_RESERVED');assert.equal(duplicateCalls,0);
let linked=await syncHybridClaimR147(hyRuntime,{id:'job-r147',inputFingerprint:'1'.repeat(64)});assert.equal(linked.state,'INVOKED');
linked=await syncHybridReturnR147(hyRuntime,{id:'job-r147',status:'COMPLETE',returnPacket:{resultFingerprint:'2'.repeat(64),stepProofs:[]}},null);assert.equal(linked.state,'RETURNED');
linked=await syncHybridReturnR147(hyRuntime,{id:'job-r147',status:'COMPLETE',returnPacket:{resultFingerprint:'2'.repeat(64),stepProofs:[]}},{state:'VERIFIED_EXECUTION_RETURN',fingerprint:{verified:true,digestMatch:true,semanticMatch:true},finalHeadSha256:'3'.repeat(64)});assert.equal(linked.state,'VERIFIED');

let missionState='QUEUED';const swarmStub={fetch:async req=>{const p=new URL(req.url).pathname;if(p==='/missions'&&req.method==='POST'){missionState='RUNNING';return new Response(JSON.stringify({mission:{id:'auto-r147',status:'QUEUED',projection:'PROOF'}}),{status:201,headers:{'content-type':'application/json'}})}if(p==='/missions/auto-r147'){missionState='COMPLETE';return new Response(JSON.stringify({id:'auto-r147',status:'COMPLETE',checkpointSha256:'4'.repeat(64),receipt:{merkleRoot:'5'.repeat(64),canonicalMutation:false,authority:'AUTONOMIC_RECEIPT_NOT_CANON'}}),{status:200,headers:{'content-type':'application/json'}})}return new Response('{}',{status:404})}},swarmEnv={OMEGA_SWARM_AUTONOMIC:{idFromName:x=>x,get:()=>swarmStub}},swarmRuntime=new Runtime(swarmEnv),swarmRun=await authorized(swarmRuntime,'PROOF','Evidence & Proof');
out=await dispatchRunR147(swarmRuntime,swarmRun.id,{strategy:'SWARM',prompt:'verify evidence relationships',providerBudget:2});assert.equal(out.ok,true);assert.equal(out.run.state,'INVOKED');out=await pollRunR147(swarmRuntime,swarmRun.id);assert.equal(out.run.state,'VERIFIED');assert.equal(out.mission.status,'COMPLETE');

const proposal={schema:'OMEGA_PACKET_v1',source_node:'omega-genesis',packet_id:'p1',state_id:'s1',geometry:{kind:'test'},wavelength_nm:550,lineage:['r147']};const screen={schema:'OMEGA_PACKET_v1',source_node:'omega-optical',packet_id:'p2',state_id:'s1',geometry:{kind:'test'},wavelength_nm:550,lineage:['r147','screen'],scalar_metrics:{score:.8},proof:{gate:'STAY',mode188_score:1.2}};const federationRuntime=new Runtime({OMEGA_GENESIS_MACHINE:{fetch:async()=>new Response(JSON.stringify({packet:proposal}),{status:200,headers:{'content-type':'application/json'}})},OMEGA_OPTICAL_MACHINE:{fetch:async()=>new Response(JSON.stringify({packet:screen,tier2_job:{schema:'OMEGA_FULLWAVE_QUEUE_v1'}}),{status:200,headers:{'content-type':'application/json'}})}}),fedRun=await authorized(federationRuntime,'AI','Kernel Intelligence');out=await dispatchRunR147(federationRuntime,fedRun.id,{strategy:'FEDERATION',prompt:'screen candidate'});assert.equal(out.ok,true);assert.equal(out.run.state,'VERIFIED');assert.equal(out.result.payload.authority,'R115_PROPOSE_SCREEN_RETURN_NOT_CANON');

const proofRuntime=new Runtime(),target=await authorized(proofRuntime,'LOCAL','Traversal');await transitionRunR146(proofRuntime,target.id,{state:'AVAILABLE'});await transitionRunR146(proofRuntime,target.id,{state:'INVOKED'});await transitionRunR146(proofRuntime,target.id,{state:'RETURNED',evidence:{proofRef:'test',resultFingerprint:'6'.repeat(64)}});await transitionRunR146(proofRuntime,target.id,{state:'VERIFIED',evidence:{proofRef:'test',resultFingerprint:'6'.repeat(64)}});const proofRun=await authorized(proofRuntime,'PROOF','Validation');out=await dispatchRunR147(proofRuntime,proofRun.id,{strategy:'LOCAL',targetRunId:target.id});assert.equal(out.ok,true);assert.equal(out.run.state,'VERIFIED');assert.equal(out.result.payload.replay.ok,true);

const typedDraft=await buildSaiInspectionDraft('Do not execute a shell, patch, repair, train or click; inspect the source project.','.');
assert.deepEqual(typedDraft.operations.map(x=>x.op),['INDEX','HASH_TREE']);assert.equal(await verifySaiInspectionDraft(typedDraft),true);
assert.equal(await verifySaiInspectionDraft({...typedDraft,operations:[{step:1,op:'APPLY_PATCH',path:'.'}]}),false);
await assert.rejects(()=>buildSaiInspectionDraft('inspect','../unsafe'));
await assert.rejects(()=>saiInspectionSteps(typedDraft,751));
const typedSteps=await saiInspectionSteps(typedDraft,750),typedRuntime=new Runtime({},[host]),ancestry='a'.repeat(64);
const typedCreated=await createRunR146(typedRuntime,{intent:'SAI typed inspection',contract:contract('HYBRID','Hybrid Link'),metadata:{saiHostInspection:{lineageId:'r209_'+ancestry.slice(0,32),ancestrySha256:ancestry,draft:typedDraft,targetDeviceId:host.id,maxResults:750,steps:typedSteps}}});
const forgedTransition=await authorizeOperatorRunR146(typedRuntime,typedCreated.run.id,{state:'VERIFIED',evidence:{proofRef:'forged',resultFingerprint:'f'.repeat(64)}});assert.equal(forgedTransition.code,'R146_EXECUTOR_OWNED_TRANSITION_HELD');
assert.equal((await authorizeOperatorRunR146(typedRuntime,typedCreated.run.id,{state:'AUTHORIZED'})).ok,true);
const typedInput={executorId:'HYBRID_HOST',targetDeviceId:host.id,projectPath:'.',confirmed:true,steps:typedSteps};
const altered=await dispatchRunR147(typedRuntime,typedCreated.run.id,{...typedInput,steps:[{id:'S01',op:'APPLY_PATCH',path:'.'}]},{queueHybrid:async()=>{throw Error('must never queue altered draft')}});
assert.equal(altered.code,'R209_SAI_INSPECTION_EXACT_DISPATCH_HELD');
const typedReturn=await dispatchRunR147(typedRuntime,typedCreated.run.id,typedInput,{queueHybrid:async job=>{assert.deepEqual(job.steps,typedSteps);assert.equal(job.targetDeviceId,host.id);return{ok:true,job:{id:'sai-r209-typed-host',inputFingerprint:'8'.repeat(64)}}}});
assert.equal(typedReturn.ok,true);assert.equal(typedReturn.run.state,'AVAILABLE');assert.equal((await readResultR147(typedRuntime,typedCreated.run.id)).hostDispatchReservation.state,'BOUND');
const {compileSaiCloudSource}=await import('../src/execution/saiCloudCorpus.js');
const {inspectionSHA}=await import('../src/execution/saiHostInspectionR209.js');
const regions=[],assets=new Map(),encoder=new TextEncoder();
const assetHash=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const makeRow=address=>({address,stateId:address+1,coordinates:[Math.floor(address/1728),Math.floor(address%1728/144),Math.floor(address%144/12),address%12],metrics:{continuity:.5+(address%12)/30,plasticity:.6,contradiction:.2,burden:.2,scar:.3+(address%12)/40,evidence:.5,rsc:.5,geometry:.5,stability:.6,decision:'STAY',mode188:'STAY'},autoPing:{dataNext:(address+1)%20736,previous:(address+20735)%20736,hourglassMirror:address,mode188Plus:(address+188)%20736},motion:.5,modes:Array.from({length:20},(_,i)=>['M'+String(i+1).padStart(3,'0'),'EXECUTED_EXACT',.5,[]]),mode188:{sratio:1,decision:'STAY',packetGate:'STAY'}});
for(let i=0;i<144;i++){const file='region-'+String(i).padStart(3,'0')+'.json',body=JSON.stringify({schema:'OMEGA_SAI_PROJECTED_REGION_V1',region:i,rows:Array.from({length:144},(_,j)=>makeRow(i*144+j))});assets.set(file,body);regions.push({region:i,file,bytes:encoder.encode(body).length,sha256:await assetHash(body)})}
assets.set('manifest.json',JSON.stringify({schema:'OMEGA_SAI_PROJECTED_SOURCE_V1',stateCount:20736,regionCount:144,lanesPerRegion:144,catalogCount:179,modeContracts:Array.from({length:20},(_,i)=>({id:'M'+String(i+1).padStart(3,'0'),formula:'fixture'})),sources:{fixture:true},coreR2Min:.98,medianR2:.99,boundary:'FIXTURE ONLY',regions}));
const fixtureAssets={fetch:async request=>{const name=new URL(request.url).pathname.split('/').at(-1);return assets.has(name)?new Response(assets.get(name)):new Response('',{status:404})}};
const packet=await compileSaiCloudSource(fixtureAssets,{kind:'TRAIN_REGIONAL',address:188,epochs:24});
assert.equal(packet.dataset.rows.length,144);assert.equal(packet.dataset.rows[0].address,144);
const trainingRuntime=new Runtime(),trainingCreated=await createRunR146(trainingRuntime,{contract:contract('SAI','SAI Lab'),metadata:{saiCloudTraining:true,sourcePacket:packet}});
await transitionRunR146(trainingRuntime,trainingCreated.run.id,{state:'AUTHORIZED'});
let trainingOut=await dispatchRunR147(trainingRuntime,trainingCreated.run.id,{executorId:'LOCAL_RUNTIME',sourceSha256:'f'.repeat(64)});
assert.equal(trainingOut.code,'SAI_CLOUD_SOURCE_PROMPT_MISMATCH');
trainingOut=await dispatchRunR147(trainingRuntime,trainingCreated.run.id,{executorId:'LOCAL_RUNTIME',sourceSha256:packet.packetSha256});
assert.equal(trainingOut.ok,true);assert.equal(trainingOut.run.state,'VERIFIED');assert.equal(trainingOut.result.payload.session.epoch,24);assert.equal(trainingOut.result.payload.evaluation.predictions.length,144);assert.equal(trainingOut.result.payload.foundationWeightsChanged,false);
const synthesis=await compileSaiCloudSource(fixtureAssets,{kind:'SYNTHESIS',address:188,query:'Evaluate continuity'});
assert.equal(synthesis.witnesses.length,4);
let providerPrompt='';const synthRuntime=new Runtime({AI:{run:async(model,input)=>{providerPrompt=input.messages[1].content;return{response:'fixture model result'}}}});
const synthCreated=await createRunR146(synthRuntime,{contract:contract('SAI','SAI Lab'),metadata:{saiCloudExecution:true,sourcePacket:synthesis}});
await transitionRunR146(synthRuntime,synthCreated.run.id,{state:'AUTHORIZED'});
const synthOut=await dispatchRunR147(synthRuntime,synthCreated.run.id,{executorId:'WORKERS_AI',sourceSha256:synthesis.packetSha256,prompt:'untrusted override'});
assert.equal(synthOut.ok,true);assert.equal(providerPrompt,synthesis.prompt);
const originalRegion=assets.get('region-001.json');assets.set('region-001.json',originalRegion+' ');
await assert.rejects(()=>compileSaiCloudSource(fixtureAssets,{kind:'SYNTHESIS',address:188,query:'inspect'}),/DIGEST_MISMATCH/);assets.set('region-001.json',originalRegion);
const staleHost={...host,lastSeen:Date.now()-60000,online:true};assert.equal((await executorDirectoryR147(new Runtime({},[staleHost]))).executors.HYBRID_HOST.state,'DEVICE_PROOF_REQUIRED');
const existingResult=await readResultR147(hyRuntime,hyRun.id);
await syncHybridReturnR147(hyRuntime,{id:'job-r147',status:'FAILED',returnPacket:{resultFingerprint:'9'.repeat(64)}},null);
assert.equal((await readResultR147(hyRuntime,hyRun.id)).result.resultFingerprint,existingResult.result.resultFingerprint);
const pluginRuntime=new Runtime(),pluginRun=await authorized(pluginRuntime,'PLUGIN','Plugins');out=await dispatchRunR147(pluginRuntime,pluginRun.id,{});assert.equal(out.ok,false);assert.equal(out.code,'R147_PLUGIN_CONCRETE_ADAPTER_REQUIRED');assert.equal((await readRunR146(pluginRuntime,pluginRun.id)).state,'AUTHORIZED');

for(const law of ['ONE_DURABLE_RUN_ONE_EXECUTOR_BINDING_AT_A_TIME','QUEUEING_IS_NOT_INVOCATION','HYBRID_AGENT_CLAIM_ADVANCES_AVAILABLE_TO_INVOKED','HYBRID_RETURN_REQUIRES_R141_CLOSURE_BEFORE_VERIFIED','SWARM_EXECUTION_QUORUM_IS_NOT_TRUTH_CONSENSUS','PLUGIN_REGISTRY_PRESENCE_IS_NOT_PROVIDER_EXECUTION','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])must(R147_LAWS.includes(law),'law missing '+law);
const manifest=manifestR147();assert.equal(manifest.upstream.durableRun,'R146');assert.equal(manifest.upstream.hybridProof,'R141');assert.equal(manifest.upstream.swarm,'R125');assert.equal(manifest.canonicalMutation,false);
const worker=fs.readFileSync('src/workerR116.js','utf8'),wrangler=fs.readFileSync('wrangler.jsonc','utf8');for(const token of ["from './execution/unifiedExecutorFabricR147.js'",'/api/execution/r147/manifest','/api/execution/executors','dispatchRunR147','syncHybridClaimR147','syncHybridReturnR147','x-omega-executor-fabric'])must(worker.includes(token),'R116 mount missing '+token);must(wrangler.includes('"main": "src/workerR116.js"'),'proven R116 production spine must remain');must(!fs.existsSync('src/workerR147.js'),'R147 must not create a shadow production Worker');
console.log('R147 UNIFIED EXECUTOR FABRIC PASS · one durable run across Workers AI, Hybrid claim/return, autonomic swarm, federation and local proof · plugin false-positive execution refused · R125 admission unchanged');

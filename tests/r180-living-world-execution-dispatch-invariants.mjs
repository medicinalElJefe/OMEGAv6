import assert from 'node:assert/strict';
import {authorizeLivingWorldMissionR179} from '../src/execution/livingWorldExecutionAuthorizationR179.js';
import {dispatchAuthorizedLivingWorldMissionR180,manifestR180,R180_LAWS} from '../src/execution/livingWorldExecutionDispatchR180.js';
import {readRunR146,replayRunR146,transitionRunR146} from '../src/execution/durableOperationExecutionR146.js';

class Storage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
class Runtime{constructor(devices=[]){const storage=new Storage();this.state={storage};this.ctx={storage};this.env={};this.deviceRows=devices}async devices(){return this.deviceRows}}
const contract=(route='Convergence',domain='LOCAL')=>({schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:'route-'+route.toLowerCase().replaceAll(' ','-'),route,workspaceId:'workspace-main',capabilityId:'cap-'+route.toLowerCase().replaceAll(' ','-'),executionDomain:domain,state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'});
const resolution=(domain='LOCAL',route='Convergence',mission='mission-r180-test')=>({schema:'OMEGA_LIVING_WORLD_MISSION_CONTRACT_RESOLUTION_R178',revision:'R178',accepted:true,state:'CONTRACTS_RESOLVED_NOT_AUTHORIZED',worldId:'OMEGA_CANONICAL_WORLD',sourceMissionId:mission,sourceOperationRef:{runId:'world-run-r180',headSha256:'world-head-r180'},scarCount:11,adaptiveContext:{lod:'1728',sampleBudget:1728},resolvedSteps:[{index:0,domain,action:'Execute bounded living-world step',reason:'Operator selected the proved contract',route,readiness:'CONTRACT_RESOLVED_NOT_AUTHORIZED',contract:contract(route,domain)}],dispatchAuthorized:false,executionInvoked:false,authorizationRequired:true,canonicalMutation:false,canonicalAdmissionAuthority:'R125'});

const runtime=new Runtime();
const auth=await authorizeLivingWorldMissionR179(runtime,resolution(),{authorized:true,confirmation:'AUTHORIZE_SELECTED_R143_CONTRACTS',authorizedStepIndexes:[0],reason:'R180 test explicit authorization'});
assert.equal(auth.ok,true);assert.equal(auth.runs.length,1);assert.equal(auth.runs[0].state,'AUTHORIZED');
const runId=auth.runs[0].runId;
let out=await dispatchAuthorizedLivingWorldMissionR180(runtime,auth,{runIds:[runId]});
assert.equal(out.ok,false);assert.equal(out.code,'R180_EXPLICIT_DISPATCH_CONFIRMATION_REQUIRED');assert.equal((await readRunR146(runtime,runId)).state,'AUTHORIZED');
out=await dispatchAuthorizedLivingWorldMissionR180(runtime,auth,{dispatch:true,confirmation:'DISPATCH_AUTHORIZED_R179_RUNS',runIds:[runId],dispatchByRun:{[runId]:{localOperation:'MANIFEST'}}});
assert.equal(out.ok,true);assert.equal(out.dispatchAuthorized,true);assert.equal(out.executionInvoked,true);assert.equal(out.returned,true);assert.equal(out.verified,true);assert.equal(out.results.length,1);assert.equal(out.results[0].state,'VERIFIED');assert.equal(out.results[0].replayOk,true);assert.equal(out.canonicalMutation,false);assert.equal(out.canonicalAdmissionAuthority,'R125');
const run=await readRunR146(runtime,runId);assert.equal(run.state,'VERIFIED');assert.deepEqual(run.events.map(x=>x.to),['DISCOVERED','AUTHORIZED','AVAILABLE','INVOKED','RETURNED','VERIFIED']);assert.equal(run.metadata.sourceRevision,'R179');assert.equal(run.metadata.sourceMissionId,'mission-r180-test');assert.equal(run.metadata.worldId,'OMEGA_CANONICAL_WORLD');
const replay=await replayRunR146(runtime,runId);assert.equal(replay.ok,true);assert.equal(replay.headMatch,true);
for(const claim of Object.values(out.claims))assert.equal(claim,false);

const staleRuntime=new Runtime(),staleAuth=await authorizeLivingWorldMissionR179(staleRuntime,resolution('LOCAL','Convergence','mission-r180-stale'),{authorized:true,confirmation:'AUTHORIZE_SELECTED_R143_CONTRACTS',authorizedStepIndexes:[0]});
const staleId=staleAuth.runs[0].runId;await transitionRunR146(staleRuntime,staleId,{state:'AVAILABLE',reason:'Simulate another authority advancing the run first',evidence:{proofRef:'R180_STALE_SIMULATION'}});
const stale=await dispatchAuthorizedLivingWorldMissionR180(staleRuntime,staleAuth,{dispatch:true,confirmation:'DISPATCH_AUTHORIZED_R179_RUNS',runIds:[staleId]});assert.equal(stale.ok,false);assert.equal(stale.code,'R180_AUTHORIZED_RUN_LINEAGE_OR_HEAD_STALE');assert.equal((await readRunR146(staleRuntime,staleId)).state,'AVAILABLE');

const hybridRuntime=new Runtime([{id:'pc-test',name:'PC test',online:true,revoked:false,lastSeen:Date.now(),capabilities:['BUILD','TEST']}]),hybridAuth=await authorizeLivingWorldMissionR179(hybridRuntime,resolution('HYBRID','Hybrid Link','mission-r180-hybrid'),{authorized:true,confirmation:'AUTHORIZE_SELECTED_R143_CONTRACTS',authorizedStepIndexes:[0]});
const hybridId=hybridAuth.runs[0].runId,held=await dispatchAuthorizedLivingWorldMissionR180(hybridRuntime,hybridAuth,{dispatch:true,confirmation:'DISPATCH_AUTHORIZED_R179_RUNS',runIds:[hybridId]});assert.equal(held.ok,true);assert.equal(held.state,'DISPATCH_HELD');assert.equal(held.executionInvoked,false);assert.equal(held.results[0].status,'HELD_HOST_EXECUTION_CONFIRMATION_REQUIRED');assert.equal((await readRunR146(hybridRuntime,hybridId)).state,'AUTHORIZED');

for(const law of ['R179_AUTHORIZED_NOT_DISPATCHED_RECEIPT_REQUIRED','EXPLICIT_SEPARATE_DISPATCH_CONFIRMATION_REQUIRED','R147_REMAINS_EXECUTOR_SELECTION_AND_DISPATCH_AUTHORITY','HYBRID_AND_BUILD_REQUIRE_SEPARATE_HOST_EXECUTION_CONFIRMATION','EVERY_DISPATCHED_RUN_MUST_REMAIN_R146_REPLAYABLE','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R180_LAWS.includes(law));
const manifest=manifestR180();assert.equal(manifest.revision,'R180');assert.equal(manifest.dispatchAuthority,'R147');assert.equal(manifest.durableLifecycleAuthority,'R146');assert.deepEqual(manifest.hostExecutionConfirmationRequired,['HYBRID','BUILD']);assert.equal(manifest.canonicalAdmissionAuthority,'R125');
console.log('R180 living-world execution dispatch invariants PASS');

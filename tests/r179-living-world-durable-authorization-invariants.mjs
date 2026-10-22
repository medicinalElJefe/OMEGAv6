import assert from 'node:assert/strict';
import {authorizeLivingWorldMissionR179,manifestR179,R179_LAWS} from '../src/execution/livingWorldExecutionAuthorizationR179.js';
import {readRunR146,replayRunR146} from '../src/execution/durableOperationExecutionR146.js';

class MemStorage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,structuredClone(v))}}
const runtime={ctx:{storage:new MemStorage()}};
const contract=(route='Convergence',state='AVAILABLE',domain='FEDERATION')=>({schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:'route-'+route.toLowerCase().replaceAll(' ','-'),route,workspaceId:'workspace-main',capabilityId:'cap-'+route.toLowerCase().replaceAll(' ','-'),executionDomain:domain,state,receiptAuthority:'R142',admissionAuthority:'R125'});
const resolution={schema:'OMEGA_LIVING_WORLD_MISSION_CONTRACT_RESOLUTION_R178',revision:'R178',accepted:true,state:'CONTRACTS_RESOLVED_NOT_AUTHORIZED',worldId:'OMEGA_CANONICAL_WORLD',sourceMissionId:'mission-r179-test',sourceOperationRef:{runId:'world-run-1',headSha256:'abc123'},scarCount:7,adaptiveContext:{lod:'1728',sampleBudget:1728},resolvedSteps:[{index:0,domain:'FEDERATION',action:'Advance verified federation membrane',reason:'Current world requires the next receipt',route:'Convergence',readiness:'CONTRACT_RESOLVED_NOT_AUTHORIZED',contract:contract()},{index:1,domain:'HYBRID',action:'Acquire current Hybrid proof',reason:'Device proof missing',route:'Hybrid Link',readiness:'HOLD_ROUTE_DISCOVERED',contract:contract('Hybrid Link','DISCOVERED','HYBRID')}],dispatchAuthorized:false,executionInvoked:false,authorizationRequired:true,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};

const denied=await authorizeLivingWorldMissionR179(runtime,resolution,{authorizedStepIndexes:[0]});
assert.equal(denied.ok,false);assert.equal(denied.code,'R179_EXPLICIT_OPERATOR_AUTHORIZATION_REQUIRED');

const held=await authorizeLivingWorldMissionR179(runtime,resolution,{authorized:true,confirmation:'AUTHORIZE_SELECTED_R143_CONTRACTS',authorizedStepIndexes:[1]});
assert.equal(held.ok,false);assert.equal(held.code,'R179_SELECTED_CONTRACT_NOT_AVAILABLE');

const ok=await authorizeLivingWorldMissionR179(runtime,resolution,{authorized:true,confirmation:'AUTHORIZE_SELECTED_R143_CONTRACTS',authorizedStepIndexes:[0],reason:'Operator explicitly approved this resolved living-world contract'});
assert.equal(ok.ok,true);assert.equal(ok.state,'AUTHORIZED_NOT_DISPATCHED');assert.equal(ok.dispatchAuthorized,false);assert.equal(ok.executionInvoked,false);assert.equal(ok.returned,false);assert.equal(ok.verified,false);assert.equal(ok.canonicalMutation,false);assert.equal(ok.canonicalAdmissionAuthority,'R125');assert.equal(ok.runs.length,1);assert.equal(ok.runs[0].state,'AUTHORIZED');
const run=await readRunR146(runtime,ok.runs[0].runId);assert.equal(run.state,'AUTHORIZED');assert.equal(run.events.length,2);assert.equal(run.events[0].to,'DISCOVERED');assert.equal(run.events[1].to,'AUTHORIZED');assert.equal(run.metadata.worldId,'OMEGA_CANONICAL_WORLD');assert.equal(run.metadata.scarCount,7);assert.equal(run.metadata.sourceMissionId,'mission-r179-test');
const replay=await replayRunR146(runtime,run.id);assert.equal(replay.ok,true);assert.equal(replay.headMatch,true);
for(const claim of Object.values(ok.claims))assert.equal(claim,false);
for(const law of ['EXPLICIT_OPERATOR_AUTHORIZATION_REQUIRED','R179_STOPS_AT_AUTHORIZED_AND_NEVER_DISPATCHES_R147','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(R179_LAWS.includes(law));
const manifest=manifestR179();assert.equal(manifest.revision,'R179');assert.equal(manifest.dispatchAuthorized,false);assert.equal(manifest.executionInvoked,false);assert.equal(manifest.canonicalAdmissionAuthority,'R125');
console.log('R179 living-world durable authorization invariants PASS');

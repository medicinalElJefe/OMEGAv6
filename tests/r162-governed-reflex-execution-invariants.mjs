import assert from 'node:assert/strict';
import {createRunR146,readRunR146} from '../src/execution/durableOperationExecutionR146.js';
import {authorizeAndDispatchReflexMissionR162,manifestR162,R162_LAWS} from '../src/execution/governedReflexExecutionR162.js';

class Storage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,v)}}
class Runtime{constructor(){this.state={storage:new Storage()};this.env={}}async devices(){return[]}}

const runtime=new Runtime();
const contract={schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:'proof',route:'/proof',workspaceId:'proof',capabilityId:'proof.replay',executionDomain:'PROOF',state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'};
const created=await createRunR146(runtime,{contract,intent:'verify reflex mission continuity'});
assert.equal(created.ok,true);assert.equal(created.run.state,'DISCOVERED');
const handoff={ok:true,schema:'OMEGA_REFLEX_MISSION_DURABLE_HANDOFF_R161',revision:'R161',state:'DURABLE_EXECUTION_INTENT_DISCOVERED',run:created.run,executorPlan:{executorId:'LOCAL_PROOF',strategy:'LOCAL'},preview:{missionId:'mission_r162',intentId:'intent_r162',worldHeadSha256:'abc123',scarId:'scar_r162'},canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
let denied=await authorizeAndDispatchReflexMissionR162(runtime,handoff,{authorized:false});
assert.equal(denied.ok,false);assert.equal(denied.code,'R162_EXPLICIT_EXECUTION_AUTHORIZATION_REQUIRED');assert.equal((await readRunR146(runtime,created.run.id)).state,'DISCOVERED');
let out=await authorizeAndDispatchReflexMissionR162(runtime,handoff,{authorized:true,reason:'operator approved',dispatch:{targetRunId:created.run.id}});
assert.equal(out.ok,true);assert.equal(out.revision,'R162');assert.equal(out.canonicalMutation,false);assert.equal(out.canonicalAdmissionAuthority,'R125');assert.equal(out.executionTruth.authorized,true);assert.equal(out.executionTruth.pcOnline,false);assert.equal(out.executionTruth.federationClosed,false);assert.equal(out.executionTruth.solverValidated,false);assert.equal(out.executionTruth.computedPhotorealRealityProved,false);assert.equal(out.dispatch.run.state,'VERIFIED');
const persisted=await readRunR146(runtime,created.run.id);assert.equal(persisted.state,'VERIFIED');assert.equal(persisted.events[1].to,'AUTHORIZED');
const manifest=manifestR162();assert.equal(manifest.canonicalAdmissionAuthority,'R125');assert.ok(R162_LAWS.includes('EXPLICIT_EXECUTION_AUTHORIZATION_REQUIRED'));assert.ok(R162_LAWS.includes('R147_REMAINS_EXECUTOR_AND_DISPATCH_AUTHORITY'));assert.ok(R162_LAWS.includes('R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'));
console.log('R162 governed reflex execution invariants PASS');

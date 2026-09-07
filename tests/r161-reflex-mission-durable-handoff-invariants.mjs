import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assembleReflexWorldTransitionR157} from '../src/world/reflexWorldTransitionR157.js';
import {handoffReflexMissionR161,manifestR161,R161_LAWS} from '../src/execution/reflexMissionDurableHandoffR161.js';

class Storage{constructor(){this.m=new Map()}async get(k){return this.m.get(k)}async put(k,v){this.m.set(k,v)}}
class Runtime{constructor(){this.state={storage:new Storage()};this.env={}}async devices(){return[]}}
const contract={schema:'OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143',revision:'R143',routeId:'route:proof-ledger',route:'Proof Ledger',workspaceId:'workspace:system',capabilityId:'proof-ledger',executionDomain:'PROOF',state:'AVAILABLE',receiptAuthority:'R142',admissionAuthority:'R125'};
const transition=await assembleReflexWorldTransitionR157({source_family:'OPTICAL_OPERATION',canonical_address:1698,packet_id:'r161-return-1',returned_state:'RETURNED',residuals:[{id:'domain',kind:'DOMAIN_MISMATCH',severity:'HIGH',summary:'stronger verification required',evidence_id:'evidence-r161'}]},{performance:{load:.7,latencyPressure:.6}});
assert.equal(transition.ok,true);
assert.equal(transition.mission.state,'INTENT_ASSEMBLED_NOT_EXECUTION_PROOF');

const unconfirmedRuntime=new Runtime();
const held=await handoffReflexMissionR161(unconfirmedRuntime,transition,{contract,strategy:'FEDERATION'});
assert.equal(held.ok,false);assert.equal(held.code,'R161_EXPLICIT_HANDOFF_CONFIRMATION_REQUIRED');
assert.equal((await unconfirmedRuntime.state.storage.get('execution:r146:index')),undefined,'unconfirmed reflex may not create durable run');

const runtime=new Runtime();
const handoff=await handoffReflexMissionR161(runtime,transition,{contract,strategy:'FEDERATION',confirmed:true,sourceOperationReceiptHash:'a'.repeat(64)});
assert.equal(handoff.ok,true);assert.equal(handoff.state,'DURABLE_EXECUTION_INTENT_DISCOVERED');
assert.equal(handoff.run.revision,'R146');assert.equal(handoff.run.state,'DISCOVERED');assert.equal(handoff.run.events.length,1);
assert.equal(handoff.run.events[0].to,'DISCOVERED');assert.equal(handoff.run.metadata.sourceRevision,'R157');
assert.equal(handoff.run.metadata.reflexScarId,transition.reflex.scar.scar_id);assert.equal(handoff.run.metadata.worldHeadSha256,transition.world.head.headSha256);
assert.deepEqual(handoff.run.metadata.targetFamilies,transition.mission.targetFamilies);
assert.equal(handoff.executorPlan.revision,undefined);assert.equal(handoff.executorPlan.executorId,'FEDERATION_CHAIN');assert.equal(handoff.executorPlan.state,'UNAVAILABLE');
for(const key of ['authorized','available','invoked','returned','verified','pcOnline','federationClosed','solverValidated','computedPhotorealRealityProved'])assert.equal(handoff.executionTruth[key],false,key+' must remain false at handoff');
assert.equal(handoff.canonicalMutation,false);assert.equal(handoff.canonicalAdmissionAuthority,'R125');
assert.match(handoff.nextRequired,/R146_AUTHORIZATION/);assert.match(handoff.truthBoundary,/never authorizes or dispatches autonomously/);

const source=fs.readFileSync(new URL('../src/execution/reflexMissionDurableHandoffR161.js',import.meta.url),'utf8');
assert.doesNotMatch(source,/dispatchRunR147\s*\(/,'R161 may not autonomously dispatch');
assert.doesNotMatch(source,/transitionRunR146\s*\(/,'R161 may not autonomously authorize or advance lifecycle');
for(const law of ['EXPLICIT_HANDOFF_CONFIRMATION_PERSISTS_INTENT_NOT_INVOCATION','R146_REMAINS_DURABLE_EXECUTION_HISTORY_AUTHORITY','R147_EXECUTOR_SELECTION_IS_ROUTING_PLAN_NOT_INVOCATION','R159_REMAINS_POST_RETURN_SOVEREIGN_CONVERGENCE_AUTHORITY','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY','NO_AUTONOMOUS_DISPATCH_FROM_REFLEX'])assert.ok(R161_LAWS.includes(law),'missing law '+law);
const manifest=manifestR161();assert.equal(manifest.revision,'R161');assert.equal(manifest.canonicalMutation,false);assert.equal(manifest.canonicalAdmissionAuthority,'R125');
console.log('R161 REFLEX MISSION DURABLE HANDOFF PASS · explicit R157 mission → R146 DISCOVERED run · R147 plan only · no autonomous execution/admission');

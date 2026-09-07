import assert from 'node:assert/strict';
import fs from 'node:fs';
import {projectLivingWorldIntelligenceProofR196,manifestR196,R196_SCHEMA} from '../src/world/livingWorldIntelligenceProofR196.js';

const membrane={schema:'OMEGA_LIVING_WORLD_CURRENT_PROOF_MEMBRANE_R1901',eventAccepted:true,sourceRevision:'R175',worldId:'OMEGA_CANONICAL_WORLD',operationRef:'op-196',scarCount:7,adaptiveContext:{lod:144,sampleBudget:1728,truthInvariant:true},truthBands:{hybrid:'DEVICE_PROOF_REQUIRED',earth:'EXTERNAL_DEGRADED'},proof:{hybrid:'HOLD_DEVICE_PROOF_REQUIRED',render:'HOLD_COMPUTED_REALITY_PROOF_REQUIRED'},federation:{stage:'SCREEN',nextStage:'QUEUE',routingTarget:'SOVEREIGN',closed:false},nextAction:{domain:'HYBRID',route:'Hybrid Link',intent:'ACQUIRE_CURRENT_DEVICE_PROOF',operatorConfirmationRequired:true}};
const unavailable={schema:'OMEGA_AUTHENTICATED_INTELLIGENCE_BRIDGE_R195_1',revision:'R195.1',measuredAt:'2026-09-07T18:00:00Z',hybridOnline:false,deviceCount:0,trainerAvailable:true,buildAvailable:true,lanes:[{id:'HOSTED_AI',state:'AVAILABLE',authority:'R147 / provider receipt'},{id:'SAI',state:'AVAILABLE',authority:'B059 proposal + R147 execution'},{id:'HYBRID',state:'DEVICE_PROOF_REQUIRED',authority:'authenticated heartbeat / R141 return'}]};
const current={...unavailable,hybridOnline:true,deviceCount:1,lanes:unavailable.lanes.map(x=>x.id==='HYBRID'?{...x,state:'LIVE'}:x)};

const rejected=projectLivingWorldIntelligenceProofR196({membrane:{},intelligence:current});
assert.equal(rejected.eventAccepted,false);
assert.equal(rejected.canonicalMutation,false);

const held=projectLivingWorldIntelligenceProofR196({membrane,intelligence:unavailable});
assert.equal(held.schema,R196_SCHEMA);
assert.equal(held.eventAccepted,true);
assert.equal(held.worldId,'OMEGA_CANONICAL_WORLD');
assert.equal(held.intelligence.state,'BOUNDED_PROPOSAL_ONLY');
assert.equal(held.intelligence.hybridOnline,false);
assert.equal(held.nextAction.intent,'ACQUIRE_CURRENT_DEVICE_PROOF');
assert.equal(held.dispatchAuthorized,false);
assert.equal(held.canonicalAdmissionAuthority,'R125');

const live=projectLivingWorldIntelligenceProofR196({membrane,intelligence:current});
assert.equal(live.intelligence.state,'AUTHENTICATED_INTELLIGENCE_PATH_AVAILABLE');
assert.equal(live.intelligence.hybridOnline,true);
assert.equal(live.intelligence.deviceCount,1);
assert.deepEqual(live.nextAction,membrane.nextAction);
assert.equal(live.adaptiveContext.truthInvariant,true);
assert.equal(live.authority.execution,'R146/R147');
assert.equal(live.authority.exactReturnProof,'R141');

for(const forbidden of ['publicDeploymentProved:true','solverValidityProved:true','computedPhotorealRealityProved:true','federationClosedProved:true'])assert.equal(JSON.stringify(live).includes(forbidden),false,`R196 must not invent ${forbidden}`);
const manifest=manifestR196();
assert.equal(manifest.visualWorldAuthority,'R136/R134');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.dispatchAuthorized,false);

const app=fs.readFileSync('src/App.tsx','utf8');
assert.ok(app.includes('installLivingWorldIntelligenceProofR196'),'R196 projector must be installed at the canonical app root');
assert.ok(app.includes('stopIntelligenceProof()'),'R196 listener must clean up');
const panel=fs.readFileSync('src/IntelligenceBridgeR195.tsx','utf8');
assert.ok(panel.includes("omega-intelligence-proof-r195"),'R195.1 must publish its bounded read-only intelligence snapshot');
assert.ok(panel.includes('never queues work'),'R195.1 event publication must remain non-executing');
const source=fs.readFileSync('src/world/livingWorldIntelligenceProofR196.js','utf8');
for(const law of ['CURRENT_HYBRID_PROOF_IS_REQUIRED_FOR_NATIVE_INTELLIGENCE_EXECUTION','TRAIN_LOCAL_AVAILABILITY_IS_NOT_TRAINED_MODEL_WEIGHT_PROOF','R141_EXACT_RETURN_PROOF_REMAINS_REQUIRED','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(source.includes(law),`missing R196 law ${law}`);
assert.ok(!source.includes('fetch('),'R196 must project existing proof rather than create parallel live probes');
console.log('R196 living-world intelligence proof invariants: PASS');

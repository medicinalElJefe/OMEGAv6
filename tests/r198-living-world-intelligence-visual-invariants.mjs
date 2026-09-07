import assert from 'node:assert/strict';
import {projectLivingWorldIntelligenceVisualR198,manifestR198} from '../src/world/livingWorldIntelligenceVisualR198.js';

const base={schema:'OMEGA_LIVING_WORLD_INTELLIGENCE_PROOF_R196_2',eventAccepted:true,worldId:'OMEGA_CANONICAL_WORLD',operationRef:'op-198',scarCount:12,intelligence:{state:'BOUNDED_PROPOSAL_ONLY',hybridOnline:false,trainerAvailable:true,hostedAvailable:true},nextAction:{route:'Hybrid Link',intent:'ACQUIRE_CURRENT_DEVICE_PROOF'}};
const held=projectLivingWorldIntelligenceVisualR198(base);
assert.equal(held.eventAccepted,true);
assert.equal(held.worldId,'OMEGA_CANONICAL_WORLD');
assert.equal(held.state,'BOUNDED_PROPOSAL_ONLY');
assert.equal(held.label,'INTELLIGENCE PROPOSAL ONLY');
assert.equal(held.route,'Hybrid Link');
assert.equal(held.intent,'ACQUIRE_CURRENT_DEVICE_PROOF');
assert.equal(held.hybridOnline,false);
assert.equal(held.trainerAvailable,true);
assert.equal(held.dispatchAuthorized,false);
assert.equal(held.canonicalMutation,false);
assert.equal(held.canonicalAdmissionAuthority,'R125');
assert.equal(held.authority.intelligenceProof,'R196.2');
assert.equal(held.authority.execution,'R146/R147');
assert.equal(held.authority.exactReturnProof,'R141');

const live=projectLivingWorldIntelligenceVisualR198({...base,intelligence:{...base.intelligence,state:'AUTHENTICATED_INTELLIGENCE_PATH_AVAILABLE',hybridOnline:true},nextAction:{route:'Convergence',intent:'ASSEMBLE_INTENT_FROM_CURRENT_WORLD'}});
assert.equal(live.label,'INTELLIGENCE PATH AVAILABLE');
assert.equal(live.hybridOnline,true);
assert.equal(live.dispatchAuthorized,false);

const ignored=projectLivingWorldIntelligenceVisualR198({...base,schema:'WRONG'});
assert.equal(ignored.eventAccepted,false);
assert.equal(ignored.dispatchAuthorized,false);
assert.equal(ignored.canonicalMutation,false);

const manifest=manifestR198();
assert.equal(manifest.inputAuthority,'R196.2');
assert.equal(manifest.visualWorldAuthority,'R175/R174');
assert.equal(manifest.executionAuthority,'R146/R147');
assert.equal(manifest.exactReturnProofAuthority,'R141');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.dispatchAuthorized,false);
assert.ok(manifest.laws.includes('VISUAL_INTELLIGENCE_STATE_IS_NOT_EXECUTION_OR_MODEL_WEIGHT_PROOF'));
console.log('R198 living-world intelligence visual invariants PASS');

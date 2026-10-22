import assert from 'node:assert/strict';
import fs from 'node:fs';
import {manifestR1901,projectLivingWorldProofMembraneR1901,R1901_EVENT} from '../src/world/livingWorldProofMembraneR1901.js';

const base={revision:'R140',canonicalMutation:false,frame:{worldId:'OMEGA_CANONICAL_WORLD',operationRef:{operationId:'op-r1901'},frame:{hybrid:{proved:false}},visualState:{lod:1728,sampleBudget:20736,truthBands:{mission:'INTENT_ASSEMBLED_NOT_EXECUTION_PROOF',earth:'UNPROVED',federation:'NONE',hybrid:'DEVICE_PROOF_REQUIRED',render:'NONE'}},events:[{scarIds:['scar-r1901'],claim:{computedPhotorealRealityProved:false}}]}};
const held=projectLivingWorldProofMembraneR1901(base);
assert.equal(held.eventAccepted,true);
assert.equal(held.worldId,'OMEGA_CANONICAL_WORLD');
assert.equal(held.adaptiveContext.lod,1728);
assert.equal(held.adaptiveContext.sampleBudget,20736);
assert.equal(held.adaptiveContext.truthInvariant,true);
assert.equal(held.scarCount,1);
assert.equal(held.proof.hybrid,'HOLD_DEVICE_PROOF_REQUIRED');
assert.equal(held.proof.earth,'HOLD_VERIFIED_EARTH_EVIDENCE_REQUIRED');
assert.equal(held.proof.federation,'HOLD_FEDERATION_RECEIPT_CHAIN_INCOMPLETE');
assert.equal(held.proof.render,'HOLD_COMPUTED_REALITY_PROOF_REQUIRED');
assert.equal(held.proof.solver,'HOLD_DIRECT_SOLVER_PROOF_REQUIRED');
assert.equal(held.proof.deployment,'HOLD_DIRECT_DEPLOYMENT_PROOF_REQUIRED');
assert.deepEqual(held.nextAction,{domain:'HYBRID',route:'Hybrid Link',intent:'ACQUIRE_CURRENT_DEVICE_PROOF',operatorConfirmationRequired:true});
assert.equal(held.dispatchAuthorized,false);
assert.equal(held.canonicalMutation,false);
assert.equal(held.canonicalAdmissionAuthority,'R125');
assert.equal(held.authority.world,'R136/R134');
assert.equal(held.authority.execution,'R146/R147');

const proved=projectLivingWorldProofMembraneR1901({...base,frame:{...base.frame,frame:{hybrid:{proved:true}},visualState:{...base.frame.visualState,truthBands:{...base.frame.visualState.truthBands,hybrid:'CURRENT_EXECUTION_PROOF',earth:'OBSERVED_EVIDENCE'}}}});
assert.equal(proved.proof.hybrid,'CURRENT_DEVICE_PROOF_PRESENT');
assert.equal(proved.proof.earth,'OBSERVED_EVIDENCE_PRESENT');
assert.equal(proved.proof.solver,'HOLD_DIRECT_SOLVER_PROOF_REQUIRED','Hybrid proof must never imply solver validity');
assert.equal(proved.proof.render,'HOLD_COMPUTED_REALITY_PROOF_REQUIRED','Hybrid/Earth proof must never imply computed photoreal reality');
assert.equal(proved.proof.deployment,'HOLD_DIRECT_DEPLOYMENT_PROOF_REQUIRED','world evidence must never imply deployment proof');
assert.equal(proved.nextAction.domain,'FEDERATION');

const rejected=projectLivingWorldProofMembraneR1901({...base,canonicalMutation:true});
assert.equal(rejected.eventAccepted,false);
assert.equal(rejected.nextAction,null);
assert.equal(rejected.dispatchAuthorized,false);

const manifest=manifestR1901();
assert.deepEqual(manifest.inputAuthorities,['R140','R173']);
assert.equal(manifest.truthProjectionAuthority,'R175');
assert.equal(manifest.visualWorldAuthority,'R136/R134');
assert.equal(manifest.executionAuthority,'R146/R147');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.dispatchAuthorized,false);
assert.equal(R1901_EVENT,'omega-living-world-current-proof-r1901');

const app=fs.readFileSync('src/App.tsx','utf8');
assert.ok(app.includes("installLivingWorldProofMembraneR1901"),'R190.1 membrane must be installed at the canonical app root');
assert.ok(app.includes('stopProofMembrane()'),'R190.1 observer must clean up without leaking listeners');
const source=fs.readFileSync('src/world/livingWorldProofMembraneR1901.js','utf8');
for(const token of ['PC_ONLINE_REQUIRES_CURRENT_HYBRID_EXECUTION_PROOF','SOLVER_VALIDITY_REQUIRES_SEPARATE_DIRECT_SOLVER_PROOF','COMPUTED_PHOTOREAL_REALITY_REQUIRES_DIRECT_RENDER_PROOF','DEPLOYMENT_REQUIRES_SEPARATE_DIRECT_DEPLOYMENT_PROOF','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(source.includes(token),`R190.1 law missing ${token}`);
assert.ok(!source.includes('fetch('),'R190.1 must not invent a parallel network evidence authority');
console.log('R190.1 LIVING WORLD PROOF MEMBRANE PASS · current proof gaps become visual/operator intent without creating evidence, dispatch, solver/deployment/photoreal claims, or CanonState mutation');

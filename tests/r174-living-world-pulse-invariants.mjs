import assert from 'node:assert/strict';
import {projectFederationWorldVisualR174,manifestR174} from '../src/world/livingWorldPulseR174.js';

const detail={
 revision:'R173',changed:true,head:'receipt-4',
 claims:{federationClosedProved:false},
 world:{
  worldId:'OMEGA_CANONICAL_WORLD',lastVerifiedStage:'QUEUE',nextRequiredStage:'SOLVE',federationClosed:false,
  visualOverlay:{stage:'QUEUE',nextStage:'SOLVE',closed:false,lod:144,sampleBudget:1728,federationTruthBand:'RETURNED_EVIDENCE_NOT_CANON'},
  stages:[{complete:true},{complete:true},{complete:true},{complete:true},{complete:false},{complete:false}],
  routingIntent:{targetFamily:'FEDERATION_SOLVE',dispatchAuthorized:false}
 }
};
const pulse=projectFederationWorldVisualR174(detail);
assert.equal(pulse.eventAccepted,true);
assert.equal(pulse.worldId,'OMEGA_CANONICAL_WORLD');
assert.equal(pulse.stage,'QUEUE');
assert.equal(pulse.nextStage,'SOLVE');
assert.equal(pulse.truthBand,'RETURNED_EVIDENCE_NOT_CANON');
assert.equal(pulse.lod,144);
assert.equal(pulse.sampleBudget,1728);
assert.equal(pulse.scarCount,4);
assert.equal(pulse.routingTarget,'FEDERATION_SOLVE');
assert.equal(pulse.dispatchAuthorized,false);
assert.equal(pulse.canonicalMutation,false);
assert.equal(pulse.canonicalAdmissionAuthority,'R125');
assert.equal(pulse.claims.publicDeploymentProved,false);
assert.equal(pulse.claims.pcOnlineProved,false);
assert.equal(pulse.claims.solverValidityProved,false);
assert.equal(pulse.claims.computedPhotorealRealityProved,false);
assert.equal(pulse.claims.currentNetworkReachabilityProved,false);
assert.equal(pulse.claims.federationClosedProved,false);

const closed=projectFederationWorldVisualR174({...detail,claims:{federationClosedProved:true},world:{...detail.world,lastVerifiedStage:'ADMIT',nextRequiredStage:null,federationClosed:true,visualOverlay:{...detail.world.visualOverlay,stage:'ADMIT',nextStage:null,closed:true}}});
assert.equal(closed.federationClosed,true);
assert.equal(closed.claims.federationClosedProved,true);
assert.equal(closed.claims.pcOnlineProved,false);
assert.equal(closed.claims.solverValidityProved,false);
assert.equal(closed.claims.computedPhotorealRealityProved,false);

const ignored=projectFederationWorldVisualR174({...detail,revision:'R172'});
assert.equal(ignored.eventAccepted,false);
assert.equal(ignored.dispatchAuthorized,false);

const manifest=manifestR174();
assert.equal(manifest.eventAuthority,'R173');
assert.equal(manifest.visualWorldAuthority,'R136/R134');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.dispatchAuthorized,false);
assert.ok(manifest.laws.includes('OPERATOR_NAVIGATION_IS_INTENT_ONLY_NOT_DISPATCH_AUTHORIZATION'));
console.log('R174 living-world pulse invariants PASS');

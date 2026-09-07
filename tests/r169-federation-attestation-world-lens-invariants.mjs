import assert from 'node:assert/strict';
import {assembleFederationAttestationWorldLensR169,manifestR169} from '../src/world/federationAttestationWorldLensR169.js';

const baseline={
 contract:'R192_SERVICE_BOUND_R1532_ATTESTED',
 expectedWorkerVersion:'worker-version-192',
 runtimeWorkerVersion:'worker-version-192',
 services:{OMEGA_V6:'omegav6',OMEGA_OPTICAL:'omega-optical-machine-r1532'},
 optical:{machineVersion:'R153.2',authority:'SCREEN_ONLY',canonicalMutation:false,adaptiveCycle:true},
 genesis:{role:'PROPOSE',mayMutateGlobalCanonState:false}
};

const unverified=await assembleFederationAttestationWorldLensR169({evidence:baseline,context:{eventTime:1,performance:{load:0.9}}});
assert.equal(unverified.ok,false);
assert.equal(unverified.attestation.state,'ATTESTED_NOT_LIVE_VERIFIED');
assert.equal(unverified.routingIntent.dispatchAuthorized,false);
assert.equal(unverified.routingIntent.federationClosed,false);
assert.equal(unverified.canonicalMutation,false);
assert.equal(unverified.canonicalAdmissionAuthority,'R125');
assert.equal(unverified.claims.publicDeploymentProved,false);
assert.equal(unverified.claims.pcOnlineProved,false);
assert.equal(unverified.claims.solverValidityProved,false);
assert.equal(unverified.claims.computedPhotorealRealityProved,false);
assert.equal(unverified.claims.federationClosedProved,false);
assert.equal(unverified.visualOverlay.action,'PROOF_REQUIRED');

const verified=await assembleFederationAttestationWorldLensR169({evidence:{...baseline,liveVerified:true},context:{eventTime:2,performance:{load:0.1}}});
assert.equal(verified.ok,true);
assert.equal(verified.attestation.state,'LIVE_VERIFIED_NOT_PROMOTED');
assert.equal(verified.visualOverlay.action,'REVIEW_RETURNED_FEDERATION_EVIDENCE');
assert.equal(verified.routingIntent.dispatchAuthorized,false);
assert.equal(verified.routingIntent.federationClosed,false);
assert.equal(verified.canonicalMutation,false);
assert.equal(verified.frame.federationState?.state,'ATTESTED_NOT_PROMOTED');
assert.ok(verified.frame.continuityOperationRef || verified.frame.operationRef || verified.frame.worldHead || verified.frame.worldId);

const mismatch=await assembleFederationAttestationWorldLensR169({evidence:{...baseline,runtimeWorkerVersion:'wrong'},context:{eventTime:3}});
assert.equal(mismatch.ok,false);
assert.equal(mismatch.attestation.state,'VERSION_MISMATCH');
assert.equal(mismatch.visualOverlay.action,'PROOF_REQUIRED');

const manifest=manifestR169();
assert.equal(manifest.attestationAuthority,'R168');
assert.equal(manifest.visualWorldAuthority,'R136/R134');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.canonicalMutation,false);

console.log('R169 FEDERATION ATTESTATION WORLD LENS PASS');

import assert from 'node:assert/strict';
import {reconcileFederationReceiptWorldR171,manifestR171,R171_STAGES} from '../src/world/federationReceiptWorldReconcilerR171.js';

const r=(stage,id,authority)=>({stage,receiptId:id,verified:true,authority,source:stage});

const partial=await reconcileFederationReceiptWorldR171({
 receipts:[r('INTENT','i1'),r('PROPOSE','p1'),r('SCREEN','s1')],
 context:{eventTime:1,performance:{load:0.95}}
});
assert.equal(partial.federationClosed,false);
assert.equal(partial.lastVerifiedStage,'SCREEN');
assert.equal(partial.nextRequiredStage,'QUEUE');
assert.equal(partial.routingIntent.dispatchAuthorized,false);
assert.equal(partial.canonicalMutation,false);
assert.equal(partial.claims.publicDeploymentProved,false);
assert.equal(partial.claims.pcOnlineProved,false);
assert.equal(partial.claims.solverValidityProved,false);
assert.equal(partial.claims.computedPhotorealRealityProved,false);
assert.equal(partial.frame.visualState.truthBands.federation,'RETURNED_EVIDENCE_NOT_CANON');
assert.ok(partial.frame.operationRef);

const gap=await reconcileFederationReceiptWorldR171({receipts:[r('INTENT','i2'),r('SCREEN','s2')]});
assert.equal(gap.lastVerifiedStage,'INTENT');
assert.equal(gap.nextRequiredStage,'PROPOSE');
assert.equal(gap.federationClosed,false);

const wrongAdmit=await reconcileFederationReceiptWorldR171({receipts:[
 r('INTENT','i3'),r('PROPOSE','p3'),r('SCREEN','s3'),r('QUEUE','q3'),r('SOLVE','v3'),r('ADMIT','a3','R124')
]});
assert.equal(wrongAdmit.lastVerifiedStage,'SOLVE');
assert.equal(wrongAdmit.nextRequiredStage,'ADMIT');
assert.equal(wrongAdmit.federationClosed,false);

const closed=await reconcileFederationReceiptWorldR171({receipts:[
 r('INTENT','i4'),r('PROPOSE','p4'),r('SCREEN','s4'),r('QUEUE','q4'),r('SOLVE','v4'),r('ADMIT','a4','R125')
],context:{eventTime:4,performance:{load:0.1}}});
assert.equal(closed.federationClosed,true);
assert.equal(closed.claims.federationClosedProved,true);
assert.equal(closed.lastVerifiedStage,'ADMIT');
assert.equal(closed.nextRequiredStage,null);
assert.equal(closed.canonicalAdmissionAuthority,'R125');
assert.equal(closed.canonicalMutation,false);
assert.ok(closed.frame.events.some(e=>e.kind==='FEDERATION_RETURN'));

const manifest=manifestR171();
assert.deepEqual(manifest.stageOrder,R171_STAGES);
assert.equal(manifest.visualWorldAuthority,'R136/R134');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.canonicalMutation,false);
console.log('R171 FEDERATION RECEIPT WORLD RECONCILER PASS');

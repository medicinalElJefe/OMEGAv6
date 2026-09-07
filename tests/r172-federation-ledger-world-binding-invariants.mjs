import assert from 'node:assert/strict';
import {reconcileFederationLedgerWorldR172,manifestR172} from '../src/world/federationLedgerWorldBindingR172.js';

const stages=['INTENT','PROPOSE','SCREEN','QUEUE','SOLVE','ADMIT'];
const ledger=[];
let prev=null;
for(const stage of stages){
 const id=`sha-${stage.toLowerCase()}`;
 ledger.push({schema:'OMEGA_FEDERATION_RECEIPT_R114',stage,previousReceiptSha256:prev,receiptSha256:id,authority:stage==='ADMIT'?'R125':stage,source:stage});
 prev=id;
}

const untrusted=await reconcileFederationLedgerWorldR172({ledger,trustedSource:false});
assert.equal(untrusted.predecessorChainValid,false);
assert.equal(untrusted.federationClosed,false);
assert.equal(untrusted.world.lastVerifiedStage,null);

const broken=structuredClone(ledger);
broken[3].previousReceiptSha256='wrong';
const held=await reconcileFederationLedgerWorldR172({ledger:broken,trustedSource:true});
assert.equal(held.predecessorChainValid,false);
assert.equal(held.federationClosed,false);
assert.equal(held.acceptedReceiptCount,0);

const trusted=await reconcileFederationLedgerWorldR172({ledger:{receipts:ledger},trustedSource:true,context:{sessionId:'focused'}});
assert.equal(trusted.predecessorChainValid,true);
assert.equal(trusted.acceptedReceiptCount,6);
assert.equal(trusted.world.lastVerifiedStage,'ADMIT');
assert.equal(trusted.federationClosed,true);
assert.equal(trusted.world.frame.visualState.truthBands.federation,'RETURNED_EVIDENCE_NOT_CANON');
assert.equal(trusted.canonicalMutation,false);
assert.equal(trusted.canonicalAdmissionAuthority,'R125');
for(const value of [trusted.claims.publicDeploymentProved,trusted.claims.pcOnlineProved,trusted.claims.solverValidityProved,trusted.claims.computedPhotorealRealityProved,trusted.claims.currentNetworkReachabilityProved])assert.equal(value,false);
const manifest=manifestR172();
assert.equal(manifest.sourceAuthority,'R114_LEDGER');
assert.equal(manifest.worldAuthority,'R171/R136/R134');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
console.log('R172 federation ledger world binding invariants PASS');

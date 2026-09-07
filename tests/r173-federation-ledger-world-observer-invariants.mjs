import assert from 'node:assert/strict';
import {pollFederationLedgerWorldR173,manifestR173} from '../src/world/federationLedgerWorldObserverR173.js';

const mk=(stage,id,prev=null,authority=null)=>({schema:'OMEGA_FEDERATION_RECEIPT_R114',stage,receiptSha256:id,previousReceiptSha256:prev,authority,source:`R114-${stage}`,payloadDigest:`digest-${id}`});
const stages=['INTENT','PROPOSE','SCREEN','QUEUE','SOLVE','ADMIT'];
let prev=null;const receipts=stages.map((stage,i)=>{const id=`receipt-${i+1}`;const r=mk(stage,id,prev,stage==='ADMIT'?'R125':stage);prev=id;return r});
const response=(body,{ok=true,status=200}={})=>({ok,status,json:async()=>body});

const first=await pollFederationLedgerWorldR173({fetchLedger:async path=>{assert.equal(path,'/api/federation/ceremony/ledger');return response({receipts})},context:{observerId:'R173-TEST'}});
assert.equal(first.observed,true);
assert.equal(first.changed,true);
assert.equal(first.head,'receipt-6');
assert.equal(first.world.predecessorChainValid,true);
assert.equal(first.world.federationClosed,true);
assert.equal(first.claims.federationClosedProved,true);
assert.equal(first.claims.publicDeploymentProved,false);
assert.equal(first.claims.pcOnlineProved,false);
assert.equal(first.claims.solverValidityProved,false);
assert.equal(first.claims.computedPhotorealRealityProved,false);
assert.equal(first.world.canonicalAdmissionAuthority,'R125');

const unchanged=await pollFederationLedgerWorldR173({fetchLedger:async()=>response({receipts}),previousHead:'receipt-6'});
assert.equal(unchanged.observed,true);
assert.equal(unchanged.changed,false);
assert.equal(unchanged.world,null);

const bad=[...receipts.map(r=>({...r}))];bad[3].previousReceiptSha256='wrong';
const rejected=await pollFederationLedgerWorldR173({fetchLedger:async()=>response({receipts:bad})});
assert.equal(rejected.changed,false);
assert.equal(rejected.error,'R172_LEDGER_REJECTED');
assert.equal(rejected.claims.federationClosedProved,false);

const httpFail=await pollFederationLedgerWorldR173({fetchLedger:async()=>response({}, {ok:false,status:503})});
assert.equal(httpFail.observed,false);
assert.equal(httpFail.error,'HTTP_503');
assert.equal(httpFail.world,null);

const empty=await pollFederationLedgerWorldR173({fetchLedger:async()=>response({receipts:[]})});
assert.equal(empty.observed,true);
assert.equal(empty.changed,false);
assert.equal(empty.head,null);

const manifest=manifestR173();
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.endpoint,'/api/federation/ceremony/ledger');
assert.ok(manifest.laws.includes('UNCHANGED_LEDGER_HEAD_DOES_NOT_REPLAY_DUPLICATE_WORLD_SCARS'));
console.log('R173 federation ledger world observer invariants PASS');

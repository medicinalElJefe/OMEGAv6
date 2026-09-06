import assert from 'node:assert/strict';
import {appendWorldEventR134,compileWorldContinuityR134,continuityOperationRefR134,manifestR134,R134_LAWS,R134_WORLD_ID} from '../src/world/canonicalWorldContinuityR134.js';

const manifest=manifestR134();
assert.equal(manifest.ok,true);
assert.equal(manifest.worldId,R134_WORLD_ID);
assert.equal(manifest.integration.canonicalAdmission,'R125');
assert.equal(manifest.persistenceAdapter.newDurableAuthorityIntroduced,false);
assert.ok(R134_LAWS.includes('APPEND_ONLY_SCAR_AND_PROOF_CHAIN'));
assert.ok(R134_LAWS.includes('R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'));
assert.ok(R134_LAWS.includes('OLD_DONORS_ARE_EVIDENCE_NOT_WHOLESALE_AUTHORITY'));

const events=[
 {eventId:'obs-1',kind:'OBSERVATION',sequence:1,eventTime:100,observerId:'observer-a',projection:'EARTH',address:1728,sourceIds:['earth-source-1'],proofIds:['earth-proof-1'],metrics:{continuity:.91,evidence:.82,uncertainty:.18,scar:.08}},
 {eventId:'mission-1',kind:'MISSION',sequence:2,eventTime:110,observerId:'observer-a',projection:'EARTH',address:1729,intentId:'intent-1',missionId:'mission-1',proofIds:['mission-plan-1'],metrics:{continuity:.9,evidence:.78,uncertainty:.22,scar:.1}},
 {eventId:'federation-1',kind:'FEDERATION_RETURN',sequence:3,eventTime:120,observerId:'observer-a',projection:'EARTH',address:1729,missionId:'mission-1',federationNode:'genesis',proofIds:['route-proof-1'],scarIds:['scar-route-1'],metrics:{continuity:.88,evidence:.8,uncertainty:.2,scar:.3}},
 {eventId:'render-1',kind:'RENDER_RECEIPT',sequence:4,eventTime:130,observerId:'observer-a',projection:'EARTH',address:1729,missionId:'mission-1',proofIds:['render-proof-1'],claim:{computedPhotorealRealityProved:false},metrics:{continuity:.9,evidence:.84,uncertainty:.16,scar:.3}}
];

const first=await compileWorldContinuityR134(events);
const replay=await compileWorldContinuityR134(events);
assert.equal(first.replayIdentity,replay.replayIdentity);
assert.equal(first.head.count,4);
assert.equal(first.head.scarCount,1);
assert.equal(first.head.proofCount,4);
assert.equal(first.head.worldId,R134_WORLD_ID);
assert.equal(first.head.proofBoundary.canonicalMutation,false);
assert.equal(first.head.proofBoundary.canonicalAdmissionAuthority,'R125');
assert.equal(first.receipts[2].authority,'CONTINUITY_EVIDENCE_NOT_CANON');
assert.equal(first.receipts[3].claim.computedPhotorealRealityProved,false);
assert.equal(first.receipts[3].canonicalMutation,false);
for(let i=1;i<first.receipts.length;i++)assert.equal(first.receipts[i].previousHead,first.receipts[i-1].eventSha256);

const admitted=await appendWorldEventR134(first.head,{eventId:'admit-1',kind:'ADMISSION_RECEIPT',sequence:5,eventTime:140,observerId:'omega-v6',projection:'PROOF',address:1729,proofIds:['r125-admission-receipt']});
assert.equal(admitted.lastEvent.authority,'R125_ADMISSION_RECEIPT_EVIDENCE');
assert.equal(admitted.lastEvent.canonicalMutation,false);
assert.equal(admitted.count,5);

const durableRef=continuityOperationRefR134(admitted);
assert.equal(durableRef.worldId,R134_WORLD_ID);
assert.equal(durableRef.headSha256,admitted.headSha256);
assert.equal(durableRef.canonicalMutation,false);
assert.equal(durableRef.authority,'DURABLE_CONTINUITY_REFERENCE_NOT_CANON');

console.log('R134 canonical world continuity: PASS');

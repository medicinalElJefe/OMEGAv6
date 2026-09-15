import assert from 'node:assert/strict';
import {
 R314_CANONICAL_FRAME,
 clockVectorR314,
 comparePacketOrderR314,
 convertUnitR314,
 createSynchronousPacketR314,
 emptyUncertaintyR314,
 packetDigestR314,
 unitR314,
 validateSynchronousPacketR314,
 type R314SynchronousPacket,
} from '../src/system/synchronousPacketR314';

const clocks=clockVectorR314({eventTime:'2026-09-13T20:00:00.000Z',receiveTime:'2026-09-13T20:00:00.125Z',monotonicMs:100,logical:7,computeStartMs:101,computeEndMs:103,validFrom:'2026-09-13T20:00:00.000Z',validUntil:'2026-09-13T20:05:00.000Z'});
const packet=createSynchronousPacketR314({
 packetId:'pkt-1',stateVersion:'state-1',sequence:1,payload:{position:12},unit:unitR314('m'),frame:R314_CANONICAL_FRAME,clocks,
 provenance:{sourceId:'fixture',sourceKind:'RETURNED',sourceVersion:'1',retrievedAt:'2026-09-13T20:00:00.125Z',hash:'abc'},
 uncertainty:emptyUncertaintyR314(),proof:{proofIds:['proof-1'],state:'EVIDENCE_BOUND',canonicalAdmission:false},scarIds:['scar-1'],
});
assert.equal(validateSynchronousPacketR314(packet).valid,true);
assert.equal(convertUnitR314(1,unitR314('km'),unitR314('m')),1000);
assert.throws(()=>convertUnitR314(1,unitR314('m'),unitR314('s')),/dimension mismatch/);
assert.equal(packetDigestR314(packet),packetDigestR314({...packet,payload:{position:12}}),'digest must be deterministic for semantically identical packets');

const next=createSynchronousPacketR314({...packet,packetId:'pkt-2',sequence:2,clocks:{...clocks,logical:8,monotonicMs:110}});
assert.ok(comparePacketOrderR314(packet,next)<0,'logical/sequence ordering must be stable');

const reversedClock={...packet,clocks:{...clocks,receiveTime:'2026-09-13T19:59:59.000Z'}} as R314SynchronousPacket;
assert.equal(validateSynchronousPacketR314(reversedClock).valid,false);
assert.ok(validateSynchronousPacketR314(reversedClock).issues.some(x=>x.code==='CLOCK_RECEIVE_BEFORE_EVENT'));

const invalidFrame={...packet,frame:{id:'LOCAL',kind:'LOCAL' as const,parentId:null,revision:'R314'}} as R314SynchronousPacket;
assert.equal(validateSynchronousPacketR314(invalidFrame).valid,false);
assert.ok(validateSynchronousPacketR314(invalidFrame).issues.some(x=>x.code==='FRAME_PARENT_MISSING'));

const canonLeak={...packet,proof:{...packet.proof,canonicalAdmission:true as false}} as R314SynchronousPacket;
assert.equal(validateSynchronousPacketR314(canonLeak).valid,false);
assert.ok(validateSynchronousPacketR314(canonLeak).issues.some(x=>x.code==='CANON_ADMISSION_LEAK'));

console.log('R314 SYNCHRONOUS PACKET PASS · units · frames · multi-clock ordering · provenance · uncertainty · no Canon admission leakage');

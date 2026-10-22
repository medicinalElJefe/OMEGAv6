import assert from 'node:assert/strict';
import {createServer} from 'vite';

const vite=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error'});
try{
 const sync=await vite.ssrLoadModule('/src/system/synchronousPacketR314.ts');
 const state=await vite.ssrLoadModule('/src/system/authoritativeStateSpineR329.ts');

 const clocks=(logical,sequence,seconds)=>sync.clockVectorR314({
  eventTime:'2026-09-19T20:00:'+String(seconds).padStart(2,'0')+'.000Z',
  receiveTime:'2026-09-19T20:00:'+String(seconds).padStart(2,'0')+'.050Z',
  monotonicMs:1000+seconds*1000,
  logical,
  computeStartMs:1001+seconds*1000,
  computeEndMs:1002+seconds*1000,
  validFrom:'2026-09-19T20:00:'+String(seconds).padStart(2,'0')+'.000Z',
  validUntil:'2026-09-19T20:05:00.000Z',
 });

 const base={
  stateVersion:'state-r329',
  unit:sync.unitR314('m'),
  frame:sync.R314_CANONICAL_FRAME,
  provenance:{sourceId:'r329-fixture',sourceKind:'RETURNED',sourceVersion:'1',retrievedAt:'2026-09-19T20:00:00.050Z',hash:'fixture'},
  uncertainty:sync.emptyUncertaintyR314(),
  proof:{proofIds:['r329-proof'],state:'EVIDENCE_BOUND',canonicalAdmission:false},
  scarIds:['r329-scar'],
 };

 const packet1=sync.createSynchronousPacketR314({...base,packetId:'r329-p1',sequence:1,payload:{x:1,y:2,z:3},clocks:clocks(1,1,0)});
 const packet2=sync.createSynchronousPacketR314({...base,packetId:'r329-p2',sequence:2,payload:{x:2,y:3,z:4},clocks:clocks(2,2,1)});
 const packet0=sync.createSynchronousPacketR314({...base,packetId:'r329-p0',sequence:0,payload:{x:0,y:1,z:2},clocks:clocks(0,0,0)});

 const serialized=state.serializeSynchronousPacketR329(packet1);
 const restored=state.deserializeSynchronousPacketR329(serialized);
 assert.equal(sync.packetDigestR314(restored),sync.packetDigestR314(packet1),'canonical round trip must preserve packet digest');
 assert.equal(Object.isFrozen(restored),true,'restored packet must be immutable');
 assert.equal(Object.isFrozen(restored.clocks),true,'restored nested packet state must be immutable');

 const spine=new state.R329AuthoritativeStateSpine('omega-canonical-writer');
 assert.equal(spine.authority().authority,'OMEGA_SINGLE_AUTHORITATIVE_STATE_WRITER');
 assert.equal(spine.authority().canonicalAdmission,false);

 const first=spine.commit({writerId:'omega-canonical-writer',expectedPreviousDigest:null,packet:packet1});
 assert.equal(first.commitIndex,1);
 assert.equal(first.previousPacketDigest,null);
 assert.equal(first.canonicalAdmission,false);
 assert.equal(Object.isFrozen(first),true);

 assert.throws(
  ()=>spine.commit({writerId:'shadow-writer',expectedPreviousDigest:first.packetDigest,packet:packet2}),
  /WRITER_NOT_AUTHORIZED/,
  'a second writer must be rejected'
 );
 assert.throws(
  ()=>spine.commit({writerId:'omega-canonical-writer',expectedPreviousDigest:'r329-stale',packet:packet2}),
  /STALE_PREVIOUS_DIGEST/,
  'stale-base write must be rejected'
 );
 assert.throws(
  ()=>spine.commit({writerId:'omega-canonical-writer',expectedPreviousDigest:first.packetDigest,packet:packet0}),
  /NON_CAUSAL_PACKET_ORDER/,
  'causally older packet must be rejected'
 );

 const second=spine.commit({writerId:'omega-canonical-writer',expectedPreviousDigest:first.packetDigest,packet:packet2});
 assert.equal(second.commitIndex,2);
 assert.equal(second.previousPacketDigest,first.packetDigest);
 assert.equal(spine.read().packet.packetId,'r329-p2');
 assert.throws(
  ()=>spine.commit({writerId:'omega-canonical-writer',expectedPreviousDigest:second.packetDigest,packet:packet2}),
  /DUPLICATE_PACKET_ID|DUPLICATE_PACKET_DIGEST/,
  'replaying an already committed packet must be rejected'
 );

 assert.equal(state.R329_B05_PROMOTION_RECEIPT.stage,'R314-B05');
 assert.equal(state.R329_B05_PROMOTION_RECEIPT.state,'PROVED');
 assert.equal(state.R329_B05_PROMOTION_RECEIPT.canonicalAdmission,false);
 assert.equal(state.R329_B05_PROMOTION_RECEIPT.directProductionMutation,false);

 console.log('R329 AUTHORITATIVE STATE SPINE PASS · canonical round-trip · immutable chain · one writer · stale-base rejection · causal order · no Canon admission');
}finally{
 await vite.close();
}

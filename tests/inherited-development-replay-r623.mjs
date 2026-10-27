import test from 'node:test';
import assert from 'node:assert/strict';
import {replayInheritedDevelopmentR623} from '../src/inheritedDevelopmentReplayR623.mjs';
const nodes=[{id:'A',continuity:0.8,scar:0.15,contradiction:0.1},{id:'B',continuity:0.2}];
const edges=[{from:'A',to:'B',kind:'INGRESS',weight:0.5},{from:'B',to:'A',kind:'RETURN',weight:0.3}];
test('canonical R653 frames feed inherited Heightened Mode without replacing state',()=>{
 const r=replayInheritedDevelopmentR623({nodes,edgeFrames:[edges,edges,edges],step:0.2,mode:'STABILIZE'});
 assert.equal(r.history.length,4);assert.equal(r.receipts.length,3);
 assert.equal(r.developmental.velocity.length,3);assert.equal(r.developmental.acceleration.length,2);assert.equal(r.developmental.jerk.length,1);
 assert.ok(r.receipts.every(x=>x.truthClass==='LOCAL_EXECUTION_ONLY'));
 assert.equal(r.proof.liveRuntimeVerified,false);
 assert.equal(r.history[0][0].scar,0.15);
 assert.deepEqual(nodes,[{id:'A',continuity:0.8,scar:0.15,contradiction:0.1},{id:'B',continuity:0.2}]);
});
test('changing projection mode leaves canonical developmental trajectory invariant',()=>{
 const stable=replayInheritedDevelopmentR623({nodes,edgeFrames:[edges,edges,edges],step:0.2,mode:'STABILIZE'});
 const explore=replayInheritedDevelopmentR623({nodes,edgeFrames:[edges,edges,edges],step:0.2,mode:'EXPLORE'});
 assert.deepEqual(stable.history,explore.history);
 assert.deepEqual(stable.developmental,explore.developmental);
 assert.notDeepEqual(stable.projections,explore.projections);
});
test('insufficient frames and malformed edges fail closed',()=>{
 assert.throws(()=>replayInheritedDevelopmentR623({nodes,edgeFrames:[edges,edges]}),/three/);
 assert.throws(()=>replayInheritedDevelopmentR623({nodes,edgeFrames:[edges,[{from:'A',to:'Z',kind:'INGRESS'}],edges]}));
});

test('initial state is snapshotted rather than aliased',()=>{
 const input=nodes.map(n=>({...n}));const r=replayInheritedDevelopmentR623({nodes:input,edgeFrames:[edges,edges,edges]});
 input[0].continuity=0;
 assert.equal(r.history[0][0].continuity,0.8);
});
test('rejects duplicate inherited identities before any frame advances',()=>{
 assert.throws(()=>replayInheritedDevelopmentR623({nodes:[nodes[0],nodes[0]],edgeFrames:[edges,edges,edges]}),/duplicate inherited identity/);
});

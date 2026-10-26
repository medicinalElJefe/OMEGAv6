import test from 'node:test';import assert from 'node:assert/strict';
import {traverseDevelopmentalContinuityR622 as run} from '../src/developmentalTraversalR622.mjs';
const frames=[1,2,3].map(amount=>({exchanges:[{kind:'EGRESS',from:'a',to:'b',amount}]}));
test('conserved developmental frames and finite velocity acceleration jerk',()=>{
 const r=run({nodes:['a','b'],initial:{a:10,b:0},frames});
 assert.deepEqual(r.timeline.map(x=>x.a),[10,9,7,4]);
 assert.deepEqual(r.velocity.map(x=>x.a),[-1,-2,-3]);
 assert.deepEqual(r.acceleration.map(x=>x.a),[-1,-1]);
 assert.deepEqual(r.jerk.map(x=>x.a),[0]);
 assert.equal(r.receipts.length,3);assert.equal(r.invariants.conservedEveryFrame,true);
});
test('observer label does not change conserved transition',()=>{
 const canonical=run({nodes:['a','b'],initial:{a:10},frames,observer:'CANONICAL'});
 const local=run({nodes:['a','b'],initial:{a:10},frames,observer:'OTHER'});
 assert.deepEqual(local.timeline,canonical.timeline);assert.equal(local.receipts[0].observer,'OTHER');
});
test('blocked and contradiction residues propagate as evidence not matter',()=>{
 const r=run({nodes:['a','b'],initial:{a:2},frames:[{exchanges:[{kind:'BLOCKED',from:'a',to:'b',amount:1},{kind:'RESIDUE',from:'a',to:'b',amount:1,residueType:'CONTRADICTION'}]}]});
 assert.equal(r.timeline[1].a,2);assert.equal(r.timeline[1].b,0);
 assert.equal(r.receipts[0].residues[0].type,'CONTRADICTION');assert.equal(r.receipts[0].blocked.length,1);
});
test('invalid dt and unfunded transfers fail closed',()=>{
 assert.throws(()=>run({nodes:['a'],initial:{a:1},frames,dt:0}),/positive/);
 assert.throws(()=>run({nodes:['a','b'],initial:{a:1},frames}),/unfunded/);
});

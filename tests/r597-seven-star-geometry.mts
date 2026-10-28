import assert from 'node:assert/strict';
import {sevenStarFrame,sevenStarAddressStep,normalizeSevenStarAngle} from '../src7/workspaces/sevenStarGeometryR597.ts';
for(const address of [0,1,143,144,1727,11498,20735]){
 for(const skew of [0,.25,.5,1]){
  for(const angle of [0,45,179,360,720,-360]){
   const frame=sevenStarFrame(address,angle,skew);
   assert.deepEqual(frame,sevenStarFrame(address,angle,skew),'deterministic replay');
   assert.equal(frame.nodes.length,7);
   assert.equal(frame.edgeLengths.length,7);
   assert.ok(frame.nodes.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.radius>0&&p.x>=0&&p.x<=420&&p.y>=0&&p.y<=420));
   assert.ok(frame.edgeLengths.every((x,i)=>x>0&&Number.isFinite(x)&&Math.abs(x-Math.hypot(frame.nodes[i].x-frame.nodes[(i+1)%7].x,frame.nodes[i].y-frame.nodes[(i+1)%7].y))<1e-9));
   assert.ok(frame.perimeter>0&&Number.isFinite(frame.perimeter));
   assert.ok(Math.abs(frame.perimeter-frame.edgeLengths.reduce((a,b)=>a+b,0))<1e-9);
   const periodic=sevenStarFrame(address,angle+360,skew);
   assert.ok(Math.abs(frame.perimeter-periodic.perimeter)<1e-8);
   for(let i=0;i<7;i++)assert.ok(Math.hypot(frame.nodes[i].x-periodic.nodes[i].x,frame.nodes[i].y-periodic.nodes[i].y)<1e-8);
  }
 }
}
assert.equal(normalizeSevenStarAngle(-360),0);
assert.equal(sevenStarAddressStep(20735,1),143);
assert.equal(sevenStarAddressStep(0,7),1008);
assert.notEqual(sevenStarFrame(0,0,1).perimeter,sevenStarFrame(143,0,1).perimeter);
assert.notEqual(sevenStarFrame(0,0,.8).perimeter,sevenStarFrame(144,0,.8).perimeter,'node traversal must change geometry');
assert.equal(sevenStarAddressStep(20735,7),1007);
for(const invalid of [0,8,-1,1.5,NaN,Infinity])assert.throws(()=>sevenStarAddressStep(0,invalid),RangeError);
assert.equal(sevenStarFrame(99999,0,0).address,20735);
assert.equal(sevenStarFrame(-1,0,0).address,0);
console.log('R597 SEVEN STAR KERNEL PASS · 7-node topology · periodicity · finite bounded geometry · canonical address wrap · deterministic perimeter');

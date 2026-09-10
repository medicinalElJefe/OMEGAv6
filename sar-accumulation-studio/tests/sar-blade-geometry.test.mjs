import test from 'node:test';
import assert from 'node:assert/strict';
import { triangleAffine, sourcePointForNode, analyzeBladeLens, reverseFocusOffset } from '../src/sar-blade-geometry.mjs';

const R=6378137,rad=Math.PI/180,lat0=32;
const lonPer10m=10/(R*Math.cos(lat0*rad)*rad),latPer20m=20/(R*rad);
const nodes=Array.from({length:3},(_,gy)=>Array.from({length:3},(_,gx)=>({
  gx,gy,pixel:gx,line:gy,lon:54+gx*lonPer10m,lat:lat0+gy*latPer20m
})));
const mesh={nodes,segments:2,sourceWindow:[0,0,3,3],validNodeCount:9,totalNodeCount:9};

test('blade triangle affine honors all three declared source-to-display vertices',()=>{
  const t=triangleAffine([[0,0],[1,0],[0,1]],[[10,20],[20,20],[10,40]]);
  assert.ok(t);
  const map=([x,y])=>[t.a*x+t.c*y+t.e,t.b*x+t.d*y+t.f];
  assert.deepEqual(map([0,0]),[10,20]);
  assert.deepEqual(map([1,0]),[20,20]);
  assert.deepEqual(map([0,1]),[10,40]);
});

test('source-window normalization maps registered edge nodes to image edges',()=>{
  assert.deepEqual(sourcePointForNode({pixel:100,line:200},[100,200,201,301],501,601),[0,0]);
  assert.deepEqual(sourcePointForNode({pixel:200,line:300},[100,200,201,301],501,601),[500,600]);
});

test('blade lens recovers local Earth metric and reverse-computes source focus',()=>{
  const target={lon:nodes[1][1].lon,lat:nodes[1][1].lat};
  const lens=analyzeBladeLens(mesh,target);
  assert.equal(lens.state,'BLADE_LENS_READY');
  assert.ok(Math.abs(lens.principalMetersPerPixel.minor-10)<0.03);
  assert.ok(Math.abs(lens.principalMetersPerPixel.major-20)<0.03);
  assert.ok(Math.abs(lens.conditionNumber-2)<0.01);
  const p=reverseFocusOffset(lens,100,0);
  assert.ok(Math.abs(p.pixel-11)<0.03);
  assert.ok(Math.abs(p.line-1)<0.03);
});

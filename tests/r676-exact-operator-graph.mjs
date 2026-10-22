import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {R676_DONOR_PROOF,R676_SCHEMA,edgesFromOperatorNodeR676,typedOperatorEdgesR676,operatorNodeR676,decodeOperatorNodeR676,operatorNodeForAddressR676,operatorDiskPointR676,collapseCanonicalFieldR676,applyOperatorR676,propagateOperatorR676} from '../src7/workspaces/operatorGraphR676.js';
const edges=[...typedOperatorEdgesR676()];
assert.equal(R676_DONOR_PROOF.nodes,1728);
assert.equal(R676_DONOR_PROOF.typedEdges,18144);
assert.equal(edges.length,18144);
const weight=x=>x===1?'1.0':String(x);
edges.sort((a,b)=>a.src-b.src||a.dst-b.dst||weight(a.weight).localeCompare(weight(b.weight))||a.type.localeCompare(b.type));
const canonical=edges.map(x=>[x.src,x.dst,weight(x.weight),x.type].join(',')).join('\n')+'\n';
assert.equal(createHash('sha256').update(canonical).digest('hex'),R676_DONOR_PROOF.canonicalSortedEdgeSha256,'entire generated topology must exactly match the source B053 GraphEdges_v9.csv multiset');
assert.equal(operatorNodeR676(0,0,0),0);
assert.equal(operatorNodeR676(11,11,11),1727);
assert.deepEqual(decodeOperatorNodeR676(144),{d:1,p:0,r:0});
assert.deepEqual(operatorNodeForAddressR676(20735),{node:1727,layer:11,address:20735});
assert.deepEqual(operatorNodeForAddressR676(144),{node:1,layer:0,address:144},'historical D/P/R operator layout permutes P/R instead of floor(address/12)');
assert.deepEqual(operatorNodeForAddressR676(12),{node:12,layer:0,address:12},'canonical regulation R=1 maps to historical operator row group v=1');
for(const n of [0,1,11,12,132,143,144,432,864,1727]){
 const e=edgesFromOperatorNodeR676(n);
 assert.ok(e.length>=8&&e.length<=11);
 for(const x of e){assert.equal(x.src,n);assert.ok(x.dst>=0&&x.dst<1728&&x.weight>0)}
}
let maxNativeDiskError=0;
for(let id=0;id<1728;id++){
 const point=operatorDiskPointR676(id);
 const u=id%12,v=Math.floor(id%144/12);
 assert.equal(point.p,u);
 assert.equal(point.r,v);
 assert.equal(point.node,id);
 const theta=2*Math.PI*u/12,rad=Math.sqrt((v+.5)/12);
 maxNativeDiskError=Math.max(maxNativeDiskError,Math.abs(point.theta-theta),Math.abs(point.radius-rad),Math.abs(point.x-rad*Math.cos(theta)),Math.abs(point.y-rad*Math.sin(theta)));
}
assert.ok(maxNativeDiskError<1e-14,'all 1728 original Nodes_v9.csv geometry positions agree with source law');
assert.throws(()=>operatorDiskPointR676(-1),/invalid/);
const basis=(at)=>{const x=new Float64Array(1728);x[at]=1;return x};
const eps=1e-7;
const pplus=applyOperatorR676(basis(1),'P_plus_011');
assert.ok(Math.abs(pplus[0]-0.36363636363636365)<eps,'historical P_plus row 0 weight = 1/2.75');
const pminus=applyOperatorR676(basis(11),'P_minus_01m1');
assert.ok(Math.abs(pminus[0]-1)<eps,'historical P_minus row 0 is backward only');
const rw=applyOperatorR676(basis(1),'P_rw');
assert.ok(Math.abs(rw[0]-1.3/4.35)<eps,'historical weighted directed adjacency row is source-exact');
for(const op of ['P_plus_011','P_minus_01m1','P_rw']){
 const ones=new Float64Array(1728).fill(1);
 const values=applyOperatorR676(ones,op);
 assert.ok(values.every(x=>Math.abs(x-1)<eps),'row-stochastic operator must preserve constant vector');
}
const f={count:20736,C:new Float32Array(20736)};
for(let d=0;d<12;d++)for(let p=0;p<12;p++)for(let r=0;r<12;r++)for(let l=0;l<12;l++)f.C[d*1728+p*144+r*12+l]=(l+1)/12;
const projected=collapseCanonicalFieldR676(f,'C');
assert.equal(projected.length,1728);
assert.ok(projected.every(v=>Math.abs(v-6.5/12)<eps),'12 distinct layers must be projected by explicit mean');
const original=Array.from(f.C.slice(0,24));
const propagated=propagateOperatorR676(basis(0),{iterations:3});
assert.equal(propagated.schema,R676_SCHEMA);
assert.equal(propagated.ledger.length,3);
assert.ok(propagated.values.every(x=>Number.isFinite(x)&&x>=0));
assert.ok(Math.abs(propagated.values.reduce((a,b)=>a+b,0)-1)<eps);
assert.deepEqual(Array.from(f.C.slice(0,24)),original,'canonical state must never mutate');
assert.deepEqual(propagated,propagateOperatorR676(basis(0),{iterations:3}),'replay must be deterministic');
assert.throws(()=>propagateOperatorR676(new Float64Array(1728)),/empty seed/);
assert.throws(()=>propagateOperatorR676(basis(0),{iterations:300}),/bounded/);
assert.throws(()=>propagateOperatorR676(basis(0),{iterations:1,alpha:0,beta:1,eta:1}),/collapsed/);
assert.throws(()=>operatorNodeForAddressR676(20736));
assert.throws(()=>applyOperatorR676(basis(0),'INVENTED'));
assert.throws(()=>collapseCanonicalFieldR676({count:20736,C:new Float32Array(24)}));
console.log('R676 exact 18,144 source graph edges SHA256 PASS; Pplus/Pminus/Prw row constants, 12-layer 20736 mapping, bounded propagation and immutable canonical source PASS');

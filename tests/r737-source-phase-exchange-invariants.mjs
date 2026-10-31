import assert from 'node:assert/strict';
import {test} from 'node:test';
import {computeSourcePhasePortraitR736} from '../src/sourcePhasePortraitR736.mjs';
import {computeSourcePhaseExchangeR737 as exchange,serializeSourcePhaseExchangeR737 as exportJSON} from '../src/sourcePhaseExchangeR737.mjs';
const N=20736;
function source(){
 const routeNext=new Uint32Array(N),C=new Float32Array(N),q=new Float32Array(N);
 for(let i=0;i<N;i++)routeNext[i]=i;
 routeNext[0]=1;routeNext[1]=2;routeNext[2]=3;routeNext[3]=1;
 C[0]=0;C[1]=0;C[2]=1;C[3]=0;
 q[0]=0;q[1]=0;q[2]=0;q[3]=1;
 return {count:N,routeNext,C,q};
}
test('R737 exact cycle geometry, winding, exchange conservation, and export',()=>{
 const p=computeSourcePhasePortraitR736(source(),0,'C','q',8);
 const e=exchange(p);
 assert.equal(e.pointCount,4);assert.equal(e.edgeCount,4);
 assert.equal(e.cycleStart,1);assert.equal(e.cyclePeriod,3);
 assert.equal(e.orientation,'COUNTERCLOCKWISE');
 assert.equal(e.signedCycleArea,0.5);
 assert.ok(Math.abs(e.cycleLength-(2+Math.SQRT2))<1e-7);
 assert.equal(e.transientLength,0);
 assert.equal(e.cycleClosureResidual,0);
 assert.equal(e.netDx,0);assert.equal(e.netDy,0);
 assert.deepEqual(e.edges.map(x=>x.phase),['TRANSIENT','CYCLE','CYCLE','CYCLE']);
 assert.ok(e.verticalReflectionMismatch>0);
 assert.ok(e.horizontalReflectionMismatch>0);
 const json=JSON.parse(exportJSON(e));
 assert.equal(json.schema,'OMEGA_SOURCE_PHASE_EXCHANGE_R737_V1');
 assert.equal(json.edges[2].fromAddress,2);
 assert.equal(json.physicalMeasurement,false);
});
test('R737 open bounded traversal does not fabricate area, cycle or symmetry',()=>{
 const e=exchange(computeSourcePhasePortraitR736(source(),0,'C','q',2));
 assert.equal(e.orientation,'OPEN');assert.equal(e.signedCycleArea,null);
 assert.equal(e.cycleClosureResidual,null);assert.equal(e.verticalReflectionMismatch,null);
 assert.equal(e.edgeCount,1);assert.equal(e.truncated,true);
});
test('R737 constant metric axes yield finite degenerate closed geometry',()=>{
 const f=source();f.C.fill(4);f.q.fill(9);
 const e=exchange(computeSourcePhasePortraitR736(f,0,'C','q',8));
 assert.equal(e.orientation,'DEGENERATE');assert.equal(e.totalLength,0);
 assert.equal(e.verticalReflectionMismatch,0);assert.equal(e.horizontalReflectionMismatch,0);
});
test('R737 rejects fabricated edge, source successor mismatch and invalid export',()=>{
 const p=computeSourcePhasePortraitR736(source(),0,'C','q',8);
 assert.throws(()=>exchange({...p,edges:p.edges.slice(1)}),/topology/);
 assert.throws(()=>exchange({...p,edges:p.edges.map((e,i)=>i===1?{...e,to:3}:e)}),/edge/);
 assert.throws(()=>exchange({...p,points:p.points.map((x,i)=>i===2?{...x,nextAddress:99}:x)}),/address mismatch/);
 assert.throws(()=>exportJSON({schema:'OTHER'}),/validated/);
});

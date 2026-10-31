import assert from 'node:assert/strict';
import {test} from 'node:test';
import {computeSourcePhasePortraitR736 as portrait} from '../src/sourcePhasePortraitR736.mjs';
const COUNT=20736;
function field(){
 const routeNext=new Uint32Array(COUNT),C=new Float32Array(COUNT),q=new Float32Array(COUNT);
 for(let i=0;i<COUNT;i++){routeNext[i]=i;C[i]=2;q[i]=7;}
 routeNext[0]=1;routeNext[1]=2;routeNext[2]=1;
 C[0]=0;C[1]=5;C[2]=10;q[0]=10;q[1]=5;q[2]=0;
 return {count:COUNT,routeNext,C,q};
}
test('R736 two-channel source values, normalization, cycle and exact closing edge',()=>{
 const p=portrait(field(),0,'C','q',8);
 assert.deepEqual(p.points.map(x=>x.address),[0,1,2]);
 assert.deepEqual(p.points.map(x=>x.xNormalized),[0,0.5,1]);
 assert.deepEqual(p.points.map(x=>x.yNormalized),[1,0.5,0]);
 assert.deepEqual(p.edges,[{from:0,to:1,cycleEdge:false},{from:1,to:2,cycleEdge:true},{from:2,to:1,cycleEdge:true}]);
 assert.equal(p.cyclePeriod,2);assert.equal(p.truncated,false);
});
test('R736 bounded route never fabricates a cycle closure',()=>{
 const p=portrait(field(),0,'C','q',2);
 assert.equal(p.truncated,true);assert.equal(p.cycleStart,null);assert.equal(p.continuationAddress,2);
 assert.deepEqual(p.edges,[{from:0,to:1,cycleEdge:false}]);
});
test('R736 constant axes remain centered and finite',()=>{
 const f=field();f.C.fill(4);f.q.fill(9);
 const p=portrait(f,0,'C','q');
 assert.ok(p.points.every(x=>x.xNormalized===0.5&&x.yNormalized===0.5));
});
test('R736 refuses same, undeclared, missing and nonfinite axes',()=>{
 const f=field();assert.throws(()=>portrait(f,0,'C','C'));
 assert.throws(()=>portrait(f,0,'unknown','q'));
 assert.throws(()=>portrait(f,0,'C','scar'));
 f.q[1]=NaN;assert.throws(()=>portrait(f,0,'C','q'));
});

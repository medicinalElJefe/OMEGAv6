import assert from 'node:assert/strict';
import {test} from 'node:test';
import {computeSourcePhasePortraitR736} from '../src/sourcePhasePortraitR736.mjs';
import {computeSourcePhaseExchangeR737,serializeSourcePhaseExchangeR737} from '../src/sourcePhaseExchangeR737.mjs';
import {verifySourceExchangeRecoveryR738 as recover} from '../src/sourceExchangeRecoveryR738.mjs';
const N=20736;
function field(){
 const routeNext=new Uint32Array(N),C=new Float32Array(N),q=new Float32Array(N);
 for(let i=0;i<N;i++)routeNext[i]=i;
 routeNext[0]=1;routeNext[1]=2;routeNext[2]=3;routeNext[3]=1;
 C[2]=1;q[3]=1;return {count:N,routeNext,C,q};
}
const exported=(f=field(),limit=8)=>serializeSourcePhaseExchangeR737(computeSourcePhaseExchangeR737(computeSourcePhasePortraitR736(f,0,'C','q',limit)));
test('R738 exact local recomputation restores source witness without mutation',()=>{
 const r=recover(exported(),field());
 assert.equal(r.verified,true);assert.equal(r.edgeCount,4);assert.equal(r.cyclePeriod,3);
 assert.equal(r.canonicalMutation,false);assert.equal(r.physicalMeasurement,false);
});
test('R738 bounded open source exchange recovery',()=>{
 const r=recover(exported(field(),2),field());
 assert.equal(r.verified,true);assert.equal(r.edgeCount,1);
});
test('R738 refuses tampering, changed source, malformed JSON and oversized payload',()=>{
 const f=field(),json=JSON.parse(exported(f));
 json.edges[0].dx=99;
 assert.throws(()=>recover(JSON.stringify(json),f),/differs/);
 const altered=field();altered.C[1]=0.5;
 assert.throws(()=>recover(exported(f),altered),/differs/);
 assert.throws(()=>recover('{',f),/invalid JSON/);
 assert.throws(()=>recover('x'.repeat(262145),f),/size refused/);
 assert.throws(()=>recover(JSON.stringify({...json,schema:'FAKE'}),f),/schema/);
});

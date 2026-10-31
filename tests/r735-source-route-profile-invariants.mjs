import assert from 'node:assert/strict';
import {test} from 'node:test';
import {computeSourceRouteProfileR735 as profile} from '../src/sourceRouteProfileR735.mjs';
const COUNT=20736;
function fixture(){const routeNext=new Uint32Array(COUNT);const C=new Float32Array(COUNT);for(let i=0;i<COUNT;i++){routeNext[i]=i;C[i]=i;}routeNext[0]=1;routeNext[1]=2;routeNext[2]=1;return {count:COUNT,routeNext,C};}
test('R735 exact route, metric, differences and cycle entry',()=>{const x=profile(fixture(),0,'C');assert.deepEqual(x.steps.map(s=>s.address),[0,1,2]);assert.deepEqual(x.steps.map(s=>s.successorDifference),[1,1,-1]);assert.equal(x.cycleStart,1);assert.equal(x.cyclePeriod,2);assert.equal(x.truncated,false);});
test('R735 bounded continuation never invents cycle',()=>{const x=profile(fixture(),0,'C',2);assert.equal(x.truncated,true);assert.equal(x.continuationAddress,2);assert.equal(x.cyclePeriod,null);});
test('R735 signed successor difference is computed',()=>{const x=profile(fixture(),0,'successorDeltaC');assert.deepEqual(x.steps.map(s=>s.value),[1,1,-1]);});
test('R735 rejects missing fields and invalid successors',()=>{const f=fixture();assert.throws(()=>profile(f,COUNT));assert.throws(()=>profile(f,0,'scar'));f.routeNext[1]=COUNT;assert.throws(()=>profile(f,0));});

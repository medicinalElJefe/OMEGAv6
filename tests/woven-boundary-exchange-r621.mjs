import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateWovenExchangeR621 as step} from '../src/wovenBoundaryExchangeR621.mjs';
test('multi-parent convergence and cycle preserve conserved stock',()=>{
 const r=step({nodes:['a','b','c'],initial:{a:5,b:3,c:0},exchanges:[
  {kind:'EGRESS',from:'a',to:'c',amount:2},
  {kind:'INGRESS',from:'b',to:'c',amount:2},
  {kind:'EGRESS',from:'c',to:'a',amount:1}
 ]});
 assert.deepEqual(r.parents.c,['a','b']);assert.equal(r.stocks.c,3);assert.equal(r.stocks.a,4);
 assert.equal(r.invariant.initialTotal,8);assert.equal(r.invariant.finalTotal,8);
});
test('blocked and typed residue are retained, not silently transferred',()=>{
 const r=step({nodes:['a','b'],initial:{a:5},exchanges:[
 {kind:'BLOCKED',from:'a',to:'b',amount:3,reason:'boundary'},
 {kind:'RESIDUE',from:'b',to:'a',amount:2,residueType:'CONTRADICTION',direction:'RETURN'}]});
 assert.equal(r.stocks.a,5);assert.equal(r.stocks.b,0);assert.equal(r.blocked[0].reason,'boundary');
 assert.equal(r.residues[0].type,'CONTRADICTION');assert.equal(r.residues[0].direction,'RETURN');
});
test('rejects unfunded transfers instead of inventing conserved material',()=>{
 assert.throws(()=>step({nodes:['a','b'],initial:{a:2},exchanges:[{kind:'EGRESS',from:'a',to:'b',amount:3}]}),/unfunded/);
});
test('does not privilege a root or mutate the caller input',()=>{
 const input={nodes:['a','b'],initial:{a:1,b:1},exchanges:[{kind:'EGRESS',from:'a',to:'b',amount:1},{kind:'INGRESS',from:'b',to:'a',amount:1}]};
 const before=JSON.stringify(input),r=step(input);
 assert.equal(JSON.stringify(input),before);assert.deepEqual(r.parents.a,['b']);assert.deepEqual(r.parents.b,['a']);
});
test('rejects invalid identities and negative transactions',()=>{
 assert.throws(()=>step({nodes:['a','a'],exchanges:[]}),/unique/);
 assert.throws(()=>step({nodes:['a'],exchanges:[{kind:'EGRESS',from:'a',to:'a',amount:-1}]}),/invalid/);
});

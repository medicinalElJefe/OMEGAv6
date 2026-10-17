import assert from 'node:assert/strict';
import {wovenInitial,wovenAdvance,wovenMass,wovenChannelLedger} from '../src7/workspaces/wovenMorphogenesisR598.ts';
import {sevenSystemGraph,type ExchangeGraph} from '../src7/workspaces/governedExchangeGraphR600.ts';
const params={width:12,height:12,seed:731,diffusion:.11,exchange:.12,binding:.1,unbinding:.04,anisotropy:.7};
const multi:ExchangeGraph={edges:[
{id:'a',from:0,to:3,rate:.1,kind:'INGRESS',enabled:true},
{id:'b',from:1,to:3,rate:.1,kind:'INGRESS',enabled:true},
{id:'c',from:2,to:3,rate:.1,kind:'INGRESS',enabled:true},
{id:'return',from:3,to:0,rate:.1,kind:'RETURN',enabled:true},
{id:'blocked',from:4,to:5,rate:.3,kind:'BLOCKED',enabled:true}
]};
const disabled:ExchangeGraph={edges:multi.edges.map(edge=>({...edge,enabled:false}))};
let a=wovenInitial(params),b=wovenInitial(params),c=wovenInitial(params);
for(let step=0;step<60;step++){
 a=wovenAdvance(a,multi);b=wovenAdvance(b,disabled);c=wovenAdvance(c,multi);
 for(const state of [a,b,c]){
  assert.ok(Math.abs(wovenMass(state)-state.initialMass)<1e-7);
  assert.ok(state.free.every(v=>Number.isFinite(v)&&v>=-1e-10));
  assert.ok(state.bound.every(v=>Number.isFinite(v)&&v>=-1e-10));
 }
}
assert.deepEqual([...a.free],[...c.free],'same graph and seed must reproduce evolution');
assert.notDeepEqual([...a.free],[...b.free],'exchange topology must change spatial outcome');
const ledger=wovenChannelLedger(a);
assert.ok(ledger.channels[3].incoming>0,'multi-parent ingress must reach fourth system');
assert.ok(ledger.channels[0].incoming>0,'return path must reach first system');
assert.equal(ledger.exchange[4*7+5],0,'blocked flow cannot be admitted');
assert.ok(Math.abs(ledger.conservationResidual)<1e-7);
let ring=wovenInitial(params);for(let t=0;t<30;t++)ring=wovenAdvance(ring,sevenSystemGraph);
assert.ok(Math.abs(wovenMass(ring)-ring.initialMass)<1e-7);
console.log('R601 COUPLED FORMATION PASS · graph controls actual spatial exchange · multi-parent + return + blocked · deterministic morphology · conserved mass');

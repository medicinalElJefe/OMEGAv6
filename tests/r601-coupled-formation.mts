import assert from 'node:assert/strict';
import {wovenInitial,wovenAdvance,wovenMass,wovenChannelLedger} from '../src7/workspaces/wovenMorphogenesisR598.ts';
import {sevenSystemGraph,type ExchangeGraph} from '../src7/workspaces/governedExchangeGraphR600.ts';
const convergence:ExchangeGraph={edges:[
{id:'a',from:0,to:3,rate:.16,kind:'INGRESS',enabled:true},
{id:'b',from:1,to:3,rate:.16,kind:'INGRESS',enabled:true},
{id:'c',from:2,to:3,rate:.16,kind:'INGRESS',enabled:true},
{id:'d',from:3,to:4,rate:.11,kind:'EGRESS',enabled:true},
{id:'e',from:4,to:0,rate:.09,kind:'RETURN',enabled:true},
{id:'f',from:5,to:6,rate:.2,kind:'BLOCKED',enabled:true}
]};
const params={width:12,height:12,seed:88,diffusion:.1,exchange:.1,binding:.1,unbinding:.03,anisotropy:.4};
let legacy=wovenInitial(params),ring=wovenInitial(params),graph=wovenInitial(params),repeat=wovenInitial(params);
const initial=wovenMass(graph);
for(let t=0;t<40;t++){
 legacy=wovenAdvance(legacy);ring=wovenAdvance(ring,sevenSystemGraph);
 graph=wovenAdvance(graph,convergence);repeat=wovenAdvance(repeat,convergence);
 for(const s of [legacy,ring,graph]){
  assert.ok(Math.abs(wovenMass(s)-initial)<1e-7);
  assert.ok(s.free.every(v=>v>=-1e-12&&Number.isFinite(v)));
  assert.ok(s.bound.every(v=>v>=-1e-12&&Number.isFinite(v)));
 }
 assert.deepEqual([...graph.free],[...repeat.free]);
 const ledger=wovenChannelLedger(graph);
 assert.ok(Math.abs(ledger.conservationResidual)<1e-7);
 for(let from=0;from<7;from++)for(let to=0;to<7;to++)if(from===5&&to===6)assert.equal(ledger.exchange[from*7+to],0);
}
assert.notDeepEqual([...legacy.free],[...graph.free],'topology must affect formation');
assert.notDeepEqual([...ring.free],[...graph.free],'multi-parent graph must differ from simple ring');
assert.ok(wovenChannelLedger(graph).channels[3].incoming>0,'convergence receiver must admit flows');
const zero={...params,exchange:0};let noFlow=wovenInitial(zero),zeroGraph=wovenInitial(zero);
for(let t=0;t<20;t++){noFlow=wovenAdvance(noFlow);zeroGraph=wovenAdvance(zeroGraph,convergence)}
assert.deepEqual([...noFlow.free],[...zeroGraph.free],'zero exchange must disable governed transfers');
const disabledGraph:ExchangeGraph={edges:convergence.edges.map(edge=>({...edge,enabled:false}))};
let off=wovenInitial(params);for(let t=0;t<40;t++)off=wovenAdvance(off,disabledGraph);
assert.notDeepEqual([...off.free],[...graph.free],'disabling edges must change the spatial executor');
console.log('R601 COUPLED FORMATION PASS · 40-step conservative graph-driven spatial formation · deterministic trajectories · blocked transfers · topology-sensitive morphology');

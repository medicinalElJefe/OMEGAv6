import assert from 'node:assert/strict';
import {applyExchangeGraph,sevenSystemNetworkMetrics,validateExchangeGraph,type ExchangeGraph} from '../src7/workspaces/governedExchangeGraphR600.ts';
const graph:ExchangeGraph={edges:[
{id:'a',from:0,to:3,rate:.9,kind:'EGRESS',enabled:true},
{id:'b',from:1,to:3,rate:.6,kind:'INGRESS',enabled:true},
{id:'c',from:2,to:3,rate:.8,kind:'INGRESS',enabled:true},
{id:'d',from:3,to:4,rate:.4,kind:'EGRESS',enabled:true},
{id:'e',from:4,to:0,rate:.2,kind:'RETURN',enabled:true},
{id:'f',from:5,to:6,rate:1,kind:'BLOCKED',enabled:true},
{id:'g',from:0,to:2,rate:.8,kind:'EGRESS',enabled:true},
{id:'h',from:0,to:1,rate:.8,kind:'EGRESS',enabled:true}
]};
validateExchangeGraph(graph);
const start=new Float64Array([1,2,3,4,5,6,7]);
const r=applyExchangeGraph(start,graph),metrics=sevenSystemNetworkMetrics(r);
assert.ok(Math.abs(r.residual)<1e-12);
assert.ok(r.next.every(v=>v>=-1e-12&&Number.isFinite(v)));
assert.equal(metrics.convergence[3].parents,3,'three independent parents must converge at system four');
assert.ok(metrics.returnFlow>0);
assert.ok(r.receipts.find(x=>x.id==='f')?.blocked===6);
assert.ok(Math.abs(r.receipts.filter(x=>x.from===0).reduce((a,b)=>a+b.admitted,0)-1)<1e-12,'oversubscribed source must be scaled');
assert.deepEqual([...applyExchangeGraph(start,graph).next],[...r.next]);
for(let k=0;k<100;k++){
 const next=applyExchangeGraph(new Float64Array(Array.from({length:7},(_,i)=>(i+1)*(k+1)/7)),graph);
 assert.ok(Math.abs(next.residual)<1e-10);
 assert.ok(next.next.every(v=>v>=-1e-10));
}
assert.throws(()=>validateExchangeGraph({edges:[graph.edges[0],graph.edges[0]]}),/duplicate/);
assert.throws(()=>applyExchangeGraph(new Float64Array([1,2,3]),graph),/inventory/);
console.log('R600 GRAPH PASS · multi-parent convergence · returning residue · blocked requests · oversubscription scaling · conservation · deterministic receipts');

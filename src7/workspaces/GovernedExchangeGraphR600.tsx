import {useMemo,useState} from 'react';
import {applyExchangeGraph,sevenSystemNetworkMetrics,type ExchangeGraph} from './governedExchangeGraphR600';
const base:ExchangeGraph={edges:[
{id:'A→D',from:0,to:3,rate:.18,kind:'EGRESS',enabled:true},
{id:'B→D',from:1,to:3,rate:.12,kind:'INGRESS',enabled:true},
{id:'C→D',from:2,to:3,rate:.16,kind:'INGRESS',enabled:true},
{id:'D→E',from:3,to:4,rate:.12,kind:'EGRESS',enabled:true},
{id:'E→A',from:4,to:0,rate:.1,kind:'RETURN',enabled:true},
{id:'F⇥G',from:5,to:6,rate:.1,kind:'BLOCKED',enabled:true},
{id:'G→B',from:6,to:1,rate:.1,kind:'EGRESS',enabled:true}
]};
export default function GovernedExchangeGraphR600(){
 const[graph,setGraph]=useState(base),[inventory,setInventory]=useState(()=>new Float64Array([1,1,1,1,1,1,1])),[step,setStep]=useState(0);
 const result=useMemo(()=>applyExchangeGraph(inventory,graph),[inventory,graph]);
 const metrics=useMemo(()=>sevenSystemNetworkMetrics(result),[result]);
 const advance=()=>{setInventory(result.next);setStep(v=>v+1)};
 const reset=()=>{setInventory(new Float64Array([1,1,1,1,1,1,1]));setStep(0)};
 return <section data-r600-governed-graph='true' aria-label='Governed Seven-System Exchange'>
 <h3>Governed Seven-System Exchange</h3>
 <p>Each of seven systems owns a conserved scalar inventory. Directed transfers support multi-parent convergence, return, and blocked exchange. This graph is an independently inspectable model, not an empirical matter mechanism.</p>
 <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={advance}>Advance exchange</button><button onClick={reset}>Reset exchange</button></div>
 <p data-r600-budget='true'>Step {step} · current total {result.totalBefore.toFixed(6)} · next-step residual {result.residual.toExponential(2)} · blocked request {metrics.blocked.toFixed(5)} · return flow {metrics.returnFlow.toFixed(5)}</p>
 <div style={{overflowX:'auto'}}><table><thead><tr><th>Channel</th><th>Inventory</th><th>Parents</th><th>Ingress</th><th>Egress</th></tr></thead><tbody>{metrics.convergence.map((m,i)=><tr key={i}><th>S{i+1}</th><td>{inventory[i].toFixed(5)}</td><td>{m.parents}</td><td>{m.incoming.toFixed(5)}</td><td>{m.outgoing.toFixed(5)}</td></tr>)}</tbody></table></div>
 <div style={{overflowX:'auto'}}><table><thead><tr><th>Exchange</th><th>Type</th><th>Enabled</th><th>Requested</th><th>Admitted</th><th>Blocked</th></tr></thead><tbody>{result.receipts.map((r,i)=><tr key={r.id}><th>{r.id}</th><td>{r.kind}</td><td><input type='checkbox' aria-label={'Enable exchange '+r.id} checked={graph.edges[i].enabled} onChange={e=>setGraph(g=>({edges:g.edges.map((edge,j)=>j===i?{...edge,enabled:e.target.checked}:edge)}))}/></td><td>{r.requested.toFixed(5)}</td><td>{r.admitted.toFixed(5)}</td><td>{r.blocked.toFixed(5)}</td></tr>)}</tbody></table></div>
 </section>;
}

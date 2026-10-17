import {useEffect,useMemo,useState} from 'react';
import GovernedExchangeGraphR600 from './GovernedExchangeGraphR600';
import {sevenSystemGraph,type ExchangeGraph} from './governedExchangeGraphR600';
import {wovenAdvance,wovenInitial,wovenObservables,wovenChannelLedger,type WovenParams} from './wovenMorphogenesisR598';
const initial:WovenParams={width:28,height:28,seed:42,diffusion:.12,exchange:.1,binding:.12,unbinding:.035,anisotropy:.5};
export default function WovenMatterLabR598(){
 const[params,setParams]=useState(initial),[state,setState]=useState(()=>wovenInitial(initial)),[playing,setPlaying]=useState(false),[graphMode,setGraphMode]=useState<'legacy'|'ring'|'convergent'>('legacy');
 const graph=useMemo<ExchangeGraph|undefined>(()=>graphMode==='legacy'?undefined:graphMode==='ring'?sevenSystemGraph:{edges:[{id:'s1-s4',from:0,to:3,rate:.12,kind:'INGRESS',enabled:true},{id:'s2-s4',from:1,to:3,rate:.12,kind:'INGRESS',enabled:true},{id:'s3-s4',from:2,to:3,rate:.12,kind:'INGRESS',enabled:true},{id:'s4-s5',from:3,to:4,rate:.12,kind:'EGRESS',enabled:true},{id:'s5-s1',from:4,to:0,rate:.08,kind:'RETURN',enabled:true},{id:'s6-s7-blocked',from:5,to:6,rate:.15,kind:'BLOCKED',enabled:true}]},[graphMode]);
 useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>setState(s=>wovenAdvance(s,graph)),110);return()=>window.clearInterval(id)},[playing,graph]);
 const observable=useMemo(()=>wovenObservables(state),[state]);
 const ledger=useMemo(()=>wovenChannelLedger(state),[state]);
 const cells=Array.from(observable.density,(v,i)=>{const ratio=Math.min(1,v/Math.max(.0001,observable.peak));const h=210-180*ratio;return <rect key={i} x={i%state.params.width} y={Math.floor(i/state.params.width)} width='1' height='1' fill={`hsl(${h} 60% ${16+60*ratio}%)`}/>});
 const tune=(name:keyof WovenParams,value:number)=>{const next={...params,[name]:value};setParams(next);setState(wovenInitial(next));setPlaying(false)};
 return <section data-r598-morphogenesis='true' aria-label='Woven Matter Formation Laboratory'>
 <h2>Woven Matter Formation Laboratory</h2>
 <p>Seven coupled conserved scalar fields with spatial transport, directed exchange, binding, unbinding and historical scar accumulation. Generated density is a simulated morphology, not physically created matter. Colors visualize density, not measured light.</p>
 <label>Exchange topology <select aria-label='Formation exchange topology' value={graphMode} onChange={e=>{setGraphMode(e.target.value as typeof graphMode);setPlaying(false);setState(wovenInitial(params))}}><option value='legacy'>Legacy cyclic baseline</option><option value='ring'>Governed seven-ring</option><option value='convergent'>Multi-parent convergence with blocked and return paths</option></select></label>
 <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
 {(['diffusion','exchange','binding','unbinding','anisotropy'] as const).map(k=><label key={k}>{k} <input aria-label={'Woven '+k} type='range' min='0' max={k==='anisotropy'?'1':'.2'} step='.005' value={params[k]} onChange={e=>tune(k,Number(e.target.value))}/>{params[k].toFixed(3)}</label>)}
 <label>Seed <input aria-label='Woven seed' type='number' min='0' max='2147483647' value={params.seed} onChange={e=>tune('seed',Number(e.target.value))}/></label>
 </div>
 <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
 <button type='button' onClick={()=>setPlaying(v=>!v)}>{playing?'Pause formation':'Play formation'}</button>
 <button type='button' onClick={()=>setState(s=>wovenAdvance(s,graph))}>Step formation</button>
 <button type='button' onClick={()=>{setPlaying(false);setState(wovenInitial(params))}}>Reset formation</button>
 </div>
 <svg role='img' aria-label='Generated scalar density morphology' viewBox={`0 0 ${state.params.width} ${state.params.height}`} style={{width:'100%',maxWidth:520,height:'auto',imageRendering:'pixelated',background:'#0a1622'}}>{cells}</svg>
 <p data-r598-conservation='true'>Step {state.step} · scalar budget {observable.mass.toFixed(8)} · residual {observable.residual.toExponential(2)} · bound fraction {(observable.boundFraction*100).toFixed(2)}% · occupied cells {observable.occupied}</p>
 <details open><summary>Seven-system exchange ledger · per-step receipts</summary>
 <div style={{overflowX:'auto'}}><table><thead><tr><th>System</th><th>Free</th><th>Bound</th><th>Ingress</th><th>Egress</th><th>Binding</th><th>Unbinding</th></tr></thead><tbody>{ledger.channels.map(c=><tr key={c.channel}><th>S{c.channel}</th><td>{c.free.toFixed(4)}</td><td>{c.bound.toFixed(4)}</td><td>{c.incoming.toFixed(4)}</td><td>{c.outgoing.toFixed(4)}</td><td>{c.binding.toFixed(4)}</td><td>{c.unbinding.toFixed(4)}</td></tr>)}</tbody></table></div>
 <p data-r599-ledger-residual='true'>Channel budget residual: {ledger.conservationResidual.toExponential(3)} · directed receipts refer to the last simulated step; spatial transport is internal to each channel.</p></details>
 <GovernedExchangeGraphR600/>
 <p>Changing an exchange parameter resets the experiment so distinct outcomes can be compared from identical seeded initial conditions. Scar memory records cumulative local binding without introducing extra mass.</p>
 </section>;
}

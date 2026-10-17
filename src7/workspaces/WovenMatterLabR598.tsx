import {useEffect,useMemo,useState} from 'react';
import GovernedExchangeGraphR600 from './GovernedExchangeGraphR600';
import {sevenSystemGraph,type ExchangeGraph} from './governedExchangeGraphR600';
import {wovenAdvance,wovenInitial,wovenObservables,wovenChannelLedger,type WovenParams} from './wovenMorphogenesisR598';
const initial:WovenParams={width:28,height:28,seed:42,diffusion:.12,exchange:.1,binding:.12,unbinding:.035,anisotropy:.5};
export default function WovenMatterLabR598(){
 const[params,setParams]=useState(initial),[state,setState]=useState(()=>wovenInitial(initial)),[playing,setPlaying]=useState(false),[graph,setGraph]=useState<ExchangeGraph>(sevenSystemGraph);
 useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>setState(s=>wovenAdvance(s,graph)),110);return()=>window.clearInterval(id)},[playing,graph]);
 const observable=useMemo(()=>wovenObservables(state),[state]);
 const ledger=useMemo(()=>wovenChannelLedger(state),[state]);
 const cells=Array.from(observable.density,(v,i)=>{const ratio=Math.min(1,v/Math.max(.0001,observable.peak));const h=210-180*ratio;return <rect key={i} x={i%state.params.width} y={Math.floor(i/state.params.width)} width='1' height='1' fill={`hsl(${h} 60% ${16+60*ratio}%)`}/>});
 const tune=(name:keyof WovenParams,value:number)=>{const next={...params,[name]:value};setParams(next);setState(wovenInitial(next));setPlaying(false)};
 return <section data-r598-morphogenesis='true' aria-label='Woven Matter Formation Laboratory'>
 <h2>Woven Matter Formation Laboratory</h2>
 <p>Seven coupled conserved scalar fields with spatial transport, directed exchange, binding, unbinding and historical scar accumulation. Generated density is a simulated morphology, not physically created matter. Colors visualize density, not measured light.</p>
 <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
 {(['diffusion','exchange','binding','unbinding','anisotropy'] as const).map(k=><label key={k}>{k} <input aria-label={'Woven '+k} type='range' min='0' max={k==='anisotropy'?'1':'.2'} step='.005' value={params[k]} onChange={e=>tune(k,Number(e.target.value))}/>{params[k].toFixed(3)}</label>)}
 <label>Seed <input aria-label='Woven seed' type='number' min='0' max='2147483647' value={params.seed} onChange={e=>tune('seed',Number(e.target.value))}/></label>
 </div>
 <details><summary>Coupled spatial exchange topology · seven-system edges</summary>
 <p>These edges govern the actual spatial simulation. Disabling an edge changes the formation dynamics; reset to compare from the same seed.</p>
 <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{graph.edges.map((edge,i)=><label key={edge.id}><input type='checkbox' aria-label={'Spatial exchange '+edge.id} checked={edge.enabled} onChange={event=>{const enabled=event.target.checked;setGraph(g=>({edges:g.edges.map((v,j)=>j===i?{...v,enabled}:v)}));setState(wovenInitial(params));setPlaying(false)}}/>S{edge.from+1} → S{edge.to+1}</label>)}</div>
 </details>
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
 <details><summary>Independent exchange graph inspector (separate inventory)</summary><GovernedExchangeGraphR600/></details>
 <p>Changing an exchange parameter resets the experiment so distinct outcomes can be compared from identical seeded initial conditions. Scar memory records cumulative local binding without introducing extra mass.</p>
 </section>;
}

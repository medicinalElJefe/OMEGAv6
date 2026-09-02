import {useMemo} from 'react';
import {corpusState} from './corpusRuntime';
import {sourceBackedModeSummary,compileSourceTraversal} from './sourceBackedModeRuntimeR21';
import {evaluateCanonAuthorityStack} from './allModesAuthority';
import {OMEGA_INFINITY_ROWS,OMEGA_INFINITY_SOURCE} from './omegaInfinityRuntime';
import './truthVisualsR93.css';

const METRICS=[
 ['CΩ','continuity'],
 ['Φ','plasticity'],
 ['q','contradiction'],
 ['Λ','burden'],
 ['scar','scar'],
 ['evidence','evidence']
] as const;
const cl=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const fmt=(n:any,d=4)=>Number.isFinite(Number(n))?Number(n).toFixed(d):'—';
const authorityRef=(id:number)=>`A${String(id).padStart(3,'0')}`;

export function CanonicalPacketTruthPlotR93({record,title='Canonical packet'}:{record:any;title?:string}){
 const previous=useMemo(()=>corpusState(Number(record?.autoPing?.previous??record?.address??0)),[record]);
 const next=useMemo(()=>corpusState(Number(record?.autoPing?.dataNext??record?.address??0)),[record]);
 return <section className='r93-truth-plot r93-packet' aria-label={title}>
  <header><div><span>DIRECT CANONICAL DATA</span><b>{title}</b></div><code>STATE {record?.stateId} · {previous.stateId} ← {record?.stateId} → {next.stateId}</code></header>
  <svg viewBox='0 0 1000 430' role='img' aria-label='Current canonical packet metrics compared with admitted next state'>
   <line x1='180' y1='42' x2='180' y2='392' className='r93-axis'/>
   <line x1='180' y1='392' x2='940' y2='392' className='r93-axis'/>
   {[0,.25,.5,.75,1].map(v=><g key={v}><line x1={180+v*740} y1='42' x2={180+v*740} y2='392' className='r93-grid'/><text x={180+v*740} y='414' textAnchor='middle'>{v.toFixed(2)}</text></g>)}
   {METRICS.map(([label,key],i)=>{const y=70+i*52,current=cl(Number(record?.metrics?.[key])),future=cl(Number(next?.metrics?.[key]));return <g key={key}>
    <text x='18' y={y+5} className='r93-label'>{label}</text>
    <rect x='180' y={y-10} width={current*740} height='14' className='r93-current'/>
    <rect x='180' y={y+9} width={future*740} height='8' className='r93-next'/>
    <text x='950' y={y+5} textAnchor='end' className='r93-value'>{fmt(current,3)} → {fmt(future,3)}</text>
   </g>})}
  </svg>
  <footer><span><i className='r93-key current'/>current packet</span><span><i className='r93-key next'/>admitted next packet</span><b>No generated geometry · no random seed · no external-observation claim</b></footer>
 </section>
}

export function ModeTruthTraceR93({address,modeId}:{address:number;modeId:string}){
 const route=useMemo(()=>compileSourceTraversal(address,72),[address]);
 const rows=useMemo(()=>route.path.map(step=>{
  const record=corpusState(step.address);
  if(modeId.startsWith('A')){
   const authority=evaluateCanonAuthorityStack(record).find(x=>authorityRef(x.id)===modeId);
   return{address:step.address,stateId:step.stateId,value:authority?.activation??null,state:authority?.state??'UNAVAILABLE',source:'DERIVED CANON AUTHORITY'};
  }
  const mode=sourceBackedModeSummary(record).rows.find(x=>x.id===modeId);
  return{address:step.address,stateId:step.stateId,value:mode?.value??null,state:mode?.state??'REGISTRY_ONLY',source:mode?.source??'NO HOSTED EVALUATOR'};
 }),[route,modeId]);
 const numeric=rows.filter(x=>Number.isFinite(Number(x.value))),values=numeric.map(x=>Number(x.value)),lo=values.length?Math.min(...values):0,hi=values.length?Math.max(...values):1,span=Math.max(1e-9,hi-lo),pts=numeric.map((x,i)=>({x:28+i/Math.max(1,numeric.length-1)*944,y:260-(Number(x.value)-lo)/span*200,row:x})),line=pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
 const first=rows[0],last=numeric.at(-1);
 return <section className='r93-truth-plot r93-mode-trace'>
  <header><div><span>ACTUAL EVALUATED TRACE</span><b>{modeId}</b></div><code>{first?.state||'—'} · {numeric.length}/{rows.length} numeric samples</code></header>
  {numeric.length>1?<svg viewBox='0 0 1000 310' role='img' aria-label={`${modeId} evaluated across the admitted canonical route`}>
   <line x1='28' y1='260' x2='972' y2='260' className='r93-axis'/>
   <line x1='28' y1='42' x2='28' y2='260' className='r93-axis'/>
   <polyline points={line} className='r93-trace-line'/>
   {pts.map((p,i)=><g key={p.row.stateId}><circle cx={p.x} cy={p.y} r={i===0?6:3.5} className='r93-trace-node'/>{i%12===0&&<text x={p.x} y={Math.max(18,p.y-10)} textAnchor='middle'>S{p.row.stateId}</text>}</g>)}
   <text x='32' y='35'>max {fmt(hi)}</text><text x='32' y='282'>min {fmt(lo)}</text>
  </svg>:<div className='r93-no-series'><b>No executable numeric route series exists for {modeId}.</b><span>The application will not fabricate a visual pattern for registry-only, gated, or nonnumeric data.</span></div>}
  <footer><span>source: {first?.source||'—'}</span><span>current {fmt(first?.value)} · last numeric {fmt(last?.value)}</span><b>vertical axis = evaluated value only</b></footer>
 </section>
}

export function InfinityTruthPlotR93({record,index}:{record:any;index:number}){
 const rows=OMEGA_INFINITY_ROWS as any[],W=1000,H=430,p=54,n=Math.max(1,rows.length-1),x=(i:number)=>p+i/n*(W-p*2),y=(v:number)=>H-p-cl(Number(v))* (H-p*2);
 const risk=rows.map((r,i)=>`${x(i).toFixed(1)},${y(Number(r.Risk)).toFixed(1)}`).join(' '),growth=rows.map((r,i)=>`${x(i).toFixed(1)},${y(Number(r.Growth)).toFixed(1)}`).join(' '),ix=x(Math.max(0,Math.min(rows.length-1,index))),liveQ=cl(Number(record?.metrics?.contradiction)),livePhi=cl(Number(record?.metrics?.plasticity));
 return <section className='r93-truth-plot r93-infinity-source'>
  <header><div><span>RECOVERED SOURCE CHANNELS + LIVE PACKET</span><b>OmegaInfinity source trace</b></div><code>{rows.length} recovered rows · STATE {record?.stateId}</code></header>
  <svg viewBox={`0 0 ${W} ${H}`} role='img' aria-label='Recovered OmegaInfinity risk and growth rows with current packet contradiction and plasticity'>
   {[0,.25,.5,.75,1].map(v=><g key={v}><line x1={p} y1={y(v)} x2={W-p} y2={y(v)} className='r93-grid'/><text x='12' y={y(v)+4}>{v.toFixed(2)}</text></g>)}
   <polyline points={risk} className='r93-risk-line'/><polyline points={growth} className='r93-growth-line'/>
   <line x1={ix} y1={p} x2={ix} y2={H-p} className='r93-selected-line'/>
   {rows.map((r,i)=>i%Math.max(1,Math.floor(rows.length/12))===0?<text key={i} x={x(i)} y={H-18} textAnchor='middle'>P{r.Phase_Idx}</text>:null)}
   <circle cx={W-p-18} cy={y(liveQ)} r='7' className='r93-live-q'/><text x={W-p-32} y={y(liveQ)-10} textAnchor='end'>live q {fmt(liveQ,3)}</text>
   <circle cx={W-p-18} cy={y(livePhi)} r='7' className='r93-live-phi'/><text x={W-p-32} y={y(livePhi)+20} textAnchor='end'>live Φ {fmt(livePhi,3)}</text>
  </svg>
  <footer><span><i className='r93-key risk'/>recovered Risk</span><span><i className='r93-key growth'/>recovered Growth</span><span>selected row {rows[index]?.id??'—'} · {OMEGA_INFINITY_SOURCE.faces[Math.max(0,Number(rows[index]?.Face_ID||1)-1)]}</span><b>Live q/Φ are packet values, not workbook observations</b></footer>
 </section>
}

export function TransitionTruthPlotR93({record,nextRecord,title='Canonical transition'}:{record:any;nextRecord:any;title?:string}){
 return <section className='r93-truth-plot r93-transition'>
  <header><div><span>PACKET → ADMITTED PACKET</span><b>{title}</b></div><code>STATE {record.stateId} → {nextRecord.stateId}</code></header>
  <div className='r93-transition-grid'>{METRICS.map(([label,key])=>{const a=Number(record.metrics[key]),b=Number(nextRecord.metrics[key]),d=b-a;return <article key={key}><span>{label}</span><b>{fmt(a,4)} → {fmt(b,4)}</b><strong data-sign={d>0?'positive':d<0?'negative':'neutral'}>{d>=0?'+':''}{fmt(d,5)}</strong><div><i style={{width:`${cl(a)*100}%`}}/><em style={{width:`${cl(b)*100}%`}}/></div></article>})}</div>
  <footer><span>All values are read from the two canonical packets.</span><b>No interpolation is presented as observation.</b></footer>
 </section>
}

export function ScaleTruthPlotR93({nodes}:{nodes:any[]}){
 const maxWeight=Math.max(1e-9,...nodes.map(n=>Number(n.weight)||0));
 return <section className='r93-truth-plot r93-scale'>
  <header><div><span>COMPILER NODE OUTPUTS</span><b>Recursive scale hierarchy</b></div><code>{nodes.length} evaluated nodes</code></header>
  <div className='r93-scale-chain'>{nodes.map((n,i)=><article key={n.scale}><code>{String(i+1).padStart(2,'0')}</code><div><b>{n.scale} · {n.name}</b><span>CΩ {fmt(n.C,3)} · Φ {fmt(n.Phi,3)} · q {fmt(n.q,3)} · Λ-share {fmt(n.burdenAllocation,3)}</span><small>{n.provenance}</small></div><strong>{fmt(n.weight,3)}</strong><i style={{width:`${cl((Number(n.weight)||0)/maxWeight)*100}%`}}/></article>)}</div>
  <footer><span>bar = compiler node weight</span><b>Derived compiler outputs only · measured-scale binding remains separately gated</b></footer>
 </section>
}

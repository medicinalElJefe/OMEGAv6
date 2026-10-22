import {useMemo,useState} from 'react';
import {BrainCircuit,ShieldCheck} from 'lucide-react';
import {compileBioAllModesFabricR281} from './bioAllModesFabricR281';
import './bioAllModesFabricR281.css';

type Props={record:any};
const polar=(r:number,a:number)=>({x:50+Math.cos(a)*r,y:50+Math.sin(a)*r});
const fmt=(n:number)=>Number.isFinite(n)?n.toFixed(3):'—';

export default function BioAllModesFabricR281({record}:Props){
 const fabric=useMemo(()=>compileBioAllModesFabricR281(record),[record]);
 const[filter,setFilter]=useState<'ALL'|'SOURCE_CATALOG'|'CANON_AUTHORITY'>('ALL');
 const visible=filter==='ALL'?fabric.channels:fabric.channels.filter(x=>x.family===filter);
 return <section className='bio281-allmodes' aria-label='All 241 Heavy Bio analytical modes'>
  <header><BrainCircuit/><div><span>R281 · COMPLETE MODE FABRIC</span><h4>241 analytical channels · 179 source catalog + 62 canon/calculus authorities</h4><p>Every established mode is visible here, including charted, gated and unproven channels. They can generate model overlays and test hypotheses, but measurement authority remains exactly zero.</p></div><strong>{fabric.total}<small>ALL MODE CHANNELS</small></strong></header>
  <div className='bio281-allmodes-grid'>
   <div className='bio281-allmodes-radar'>
    <svg viewBox='0 0 100 100' role='img' aria-label='All 241 source and canon mode channels around Heavy Bio instrument authority'>
     <circle cx='50' cy='50' r='31' className='source-ring'/><circle cx='50' cy='50' r='42' className='canon-ring'/>
     {fabric.channels.map((m,i)=>{const source=m.family==='SOURCE_CATALOG',count=source?fabric.sourceCatalogCount:fabric.canonAuthorityCount,local=source?i:i-fabric.sourceCatalogCount,a=-Math.PI/2+local*Math.PI*2/count,r=source?31:42,p1=polar(r,a),p2=polar(r+1.2+4.2*m.activation,a);return <line key={m.key} className={`mode-tick ${source?'source':'canon'} ${String(m.realization).toLowerCase()}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}/>})}
     <circle cx='50' cy='50' r='19' className='authority-core'/><text x='50' y='47.5' textAnchor='middle'>INSTRUMENT</text><text x='50' y='51' textAnchor='middle'>AUTHORITY</text><text className='zero' x='50' y='55' textAnchor='middle'>MODES = 0</text>
    </svg>
    <div className='bio281-allmodes-legend'><span><i className='source'/>179 source affinity channels</span><span><i className='canon'/>62 canon authority channels</span><span><i className='instrument'/>instrument observation authority</span></div>
   </div>
   <div className='bio281-allmodes-summary'>
    <article><span>SOURCE CATALOG</span><b>{fabric.sourceCatalogCount}</b><small>STAY {fabric.sourceSummary.stay} · TURN {fabric.sourceSummary.turn} · ESCALATE {fabric.sourceSummary.escalate}</small></article>
    <article><span>CANON AUTHORITIES</span><b>{fabric.canonAuthorityCount}</b><small>PROMOTED {fabric.canonSummary.promoted} · TESTED {fabric.canonSummary.tested} · GATED {fabric.canonSummary.gated}</small></article>
    <article><span>MEASUREMENT AUTHORITY</span><b>{fabric.measurementAuthority}</b><small>for every one of the 241 analytical channels</small></article>
    <article><span>SOURCE BOUNDARY</span><b>AFFINITY ≠ EXECUTION</b><small>179 source scores do not pretend every donor formula executed</small></article>
   </div>
  </div>
  <div className='bio281-allmodes-filters'><button className={filter==='ALL'?'active':''} onClick={()=>setFilter('ALL')}>ALL 241</button><button className={filter==='SOURCE_CATALOG'?'active':''} onClick={()=>setFilter('SOURCE_CATALOG')}>179 SOURCE</button><button className={filter==='CANON_AUTHORITY'?'active':''} onClick={()=>setFilter('CANON_AUTHORITY')}>62 CANON</button></div>
  <div className='bio281-allmodes-list'>{visible.map(m=><article key={m.key} data-family={m.family} data-realization={m.realization}><code>{m.family==='SOURCE_CATALOG'?'S':'C'}{String(m.ordinal).padStart(3,'0')}</code><div><b>{m.name}</b><small>{m.group} · {m.realization} · {m.state}</small><em>{m.calculus||m.algebra||m.operator||'mode metadata'}</em></div><strong>{fmt(m.activation)}<small>measurement authority {m.measurementAuthority}</small></strong></article>)}</div>
  <footer><ShieldCheck/><span>{fabric.truthBoundary}</span></footer>
 </section>;
}

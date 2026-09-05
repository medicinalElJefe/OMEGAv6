import {useMemo} from 'react';
import {corpusState} from './corpusRuntime';
import {compileSourceTraversal} from './sourceBackedModeRuntimeR21';
import {R105_DATA_TRUTH_BOUNDARY} from './dataFreshnessR105';
import './dataTruthNavigationR105.css';

const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const fmt=(x:any,d=3)=>Number.isFinite(Number(x))?Number(x).toFixed(d):'—';

type Row={address:number;stateId:number;continuity:number;risk:number;growth:number;evidence:number;decision:string};

export default function InfinityLiveTruthR105({record}:{record:any}){
 const rows=useMemo<Row[]>(()=>{
  const route=compileSourceTraversal(Number(record?.address??0),72);
  return route.path.map(step=>{
   const r=corpusState(step.address),m=r.metrics||{};
   return{
    address:step.address,
    stateId:r.stateId,
    continuity:cl(m.continuity),
    risk:cl((Number(m.contradiction||0)+Number(m.burden||0))/2),
    growth:cl((Number(m.plasticity||0)+Number(m.continuity||0))/2),
    evidence:cl(m.evidence),
    decision:String(m.decision||'—')
   };
  });
 },[record?.address,record?.stateId]);
 const W=1000,H=440,p=54,n=Math.max(1,rows.length-1),x=(i:number)=>p+i/n*(W-p*2),y=(v:number)=>H-p-cl(v)*(H-p*2);
 const line=(key:'continuity'|'risk'|'growth'|'evidence')=>rows.map((r,i)=>`${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(' ');
 const current=rows[0],last=rows.at(-1),labelEvery=Math.max(1,Math.floor(rows.length/8));
 return <section className='r105-live-recurrence' aria-label='Current canonical recurrence route'>
  <header><div><span>NOW · CANONICAL-DERIVED RECURRENCE</span><b>Current admitted-route field</b></div><code>{rows.length} canonical states · STATE {current?.stateId??record?.stateId}</code></header>
  <svg viewBox={`0 0 ${W} ${H}`} role='img' aria-label='Current canonical admitted-route recurrence channels; horizontal position is model-route progression, not wall-clock time'>
   {[0,.25,.5,.75,1].map(v=><g key={v}><line x1={p} y1={y(v)} x2={W-p} y2={y(v)} className='r105-grid'/><text x='12' y={y(v)+4}>{v.toFixed(2)}</text></g>)}
   <polyline points={line('continuity')} className='r105-line continuity'/>
   <polyline points={line('growth')} className='r105-line growth'/>
   <polyline points={line('risk')} className='r105-line risk'/>
   <polyline points={line('evidence')} className='r105-line evidence'/>
   {rows.map((r,i)=>i%labelEvery===0||i===rows.length-1?<g key={`${r.stateId}-${i}`}><line x1={x(i)} y1={H-p} x2={x(i)} y2={H-p+6} className='r105-tick'/><text x={x(i)} y={H-18} textAnchor='middle'>S{r.stateId}</text></g>:null)}
   {current&&<circle cx={x(0)} cy={y(current.continuity)} r='7' className='r105-current-node'/>}
  </svg>
  <footer><span><i className='continuity'/>CΩ {fmt(current?.continuity)}</span><span><i className='growth'/>growth {fmt(current?.growth)}</span><span><i className='risk'/>risk {fmt(current?.risk)}</span><span><i className='evidence'/>proof {fmt(current?.evidence)}</span><b>{current?.decision||'—'} → STATE {last?.stateId??'—'}</b></footer>
  <p className='r105-time-boundary'>Horizontal position is canonical admitted-route progression, not a clock or observation timeline. {R105_DATA_TRUTH_BOUNDARY}</p>
 </section>;
}

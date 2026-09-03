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


const metricValue=(r:any,key:string)=>cl(Number(r?.metrics?.[key]));
const polar=(cx:number,cy:number,r:number,a:number)=>({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});
const contourPoints=(r:any,cx:number,cy:number,inner:number,outer:number)=>METRICS.map(([,key],i)=>{
 const a=-Math.PI/2+i*Math.PI*2/METRICS.length,rad=inner+(outer-inner)*metricValue(r,key),p=polar(cx,cy,rad,a);return{x:p.x,y:p.y,key,value:metricValue(r,key),a,rad};
});
const contourString=(pts:any[])=>pts.map(p=>`${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
const ringSectorPath=(cx:number,cy:number,r0:number,r1:number,start:number,end:number)=>{
 const a0=polar(cx,cy,r1,start),a1=polar(cx,cy,r1,end),b1=polar(cx,cy,r0,end),b0=polar(cx,cy,r0,start),large=end-start>Math.PI?1:0;
 return `M ${a0.x} ${a0.y} A ${r1} ${r1} 0 ${large} 1 ${a1.x} ${a1.y} L ${b1.x} ${b1.y} A ${r0} ${r0} 0 ${large} 0 ${b0.x} ${b0.y} Z`;
};
const COORD_RINGS=[['D','d'],['P','p'],['R','r'],['L','l']] as const;

function CanonicalStateMandala({record,previous,next,cx=500,cy=310,scale=1}:{record:any;previous:any;next:any;cx?:number;cy?:number;scale?:number}){
 const currentPts=contourPoints(record,cx,cy,54*scale,132*scale),previousPts=contourPoints(previous,cx,cy,54*scale,132*scale),nextPts=contourPoints(next,cx,cy,54*scale,132*scale);
 const rings=COORD_RINGS.map(([label,key],ringIndex)=>({label,key,ringIndex,current:Number(record.coordinates?.[key]??0),previous:Number(previous.coordinates?.[key]??0),next:Number(next.coordinates?.[key]??0)}));
 return <g className='r95-state-mandala'>
  {[.25,.5,.75,1].map(level=><circle key={level} cx={cx} cy={cy} r={(54+(132-54)*level)*scale} className='r95-metric-shell'/>)}
  {METRICS.map(([label,key],i)=>{const a=-Math.PI/2+i*Math.PI*2/METRICS.length,p0=polar(cx,cy,48*scale,a),p1=polar(cx,cy,146*scale,a),pl=polar(cx,cy,160*scale,a);return <g key={key}><line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} className='r95-metric-axis'/><text x={pl.x} y={pl.y} textAnchor='middle' dominantBaseline='middle' className='r95-axis-label'>{label}</text></g>})}
  <polygon points={contourString(previousPts)} className='r95-contour previous'/>
  <polygon points={contourString(nextPts)} className='r95-contour next'/>
  <polygon points={contourString(currentPts)} className='r95-contour current'/>
  {currentPts.map((p,i)=><g key={p.key}><circle cx={p.x} cy={p.y} r={5.5*scale} className='r95-state-node current'/><text x={p.x} y={p.y-10*scale} textAnchor='middle' className='r95-node-value'>{fmt(p.value,3)}</text><line x1={previousPts[i].x} y1={previousPts[i].y} x2={nextPts[i].x} y2={nextPts[i].y} className='r95-channel-transition'/></g>)}
  {rings.map(({label,key,ringIndex,current,previous:pv,next:nv})=>{const r0=(178+ringIndex*24)*scale,r1=r0+15*scale,step=Math.PI*2/12,base=-Math.PI/2-step/2;return <g key={key} className='r95-coordinate-ring'>
   {Array.from({length:12},(_,i)=>{const s=base+i*step,e=s+step-.012,path=ringSectorPath(cx,cy,r0,r1,s,e),isCurrent=i===current;return <path key={i} d={path} className={isCurrent?'r95-sector current':'r95-sector'}/>})}
   {(()=>{const a=base+(pv+.5)*step,p=polar(cx,cy,r0-4*scale,a);return <circle cx={p.x} cy={p.y} r={3*scale} className='r95-coordinate-marker previous'/>})()}
   {(()=>{const a=base+(nv+.5)*step,p=polar(cx,cy,r1+5*scale,a);return <circle cx={p.x} cy={p.y} r={3.5*scale} className='r95-coordinate-marker next'/>})()}
   {(()=>{const p=polar(cx,cy,(r0+r1)/2,-Math.PI/2);return <text x={p.x} y={p.y} textAnchor='middle' dominantBaseline='middle' className='r95-ring-label'>{label}{current.toString(12).toUpperCase()}</text>})()}
  </g>})}
  <circle cx={cx} cy={cy} r={42*scale} className='r95-core'/>
  <text x={cx} y={cy-8*scale} textAnchor='middle' className='r95-core-state'>STATE {record.stateId}</text>
  <text x={cx} y={cy+10*scale} textAnchor='middle' className='r95-core-decision'>{String(record.metrics?.decision||'—')}</text>
  <text x={cx} y={cy+25*scale} textAnchor='middle' className='r95-core-address'>D{record.coordinates.d} · P{record.coordinates.p} · R{record.coordinates.r} · L{record.coordinates.l}</text>
 </g>
}

export function CanonicalPacketTruthPlotR93({record,title='Canonical packet'}:{record:any;title?:string}){
 const previous=useMemo(()=>corpusState(Number(record?.autoPing?.previous??record?.address??0)),[record]);
 const next=useMemo(()=>corpusState(Number(record?.autoPing?.dataNext??record?.address??0)),[record]);
 const tuple=(r:any)=>`D${r.coordinates.d}/P${r.coordinates.p}/R${r.coordinates.r}/L${r.coordinates.l}`;
 return <section className='r93-truth-plot r93-packet r95-canonical-manifold' aria-label={title}>
  <header><div><span>CANONICAL STATE MANIFOLD</span><b>{title}</b></div><code>{previous.stateId} ← {record.stateId} → {next.stateId}</code></header>
  <svg viewBox='0 0 1000 680' role='img' aria-label='Exact canonical packet state manifold with 12-sector D P R L address rings and six metric axes'>
   <CanonicalStateMandala record={record} previous={previous} next={next}/>
   <g className='r95-route-legend'>
    <text x='55' y='600'>PREVIOUS · {previous.stateId} · {tuple(previous)}</text>
    <text x='55' y='620'>CURRENT · {record.stateId} · {tuple(record)}</text>
    <text x='55' y='640'>ADMITTED NEXT · {next.stateId} · {tuple(next)}</text>
    <text x='945' y='600' textAnchor='end'>CΩ {fmt(record.metrics.continuity,4)} · Φ {fmt(record.metrics.plasticity,4)}</text>
    <text x='945' y='620' textAnchor='end'>q {fmt(record.metrics.contradiction,4)} · Λ {fmt(record.metrics.burden,4)}</text>
    <text x='945' y='640' textAnchor='end'>scar {fmt(record.metrics.scar,4)} · evidence {fmt(record.metrics.evidence,4)}</text>
   </g>
  </svg>
  <footer><span><i className='r93-key previous'/>previous</span><span><i className='r93-key current'/>current</span><span><i className='r93-key next'/>admitted next</span><b>Ring sectors are exact D/P/R/L coordinates · contour radii are exact normalized packet channels</b></footer>
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
 const deltas=METRICS.map(([label,key])=>({label,key,a:Number(record.metrics[key]),b:Number(nextRecord.metrics[key]),d:Number(nextRecord.metrics[key])-Number(record.metrics[key])}));
 return <section className='r93-truth-plot r93-transition r95-transition-manifold'>
  <header><div><span>EXACT STATE TRANSITION</span><b>{title}</b></div><code>STATE {record.stateId} → {nextRecord.stateId}</code></header>
  <svg viewBox='0 0 1000 680' role='img' aria-label='Current and admitted-next canonical state manifolds with exact metric deltas'>
   <CanonicalStateMandala record={record} previous={record} next={nextRecord}/>
   <g className='r95-delta-ledger'>
    {deltas.map((x,i)=><g key={x.key} transform={`translate(${720},${110+i*70})`}>
      <text x='0' y='0' className='r95-delta-label'>{x.label}</text>
      <text x='0' y='22' className='r95-delta-values'>{fmt(x.a,4)} → {fmt(x.b,4)}</text>
      <text x='0' y='43' className={x.d>0?'r95-delta-positive':x.d<0?'r95-delta-negative':'r95-delta-neutral'}>{x.d>=0?'+':''}{fmt(x.d,5)}</text>
     </g>)}
   </g>
  </svg>
  <footer><span>Current and admitted-next packets share the same six named axes.</span><b>Delta values are exact packet subtraction · no interpolation or chart bars.</b></footer>
 </section>
}

export function ScaleTruthPlotR93({nodes}:{nodes:any[]}){
 const count=Math.max(1,nodes.length),cx=500,cy=330,ringStep=210/Math.max(1,count-1);
 return <section className='r93-truth-plot r93-scale r95-scale-manifold'>
  <header><div><span>COMPILER NODE MANIFOLD</span><b>Recursive scale hierarchy</b></div><code>{nodes.length} evaluated nodes</code></header>
  <svg viewBox='0 0 1000 680' role='img' aria-label='Recursive compiler nodes mapped as concentric evaluated scale states'>
   {nodes.map((n,i)=>{const r=70+i*ringStep,a=-Math.PI/2+Number(n.Phi||0)*Math.PI*2,p=polar(cx,cy,r,a),weight=cl(Number(n.weight)||0),C=cl(Number(n.C)||0),q=cl(Number(n.q)||0);return <g key={n.scale} className='r95-scale-node'>
    <circle cx={cx} cy={cy} r={r} className='r95-scale-ring'/>
    <line x1={cx} y1={cy} x2={p.x} y2={p.y} className='r95-scale-spoke'/>
    <circle cx={p.x} cy={p.y} r={6+10*weight} className='r95-scale-point'/>
    <circle cx={p.x} cy={p.y} r={12+18*C} className='r95-scale-coherence'/>
    <text x={p.x} y={p.y-22} textAnchor='middle' className='r95-scale-label'>{n.scale}</text>
    <text x={p.x} y={p.y+30} textAnchor='middle' className='r95-scale-value'>w {fmt(weight,3)} · CΩ {fmt(C,3)} · q {fmt(q,3)}</text>
   </g>})}
   <circle cx={cx} cy={cy} r='48' className='r95-core'/>
   <text x={cx} y={cy-4} textAnchor='middle' className='r95-core-state'>SCALE</text>
   <text x={cx} y={cy+14} textAnchor='middle' className='r95-core-address'>{nodes.length} NODES</text>
  </svg>
  <div className='r95-scale-ledger'>{nodes.map((n,i)=><article key={n.scale}><code>{String(i+1).padStart(2,'0')}</code><div><b>{n.scale} · {n.name}</b><span>CΩ {fmt(n.C,3)} · Φ {fmt(n.Phi,3)} · q {fmt(n.q,3)} · Λ-share {fmt(n.burdenAllocation,3)} · weight {fmt(n.weight,3)}</span><small>{n.provenance}</small></div></article>)}</div>
  <footer><span>radius = hierarchy order · angle = Φ · point radius = evaluated weight · halo radius = CΩ</span><b>Derived compiler outputs only · measured-scale binding remains separately gated</b></footer>
 </section>
}

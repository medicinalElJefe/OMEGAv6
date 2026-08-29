import {useMemo} from 'react';
import {Activity,ArrowRight,Orbit,ShieldCheck} from 'lucide-react';
import {corpusState,decodeAddress} from './corpusRuntime';
import {unifiedFromRecord} from './unifiedCalculus';
import './phaseWheel.css';

export const OMEGA_PHASES=['Initiation','Acceleration','Expansion','Momentum','Saturation','Constraint Engagement','Deceleration','Redistribution','Compression','Pre-turn Tension','Turn-Reorientation','Integration'] as const;

type Props={address:number;onSelectAddress?:(address:number)=>void;compact?:boolean;title?:string};
const clamp=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const fmt=(x:any,d=3)=>Number.isFinite(Number(x))?Number(x).toFixed(d):'—';

export default function PhaseWheel({address,onSelectAddress,compact=false,title='12-phase living field'}:Props){
  const coords=useMemo(()=>decodeAddress(address),[address]);
  const current=useMemo(()=>corpusState(address),[address]);
  const unified=useMemo(()=>unifiedFromRecord(current),[current]);
  const nodes=useMemo(()=>OMEGA_PHASES.map((name,p)=>{
    const a=1728*coords.d+144*p+12*coords.r+coords.l;
    const record=corpusState(a);
    const u=unifiedFromRecord(record);
    return {name,p,address:a,record,u};
  }),[coords.d,coords.r,coords.l]);
  const nextAddress=current.autoPing?.dataNext??address;
  const nextCoords=decodeAddress(nextAddress);
  const currentPhase=coords.p;
  const cx=300,cy=300,R=220;
  const polygon=nodes.map((n,i)=>{const a=-Math.PI/2+i*Math.PI*2/12,r=72+132*clamp(n.u.unifiedCoherence);return `${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`}).join(' ');
  const currentNode=nodes[currentPhase];
  return <section className={compact?'phase-wheel compact':'phase-wheel'} data-phase={currentPhase+1}>
    <header><div><span><Orbit size={13}/> PHASE AWARENESS · SOURCE-BOUND</span><h3>{title}</h3><p>One canonical packet viewed through twelve phase positions. Selecting a phase changes the real OMEGA address; it is not a decorative filter.</p></div><div className='phase-now'><b>{String(currentPhase+1).padStart(2,'0')}</b><span>{currentNode.name}</span><small>{current.metrics.decision}</small></div></header>
    <div className='phase-body'>
      <div className='phase-svg-wrap'>
        <svg viewBox='0 0 600 600' role='img' aria-label={`OMEGA twelve phase wheel. Current phase ${currentPhase+1} ${currentNode.name}`}>
          <defs><radialGradient id='pwCore'><stop offset='0' stopColor='#dffcf6' stopOpacity='.88'/><stop offset='.25' stopColor='#5ee7d1' stopOpacity='.24'/><stop offset='1' stopColor='#5ee7d1' stopOpacity='0'/></radialGradient></defs>
          <circle className='pw-halo' cx={cx} cy={cy} r='260'/><circle className='pw-ring' cx={cx} cy={cy} r={R}/><circle className='pw-ring inner' cx={cx} cy={cy} r='150'/>
          {nodes.map((n,i)=>{const a=-Math.PI/2+i*Math.PI*2/12,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;return <line key={'s'+i} className={i===currentPhase?'pw-spoke active':'pw-spoke'} x1={cx} y1={cy} x2={x} y2={y}/>})}
          <polygon className='pw-coherence-shape' points={polygon}/>
          {nodes.map((n,i)=>{const a=-Math.PI/2+i*Math.PI*2/12,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R,isCurrent=i===currentPhase,isNext=i===nextCoords.p;return <g key={n.name} className={`pw-node ${isCurrent?'current ':''}${isNext?'next':''}`} onClick={()=>onSelectAddress?.(n.address)} role={onSelectAddress?'button':undefined} tabIndex={onSelectAddress?0:undefined} onKeyDown={e=>{if(onSelectAddress&&(e.key==='Enter'||e.key===' '))onSelectAddress(n.address)}} aria-label={`${i+1} ${n.name}, ${n.record.metrics.decision}, coherence ${fmt(n.u.unifiedCoherence)}`}><circle cx={x} cy={y} r={isCurrent?18:12}/><circle className='pw-node-evidence' cx={x} cy={y} r={18+12*clamp(n.record.metrics.evidence)}/><text x={x} y={y+4} textAnchor='middle'>{i+1}</text></g>})}
          <circle cx={cx} cy={cy} r='92' fill='url(#pwCore)'/><circle className='pw-core' cx={cx} cy={cy} r='15'/><text className='pw-core-label' x={cx} y={cy-28} textAnchor='middle'>STATE {current.stateId.toLocaleString()}</text><text className='pw-core-value' x={cx} y={cy+42} textAnchor='middle'>CΩ {fmt(current.metrics.continuity)} · Φ {fmt(current.metrics.plasticity)}</text>
        </svg>
        <div className='phase-route'><span>CURRENT</span><b>{currentPhase+1} · {currentNode.name}</b><ArrowRight/><span>ROUTE</span><b>{nextCoords.p+1} · {OMEGA_PHASES[nextCoords.p]}</b></div>
      </div>
      <div className='phase-readout'>
        <div><span>CΩ continuity</span><b>{fmt(current.metrics.continuity)}</b><i style={{'--v':clamp(current.metrics.continuity)} as React.CSSProperties}/></div>
        <div><span>Φ future plasticity</span><b>{fmt(current.metrics.plasticity)}</b><i style={{'--v':clamp(current.metrics.plasticity)} as React.CSSProperties}/></div>
        <div><span>q contradiction</span><b>{fmt(current.metrics.contradiction)}</b><i style={{'--v':clamp(current.metrics.contradiction)} as React.CSSProperties}/></div>
        <div><span>Λ burden</span><b>{fmt(current.metrics.burden)}</b><i style={{'--v':clamp(current.metrics.burden)} as React.CSSProperties}/></div>
        <div><span>Scar memory</span><b>{fmt(current.metrics.scar)}</b><i style={{'--v':clamp(current.metrics.scar)} as React.CSSProperties}/></div>
        <div><span>Unified coherence</span><b>{fmt(unified.unifiedCoherence)}</b><i style={{'--v':clamp(unified.unifiedCoherence)} as React.CSSProperties}/></div>
        <footer><ShieldCheck size={14}/><span>Phase position is derived from the canonical D/P/R/L address. Animation expresses model timing only; it does not claim an external physical clock or observation.</span></footer>
      </div>
    </div>
  </section>
}

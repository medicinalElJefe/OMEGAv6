import {useMemo,useState} from 'react';
import {Activity,ArrowRight,Boxes,Compass,GitBranch,Layers3,Move3d,ShieldCheck,Waypoints} from 'lucide-react';
import {R183_COLOR_LAW,R183_SCALE_HORIZONS,type VisualAtlasLensR183,type VisualAtlasPacketR183} from './visualAtlasR183';
import './visualAtlasR183.css';

const TABS:VisualAtlasLensR183[]=['FIELD','WEAVE','MOTION','MODES','SCALE','PROOF','DUALVERSE'];
const f=(v:number,d=3)=>Number.isFinite(v)?v.toFixed(d):'—';
const pct=(v:number)=>`${Math.round(Math.max(0,Math.min(1,v))*100)}%`;
const signed=(v:number,d=3)=>`${v>=0?'+':''}${f(v,d)}`;
function poly(values:number[],w=520,h=150){if(!values.length)return'';const min=Math.min(...values),max=Math.max(...values),span=max-min||1;return values.map((v,i)=>`${(i/(Math.max(1,values.length-1))*w).toFixed(1)},${(h-(v-min)/span*h).toFixed(1)}`).join(' ')}
function ringPath(cx:number,cy:number,r:number,jag:number,segments=72){const pts=[];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,noise=(Math.sin(a*5.0)+.55*Math.sin(a*11.0))*jag*r*.035,rr=r+noise;pts.push(`${(cx+Math.cos(a)*rr).toFixed(2)},${(cy+Math.sin(a)*rr).toFixed(2)}`)}return pts.join(' ')}

export default function VisualAtlasR183({packet,onSelectAddress}:{packet:VisualAtlasPacketR183;onSelectAddress:(address:number)=>void}){
 const[tab,setTab]=useState<VisualAtlasLensR183>('FIELD'),[modeFilter,setModeFilter]=useState<'ALL'|'STAY'|'TURN'|'ESCALATE'>('ALL'),[selectedMode,setSelectedMode]=useState(packet.modeSummary.strongest.id);
 const routeSeries=useMemo(()=>({continuity:packet.route.map(x=>x.continuity),plasticity:packet.route.map(x=>x.plasticity),contradiction:packet.route.map(x=>x.contradiction),burden:packet.route.map(x=>x.burden),motion:packet.route.map(x=>x.motion),velocity:packet.route.map(x=>x.velocity)}),[packet]);
 const ringRadius=42+packet.encoding.radius*88,densityCount=Math.max(8,Math.round(12+packet.encoding.lineDensity*42)),haloCount=Math.max(8,Math.round(12+packet.encoding.haloCount*36));
 const neighborBy=(axis:string,sign:number)=>packet.neighbors.find(x=>x.axis===axis&&x.sign===sign),deltaRows=[['CΩ continuity',packet.deltas.continuity],['Φ plasticity',packet.deltas.plasticity],['q contradiction',packet.deltas.contradiction],['Λ burden',packet.deltas.burden],['scar',packet.deltas.scar],['motion',packet.deltas.motion],['velocity',packet.deltas.velocity],['ΔΦ',packet.deltas.phase]] as const;
 const visibleModes=packet.modes.filter(x=>modeFilter==='ALL'||x.gate===modeFilter),modeDetail=packet.modes.find(x=>x.id===selectedMode)||packet.modes[0];
 return <section className='visual-atlas-r183'>
  <header className='va183-head'><div><span>LIVE VISUAL ATLAS · R183 · RECOVERED CHARTING CANON</span><h3>State {packet.stateId} → {packet.targetStateId}</h3><small>D{packet.coordinates.d+1} · P{packet.coordinates.p+1} · R{packet.coordinates.r+1} · L{packet.coordinates.l+1} · {packet.decision}</small></div><div className='va183-truth'><ShieldCheck/><b>PACKET / ROUTE BOUND</b><small>No ambient geometry motion.</small></div></header>
  <nav className='va183-tabs'>{TABS.map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}</button>)}</nav>
  <div className='va183-grid'>
   <section className='va183-stage'>
    {tab==='FIELD'&&<>
     <div className='va183-title'><Layers3/><span><b>Field membrane</b><small>Continuity controls radius; burden/contradiction control density and breakage; plasticity opens the field; proof sharpens its edge.</small></span></div>
     <svg viewBox='0 0 520 360' className='va183-glyph' role='img' aria-label='R183 field membrane encoding of the current OMEGA packet'>
      <defs><radialGradient id='va183core'><stop offset='0%' stopColor='rgba(226,187,104,.92)'/><stop offset='55%' stopColor='rgba(70,196,174,.18)'/><stop offset='100%' stopColor='rgba(2,8,12,0)'/></radialGradient></defs>
      <circle cx='260' cy='180' r={ringRadius+34*packet.encoding.openSpace} fill='url(#va183core)' opacity={.35+.45*packet.encoding.carrierGlow}/>
      {[0,1,2,3].map(i=><polyline key={i} points={ringPath(260,180,ringRadius+i*13,packet.encoding.jaggedness)} className={`va183-ring ring-${i}`} opacity={.28+.13*i+.32*packet.channels.proof}/>) }
      {Array.from({length:densityCount},(_,i)=>{const a=(i/densityCount)*Math.PI*2,r=ringRadius*(.54+.42*((i%7)/7)),q=packet.encoding.compression;return <line key={i} x1={260+Math.cos(a)*r*.38} y1={180+Math.sin(a)*r*.38} x2={260+Math.cos(a+.12*q)*r} y2={180+Math.sin(a+.12*q)*r} className='va183-density' opacity={.05+.20*packet.encoding.lineDensity}/>})}
      {Array.from({length:haloCount},(_,i)=>{const a=(i/haloCount)*Math.PI*2,r=ringRadius+25+16*Math.sin(i*.7);return <circle key={i} cx={260+Math.cos(a)*r} cy={180+Math.sin(a)*r} r={1.2+3.4*packet.encoding.proofEdge} className='va183-halo' opacity={.12+.52*packet.channels.plasticity}/>})}
      <circle cx='260' cy='180' r={8+18*packet.encoding.scarKnot} className='va183-scar-knot'/><circle cx='260' cy='180' r='4' className='va183-core'/><path d={`M260 180 L${260+packet.orientation.tangent.x*85} ${180-packet.orientation.tangent.y*85}`} className='va183-forward'/>
      <text x='16' y='26'>CΩ {f(packet.channels.continuity)} · Φ {f(packet.channels.plasticity)} · q {f(packet.channels.contradiction)} · Λ {f(packet.channels.burden)}</text><text x='16' y='344'>radius {pct(packet.encoding.radius)} · density {pct(packet.encoding.lineDensity)} · open {pct(packet.encoding.openSpace)} · scar knot {pct(packet.encoding.scarKnot)}</text>
     </svg>
    </>}
    {tab==='WEAVE'&&<>
     <div className='va183-title'><Waypoints/><span><b>Woven continuity</b><small>Eight D/P/R/L structural neighbors surround the current packet; route carry remains distinct from residual/scar pressure.</small></span></div>
     <div className='va183-neighbor-map'>{(['D','P','R','L'] as const).map((axis,i)=>{const plus=neighborBy(axis,1),minus=neighborBy(axis,-1);return <div key={axis} className={`axis axis-${i}`}><button onClick={()=>plus&&onSelectAddress(plus.address)}><span>{axis}+</span><b>S{plus?.stateId}</b><small>CΩ {f(plus?.continuity??0)} · Λ {f(plus?.burden??0)}</small></button><div><b>{axis}</b><small>current frame</small></div><button onClick={()=>minus&&onSelectAddress(minus.address)}><span>{axis}−</span><b>S{minus?.stateId}</b><small>Φ {f(minus?.plasticity??0)} · q {f(minus?.contradiction??0)}</small></button></div>})}</div>
     <div className='va183-weave-ledger'><article><span>Invariant support</span><b>{pct(packet.channels.gate)}</b><small>CΩ/(1+Λ+q)</small></article><article><span>Carry</span><b>{pct(packet.channels.carry)}</b><small>retained lawful transport</small></article><article><span>Residual / scar</span><b>{pct(packet.channels.scar)}</b><small>history stays visible</small></article><article><span>Orientation</span><b>σ {packet.orientation.sigma>0?'+1':packet.orientation.sigma<0?'-1':'0'}</b><small>{packet.orientation.labels.turn}</small></article></div>
    </>}
    {tab==='MOTION'&&<>
     <div className='va183-title'><Activity/><span><b>Route dynamics</b><small>Twenty-four canonical route states. Lines are state-derived series, not simulated physical time.</small></span></div>
     <div className='va183-chart'><svg viewBox='0 0 520 170' role='img' aria-label='Route continuity plasticity contradiction burden and motion series'><polyline points={poly(routeSeries.continuity)} className='series continuity'/><polyline points={poly(routeSeries.plasticity)} className='series plasticity'/><polyline points={poly(routeSeries.contradiction)} className='series contradiction'/><polyline points={poly(routeSeries.burden)} className='series burden'/><polyline points={poly(routeSeries.motion)} className='series motion'/></svg><div className='va183-chart-legend'><span className='continuity'>CΩ</span><span className='plasticity'>Φ</span><span className='contradiction'>q</span><span className='burden'>Λ</span><span className='motion'>motion</span></div></div>
     <div className='va183-route-strip'>{packet.route.map(x=><button key={`${x.step}-${x.address}`} className={x.step===0?'active':''} onClick={()=>onSelectAddress(x.address)} title={`State ${x.stateId} · ${x.decision}`}><span>{x.step}</span><i style={{height:`${18+42*x.continuity}px`}}/><b>S{x.stateId}</b></button>)}</div>
     <div className='va183-deltas'>{deltaRows.map(([name,v])=><div key={name}><span>{name}</span><b className={v>0?'up':v<0?'down':'flat'}>{signed(v)}</b><i><em style={{width:`${Math.min(100,Math.abs(v)*220)}%`}}/></i></div>)}</div>
    </>}
    {tab==='MODES'&&<>
     <div className='va183-title'><GitBranch/><span><b>Full current mode matrix</b><small>All {packet.modeSummary.count} evaluated runtime modes are charted from this same selected packet. This replaces the old 24-mode poster limit without discarding its logic.</small></span></div>
     <div className='va183-mode-summary'><article><span>STAY</span><b>{packet.modeSummary.stay}</b></article><article><span>TURN</span><b>{packet.modeSummary.turn}</b></article><article><span>ESCALATE</span><b>{packet.modeSummary.escalate}</b></article><article><span>STRONGEST</span><b>{packet.modeSummary.strongest.name}</b><small>{f(packet.modeSummary.strongest.score)}</small></article><article><span>WEAKEST</span><b>{packet.modeSummary.weakest.name}</b><small>{f(packet.modeSummary.weakest.score)}</small></article></div>
     <div className='va183-mode-filters'>{(['ALL','STAY','TURN','ESCALATE'] as const).map(x=><button key={x} className={modeFilter===x?'active':''} onClick={()=>setModeFilter(x)}>{x} {x==='ALL'?packet.modeSummary.count:x==='STAY'?packet.modeSummary.stay:x==='TURN'?packet.modeSummary.turn:packet.modeSummary.escalate}</button>)}</div>
     <div className='va183-mode-matrix'>{visibleModes.map(m=><button key={m.id} className={`${m.gate.toLowerCase()} ${selectedMode===m.id?'selected':''}`} onClick={()=>setSelectedMode(m.id)} title={`${m.name} · ${m.category} · ${m.dimensionFrame}`}><span>{m.id}</span><b>{m.name}</b><i><em style={{width:`${pct(m.score)}`}}/></i><small>{m.gate} · {f(m.score)}</small></button>)}</div>
     {modeDetail&&<div className='va183-mode-detail'><span>{modeDetail.id} · {modeDetail.category} · {modeDetail.dimensionFrame}</span><b>{modeDetail.name}</b><p>{modeDetail.purpose}</p><code>{modeDetail.operator}</code></div>}
    </>}
    {tab==='SCALE'&&<>
     <div className='va183-title'><Boxes/><span><b>Recursive scale / address resolution</b><small>These are atlas and render resolution roles. They do not claim literal physical dimensions.</small></span></div>
     <div className='va183-scale-ladder'>{R183_SCALE_HORIZONS.map((s,i)=><article key={s.id} className={s.count===20736||s.count===248832?'active':''}><span>{i+1}</span><div><b>{s.label}</b><small>{s.role}</small></div><em style={{width:`${18+82*(Math.log(s.count)/Math.log(35831808))}%`}}/></article>)}</div>
     <div className='va183-scale-address'><div><span>D</span><b>{packet.coordinates.d+1}</b></div><div><span>P</span><b>{packet.coordinates.p+1}</b></div><div><span>R</span><b>{packet.coordinates.r+1}</b></div><div><span>L</span><b>{packet.coordinates.l+1}</b></div><ArrowRight/><strong>S{packet.stateId}</strong></div>
     <div className='va183-render-expansion'><header><b>248,832 render-facet expansion</b><small>{packet.renderExpansion.fullFieldFacetCount.toLocaleString()} = 20,736 × {packet.renderExpansion.facetsPerState}. One source state remains one Canon address; the 12 facets are declared visual channels.</small></header><div>{packet.renderExpansion.facets.map(x=><article key={x.id} className={x.polarity.toLowerCase()}><span>{x.id}</span><b>{x.label}</b><i><em style={{width:pct(x.value)}}/></i><small>{pct(x.value)}</small></article>)}</div><p>{packet.renderExpansion.truth}</p></div>
    </>}
    {tab==='PROOF'&&<>
     <div className='va183-title'><ShieldCheck/><span><b>Proof / decision ledger</b><small>Readable equations stay explicit. Dense geometry carries IDs and values instead of fake micro-formulas.</small></span></div>
     <div className='va183-proof-core'><div><span>PRIMARY LAW</span><b>{packet.formulas.decision}</b><small>{packet.decision} · evidence {pct(packet.channels.proof)} · stability {f(packet.channels.stability)}</small></div></div>
     <div className='va183-formulas'><article><span>FIELD RADIUS</span><b>{packet.formulas.radius}</b></article><article><span>DENSITY</span><b>{packet.formulas.density}</b></article><article><span>HALO</span><b>{packet.formulas.halo}</b></article><article><span>COLOR / TEXTURE</span><b>{packet.formulas.color}</b></article><article><span>MOTION</span><b>{packet.formulas.motion}</b></article></div>
     <div className='va183-colors'>{Object.entries(R183_COLOR_LAW).map(([k,v])=><span key={k}><i className={`c-${k}`}/><b>{k}</b><small>{v}</small></span>)}</div>
    </>}
    {tab==='DUALVERSE'&&<>
     <div className='va183-title'><Compass/><span><b>Dualverse orientation</b><small>Outverse/inverse are orientation views over the same state structure; sign changes do not create a second truth source.</small></span></div>
     <div className='va183-dualverse'><article className='outverse'><span>OUTVERSE</span><b>σ +1</b><svg viewBox='0 0 180 180'><circle cx='90' cy='90' r='54'/><path d='M90 90 L145 66'/><path d='M90 90 A54 54 0 0 1 142 104'/></svg><small>expansion-facing orientation · constructive branch</small></article><div className='va183-dual-core'><Move3d/><b>{packet.orientation.labels.forward}</b><span>{packet.orientation.labels.phase}</span><small>same invariant packet / different signed orientation</small></div><article className='inverse'><span>INVERSE</span><b>σ −1</b><svg viewBox='0 0 180 180'><circle cx='90' cy='90' r='54'/><path d='M90 90 L35 114'/><path d='M90 90 A54 54 0 0 0 38 76'/></svg><small>return/memory-facing orientation · prune/rehost branch</small></article></div>
    </>}
   </section>
   <aside className='va183-ledger'><header><GitBranch/><div><b>Why this view looks this way</b><small>Every channel is declared.</small></div></header>{Object.entries(packet.channels).filter(([,v])=>typeof v==='number').map(([k,v])=><div key={k}><span>{k}</span><b>{typeof v==='number'?f(v,4):String(v)}</b></div>)}<footer><ShieldCheck/><span>{packet.boundary}</span></footer></aside>
  </div>
 </section>
}

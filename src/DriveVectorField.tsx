import {useEffect,useMemo,useRef,useState} from 'react';
import {Download,Pause,Play,ShieldCheck} from 'lucide-react';
import {corpusState,decodeAddress} from './corpusRuntime';
import {getMandala20736Field,mandalaLensWeight,type FieldLens,type Mandala20736Field} from './mandala20736Runtime';
import {DRIVE_CANON_SOURCE,DRIVE_DOMAINS,DRIVE_PHASES,DRIVE_REGULATIONS,DRIVE_SEEDS} from './driveCanonSource';

const LENSES:FieldLens[]=['UNIFIED','WATER','LIGHT','SCAR','RELATIVITY','FORECAST','PROOF','TOPOLOGY'];
const PHASE_COLORS=['#d8b36e','#62d8c6','#77a8d9','#ba8ee8','#ef8f9d','#86d989','#c5d36c','#e5a76f','#7dd7df','#aaa0eb','#f0cb7a','#d9e8e6'];
const clamp=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const antipode=(address:number)=>{const c=decodeAddress(address);return 1728*((c.d+6)%12)+144*(11-c.p)+12*(11-c.r)+((c.l+6)%12)};
const project=(field:Mandala20736Field,i:number,zoom:number)=>{const z=field.z[i]||0,s=470*zoom/(1.65-z*.42);return[600+(field.x[i]||0)*s,600-(field.y[i]||0)*s] as const};

function saveSvg(svg:SVGSVGElement|null,address:number){if(!svg)return;const clone=svg.cloneNode(true) as SVGSVGElement;clone.setAttribute('xmlns','http://www.w3.org/2000/svg');const text='<?xml version="1.0" encoding="UTF-8"?>\n'+clone.outerHTML,a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'image/svg+xml'}));a.download=`OMEGA_drive_canon_state_${address+1}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),800)}

export default function DriveVectorField({address,onCommit}:{address:number;onCommit?:(address:number)=>void}){
 const svg=useRef<SVGSVGElement|null>(null),[field,setField]=useState<Mandala20736Field|null>(null),[lens,setLens]=useState<FieldLens>('UNIFIED'),[zoom,setZoom]=useState(1),[spin,setSpin]=useState(true),[showAll,setShowAll]=useState(true),[error,setError]=useState('');
 useEffect(()=>{getMandala20736Field().then(setField).catch(e=>setError(e instanceof Error?e.message:String(e)))},[]);
 const data=useMemo(()=>{if(!field)return null;const phasePaths=Array.from({length:12},()=>''),stride=showAll?1:3;for(let i=0;i<field.count;i+=stride){const [x,y]=project(field,i,zoom),w=mandalaLensWeight(field,i,lens),r=.35+1.15*w,phase=Math.floor(i/144)%12;phasePaths[phase]+=`M${x.toFixed(1)} ${y.toFixed(1)}h${r.toFixed(1)}`;}const a=Math.max(0,Math.min(field.count-1,address)),b=antipode(a),pa=project(field,a,zoom),pb=project(field,b,zoom);return{phasePaths,selected:a,anti:b,pa,pb}},[field,lens,zoom,address,showAll]);
 const record=corpusState(address),coords=decodeAddress(address),antiRecord=corpusState(antipode(address));
 return <section className='drive-vector-shell'>
  <div className='drive-vector-head'><div><span>DRIVE CANON · CSV/MOTION → SVG</span><h2>20,736 Vector Field+</h2><p>Source-bound vector instrument derived from the V21 canon contract and the synced Mode188 runtime workbook.</p></div><div className='drive-proof-badge'><ShieldCheck/><b>{DRIVE_CANON_SOURCE.states.toLocaleString()}</b><span>states</span></div></div>
  <div className='drive-vector-controls'>{LENSES.map(x=><button key={x} className={lens===x?'active':''} onClick={()=>setLens(x)}>{x}</button>)}<label>Zoom <input type='range' min='.55' max='1.8' step='.05' value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label><button onClick={()=>setSpin(v=>!v)}>{spin?<Pause/>:<Play/>}{spin?'Pause':'Motion'}</button><button className={showAll?'active':''} onClick={()=>setShowAll(v=>!v)}>{showAll?'20,736 nodes':'6,912 nodes'}</button><button onClick={()=>saveSvg(svg.current,address)}><Download/>SVG</button></div>
  <div className='drive-vector-stage'>{!data?<div className='drive-vector-loading'>{error||'Compiling source-bound vector field…'}</div>:<svg ref={svg} viewBox='0 0 1200 1200' role='img' aria-label='OMEGA Drive canon 20,736 state SVG field'>
   <defs><radialGradient id='omega-bg'><stop offset='0' stopColor='#0a2422'/><stop offset='.58' stopColor='#061015'/><stop offset='1' stopColor='#020507'/></radialGradient><filter id='omega-glow'><feGaussianBlur stdDeviation='2.2' result='b'/><feMerge><feMergeNode in='b'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs>
   <rect width='1200' height='1200' fill='url(#omega-bg)'/>
   <g opacity='.22'>{Array.from({length:12},(_,i)=>{const r=70+i*39;return <circle key={i} cx='600' cy='600' r={r} fill='none' stroke={PHASE_COLORS[i]} strokeWidth='.8'/>})}{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,x=600+520*Math.cos(a),y=600+520*Math.sin(a);return <line key={i} x1='600' y1='600' x2={x} y2={y} stroke='#d9eee9' strokeWidth='.55'/>})}</g>
   <g className={spin?'omega-svg-spin':''}>{data.phasePaths.map((d,i)=><path key={i} d={d} fill='none' stroke={PHASE_COLORS[i]} strokeWidth='1.15' strokeLinecap='round' opacity={.23+i*.018}/>)}</g>
   <line x1={data.pa[0]} y1={data.pa[1]} x2={data.pb[0]} y2={data.pb[1]} stroke='#e0b96e' strokeWidth='1.4' strokeDasharray='6 7' opacity='.8'/>
   <circle cx={data.pb[0]} cy={data.pb[1]} r='8' fill='none' stroke='#8ed8ce' strokeWidth='2'/><circle cx={data.pa[0]} cy={data.pa[1]} r='12' fill='none' stroke='#f0c979' strokeWidth='2.5' filter='url(#omega-glow)'/><circle cx={data.pa[0]} cy={data.pa[1]} r='3' fill='#fff3d2'/>
   <text x='24' y='36' fill='#d9eee9' fontSize='15' fontFamily='ui-monospace,monospace'>STATE {record.stateId} · {lens} · D{coords.d+1}/P{coords.p+1}/R{coords.r+1}/L{coords.l+1}</text>
   <text x='24' y='58' fill='#88a39d' fontSize='11' fontFamily='ui-monospace,monospace'>ANTIPODE {antiRecord.stateId} · V21 A(S)=S(D⊕6,13-P,13-R,L⊕6)</text>
  </svg>}</div>
  <div className='drive-vector-grid'>
   <article><span>Coordinate</span><b>{DRIVE_DOMAINS[coords.d]} · {DRIVE_PHASES[coords.p]}</b><small>{DRIVE_REGULATIONS[coords.r]} · {DRIVE_SEEDS[coords.l]}</small></article>
   <article><span>ALL MODES gate</span><b>{record.metrics.decision}</b><small>CΩ {record.metrics.continuity.toFixed(3)} · Φ {record.metrics.plasticity.toFixed(3)} · q {record.metrics.contradiction.toFixed(3)} · Λ {record.metrics.burden.toFixed(3)}</small></article>
   <article><span>Drive donor</span><b>V21 · 41 μ · 288 frames</b><small>200 math anchors · 320 RH anchors · 416 graph edges</small></article>
   <article><span>CSV geometry</span><b>{DRIVE_CANON_SOURCE.couplingEdges.toLocaleString()} coupling edges</b><small>{DRIVE_CANON_SOURCE.csvGeometrySources.join(' · ')}</small></article>
  </div>
  <div className='drive-source-ledger'><b>Source contract</b><span>{DRIVE_CANON_SOURCE.runtimeWorkbook}</span><span>{DRIVE_CANON_SOURCE.motionChannels.join(' → ')}</span><code>{DRIVE_CANON_SOURCE.equations.assembly}</code><code>{DRIVE_CANON_SOURCE.equations.motionDrive}</code><small>{DRIVE_CANON_SOURCE.boundary}</small></div>
  {onCommit&&<button className='drive-antipode-commit' onClick={()=>onCommit(antipode(address))}>Traverse to antipode state {antiRecord.stateId}</button>}
 </section>
}

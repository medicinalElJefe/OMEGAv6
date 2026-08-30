import {useMemo,useState} from 'react';
import {Activity,Clapperboard,Eye,Layers3,Orbit,ShieldCheck,Waypoints} from 'lucide-react';
import CalculusFieldR37 from './CalculusFieldR37';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import CinematicFieldRendererR46 from './CinematicFieldRendererR46';
import {corpusState,decodeAddress} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {sourceModeVisualBindingR68,type VisualProjectionMode} from './sourceModeVisualBindingR68';
import {unifiedFromRecord} from './unifiedCalculus';
import './visualCompositorR65.css';

type Lens='SYNTHESIS'|'FIELD'|'FORECAST'|'RELATIVITY'|'MOTION'|'CINEMATIC';
const LENSES:readonly {id:Lens;label:string;meaning:string}[]=[
 {id:'SYNTHESIS',label:'Synthesis',meaning:'four synchronized projections'},
 {id:'FIELD',label:'Unified field',meaning:'five-role calculus field'},
 {id:'FORECAST',label:'Forecast',meaning:'future-plasticity corridor'},
 {id:'RELATIVITY',label:'Relativity',meaning:'observer-relative projection'},
 {id:'MOTION',label:'Motion',meaning:'admitted transition membrane'},
 {id:'CINEMATIC',label:'Cinematic',meaning:'bounded browser renderer'}
] as const;
const fmt=(v:unknown)=>Number.isFinite(Number(v))?Number(v).toFixed(3):'—';
const UNIT_GAINS={radial:1,depth:1,fold:1,spread:1,recurrence:1} as const;
const projectionFor=(lens:Lens):VisualProjectionMode=>lens==='FORECAST'?'FORECAST':lens==='RELATIVITY'?'RELATIVITY':lens==='MOTION'?'TRAVERSAL':'FIELD';
function CalculusLens({address,onAddress,mode,label}:{address:number;onAddress:(n:number)=>void;mode:'FIELD'|'FORECAST'|'RELATIVITY';label:string}){return <CalculusFieldR37 address={address} mode={mode} steps={mode==='FORECAST'?42:30} observerBeta={mode==='RELATIVITY'?.58:0} onAddress={onAddress} label={label}/>}
function ModeReceipt({record,projection,compact=false}:{record:any;projection:VisualProjectionMode;compact?:boolean}){const receipt=useMemo(()=>sourceModeVisualBindingR68(record,projection,{...UNIT_GAINS}),[record,projection]);return <aside className={'r69-mode-receipt '+(compact?'compact':'')} data-projection={projection}><header><span>MODE → VISUAL RECEIPT</span><b>{projection}</b></header><div className='r69-mode-chips'>{receipt.executedModeIds.map(id=><span key={id} className='executed'>{id}<small>APPLIED</small></span>)}{receipt.gatedModeIds.map(id=><span key={id} className='gated'>{id}<small>GATED</small></span>)}</div>{!compact&&<><p>{receipt.detail}</p><div className='r69-gains'>{Object.entries(receipt.gains).map(([k,v])=><span key={k}><i>{k}</i><b>{Number(v).toFixed(2)}×</b></span>)}</div><small className='r69-receipt-boundary'>{receipt.boundary}</small></>}</aside>}
export default function VisualCompositorR65({address,onAddress}:{address:number;onAddress:(n:number)=>void}){
 const[lens,setLens]=useState<Lens>(()=>{const x=localStorage.getItem('omega.r65.visual.lens') as Lens|null;return x&&LENSES.some(v=>v.id===x)?x:'SYNTHESIS'});
 const record=useMemo(()=>corpusState(address),[address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const modes=useMemo(()=>sourceBackedModeSummary(record),[record]);
 const unified=useMemo(()=>unifiedFromRecord(record),[record]);
 const choose=(x:Lens)=>{setLens(x);localStorage.setItem('omega.r65.visual.lens',x)};
 const activeProjection=projectionFor(lens);
 return <section className='r65-compositor' data-lens={lens}>
  <header className='r65-compositor-head'><div><span>OMEGA VISUAL COMPOSITOR · ONE STATE / MANY LAWFUL PROJECTIONS</span><h3>Living multi-view instrument</h3><p>Field, forecast, relativity, motion and cinematic views stay synchronized to the same canonical address. Switching a lens changes projection, never truth ownership.</p></div><div className='r65-live'><Activity/><b>{record.metrics.decision}</b><small>STATE {record.stateId}</small></div></header>
  <div className='r65-state-ribbon'><span><i>ADDRESS</i><b>{address}</b><small>D{coords.d+1} · P{coords.p+1} · R{coords.r+1} · L{coords.l+1}</small></span><span><i>CΩ</i><b>{fmt(record.metrics.continuity)}</b><small>continuity</small></span><span><i>Φ</i><b>{fmt(record.metrics.plasticity)}</b><small>plasticity</small></span><span><i>q</i><b>{fmt(record.metrics.contradiction)}</b><small>contradiction</small></span><span><i>Λ</i><b>{fmt(record.metrics.burden)}</b><small>burden</small></span><span><i>COHERENCE</i><b>{fmt(unified?.unifiedCoherence)}</b><small>unified packet</small></span><span><i>MODES</i><b>{modes.appliedCount}</b><small>{modes.gatedCount} gated · {modes.catalogCount} catalog</small></span></div>
  <nav className='r65-lens-nav' aria-label='Synchronized visual lenses'>{LENSES.map(v=><button key={v.id} className={lens===v.id?'active':''} onClick={()=>choose(v.id)} aria-pressed={lens===v.id}>{v.id==='SYNTHESIS'?<Layers3/>:v.id==='MOTION'?<Waypoints/>:v.id==='CINEMATIC'?<Clapperboard/>:v.id==='RELATIVITY'?<Eye/>:<Orbit/>}<span><b>{v.label}</b><small>{v.meaning}</small></span></button>)}</nav>
  {lens!=='SYNTHESIS'&&<ModeReceipt record={record} projection={activeProjection}/>} 
  {lens==='SYNTHESIS'&&<div className='r65-synthesis-grid'>
   <article className='r65-view r65-view-field'><header><div><b>UNIFIED FIELD</b><small>current calculus membrane</small></div><ModeReceipt record={record} projection='FIELD' compact/></header><CalculusLens address={address} onAddress={onAddress} mode='FIELD' label='FIELD · CURRENT STATE'/></article>
   <article className='r65-view'><header><div><b>FORECAST</b><small>future-plasticity projection</small></div><ModeReceipt record={record} projection='FORECAST' compact/></header><CalculusLens address={address} onAddress={onAddress} mode='FORECAST' label='FORECAST · ADMITTED FUTURES'/></article>
   <article className='r65-view'><header><div><b>RELATIVITY</b><small>observer-relative projection</small></div><ModeReceipt record={record} projection='RELATIVITY' compact/></header><CalculusLens address={address} onAddress={onAddress} mode='RELATIVITY' label='RELATIVITY · OBSERVER FRAME'/></article>
   <article className='r65-view'><header><div><b>MOTION SKIN</b><small>route / scar / transition membrane</small></div><ModeReceipt record={record} projection='TRAVERSAL' compact/></header><OmegaMotionSkinMapR35 address={address} onSelectAddress={onAddress}/></article>
  </div>}
  {lens!=='SYNTHESIS'&&<div className='r65-focus-stage'>
   {lens==='FIELD'&&<CalculusLens address={address} onAddress={onAddress} mode='FIELD' label='UNIFIED FIELD · FIVE-ROLE CALCULUS'/>}
   {lens==='FORECAST'&&<CalculusLens address={address} onAddress={onAddress} mode='FORECAST' label='FORECAST · FUTURE-PLASTICITY CORRIDOR'/>}
   {lens==='RELATIVITY'&&<CalculusLens address={address} onAddress={onAddress} mode='RELATIVITY' label='RELATIVITY · OBSERVER FRAME'/>}
   {lens==='MOTION'&&<OmegaMotionSkinMapR35 address={address} onSelectAddress={onAddress}/>} 
   {lens==='CINEMATIC'&&<CinematicFieldRendererR46 record={record} address={address}/>} 
  </div>}
  <footer className='r65-truth'><ShieldCheck/><span><b>Projection truth:</b> all panels are bound to canonical state {record.stateId}. The visible MODE → VISUAL receipt identifies which implemented source-backed operators shape the selected projection. Catalog membership is not execution. Native GPU/video and device observations remain separately gated.</span></footer>
 </section>
}

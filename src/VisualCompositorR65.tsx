import {useMemo,useState} from 'react';
import {Activity,Clapperboard,Eye,Layers3,Orbit,ShieldCheck,Waypoints} from 'lucide-react';
import CalculusFieldR37 from './CalculusFieldR37';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import CinematicFieldRendererR46 from './CinematicFieldRendererR46';
import {corpusState,decodeAddress,evaluateCorpusModes} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {unifiedFromRecord} from './unifiedCalculus';
import ModeExpressionCanvasR82 from './ModeExpressionCanvasR82';
import {compileModeExpressionR82} from './modeExpressionRuntimeR82';
import {evaluateCanonAuthorityStack} from './allModesAuthority';
import './visualCompositorR65.css';

type Lens='SYNTHESIS'|'MODE'|'FIELD'|'FORECAST'|'RELATIVITY'|'MOTION'|'CINEMATIC';
const LENSES:readonly {id:Lens;label:string;meaning:string}[]=[
 {id:'SYNTHESIS',label:'Synthesis',meaning:'four synchronized projections'},
 {id:'MODE',label:'Mode expression',meaning:'selected mode visual law'},
 {id:'FIELD',label:'Unified field',meaning:'five-role calculus field'},
 {id:'FORECAST',label:'Forecast',meaning:'future-plasticity corridor'},
 {id:'RELATIVITY',label:'Relativity',meaning:'observer-relative projection'},
 {id:'MOTION',label:'Motion',meaning:'admitted transition membrane'},
 {id:'CINEMATIC',label:'Cinematic',meaning:'bounded browser renderer'}
] as const;
const fmt=(v:unknown)=>Number.isFinite(Number(v))?Number(v).toFixed(3):'—';
const authorityRef=(id:number)=>`A${String(id).padStart(3,'0')}`;
function CalculusLens({address,onAddress,mode,label}:{address:number;onAddress:(n:number)=>void;mode:'FIELD'|'FORECAST'|'RELATIVITY';label:string}){return <CalculusFieldR37 address={address} mode={mode} steps={mode==='FORECAST'?42:30} observerBeta={mode==='RELATIVITY'?.58:0} onAddress={onAddress} label={label}/>}
export default function VisualCompositorR65({address,onAddress}:{address:number;onAddress:(n:number)=>void}){
 const[lens,setLens]=useState<Lens>(()=>{const x=localStorage.getItem('omega.r65.visual.lens') as Lens|null;return x&&LENSES.some(v=>v.id===x)?x:'SYNTHESIS'});
 const record=useMemo(()=>corpusState(address),[address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const modes=useMemo(()=>sourceBackedModeSummary(record),[record]);
 const unified=useMemo(()=>unifiedFromRecord(record),[record]);
 const selectedModeId=useMemo(()=>{try{return localStorage.getItem('omega.r83.selectedModeRef')||localStorage.getItem('omega.r82.selectedModeId')||'M001'}catch{return'M001'}},[]);
 const catalog=useMemo(()=>evaluateCorpusModes(record),[record]),authorities=useMemo(()=>evaluateCanonAuthorityStack(record),[record]),selectedCatalog=useMemo(()=>(catalog.results as any[]).find(x=>x.id===selectedModeId)||null,[catalog,selectedModeId]),selectedExecution=useMemo(()=>modes.rows.find(x=>x.id===selectedModeId)||null,[modes,selectedModeId]),selectedAuthority=useMemo(()=>authorities.find(x=>authorityRef(x.id)===selectedModeId)||null,[authorities,selectedModeId]);
 const authorityCatalog=selectedAuthority?{id:authorityRef(selectedAuthority.id),name:selectedAuthority.name,category:selectedAuthority.group,operator:'DERIVED CANON / CALCULUS AUTHORITY LENS',purpose:selectedAuthority.basis,classification:selectedAuthority.classification}:null,authorityExecution=selectedAuthority?{id:authorityRef(selectedAuthority.id),name:selectedAuthority.name,state:'DERIVED_RUNTIME',value:selectedAuthority.activation,formula:'Derived governance activation over canonical packet',source:'ALL MODES repaired authority stack',detail:selectedAuthority.basis,authorityLens:true}:null;
 const modeExpression=useMemo(()=>compileModeExpressionR82(selectedCatalog||authorityCatalog,selectedExecution||authorityExecution,record),[selectedCatalog,selectedExecution,authorityCatalog,authorityExecution,record]);
 const choose=(x:Lens)=>{setLens(x);localStorage.setItem('omega.r65.visual.lens',x)};
 return <section className='r65-compositor' data-lens={lens}>
  <header className='r65-compositor-head'><div><span>OMEGA VISUAL COMPOSITOR · ONE STATE / MANY LAWFUL PROJECTIONS</span><h3>Living multi-view instrument</h3><p>Mode expression, field, forecast, relativity, motion and cinematic views stay synchronized to the same canonical address. Switching a lens changes projection, never truth ownership.</p></div><div className='r65-live'><Activity/><b>{record.metrics.decision}</b><small>STATE {record.stateId}</small></div></header>
  <div className='r65-state-ribbon'><span><i>ADDRESS</i><b>{address}</b><small>D{coords.d+1} · P{coords.p+1} · R{coords.r+1} · L{coords.l+1}</small></span><span><i>CΩ</i><b>{fmt(record.metrics.continuity)}</b><small>continuity</small></span><span><i>Φ</i><b>{fmt(record.metrics.plasticity)}</b><small>plasticity</small></span><span><i>q</i><b>{fmt(record.metrics.contradiction)}</b><small>contradiction</small></span><span><i>Λ</i><b>{fmt(record.metrics.burden)}</b><small>burden</small></span><span><i>COHERENCE</i><b>{fmt(unified?.unifiedCoherence)}</b><small>unified packet</small></span><span><i>MODES</i><b>{modes.appliedCount}</b><small>{modes.gatedCount} gated · {modes.catalogCount} catalog</small></span><span><i>SELECTED</i><b>{selectedModeId}</b><small>{modeExpression.family} · {modeExpression.authorityLens?'canon authority lens':modeExpression.executed?'source-backed':modeExpression.gated?'gated':'metadata'}</small></span></div>
  <nav className='r65-lens-nav' aria-label='Synchronized visual lenses'>{LENSES.map(v=><button key={v.id} className={lens===v.id?'active':''} onClick={()=>choose(v.id)} aria-pressed={lens===v.id}>{v.id==='SYNTHESIS'?<Layers3/>:v.id==='MODE'?<Orbit/>:v.id==='MOTION'?<Waypoints/>:v.id==='CINEMATIC'?<Clapperboard/>:v.id==='RELATIVITY'?<Eye/>:<Orbit/>}<span><b>{v.label}</b><small>{v.meaning}</small></span></button>)}</nav>
  {lens==='SYNTHESIS'&&<div className='r65-synthesis-grid'>
   <article className='r65-view r65-view-field'><header><b>UNIFIED FIELD</b><small>current calculus membrane</small></header><CalculusLens address={address} onAddress={onAddress} mode='FIELD' label='FIELD · CURRENT STATE'/></article>
   <article className='r65-view'><header><b>FORECAST</b><small>future-plasticity projection</small></header><CalculusLens address={address} onAddress={onAddress} mode='FORECAST' label='FORECAST · ADMITTED FUTURES'/></article>
   <article className='r65-view'><header><b>RELATIVITY</b><small>observer-relative projection</small></header><CalculusLens address={address} onAddress={onAddress} mode='RELATIVITY' label='RELATIVITY · OBSERVER FRAME'/></article>
   <article className='r65-view'><header><b>MOTION SKIN</b><small>route / scar / transition membrane</small></header><OmegaMotionSkinMapR35 address={address} onSelectAddress={onAddress}/></article>
  </div>}
  {lens!=='SYNTHESIS'&&<div className='r65-focus-stage'>
   {lens==='MODE'&&<ModeExpressionCanvasR82 expression={modeExpression} address={address} value={(selectedExecution||authorityExecution)?.value}/>} 
   {lens==='FIELD'&&<CalculusLens address={address} onAddress={onAddress} mode='FIELD' label='UNIFIED FIELD · FIVE-ROLE CALCULUS'/>}
   {lens==='FORECAST'&&<CalculusLens address={address} onAddress={onAddress} mode='FORECAST' label='FORECAST · FUTURE-PLASTICITY CORRIDOR'/>}
   {lens==='RELATIVITY'&&<CalculusLens address={address} onAddress={onAddress} mode='RELATIVITY' label='RELATIVITY · OBSERVER FRAME'/>}
   {lens==='MOTION'&&<OmegaMotionSkinMapR35 address={address} onSelectAddress={onAddress}/>} 
   {lens==='CINEMATIC'&&<CinematicFieldRendererR46 record={record} address={address}/>} 
  </div>}
  <footer className='r65-truth'><ShieldCheck/><span><b>Projection truth:</b> all panels are bound to canonical state {record.stateId}. Source-backed mode count is execution evidence only for implemented operators; catalog membership is not execution. Canon/calculus authority lenses are derived governance views over that packet, not additional executors. Native GPU/video and device observations remain separately gated.</span></footer>
 </section>
}

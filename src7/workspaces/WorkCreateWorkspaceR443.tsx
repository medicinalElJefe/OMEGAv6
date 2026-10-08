import {useEffect,useMemo,useState} from 'react';
import OmegaWorkspaceCockpitR18 from '../../src/OmegaWorkspaceCockpitR18';
import OmegaSpecialistSuite from '../../src/OmegaSpecialistSuite';
import OmegaIntentWorkbenchR85 from '../../src/OmegaIntentWorkbenchR85';
import {api} from '../../src/platformAdapter';
import {corpusState,decodeAddress,evaluateCorpusModes,initCorpusPack} from '../../src/corpusRuntime';
import type {Omega7Depth} from '../capabilityRegistry';

export type Omega7WorkCreateRoute='Workspace'|'Projects'|'Memory'|'Create'|'Render Queue'|'Assets';
type Props={route:Omega7WorkCreateRoute;onNavigate:(route:string)=>void;depth:Omega7Depth;autoOpen?:boolean};

const clamp=(n:number)=>Math.max(0,Math.min(20735,Number.isFinite(n)?Math.floor(n):11498));
const readAddress=()=>{try{return clamp(Number(localStorage.getItem('omega.v6.address')||11498))}catch{return 11498}};
const writeAddress=(n:number)=>{const next=clamp(n);try{localStorage.setItem('omega.v6.address',String(next));window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address:next}}))}catch{}return next};

export default function WorkCreateWorkspaceR443({route,onNavigate,depth,autoOpen=false}:Props){
 const[ready,setReady]=useState(false),[error,setError]=useState(''),[address,setAddress]=useState(readAddress),[instrumentOpen,setInstrumentOpen]=useState(depth!=='STANDARD'||autoOpen);
 const[status,setStatus]=useState<any>(null),[restore,setRestore]=useState<any>(null),[uiMode,setUiMode]=useState('AUTO');
 useEffect(()=>{setInstrumentOpen(depth!=='STANDARD'||autoOpen)},[depth,route,autoOpen]);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live){setReady(true);setError('')}}).catch(e=>{if(live)setError(e instanceof Error?e.message:String(e))});return()=>{live=false}},[]);
 useEffect(()=>{let live=true;Promise.all([api.get<any>('/api/status'),api.get<any>('/api/restoration')]).then(([s,r])=>{if(live){setStatus(s.data);setRestore(r.data)}}).catch(()=>{});return()=>{live=false}},[]);
 useEffect(()=>{const sync=()=>setAddress(current=>{const next=readAddress();return current===next?current:next});const id=window.setInterval(sync,850);window.addEventListener('storage',sync);window.addEventListener('omega7-address-changed',sync as EventListener);return()=>{window.clearInterval(id);window.removeEventListener('storage',sync);window.removeEventListener('omega7-address-changed',sync as EventListener)}},[]);
 const commit=(next:number)=>setAddress(writeAddress(next));
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const modeCount=useMemo(()=>record?evaluateCorpusModes(record).count:0,[record]);
 const state=useMemo(()=>({atlas:{address},modePolicy:'CONTEXTUAL',frozen:false,d:coords.d,p:coords.p,r:coords.r,l:coords.l,workflow:'LAW',preset:'SOVEREIGN',timeAuthority:'NOW',viewportMode:'CANON_FIELD',instrumentView:'LIVE',workspace:'LAW',embodimentIndex:4}),[address,coords]);

 if(error)return <section className='o7-native-failure' role='alert'><b>Work continuity runtime is unavailable.</b><p>{error}</p><button onClick={()=>location.reload()}>Retry runtime</button></section>;
 if(!ready||!record)return <section className='o7-native-loading' role='status' aria-live='polite'>Preparing work and continuity state…</section>;

 const plain=route==='Workspace'
  ?'Continue from the current OMEGA state, capture replay points, and reopen prior work without creating a second canonical state.'
  :route==='Projects'
   ?'Organize ongoing work around explicit project continuity while keeping browser, Hybrid, GitHub, Drive, and Canon authority separate.'
   :route==='Memory'
    ?'Carry notes, evidence, workflow history, and scars forward without pretending local continuity is model training or CanonState.'
    :route==='Create'
     ?'Start from an outcome. OMEGA coordinates the existing tools needed to create, analyze, build, render, prove, or continue the work.'
     :route==='Render Queue'
      ?'Generate and byte-hash declared local artifacts while keeping rendered output distinct from physical or native-execution proof.'
      :'Inspect and hash actual selected file bytes without silently promoting them into the corpus, CanonState, Drive, or GitHub authority.';

 return <section className='o7-native-workspace o7-work-create-workspace' data-omega7-native='work.create' data-route={route} data-address={address}>
  <header className='o7-native-head'>
   <div><span>{route==='Create'||route==='Render Queue'||route==='Assets'?'Create':'Work'} · Continuity</span><h1>{route}</h1><p>{plain}</p></div>
   <aside><b>State {record.stateId.toLocaleString()}</b><small>{record.metrics.decision} · {modeCount} source mode evaluations</small></aside>
  </header>

  {!instrumentOpen&&<section className='o7-science-intro'>
   <span>Current context</span><h2>{route}</h2><p>{plain}</p>
   <div className='o7-science-plain-grid'>
    <div><span>Current state</span><b>{record.stateId.toLocaleString()}</b><small>shared OMEGA address lineage</small></div>
    <div><span>Continuity</span><b>{Number(record.metrics.continuity).toFixed(3)}</b><small>model continuity metric, not external persistence proof</small></div>
    <div><span>Authority boundary</span><b>Preserved</b><small>local work does not silently become CanonState or external execution</small></div>
   </div>
   <button className='o7-open-instrument' onClick={()=>setInstrumentOpen(true)}>Open full {route} workspace</button>
  </section>}

  {instrumentOpen&&<div className='o7-native-surface'>
   {route==='Workspace'?<OmegaWorkspaceCockpitR18 variant='Workspace' record={record} state={state} address={address} onAddress={commit} onNavigate={onNavigate} status={status} restore={restore} modeCount={modeCount}/>:
    route==='Create'?<OmegaIntentWorkbenchR85 record={record} address={address} currentPanel='Create' onAddress={commit} onNavigate={onNavigate}/>:
    <OmegaSpecialistSuite panel={route} record={record} state={state} address={address} onAddress={commit} onNavigate={onNavigate} status={status} restore={restore} uiMode={uiMode} onUiMode={setUiMode}/>}
  </div>}
 </section>;
}

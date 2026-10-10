import {useEffect,useMemo,useState} from 'react';
import RelativityLab from '../../src/RelativityLab';
import AppliedRealityLab from '../../src/AppliedRealityLab';
import AtlasViewport from '../../src/AtlasViewport';
import FullSphereInstrumentR525 from '../../src/FullSphereInstrumentR525';
import AtlasCalculatorPanel from '../../src/AtlasCalculatorPanel';
import RecursiveScalePanel from '../../src/RecursiveScalePanel';
import OmegaInfinityPanel from '../../src/OmegaInfinityPanel';
import {corpusState,decodeAddress,initCorpusPack} from '../../src/corpusRuntime';
import {r43RelativityCoordinates} from '../../src/capabilityAtlasR43';
import {emitSpectralResolutionR436} from '../../src/system/canonicalDomainResolutionR436';
import {atomicChemistrySourceGateR436} from '../../src/system/scienceDomainResolutionR436';
import {presentR436ForHumans} from '../resolutionPresentationR438';
import type {Omega7Depth} from '../capabilityRegistry';

export type Omega7ScienceRoute='Relativity'|'Reality Lab'|'Atlas'|'Atlas Calculator'|'Scale Compiler'|'Infinity';
type Props={route:Omega7ScienceRoute;onNavigate:(route:string)=>void;depth:Omega7Depth};

const clamp=(n:number)=>Math.max(0,Math.min(20735,Number.isFinite(n)?Math.floor(n):11498));
const readAddress=()=>{try{return clamp(Number(localStorage.getItem('omega.v6.address')||11498))}catch{return 11498}};
const writeAddress=(n:number)=>{const next=clamp(n);try{localStorage.setItem('omega.v6.address',String(next));window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address:next}}))}catch{}return next};
const fromCoords=(c:{d:number;p:number;r:number;l:number})=>clamp(1728*c.d+144*c.p+12*c.r+c.l);

export default function ScienceWorkspaceR441({route,onNavigate,depth}:Props){
 const[ready,setReady]=useState(false),[error,setError]=useState(''),[address,setAddress]=useState(readAddress),[instrumentOpen,setInstrumentOpen]=useState(depth!=='STANDARD');
 useEffect(()=>{setInstrumentOpen(depth!=='STANDARD')},[depth,route]);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live){setReady(true);setError('')}}).catch(e=>{if(live)setError(e instanceof Error?e.message:String(e))});return()=>{live=false}},[]);
 useEffect(()=>{const sync=()=>setAddress(current=>{const next=readAddress();return current===next?current:next});const id=window.setInterval(sync,850);window.addEventListener('storage',sync);window.addEventListener('omega7-address-changed',sync as EventListener);return()=>{window.clearInterval(id);window.removeEventListener('storage',sync);window.removeEventListener('omega7-address-changed',sync as EventListener)}},[]);
 const commit=(next:number)=>setAddress(writeAddress(next));
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const state=useMemo(()=>({atlas:{address},modePolicy:'CONTEXTUAL',frozen:false,d:coords.d,p:coords.p,r:coords.r,l:coords.l,workflow:'LAW',preset:'SOVEREIGN',timeAuthority:'NOW',viewportMode:'CANON_FIELD',instrumentView:'LIVE',workspace:'LAW',embodimentIndex:4}),[address,coords]);
 const spectral=useMemo(()=>ready?r43RelativityCoordinates(address):null,[ready,address]);
 const spectralResolution=useMemo(()=>spectral?((spectral as any).canonicalResolution||emitSpectralResolutionR436(address,spectral)):null,[address,spectral]);
 const spectralHuman=useMemo(()=>spectralResolution?presentR436ForHumans(spectralResolution):null,[spectralResolution]);
 const atomicGate=useMemo(()=>atomicChemistrySourceGateR436({}),[]);

 if(error)return <section className='o7-native-failure' role='alert'><b>Scientific source runtime is unavailable.</b><p>{error}</p><button onClick={()=>location.reload()}>Retry runtime</button></section>;
 if(!ready||!record||!spectral)return <section className='o7-native-loading' role='status' aria-live='polite'>Preparing scientific source state…</section>;

 return <section className='o7-native-workspace o7-science-workspace' data-omega7-native='science' data-route={route} data-address={address}>
  <header className='o7-native-head'>
   <div><span>Explore · Science</span><h1>{route}</h1><p>Measured, standard-derived, model-derived, and representational layers stay distinct. OMEGA7 keeps the deep instruments while translating their status into a contemporary scientific workspace.</p></div>
   <aside><b>State {record.stateId.toLocaleString()}</b><small>D{coords.d} · P{coords.p} · R{coords.r} · L{coords.l}</small></aside>
  </header>

  <section className='o7-science-status' aria-label='Scientific evidence status'>
   <article><span>Spectral state</span><b>{spectralHuman?.headline}</b><small>{spectral.temperatureK.toFixed(1)} K · {spectral.wavelengthNm.toFixed(1)} nm · {spectral.spectralRegion}</small></article>
   <article><span>Planck / Wien</span><b>{depth==='STANDARD'?'CALCULATED FROM STANDARD PHYSICS':spectralResolution?.node.authority}</b><small>standard derived physics · address placement remains representational</small></article>
   <article data-state={atomicGate.sourceReady?'ready':'held'}><span>Atomic / chemistry source</span><b>{atomicGate.sourceReady?'SOURCE READY':'MORE EVIDENCE NEEDED'}</b><small>{atomicGate.boundary}</small></article>
   {depth!=='STANDARD'&&spectralResolution&&<article><span>Technical resolution</span><b>{spectralResolution.node.proofClass}</b><small>{spectralResolution.branch.status} · ledger {spectralResolution.ledgerHash}</small></article>}
  </section>

  {!instrumentOpen&&<section className='o7-science-intro'>
   <span>Current view</span>
   <h2>{route}</h2>
   <p>{route==='Relativity'?'See how the current state changes when the observer or frame changes—without confusing that projection with a change to the underlying state.':route==='Reality Lab'?'Load real CSV or TSV observations, map them into OMEGA state, test the mapping, and only commit a state when its empirical gate passes.':route==='Atlas'?'Traverse the exact 20,736-address atlas and its restored Full Sphere dodecahedral projection; rotation, temporal topology and antipodes operate on declared model state without physical observation claims.':route==='Atlas Calculator'?'Change the four address coordinates and see exactly which state they select before committing anything.':route==='Scale Compiler'?'Inspect how the current state unfolds across representation scales and where measured scale bindings are still missing.':'Inspect current recurrence and archived donor material without presenting historical workbook samples as current observations.'}</p>
   <div className='o7-science-plain-grid'>
    <div><span>Current state</span><b>{record.stateId.toLocaleString()}</b><small>{record.metrics.decision}</small></div>
    <div><span>Spectral context</span><b>{spectral.wavelengthNm.toFixed(1)} nm</b><small>{spectral.spectralRegion} · {spectral.temperatureK.toFixed(1)} K coordinate</small></div>
    <div><span>Evidence boundary</span><b>{atomicGate.sourceReady?'Atomic source connected':'Atomic source not connected'}</b><small>{atomicGate.sourceReady?'Typed atomic evidence is available.':'OMEGA will not invent an atomic measurement from atlas metadata.'}</small></div>
   </div>
   <button className='o7-open-instrument' onClick={()=>setInstrumentOpen(true)}>Open full {route} instrument</button>
  </section>}

  {instrumentOpen&&<div className='o7-native-surface'>
   {route==='Relativity'?<RelativityLab record={record} state={state} onNavigate={onNavigate}/>:
    route==='Reality Lab'?<AppliedRealityLab canonicalAddress={address} onCommitAddress={commit}/>:
    route==='Atlas'?<><FullSphereInstrumentR525 address={address} onAddress={commit}/><AtlasViewport state={state} onSelect={c=>commit(fromCoords(c))}/></>:
    route==='Atlas Calculator'?<AtlasCalculatorPanel record={record} onCommit={commit}/>:
    route==='Scale Compiler'?<RecursiveScalePanel address={address} onAddress={commit}/>:
    <OmegaInfinityPanel record={record}/>}
  </div>}
 </section>;
}

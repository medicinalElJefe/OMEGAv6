import {useEffect,useMemo,useState} from 'react';
import ForecastSovereignPanel from '../../src/ForecastSovereignPanel';
import {VisualInstrumentR36} from '../../src/OmegaR36LivingSurfaces';
import OmegaFieldMotionConvergenceR28 from '../../src/OmegaFieldMotionConvergenceR28';
import OmegaConvergenceSurfaceR416 from '../../src/OmegaConvergenceSurfaceR416';
import {buildForecastPlan} from '../../src/forecastRuntime';
import {corpusState,decodeAddress,initCorpusPack} from '../../src/corpusRuntime';
import type {Omega7Depth} from '../capabilityRegistry';

export type Omega7ForecastVisualRoute='Forecast'|'Visual Instrument'|'Field'|'Data Motion'|'Convergence';
type Props={route:Omega7ForecastVisualRoute;onNavigate:(route:string)=>void;depth:Omega7Depth};

const clamp=(n:number)=>Math.max(0,Math.min(20735,Number.isFinite(n)?Math.floor(n):11498));
const readAddress=()=>{try{return clamp(Number(localStorage.getItem('omega.v6.address')||11498))}catch{return 11498}};
const writeAddress=(n:number)=>{const next=clamp(n);try{localStorage.setItem('omega.v6.address',String(next));window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address:next}}))}catch{}return next};

export default function ForecastVisualWorkspaceR442({route,onNavigate,depth}:Props){
 const[ready,setReady]=useState(false),[error,setError]=useState(''),[address,setAddress]=useState(readAddress),[instrumentOpen,setInstrumentOpen]=useState(depth!=='STANDARD');
 useEffect(()=>{setInstrumentOpen(depth!=='STANDARD')},[depth,route]);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live){setReady(true);setError('')}}).catch(e=>{if(live)setError(e instanceof Error?e.message:String(e))});return()=>{live=false}},[]);
 useEffect(()=>{const sync=()=>setAddress(current=>{const next=readAddress();return current===next?current:next});const id=window.setInterval(sync,850);window.addEventListener('storage',sync);window.addEventListener('omega7-address-changed',sync as EventListener);return()=>{window.clearInterval(id);window.removeEventListener('storage',sync);window.removeEventListener('omega7-address-changed',sync as EventListener)}},[]);
 const commit=(next:number)=>setAddress(writeAddress(next));
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const state=useMemo(()=>({atlas:{address},modePolicy:'CONTEXTUAL',frozen:false,d:coords.d,p:coords.p,r:coords.r,l:coords.l,workflow:'LAW',preset:'SOVEREIGN',timeAuthority:'NOW',viewportMode:'CANON_FIELD',instrumentView:'LIVE',workspace:'LAW',embodimentIndex:4}),[address,coords]);
 const forecast=useMemo(()=>ready?buildForecastPlan(address,12,'CANON_PHASE'):null,[ready,address]);

 if(error)return <section className='o7-native-failure' role='alert'><b>Forecast / visual runtime is unavailable.</b><p>{error}</p><button onClick={()=>location.reload()}>Retry runtime</button></section>;
 if(!ready||!record||!forecast)return <section className='o7-native-loading' role='status' aria-live='polite'>Preparing forecast and visual state…</section>;

 const currentSummary=route==='Forecast'
  ?`${forecast.summary.corridorCount} admissible model routes remain over the selected horizon. The most supported route is ${forecast.summary.dominantMode||'not resolved'}.`
  :route==='Visual Instrument'
   ?'See the current canonical packet through multiple visual lenses without changing the underlying state authority.'
   :route==='Field'
    ?'Inspect the current relational field as one source-bound 20,736-cell membrane.'
    :route==='Data Motion'
     ?'Compare the current packet with its admitted next state and inspect the exact model-space deltas.'
     :'Compare admissible model routes, proof support, contradiction pressure, and retained alternatives before choosing any state.';

 return <section className='o7-native-workspace o7-forecast-visual-workspace' data-omega7-native='forecast.visual' data-route={route} data-address={address}>
  <header className='o7-native-head'>
   <div><span>Explore · Forecast & Visual Field</span><h1>{route}</h1><p>Forecasts remain possible model futures, visual layers remain representations, and address-space motion remains distinct from physical motion.</p></div>
   <aside><b>State {record.stateId.toLocaleString()}</b><small>D{coords.d} · P{coords.p} · R{coords.r} · L{coords.l} · {record.metrics.decision}</small></aside>
  </header>

  {!instrumentOpen&&<section className='o7-science-intro'>
   <span>Current view</span><h2>{route}</h2><p>{currentSummary}</p>
   <div className='o7-science-plain-grid'>
    <div><span>Current state</span><b>{record.stateId.toLocaleString()}</b><small>decision {record.metrics.decision}</small></div>
    <div><span>Continuity / possibility</span><b>{record.metrics.continuity.toFixed(3)} / {record.metrics.plasticity.toFixed(3)}</b><small>model-state values, not probability of real-world destiny</small></div>
    <div><span>Forecast boundary</span><b>{forecast.summary.corridorCount} model routes</b><small>future observations are not used or invented</small></div>
   </div>
   <button className='o7-open-instrument' onClick={()=>setInstrumentOpen(true)}>Open full {route} instrument</button>
  </section>}

  {instrumentOpen&&<div className='o7-native-surface'>
   {route==='Forecast'?<ForecastSovereignPanel address={address}/>:
    route==='Visual Instrument'?<VisualInstrumentR36 address={address} onAddress={commit} onNavigate={onNavigate}/>:
    route==='Convergence'?<OmegaConvergenceSurfaceR416 record={record} state={state} address={address} onAddress={commit} onNavigate={onNavigate} status={null} restore={null}/>:
    <OmegaFieldMotionConvergenceR28 variant={route} record={record} state={state} address={address} onAddress={commit} onNavigate={onNavigate}/>}
  </div>}
 </section>;
}

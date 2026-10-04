import {useEffect,useMemo,useState} from 'react';
import HybridMissionControlR8 from '../../src/HybridMissionControlR8';
import UniversalQualityControl from '../../src/UniversalQualityControl';
import WovenBuildOutPanel from '../../src/WovenBuildOutPanel';
import SAISovereignControl from '../../src/SAISovereignControl';
import IntelligenceFabricPanel from '../../src/IntelligenceFabricPanel';
import OmegaIntentWorkbenchR85 from '../../src/OmegaIntentWorkbenchR85';
import {api} from '../../src/platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from '../../src/corpusRuntime';
import {sourceBackedModeSummary} from '../../src/sourceBackedModeRuntimeR21';
import type {Omega7Depth} from '../capabilityRegistry';

export type Omega7DevelopmentRoute='Hybrid Link'|'Quality Compiler'|'Build Out'|'Development'|'Kernel Intelligence'|'SAI Lab';
type Props={route:Omega7DevelopmentRoute;onNavigate:(route:string)=>void;depth:Omega7Depth};

const clamp=(n:number)=>Math.max(0,Math.min(20735,Number.isFinite(n)?Math.floor(n):11498));
const readAddress=()=>{try{return clamp(Number(localStorage.getItem('omega.v6.address')||11498))}catch{return 11498}};
const writeAddress=(n:number)=>{const next=clamp(n);try{localStorage.setItem('omega.v6.address',String(next));window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address:next}}))}catch{}return next};

export default function DevelopmentComputeWorkspaceR444({route,onNavigate,depth}:Props){
 const[ready,setReady]=useState(false),[error,setError]=useState(''),[address,setAddress]=useState(readAddress),[instrumentOpen,setInstrumentOpen]=useState(depth!=='STANDARD');
 const[status,setStatus]=useState<any>(null),[restore,setRestore]=useState<any>(null);
 useEffect(()=>setInstrumentOpen(depth!=='STANDARD'),[depth,route]);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live){setReady(true);setError('')}}).catch(e=>{if(live)setError(e instanceof Error?e.message:String(e))});return()=>{live=false}},[]);
 useEffect(()=>{let live=true;Promise.all([api.get<any>('/api/status'),api.get<any>('/api/restoration')]).then(([s,r])=>{if(live){setStatus(s.data);setRestore(r.data)}}).catch(()=>{});return()=>{live=false}},[]);
 useEffect(()=>{const sync=()=>setAddress(current=>{const next=readAddress();return current===next?current:next});const id=window.setInterval(sync,850);window.addEventListener('storage',sync);window.addEventListener('omega7-address-changed',sync as EventListener);return()=>{window.clearInterval(id);window.removeEventListener('storage',sync);window.removeEventListener('omega7-address-changed',sync as EventListener)}},[]);
 const commit=(next:number)=>setAddress(writeAddress(next));
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const modeSummary=useMemo(()=>record?sourceBackedModeSummary(record):null,[record]);

 if(error)return <section className='o7-native-failure' role='alert'><b>Development runtime is unavailable.</b><p>{error}</p><button onClick={()=>location.reload()}>Retry runtime</button></section>;
 if(!ready||!record||!modeSummary)return <section className='o7-native-loading' role='status' aria-live='polite'>Preparing development and compute state…</section>;

 const deviceState=String(status?.hybridLink?.state||'DEVICE_PROOF_REQUIRED');
 const plain=route==='Hybrid Link'
  ?'Connect an authorized PC and distinguish browser pairing, authentication, heartbeat proof, and real device execution.'
  :route==='Quality Compiler'
   ?'Verify source, runtime, proof, and interaction contracts without turning catalog presence or a green-looking screen into execution proof.'
   :route==='Build Out'||route==='Development'
    ?'Restore, repair, build, test, and package through governed tools while keeping source promotion, deployment, and Canon admission separate.'
    :'Use source-grounded intelligence to inspect, reason, and propose bounded improvements without hidden browser mutation of source or production.';

 return <section className='o7-native-workspace o7-development-workspace' data-omega7-native='development.compute' data-route={route} data-address={address}>
  <header className='o7-native-head'>
   <div><span>Develop · Governed Compute</span><h1>{route}</h1><p>{plain}</p></div>
   <aside><b>{route==='Hybrid Link'?deviceState:`State ${record.stateId.toLocaleString()}`}</b><small>{modeSummary.appliedCount} source-backed modes applied · {modeSummary.gatedCount} gated</small></aside>
  </header>

  {!instrumentOpen&&<section className='o7-science-intro'>
   <span>Current execution boundary</span><h2>{route}</h2><p>{plain}</p>
   <div className='o7-science-plain-grid'>
    <div><span>Canonical state</span><b>{record.stateId.toLocaleString()}</b><small>D{coords.d} · P{coords.p} · R{coords.r} · L{coords.l}</small></div>
    <div><span>{route==='Hybrid Link'?'PC proof':'Source-backed modes'}</span><b>{route==='Hybrid Link'?deviceState:modeSummary.appliedCount}</b><small>{route==='Hybrid Link'?'pairing alone is not PC execution':`${modeSummary.gatedCount} gated · catalog presence is not execution`}</small></div>
    <div><span>Authority</span><b>Governed</b><small>browser tools cannot silently promote source, deploy production, or admit CanonState</small></div>
   </div>
   <button className='o7-open-instrument' onClick={()=>setInstrumentOpen(true)}>Open full {route} workspace</button>
  </section>}

  {instrumentOpen&&<div className='o7-native-surface'>
   {route==='Hybrid Link'?<HybridMissionControlR8 status={status} record={record}/>:
    route==='Quality Compiler'?<UniversalQualityControl record={record} status={status} restore={restore} modeCount={modeSummary.appliedCount} catalogCount={modeSummary.catalogCount}/>:
    route==='Build Out'?<WovenBuildOutPanel address={address} onNavigate={onNavigate}/>:
    route==='Development'?<section className='o7-development-combined'><WovenBuildOutPanel address={address} onNavigate={onNavigate}/><OmegaIntentWorkbenchR85 record={record} address={address} currentPanel='Development' onAddress={commit} onNavigate={onNavigate}/></section>:
    route==='Kernel Intelligence'?<SAISovereignControl record={record} modeCount={modeSummary.appliedCount} onNavigate={onNavigate}/>:
    <section className='o7-sai-combined'><IntelligenceFabricPanel address={address}/><SAISovereignControl record={record} modeCount={modeSummary.appliedCount} onNavigate={onNavigate}/></section>}
  </div>}
 </section>;
}

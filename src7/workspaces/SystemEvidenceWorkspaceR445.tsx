import {useEffect,useMemo,useState} from 'react';
import OmegaWorkspaceCockpitR18 from '../../src/OmegaWorkspaceCockpitR18';
import SourceBackedModesPanelR21 from '../../src/SourceBackedModesPanelR21';
import OmegaSpecialistSuite from '../../src/OmegaSpecialistSuite';
import ArchiveGovernanceControl from '../../src/ArchiveGovernanceControl';
import PluginRegistryR45 from '../../src/PluginRegistryR45';
import UniversalQualityControl from '../../src/UniversalQualityControl';
import SystemAtlasControl from '../../src/SystemAtlasControl';
import {api} from '../../src/platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from '../../src/corpusRuntime';
import {sourceBackedModeSummary} from '../../src/sourceBackedModeRuntimeR21';
import type {Omega7Depth} from '../capabilityRegistry';
import type {RecoveredExecutionCapsuleR512} from '../capabilityMenuR512';

export type Omega7SystemEvidenceRoute='Cockpit'|'Modes'|'Evidence & Proof'|'Archive Census'|'Archive Operators'|'Canon Evolution'|'Governance'|'Consolidation'|'Instructions'|'Plugins'|'Settings'|'System'|'Validation'|'System Atlas'|'Control Matrix';
type Props={route:Omega7SystemEvidenceRoute;onNavigate:(route:string)=>void;depth:Omega7Depth;softwareLaunch?:RecoveredExecutionCapsuleR512|null};

const clamp=(n:number)=>Math.max(0,Math.min(20735,Number.isFinite(n)?Math.floor(n):11498));
const readAddress=()=>{try{return clamp(Number(localStorage.getItem('omega.v6.address')||11498))}catch{return 11498}};
const writeAddress=(n:number)=>{const next=clamp(n);try{localStorage.setItem('omega.v6.address',String(next));window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address:next}}))}catch{}return next};

export default function SystemEvidenceWorkspaceR445({route,onNavigate,depth,softwareLaunch}:Props){
 const somaLaunch=route==='System Atlas'&&softwareLaunch?.recoveredId==='SOMA'&&softwareLaunch.operation==='SONIFY_CANONICAL_PACKET'&&softwareLaunch.state==='EXECUTES_NOW';
 const[ready,setReady]=useState(false),[error,setError]=useState(''),[address,setAddress]=useState(readAddress),[instrumentOpen,setInstrumentOpen]=useState(depth!=='STANDARD'||somaLaunch);
 const[status,setStatus]=useState<any>(null),[restore,setRestore]=useState<any>(null),[uiMode,setUiMode]=useState('AUTO');
 useEffect(()=>setInstrumentOpen(depth!=='STANDARD'||somaLaunch),[depth,route,somaLaunch]);
 useEffect(()=>{let live=true;initCorpusPack().then(()=>{if(live){setReady(true);setError('')}}).catch(e=>{if(live)setError(e instanceof Error?e.message:String(e))});return()=>{live=false}},[]);
 useEffect(()=>{let live=true;Promise.all([api.get<any>('/api/status'),api.get<any>('/api/restoration')]).then(([s,r])=>{if(live){setStatus(s.data);setRestore(r.data)}}).catch(()=>{});return()=>{live=false}},[]);
 useEffect(()=>{const sync=()=>setAddress(current=>{const next=readAddress();return current===next?current:next});const id=window.setInterval(sync,850);window.addEventListener('storage',sync);window.addEventListener('omega7-address-changed',sync as EventListener);return()=>{window.clearInterval(id);window.removeEventListener('storage',sync);window.removeEventListener('omega7-address-changed',sync as EventListener)}},[]);
 const commit=(next:number)=>setAddress(writeAddress(next));
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const state=useMemo(()=>({atlas:{address},modePolicy:'CONTEXTUAL',frozen:false,d:coords.d,p:coords.p,r:coords.r,l:coords.l,workflow:'LAW',preset:'SOVEREIGN',timeAuthority:'NOW',viewportMode:'CANON_FIELD',instrumentView:'LIVE',workspace:'LAW',embodimentIndex:4}),[address,coords]);
 const modeSummary=useMemo(()=>record?sourceBackedModeSummary(record):null,[record]);

 if(error)return <section className='o7-native-failure' role='alert'><b>System/evidence runtime is unavailable.</b><p>{error}</p><button onClick={()=>location.reload()}>Retry runtime</button></section>;
 if(!ready||!record||!modeSummary)return <section className='o7-native-loading' role='status' aria-live='polite'>Preparing system and evidence state…</section>;

 const plain=route==='Cockpit'
  ?'See runtime health, authority, continuity, and proof state without treating a visible control as execution proof.'
  :route==='Modes'
   ?'Inspect source-backed mode execution separately from the larger mode catalog and higher-order Canon lenses.'
   :route==='Evidence & Proof'||route==='Validation'
    ?'Inspect what is actually proved, what is held, and which authority produced each result.'
    :route==='Archive Census'||route==='Archive Operators'
     ?'Review classified donor evidence without relabeling historical archive counts as a live enumeration.'
     :route==='Governance'||route==='Canon Evolution'
      ?'Review proposals and admission gates while keeping proposal, evidence, source promotion, and CanonState distinct.'
      :route==='Plugins'
       ?'Manage typed adapter manifests while keeping registration, availability, invocation, return, and verification separate.'
       :'Inspect and operate the system through the accepted authority surfaces without creating a second runtime or hidden state owner.';

 return <section className='o7-native-workspace o7-system-evidence-workspace' data-omega7-native='system.evidence' data-route={route} data-address={address}>
  <header className='o7-native-head'>
   <div><span>System · Evidence & Authority</span><h1>{route}</h1><p>{plain}</p></div>
   <aside><b>State {record.stateId.toLocaleString()}</b><small>{modeSummary.appliedCount} modes applied · {modeSummary.gatedCount} gated · {record.metrics.decision}</small></aside>
  </header>

  {!instrumentOpen&&<section className='o7-science-intro'>
   <span>Current authority view</span><h2>{route}</h2><p>{plain}</p>
   <div className='o7-science-plain-grid'>
    <div><span>Current state</span><b>{record.stateId.toLocaleString()}</b><small>D{coords.d} · P{coords.p} · R{coords.r} · L{coords.l}</small></div>
    <div><span>Mode execution</span><b>{modeSummary.appliedCount}</b><small>{modeSummary.catalogCount} catalog · catalog membership is not execution</small></div>
    <div><span>Canon mutation</span><b>Governed only</b><small>presentation, registration, proposal, and local persistence are not Canon admission</small></div>
   </div>
   <button className='o7-open-instrument' onClick={()=>setInstrumentOpen(true)}>Open full {route} workspace</button>
  </section>}

  {instrumentOpen&&<div className='o7-native-surface'>
   {route==='Cockpit'?<OmegaWorkspaceCockpitR18 variant='Cockpit' record={record} state={state} address={address} onAddress={commit} onNavigate={onNavigate} status={status} restore={restore} modeCount={modeSummary.appliedCount}/>:
    route==='Modes'?<SourceBackedModesPanelR21 record={record} address={address} onAddress={commit} onNavigate={onNavigate}/>:
    route==='Archive Census'?<ArchiveGovernanceControl onNavigate={onNavigate}/>:
    route==='Archive Operators'?<ArchiveGovernanceControl operators onNavigate={onNavigate}/>:
    route==='Plugins'?<PluginRegistryR45 onNavigate={onNavigate}/>:
    route==='Validation'?<UniversalQualityControl record={record} status={status} restore={restore} modeCount={modeSummary.appliedCount} catalogCount={modeSummary.catalogCount}/>:
    route==='System Atlas'?<SystemAtlasControl record={record} onNavigate={onNavigate} focusFamily={somaLaunch?'S17':undefined}/>:
    route==='Control Matrix'?<SystemAtlasControl record={record} onNavigate={onNavigate} control/>:
    <OmegaSpecialistSuite panel={route} record={record} state={state} address={address} onAddress={commit} onNavigate={onNavigate} status={status} restore={restore} uiMode={uiMode} onUiMode={setUiMode}/>}
  </div>}
 </section>;
}

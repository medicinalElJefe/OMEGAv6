import {useEffect,useMemo,useState} from 'react';
import {api,localState} from '../../src/platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from '../../src/corpusRuntime';
import {sourceBackedModeSummary} from '../../src/sourceBackedModeRuntimeR21';
import {compileFullOverallModePlanR79,compactModePlanR79} from '../../src/fullOverallModeOrchestratorR79';
import {unifiedFromRecord} from '../../src/unifiedCalculus';
import {OmegaCommandDeck} from '../../src/OmegaCommandDeck';

type Props={onNavigate:(route:string)=>void};

const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
const readAddress=()=>clamp(Number(localState.read('omega.v6.address',11498)));

export default function CommandWorkspaceR439({onNavigate}:Props){
 const[address,setAddress]=useState(readAddress);
 const[ready,setReady]=useState(false);
 const[bootError,setBootError]=useState('');
 const[prompt,setPrompt]=useState(()=>String(localState.read('omega.b015.chatDraft.v1','')));
 const[response,setResponse]=useState<any>(null);
 const[busy,setBusy]=useState('');

 const boot=async()=>{
  setBootError('');
  try{await initCorpusPack();setReady(true);setAddress(readAddress())}
  catch(error:any){setReady(false);setBootError(error?.message||String(error))}
 };
 useEffect(()=>{void boot()},[]);
 useEffect(()=>{
  const sync=()=>setAddress(current=>{const next=readAddress();return next===current?current:next});
  const id=window.setInterval(sync,850);
  window.addEventListener('storage',sync);
  return()=>{window.clearInterval(id);window.removeEventListener('storage',sync)};
 },[]);
 useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);

 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const modes=useMemo(()=>record?sourceBackedModeSummary(record):null,[record]);
 const unified=useMemo(()=>record?unifiedFromRecord(record):null,[record]);
 const modePlan=useMemo(()=>record?compileFullOverallModePlanR79(record,'Command Center',prompt):null,[record,prompt]);

 const state=useMemo(()=>({
  atlas:{address},
  modePolicy:'SOURCE_BACKED_ALL_AVAILABLE',
  frozen:false,
  d:coords.d,p:coords.p,r:coords.r,l:coords.l,
  workflow:'LAW',
  preset:'SOVEREIGN',
  timeAuthority:'NOW',
  viewportMode:'CANON_FIELD',
  instrumentView:'LIVE',
  workspace:'COMMAND'
 }),[address,coords]);

 const run=async()=>{
  if(!record||!modes||!modePlan||!prompt.trim()||busy)return;
  const text=prompt.trim();
  setBusy('routing');
  setResponse(null);
  const nextAddress=clamp(Number(record.autoPing?.dataNext??address));
  const context={
   address,
   stateId:record.stateId,
   coords,
   decision:record.metrics.decision,
   metrics:record.metrics,
   nextAddress,
   modePolicy:'SOURCE_BACKED_ALL_AVAILABLE',
   appliedModeCount:modes.appliedCount,
   gatedModeCount:modes.gatedCount,
   fullOverallModePlan:compactModePlanR79(modePlan),
   unified:{coherence:unified?.unifiedCoherence,motionRelativity:unified?.motionRelativity},
   responseContract:{
    plainLanguageFirst:true,
    showRouteBeforeGeneration:true,
    doNotInventMissingEvidence:true,
    preserveTruthBoundary:true,
    canonicalMutation:false
   }
  };
  try{
   const preview=await api.post<any>('/api/route-preview',{text,context});
   setBusy('response');
   const chat=await api.post<any>('/api/chat',{text,context});
   setResponse({
    answer:String(chat.data?.reply||'No response returned.'),
    responsePath:String(preview.data?.route||'ROUTED'),
    evidenceStatus:preview.data?.route==='FAST_DETERMINISTIC'?'VERIFIED_RUNTIME':'PROVIDER_BOUND',
    provider:chat.data?.provider||null,
    modelInvoked:preview.data?.route!=='FAST_DETERMINISTIC',
    modelSucceeded:chat.ok,
    uncertainty:preview.data?.route==='FAST_DETERMINISTIC'?'Bounded verified runtime route.':'External synthesis remains provider-bound and cannot promote CanonState.',
    nextAction:'Continue from the same packet, source-backed mode plan, and proof state.'
   });
  }catch(error:any){
   setResponse({
    answer:error?.message||'No answer fabricated; the provider/runtime path failed.',
    responsePath:'BOUNDED_FAILURE',
    evidenceStatus:'FAILED_HELD',
    modelInvoked:true,
    modelSucceeded:false,
    uncertainty:'OMEGA preserved the current packet and did not substitute an invented result.',
    nextAction:'Retry the same request or use a deterministic runtime capability.'
   });
  }finally{setBusy('')}
 };

 if(bootError)return <section className='o7-command-native-state' role='alert'>
  <b>OMEGA could not load the source corpus.</b>
  <p>{bootError}</p>
  <button onClick={()=>void boot()}>Retry source runtime</button>
 </section>;

 if(!ready||!record||!modes||!modePlan)return <section className='o7-command-native-state' role='status' aria-live='polite' aria-busy='true'>
  <b>Preparing OMEGA…</b>
  <p>Loading the current source packet and source-backed capability plan. The OMEGA7 shell remains available.</p>
 </section>;

 return <section className='o7-native-workspace o7-command-workspace' data-omega7-native='command.center' data-address={address} data-applied-modes={modes.appliedCount} data-gated-modes={modes.gatedCount}>
  <header className='o7-native-head'>
   <div><span>Home · Ask OMEGA</span><h1>Ask OMEGA</h1><p>One governed task surface for questions, analysis, building, repair, and capability routing. The machinery remains available without being forced into the first explanation.</p></div>
   <aside><b>{modes.appliedCount} source-backed modes available</b><small>{modes.gatedCount} gated by missing inputs · state {record.stateId.toLocaleString()}</small></aside>
  </header>
  <div className='o7-native-surface o7-command-native-surface'>
   <OmegaCommandDeck record={record} state={state} prompt={prompt} onPrompt={setPrompt} onRun={run} response={response} busy={busy} onNavigate={onNavigate}/>
  </div>
 </section>;
}

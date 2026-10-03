import {useEffect,useMemo,useState} from 'react';
import {api,localState} from '../../src/platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from '../../src/corpusRuntime';
import {sourceBackedModeSummary} from '../../src/sourceBackedModeRuntimeR21';
import {compileFullOverallModePlanR79,compactModePlanR79} from '../../src/fullOverallModeOrchestratorR79';
import {unifiedFromRecord} from '../../src/unifiedCalculus';
import {OmegaCommandDeck} from '../../src/OmegaCommandDeck';
import OmegaRichText from '../../src/OmegaRichText';
import type {Omega7Depth} from '../capabilityRegistry';

type Props={onNavigate:(route:string)=>void;depth:Omega7Depth};
const QUICK_TASKS=[
 ['Explain this','Explain the current state in plain language. Separate observations, derived results, projections, and uncertainty.'],
 ['Analyze evidence','Review the current evidence, contradictions, uncertainty, and strongest next observation.'],
 ['Build or repair','Inspect the current project state, identify the smallest safe change, then build and prove it without weakening existing authority.'],
 ['Explore Earth','Open Earth and weather using the current source-backed state.']
] as const;

const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
const readAddress=()=>clamp(Number(localState.read('omega.v6.address',11498)));

export default function CommandWorkspaceR439({onNavigate,depth}:Props){
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
   <div><span>Home · Ask OMEGA</span><h1>{depth==='STANDARD'?'What do you want to do?':'Ask OMEGA'}</h1><p>{depth==='STANDARD'?'Ask a question, analyze something, continue a project, or start a build. OMEGA chooses the underlying capabilities and keeps evidence, execution, and proof separate.':'One governed task surface for questions, analysis, building, repair, and capability routing.'}</p></div>
   <aside><b>{depth==='STANDARD'?'Analysis ready':`${modes.appliedCount} source-backed modes available`}</b><small>{depth==='STANDARD'?`${modes.gatedCount} capabilities currently gated by missing inputs`:`${modes.gatedCount} gated · state ${record.stateId.toLocaleString()}`}</small></aside>
  </header>
  {depth==='STANDARD'?
   <div className='o7-native-surface o7-command-simple'>
    <section className='o7-command-compose'>
     <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void run()}}} placeholder='Ask OMEGA anything or describe what you want done…' aria-label='Ask OMEGA'/>
     <div className='o7-command-compose-actions'><span>{busy?busy==='routing'?'Choosing the right path…':'Working…':'Enter to run · Shift+Enter for a new line'}</span><button onClick={()=>void run()} disabled={!prompt.trim()||Boolean(busy)}>{busy?'Working…':'Run OMEGA'}</button></div>
    </section>
    <div className='o7-command-suggestions'>{QUICK_TASKS.map(([label,value])=><button key={label} onClick={()=>label==='Explore Earth'?onNavigate('Earth Now'):setPrompt(value)}><b>{label}</b><span>{label==='Explore Earth'?'Open live Earth, weather, satellite, motion, and ground evidence.':value}</span></button>)}</div>
    {response&&<section className='o7-command-result' data-status={response.evidenceStatus||'RETURNED'}>
     <header><div><span>Result</span><b>{response.modelSucceeded===false?'OMEGA could not complete this path':'OMEGA response'}</b></div><small>{response.evidenceStatus||'RETURNED'}</small></header>
     <OmegaRichText text={String(response.answer||'')}/>
     {response.nextAction&&<div className='o7-command-next'><b>Next useful action</b><span>{response.nextAction}</span></div>}
     <details><summary>Why this result?</summary><dl><div><dt>Route</dt><dd>{response.responsePath||'ROUTED'}</dd></div><div><dt>Evidence state</dt><dd>{response.evidenceStatus||'UNKNOWN'}</dd></div><div><dt>Current state</dt><dd>{record.stateId.toLocaleString()}</dd></div><div><dt>Applied modes</dt><dd>{modes.appliedCount}</dd></div><div><dt>Gated modes</dt><dd>{modes.gatedCount}</dd></div></dl><p>{response.uncertainty}</p></details>
    </section>}
    <footer className='o7-command-capability-links'><button onClick={()=>onNavigate('Projects')}>Projects</button><button onClick={()=>onNavigate('Earth Now')}>Earth & Weather</button><button onClick={()=>onNavigate('Development')}>Build Software</button><button onClick={()=>onNavigate('Evidence & Proof')}>Evidence</button></footer>
   </div>:
   <div className='o7-native-surface o7-command-native-surface'>
    <OmegaCommandDeck record={record} state={state} prompt={prompt} onPrompt={setPrompt} onRun={run} response={response} busy={busy} onNavigate={onNavigate}/>
   </div>}
 </section>;
}

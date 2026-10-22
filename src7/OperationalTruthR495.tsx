import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {Omega7Depth} from './capabilityRegistry';
import {useOmega7AppState} from './appState';

type TruthKey='core'|'release'|'receipt'|'hybrid';
type TruthSnapshot={core:any;release:any;receipt:any;hybrid:any};
type Props={depth:Omega7Depth;onNavigate:(route:string)=>void};

export const R495_OPERATIONAL_TRUTH_CONTRACT=Object.freeze({
 schema:'OMEGA7_OPERATIONAL_TRUTH_R495',
 sources:['/api/core-health','/api/release-evidence','/omega-build-receipt.json','/api/hybrid/status'] as const,
 refreshPolicy:'MOUNT_FOCUS_VISIBILITY_MANUAL_NO_BACKGROUND_INTERVAL',
 truthRule:'RETURNED_RUNTIME_EVIDENCE_STAYS_SEPARATE_FROM_SOURCE_LINEAGE_DEVICE_PROOF_AND_CANON_ADMISSION',
 canonicalMutation:false
});

const short=(value:any,n=12)=>{
 const text=String(value||'').trim();
 return text?text.length>n?`${text.slice(0,n)}…`:text:'UNAVAILABLE';
};

async function getJson(path:string){
 const response=await fetch(path,{cache:'no-store',headers:{'cache-control':'no-cache','pragma':'no-cache'}});
 const raw=await response.text();
 if(!response.ok)throw new Error(`HTTP ${response.status}${raw?` · ${raw.slice(0,120)}`:''}`);
 return JSON.parse(raw);
}

export default function OperationalTruthR495({depth,onNavigate}:Props){
 const{dispatch}=useOmega7AppState();
 const mounted=useRef(true);
 const[snapshot,setSnapshot]=useState<TruthSnapshot>({core:null,release:null,receipt:null,hybrid:null});
 const[errors,setErrors]=useState<Record<string,string>>({});
 const[observedAt,setObservedAt]=useState('');
 const[busy,setBusy]=useState(false);

 const refresh=useCallback(async()=>{
  setBusy(true);
  const entries:[TruthKey,Promise<any>][]=[
   ['core',getJson('/api/core-health')],
   ['release',getJson('/api/release-evidence')],
   ['receipt',getJson('/omega-build-receipt.json')],
   ['hybrid',getJson('/api/hybrid/status')]
  ];
  const settled=await Promise.allSettled(entries.map(([,request])=>request));
  if(!mounted.current)return;
  const next:TruthSnapshot={core:null,release:null,receipt:null,hybrid:null},nextErrors:Record<string,string>={};
  settled.forEach((result,index)=>{
   const key=entries[index][0];
   if(result.status==='fulfilled')next[key]=result.value;
   else nextErrors[key]=result.reason instanceof Error?result.reason.message:String(result.reason);
  });
  setSnapshot(next);setErrors(nextErrors);setObservedAt(new Date().toISOString());setBusy(false);

  const promoted=String(next.receipt?.promotion?.promotedMergeSha||next.receipt?.source?.sha||'').trim();
  const releaseSha=String(next.release?.source?.sha||'').trim();
  const coreLive=next.core?.ok===true&&next.core?.state==='LIVE';
  const sourceBound=/^[0-9a-f]{40}$/i.test(promoted)&&promoted===releaseSha;
  const runtimeVersion=String(next.release?.runtimeVersion?.id||'').trim();
  dispatch({type:'HEALTH',key:'cloud',value:next.core&&next.core?.ok===false?'FAILED':coreLive&&sourceBound&&runtimeVersion?'READY':Object.keys(nextErrors).some(k=>k!=='hybrid')?'DEGRADED':'HELD'});
  dispatch({type:'HEALTH',key:'device',value:next.hybrid?.nativeExecutionClaimed===true?'READY':next.hybrid?'HELD':nextErrors.hybrid?'DEGRADED':'UNKNOWN'});
 },[dispatch]);

 useEffect(()=>{
  mounted.current=true;
  void refresh();
  const focus=()=>void refresh();
  const visible=()=>{if(document.visibilityState==='visible')void refresh()};
  window.addEventListener('focus',focus);
  document.addEventListener('visibilitychange',visible);
  return()=>{mounted.current=false;window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',visible)};
 },[refresh]);

 const view=useMemo(()=>{
  const promoted=String(snapshot.receipt?.promotion?.promotedMergeSha||snapshot.receipt?.source?.sha||'').trim();
  const releaseSha=String(snapshot.release?.source?.sha||'').trim();
  const candidate=String(snapshot.release?.promotionLineage?.candidateSha||snapshot.receipt?.promotion?.candidateSha||'').trim();
  const rollback=String(snapshot.release?.promotionLineage?.rollbackSha||snapshot.receipt?.promotion?.rollbackSha||'').trim();
  const coreLive=snapshot.core?.ok===true&&snapshot.core?.state==='LIVE';
  const sourceBound=/^[0-9a-f]{40}$/i.test(promoted)&&promoted===releaseSha;
  const runtimeVersion=String(snapshot.release?.runtimeVersion?.id||'').trim();
  const deviceOnline=snapshot.hybrid?.nativeExecutionClaimed===true;
  const returned=Object.values(snapshot).filter(Boolean).length;
  return{promoted,releaseSha,candidate,rollback,coreLive,sourceBound,runtimeVersion,deviceOnline,returned};
 },[snapshot]);

 const state=busy&&!observedAt?'LOADING':view.coreLive&&view.sourceBound&&view.runtimeVersion?'READY':view.returned||Object.keys(errors).length?'PARTIAL':'LOADING';

 return <section className='o7-operational-truth' data-r495-operational-truth='true' data-r495-state={state.toLowerCase()}>
  <header>
   <div><span>R495 · live operational truth</span><h2>What is actually running right now</h2><p>Production identity, exact source lineage, Worker runtime and physical-device proof are read independently. A provider or device hold does not erase a healthy core runtime.</p></div>
   <button type='button' onClick={()=>void refresh()} disabled={busy}>{busy?'Checking…':'Refresh'}</button>
  </header>
  <div className='o7-operational-grid'>
   <article data-state={view.coreLive?'ready':snapshot.core?'hold':'unknown'}><span>Production</span><b>{view.coreLive?'LIVE':snapshot.core?'HOLD':'UNKNOWN'}</b><small>{snapshot.core?.schema||errors.core||'First-hand core health pending'}</small></article>
   <article data-state={view.sourceBound?'ready':view.promoted?'hold':'unknown'}><span>Source</span><b>{view.sourceBound?short(view.promoted):view.promoted?'MISMATCH':'UNKNOWN'}</b><small>{view.sourceBound?'Receipt and release evidence agree':errors.receipt||errors.release||'Exact promoted SHA pending'}</small></article>
   <article data-state={view.runtimeVersion?'ready':'unknown'}><span>Worker</span><b>{short(view.runtimeVersion)}</b><small>{view.runtimeVersion?'Cloudflare runtime identity returned':errors.release||'Runtime version pending'}</small></article>
   <article data-state={view.deviceOnline?'ready':snapshot.hybrid?'hold':'unknown'}><span>Device</span><b>{view.deviceOnline?'PROVED ONLINE':snapshot.hybrid?'PROOF GATED':'UNKNOWN'}</b><small>{view.deviceOnline?'Current authenticated native execution evidence returned':errors.hybrid||'No current native execution proof claimed'}</small></article>
  </div>
  <footer>
   <div><span>{observedAt?`First-hand refresh ${observedAt}`:'Reading current runtime evidence…'}</span><small>{Object.keys(errors).length?`${Object.keys(errors).length} source hold(s); returned lanes remain visible.`:'Read-only observation · no canonical mutation.'}</small></div>
   <nav aria-label='Operational truth destinations'><button type='button' onClick={()=>onNavigate('Evidence & Proof')}>Evidence & Proof</button><button type='button' onClick={()=>onNavigate('System')}>System</button></nav>
  </footer>
  {depth!=='STANDARD'&&<details><summary>Release lineage</summary><dl><div><dt>Promoted</dt><dd>{view.promoted||'UNAVAILABLE'}</dd></div><div><dt>Release source</dt><dd>{view.releaseSha||'UNAVAILABLE'}</dd></div><div><dt>Candidate</dt><dd>{view.candidate||'EXTERNAL / UNAVAILABLE'}</dd></div><div><dt>Rollback</dt><dd>{view.rollback||'EXTERNAL / UNAVAILABLE'}</dd></div><div><dt>Proof boundary</dt><dd>Runtime health, deployment lineage, provider state, device execution and Canon admission remain separate claims.</dd></div></dl></details>}
 </section>;
}

import {useCallback,useEffect,useMemo,useState} from 'react';
import {Activity,BrainCircuit,CloudCog,Cpu,Database,GitBranch,Layers3,RefreshCw,Route,ShieldCheck,Waypoints,Wrench} from 'lucide-react';
import {api} from './platformAdapter';
import {wholeSystemConvergenceManifestR155} from './system/wholeSystemConvergenceR155.js';
import {compileFullOverallCanonR245,R245_REVISION} from './system/fullOverallCanonR245.js';
import './fullOverallCanonR245.css';

type RawObservation={
 core?:any;operational?:any;convergence?:any;hybrid?:any;connector?:any;selfbuild?:any;receipt?:any;
};
type ObservationError={source:string;message:string};
const SOURCES=['core','operational','convergence','hybrid','connector','selfbuild','receipt'] as const;

async function staticJson(path:string){
 const response=await fetch(path,{cache:'no-store'});
 if(!response.ok)throw new Error(`${path} HTTP ${response.status}`);
 return response.json();
}

const ageLabel=(at:number)=>{
 if(!at)return 'not observed';
 const age=Math.max(0,Date.now()-at);
 if(age<1000)return 'now';
 if(age<60000)return `${Math.floor(age/1000)}s ago`;
 return `${Math.floor(age/60000)}m ago`;
};
const shortSha=(sha?:string|null)=>sha?sha.slice(0,12):'—';
const truthClass=(state?:string)=>{
 const s=String(state||'').toUpperCase();
 return /LIVE|PASS|VERIFIED|RETURNED|ADMITTED|READY/.test(s)?'pass':/DEGRADED|WAITING|REQUIRED|UNPROVEN|UNKNOWN|NOT_RETURNED/.test(s)?'hold':'neutral';
};

export default function FullOverallCanonR245({onNavigate}:{onNavigate:(name:string)=>void}){
 const[raw,setRaw]=useState<RawObservation>({});
 const[errors,setErrors]=useState<ObservationError[]>([]);
 const[observedAt,setObservedAt]=useState(0);
 const[epoch,setEpoch]=useState(0);
 const[busy,setBusy]=useState(false);
 const capabilities=useMemo(()=>wholeSystemConvergenceManifestR155(),[]);

 const refresh=useCallback(async()=>{
  if(busy)return;
  setBusy(true);
  const requests=[
   ['core',()=>api.get('/api/core-health').then(r=>r.data)],
   ['operational',()=>api.get('/api/system/operational').then(r=>r.data)],
   ['convergence',()=>api.get('/api/system/convergence').then(r=>r.data)],
   ['hybrid',()=>api.get('/api/hybrid/status').then(r=>r.data)],
   ['connector',()=>api.get('/api/hybrid/connector-manifest').then(r=>r.data)],
   ['selfbuild',()=>staticJson('/omega-r170-selfbuild-state.json')],
   ['receipt',()=>staticJson('/omega-build-receipt.json')]
  ] as const;
  const settled=await Promise.allSettled(requests.map(([,run])=>run()));
  const patch:RawObservation={},nextErrors:ObservationError[]=[];
  settled.forEach((result,index)=>{
   const source=requests[index][0];
   if(result.status==='fulfilled')patch[source]=result.value;
   else nextErrors.push({source,message:result.reason instanceof Error?result.reason.message:String(result.reason)});
  });
  setRaw(previous=>({...previous,...patch}));
  setErrors(nextErrors);
  setObservedAt(Date.now());
  setEpoch(value=>value+1);
  setBusy(false);
 },[busy]);

 useEffect(()=>{void refresh()},[]); // One initial observation. No duplicate polling plane.

 const canon=useMemo(()=>compileFullOverallCanonR245({
  ...raw,capabilities,observedAt:observedAt||Date.now()
 }),[raw,capabilities,observedAt]);
 const roadmap=canon.selfBuild.roadmap||[],recommended=canon.selfBuild.recommendedCapsule;
 const connectorMotion=raw.connector?.executionMotion?.revision||canon.hybrid.executionMotionRevision||'—';
 const errorSources=new Set(errors.map(x=>x.source));

 return <section className='r245-canon' data-r245-full-overall-canon='true' data-r245-epoch={epoch} data-r245-read-only='true'>
  <header className='r245-head'>
   <div className='r245-title'>
    <span>R245 · FULL OVERALL CANON · ONE OBSERVATION EPOCH</span>
    <h3>State + Relation + Memory + Computation + Observation + Action + Proof</h3>
    <p>{canon.continuityOperator}</p>
   </div>
   <div className='r245-head-actions'>
    <button type='button' onClick={()=>void refresh()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Observing…':'Refresh exact observation'}</button>
    <small>epoch {epoch||'—'} · {ageLabel(observedAt)} · {errors.length?`${errors.length} source gap${errors.length===1?'':'s'}`:'all returned sources coherent'}</small>
   </div>
  </header>

  <div className='r245-truth-grid' aria-label='R245 exact truth partitions'>
   <article className={truthClass(canon.runtime.state)}><Activity/><span>CANONICAL RUNTIME</span><b>{canon.runtime.state}</b><small>{canon.runtime.coreLive?'first-hand core live':'core proof incomplete'} · canonical request {canon.runtime.canonicalRequest?'YES':'NO/UNKNOWN'}</small></article>
   <article className={truthClass(canon.production.state)}><CloudCog/><span>PRODUCTION RECEIPT</span><b>{canon.production.state}</b><small>merge {shortSha(canon.production.promotedSha)} · receipt never equals Canon admission</small></article>
   <article className={truthClass(canon.hybrid.state)}><Cpu/><span>HYBRID / PC</span><b>{canon.hybrid.state}</b><small>{canon.hybrid.authenticatedCurrentDeviceProved?`${canon.hybrid.currentOnlineDeviceCount} authenticated current host`:'current private-host proof required'} · motion {connectorMotion}</small></article>
   <article className={canon.selfBuild.active?'pass':'hold'}><GitBranch/><span>GOVERNED SELF-BUILD</span><b>{canon.selfBuild.active?'ACTIVE':'INACTIVE / UNPROVEN'}</b><small>generation {canon.selfBuild.generation}/{canon.selfBuild.maxAutonomousGenerations||'—'} · planning cap {canon.selfBuild.maxParallelPlanningCells||'—'} · promotion {canon.selfBuild.exactSelfPromotionRevision||'—'}</small></article>
   <article className={canon.source.capabilities.admittedOwners?'pass':'hold'}><Layers3/><span>CAPABILITY FAMILIES</span><b>{canon.source.capabilities.familyCount} CURRENT FAMILIES</b><small>{canon.source.capabilities.admittedOwners} admitted owners · {canon.source.capabilities.proofGated} proof-gated · {canon.source.capabilities.integrationTargets} targets</small></article>
   <article className={errors.length?'hold':'pass'}><ShieldCheck/><span>OBSERVATION CLOSURE</span><b>{errors.length?`${SOURCES.length-errors.length}/${SOURCES.length} RETURNED`:`${SOURCES.length}/${SOURCES.length} RETURNED`}</b><small>{errors.length?errors.map(x=>x.source).join(', ')+' retained from prior good epoch where available':'missing evidence was not fabricated'}</small></article>
  </div>

  <section className='r245-axis-strip' aria-label='Full Overall Canon axes'>
   {canon.axes.map((axis:string,index:number)=><div key={axis}><code>{String(index+1).padStart(2,'0')}</code><b>{axis}</b></div>)}
  </section>

  <div className='r245-body-grid'>
   <section className='r245-panel r245-strata'>
    <header><BrainCircuit/><div><span>SEVEN PERMANENT STRATA</span><b>One body · specialized authority</b></div></header>
    <div>{canon.strata.map((layer:any,index:number)=><article key={layer.id}><code>{index+1}</code><div><b>{layer.label}</b><small>{layer.purpose}</small></div></article>)}</div>
   </section>

   <section className='r245-panel r245-scheduler'>
    <header><Waypoints/><div><span>RECURSIVE BUILD FABRIC</span><b>12 → 144 → 1,728 → 20,736 → 248,832</b></div></header>
    <div className='r245-levels'>{canon.schedulerLevels.map((level:any)=><article key={level.level}><strong>{level.level.toLocaleString()}</strong><span>{level.role.replaceAll('_',' ')}</span><small>{level.physicalDimensions?'INVALID PHYSICAL CLAIM':'logical/address resolution · not physical dimension count'}</small></article>)}</div>
    <div className='r245-organs'>{canon.organs.map((organ:string)=><span key={organ}>{organ.replaceAll('_',' ')}</span>)}</div>
   </section>
  </div>

  <section className='r245-panel r245-roadmap'>
   <header><Route/><div><span>R170/R240 RAPID BUILD PRESSURE</span><b>{recommended?`Next dependency-ready capsule: ${recommended.id} · ${recommended.title}`:'No dependency-ready declared capsule'}</b></div><strong>{canon.selfBuild.readyCapsules} READY</strong></header>
   <div className='r245-roadmap-grid'>{roadmap.map((item:any)=><article key={item.id} data-state={item.status}><div><code>{item.id}</code><strong>{item.status}</strong></div><b>{item.title}</b><small>{item.objective}</small><footer><span>pressure {item.pressure.toFixed(2)}</span><span>gain {item.expectedGain.toFixed(2)}</span><span>risk {item.risk}</span>{item.missingPrerequisites.length?<span>needs {item.missingPrerequisites.join(', ')}</span>:null}</footer></article>)}</div>
  </section>

  <section className='r245-authority'>
   <div><ShieldCheck/><div><span>AUTHORITY FENCE</span><b>R245 observes and orchestrates context; it does not mutate, execute, deploy or admit CanonState.</b><small>R125 admission · R141 return proof · R146 history · R147 dispatch · R239 resources · R240 exact promotion · R210 release control · R223 evolution · ci.yml production writer</small></div></div>
   <div className='r245-actions'>
    <button type='button' onClick={()=>onNavigate('Build Out')}><Wrench/>Run governed full build</button>
    <button type='button' onClick={()=>onNavigate('Hybrid Link')}><Cpu/>Connect / verify compute</button>
    <button type='button' onClick={()=>onNavigate('Evidence & Proof')}><Database/>Inspect evidence + proof</button>
   </div>
  </section>

  {errors.length>0&&<details className='r245-errors'><summary>Returned source gaps · exact errors</summary>{errors.map(error=><p key={error.source}><b>{error.source}</b><code>{error.message}</code></p>)}</details>}
 </section>
}

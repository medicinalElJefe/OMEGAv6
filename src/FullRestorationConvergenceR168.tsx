import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,RefreshCw,ShieldCheck,Waypoints} from 'lucide-react';
import {api} from './platformAdapter';
import {MASTER_MENUS} from './systemAtlasRuntime';
import {R48_COMPLETION_FAMILIES,R48_COMPLETION_SUMMARY} from './completionRuntimeR48';
import {assembleDevelopmentResidualWorldLensR166} from './world/developmentResidualWorldLensR166.js';
import './fullRestorationConvergenceR168.css';

type Props={record:any;address:number;onNavigate:(panel:string)=>void};
const executable=new Set(['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE']);
const safeJson=async(p:Promise<any>)=>{try{const r=await p;return r?.data??null}catch{return null}};
const routeOf=(surface:string)=>String(surface||'System Atlas').split('/')[0].trim()||'System Atlas';

export default function FullRestorationConvergenceR168({record,address,onNavigate}:Props){
 const[lens,setLens]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const active=useMemo(()=>R48_COMPLETION_FAMILIES.filter(x=>executable.has(x.successor)),[]),gated=useMemo(()=>R48_COMPLETION_FAMILIES.filter(x=>!executable.has(x.successor)),[]);
 const load=async()=>{setBusy(true);setError('');try{
  const[accuracy,core,release,attestation,hybrid]=await Promise.all([
   safeJson(api.get<any>('/omega-r125-accuracy-state.json')),
   safeJson(api.get<any>('/api/core-health')),
   safeJson(api.get<any>('/api/release-evidence')),
   safeJson(api.get<any>('/api/runtime-attestation')),
   safeJson(api.get<any>('/api/hybrid/status'))
  ]);
  const coreLive=core?.ok===true&&core?.state==='LIVE';
  const world=await assembleDevelopmentResidualWorldLensR166({accuracyState:accuracy||{},runtimeEvidence:{coreHealth:core,releaseEvidence:release,runtimeAttestation:attestation,hybrid},workflowEvidence:[],context:{observerId:'omega-r168-full-restoration',address,eventTime:Date.now(),projection:'WOVEN',metrics:{continuity:Number(record?.metrics?.continuity||0),plasticity:Number(record?.metrics?.plasticity||0),evidence:coreLive?.9:.35,uncertainty:coreLive?.18:.55}}});
  setLens(world);
 }catch(e:any){setError(e?.message||String(e));setLens(null)}finally{setBusy(false)}};
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),30000);return()=>window.clearInterval(id)},[address,record?.stateId]);
 const overlay=lens?.visualOverlay;
 return <section className='r168-restoration' aria-label='R168 full restoration convergence'>
  <header><div><span>R168 · FULL RESTORATION / CURRENT EXECUTION CONVERGENCE</span><h3>One lineage ledger · one current successor ledger · one live residual view</h3><p>Historical V24 registration remains provenance. Current operating truth comes from the R48/R153 successor ledger, while R166 projects read-only residual pressure from R125/R164/runtime evidence. This surface does not invent execution, device proof, scientific validity, or CanonState.</p></div><button onClick={()=>void load()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'CHECKING':'REFRESH LIVE TRUTH'}</button></header>
  <div className='r168-kpis'><article><span>SOFTWARE FAMILIES</span><b>{R48_COMPLETION_FAMILIES.length}</b><small>single 24-family current completion ledger</small></article><article><span>CURRENT IMPLEMENTED</span><b>{R48_COMPLETION_SUMMARY.executable}</b><small>web + source + local successors</small></article><article><span>TRUTH GATED</span><b>{R48_COMPLETION_SUMMARY.gated}</b><small>{gated.map(x=>x.id).join(' · ')||'none'}</small></article><article><span>RESIDUAL WORLD</span><b>{overlay?.state||'LOADING'}</b><small>{overlay?`${overlay.counts.total} residual · ${overlay.counts.review} review · ${overlay.counts.blocking} block`:'R166 evidence assembling'}</small></article></div>
  <section className='r168-successors'><header><ShieldCheck/><div><span>CURRENT SUCCESSOR EXECUTION · R48/R153/R168</span><b>{active.length} bounded operating families · {gated.length} explicit evidence/device gates · {R48_COMPLETION_SUMMARY.restorationDebt} successor restoration debt</b></div></header><div>{R48_COMPLETION_FAMILIES.map(x=>{const canOpen=executable.has(x.successor),route=routeOf(x.surface);return <article key={x.id}><div><code>{x.id}</code><span>{x.historical} → <b>{x.successor}</b></span></div><h4>{x.name}</h4><p>{x.proof}</p><small>{x.remaining}</small>{canOpen?<button onClick={()=>onNavigate(route)}>OPEN {route.toUpperCase()} <ArrowRight/></button>:<div className='r168-gated'><ShieldCheck/>CURRENT PROOF GATE</div>}</article>})}</div></section>
  <section className='r168-residual-world'><header><Activity/><div><span>R166 DEVELOPMENT RESIDUAL → LIVING WORLD</span><b>{overlay?.action||'ASSEMBLING'}</b></div><small>visual/routing evidence only · no autonomous mutation</small></header>{error&&<div className='r168-error'>{error}</div>}<div className='r168-residual-grid'>{overlay?.residuals?.length?overlay.residuals.map((r:any)=><article key={r.id} data-severity={r.severity}><div><b>{r.severity}</b><code>{r.kind}</code></div><p>{r.summary}</p><small>{r.sourceAuthority} → {r.routeFamily}</small></article>):<article className='healthy'><b>{lens?'NO VISIBLE RESIDUAL PRESSURE':'LIVE EVIDENCE PENDING'}</b><p>{lens?'The current bounded residual lens returned no ranked residuals.':'No unsupported health claim is substituted while evidence loads.'}</p></article>}</div>{overlay?.targetFamilies?.length>0&&<div className='r168-targets'><span>GOVERNED REVIEW TARGETS</span>{overlay.targetFamilies.map((x:string)=><b key={x}>{x}</b>)}</div>}</section>
  <section className='r168-menus'><header><Waypoints/><div><span>12 MASTER OPERATIONAL INTENTS</span><b>Drive/software canon routes through the existing 44-surface workstation</b></div></header><div>{MASTER_MENUS.map(([id,name,target,purpose])=><button key={id} onClick={()=>onNavigate(target)}><code>{id}</code><span><b>{name}</b><small>{purpose}</small></span><ArrowRight/></button>)}</div></section>
  <footer><ShieldCheck/><span><b>Applied calculus boundary:</b> partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition. Whole/part, inner/outer, orientation, and representation remain frame-relative roles. 12 → 144 → 1,728 → 20,736 → 248,832 remain address/view/scheduling resolution levels, not unsupported physical dimensions. Returned work is not automatically verified, logical swarm fanout is not physical-worker proof, and R125 remains the only CanonState admission authority.</span></footer>
 </section>;
}

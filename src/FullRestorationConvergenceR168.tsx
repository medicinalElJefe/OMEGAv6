import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,RefreshCw,ShieldCheck,Waypoints} from 'lucide-react';
import {api} from './platformAdapter';
import {MASTER_MENUS} from './systemAtlasRuntime';
import {EFFECTIVE_SYSTEM_FAMILIES_R168,SUCCESSOR_EXECUTION_R168,systemFamilyExecutionSummaryR168} from './system/systemFamilyExecutionR168';
import {assembleDevelopmentResidualWorldLensR166} from './world/developmentResidualWorldLensR166.js';
import './fullRestorationConvergenceR168.css';

type Props={record:any;address:number;onNavigate:(panel:string)=>void};
const unresolved=new Set(['RESTORATION_DEBT','DONOR_ONLY','NATIVE_TARGET']);
const safeJson=async(p:Promise<any>)=>{try{const r=await p;return r?.data??null}catch{return null}};

export default function FullRestorationConvergenceR168({record,address,onNavigate}:Props){
 const[lens,setLens]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const summary=useMemo(()=>systemFamilyExecutionSummaryR168(),[]);
 const remaining=useMemo(()=>EFFECTIVE_SYSTEM_FAMILIES_R168.filter(x=>unresolved.has(x.effectiveStatus)),[]);
 const load=async()=>{setBusy(true);setError('');try{
  const[accuracy,core,release,attestation,hybrid]=await Promise.all([
   safeJson(api.get<any>('/omega-r125-accuracy-state.json')),
   safeJson(api.get<any>('/api/core-health')),
   safeJson(api.get<any>('/api/release-evidence')),
   safeJson(api.get<any>('/api/runtime-attestation')),
   safeJson(api.get<any>('/api/hybrid/status'))
  ]);
  const world=await assembleDevelopmentResidualWorldLensR166({accuracyState:accuracy||{},runtimeEvidence:{coreHealth:core,releaseEvidence:release,runtimeAttestation:attestation,hybrid},workflowEvidence:[],context:{observerId:'omega-r168-restoration-convergence',address,eventTime:Date.now(),projection:'WOVEN',metrics:{continuity:Number(record?.metrics?.continuity||0),plasticity:Number(record?.metrics?.plasticity||0),evidence:core?.ok===true?.9:.35,uncertainty:core?.ok===true?.18:.55}}});
  setLens(world);
 }catch(e:any){setError(e?.message||String(e));setLens(null)}finally{setBusy(false)}};
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),30000);return()=>window.clearInterval(id)},[address,record?.stateId]);
 const overlay=lens?.visualOverlay;
 return <section className='r168-restoration' aria-label='R168 full restoration convergence'>
  <header><div><span>R168 · FULL RESTORATION TRUTH CONVERGENCE</span><h3>One historical ledger · one effective execution view · one operator path</h3><p>R168 preserves the old V24 family status as lineage, then overlays the bounded successor executors that already exist. The R166 residual world is now visible to the operator instead of remaining a test-only module.</p></div><button onClick={()=>void load()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'CHECKING':'REFRESH LIVE TRUTH'}</button></header>
  <div className='r168-kpis'><article><span>SOFTWARE FAMILIES</span><b>{summary.familyCount}</b><small>Drive-aligned S00–S23</small></article><article><span>SUCCESSOR RESTORES</span><b>{summary.promoted.length}</b><small>S10 · S12 · S16 · S18 · S21</small></article><article><span>REMAINING DEBT / TARGET</span><b>{remaining.length}</b><small>{remaining.map(x=>x.id).join(' · ')||'none'}</small></article><article><span>RESIDUAL WORLD</span><b>{overlay?.state||'LOADING'}</b><small>{overlay?`${overlay.counts.total} residual · ${overlay.counts.review} review · ${overlay.counts.blocking} block`:'R166 evidence assembling'}</small></article></div>
  <section className='r168-successors'><header><ShieldCheck/><div><span>CURRENT SUCCESSOR EXECUTION</span><b>Restored code is no longer counted as missing software</b></div></header><div>{SUCCESSOR_EXECUTION_R168.map(x=>{const historical=EFFECTIVE_SYSTEM_FAMILIES_R168.find(f=>f.id===x.familyId);return <article key={x.familyId}><div><code>{x.familyId}</code><span>{historical?.historicalStatus} → <b>{x.effectiveStatus}</b></span></div><h4>{historical?.name}</h4><p>{x.boundary}</p><small>{x.sourceRevision} · {x.executor}</small><button onClick={()=>onNavigate(x.operatorRoute)}>OPEN {x.operatorRoute.toUpperCase()} <ArrowRight/></button></article>})}</div></section>
  <section className='r168-residual-world'><header><Activity/><div><span>R166 DEVELOPMENT RESIDUAL → LIVING WORLD</span><b>{overlay?.action||'ASSEMBLING'}</b></div><small>visual/routing evidence only · no autonomous mutation</small></header>{error&&<div className='r168-error'>{error}</div>}<div className='r168-residual-grid'>{overlay?.residuals?.length?overlay.residuals.map((r:any)=><article key={r.id} data-severity={r.severity}><div><b>{r.severity}</b><code>{r.kind}</code></div><p>{r.summary}</p><small>{r.sourceAuthority} → {r.routeFamily}</small></article>):<article className='healthy'><b>{lens?'NO VISIBLE RESIDUAL PRESSURE':'LIVE EVIDENCE PENDING'}</b><p>{lens?'The current R164/R166 view returned no ranked residuals.':'No unsupported health claim is substituted while evidence loads.'}</p></article>}</div>{overlay?.targetFamilies?.length>0&&<div className='r168-targets'><span>GOVERNED REVIEW TARGETS</span>{overlay.targetFamilies.map((x:string)=><b key={x}>{x}</b>)}</div>}</section>
  <section className='r168-menus'><header><Waypoints/><div><span>12 MASTER SOFTWARE INTENTS</span><b>Drive canon mapped onto the existing 44-route workstation</b></div></header><div>{MASTER_MENUS.map(([id,name,target,purpose])=><button key={id} onClick={()=>onNavigate(target)}><code>{id}</code><span><b>{name}</b><small>{purpose}</small></span><ArrowRight/></button>)}</div></section>
  <footer><ShieldCheck/><span><b>Applied calculus boundary:</b> partition → transform/exchange → invariant carry → scar/history carry → re-contextualize. 12 → 144 → 1,728 → 20,736 remain atlas/representation resolution levels, not extra physical dimensions. R168 changes execution truth and discoverability only; R125 remains sole CanonState admission authority and S22 native installer execution remains device/host proof gated.</span></footer>
 </section>;
}

import {useEffect,useMemo,useState} from 'react';
import {Activity,RefreshCw,ShieldCheck,Waypoints} from 'lucide-react';
import {deriveGeometricMotionFrameR170} from './selfBuildRuntimeR124';
import './autonomousBuildContinuumR170.css';

const CONTINUATION=[
 ['SB009','GEOMETRIC MOTION RELATIVITY FIELD'],
 ['SB010','DEVELOPMENT MOTION SCHEDULER'],
 ['SB011','AUTONOMOUS BUILD PULSE GOVERNOR'],
 ['SB012','PROOF-CARRY PROMOTION GATE']
] as const;
const MAX_GENERATION=12;
const safeFetch=async(path:string)=>{try{const r=await fetch(path,{cache:'no-store'});return r.ok?await r.json():null}catch{return null}};

export default function AutonomousBuildContinuumR170({onNavigate}:{onNavigate:(name:string)=>void}){
 const[state,setState]=useState<any>(null),[candidate,setCandidate]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const refresh=async()=>{setBusy(true);setError('');try{const[s,c]=await Promise.all([safeFetch('/omega-r124-selfbuild-state.json'),safeFetch('/omega-r124-selfbuild-candidate.json')]);setState(s);setCandidate(c)}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),30000);return()=>window.clearInterval(id)},[]);
 const admitted=new Set<string>(Array.isArray(state?.admitted)?state.admitted:[]),remaining=CONTINUATION.filter(([id])=>!admitted.has(id));
 const roadmap=Array.isArray(state?.roadmap)?state.roadmap:[],frame=useMemo(()=>state&&roadmap.length?deriveGeometricMotionFrameR170(state,roadmap):null,[state,roadmap.length]);
 const generation=Number(state?.generation||0),effectiveMax=Math.max(MAX_GENERATION,Number(state?.maxAutonomousGenerations||0)),next=String(state?.currentCapsuleId||remaining[0]?.[0]||''),running=Boolean(state?.active)&&generation<effectiveMax&&remaining.length>0;
 const phase=frame?.phaseBand==null?'—':`${Number(frame.phaseBand)+1}/12`,orientation=frame?.orientation===1?'+1 OUTVERSE':frame?.orientation===-1?'−1 INVERSE':'0 NEUTRAL';
 return <section className='r170-autobuild' aria-label='R170 geometric motion autonomous build continuum'>
  <header><div><span>R170 · GEOMETRIC MOTION AUTONOMOUS BUILD</span><h3>Observe → prioritize → sandbox → prove → freshness check → admit → pulse again</h3><p>The self-build loop no longer stops falsely at legacy generation 8. R170 extends the declared governed roadmap to generation 12, wakes on hourly observation pulses, and immediately triggers the next generation after a successful admission.</p></div><button onClick={()=>void refresh()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'READING':'REFRESH BUILD STATE'}</button></header>
  <div className='r170-autobuild-kpis'><article><span>GENERATION</span><b>{generation}/{effectiveMax}</b><small>{running?'continuation available':'observe / hold boundary'}</small></article><article><span>NEXT DECLARED</span><b>{next||'OBSERVE'}</b><small>{remaining[0]?.[1]||'no undeclared capability is invented'}</small></article><article><span>MOTION PHASE</span><b>{phase}</b><small>{orientation}</small></article><article><span>RESOLUTION</span><b>{frame?.effectiveResolution?.toLocaleString?.('en-US')||'—'}</b><small>representational scheduling level</small></article><article><span>CONTINUITY</span><b>{frame?Number(frame.continuity).toFixed(3):'—'}</b><small>invariant carry {frame?Number(frame.invariantCarry).toFixed(3):'—'}</small></article><article><span>RESIDUAL</span><b>{frame?Number(frame.residual).toFixed(3):'—'}</b><small>repartition {frame?Number(frame.repartitionDemand).toFixed(3):'—'}</small></article></div>
  <div className='r170-motion-line'>{CONTINUATION.map(([id,label],i)=>{const done=admitted.has(id),active=id===next;return <article key={id} data-done={done?'true':'false'} data-active={active?'true':'false'}><code>{id}</code><span><b>{label}</b><small>{done?'ADMITTED':active?'NEXT RELATIVE-MOTION TARGET':'DEPENDENCY-ORDERED'}</small></span>{i<CONTINUATION.length-1&&<Waypoints/>}</article>})}</div>
  <div className='r170-autobuild-proof'><ShieldCheck/><span><b>{running?'AUTONOMOUS CONTINUATION ARMED':'OBSERVATION BOUNDARY'}</b><small>Geometric motion changes build priority only inside the declared backlog. Repository mutation still requires an isolated sandbox candidate, focused + inherited tests, unchanged main SHA, rollback lineage and proof-gated admission. RETURNED ≠ VERIFIED and R125 remains the only CanonState admission authority.</small></span></div>
  {candidate&&<div className='r170-candidate'><Activity/><span><b>LAST CANDIDATE · {candidate?.capsule?.id||candidate?.receipt?.capsuleId||'UNKNOWN'}</b><small>{candidate?.admission||candidate?.receipt?.status||'proposal state'} · generation {candidate?.generation??'—'} · score {Number(candidate?.score||0).toFixed(3)}</small></span></div>}
  {error&&<div className='r170-error'>{error}</div>}
  <footer><button onClick={()=>onNavigate('Evidence & Proof')}>OPEN PROOF</button><button onClick={()=>onNavigate('System Atlas')}>SYSTEM ATLAS</button><span>partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition</span></footer>
 </section>
}

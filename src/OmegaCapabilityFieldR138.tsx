import {useMemo} from 'react';
import {Activity,ArrowRight,Blocks,BrainCircuit,Earth,GitBranch,Link2,Route,ShieldCheck,Sparkles,Waypoints,Wrench} from 'lucide-react';
import {corpusState,decodeAddress} from './corpusRuntime';
import {calculusVisualLaw,operatorColor} from './calculusVisualLawR37';
import {compileUnifiedCapabilityRuntimeR139} from './unifiedCapabilityEngineR139';
import {rankUnifiedCapabilityActionsR140} from './unifiedOperationFabricR140';
import './capabilityFirstR138.css';

type Props={panel:string;record:any;address:number;onAddress:(n:number)=>void;onNavigate:(p:string)=>void;status?:any;restore?:any};
type Action={id:string;label:string;detail:string;route?:string;address?:number;kind:'STATE'|'ROUTE'|'EXECUTE'|'PROVE'|'BUILD'|'EXPLORE'|'INTELLIGENCE'|'GOVERN'|'SYSTEM'};
const CANDIDATE_AUTHORITY='PROJECTION_NOT_CANON_ADMISSION';
const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
const n01=(v:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
const fmt=(n:any)=>Number.isFinite(Number(n))?Number(n).toFixed(3):'—';
const ICONS:Record<string,any>={'Hybrid Link':Link2,'Build Out':Wrench,'Development':Blocks,'Evidence & Proof':ShieldCheck,'Validation':ShieldCheck,'System Atlas':Waypoints,'Control Matrix':Waypoints,'Earth Now':Earth,'SAI Lab':BrainCircuit,'Kernel Intelligence':BrainCircuit,'Modes':BrainCircuit,'Plugins':Blocks,'Traversal':Route,'Matter Traversal':Activity,'Visual Instrument':Sparkles,'Forecast':GitBranch,'Convergence':GitBranch};
function nextCandidates(record:any){const seen=new Set<number>();return Object.entries(record?.autoPing||{}).filter(([,v])=>typeof v==='number'&&Number.isFinite(v as number)).map(([relation,v])=>({relation,address:clamp(v as number)})).filter(x=>!seen.has(x.address)&&seen.add(x.address)).slice(0,8)}
function scoreCandidate(record:any,law:any){const m=record?.metrics||{};return .24*n01(law?.routeStrength)+.18*n01(law?.u?.unifiedCoherence)+.14*n01(law?.u?.C)+.10*n01(law?.u?.Phi)+.12*n01(law?.u?.evidence)+.08*(1-n01(law?.contradictionPressure))+.06*(1-n01(law?.u?.Lambda??m.burden))+.04*(1-n01(m.uncertainty))+.04*(1-n01(m.scar))}

export default function OmegaCapabilityFieldR138({panel,record,address,onAddress,onNavigate,status,restore}:Props){
 const law=useMemo(()=>calculusVisualLaw(record),[record]);
 const runtime=useMemo(()=>compileUnifiedCapabilityRuntimeR139(record,panel,''),[record,panel]);
 const operation=useMemo(()=>rankUnifiedCapabilityActionsR140(runtime,record),[runtime,record]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const candidates=useMemo(()=>nextCandidates(record).map(x=>{const r=corpusState(x.address),l=calculusVisualLaw(r);return{...x,record:r,law:l,score:scoreCandidate(r,l)}}).sort((a,b)=>b.score-a.score),[record]);
 const actions:Action[]=[...operation.actions.slice(0,6).map(x=>({id:'route:'+x.route,label:x.route,detail:`${x.reason} · ${x.readiness} · signal ${fmt(x.score)}`,route:x.route,kind:x.kind})),...candidates.slice(0,4).map((x,i)=>({id:'state:'+x.address,label:i===0?'Ranked projected next':'Projected candidate '+(i+1),detail:`${x.relation} · STATE ${x.record.stateId} · rank ${fmt(x.score)} · U ${fmt(x.law.u.unifiedCoherence)} · evidence ${fmt(x.law.u.evidence)}`,address:x.address,kind:'STATE' as const}))];
 const uncertainty=n01(record?.metrics?.uncertainty),rings=[law.u.C,law.u.Phi,1-law.u.q,1-law.u.Lambda,law.u.evidence,1-uncertainty].map((v,i)=>({v:n01(v),r:70+i*24}));
 const nodes=actions.slice(0,8).map((a,i)=>{const angle=-Math.PI/2+i*Math.PI*2/Math.max(1,Math.min(8,actions.length)),radius=150+(i%2)*42;return{...a,x:320+Math.cos(angle)*radius,y:230+Math.sin(angle)*radius}});
 const runtimeObserved=Boolean(status&&!status.error),continuityObserved=Boolean(restore&&!restore.error);
 const runAction=(action:Action)=>{if(action.route)onNavigate(action.route);else if(action.address!==undefined)onAddress(action.address)};
 const runKey=(e:any,action:Action)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();runAction(action)}};
 return <section className='r138-capability-field' data-panel={panel} data-visual-policy='CAPABILITY_FIRST_NO_STALE_CHART_PRIMARY' data-unified-runtime='R139' data-operation-fabric='R140' data-candidate-authority={CANDIDATE_AUTHORITY} data-canonical-mutation='false'>
  <header className='r138-capability-head'><div><span>R140 · UNIFIED LIVING OPERATION FABRIC · R139.1 CAPABILITY ENGINE</span><h2>{panel}</h2><p>Operate one coherent runtime from the current source state. Full Overall mode planning drives registered capability routes, then R140 prioritizes those routes from current CΩ/Φ/evidence/contradiction/burden and executable-mode coverage. Gated and catalog-only modes remain non-executed. Selecting a STATE changes the local projection only; R125 canonical admission remains a separate proof-gated operation.</p></div><div className='r138-health'><b>{runtimeObserved?'RUNTIME OBSERVATION PRESENT':'RUNTIME UNVERIFIED'}</b><small>{continuityObserved?'continuity observation present':'continuity observation unverified'}</small></div></header>
  <div className='r138-capability-layout'>
   <div className='r138-live-stage' role='group' aria-label='Interactive capability topology; select a spatial node to operate that capability or projected state'>
    <svg viewBox='0 0 640 460' role='img' aria-label='Interactive capability topology around the current source state'>
     <defs><radialGradient id='r138-core'><stop offset='0%' stopColor={operatorColor(law,'OMEGA',.7)}/><stop offset='100%' stopColor='transparent'/></radialGradient></defs>
     {rings.map((x,i)=><circle key={i} cx='320' cy='230' r={x.r} className='r138-shell' style={{opacity:.15+.45*x.v}}/>)}
     {nodes.map(n=><g key={n.id} className='r138-node' data-kind={n.kind} role='button' tabIndex={0} aria-label={`${n.kind}: ${n.label}. ${n.detail}`} onClick={()=>runAction(n)} onKeyDown={e=>runKey(e,n)}><line x1='320' y1='230' x2={n.x} y2={n.y}/><circle cx={n.x} cy={n.y} r={n.kind==='STATE'?13:18}/><text x={n.x} y={n.y+32} textAnchor='middle'>{n.label.slice(0,19)}</text><text x={n.x} y={n.y+45} textAnchor='middle' className='r138-node-sub'>{n.kind}</text></g>)}
     <circle cx='320' cy='230' r='66' fill='url(#r138-core)' className='r138-core-halo'/><circle cx='320' cy='230' r='42' className='r138-core'/><text x='320' y='218' textAnchor='middle' className='r138-core-label'>STATE {record.stateId}</text><text x='320' y='238' textAnchor='middle' className='r138-core-value'>D{coords.d+1} P{coords.p+1} R{coords.r+1} L{coords.l+1}</text><text x='320' y='256' textAnchor='middle' className='r138-core-sub'>{String(record.metrics?.decision||'—')}</text>
    </svg>
    <span className='r138-stage-hint'>Spatial nodes are live controls · STATE selects a local projection · registered capability nodes open bounded execution surfaces · Hybrid still requires current device proof</span>
   </div>
   <aside className='r138-action-stack'>{actions.map(action=>{const Icon=action.route?ICONS[action.route]||ArrowRight:Waypoints;return <button key={action.id} data-kind={action.kind} onClick={()=>runAction(action)}><Icon/><span><b>{action.label}</b><small>{action.detail}</small></span><ArrowRight/></button>})}</aside>
  </div>
  <footer className='r138-capability-ledger'><span>CΩ <b>{fmt(law.u.C)}</b></span><span>Φ <b>{fmt(law.u.Phi)}</b></span><span>q <b>{fmt(law.u.q)}</b></span><span>Λ <b>{fmt(law.u.Lambda)}</b></span><span>evidence <b>{fmt(law.u.evidence)}</b></span><span>modes considered <b>{runtime.modes.considered}</b></span><span>executable <b>{runtime.modes.executable}</b></span><span>mode coverage <b>{fmt(operation.modeCoverage)}</b></span><span>gated <b>{runtime.modes.gated}</b></span><span>catalog-only <b>{runtime.modes.catalogLens}</b></span><span>authority <b>PROJECTION ≠ ADMISSION</b></span></footer>
 </section>
}

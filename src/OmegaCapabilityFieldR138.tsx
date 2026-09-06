import {useMemo} from 'react';
import {Activity,ArrowRight,Blocks,BrainCircuit,Earth,GitBranch,Link2,Route,ShieldCheck,Sparkles,Waypoints,Wrench} from 'lucide-react';
import {corpusState,decodeAddress} from './corpusRuntime';
import {calculusVisualLaw,operatorColor} from './calculusVisualLawR37';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import './capabilityFirstR138.css';

type Props={panel:string;record:any;address:number;onAddress:(n:number)=>void;onNavigate:(p:string)=>void;status?:any;restore?:any};
type Action={id:string;label:string;detail:string;route?:string;address?:number;kind:'STATE'|'ROUTE'|'EXECUTE'|'PROVE'|'BUILD'|'EXPLORE'};
const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0));
const fmt=(n:any)=>Number.isFinite(Number(n))?Number(n).toFixed(3):'—';
const ROUTE_BY_PANEL:Record<string,string[]>= {
 'Field':['Matter Traversal','Traversal','Visual Instrument','Evidence & Proof'],
 'Data Motion':['Traversal','Relativity','Forecast','Convergence'],
 'Convergence':['Build Out','Evidence & Proof','Governance','Hybrid Link'],
 'Projects':['Build Out','Development','Assets','Evidence & Proof'],
 'Render Queue':['Visual Instrument','Build Out','Evidence & Proof','Assets'],
 'Assets':['Create','Build Out','Projects','Evidence & Proof'],
 'Evidence & Proof':['Validation','System Atlas','Archive Census','Hybrid Link'],
 'Memory':['Archive Census','Canon Evolution','Evidence & Proof','SAI Lab'],
 'Canon Evolution':['Governance','Validation','System Atlas','SAI Lab'],
 'Governance':['Evidence & Proof','Validation','System Atlas','Convergence'],
 'Consolidation':['System Atlas','Control Matrix','Validation','Build Out'],
 'Instructions':['System Atlas','Settings','Command Center','Build Out'],
 'Settings':['System','Plugins','Control Matrix','Hybrid Link'],
 'System':['System Atlas','Control Matrix','Hybrid Link','Validation']
};
const ICONS:Record<string,any>={
 'Hybrid Link':Link2,'Build Out':Wrench,'Development':Blocks,'Evidence & Proof':ShieldCheck,'Validation':ShieldCheck,'System Atlas':Waypoints,'Control Matrix':Waypoints,'Earth Now':Earth,'SAI Lab':BrainCircuit,'Traversal':Route,'Matter Traversal':Activity,'Visual Instrument':Sparkles,'Forecast':GitBranch,'Convergence':GitBranch
};
function nextCandidates(record:any){const seen=new Set<number>();return Object.entries(record?.autoPing||{}).filter(([,v])=>typeof v==='number'&&Number.isFinite(v as number)).map(([kind,v])=>({kind,address:clamp(v as number)})).filter(x=>!seen.has(x.address)&&seen.add(x.address)).slice(0,8)}
function actionKind(route:string):Action['kind']{if(route==='Hybrid Link')return'EXECUTE';if(route==='Evidence & Proof'||route==='Validation'||route==='System Atlas')return'PROVE';if(route==='Build Out'||route==='Development'||route==='Create')return'BUILD';return'EXPLORE'}

export default function OmegaCapabilityFieldR138({panel,record,address,onAddress,onNavigate,status,restore}:Props){
 const law=useMemo(()=>calculusVisualLaw(record),[record]);
 const modes=useMemo(()=>sourceBackedModeSummary(record),[record]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const candidates=useMemo(()=>nextCandidates(record).map(x=>{const r=corpusState(x.address),l=calculusVisualLaw(r);return{...x,record:r,law:l,score:.38*l.routeStrength+.24*l.u.unifiedCoherence+.18*l.u.evidence+.12*(1-l.contradictionPressure)+.08*l.u.Phi}}).sort((a,b)=>b.score-a.score),[record]);
 const routes=(ROUTE_BY_PANEL[panel]||['Command Center','Visual Instrument','Evidence & Proof','Build Out']).filter(Boolean);
 const actions:Action[]=[...routes.map(route=>({id:'route:'+route,label:route,detail:route==='Hybrid Link'?'paired-host execution and returned proof':route==='Evidence & Proof'?'inspect proof, source and lineage':route==='Build Out'?'assemble and verify working output':'open active capability',route,kind:actionKind(route)})),...candidates.slice(0,4).map((x,i)=>({id:'state:'+x.address,label:i===0?'Admitted next':'Candidate '+(i+1),detail:`STATE ${x.record.stateId} · U ${fmt(x.law.u.unifiedCoherence)} · proof ${fmt(x.law.u.evidence)}`,address:x.address,kind:'STATE' as const}))];
 const rings=[law.u.C,law.u.Phi,1-law.u.q,1-law.u.Lambda,law.u.evidence,1-law.u.uncertainty].map((v,i)=>({v:Number(v)||0,r:70+i*24}));
 const nodes=actions.slice(0,8).map((a,i)=>{const angle=-Math.PI/2+i*Math.PI*2/Math.max(1,Math.min(8,actions.length)),radius=150+(i%2)*42;return{...a,x:320+Math.cos(angle)*radius,y:230+Math.sin(angle)*radius}});
 const runtimeHealthy=Boolean(status&&!status.error),restoreHealthy=Boolean(restore&&!restore.error);
 return <section className='r138-capability-field' data-panel={panel} data-visual-policy='CAPABILITY_FIRST_NO_STALE_CHART_PRIMARY'>
  <header className='r138-capability-head'><div><span>R138 · ACTIVE CAPABILITY FIELD</span><h2>{panel}</h2><p>Operate the system from the living state. Plot-only destinations are retired from the primary hierarchy: choose a route, commit a candidate state, execute a host path, prove a result, or open a specialist instrument.</p></div><div className='r138-health'><b>{runtimeHealthy?'RUNTIME PRESENT':'RUNTIME UNVERIFIED'}</b><small>{restoreHealthy?'continuity surface present':'restore surface unverified'}</small></div></header>
  <div className='r138-capability-layout'>
   <button className='r138-live-stage' onClick={()=>candidates[0]&&onAddress(candidates[0].address)} aria-label='Capability field; activate admitted next state'>
    <svg viewBox='0 0 640 460' role='img' aria-label='Interactive capability topology around the current canonical state'>
     <defs><radialGradient id='r138-core'><stop offset='0%' stopColor={operatorColor(law,'OMEGA',.7)}/><stop offset='100%' stopColor='transparent'/></radialGradient></defs>
     {rings.map((x,i)=><circle key={i} cx='320' cy='230' r={x.r} className='r138-shell' style={{opacity:.15+.45*x.v}}/>)}
     {nodes.map(n=><g key={n.id} className='r138-node'><line x1='320' y1='230' x2={n.x} y2={n.y}/><circle cx={n.x} cy={n.y} r={n.kind==='STATE'?13:18}/><text x={n.x} y={n.y+32} textAnchor='middle'>{n.label.slice(0,19)}</text><text x={n.x} y={n.y+45} textAnchor='middle' className='r138-node-sub'>{n.kind}</text></g>)}
     <circle cx='320' cy='230' r='66' fill='url(#r138-core)' className='r138-core-halo'/><circle cx='320' cy='230' r='42' className='r138-core'/><text x='320' y='218' textAnchor='middle' className='r138-core-label'>STATE {record.stateId}</text><text x='320' y='238' textAnchor='middle' className='r138-core-value'>D{coords.d+1} P{coords.p+1} R{coords.r+1} L{coords.l+1}</text><text x='320' y='256' textAnchor='middle' className='r138-core-sub'>{String(record.metrics?.decision||'—')}</text>
    </svg>
    <span className='r138-stage-hint'>Click field to commit the highest-ranked admitted candidate</span>
   </button>
   <aside className='r138-action-stack'>{actions.map(action=>{const Icon=action.route?ICONS[action.route]||ArrowRight:Waypoints;return <button key={action.id} data-kind={action.kind} onClick={()=>action.route?onNavigate(action.route):action.address!==undefined?onAddress(action.address):undefined}><Icon/><span><b>{action.label}</b><small>{action.detail}</small></span><ArrowRight/></button>})}</aside>
  </div>
  <footer className='r138-capability-ledger'><span>CΩ <b>{fmt(law.u.C)}</b></span><span>Φ <b>{fmt(law.u.Phi)}</b></span><span>q <b>{fmt(law.u.q)}</b></span><span>Λ <b>{fmt(law.u.Lambda)}</b></span><span>evidence <b>{fmt(law.u.evidence)}</b></span><span>source-backed modes <b>{modes.appliedCount}</b></span><span>gated <b>{modes.gatedCount}</b></span></footer>
 </section>
}

import {Cpu,ShieldCheck,Waypoints,Wrench} from 'lucide-react';
import {COMPLETION_SEQUENCE_R95,fullSystemConvergenceR95,ONE_SYSTEM_LEDGER_AUTHORITY_R95} from './fullSystemConvergenceR95';
import {R154_FULL_SYSTEM_CONTRACT} from './fullSystemCompletionR154.js';
import FullSystemCompletionR154 from './FullSystemCompletionR154';
import UltraSystemFabricR119 from './UltraSystemFabricR119';
import './fullSystemConvergenceR95.css';
import './ultraMountR119.css';

export default function FullSystemConvergencePanelR95({onNavigate}:{onNavigate:(name:string)=>void}){
 const c=fullSystemConvergenceR95(),implemented=c.active.length,truthGated=c.gated.length;
 return <details className='r95-convergence-authority' open>
  <summary><div><span>R154 · ONE-SYSTEM COMPLETION AUTHORITY</span><b>{c.ledger.systems} systems · 24 families · 36 controls · 18 capabilities · 12 master menus</b></div><strong>{c.restore.length?`${c.restore.length} REAL RESTORES REMAIN`:`24/24 SUCCESSORS ACCOUNTED · 0 RESTORATION DEBT`}</strong></summary>
  <div className='r95-convergence-body'>
   <section className='r95-ledger-contract'><ShieldCheck/><div><b>{ONE_SYSTEM_LEDGER_AUTHORITY_R95.invariant}</b><span>{ONE_SYSTEM_LEDGER_AUTHORITY_R95.renderStandard} · {ONE_SYSTEM_LEDGER_AUTHORITY_R95.primaryUI}</span></div><code>{ONE_SYSTEM_LEDGER_AUTHORITY_R95.source}</code></section>
   <section className='r154-completion-banner'><div><span>CURRENT SUCCESSOR REALITY · R153 ADAPTIVE EXECUTION PRESERVED</span><b>{implemented} implemented · {truthGated} truth-gated · {c.restore.length} restoration debt</b><small>R48 already restored implementations that older V24 family labels still described as donor/debt/target. R154 makes the stronger successor ledger the global operational view and composes the admitted R153 adaptive build lifecycle while retaining historical labels as provenance.</small></div><div><button onClick={()=>onNavigate('Hybrid Link')}><Cpu/>Connect / verify PC + RCWA</button><button onClick={()=>onNavigate('Build Out')}><Wrench/>Inspect build/package proof</button></div></section>
   <FullSystemCompletionR154 onNavigate={onNavigate}/>
   <nav className='r95-build-sequence' aria-label='One-system completion sequence'>{COMPLETION_SEQUENCE_R95.map(x=><button key={x.order} onClick={()=>onNavigate(x.route)}><code>{String(x.order).padStart(2,'0')}</code><span><b>{x.menu}</b><small>{x.goal}</small></span><Waypoints/></button>)}</nav>
   <div className='r95-family-reality'>
    <section><header><span>IMPLEMENTED SUCCESSORS</span><b>{c.active.length}</b></header>{c.active.map(x=><button key={x.id} onClick={()=>onNavigate(x.target)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.status} · {x.proof}</small></span></button>)}</section>
    <section><header><span>TRUTH GATED · NOT BROKEN</span><b>{c.gated.length}</b></header>{c.gated.map(x=><button key={x.id} onClick={()=>onNavigate(x.target)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.status} · {x.reason}</small></span></button>)}</section>
    {c.restore.length>0&&<section><header><span>ACTUAL RESTORE WORK</span><b>{c.restore.length}</b></header>{c.restore.map(x=><button key={x.id} onClick={()=>onNavigate(x.target)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.status} · {x.reason}</small></span></button>)}</section>}
   </div>
   <section className='r154-contract-line'><ShieldCheck/><div><b>{R154_FULL_SYSTEM_CONTRACT.completionDefinition}</b><small>{R154_FULL_SYSTEM_CONTRACT.nativeRootPolicy}</small></div></section>
   <details className='r119-ultra-mount'><summary><div><span>R119 CORPUS + SITES + MODES + RESOLUTION</span><b>Open the full convergence fabric</b><small>Drive authorities · 100 systems · 24 families · 179 source modes · 62 canon lenses · 4 federation roles · 20,736/248,832/61.9B address hierarchy</small></div><strong>ULTRA SYSTEM</strong></summary><UltraSystemFabricR119 onNavigate={onNavigate}/></details>
   <footer><ShieldCheck/><span>{c.boundary}</span></footer>
  </div>
 </details>
}

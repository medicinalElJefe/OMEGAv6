import {ShieldCheck,Waypoints} from 'lucide-react';
import {COMPLETION_SEQUENCE_R95,fullSystemConvergenceR95,ONE_SYSTEM_LEDGER_AUTHORITY_R95} from './fullSystemConvergenceR95';
import UltraSystemFabricR119 from './UltraSystemFabricR119';
import './fullSystemConvergenceR95.css';
import './ultraMountR119.css';

export default function FullSystemConvergencePanelR95({onNavigate}:{onNavigate:(name:string)=>void}){
 const c=fullSystemConvergenceR95();
 return <details className='r95-convergence-authority' open>
  <summary><div><span>ONE-SYSTEM CONVERGENCE AUTHORITY</span><b>{c.ledger.systems} systems · 24 families · 36 controls · 18 capabilities · 12 master menus</b></div><strong>{c.restore.length?c.restore.length+' FAMILY RESTORES REMAIN':'LEDGER FAMILIES ACTIVE/GATED'}</strong></summary>
  <div className='r95-convergence-body'>
   <section className='r95-ledger-contract'>
    <ShieldCheck/>
    <div><b>{ONE_SYSTEM_LEDGER_AUTHORITY_R95.invariant}</b><span>{ONE_SYSTEM_LEDGER_AUTHORITY_R95.renderStandard} · {ONE_SYSTEM_LEDGER_AUTHORITY_R95.primaryUI}</span></div>
    <code>{ONE_SYSTEM_LEDGER_AUTHORITY_R95.source}</code>
   </section>
   <nav className='r95-build-sequence' aria-label='Original one-system completion sequence'>
    {COMPLETION_SEQUENCE_R95.map(x=><button key={x.order} onClick={()=>onNavigate(x.route)}><code>{String(x.order).padStart(2,'0')}</code><span><b>{x.menu}</b><small>{x.goal}</small></span><Waypoints/></button>)}
   </nav>
   <div className='r95-family-reality'>
    <section><header><span>ACTIVE</span><b>{c.active.length}</b></header>{c.active.map(x=><button key={x.id} onClick={()=>onNavigate(x.target)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.status}</small></span></button>)}</section>
    <section><header><span>GATED</span><b>{c.gated.length}</b></header>{c.gated.map(x=><button key={x.id} onClick={()=>onNavigate(x.target)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.status}</small></span></button>)}</section>
    <section><header><span>RESTORE</span><b>{c.restore.length}</b></header>{c.restore.map(x=><button key={x.id} onClick={()=>onNavigate(x.target)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.status} · {x.reason}</small></span></button>)}</section>
   </div>
   <details className='r119-ultra-mount'>
    <summary><div><span>R119 CORPUS + SITES + MODES + RESOLUTION</span><b>Open the full convergence fabric</b><small>Drive authorities · 100 systems · 24 families · 179 source modes · 62 canon lenses · 4 federation roles · 20,736/248,832/61.9B address hierarchy</small></div><strong>ULTRA SYSTEM</strong></summary>
    <UltraSystemFabricR119 onNavigate={onNavigate}/>
   </details>
   <footer><ShieldCheck/><span>{c.boundary}</span></footer>
  </div>
 </details>
}
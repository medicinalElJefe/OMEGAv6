import {Cpu,ShieldCheck,Waypoints,Wrench} from 'lucide-react';
import {COMPLETION_SEQUENCE_R95,fullSystemConvergenceR95,ONE_SYSTEM_LEDGER_AUTHORITY_R95} from './fullSystemConvergenceR95';
import {R153_FULL_SYSTEM_CONTRACT} from './fullSystemCompletionR153.js';
import {wholeSystemConvergenceManifestR155} from './system/wholeSystemConvergenceR155.js';
import FullSystemCompletionR153 from './FullSystemCompletionR153';
import FullOverallCanonR245 from './FullOverallCanonR245';
import UltraSystemFabricR119 from './UltraSystemFabricR119';
import './fullSystemConvergenceR95.css';
import './ultraMountR119.css';

const STATE_LABEL:Record<string,string>={ADMITTED_MAIN:'ADMITTED OWNER',INTEGRATED_CANDIDATE:'PROOF-GATED CANDIDATE',INTEGRATION_TARGET:'INTEGRATION TARGET'};
const FAMILY_SHORT:Record<string,string>={CANONICAL_RUNTIME:'Runtime',SELF_DEVELOPMENT:'Self-build',FEDERATION_MACHINE:'Federation',SWARM_ORGANISM:'Swarm',LIVING_VISUAL_MOTION:'Visual / motion',SOVEREIGN_BUILD:'Build',OPTICAL_OPERATION:'Optical',ALL_MODES_TRUTH:'All modes',UNIVERSAL_EVIDENCE:'Evidence',CAUSAL_NOW:'Causal NOW',RELATIVE_CAPACITY:'Capacity',DURABLE_MISSION_GRAPH:'Mission graph',FULLWAVE_COMPUTATION:'Full-wave',SYSTEM_COMPLETION:'Completion',INTERFACE_PRESERVATION:'Interface'};

export default function FullSystemConvergencePanelR95({onNavigate}:{onNavigate:(name:string)=>void}){
 const c=fullSystemConvergenceR95(),implemented=c.active.length,truthGated=c.gated.length,r155=wholeSystemConvergenceManifestR155();
 const stateCounts=r155.stateCounts as Record<string,number>;
 return <details className='r95-convergence-authority' data-r155-whole-system='true' data-r245-full-overall-canon-mount='true' open>
  <summary><div><span>R245 FULL OVERALL CANON · R155 WHOLE-SYSTEM · R153 GOVERNED COMPLETION</span><b>{c.ledger.systems} systems · 24 historical families · 15 current capability families · 44 routes</b></div><strong>{c.restore.length?`${c.restore.length} REAL RESTORES REMAIN`:`24/24 SUCCESSORS ACCOUNTED · 0 RESTORATION DEBT`}</strong></summary>
  <div className='r95-convergence-body'>
   <section className='r155-organism-head' aria-label='R155 whole-system authority summary'>
    <div className='r155-organism-copy'><span>ONE CANONICAL PRODUCT · MANY CAPABILITY FAMILIES</span><b>15 capability families · one R116 public Worker · one R125 CanonState admission authority</b><small>R245 adds one read-only Full Overall Canon observation/build context over the existing system; it does not replace any authority. R155 coordinates ownership and dependencies. R153 remains the completion ledger/executor. R130 remains the operational control plane. R141/R142 remain execution proof boundaries.</small></div>
    <div className='r155-state-counts' aria-label='Capability family promotion state counts'>
     <div><strong>{stateCounts.ADMITTED_MAIN||0}</strong><span>admitted owners</span></div><div><strong>{stateCounts.INTEGRATED_CANDIDATE||0}</strong><span>proof-gated</span></div><div><strong>{stateCounts.INTEGRATION_TARGET||0}</strong><span>targets</span></div>
    </div>
   </section>
   <section className='r155-continuity-strip' aria-label='OMEGA computational continuity'>
    <div><span>WOVEN CONTINUITY</span><b>{r155.computationalContinuity}</b></div><div><span>ORGANISM DEVELOPMENT</span><b>{r155.organization}</b></div>
   </section>
   <div className='r155-family-rail' role='list' aria-label='R155 capability family ownership map'>
    {r155.families.map((family:any)=><article key={family.family} role='listitem' data-state={family.state} title={family.boundary}><span>{STATE_LABEL[family.state]||family.state}</span><b>{FAMILY_SHORT[family.family]||family.family}</b><small>{family.purpose}</small></article>)}
   </div>
   <section className='r95-ledger-contract'>
    <ShieldCheck/>
    <div><span>R95 · ONE-SYSTEM CONVERGENCE AUTHORITY</span><b>{ONE_SYSTEM_LEDGER_AUTHORITY_R95.invariant}</b><span>{ONE_SYSTEM_LEDGER_AUTHORITY_R95.renderStandard} · {ONE_SYSTEM_LEDGER_AUTHORITY_R95.primaryUI}</span></div>
    <code>{ONE_SYSTEM_LEDGER_AUTHORITY_R95.source}</code>
   </section>
   <section className='r153-completion-banner'>
    <div><span>R153 CURRENT SUCCESSOR REALITY</span><b>{implemented} implemented · {truthGated} truth-gated · {c.restore.length} restoration debt</b><small>R48 already restored implementations that the older V24 family labels still described as donor/debt/target. R153 makes the stronger successor ledger the operational completion view while preserving historical labels and corrected ownership splits as provenance.</small></div>
    <div><button onClick={()=>onNavigate('Hybrid Link')}><Cpu/>Connect / verify PC + RCWA</button><button onClick={()=>onNavigate('Build Out')}><Wrench/>Inspect build/package proof</button></div>
   </section>
   <FullOverallCanonR245 onNavigate={onNavigate}/>
   <FullSystemCompletionR153 onNavigate={onNavigate}/>
   <nav className='r95-build-sequence' aria-label='One-system completion sequence'>{COMPLETION_SEQUENCE_R95.map(x=><button key={x.order} onClick={()=>onNavigate(x.route)}><code>{String(x.order).padStart(2,'0')}</code><span><b>{x.menu}</b><small>{x.goal}</small></span><Waypoints/></button>)}</nav>
   <div className='r95-family-reality'>
    <section><header><span>IMPLEMENTED SUCCESSORS</span><b>{c.active.length}</b></header>{c.active.map(x=><button key={x.id} onClick={()=>onNavigate(x.target)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.status} · {x.proof}</small></span></button>)}</section>
    <section><header><span>TRUTH GATED · NOT BROKEN</span><b>{c.gated.length}</b></header>{c.gated.map(x=><button key={x.id} onClick={()=>onNavigate(x.target)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.status} · {x.reason}</small></span></button>)}</section>
    {c.restore.length>0&&<section><header><span>ACTUAL RESTORE WORK</span><b>{c.restore.length}</b></header>{c.restore.map(x=><button key={x.id} onClick={()=>onNavigate(x.target)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.status} · {x.reason}</small></span></button>)}</section>}
   </div>
   <section className='r153-contract-line'><ShieldCheck/><div><b>{R153_FULL_SYSTEM_CONTRACT.completionDefinition}</b><small>{R153_FULL_SYSTEM_CONTRACT.nativeRootPolicy}</small></div></section>
   <details className='r119-ultra-mount'><summary><div><span>R119 CORPUS + SITES + MODES + RESOLUTION</span><b>Open the full convergence fabric</b><small>Drive authorities · 100 systems · 24 historical families · 179 source modes · 62 canon lenses · 4 federation roles · 20,736/248,832/61.9B address hierarchy</small></div><strong>ULTRA SYSTEM</strong></summary><UltraSystemFabricR119 onNavigate={onNavigate}/></details>
   <footer><ShieldCheck/><span>{r155.truthBoundary} · {c.boundary}</span></footer>
  </div>
 </details>
}

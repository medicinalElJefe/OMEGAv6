import {useMemo,useState} from 'react';
import {Boxes,Braces,CheckCircle2,Cpu,Network,ShieldCheck,TriangleAlert} from 'lucide-react';
import {genomeByIdR268,SYSTEM_GENOMES_R268} from './systemFoundryR268';
import {compileSystemRuntimeR269} from './systemFoundryRuntimeR269';
import {analyzeFoundryDependenciesR273} from './systemFoundryDependencyR273';
import {analyzeFoundryImpactR274} from './systemFoundryImpactR274';
import {analyzeFoundryEvidenceR275} from './systemFoundryEvidenceR275';
import type {ResourceEnvelopeR239} from './hybridResourceGovernorR239';
import './systemFoundryR268.css';

type Props={deviceHeartbeat?:boolean;externalBindings?:boolean;resourceEnvelopeR239?:ResourceEnvelopeR239|null};
export default function SystemFoundryR268({deviceHeartbeat=false,externalBindings=false,resourceEnvelopeR239=null}:Props){
 const[genomeId,setGenomeId]=useState('omega.self');
 const[selectedCapabilityId,setSelectedCapabilityId]=useState('');
 const[selectedOperatorId,setSelectedOperatorId]=useState('');
 const genome=genomeByIdR268(genomeId);
 const plan=useMemo(()=>compileSystemRuntimeR269(genome,{authenticatedDeviceHeartbeat:deviceHeartbeat,externalBindings,resourceEnvelopeR239}),[genome,deviceHeartbeat,externalBindings,resourceEnvelopeR239]);
 const active=plan.activeFrontier.filter(x=>x.status==='ACTIVE'),blocked=plan.activeFrontier.filter(x=>x.status==='BLOCKED');
 const selectedCapability=plan.activeFrontier.find(x=>x.id===selectedCapabilityId)||plan.activeFrontier[0]||null;
 const selectedOperator=plan.operatorDag.find(x=>x.operator===selectedOperatorId)||null;
 const operatorCapabilities=selectedOperator?plan.activeFrontier.filter(c=>c.operators.includes(selectedOperator.operator)):[];
 const dependencyAnalysis=useMemo(()=>analyzeFoundryDependenciesR273(plan,selectedCapability?.id||''),[plan,selectedCapability?.id]);
 const impactAnalysis=useMemo(()=>analyzeFoundryImpactR274(plan,selectedCapability?.id||''),[plan,selectedCapability?.id]);
 const evidenceAnalysis=useMemo(()=>analyzeFoundryEvidenceR275(plan,selectedCapability?.id||''),[plan,selectedCapability?.id]);
 const inspectCapability=(id:string)=>setSelectedCapabilityId(id);
 const inspectOperator=(id:string)=>setSelectedOperatorId(id);
 return <section className='foundry-r268' aria-label='R268 System Foundry' data-runtime-truth='R269' data-inspection-truth='R272_READ_ONLY' data-dependency-truth='R273_READ_ONLY' data-impact-truth='R274_READ_ONLY' data-evidence-truth='R275_READ_ONLY'>
  <header><div><span>R268/R269/R270/R271/R272/R273/R274/R275 · SYSTEM-CONSTRUCTION + LIVE TRUTH + CAUSAL INSPECTION</span><h3>OMEGA System Foundry</h3><p>Compile a declarative system genome into an active capability frontier, shared operator DAG, evidence-bound executor placements, lenses and proof obligations. This surface plans and inspects; it does not create a second executor or production writer. R273 adds read-only dependency causality, R274 adds reverse structural impact, and R275 consolidates current compiled blocker classes into evidence-gap review without assuming that clearing a blocker changes runtime truth.</p></div><div className='foundry-proof'><ShieldCheck/><b>FAIL-CLOSED</b><small>{plan.fingerprint}</small></div></header>
  <div className='foundry-picker'>{SYSTEM_GENOMES_R268.map(g=><button key={g.id} className={g.id===genome.id?'active':''} onClick={()=>setGenomeId(g.id)}><Braces/><span><b>{g.label}</b><small>{g.purpose}</small></span></button>)}</div>
  <div className='foundry-kpis'><article><Boxes/><b>{active.length}</b><span>ACTIVE FRONTIER</span></article><article><TriangleAlert/><b>{blocked.length}</b><span>TRUTH GATED</span></article><article><Network/><b>{plan.operatorDag.length}</b><span>UNIQUE OPERATORS</span></article><article><Cpu/><b>{plan.runtimeTruth.resourceTier}</b><span>R239 RESOURCE TIER</span></article></div>
  <div className='foundry-grid'>
   <section><header><span>COMPILED CAPABILITY FRONTIER</span><b>{genome.label}</b></header><div className='foundry-list foundry-capability-list'>{plan.activeFrontier.map(c=><article key={c.id} data-state={c.status} data-selected={selectedCapability?.id===c.id?'true':'false'} role='button' tabIndex={0} aria-pressed={selectedCapability?.id===c.id} onClick={()=>inspectCapability(c.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspectCapability(c.id)}}}><div><b>{c.label}</b><code>{c.id}</code></div><small>{c.layer} · {c.executor||c.blockers.join(' · ')}</small><em>{c.status}</em></article>)}</div></section>
   <section><header><span>OPERATOR DAG</span><b>Shared work executes once</b></header><div className='foundry-list foundry-operator-list'>{plan.operatorDag.map(o=><article key={o.operator} data-selected={selectedOperator?.operator===o.operator?'true':'false'} role='button' tabIndex={0} aria-pressed={selectedOperator?.operator===o.operator} onClick={()=>inspectOperator(o.operator)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspectOperator(o.operator)}}}><div><b>{o.operator}</b><code>{o.consumers.join(' · ')}</code></div><small>{o.reuse?`${o.reuse} duplicate execution${o.reuse===1?'':'s'} eliminated`:'single consumer'}</small></article>)}</div></section>
  </div>
  {selectedOperator&&<section className='foundry-inspector foundry-operator-inspector' aria-label='R272 operator inspection' data-operator-truth='R272_READ_ONLY'>
   <header><div><span>R272 READ-ONLY OPERATOR INSPECTION</span><b>{selectedOperator.operator}</b><code>{selectedOperator.consumers.join(' · ')}</code></div><em>{selectedOperator.reuse?'SHARED':'SINGLE'}</em></header>
   <div className='foundry-inspector-grid'>
    <article><span>CONSUMERS</span><b>{selectedOperator.consumers.length}</b><small>{selectedOperator.consumers.join(' · ')||'NONE'}</small></article>
    <article><span>REUSE</span><b>{selectedOperator.reuse||0}</b><small>{selectedOperator.reuse?'Duplicate executions eliminated by shared DAG placement':'Single-consumer operator'}</small></article>
    <article><span>ACTIVE USE</span><b>{operatorCapabilities.filter(c=>c.status==='ACTIVE').length}</b><small>{operatorCapabilities.filter(c=>c.status==='ACTIVE').map(c=>c.id).join(' · ')||'NONE'}</small></article>
    <article><span>BLOCKED USE</span><b>{operatorCapabilities.filter(c=>c.status==='BLOCKED').length}</b><small>{operatorCapabilities.filter(c=>c.status==='BLOCKED').map(c=>`${c.id}: ${c.blockers.join(' · ')}`).join(' · ')||'NONE'}</small></article>
   </div>
   <p>Operator inspection is derived only from the already-compiled operator DAG and active frontier. It does not execute an operator, create polling, dispatch work, mutate source, admit CanonState, or create deployment authority.</p>
  </section>}
  {selectedCapability&&<section className='foundry-inspector' aria-label='R271 capability inspection' data-capability-state={selectedCapability.status}>
   <header><div><span>R271 READ-ONLY CAPABILITY INSPECTION</span><b>{selectedCapability.label}</b><code>{selectedCapability.id}</code></div><em>{selectedCapability.status}</em></header>
   <div className='foundry-inspector-grid'>
    <article><span>PLACEMENT</span><b>{selectedCapability.executor||'NO EXECUTOR ADMITTED'}</b><small>Allowed: {selectedCapability.allowedExecutors.join(' · ')}</small></article>
    <article><span>EVIDENCE</span><b>{selectedCapability.evidence.join(' · ')||'NONE'}</b><small>{selectedCapability.blockers.length?`Blocked: ${selectedCapability.blockers.join(' · ')}`:'No compiled blocker'}</small></article>
    <article><span>DATA FLOW</span><b>{selectedCapability.inputs.join(' · ')||'NO INPUTS'}</b><small>→ {selectedCapability.outputs.join(' · ')||'NO OUTPUTS'}</small></article>
    <article><span>DEPENDENCIES</span><b>{selectedCapability.dependsOn?.join(' · ')||'NONE'}</b><small>{selectedCapability.sideEffect?'Side effect declared':'Read/compute path'} · authority {selectedCapability.authority||'INHERITED'}</small></article>
   </div>
   <div className='foundry-inspector-ops'><span>BOUND OPERATORS</span><div>{selectedCapability.operators.map(op=><button type='button' key={op} onClick={()=>inspectOperator(op)}>{op}</button>)}</div></div>
   <p>Inspection is a projection of the already-compiled R269/R270 plan. It does not dispatch, poll, mutate source, claim device liveness, admit CanonState, or create deployment authority.</p>
  </section>}
  {selectedCapability&&<section className='foundry-inspector foundry-dependency-inspector' aria-label='R273 dependency inspection'>
   <header><div><span>R273 DEPENDENCY + CRITICAL PATH INSPECTION</span><b>{selectedCapability.id}</b><code>compiled frontier causality</code></div><em>READ ONLY</em></header>
   <div className='foundry-inspector-grid'>
    <article><span>DEPENDENCY CLOSURE</span><b>{dependencyAnalysis.dependencyOrder.length}</b><small>{dependencyAnalysis.dependencyOrder.join(' → ')||'NONE'}</small></article>
    <article><span>ROOT BLOCKERS</span><b>{dependencyAnalysis.rootBlockers.length}</b><small>{dependencyAnalysis.rootBlockers.map(x=>`${x.id}: ${x.blockers.join(' · ')}`).join(' · ')||'NONE'}</small></article>
    <article><span>ABSTRACT LATENCY</span><b>{dependencyAnalysis.abstractLatency}</b><small>Declared planning weight along the longest upstream dependency path; not measured wall-clock time.</small></article>
    <article><span>ABSTRACT COST</span><b>{dependencyAnalysis.abstractCost}</b><small>Declared planning weight on that same path; not measured compute spend.</small></article>
   </div>
   <div className='foundry-paths'><span>CRITICAL PATH</span><div>{dependencyAnalysis.criticalPath.map((id,index)=><button type='button' key={id} onClick={()=>inspectCapability(id)}><small>{index+1}</small>{id}</button>)}</div></div>
   <div className='foundry-paths'><span>DEPENDENCY ORDER</span><div>{dependencyAnalysis.dependencyOrder.map(id=><button type='button' key={id} onClick={()=>inspectCapability(id)}>{id}</button>)}</div></div>
   <p>Dependency analysis is derived only from the already-compiled frontier and declared abstract cost/latency. It does not dispatch or claim measured runtime performance.</p>
  </section>}
  {selectedCapability&&<section className='foundry-inspector foundry-impact-inspector' aria-label='R274 impact inspection'>
   <header><div><span>R274 REVERSE DEPENDENCY IMPACT</span><b>{selectedCapability.id}</b><code>compiled structural reachability</code></div><em>READ ONLY</em></header>
   <div className='foundry-inspector-grid'>
    <article><span>DIRECT DEPENDENTS</span><b>{impactAnalysis.directDependents.length}</b><small>{impactAnalysis.directDependents.join(' · ')||'NONE'}</small></article>
    <article><span>DOWNSTREAM REACH</span><b>{impactAnalysis.downstreamImpact.length}</b><small>{impactAnalysis.downstreamImpact.join(' · ')||'NONE'}</small></article>
    <article><span>ACTIVE DOWNSTREAM</span><b>{impactAnalysis.activeDownstream.length}</b><small>{impactAnalysis.activeDownstream.join(' · ')||'NONE'}</small></article>
    <article><span>BLOCKED DOWNSTREAM</span><b>{impactAnalysis.blockedDownstream.length}</b><small>{impactAnalysis.blockedDownstream.join(' · ')||'NONE'}</small></article>
   </div>
   <div className='foundry-paths'><span>DOWNSTREAM IMPACT MAP</span><div>{impactAnalysis.downstreamImpact.map(id=><button type='button' key={id} onClick={()=>inspectCapability(id)}>{id}</button>)}</div></div>
   <div className='foundry-paths'><span>BLOCKED REVIEW PRIORITY</span><div>{impactAnalysis.blockedReviewOrder.map((row,index)=><button type='button' key={row.id} onClick={()=>inspectCapability(row.id)}><small>{index+1} · reach {row.downstreamCount}</small>{row.id}</button>)}</div></div>
   <p>Impact is structural reachability over declared dependency edges only. It does not claim a downstream capability will fail or recover, and blocked review priority is diagnostic ordering rather than mutation authorization.</p>
  </section>}
  {selectedCapability&&<section className='foundry-inspector foundry-evidence-inspector' aria-label='R275 evidence gap inspection'>
   <header><div><span>R275 COMPILED EVIDENCE GAP REVIEW</span><b>{selectedCapability.id}</b><code>observed blocker classes + declared evidence</code></div><em>READ ONLY</em></header>
   <div className='foundry-inspector-grid'>
    <article><span>CURRENT BLOCKERS</span><b>{evidenceAnalysis.selectedCurrentBlockers.length}</b><small>{evidenceAnalysis.selectedCurrentBlockers.join(' · ')||'NONE'}</small></article>
    <article><span>DECLARED EVIDENCE</span><b>{evidenceAnalysis.selectedDeclaredEvidence.length}</b><small>{evidenceAnalysis.selectedDeclaredEvidence.join(' · ')||'NONE'}</small></article>
    <article><span>FRONTIER GAP CLASSES</span><b>{evidenceAnalysis.gapCount}</b><small>Unique blocker classes emitted by the current compiled frontier.</small></article>
    <article><span>BLOCKED CAPABILITIES</span><b>{evidenceAnalysis.blockedCapabilityCount}</b><small>Current compiled status only; not a forecast of future availability.</small></article>
   </div>
   <div className='foundry-paths'><span>GAP REVIEW ORDER</span><div>{evidenceAnalysis.reviewOrder.map((row,index)=><button type='button' key={row.blocker} onClick={()=>row.directBlocked[0]&&inspectCapability(row.directBlocked[0])}><small>{index+1} · direct {row.directBlocked.length} · structural reach {row.affectedCount}</small>{row.blocker}</button>)}</div></div>
   <div className='foundry-paths'><span>DIRECTLY BLOCKED BY TOP GAP</span><div>{(evidenceAnalysis.reviewOrder[0]?.directBlocked||[]).map(id=><button type='button' key={id} onClick={()=>inspectCapability(id)}>{id}</button>)}</div></div>
   <p>Evidence-gap review groups blockers already emitted by the compiled plan. Structural reach is diagnostic only: clearing a blocker is not assumed to activate anything. Changed evidence or runtime conditions must be recompiled and re-proven before status changes are accepted.</p>
  </section>}
  <div className='foundry-grid'>
   <section><header><span>INTERFACE LENSES</span><b>Representation does not redefine state</b></header><div className='foundry-lenses'>{plan.lenses.map(l=><article key={l.id}><b>{l.label}</b><small>{l.purpose}</small><code>{l.reads.join(' · ')}</code></article>)}</div></section>
   <section><header><span>AUTHORITY + PROOF</span><b>No generated system bypasses inherited governance</b></header><div className='foundry-proof-list'>{plan.proofObligations.map(x=><p key={x}><CheckCircle2/><span>{x}</span></p>)}</div></section>
  </div>
  <footer><div><b>Active-frontier execution</b><span>Estimated abstract cost {plan.estimatedCost} · latency {plan.estimatedLatency} · {plan.dormantCapabilities} registry capabilities remain addressable without materialization.</span></div><div><b>Device truth</b><span>{deviceHeartbeat?'Current authenticated heartbeat supplied to this planner.':'DEVICE_PROOF_REQUIRED — browser/CI state is not treated as private-PC proof.'}</span></div><div><b>R239 resource truth</b><span>{plan.runtimeTruth.resourceAuthority==='R239_CURRENT_ENVELOPE'?`${plan.runtimeTruth.resourceTier} · ${plan.runtimeTruth.deviceAssistAdmitted?'DEVICE ASSIST ADMITTED':'DEVICE ASSIST HELD'} · ${plan.runtimeTruth.resourceReasons.join(' · ')||'fresh governed envelope'}`:'R239_RESOURCE_PROOF_REQUIRED — device placement remains blocked without a fresh returned R238 host profile and current shared snapshot.'}</span></div></footer>
 </section>
}

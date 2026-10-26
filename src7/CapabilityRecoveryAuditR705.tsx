import {useMemo,useState} from 'react';
import {OMEGA7_CAPABILITIES} from './capabilityRegistry';
import canonicalRecoveryR650 from '../canon/year-corpus-capability-conservation-r650.json';
import {OMEGA_ARCHITECTURE_R474,YEAR_CORPUS_CAPABILITY_GRAPH_R474,auditYearCorpusCapabilityGraphR474,type OmegaArchitecturePillarR474} from '../src/yearCorpusCapabilityGraphR474';

// R705: a source-lineage view and real OMEGA7 route launcher, not a live-execution attestation.
type FilterR705='ALL'|'GAPPED'|'EXECUTES_NOW'|'EXECUTES_AS_ADAPTER'|'TRUTH_GATED';
export function CapabilityRecoveryAuditR705({onNavigate}:{onNavigate:(route:string)=>void}){
 const [pillar,setPillar]=useState<OmegaArchitecturePillarR474|'ALL'>('ALL');
 const [filter,setFilter]=useState<FilterR705>('GAPPED');
 const [query,setQuery]=useState('');
 const audit=useMemo(()=>auditYearCorpusCapabilityGraphR474(),[]);
 const availableRoutes=useMemo(()=>new Set(OMEGA7_CAPABILITIES.map(c=>c.legacyRoute)),[]);
 const families=canonicalRecoveryR650.families;
 const rows=useMemo(()=>YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(c=>
  (pillar==='ALL'||c.pillar===pillar)&&
  (filter==='ALL'||(filter==='GAPPED'?c.remainingGap!==null:c.strongestImplementation.state===filter))&&
  (c.identity.name+' '+c.identity.id+' '+c.function).toLowerCase().includes(query.trim().toLowerCase())
 ),[pillar,filter,query]);
 return <section aria-label='Historical capability recovery audit' data-r705-capability-audit='source-resolution'>
  <h2>Capability recovery audit</h2>
  <p>Historical corpus resolution, strongest known implementation and remaining restoration gaps. This is a source-derived audit, not a live production-health certificate.</p>
  <div role='status' data-r705-audit-summary>{audit.capabilities} resolved capability identities · {audit.gapped} recorded gaps · {audit.executing} modeled as executing · {audit.truthGated} truth-gated</div>
  <section aria-label='Canonical family restoration status' data-r620-canonical-family-report='source-bound'>
   <h3>Historical capability families — independent proof required</h3>
   <p>{families.length} canonical families · {families.length} require independent production proof. Source hints, in-ledger claims and graph registration are not executable parity.</p>
   <div style={{display:'grid',gap:8,maxHeight:320,overflowY:'auto'}}>{families.map(f=><article key={f.id} data-r620-family-id={f.id} style={{border:'1px solid var(--o7-border, #606a80)',padding:8,borderRadius:6}}>
    <strong>{f.id}</strong> <small>{f.truthClass} · {f.productionProved?'Unverified in-ledger production claim':'Production proof not established'}</small>
    <p>{f.description}</p><small>Missing evidence: {f.missingEvidence.join('; ')||'No missing evidence recorded; verify independently'}</small>
   </article>)}</div>
  </section>
  <div style={{display:'flex',flexWrap:'wrap',gap:12,margin:'12px 0'}}>
   <label>Pillar <select aria-label='Filter capability pillar' value={pillar} onChange={e=>setPillar(e.target.value as OmegaArchitecturePillarR474|'ALL')}><option value='ALL'>All 12 pillars</option>{OMEGA_ARCHITECTURE_R474.pillars.map(p=><option value={p} key={p}>{p.replaceAll('_',' ')}</option>)}</select></label>
   <label>Evidence state <select aria-label='Filter capability evidence state' value={filter} onChange={e=>setFilter(e.target.value as FilterR705)}><option value='GAPPED'>Remaining gaps</option><option value='ALL'>All</option><option value='EXECUTES_NOW'>Modeled as executing</option><option value='EXECUTES_AS_ADAPTER'>Adapters</option><option value='TRUTH_GATED'>Truth gated</option></select></label>
   <label>Find capability <input aria-label='Search historical capabilities' value={query} onChange={e=>setQuery(e.target.value)} /></label>
  </div>
  <div data-r705-filtered-count>{rows.length} matching capabilities</div>
  <div style={{display:'grid',gap:10,maxHeight:440,overflowY:'auto'}}>
  {rows.map(c=>{const route=c.currentExecutor.route,routeAvailable=availableRoutes.has(route)&&c.currentExecutor.routable;
   return <article key={c.identity.id} data-r705-capability-id={c.identity.id} style={{border:'1px solid var(--o7-border, #606a80)',borderRadius:8,padding:12}}>
    <strong>{c.identity.name}</strong> <small>{c.pillar.replaceAll('_',' ')} · {c.primaryKind}</small>
    <p>{c.function}</p>
    <p><b>Strongest resolved implementation:</b> {c.strongestImplementation.id} · {c.strongestImplementation.state}</p>
    <p><b>Evidence:</b> {c.evidence.truthClass} · {c.evidence.currentEvidence}</p>
    <p><b>Remaining gap:</b> {c.remainingGap||'No gap documented in this source graph; live execution still requires independent proof'}</p>
    <small>Source binding {c.lineage.sourceBindingId} · current route {route} · authority {c.currentExecutor.admissionAuthority}</small>
    <div style={{marginTop:8}}>{routeAvailable?
     <button type='button' data-r705-launch-route={route} onClick={()=>onNavigate(route)}>Open current route: {route}</button>:
     <span data-r705-route-held={route}>No launchable OMEGA7 route established by this source binding</span>}
    </div>
   </article>;
  })}
  </div>
 </section>;
}

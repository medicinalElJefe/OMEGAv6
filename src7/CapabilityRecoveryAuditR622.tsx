import {useMemo,useState} from 'react';
import {YEAR_CORPUS_CAPABILITY_GRAPH_R474,auditYearCorpusCapabilityGraphR474,type OmegaArchitecturePillarR474} from '../src/yearCorpusCapabilityGraphR474';

// Source-resolved capability census: routability is NOT equivalent to live proof.
export function CapabilityRecoveryAuditR622(){
 const [pillar,setPillar]=useState<OmegaArchitecturePillarR474|'ALL'>('ALL');
 const [filter,setFilter]=useState<'ALL'|'GAPPED'|'EXECUTES_NOW'|'TRUTH_GATED'>('GAPPED');
 const [query,setQuery]=useState('');
 const audit=useMemo(()=>auditYearCorpusCapabilityGraphR474(),[]);
 const pillars=useMemo(()=>[...new Set(YEAR_CORPUS_CAPABILITY_GRAPH_R474.map(c=>c.pillar))].sort(),[]);
 const rows=useMemo(()=>YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(c=>(pillar==='ALL'||c.pillar===pillar)&&(filter==='ALL'||(filter==='GAPPED'?c.remainingGap!==null:c.strongestImplementation.state===filter))&&((c.identity.name+' '+c.identity.id+' '+c.function).toLowerCase().includes(query.toLowerCase()))),[pillar,filter,query]);
 return <section aria-label='Historical capability recovery audit' data-r622-capability-audit='source-resolution'>
  <h2>Capability recovery audit</h2>
  <p>Historical corpus resolution, strongest known implementation and remaining restoration gaps. This is a source-derived audit, not a live production-health certificate.</p>
  <div role='status' data-r622-audit-summary>{audit.capabilities} resolved capability identities · {audit.gapped} recorded gaps · {audit.executing} modeled as executing · {audit.truthGated} truth-gated</div>
  <div style={{display:'flex',flexWrap:'wrap',gap:12,margin:'12px 0'}}>
   <label>Pillar <select aria-label='Filter capability pillar' value={pillar} onChange={e=>setPillar(e.target.value as OmegaArchitecturePillarR474|'ALL')}><option value='ALL'>All 12 pillars</option>{pillars.map(p=><option value={p} key={p}>{p.replaceAll('_',' ')}</option>)}</select></label>
   <label>Evidence state <select aria-label='Filter capability evidence state' value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value='GAPPED'>Remaining gaps</option><option value='ALL'>All</option><option value='EXECUTES_NOW'>Modeled as executing</option><option value='TRUTH_GATED'>Truth gated</option></select></label>
   <label>Find capability <input aria-label='Search historical capabilities' value={query} onChange={e=>setQuery(e.target.value)} /></label>
  </div>
  <div data-r622-filtered-count>{rows.length} matching capabilities</div>
  <div style={{display:'grid',gap:10,maxHeight:440,overflowY:'auto'}}>
  {rows.map(c=><article key={c.identity.id} data-r622-capability-id={c.identity.id} style={{border:'1px solid var(--o7-border, #606a80)',borderRadius:8,padding:12}}>
   <strong>{c.identity.name}</strong> <small>{c.pillar.replaceAll('_',' ')} · {c.primaryKind}</small>
   <p>{c.function}</p>
   <p><b>Strongest resolved implementation:</b> {c.strongestImplementation.id} · {c.strongestImplementation.state}</p>
   <p><b>Evidence:</b> {c.evidence.truthClass} · {c.evidence.currentEvidence}</p>
   <p><b>Remaining gap:</b> {c.remainingGap||'No gap documented in this source graph; live execution still requires independent proof'}</p>
   <small>Source binding {c.lineage.sourceBindingId} · current route {c.currentExecutor.route} · authority {c.currentExecutor.admissionAuthority}</small>
  </article>)}
  </div>
 </section>
}

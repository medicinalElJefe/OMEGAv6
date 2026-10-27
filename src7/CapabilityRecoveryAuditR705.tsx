import {useMemo,useState} from 'react';
import {OMEGA7_CAPABILITIES} from './capabilityRegistry';
import canonicalRecoveryR650 from '../canon/year-corpus-capability-conservation-r650.json';
import {evaluateWovenExchangeR621} from '../src/wovenBoundaryExchangeR621.mjs';
import {traverseDevelopmentalContinuityR622} from '../src/developmentalTraversalR622.mjs';
import {runContinuityFrameR653} from '../src/continuity/frameRuntimeR653.js';
import {replayInheritedDevelopmentR623} from '../src/inheritedDevelopmentReplayR623.mjs';
import {OMEGA_ARCHITECTURE_R474,YEAR_CORPUS_CAPABILITY_GRAPH_R474,auditYearCorpusCapabilityGraphR474,type OmegaArchitecturePillarR474} from '../src/yearCorpusCapabilityGraphR474';

// R705: a source-lineage view and real OMEGA7 route launcher, not a live-execution attestation.
type FilterR705='ALL'|'GAPPED'|'EXECUTES_NOW'|'EXECUTES_AS_ADAPTER'|'TRUTH_GATED';
export function CapabilityRecoveryAuditR705({onNavigate}:{onNavigate:(route:string)=>void}){
 const [pillar,setPillar]=useState<OmegaArchitecturePillarR474|'ALL'>('ALL');
 const [filter,setFilter]=useState<FilterR705>('GAPPED');
 const [query,setQuery]=useState('');
 const [exchangeResult,setExchangeResult]=useState<string>('Not executed');
 const [developmentResult,setDevelopmentResult]=useState<string>('Not executed');
 const [canonicalFrameResult,setCanonicalFrameResult]=useState<string>('Not executed');
 const [inheritedReplayResult,setInheritedReplayResult]=useState<string>('Not executed');
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
  <section aria-label='Experimental woven continuity execution' data-r621-woven-execution='experimental'>
   <h3>Woven continuity — bounded executable model</h3>
   <p>Run a deterministic three-node example of multi-parent exchange and cyclic return. This is an abstract computational operator, not historical parity or physical simulation.</p>
   <button type='button' data-r621-run-exchange onClick={()=>{try{const r=evaluateWovenExchangeR621({nodes:['a','b','c'],initial:{a:5,b:3,c:0},exchanges:[{kind:'EGRESS',from:'a',to:'c',amount:2},{kind:'INGRESS',from:'b',to:'c',amount:2},{kind:'EGRESS',from:'c',to:'a',amount:1},{kind:'RESIDUE',from:'a',to:'b',amount:1,residueType:'CONTRADICTION',direction:'RETURN'}]});setExchangeResult(JSON.stringify({stocks:r.stocks,parents:r.parents,residue:r.residues,invariant:r.invariant}));}catch(e){setExchangeResult(String(e));}}}>Execute example and inspect conserved result</button>
   <pre data-r621-exchange-result style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{exchangeResult}</pre>
  </section>
  <section aria-label='Existing R653 canonical continuity executor' data-r653-existing-continuity='source-execution'>
   <h3>Inherited continuity kernel — R651/R652/R653</h3>
   <p>Execute the existing bounded canonical transport and mode projection, preserving scar and contradiction state. A local calculation does not prove production parity.</p>
   <button type='button' data-r653-run-canonical-frame onClick={()=>{try{const r=runContinuityFrameR653({nodes:[{id:'A',continuity:0.8,scar:0.2,contradiction:0.1},{id:'B',continuity:0.2}],edges:[{from:'A',to:'B',kind:'INGRESS',weight:0.5},{from:'B',to:'A',kind:'RETURN',weight:0.5}],step:0.25,mode:'STABILIZE'});setCanonicalFrameResult(JSON.stringify({canonicalState:r.canonicalState,projection:r.projection,receipt:r.receipt}));}catch(e){setCanonicalFrameResult(String(e));}}}>Execute inherited canonical frame</button>
   <pre data-r653-canonical-frame-result style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{canonicalFrameResult}</pre>
  </section>
  <section aria-label='Inherited developmental continuity replay' data-r623-inherited-replay='local'>
   <h3>Inherited canonical developmental replay — R623</h3>
   <p>Derive Heightened Mode velocity, acceleration and jerk from actual R651/R653 canonical frame outputs. This does not certify production or full historical parity.</p>
   <button type='button' data-r623-run-inherited-replay onClick={()=>{try{const edges=[{from:'A',to:'B',kind:'INGRESS',weight:0.5},{from:'B',to:'A',kind:'RETURN',weight:0.3}];const result=replayInheritedDevelopmentR623({nodes:[{id:'A',continuity:0.8,scar:0.15,contradiction:0.1},{id:'B',continuity:0.2}],edgeFrames:[edges,edges,edges],step:0.2,mode:'STABILIZE'});setInheritedReplayResult(JSON.stringify({frames:result.history,developmental:result.developmental,proof:result.proof}));}catch(e){setInheritedReplayResult(String(e));}}}>Execute inherited developmental replay</button>
   <pre data-r623-inherited-result style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{inheritedReplayResult}</pre>
  </section>
  <section aria-label='Experimental developmental traversal' data-r622-developmental-traversal='experimental'>
   <h3>Heightened Mode — developmental derivative instrument</h3>
   <p>Discrete, conservation-checked traversal; the rates and curvature are abstract scalar differences, not physical dimensions or established historical parity.</p>
   <button type='button' data-r622-run-traversal onClick={()=>{try{const frames=[1,2,3].map(amount=>({exchanges:[{kind:'EGRESS',from:'a',to:'b',amount}]}));const r=traverseDevelopmentalContinuityR622({nodes:['a','b'],initial:{a:10,b:0},frames,dt:1});setDevelopmentResult(JSON.stringify({timeline:r.timeline,velocity:r.velocity,acceleration:r.acceleration,jerk:r.jerk,curvature:r.curvature,conservation:r.invariants}));}catch(e){setDevelopmentResult(String(e));}}}>Execute developmental traversal</button>
   <pre data-r622-traversal-result style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{developmentResult}</pre>
  </section>
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

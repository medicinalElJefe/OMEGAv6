import {useEffect,useMemo,useState} from 'react';
import {WovenTopologyR707} from './WovenTopologyR707';
import {OMEGA7_CAPABILITIES} from './capabilityRegistry';
import canonicalRecoveryR650 from '../canon/year-corpus-capability-conservation-r650.json';
import {DEFAULT_SCENARIO_R706,parseScenarioR706,exportScenarioR706,replayScenarioR706} from '../src/relationalScenarioWorkbenchR706.mjs';
import {restoreComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {OMEGA_ARCHITECTURE_R474,YEAR_CORPUS_CAPABILITY_GRAPH_R474,auditYearCorpusCapabilityGraphR474,type OmegaArchitecturePillarR474} from '../src/yearCorpusCapabilityGraphR474';

// R705: a source-lineage view and real OMEGA7 route launcher, not a live-execution attestation.
type FilterR705='ALL'|'GAPPED'|'EXECUTES_NOW'|'EXECUTES_AS_ADAPTER'|'TRUTH_GATED';
export function CapabilityRecoveryAuditR705({onNavigate}:{onNavigate:(route:string)=>void}){
 const [pillar,setPillar]=useState<OmegaArchitecturePillarR474|'ALL'>('ALL');
 const [filter,setFilter]=useState<FilterR705>('GAPPED');
 const [query,setQuery]=useState('');
 const [replayOutput,setReplayOutput]=useState('Not executed');
 const [scenarioText,setScenarioText]=useState(()=>exportScenarioR706(DEFAULT_SCENARIO_R706));
 const [scenarioStatus,setScenarioStatus]=useState('Sample input ready. Edit nodes and directional frames, then execute.');
 const [portableScenario,setPortableScenario]=useState('');
 const [sessionImportText,setSessionImportText]=useState('');
 const [sessionPreset,setSessionPreset]=useState<{origin:string;target:string;mirrored:boolean;revision:number}|null>(null);
 const [vectorScenario,setVectorScenario]=useState<any|null>(null);
 const [summaryChanges,setSummaryChanges]=useState<Array<{id:string;continuityBefore:number;continuityAfter:number;continuityDelta:number;scarBefore:number;scarAfter:number;contradictionBefore:number;contradictionAfter:number}>>([]);
 useEffect(()=>{
  try{
   const savedSession=window.localStorage.getItem('omega7.r711.session.v1');
   if(savedSession){
    const restored=restoreComputationalSessionR711(savedSession);
    setScenarioText(restored.sourceJson);setVectorScenario(restored.sourceScenario);
    setSummaryChanges(restored.replay.summary.changes);
    setReplayOutput(JSON.stringify({canonicalHistory:restored.replay.canonicalHistory,developmental:restored.replay.developmental,proof:restored.replay.proof,summary:restored.replay.summary}));
    setSessionPreset({origin:restored.origin,target:restored.target,mirrored:restored.mirrored,revision:1});
    setScenarioStatus('R712 saved session restored and independently recomputed. Local model only.');
    return;
   }
   const saved=window.localStorage.getItem('omega7.r706.scenario.v1');
   if(saved){setScenarioText(exportScenarioR706(parseScenarioR706(saved)));setScenarioStatus('Restored bounded local input. Execute to recompute; saved output is never trusted.');}
  }catch{setScenarioStatus('Saved session/input unavailable or rejected; sample remains.');}
 },[]);
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
  <section aria-label='Inherited developmental execution' data-r624-inherited-development='local-only'>
   <h3>Inherited woven continuity and developmental replay</h3>
   <p>Run the established R651/R653 canonical frame engine through R623 finite-difference Heightened Mode. This is not live production or historical parity proof. R706 accepts typed ingress, egress, blocked, residue and return edges, including cycles and multiple parents, with bounded local scenario input.</p>
   <label htmlFor='r706-scenario-input'>Relational scenario (JSON: 1–12 nodes, 3–12 transport frames)</label>
   <textarea id='r706-scenario-input' aria-label='Relational scenario JSON' data-r706-scenario-input value={scenarioText} onChange={e=>{setScenarioText(e.target.value);setVectorScenario(null);setSessionPreset(null);try{window.localStorage.removeItem('omega7.r711.session.v1');}catch{}}} rows={10} spellCheck={false} style={{display:'block',width:'100%',boxSizing:'border-box',fontFamily:'monospace',fontSize:12}} />
   <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'8px 0'}}>
    <button type='button' data-r624-execute onClick={()=>{
     try{const scenario=parseScenarioR706(scenarioText);const result=replayScenarioR706(scenario);
      setReplayOutput(JSON.stringify({canonicalHistory:result.canonicalHistory,developmental:result.developmental,proof:result.proof,summary:result.summary}));
      setSummaryChanges(result.summary.changes);setVectorScenario(scenario);setSessionPreset(null);try{window.localStorage.removeItem('omega7.r711.session.v1');}catch{}setScenarioStatus('Executed '+result.summary.frames+' frames for '+result.summary.nodes+' nodes. Local model only; no canonical admission.');
      try{window.localStorage.setItem('omega7.r706.scenario.v1',exportScenarioR706(scenario));}catch{setScenarioStatus('Execution passed; browser input persistence unavailable.');}
     }catch(error){setReplayOutput(JSON.stringify({truthClass:'REFUSED_NO_EXECUTION',error:String(error)}));setSummaryChanges([]);setVectorScenario(null);setScenarioStatus('Refused invalid or unsupported scenario; no state was admitted.');}
    }}>Execute inherited replay</button>
    <button type='button' data-r706-export onClick={()=>{try{setPortableScenario(exportScenarioR706(parseScenarioR706(scenarioText)));setScenarioStatus('Portable inputs prepared. No output, authority or proof is exported.');}catch(error){setScenarioStatus('Export refused: '+String(error));}}}>Prepare portable input</button>
    <button type='button' data-r706-reset onClick={()=>{setScenarioText(exportScenarioR706(DEFAULT_SCENARIO_R706));setVectorScenario(null);setSessionPreset(null);try{window.localStorage.removeItem('omega7.r711.session.v1');}catch{}setSummaryChanges([]);setScenarioStatus('Sample restored in editor; execute to replace saved input.');setPortableScenario('');}}>Reset sample</button>
   </div>
   <div data-r712-import-panel style={{margin:'10px 0',padding:8,border:'1px solid var(--o7-border, #606a80)',borderRadius:6}}>
    <label htmlFor='r712-session-import'>Restore portable computational session (source, route endpoints and observer reflection)</label>
    <textarea id='r712-session-import' data-r712-import-input aria-label='Import computational session JSON' value={sessionImportText} onChange={e=>setSessionImportText(e.target.value)} rows={4} spellCheck={false} style={{display:'block',width:'100%',boxSizing:'border-box',fontFamily:'monospace',fontSize:12}} />
    <button type='button' data-r712-import onClick={()=>{
     try{
      const restored=restoreComputationalSessionR711(sessionImportText);
      setScenarioText(restored.sourceJson);setVectorScenario(restored.sourceScenario);setSummaryChanges(restored.replay.summary.changes);
      setReplayOutput(JSON.stringify({canonicalHistory:restored.replay.canonicalHistory,developmental:restored.replay.developmental,proof:restored.replay.proof,summary:restored.replay.summary}));
      setSessionPreset(previous=>({origin:restored.origin,target:restored.target,mirrored:restored.mirrored,revision:(previous?.revision??0)+1}));
      setPortableScenario('');setScenarioStatus('R712 session restored and independently recomputed; source-model only.');
      try{window.localStorage.setItem('omega7.r706.scenario.v1',restored.sourceJson);window.localStorage.setItem('omega7.r711.session.v1',restored.sessionJson);}catch{setScenarioStatus('R712 session recomputed; browser persistence unavailable.');}
     }catch(error){setScenarioStatus('R712 session import REFUSED; current computed session preserved: '+String(error));}
    }}>Validate and restore session</button>
   </div>
   <p role='status' data-r706-status>{scenarioStatus}</p>
   {summaryChanges.length>0&&<div style={{overflowX:'auto'}} data-r706-summary-table><table><thead><tr><th scope='col'>Node</th><th scope='col'>Continuity before</th><th scope='col'>After</th><th scope='col'>Δ continuity</th><th scope='col'>Scar after</th><th scope='col'>Contradiction after</th></tr></thead><tbody>{summaryChanges.map(x=><tr key={x.id}><td>{x.id}</td><td>{x.continuityBefore.toFixed(4)}</td><td>{x.continuityAfter.toFixed(4)}</td><td>{x.continuityDelta.toFixed(4)}</td><td>{x.scarAfter.toFixed(4)}</td><td>{x.contradictionAfter.toFixed(4)}</td></tr>)}</tbody></table></div>}
   {vectorScenario&&<WovenTopologyR707 key={sessionPreset?.revision??'source'} scenario={vectorScenario} initialOrigin={sessionPreset?.origin} initialTarget={sessionPreset?.target} initialMirrored={sessionPreset?.mirrored}/>}
   {portableScenario&&<><label htmlFor='r706-portable'>Portable scenario inputs (copy and paste back into the editor to replay)</label><textarea id='r706-portable' aria-label='Portable scenario JSON' data-r706-portable readOnly value={portableScenario} rows={6} style={{display:'block',width:'100%',boxSizing:'border-box',fontFamily:'monospace',fontSize:12}} /></>}
   <pre data-r624-output style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{replayOutput}</pre>
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

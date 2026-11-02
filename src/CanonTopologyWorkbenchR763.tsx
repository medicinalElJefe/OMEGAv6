import {useMemo,useState} from 'react';
import {R763_AXES,inspectCanonLocalR763,computeCanonPathWitnessR763,
 verifyCanonPathWitnessR763} from './proof/canonNavigationR763.js';
import {R764_LOCAL_KEY,deriveCanonTrajectoryR764,createCanonReplayCheckpointR764,
 verifyCanonReplayCheckpointR764} from './proof/canonTrajectoryR764.js';
import {auditCanonInverseR765,createCanonInverseBundleR765,
 verifyCanonInverseBundleR765} from './proof/canonInverseAuditR765.js';
import {reconstructCanonFullRowR772,R772_FULL_SOURCE_HEADERS,R772_ORIGINAL_SOURCE_PROOF} from './proof/canonFullSourceR772.js';
import {CanonSourceQueryR773} from './CanonSourceQueryR773';

type Goal='STAY'|'TURN'|'ESCALATE';
const exactInt=(s:string,name:string)=>{if(!/^(0|[1-9][0-9]*)$/.test(s))throw new RangeError(name+' requires exact nonnegative integer text');const v=Number(s);if(!Number.isSafeInteger(v))throw new RangeError(name+' is out of bounds');return v;};
const presets:{[key:string]:string[]}={
 ALL:[...R763_AXES],MOTION:['Motion'],OBSERVER:['Motion','Perspective'],
 RELATIONAL:['Relation','Motion','Perspective'],RECONSTRUCTION:['State','Relation','Motion']};
const opt=(s:string)=>s.trim()?s.trim():null;

/** Executable V27 symbolic path lab; never assumes real-world admissibility of an ordinal step. */
export default function CanonTopologyWorkbenchR763({onAddress}:{onAddress?:(address:number)=>void}={}){
 const[start,setStart]=useState('1'),[goal,setGoal]=useState<Goal>('STAY');
 const[axisPreset,setAxisPreset]=useState('ALL'),[mode,setMode]=useState('');
 const[scoreTrend,setScoreTrend]=useState('ANY');
 const[pathConstraintScope,setPathConstraintScope]=useState('TARGET_ONLY');
 const[minScore,setMinScore]=useState(''),[maxBurden,setMaxBurden]=useState(''),
 [maxQ,setMaxQ]=useState(''),[maxHops,setMaxHops]=useState('8'),
 [budget,setBudget]=useState('12000');
 const[witness,setWitness]=useState<any>(null),[error,setError]=useState('');
 const[importText,setImportText]=useState(''),[recovery,setRecovery]=useState('');
 const[frame,setFrame]=useState(0),[checkpointStatus,setCheckpointStatus]=useState('');
 const[inverseImport,setInverseImport]=useState(''),[inverseRecovery,setInverseRecovery]=useState('');
 const replay=useMemo(()=>{
  if(witness?.result?.status!=='FOUND_IN_DECLARED_SYMBOLIC_GRAPH')return null;
  try{return deriveCanonTrajectoryR764(witness);}catch{return null;}
 },[witness]);
 const inverse=useMemo(()=>{
  if(witness?.result?.status!=='FOUND_IN_DECLARED_SYMBOLIC_GRAPH')return null;
  try{return auditCanonInverseR765(witness);}catch{return null;}
 },[witness]);
 const originalRow=useMemo(()=>{try{return reconstructCanonFullRowR772(exactInt(start,'Canon state'));}catch{return null;}},[start]);
 const local=useMemo(()=>{try{return {result:inspectCanonLocalR763(exactInt(start,'Canon state')),error:''};}
  catch(e){return {result:null,error:e instanceof Error?e.message:String(e)};}},[start]);
 const run=()=>{
  try{
   const query={start:exactInt(start,'Canon state'),targetDecision:goal,
    targetMode:mode.trim()?exactInt(mode,'Mode 188'):null,
    allowedAxes:presets[axisPreset],scoreTrend,pathConstraintScope,minScore:opt(minScore),
    maxBurden:opt(maxBurden),maxContradiction:opt(maxQ),
    maxHops:exactInt(maxHops,'maximum hops'),maxVisited:exactInt(budget,'node budget')};
   const out=computeCanonPathWitnessR763(query);
   setWitness(out);setFrame(0);setError('');setRecovery('');setCheckpointStatus('');
  }catch(e){setWitness(null);setError(e instanceof Error?e.message:String(e));}
 };
 const exportWitness=()=>{
  if(!witness)return;
  const raw=JSON.stringify(witness,null,2);
  setImportText(raw);setRecovery('Exported. Independently recompute to verify.');
  const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r763-exact-canon-path.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const verify=()=>{
  try{verifyCanonPathWitnessR763(importText);setRecovery('PASS: R763 exact path and constraints recomputed; no physical authority.');}
  catch(e){setRecovery('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const exportInverse=()=>{
  try{
   if(!witness||!inverse)throw new Error('compute a completed path first');
   const raw=JSON.stringify(createCanonInverseBundleR765(witness),null,2);
   setInverseImport(raw);setInverseRecovery('EXPORTED: portable inverse witness; verify independently.');
   const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='omega-r765-inverse-audit.json';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){setInverseRecovery('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const verifyInverse=()=>{
  try{verifyCanonInverseBundleR765(inverseImport);
   setInverseRecovery('PASS: path and inverse audit independently recomputed; symbolic model only.');
  }catch(e){setInverseRecovery('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const saveCheckpoint=()=>{
  try{if(!witness)throw new Error('calculate a path before saving');
   const checkpoint=createCanonReplayCheckpointR764(witness,frame);
   localStorage.setItem(R764_LOCAL_KEY,JSON.stringify(checkpoint));
   setCheckpointStatus('SAVED: exact modeled path and replay frame in this browser only.');
  }catch(e){setCheckpointStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const loadCheckpoint=()=>{
  try{const raw=localStorage.getItem(R764_LOCAL_KEY);
   if(!raw)throw new Error('no browser-local checkpoint exists');
   const checkpoint=verifyCanonReplayCheckpointR764(raw),q=checkpoint.witness.query;
   const preset=Object.entries(presets).find(([,axes])=>JSON.stringify(axes)===JSON.stringify(q.allowedAxes));
   if(!preset)throw new Error('checkpoint axes are not represented by this instrument');
   setStart(String(q.start));setGoal(q.targetDecision);setAxisPreset(preset[0]);
   setMode(q.targetMode===null?'':String(q.targetMode));setScoreTrend(q.scoreTrend);
   setPathConstraintScope(q.pathConstraintScope);setMinScore(q.minScore??'');
   setMaxBurden(q.maxBurden??'');setMaxQ(q.maxContradiction??'');
   setMaxHops(String(q.maxHops));setBudget(String(q.maxVisited));
   setWitness(checkpoint.witness);setFrame(checkpoint.frame);setError('');
   setCheckpointStatus('RESTORED: saved path independently recomputed; no cross-device or physical authority.');
  }catch(e){setCheckpointStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const clearCheckpoint=()=>{
  try{localStorage.removeItem(R764_LOCAL_KEY);setCheckpointStatus('CLEARED: browser-local checkpoint removed.');}
  catch(e){setCheckpointStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const p=witness?.result;
 return <section className="r316-research" data-r763-canon-navigator="executable" aria-label="R763 generative Canon topology explorer">
  <header className="r316-head"><div><span>R763 · EXACT GENERATIVE CANON</span>
   <h3>Five-axis topology and constrained inverse navigation</h3>
   <p>Traverse the reconstructed 248,832-state symbolic Canon by one ordinal coordinate per step. Every modeled score, Mode 188 state and phase is recomputed exactly; a path is NOT a physical action or empirically validated intervention.</p>
  </div></header>
  <div className="r316-grid">
   <article className="r316-card"><h3>Starting address and constraints</h3>
    <label>Canon index (1–248832) <input data-r763-start inputMode="numeric" value={start} onChange={e=>setStart(e.target.value)}/></label>
    <label>Target decision <select data-r763-goal value={goal} onChange={e=>setGoal(e.target.value as Goal)}>
     <option>STAY</option><option>TURN</option><option>ESCALATE</option></select></label>
    <label>Symbolic transition axes <select data-r763-axes value={axisPreset} onChange={e=>setAxisPreset(e.target.value)}>
     <option value="ALL">All five</option><option value="MOTION">Motion only</option>
     <option value="OBSERVER">Motion + Perspective</option>
     <option value="RELATIONAL">Relation + Motion + Perspective</option>
     <option value="RECONSTRUCTION">State + Relation + Motion</option></select></label>
    <label>Motion score rule <select data-r763-trend value={scoreTrend} onChange={e=>setScoreTrend(e.target.value)}>
      <option value="ANY">Any exact score trajectory</option>
      <option value="NONDECREASING">Never decrease modeled coherence</option></select></label>
    <label>Score / burden / contradiction gate scope <select data-r763-scope value={pathConstraintScope} onChange={e=>setPathConstraintScope(e.target.value)}>
      <option value="TARGET_ONLY">Destination only (legacy search semantics)</option>
      <option value="ALL_NODES">Source and every traversed state (continuity admissibility)</option></select></label>
    <label>Exact Mode 188 (optional) <input data-r763-mode inputMode="numeric" placeholder="Any" value={mode} onChange={e=>setMode(e.target.value)}/></label>
    <label>Minimum exact coherence (optional) <input data-r763-min-score inputMode="decimal" placeholder="Any" value={minScore} onChange={e=>setMinScore(e.target.value)}/></label>
    <label>Maximum burden Λ (optional) <input data-r763-max-burden inputMode="decimal" placeholder="Any" value={maxBurden} onChange={e=>setMaxBurden(e.target.value)}/></label>
    <label>Maximum contradiction q (optional) <input data-r763-max-q inputMode="decimal" placeholder="Any" value={maxQ} onChange={e=>setMaxQ(e.target.value)}/></label>
    <label>Maximum symbolic hops <select data-r763-hops value={maxHops} onChange={e=>setMaxHops(e.target.value)}>
     {[0,4,8,12,20].map(v=><option key={v} value={String(v)}>{v}</option>)}</select></label>
    <label>Maximum examined nodes <select data-r763-budget value={budget} onChange={e=>setBudget(e.target.value)}>
     {[1,100,1000,12000,40000].map(v=><option key={v} value={String(v)}>{v.toLocaleString()}</option>)}</select></label>
    <button type="button" data-r763-search onClick={run}>Calculate shortest admissible modeled path</button>
    {error&&<p role="alert" data-r763-error>{error}</p>}
   </article>
   <article className="r316-card"><h3>Exact source-matched local state</h3>
    {local.result?<><p><b data-r763-node>{local.result.node.key}</b> · Mode 188 <b data-r763-local-mode>{local.result.node.mode188}</b></p>
     <p>Decision <b data-r763-local-decision>{local.result.node.decision}</b> · Exact-derived score {local.result.node.score}</p>
     <p>CΩ {local.result.node.C} · Φ {local.result.node.Phi} · q {local.result.node.q} · Λ {local.result.node.lambda}</p>
     <p>Six-phase resonance: <b data-r763-phase>{local.result.node.phaseGroup}</b> of 6</p>
     <p>Adjacent modeled states: {local.result.neighbors.length}; different-decision neighbors: <b data-r763-local-boundary>{local.result.boundaryNeighbors}</b></p>
     <ul>{local.result.neighbors.map((e:any)=><li key={e.to}>{e.axis} {e.direction>0?'+':'−'}1 → {e.key}, {e.decision}, mode {e.mode188} ({e.exactScoreSign>0?'higher':e.exactScoreSign<0?'lower':'equal'} exact score)</li>)}</ul>
    </>:<p role="alert">{local.error}</p>}
   </article>
  </div>
  {originalRow&&<article className="r316-card" data-r772-source-semantics="source-matched">
   <h3>R772 · Original Full Overall Canon · complete 24-column state</h3>
   <p>Recover the source workbook's actual domain, state, relation, motion, perspective, principle, skins, mirror and water geometry at this Canon address. Every original stored row was independently checked; this is not measured physical motion or a new CanonState authority.</p>
   <p><b>{originalRow.Domain} · {originalRow.State} · {originalRow.Relation} · {originalRow.Motion} · {originalRow.Perspective}</b></p>
   <p data-r772-mirror>{originalRow.Mirror_Statement}</p>
   <p data-r772-water>Water geometry: {originalRow.Water_Geometry_Teal}; Deep Mother: {originalRow.Deep_Mother_Field}; High Father: {originalRow.High_Father_Field}</p>
   <p data-r772-original-fingerprint>Original SHA-256 {R772_ORIGINAL_SOURCE_PROOF.workbookSha256}; 248,832 source rows, 24 original fields, independently replayed. Original source bytes are not publicly bundled.</p>
   <details><summary>Inspect every source-matched field for this address</summary>
    <table><tbody>{R772_FULL_SOURCE_HEADERS.map(k=><tr key={k}><th scope="row">{k}</th><td>{String(originalRow[k])}</td></tr>)}</tbody></table>
   </details>
  </article>}
  <CanonSourceQueryR773 onSelect={index=>{setStart(String(index));setWitness(null);setError("");}}/>
  {p&&<article className="r316-card" data-r763-result>
   <h3>Computed shortest-path result</h3>
   <p>Status: <b data-r763-status>{p.status}</b></p>
   <p data-r763-scope-result>Score / burden / contradiction gate: <b>{p.pathConstraintScope==='ALL_NODES'?'every traversed state':'destination only'}</b>; Mode 188 and decision are destination targets.</p>
   <p>Nodes examined: {p.visited}; {p.status==='FOUND_IN_DECLARED_SYMBOLIC_GRAPH'?<>symbolic hops: <b data-r763-distance>{p.distance}</b>, target: <b data-r763-destination>{p.destination}</b>, boundary-scar crossings: <b data-r763-scars>{p.scarCrossings}</b></>:<>the bounded search does not authorize claims beyond its declared scope</>}</p>
   {p.status==='FOUND_IN_DECLARED_SYMBOLIC_GRAPH'&&<ol data-r763-trace>
     {p.path.map((node:any,i:number)=><li key={node.index}>{node.key} · {node.decision} · Mode {node.mode188} · Phase {node.phaseGroup} · score {node.score}
      {i>0&&<> · via {p.steps[i-1].axis} {p.steps[i-1].direction>0?'+':'−'}1 · {p.steps[i-1].boundaryScar?'boundary crossing':'same decision'}</>}</li>)}
    </ol>}
   <p>Inverse/outverse here means that the ordinal edges are reversible in the abstract graph. Scar denotes recorded modeled boundary crossings along this path, not an observed physical history.</p>
   <button type="button" data-r763-export onClick={exportWitness}>Export exact path certificate (JSON)</button>
  </article>}
  {replay&&<article className="r316-card" data-r764-replay="executable">
   <h3>R764 · Woven continuity replay and exact score transport</h3>
   <p>Step through the computed path, retaining Mode 188, six-phase orientation, exact cumulative score change and decision-boundary scars. This is a symbolic model projection, not physical motion.</p>
   <svg data-r764-plot role="img" aria-label="Modeled exact Canon coherence across successive path frames" viewBox="0 0 700 200" width="100%" height="190">
    <polyline points={replay.plot.map(pt=>pt.x+','+pt.y).join(' ')} fill="none" stroke="#39b9ac" strokeWidth="3"/>
    {replay.frames.map((f,i)=><circle key={f.index} cx={replay.plot[i].x} cy={replay.plot[i].y}
     r={i===frame?8:4} fill={i===frame?'#f3c96a':f.decision==='STAY'?'#3dbba7':f.decision==='TURN'?'#76a9df':'#d58d67'}
     stroke={i===frame?'#ffffff':'none'} strokeWidth="2">
     <title>{f.key+' · '+f.decision+' · modeled score '+f.score}</title>
    </circle>)}
   </svg>
   <p data-r764-frame>Frame <b>{frame+1}</b> / {replay.frames.length} · <b>{replay.frames[frame].key}</b> · Mode {replay.frames[frame].mode188} · phase {replay.frames[frame].phaseGroup} / 6 · {replay.frames[frame].decision} · Atlas 20,736 address <b data-r764-atlas-address>{replay.frames[frame].atlasAddress20736}</b> (outer domain {replay.frames[frame].outerDomain})</p>
   <p data-r764-carry>Exact cumulative score change: {replay.frames[frame].cumulativeExactDelta.numerator}/{replay.frames[frame].cumulativeExactDelta.denominator}; boundary scars: {replay.frames[frame].cumulativeBoundaryScars}. Total: {replay.totalExactScoreDelta.numerator}/{replay.totalExactScoreDelta.denominator}; reverse score return: {replay.inverseScoreReturnExact?'exact':'refused'}.</p>
   <button type="button" data-r764-project-atlas disabled={!onAddress} onClick={()=>onAddress?.(replay.frames[frame].atlasAddress20736)}>Select this 20,736-address Atlas location (local view only)</button>
   <div className="r316-controls">
    <button type="button" data-r764-first disabled={frame===0} onClick={()=>setFrame(0)}>First</button>
    <button type="button" data-r764-prev disabled={frame===0} onClick={()=>setFrame(x=>Math.max(0,x-1))}>Previous</button>
    <button type="button" data-r764-next disabled={frame===replay.frames.length-1} onClick={()=>setFrame(x=>Math.min(replay.frames.length-1,x+1))}>Next</button>
    <button type="button" data-r764-last disabled={frame===replay.frames.length-1} onClick={()=>setFrame(replay.frames.length-1)}>Last</button>
   </div>
  </article>}
  {inverse&&<article className="r316-card" data-r765-inverse="executable">
   <h3>R765 · Directed inverse/outverse and exact axis continuity</h3>
   <p>Every forward ordinal edge admits a geometric reverse, but reverse travel under the SAME score, burden, contradiction and monotone-coherence rules may be refused. This checks the existing witnessed path, not an arbitrary new shortest return route.</p>
   <p data-r765-directed-status>Geometric edge reversal: <b>{inverse.structurallyReversible?'YES':'REFUSED'}</b>. Return from {inverse.destinationIndex} to {inverse.sourceIndex} under the same constraint envelope: <b>{inverse.reverseUnderSameEnvelope?'ADMISSIBLE SYMBOLIC REVERSE':'CONSTRAINT-REFUSED'}</b>.</p>
   <p data-r765-reasons>{inverse.reverseRefusalReasons.length?'Reason(s): '+inverse.reverseRefusalReasons.join(' · '):'All declared reverse path constraints are satisfied.'}</p>
   <p>Phase transitions: {inverse.phaseTransitions}; Mode 188 changes: {inverse.modeTransitions}; decision-boundary crossings: {inverse.boundaryScars}. Signed axis transport and its inverse sum exactly to zero.</p>
   <div data-r765-flux><b>Exact score flux by symbolic axis</b>
    <ul>{R763_AXES.map(axis=><li key={axis}>{axis}: {inverse.signedOrdinalAxisMoves[axis]>0?'+':''}{inverse.signedOrdinalAxisMoves[axis]} ordinal steps · forward {inverse.exactScoreFluxByAxis[axis].numerator}/{inverse.exactScoreFluxByAxis[axis].denominator} · inverse {inverse.exactReverseFluxByAxis[axis].numerator}/{inverse.exactReverseFluxByAxis[axis].denominator}</li>)}</ul>
   </div>
   <p>Physical reversibility, original source authentication and native device action are NOT established; the source/target Canon state labels remain distinguishable from Atlas views.</p>
   <button type="button" data-r765-export onClick={exportInverse}>Export independently verifiable inverse audit (JSON)</button>
   <details data-r765-recovery>
    <summary>Recover and independently verify a portable inverse audit</summary>
    <textarea data-r765-import rows={5} aria-label="R765 portable inverse audit JSON" value={inverseImport} onChange={e=>setInverseImport(e.target.value)}/>
    <button type="button" data-r765-verify onClick={verifyInverse}>Recompute inverse audit</button>
    <p role="status" data-r765-recovery-status>{inverseRecovery}</p>
   </details>
  </article>}
  <article className="r316-card" data-r764-checkpoint>
   <h3>Browser-local trajectory checkpoint</h3>
   <p>Save, reload and independently recompute the selected path and frame. The checkpoint never leaves this browser and is not an authenticated or cross-device memory record.</p>
   <button type="button" data-r764-save disabled={!replay} onClick={saveCheckpoint}>Save modeled path and frame</button>
   <button type="button" data-r764-load onClick={loadCheckpoint}>Reload and verify checkpoint</button>
   <button type="button" data-r764-clear onClick={clearCheckpoint}>Clear checkpoint</button>
   <p role="status" data-r764-status>{checkpointStatus}</p>
  </article>
  <details data-r763-recovery>
   <summary>Independently recompute an exported path certificate</summary>
   <textarea data-r763-import rows={5} aria-label="R763 path witness JSON" value={importText} onChange={e=>setImportText(e.target.value)}/>
   <button type="button" data-r763-verify onClick={verify}>Recompute and verify</button>
   <p role="status" data-r763-recovery-status>{recovery}</p>
  </details>
  <p className="r316-boundary">Mode 188, six-phase geometry, relational q/Λ, exact motion-axis changes, symbolic inverse paths and browser-local exact continuity replay are executable. RSC/Woven persistence, external observer calibration, physical five-dimensional meaning, autonomous Auto-Ping and real-world action authority are NOT established by this graph.</p>
 </section>;
}
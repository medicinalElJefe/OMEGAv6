import {useMemo,useState} from 'react';
import {R763_AXES,inspectCanonLocalR763,computeCanonPathWitnessR763,
 verifyCanonPathWitnessR763} from './proof/canonNavigationR763.js';

type Goal='STAY'|'TURN'|'ESCALATE';
const exactInt=(s:string,name:string)=>{if(!/^(0|[1-9][0-9]*)$/.test(s))throw new RangeError(name+' requires exact nonnegative integer text');const v=Number(s);if(!Number.isSafeInteger(v))throw new RangeError(name+' is out of bounds');return v;};
const presets:{[key:string]:string[]}={
 ALL:[...R763_AXES],MOTION:['Motion'],OBSERVER:['Motion','Perspective'],
 RELATIONAL:['Relation','Motion','Perspective'],RECONSTRUCTION:['State','Relation','Motion']};
const opt=(s:string)=>s.trim()?s.trim():null;

/** Executable V27 symbolic path lab; never assumes real-world admissibility of an ordinal step. */
export default function CanonTopologyWorkbenchR763(){
 const[start,setStart]=useState('1'),[goal,setGoal]=useState<Goal>('STAY');
 const[axisPreset,setAxisPreset]=useState('ALL'),[mode,setMode]=useState('');
 const[minScore,setMinScore]=useState(''),[maxBurden,setMaxBurden]=useState(''),
 [maxQ,setMaxQ]=useState(''),[maxHops,setMaxHops]=useState('8'),
 [budget,setBudget]=useState('12000');
 const[witness,setWitness]=useState<any>(null),[error,setError]=useState('');
 const[importText,setImportText]=useState(''),[recovery,setRecovery]=useState('');
 const local=useMemo(()=>{try{return {result:inspectCanonLocalR763(exactInt(start,'Canon state')),error:''};}
  catch(e){return {result:null,error:e instanceof Error?e.message:String(e)};}},[start]);
 const run=()=>{
  try{
   const query={start:exactInt(start,'Canon state'),targetDecision:goal,
    targetMode:mode.trim()?exactInt(mode,'Mode 188'):null,
    allowedAxes:presets[axisPreset],minScore:opt(minScore),
    maxBurden:opt(maxBurden),maxContradiction:opt(maxQ),
    maxHops:exactInt(maxHops,'maximum hops'),maxVisited:exactInt(budget,'node budget')};
   const out=computeCanonPathWitnessR763(query);
   setWitness(out);setError('');setRecovery('');
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
  {p&&<article className="r316-card" data-r763-result>
   <h3>Computed shortest-path result</h3>
   <p>Status: <b data-r763-status>{p.status}</b></p>
   <p>Nodes examined: {p.visited}; {p.status==='FOUND_IN_DECLARED_SYMBOLIC_GRAPH'?<>symbolic hops: <b data-r763-distance>{p.distance}</b>, target: <b data-r763-destination>{p.destination}</b>, boundary-scar crossings: <b data-r763-scars>{p.scarCrossings}</b></>:<>the bounded search does not authorize claims beyond its declared scope</>}</p>
   {p.status==='FOUND_IN_DECLARED_SYMBOLIC_GRAPH'&&<ol data-r763-trace>
     {p.path.map((node:any,i:number)=><li key={node.index}>{node.key} · {node.decision} · Mode {node.mode188} · Phase {node.phaseGroup} · score {node.score}
      {i>0&&<> · via {p.steps[i-1].axis} {p.steps[i-1].direction>0?'+':'−'}1 · {p.steps[i-1].boundaryScar?'boundary crossing':'same decision'}</>}</li>)}
    </ol>}
   <p>Inverse/outverse here means that the ordinal edges are reversible in the abstract graph. Scar denotes recorded modeled boundary crossings along this path, not an observed physical history.</p>
   <button type="button" data-r763-export onClick={exportWitness}>Export exact path certificate (JSON)</button>
  </article>}
  <details data-r763-recovery>
   <summary>Independently recompute an exported path certificate</summary>
   <textarea data-r763-import rows={5} aria-label="R763 path witness JSON" value={importText} onChange={e=>setImportText(e.target.value)}/>
   <button type="button" data-r763-verify onClick={verify}>Recompute and verify</button>
   <p role="status" data-r763-recovery-status>{recovery}</p>
  </details>
  <p className="r316-boundary">Mode 188, six-phase geometry, relational q/Λ, exact motion-axis changes and symbolic inverse paths are executable. RSC/Woven persistence, external observer calibration, physical five-dimensional meaning, autonomous Auto-Ping and real-world action authority are NOT established by this graph.</p>
 </section>;
}
import {useState} from 'react';
import {compareCanonSlicesR774,parseCanonComparisonR774,verifyCanonComparisonR774,
 R774_LOCAL_KEY,R774_METRICS,R774_GROUPS} from './proof/canonSliceComparisonR774.js';

type Decision='ANY'|'STAY'|'TURN'|'ESCALATE';
type Comparison=ReturnType<typeof compareCanonSlicesR774>;
export function CanonSliceComparisonR774({onSelect}:{onSelect:(address:number)=>void}){
 const [leftDomain,setLeftDomain]=useState('1'),[rightDomain,setRightDomain]=useState('2');
 const [state,setState]=useState(''),[decision,setDecision]=useState<Decision>('ANY');
 const [metric,setMetric]=useState('S_Coherence'),[groupBy,setGroupBy]=useState('Decision');
 const [result,setResult]=useState<Comparison|null>(null),[status,setStatus]=useState('Choose two bounded Canon slices.');
 const [portable,setPortable]=useState(''),[verification,setVerification]=useState('');
 const slice=(domain:string)=>({coordinates:[Number(domain),state?Number(state):null,null,null,null],decision});
 const spec=()=>({left:slice(leftDomain),right:slice(rightDomain),metric,groupBy});
 const execute=()=>{try{
  const output=compareCanonSlicesR774(spec());setResult(output);setVerification('');
  setStatus('EXECUTED: '+output.left.matched+' left and '+output.right.matched+' right source rows; no CanonState writes.');
 }catch(e){setResult(null);setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const save=()=>{try{localStorage.setItem(R774_LOCAL_KEY,JSON.stringify(spec()));
  setStatus('SAVED: local comparison parameters only; source results are recomputed.');
 }catch(e){setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const restore=()=>{try{
  const raw=localStorage.getItem(R774_LOCAL_KEY);if(!raw)throw new Error('no local comparison');
  const q=parseCanonComparisonR774(raw);
  if(q.left.coordinates[0]===null||q.right.coordinates[0]===null||
   q.left.coordinates.slice(2).some(x=>x!==null)||q.right.coordinates.slice(2).some(x=>x!==null)||
   q.left.coordinates[1]!==q.right.coordinates[1]||q.left.decision!==q.right.decision)
   throw new Error('saved comparison is outside this two-domain instrument');
  setLeftDomain(String(q.left.coordinates[0]));setRightDomain(String(q.right.coordinates[0]));
  setState(q.left.coordinates[1]===null?'':String(q.left.coordinates[1]));
  setDecision(q.left.decision as Decision);setMetric(q.metric);setGroupBy(q.groupBy);
  setResult(null);setPortable('');setVerification('');
  setStatus('RESTORED: validated parameters; execute to recompute both source slices.');
 }catch(e){setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const exportResult=()=>{try{
  if(!result)throw new Error('execute a comparison first');
  const raw=JSON.stringify(result);setPortable(raw);setVerification('EXPORTED: recompute to verify.');
  const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r774-canon-slice-comparison.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(e){setVerification('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const verify=()=>{try{const checked=verifyCanonComparisonR774(portable);
  setVerification('PASS: '+checked.left.matched+' / '+checked.right.matched+' rows independently recomputed.');
 }catch(e){setVerification('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const domains=Array.from({length:12},(_,i)=>String(i+1));
 return <section className="r316-card" data-r774-comparison="executable" aria-label="R774 original Canon slice comparison">
  <h3>R774 · Compare two original-source Canon slices</h3>
  <p>Exact four-decimal source-metric aggregates, decision census and group deltas. Each side examines at most 20,736 source addresses. Derived symbolic data only: no measured physics, prediction, CanonState admission or device action.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
   <label>Left Domain <select data-r774-left-domain value={leftDomain} onChange={e=>{setLeftDomain(e.target.value);setResult(null);}}>{domains.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
   <label>Right Domain <select data-r774-right-domain value={rightDomain} onChange={e=>{setRightDomain(e.target.value);setResult(null);}}>{domains.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
   <label>State <select data-r774-state value={state} onChange={e=>{setState(e.target.value);setResult(null);}}><option value="">Any</option>{domains.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
   <label>Decision <select data-r774-decision value={decision} onChange={e=>{setDecision(e.target.value as Decision);setResult(null);}}>{(['ANY','STAY','TURN','ESCALATE'] as const).map(d=><option key={d}>{d}</option>)}</select></label>
   <label>Metric <select data-r774-metric value={metric} onChange={e=>{setMetric(e.target.value);setResult(null);}}>{R774_METRICS.map(m=><option key={m}>{m}</option>)}</select></label>
   <label>Group by <select data-r774-group value={groupBy} onChange={e=>{setGroupBy(e.target.value);setResult(null);}}>{R774_GROUPS.map(g=><option key={g}>{g}</option>)}</select></label>
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
   <button type="button" data-r774-run onClick={execute}>Compute source comparison</button>
   <button type="button" data-r774-save onClick={save}>Save parameters</button>
   <button type="button" data-r774-restore onClick={restore}>Restore parameters</button>
   <button type="button" data-r774-export disabled={!result} onClick={exportResult}>Export comparison JSON</button>
  </div>
  <p role="status" data-r774-status>{status}</p>
  {result&&<div data-r774-result>
   <p>Left: <b data-r774-left-count>{result.left.matched}</b> matches / {result.left.examined} examined; mean {result.left.summary.mean??'—'}.
    Right: <b data-r774-right-count>{result.right.matched}</b> matches / {result.right.examined} examined; mean {result.right.summary.mean??'—'}.
    Mean difference (right − left): <b data-r774-mean-delta>{result.meanDelta??'undefined (empty slice)'}</b>.</p>
   <p>Decision census (left / right): STAY {result.left.decisionCounts.STAY} / {result.right.decisionCounts.STAY};
    TURN {result.left.decisionCounts.TURN} / {result.right.decisionCounts.TURN};
    ESCALATE {result.left.decisionCounts.ESCALATE} / {result.right.decisionCounts.ESCALATE}.</p>
   <div style={{overflowX:'auto'}}><table><thead><tr><th>Group</th><th>Left rows</th><th>Right rows</th><th>Left mean</th><th>Right mean</th><th>Δ mean</th><th>Inspect</th></tr></thead>
    <tbody>{result.groups.map(g=><tr key={g.label} data-r774-group-row>
     <th>{g.label}</th><td>{g.leftCount}</td><td>{g.rightCount}</td>
     <td>{g.leftMean??'—'}</td><td>{g.rightMean??'—'}</td><td>{g.meanDelta??'—'}</td>
     <td>{g.leftAddress!==null&&<button type="button" data-r774-open-left={g.leftAddress} onClick={()=>onSelect(g.leftAddress!)}>Left #{g.leftAddress}</button>}
      {g.rightAddress!==null&&<button type="button" data-r774-open-right={g.rightAddress} onClick={()=>onSelect(g.rightAddress!)}>Right #{g.rightAddress}</button>}</td>
    </tr>)}</tbody></table></div>
  </div>}
  <details data-r774-portable><summary>Verify portable comparison against reconstructed source</summary>
   <label>JSON witness <textarea data-r774-import value={portable} onChange={e=>setPortable(e.target.value)} rows={5} style={{width:'100%',boxSizing:'border-box'}} spellCheck={false}/></label>
   <button type="button" data-r774-verify onClick={verify}>Independently recompute</button>
   <p role="status" data-r774-verification>{verification}</p>
  </details>
 </section>;
}

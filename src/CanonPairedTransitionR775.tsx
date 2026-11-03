import {useState} from 'react';
import {computeCanonPairedTransitionR775,parseCanonPairedTransitionR775,
 verifyCanonPairedTransitionR775,R775_LOCAL_KEY} from './proof/canonPairedTransitionR775.js';
import {R774_METRICS} from './proof/canonSliceComparisonR774.js';

type Result=ReturnType<typeof computeCanonPairedTransitionR775>;
export function CanonPairedTransitionR775({onSelect}:{onSelect:(address:number)=>void}){
 const [leftDomain,setLeftDomain]=useState('1'),[rightDomain,setRightDomain]=useState('2');
 const [state,setState]=useState(''),[metric,setMetric]=useState('S_Coherence');
 const [result,setResult]=useState<Result|null>(null),[status,setStatus]=useState('Select aligned Canon domains.');
 const [portable,setPortable]=useState(''),[verification,setVerification]=useState('');
 const domains=Array.from({length:12},(_,i)=>String(i+1));
 const spec=()=>({leftDomain:Number(leftDomain),rightDomain:Number(rightDomain),
  state:state===''?null:Number(state),metric});
 const invalidate=()=>{setResult(null);setVerification('');};
 const execute=()=>{try{
  const next=computeCanonPairedTransitionR775(spec());setResult(next);setVerification('');
  setStatus('EXECUTED: '+next.paired+' aligned source pairs; '+next.changed+' decision transitions. No CanonState writes.');
 }catch(e){setResult(null);setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const save=()=>{try{localStorage.setItem(R775_LOCAL_KEY,JSON.stringify(spec()));
  setStatus('SAVED: browser-local parameters only; paired source data recomputes.');
 }catch(e){setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const restore=()=>{try{
  const raw=localStorage.getItem(R775_LOCAL_KEY);if(!raw)throw Error('no saved paired transition');
  const q=parseCanonPairedTransitionR775(raw);
  setLeftDomain(String(q.leftDomain));setRightDomain(String(q.rightDomain));
  setState(q.state===null?'':String(q.state));setMetric(q.metric);
  setResult(null);setPortable('');setVerification('');
  setStatus('RESTORED: validated local parameters; recompute to execute.');
 }catch(e){setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const exportResult=()=>{try{
  if(!result)throw Error('execute a paired transition first');
  const raw=JSON.stringify(result);setPortable(raw);setVerification('EXPORTED: independently recompute to verify.');
  const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r775-canon-paired-transitions.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(e){setVerification('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const verify=()=>{try{
  const checked=verifyCanonPairedTransitionR775(portable);
  setVerification('PASS: '+checked.paired+' aligned pairs independently recomputed.');
 }catch(e){setVerification('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 return <section className="r316-card" data-r775-paired-transitions="executable" aria-label="R775 Canon paired decision transitions">
  <h3>R775 · Aligned Canon decision transitions</h3>
  <p>Pair each of the same 12⁴ local source addresses between two domains. Compute a nine-cell STAY / TURN / ESCALATE transition matrix and exact four-decimal metric differences. Symbolic source comparison only; no empirical dynamics, device action or CanonState mutation.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
   <label>From Domain <select data-r775-left-domain value={leftDomain} onChange={e=>{setLeftDomain(e.target.value);invalidate();}}>{domains.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
   <label>To Domain <select data-r775-right-domain value={rightDomain} onChange={e=>{setRightDomain(e.target.value);invalidate();}}>{domains.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
   <label>State <select data-r775-state value={state} onChange={e=>{setState(e.target.value);invalidate();}}><option value="">Any</option>{domains.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
   <label>Metric <select data-r775-metric value={metric} onChange={e=>{setMetric(e.target.value);invalidate();}}>{R774_METRICS.map(m=><option key={m} value={m}>{m}</option>)}</select></label>
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
   <button type="button" data-r775-run onClick={execute}>Compute paired transitions</button>
   <button type="button" data-r775-save onClick={save}>Save parameters</button>
   <button type="button" data-r775-restore onClick={restore}>Restore parameters</button>
   <button type="button" data-r775-export disabled={!result} onClick={exportResult}>Export transition JSON</button>
  </div>
  <p role="status" data-r775-status>{status}</p>
  {result&&<div data-r775-result>
   <p>Aligned pairs: <b data-r775-pairs>{result.paired}</b> · Changed decisions: <b data-r775-changed>{result.changed}</b> · Stable: {result.stable} · Mean metric difference (right − left): <b data-r775-mean-delta>{result.meanDelta}</b>.</p>
   <div style={{overflowX:'auto'}}><table><thead><tr><th>From</th><th>To</th><th>Pairs</th><th>Mean Δ</th><th>Inspect original pair</th></tr></thead>
    <tbody>{result.matrix.map(cell=><tr key={cell.from+'-'+cell.to} data-r775-transition-row>
     <th>{cell.from}</th><td>{cell.to}</td><td>{cell.count}</td><td>{cell.meanDelta??'—'}</td>
     <td>{cell.firstLeftAddress!==null&&<button type="button" data-r775-open-left={cell.firstLeftAddress} onClick={()=>onSelect(cell.firstLeftAddress!)}>From #{cell.firstLeftAddress}</button>}
      {cell.firstRightAddress!==null&&<button type="button" data-r775-open-right={cell.firstRightAddress} onClick={()=>onSelect(cell.firstRightAddress!)}>To #{cell.firstRightAddress}</button>}</td>
    </tr>)}</tbody></table></div>
  </div>}
  <details data-r775-portable><summary>Independently verify original-source transition witness</summary>
   <label>JSON witness <textarea data-r775-import value={portable} onChange={e=>setPortable(e.target.value)} rows={5} style={{width:'100%',boxSizing:'border-box'}} spellCheck={false}/></label>
   <button type="button" data-r775-verify onClick={verify}>Recompute and verify</button>
   <p role="status" data-r775-verification>{verification}</p>
  </details>
 </section>;
}

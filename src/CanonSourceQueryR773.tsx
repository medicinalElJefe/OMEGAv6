import {useMemo,useState} from 'react';
import {CanonSliceComparisonR774} from './CanonSliceComparisonR774';
import {CanonPairedTransitionR775} from './CanonPairedTransitionR775';
import {R763_AXES,R763_STRIDES} from './proof/canonNavigationR763.js';
import {reconstructCanonFullRowR772} from './proof/canonFullSourceR772.js';
import {R773_QUERY_LOCAL_KEY,queryCanonSourceR773,verifyCanonSourceQueryR773,parseCanonSourceQueryR773} from './proof/canonSourceQueryR773.js';

type DecisionR773='ANY'|'STAY'|'TURN'|'ESCALATE';
type QueryResultR773=ReturnType<typeof queryCanonSourceR773>;
export function CanonSourceQueryR773({onSelect}:{onSelect:(index:number)=>void}){
 const [axes,setAxes]=useState<(number|null)[]>([1,null,null,null,null]);
 const [decision,setDecision]=useState<DecisionR773>('ANY');
 const [result,setResult]=useState<QueryResultR773|null>(null);
 const [status,setStatus]=useState('Select a bounded source slice, then execute.');
 const [snapshot,setSnapshot]=useState('');
 const [verification,setVerification]=useState('');
 const labels=useMemo(()=>R763_AXES.map((axis,i)=>Array.from({length:12},(_,n)=>{
  const row=reconstructCanonFullRowR772(1+n*R763_STRIDES[i]);
  return String(row[axis as keyof typeof row]);
 })),[]);
 const query=(offset=0)=>({coordinates:axes,decision,offset,limit:12});
 const execute=(offset=0)=>{
  try{const next=queryCanonSourceR773(query(offset));setResult(next);
   setStatus('EXECUTED: '+next.total+' matching original source rows; '+next.examined+' source addresses examined.');
   setVerification('');
  }catch(e){setResult(null);setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const editAxis=(i:number,value:string)=>{
  setAxes(old=>old.map((v,j)=>j===i?(value===''?null:Number(value)):v));
  setResult(null);setSnapshot('');setVerification('');
 };
 const save=()=>{
  try{localStorage.setItem(R773_QUERY_LOCAL_KEY,JSON.stringify(query(0)));
   setStatus('SAVED: query only in this browser; results are always recomputed.');}
  catch(e){setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const load=()=>{
  try{const raw=localStorage.getItem(R773_QUERY_LOCAL_KEY);
   if(!raw)throw new Error('no saved local query');
   const q=parseCanonSourceQueryR773(raw);
   setAxes(q.coordinates);setDecision(q.decision);setResult(null);setSnapshot('');setVerification('');
   setStatus('RESTORED: validated query; execute to recompute source results.');}
  catch(e){setStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const exportSnapshot=()=>{
  try{if(!result)throw new Error('execute a source query first');
   const raw=JSON.stringify(result);setSnapshot(raw);setVerification('EXPORTED: verify independently.');
   const url=URL.createObjectURL(new Blob([raw+'\n'],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='omega-r773-canon-source-query.json';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){setVerification('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 const verify=()=>{
  try{const restored=verifyCanonSourceQueryR773(snapshot);
   setVerification('PASS: '+restored.total+' matches independently recomputed from original-source formulas.');}
  catch(e){setVerification('REFUSED: '+(e instanceof Error?e.message:String(e)));}
 };
 return <article className="r316-card" data-r773-canon-query="executable" aria-label="R773 original Canon source query">
  <h3>R773 · Search the complete original Canon source</h3>
  <p>Query source-matched domain, state, relation, motion, perspective and Mode 188 decision across the 248,832 original rows. At least one axis must be fixed to bound execution to 20,736 rows or fewer. This is symbolic workbook computation, not empirical forecasting or CanonState admission.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
   {R763_AXES.map((axis,i)=><label key={axis}>{axis}
    <select data-r773-axis={axis} value={axes[i]??''} onChange={e=>editAxis(i,e.target.value)}>
     <option value="">Any</option>
     {labels[i].map((name,n)=><option key={n+1} value={n+1}>{n+1} · {name}</option>)}
    </select>
   </label>)}
   <label>Decision <select data-r773-decision value={decision} onChange={e=>{setDecision(e.target.value as DecisionR773);setResult(null);setSnapshot('');}}>
    {(['ANY','STAY','TURN','ESCALATE'] as const).map(d=><option key={d} value={d}>{d}</option>)}
   </select></label>
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
   <button type="button" data-r773-execute onClick={()=>execute()}>Execute source query</button>
   <button type="button" data-r773-save onClick={save}>Save query locally</button>
   <button type="button" data-r773-load onClick={load}>Restore query</button>
   <button type="button" data-r773-export disabled={!result} onClick={exportSnapshot}>Export verified-source JSON</button>
  </div>
  <p role="status" data-r773-status>{status}</p>
  {result&&<section data-r773-results>
   <p>Matches: <b data-r773-total>{result.total}</b> · Examined: {result.examined} · Showing {result.rows.length} starting at {result.query.offset+1}.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button type="button" data-r773-prev disabled={result.query.offset===0} onClick={()=>execute(Math.max(0,result.query.offset-12))}>Previous 12</button>
    <button type="button" data-r773-next disabled={!result.hasMore} onClick={()=>execute(result.query.offset+12)}>Next 12</button>
   </div>
   <ol>{result.rows.map(row=><li key={row.Atlas_Index} data-r773-row>
    <button type="button" data-r773-open={row.Atlas_Index} onClick={()=>onSelect(row.Atlas_Index)}>Inspect Canon #{row.Atlas_Index}</button>
    {' · '+row.Domain+' / '+row.State+' / '+row.Relation+' / '+row.Motion+' / '+row.Perspective}
    {' · '+row.Decision+' · CΩ '+row['CΩ_Continuity']+' · Φ '+row['Φ_Future_Plasticity']}
   </li>)}</ol>
  </section>}
  <details data-r773-portable>
   <summary>Verify portable source-query result</summary>
   <label>JSON snapshot <textarea data-r773-import value={snapshot} onChange={e=>setSnapshot(e.target.value)} rows={5} style={{width:'100%',boxSizing:'border-box'}} spellCheck={false}/></label>
   <button type="button" data-r773-verify onClick={verify}>Independently recompute and verify</button>
   <p role="status" data-r773-verification>{verification}</p>
  </details>
  <CanonSliceComparisonR774 onSelect={onSelect}/>
  <CanonPairedTransitionR775 onSelect={onSelect}/>
 </article>;
}

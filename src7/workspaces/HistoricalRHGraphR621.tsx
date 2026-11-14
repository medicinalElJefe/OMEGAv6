import {useEffect,useMemo,useRef,useState,type ChangeEvent} from 'react';
import type {R823Graph} from './historicalRHSourceR823';
/** Source-gated historical RH graph within the existing Visual Instrument.
 * Two original admitted golden examples are always available. An exact
 * original user-selected v21 XLSX unlocks all 416 edges in browser memory.
 * No workbook bytes are bundled, uploaded, or persisted.
 */
type Edge={id:string;sourceConcept:string;targetConcept:string;kind:'antipode_state'|'prereq';weight:number;sourceRow:number;targetRow:number};
const verifiedEdges:readonly Edge[]=[
 {id:'E00001',sourceConcept:'RH0001',targetConcept:'RH0001',kind:'antipode_state',weight:0.2,sourceRow:5991,targetRow:16473},
 {id:'E00002',sourceConcept:'RH0002',targetConcept:'RH0002',kind:'antipode_state',weight:0.2,sourceRow:18087,targetRow:7833},
];
export function admittedHistoricalEdgesR621(address:number):readonly Edge[]{
 if(!Number.isInteger(address)||address<0||address>=20736)return [];
 return verifiedEdges.filter(e=>e.sourceRow-1===address);
}
type Filter='ALL'|'antipode_state'|'prereq';
export default function HistoricalRHGraphR621({address,onAddress}:{address:number;onAddress:(n:number)=>void}){
 const[full,setFull]=useState<R823Graph|null>(null);
 // Only the latest import may publish a result; invalidate pending work on unmount.
 const importGeneration=useRef(0);
 useEffect(()=>()=>{importGeneration.current+=1},[]);
 const[status,setStatus]=useState<'PREVIEW_ONLY'|'READING'|'VERIFIED_FULL_LOCAL'|'REFUSED'>('PREVIEW_ONLY');
 const[error,setError]=useState('');
 const[kind,setKind]=useState<Filter>('ALL');
 const[conceptQuery,setConceptQuery]=useState('');
 const onImport=async(event:ChangeEvent<HTMLInputElement>)=>{
  const input=event.currentTarget;
  const file=input.files?.[0];if(!file)return;
  const generation=++importGeneration.current;
  // A failure must invalidate any previously imported graph rather than leaving
  // stale source data presented as the result of a rejected new import.
  setFull(null);setStatus('READING');setError('');
  try{
   if(file.size>2_500_000)throw Error('Original v21 workbook must be within the 2.5 MB import cap.');
   const {loadOriginalRHWorkbookR823}=await import('./historicalRHSourceR823');
   const admitted=await loadOriginalRHWorkbookR823(await file.arrayBuffer());
   if(generation!==importGeneration.current)return;
   setFull(admitted);setStatus('VERIFIED_FULL_LOCAL');
  }catch(e){
   if(generation!==importGeneration.current)return;
   setFull(null);setStatus('REFUSED');setError(e instanceof Error?e.message:String(e));
  }
  // React clears currentTarget after dispatch; preserve the element before
  // asynchronous SHA/import work so resetting the upload cannot throw.
  // Only the request still owning this input may clear its selection.
  // A late older request must not erase a newer file chosen in the same control.
  if(generation===importGeneration.current)input.value='';
 };
 const edges=useMemo<readonly Edge[]>(()=>{
  const selected=full
   ?full.edges.filter(e=>e.fromRow-1===address).map(e=>({id:e.id,sourceConcept:e.from,targetConcept:e.to,kind:e.kind,weight:e.weight,sourceRow:e.fromRow,targetRow:e.toRow}))
   :admittedHistoricalEdgesR621(address);
  return kind==='ALL'?selected:selected.filter(e=>e.kind===kind);
 },[full,address,kind]);
 const incoming=useMemo(()=>full?full.edges.filter(e=>e.toRow-1===address&&(kind==='ALL'||e.kind===kind)):[],[full,address,kind]);
 const concepts=useMemo(()=>full?full.concepts.filter(n=>n.row-1===address):[],[full,address]);
 // Search only the verified in-memory original; never promote preview examples
 // to complete conceptual identities or send a query to a server.
 const matches=useMemo(()=>{
  const q=conceptQuery.trim().toLocaleLowerCase();
  if(!full||!q)return [];
  return full.concepts.filter(n=>n.id.toLowerCase().includes(q)||n.name.toLocaleLowerCase().includes(q)).slice(0,12);
 },[full,conceptQuery]);
 return <section data-r621-historical-rh-graph='true' data-address={address} aria-label='Historical RH graph instrument'>
  <h3>Historical RH graph · original conceptual-to-state traversal</h3>
  <p>Original v21 archive: 320 distinct conceptual RH nodes and 416 typed edges. {full?'The complete original RH graph is imported and source-fingerprint verified in this browser session; it is not deployed as a server/native executor.':'This browser instrument includes only two independently admitted golden records. The complete historical graph is not deployed here; missing example edges are not interpreted as absent from the archive.'}</p>
  <label style={{display:'grid',gap:6,maxWidth:490,fontSize:13}}>
   Import original v21 RH graph workbook (.xlsx) · browser-local only
   <input data-r823-original-workbook-input='true' type='file' accept='.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' onChange={onImport} />
  </label>
  <div role='status' data-r823-import-status={status} style={{marginTop:8,fontSize:13}}>
   {status==='VERIFIED_FULL_LOCAL'
    ?'ORIGINAL-SHA MATCHED · 320 RH concepts / 25 distinct addresses / 416 typed edges · exact v21 source workbook; no external upload or Canon mutation'
    :status==='READING'?'Verifying original workbook SHA-256 and all typed RH relationships…'
    :status==='REFUSED'?'REFUSED · '+error:'PREVIEW_ONLY · original workbook source bytes not loaded'}
  </div>
  {full&&<button type='button' onClick={()=>{importGeneration.current+=1;setFull(null);setStatus('PREVIEW_ONLY');setError('');setKind('ALL');setConceptQuery('')}}>Clear imported graph</button>}
  <p>Current canonical address: <strong>{address}</strong> (workbook row {address+1}). {full?'Verified original workbook rows, session-local execution only.':'Source admission: local sample PASS; production graph execution: not verified.'}</p>
  {full&&<section data-r839-incoming-edges='true' aria-label='Incoming original RH relationships'>
   <h4>Incoming verified relationships · {incoming.length} · {kind==='ALL'?'all admitted types':kind}</h4>
   {incoming.length===0?<p>No incoming relationship of the selected type is recorded at this address in the imported original RH graph.</p>:
    <ol style={{maxHeight:220,overflowY:'auto'}}>{incoming.map(e=><li key={e.id}>
     {e.id} · {e.from} → {e.to} · {e.kind} · weight {e.weight}
     <button type='button' onClick={()=>onAddress(e.fromRow-1)}>Follow source {e.from} · address {e.fromRow-1}</button>
    </li>)}</ol>}
  </section>}
  {full&&<p data-r823-address-multiplicity='true'>This address contains {concepts.length} distinct RH concept{concepts.length===1?'':'s'}; conceptual identity is never collapsed into its shared state address.
   {concepts.length>0&&<span> {concepts.slice(0,8).map(n=>n.id+' ('+n.name+')').join(' · ')}{concepts.length>8?' · …':''}</span>}</p>}
  {full&&<div data-r827-concept-lookup='true' style={{marginTop:10}}>
   <label style={{display:'grid',gap:4,maxWidth:490,fontSize:13}}>Find original RH concept by ID or name
    <input type='search' value={conceptQuery} onChange={e=>setConceptQuery(e.target.value)} placeholder='RH0001 or concept name' aria-label='Find verified RH concept' />
   </label>
   {conceptQuery.trim()&&<div role='status' data-r827-lookup-count={matches.length} style={{fontSize:13,marginTop:6}}>{matches.length===12?'First 12 matches shown':matches.length+' matching concepts'} · verified browser-local source only</div>}
   {matches.length>0&&<ol data-r827-concept-results='true' style={{maxHeight:200,overflowY:'auto'}}>{matches.map(n=><li key={n.id}>
    <button type='button' onClick={()=>onAddress(n.row-1)}>{n.id} · {n.name} · address {n.row-1}</button>
   </li>)}</ol>}
  </div>}
  <label style={{display:'inline-flex',gap:8,alignItems:'center',fontSize:13}}>Typed edge filter
   <select data-r823-typed-filter='true' value={kind} onChange={e=>setKind(e.target.value as Filter)}>
    <option value='ALL'>All admitted types</option>
    <option value='antipode_state'>Antipode-state transitions</option>
    <option value='prereq'>Prerequisite relationships</option>
   </select>
  </label>
  {edges.length===0?<p data-r621-empty='true'>{full?'No source-recorded edge of this type at this address in the exact imported RH graph. This does not prove absence of separate coupling edges.':'No admitted browser-side example at this address. This is not a graph-completeness result.'}</p>:
   <ol style={{maxHeight:370,overflowY:'auto',paddingRight:8}}>{edges.map(e=><li key={e.id} data-r621-edge={e.id} style={{marginBottom:12}}>
    <b>{e.id}</b> · {e.sourceConcept} → {e.targetConcept} · {e.kind} · weight {e.weight}
    <div>Workbook rows {e.sourceRow} → {e.targetRow}; canonical addresses {e.sourceRow-1} → {e.targetRow-1}</div>
    <button type='button' onClick={()=>onAddress(e.targetRow-1)}>Traverse {e.id} to address {e.targetRow-1}</button>
   </li>)}</ol>}
  <p>Conceptual RH identities, state addresses and antipode/prerequisite edge types are distinct. This local workbook import does not prove Time Mandala equivalence, the separately claimed 10,368 coupling edges, historical SQLite/native execution, empirical dimensionality, connected-host activity, or R125 Canon admission.</p>
 </section>;
}

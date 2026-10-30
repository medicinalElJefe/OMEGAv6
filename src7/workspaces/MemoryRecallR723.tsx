import {useEffect,useState,type FormEvent} from 'react';
import {MEMORY_KEY_R722} from '../../src/portableMemoryRecoveryR722.mjs';
import {queryVerifiedMemoryR723,inspectVerifiedMemoryR723} from '../../src/verifiedMemoryRecallR723.mjs';

type Hit={id:string;at:number;address:number;stateId:number;note:string;decision:string;sha256:string;matchedFields:string[];score:number};
type Recall={total:number;verifiedCount:number;results:Hit[];truthClass:string};
type Snapshot=Hit&{metrics:Record<string,unknown>;routeNext:number|null;authority:string};
const readRows=()=>{
 const raw=localStorage.getItem(MEMORY_KEY_R722);
 if(raw===null)return [];
 if(new TextEncoder().encode(raw).length>524288)throw Error('R723 local memory size refused');
 try{return JSON.parse(raw)}catch{throw Error('R723 local memory JSON damaged; recall refused')}
};

export function MemoryRecallR723({onAddress}:{onAddress:(address:number)=>void}){
 const [query,setQuery]=useState('');
 const [result,setResult]=useState<Recall|null>(null);
 const [selected,setSelected]=useState<Snapshot|null>(null);
 const [error,setError]=useState('');
 const [status,setStatus]=useState('');
 useEffect(()=>{
  const invalidate=()=>{setResult(null);setSelected(null);setStatus('Memory changed; run verified recall again.');setError('')};
  window.addEventListener('omega-r722-memory-updated',invalidate);
  window.addEventListener('storage',invalidate);
  return()=>{window.removeEventListener('omega-r722-memory-updated',invalidate);window.removeEventListener('storage',invalidate)};
 },[]);
 const fail=(e:unknown)=>{setResult(null);setSelected(null);setStatus('');setError(e instanceof Error?e.message:'R723 recall refused')};
 const search=async()=>{
  setResult(null);setSelected(null);setStatus('');setError('');
  try{const next=await queryVerifiedMemoryR723(readRows(),query);setResult(next);setStatus(next.total+' matching verified local snapshot(s).')}
  catch(e){fail(e)}
 };
 const inspect=async(hit:Hit)=>{
  setSelected(null);setError('');
  try{setSelected(await inspectVerifiedMemoryR723(readRows(),hit.id,hit.sha256,hit.at))}
  catch(e){fail(e)}
 };
 const replay=async()=>{
  if(!selected)return;
  try{
   const source=await inspectVerifiedMemoryR723(readRows(),selected.id,selected.sha256,selected.at);
   onAddress(source.address);setError('');setStatus('Verified local source address '+source.address+' selected; no CanonState admission.');
  }catch(e){fail(e)}
 };
 return <section data-r723-recall aria-label='Verified memory recall' style={{maxWidth:'100%',minWidth:0,overflowWrap:'anywhere',padding:12,margin:'12px 0',border:'1px solid #65727d',borderRadius:8}}>
  <h2>R723 · Verified memory recall</h2>
  <p>Search the actual R28 notes, decisions, state addresses and source digests. All stored snapshots are verified before retrieval; every result cites its browser-local source. This is deterministic retrieval, not generated intelligence.</p>
  <form onSubmit={(event:FormEvent)=>{event.preventDefault();void search()}} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <input data-r723-query aria-label='Memory recall query' value={query} maxLength={160} onChange={event=>setQuery(event.target.value)} placeholder='Search a note, decision or state' style={{flex:'1 1 180px',minWidth:0}}/>
   <button data-r723-search type='submit'>Verify and search memory</button>
  </form>
  {error&&<p data-r723-error role='alert'>REFUSED: {error}</p>}
  {status&&<p data-r723-status role='status'>{status}</p>}
  {result&&<div data-r723-results>
   <p data-r723-summary>{result.total} matching sources · {result.verifiedCount} digests checked · up to {result.results.length} displayed</p>
   {result.results.map(hit=><article data-r723-result key={hit.id} style={{borderTop:'1px solid #65727d',padding:'8px 0'}}>
    <b>STATE {hit.stateId} · {hit.decision}</b>
    <p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{hit.note||'Packet snapshot without note'}</p>
    <small>Matched: {hit.matchedFields.join(', ')} · local SHA-256 {hit.sha256}</small>
    <div><button data-r723-select type='button' onClick={()=>void inspect(hit)}>Inspect verified source</button></div>
   </article>)}
  </div>}
  {selected&&<section data-r723-selected style={{borderTop:'1px solid #65727d',marginTop:8,paddingTop:8}}>
   <h3>Verified source · STATE {selected.stateId}</h3>
   <p>{selected.note||'No note'} · {selected.decision} · address {selected.address}</p>
   <small>Source ID: {selected.id} · SHA-256: {selected.sha256} · captured {new Date(selected.at).toLocaleString()}</small>
   <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:240,overflow:'auto'}}>{JSON.stringify(selected.metrics,null,2)}</pre>
   <button data-r723-replay type='button' onClick={()=>void replay()}>Replay verified source address</button>
  </section>}
  <small data-r723-boundary>Source digests detect mutation but do not authenticate authorship. No provider model inference, cross-device synchronization, historical donor identity, native host execution or R125 CanonState admission is claimed. Altered storage fails closed.</small>
 </section>;
}

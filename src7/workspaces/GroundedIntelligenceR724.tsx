import {useEffect,useState,type FormEvent} from 'react';
import {MEMORY_KEY_R722} from '../../src/portableMemoryRecoveryR722.mjs';
import {composeGroundedIntelligenceR724,revalidateGroundedIntelligenceR724} from '../../src/groundedIntelligenceR724.mjs';
import {inspectVerifiedMemoryR723} from '../../src/verifiedMemoryRecallR723.mjs';

type Source={id:string;at:number;sha256:string;address:number;stateId:number;decision:string;note:string;metrics:Record<string,unknown>;matchedFields:string[];score:number};
type Packet={schema:string;question:string;query:string;status:string;totalMatches:number;verifiedCount:number;sources:Source[];statements:{sourceId:string;sourceDigest:string;text:string}[];truthClass:string;packetSha256:string};
const readRows=()=>{
 const raw=localStorage.getItem(MEMORY_KEY_R722);
 if(raw===null)return [];
 if(new TextEncoder().encode(raw).length>524288)throw Error('R724 local memory exceeds recovery limit');
 try{return JSON.parse(raw)}catch{throw Error('R724 local memory JSON damaged; evidence refused')}
};

export default function GroundedIntelligenceR724({onAddress}:{onAddress:(address:number)=>void}){
 const [question,setQuestion]=useState(''),[packet,setPacket]=useState<Packet|null>(null);
 const [exportText,setExportText]=useState(''),[error,setError]=useState(''),[status,setStatus]=useState('');
 useEffect(()=>{
  const invalidate=()=>{setPacket(null);setExportText('');setError('');setStatus('Local memory changed. Recompute grounded evidence before using it.')};
  window.addEventListener('omega-r722-memory-updated',invalidate);
  window.addEventListener('storage',invalidate);
  return()=>{window.removeEventListener('omega-r722-memory-updated',invalidate);window.removeEventListener('storage',invalidate)};
 },[]);
 const fail=(e:unknown)=>{setPacket(null);setExportText('');setStatus('');setError(e instanceof Error?e.message:'R724 evidence refused')};
 const run=async()=>{
  setPacket(null);setExportText('');setError('');setStatus('');
  try{const next=await composeGroundedIntelligenceR724(readRows(),question);setPacket(next);setStatus(next.sources.length+' verified local source(s); '+next.totalMatches+' matching snapshots.')}
  catch(e){fail(e)}
 };
 const prepare=async()=>{
  if(!packet)return;
  try{const verified=await revalidateGroundedIntelligenceR724(readRows(),packet);setExportText(JSON.stringify(verified,null,2));setError('');setStatus('Revalidated source-bound evidence packet prepared. No external action taken.')}
  catch(e){fail(e)}
 };
 const replay=async(source:Source)=>{
  if(!packet)return;
  try{
   await revalidateGroundedIntelligenceR724(readRows(),packet);
   const verified=await inspectVerifiedMemoryR723(readRows(),source.id,source.sha256,source.at);
   onAddress(verified.address);setError('');setStatus('Verified local address '+verified.address+' selected; CanonState unchanged.');
  }catch(e){fail(e)}
 };
 return <section data-r724-intelligence aria-label='Source-grounded intelligence evidence' style={{padding:12,margin:'12px 0',border:'1px solid #65727d',borderRadius:8,maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'}}>
  <h2>R724 · Source-grounded intelligence</h2>
  <p>Ask about your saved R28 memory. This executor retrieves, verifies and assembles source-cited evidence without inventing answers. It does not send local memory to a model or external service.</p>
  <form onSubmit={(e:FormEvent)=>{e.preventDefault();void run()}} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <input data-r724-question aria-label='Grounded memory question' value={question} maxLength={160} onChange={e=>setQuestion(e.target.value)} placeholder='What did I record about continuity?' style={{flex:'1 1 200px',minWidth:0}}/>
   <button data-r724-run type='submit'>Compute verified evidence</button>
  </form>
  {error&&<p data-r724-error role='alert'>REFUSED: {error}</p>}
  {status&&<p data-r724-status role='status'>{status}</p>}
  {packet&&<div data-r724-result data-r724-state={packet.status}>
   <p><b>{packet.status==='GROUNDED_LOCAL_EVIDENCE'?'Grounded local evidence':'No matching verified evidence'}</b> · {packet.verifiedCount} source digests checked · {packet.totalMatches} matching snapshots</p>
   {packet.sources.map(source=><article key={source.id} data-r724-source style={{borderTop:'1px solid #65727d',padding:'8px 0'}}>
    <b>STATE {source.stateId} · {source.decision}</b>
    <p style={{whiteSpace:'pre-wrap'}}>{source.note||'No source note was recorded for this snapshot.'}</p>
    <small>Source {source.id} · SHA-256 {source.sha256} · matched {source.matchedFields.join(', ')}</small>
    <details><summary>Inspect source metrics</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(source.metrics,null,2)}</pre></details>
    <button type='button' data-r724-replay onClick={()=>void replay(source)}>Select verified source address {source.address}</button>
   </article>)}
   <button type='button' data-r724-export onClick={()=>void prepare()}>Reverify and prepare evidence JSON</button>
   {exportText&&<label style={{display:'block',marginTop:8}}>Verified evidence JSON
    <textarea data-r724-json aria-label='Verified grounded evidence JSON' readOnly rows={5} value={exportText} style={{width:'100%',boxSizing:'border-box'}}/>
   </label>}
  </div>}
  <small data-r724-boundary>Source digests detect mutation, not authorship. A source quote is not a scientific fact or an AI-generated answer. No native execution, cross-device memory, external donor verification, provider inference, CanonState admission, deployment or autonomous action is claimed.</small>
 </section>;
}

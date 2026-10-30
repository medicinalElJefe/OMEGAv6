import {useEffect,useRef,useState} from 'react';
import {MEMORY_KEY_R722,verifyMemoryRowsR722} from '../../src/portableMemoryRecoveryR722.mjs';
import {compareVerifiedMemoryContinuityR725,revalidateMemoryContinuityR725} from '../../src/memoryContinuityR725.mjs';

type Option={id:string;at:number;note:string;stateId:number};
type Source=Option&{sha256:string;address:number;decision:string;authority:string};
type Delta={key:string;earlier:number;later:number;delta:number};
type Packet={schema:string;earlier:Source;later:Source;elapsedRecordedMs:number;
 transition:{addressDelta:number;stateIdDelta:number;decisionChanged:boolean;noteChanged:boolean};
 metricCoverage:{earlierNumeric:number;laterNumeric:number;sharedNumeric:number;compared:number;truncated:boolean};
 metricDeltas:Delta[];packetSha256:string;truthClass:string};
const readRows=()=>{
 const raw=localStorage.getItem(MEMORY_KEY_R722);
 if(raw===null)return [];
 if(new TextEncoder().encode(raw).length>524288)throw Error('R725 local memory exceeds recovery limit');
 try{return JSON.parse(raw)}catch{throw Error('R725 local memory JSON damaged; comparison refused')}
};

export default function MemoryContinuityR725({onAddress}:{onAddress:(address:number)=>void}){
 const [options,setOptions]=useState<Option[]>([]);
 const [earlier,setEarlier]=useState(''),[later,setLater]=useState('');
 const [packet,setPacket]=useState<Packet|null>(null),[exportText,setExportText]=useState('');
 const [status,setStatus]=useState(''),[error,setError]=useState('');
 const epoch=useRef(0);
 useEffect(()=>{
  let live=true;
  const refresh=()=>{
   const token=++epoch.current;
   setPacket(null);setExportText('');setEarlier('');setLater('');
   setOptions([]);setStatus('');setError('');
   void (async()=>{
    try{
     const rows=readRows();
     await verifyMemoryRowsR722(rows);
     if(live&&epoch.current===token){
      setOptions(rows.map((row:Option)=>({id:row.id,at:row.at,note:row.note,stateId:row.stateId}))
       .sort((a:Option,b:Option)=>a.at-b.at||a.id.localeCompare(b.id)));
      setStatus(rows.length+' browser-local source digests verified. Select two distinct chronological snapshots.');
     }
    }catch(e){if(live&&epoch.current===token)setError(e instanceof Error?e.message:'R725 source verification refused')}
   })();
  };
  refresh();
  window.addEventListener('omega-r722-memory-updated',refresh);
  window.addEventListener('storage',refresh);
  return()=>{live=false;++epoch.current;window.removeEventListener('omega-r722-memory-updated',refresh);window.removeEventListener('storage',refresh)};
 },[]);
 const fail=(e:unknown)=>{setPacket(null);setExportText('');setStatus('');setError(e instanceof Error?e.message:'R725 comparison refused')};
 const compare=async()=>{
  const token=++epoch.current;
  setPacket(null);setExportText('');setError('');setStatus('');
  try{
   const result=await compareVerifiedMemoryContinuityR725(readRows(),earlier,later);
   if(epoch.current!==token)return;
   setPacket(result);setStatus(result.metricCoverage.compared+' shared numeric metrics compared across two verified snapshots.');
  }catch(e){if(epoch.current===token)fail(e)}
 };
 const prepare=async()=>{
  if(!packet)return;
  const token=epoch.current;
  try{
   const fresh=await revalidateMemoryContinuityR725(readRows(),packet);
   if(epoch.current!==token)return;
   setExportText(JSON.stringify(fresh,null,2));setError('');
  }catch(e){if(epoch.current===token)fail(e)}
 };
 const replay=async(which:'earlier'|'later')=>{
  if(!packet)return;
  const token=epoch.current;
  try{
   const fresh=await revalidateMemoryContinuityR725(readRows(),packet);
   if(epoch.current!==token)return;
   onAddress(fresh[which].address);setError('');
   setStatus('Verified '+which+' source address '+fresh[which].address+' selected; CanonState unchanged.');
  }catch(e){if(epoch.current===token)fail(e)}
 };
 return <section data-r725-continuity aria-label='Verified memory continuity comparison' style={{padding:12,margin:'12px 0',border:'1px solid #65727d',borderRadius:8,maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'}}>
  <h2>R725 · Memory continuity comparison</h2>
  <p>Compare two real, digest-verified R28 observations in recorded chronological order. See address/decision transitions and numerical metric deltas, without inventing causes or measurements.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <label>Earlier source
    <select data-r725-earlier aria-label='Earlier verified source' value={earlier} onChange={e=>setEarlier(e.target.value)}>
     <option value=''>Select earlier snapshot</option>
     {options.map(o=><option key={o.id} value={o.id}>{new Date(o.at).toLocaleString()} · STATE {o.stateId} · {o.note.slice(0,48)}</option>)}
    </select>
   </label>
   <label>Later source
    <select data-r725-later aria-label='Later verified source' value={later} onChange={e=>setLater(e.target.value)}>
     <option value=''>Select later snapshot</option>
     {options.map(o=><option key={o.id} value={o.id}>{new Date(o.at).toLocaleString()} · STATE {o.stateId} · {o.note.slice(0,48)}</option>)}
    </select>
   </label>
   <button data-r725-compare type='button' onClick={()=>void compare()}>Compare verified continuity</button>
  </div>
  {error&&<p data-r725-error role='alert'>REFUSED: {error}</p>}
  {status&&<p data-r725-status role='status'>{status}</p>}
  {packet&&<div data-r725-result>
   <p>Recorded interval: {packet.elapsedRecordedMs} ms · address delta {packet.transition.addressDelta} · state delta {packet.transition.stateIdDelta}</p>
   <p>Decision changed: {String(packet.transition.decisionChanged)} · note changed: {String(packet.transition.noteChanged)}</p>
   <p data-r725-coverage>{packet.metricCoverage.compared} of {packet.metricCoverage.sharedNumeric} shared numeric metrics compared{packet.metricCoverage.truncated?' (bounded first 32; not exhaustive)':''}.</p>
   <table style={{width:'100%',maxWidth:'100%',tableLayout:'fixed',overflowWrap:'anywhere'}}>
    <thead><tr><th>Metric</th><th>Earlier</th><th>Later</th><th>Delta</th></tr></thead>
    <tbody>{packet.metricDeltas.map(m=><tr data-r725-metric key={m.key}><td>{m.key}</td><td>{m.earlier}</td><td>{m.later}</td><td>{m.delta}</td></tr>)}</tbody>
   </table>
   <p>Earlier: {packet.earlier.note||'No note'} · {packet.earlier.sha256}</p>
   <p>Later: {packet.later.note||'No note'} · {packet.later.sha256}</p>
   <button data-r725-replay-earlier type='button' onClick={()=>void replay('earlier')}>Select verified earlier address</button>
   <button data-r725-replay-later type='button' onClick={()=>void replay('later')}>Select verified later address</button>
   <button data-r725-export type='button' onClick={()=>void prepare()}>Reverify and prepare comparison JSON</button>
   {exportText&&<label style={{display:'block'}}>Verified comparison JSON
    <textarea data-r725-json aria-label='Verified memory continuity JSON' readOnly rows={5} value={exportText} style={{width:'100%',boxSizing:'border-box'}}/>
   </label>}
  </div>}
  <small data-r725-boundary>Recorded timestamps are local metadata, not physical time metrology. Deltas are arithmetic on saved values, not evidence of causation, source authorship, empirical dynamics, native execution, cross-device sync or CanonState admission. Every action rechecks source digests.</small>
 </section>;
}

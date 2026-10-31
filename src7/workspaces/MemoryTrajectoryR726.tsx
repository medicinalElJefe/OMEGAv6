import {useEffect,useMemo,useRef,useState} from 'react';
import {buildVerifiedTrajectoryExplorerR727} from '../../src/verifiedTrajectoryExplorerR727.mjs';
import {TRAJECTORY_CHECKPOINT_KEY_R729,saveTrajectoryCheckpointR729,restoreTrajectoryCheckpointR729} from '../../src/trajectoryCheckpointR729.mjs';
import {exportTrajectoryCapsuleR730,importTrajectoryCapsuleR730} from '../../src/trajectoryCapsuleR730.mjs';
import {MEMORY_KEY_R722,verifyMemoryRowsR722} from '../../src/portableMemoryRecoveryR722.mjs';
import {traceVerifiedMemoryTrajectoryR726,revalidateMemoryTrajectoryR726} from '../../src/memoryTrajectoryR726.mjs';

type Option={id:string;at:number;note:string;stateId:number};
type Source=Option&{sha256:string;address:number;decision:string};
type Edge={earlierId:string;laterId:string;elapsedRecordedMs:number;
 transition:{addressDelta:number;stateIdDelta:number;decisionChanged:boolean;noteChanged:boolean};
 metricCoverage:{compared:number;sharedNumeric:number;truncated:boolean};
 metricDeltas:{key:string;earlier:number;later:number;delta:number}[];comparisonSha256:string};
type Packet={schema:string;sources:Source[];edges:Edge[];sourceCount:number;
 elapsedRecordedMs:number;addressPath:number[];decisionChanges:number;packetSha256:string;
 truthClass:string};
const readRows=()=>{
 const raw=localStorage.getItem(MEMORY_KEY_R722);
 if(raw===null)return [];
 if(new TextEncoder().encode(raw).length>524288)throw Error('R726 local memory exceeds recovery limit');
 try{return JSON.parse(raw)}catch{throw Error('R726 local memory JSON damaged; trajectory refused')}
};

export default function MemoryTrajectoryR726({onAddress}:{onAddress:(address:number)=>void}){
 const [options,setOptions]=useState<Option[]>([]);
 const [start,setStart]=useState(''),[end,setEnd]=useState('');
 const [packet,setPacket]=useState<Packet|null>(null),[exportText,setExportText]=useState('');
 const [status,setStatus]=useState(''),[error,setError]=useState('');
 const [metricKey,setMetricKey]=useState('address'),[cursor,setCursor]=useState(0);
 const [capsuleText,setCapsuleText]=useState('');
 const [portableRows,setPortableRows]=useState<unknown[]|null>(null);
 const currentRows=()=>portableRows??readRows();
 const explorer=useMemo(()=>packet?buildVerifiedTrajectoryExplorerR727(packet,metricKey):null,[packet,metricKey]);
 const epoch=useRef(0);
 useEffect(()=>{
  let live=true;
  const refresh=()=>{
   const token=++epoch.current;
   setPacket(null);setExportText('');setStart('');setEnd('');setOptions([]);setStatus('');setError('');setMetricKey('address');setCursor(0);setPortableRows(null);setCapsuleText('');
   void (async()=>{
    try{
     const rows=readRows();
     await verifyMemoryRowsR722(rows);
     if(live&&epoch.current===token){
      setOptions(rows.map((r:Option)=>({id:r.id,at:r.at,note:r.note,stateId:r.stateId}))
       .sort((a:Option,b:Option)=>a.at-b.at||a.id.localeCompare(b.id)));
      setStatus(rows.length+' verified browser-local snapshots. Select endpoints enclosing 3–12 observations.');
     }
    }catch(e){if(live&&epoch.current===token)setError(e instanceof Error?e.message:'R726 source verification refused')}
   })();
  };
  refresh();
  window.addEventListener('omega-r722-memory-updated',refresh);
  window.addEventListener('storage',refresh);
  return()=>{live=false;++epoch.current;window.removeEventListener('omega-r722-memory-updated',refresh);window.removeEventListener('storage',refresh)};
 },[]);
 const fail=(e:unknown)=>{setPacket(null);setExportText('');setStatus('');setError(e instanceof Error?e.message:'R726 trajectory refused')};
 const trace=async()=>{
  const token=++epoch.current;
  setPacket(null);setExportText('');setStatus('');setError('');setMetricKey('address');setCursor(0);setPortableRows(null);setCapsuleText('');
  try{
   const result=await traceVerifiedMemoryTrajectoryR726(readRows(),start,end);
   if(epoch.current!==token)return;
   setPacket(result);setStatus(result.sourceCount+' independently verified observations and '+result.edges.length+' transitions.');
  }catch(e){if(epoch.current===token)fail(e)}
 };
 const reverify=async()=>{
  if(!packet)return;
  const token=epoch.current;
  try{
   const fresh=await revalidateMemoryTrajectoryR726(currentRows(),packet);
   if(epoch.current!==token)return;
   setExportText(JSON.stringify(fresh,null,2));setError('');
  }catch(e){if(epoch.current===token)fail(e)}
 };
 const saveCheckpoint=async()=>{
  if(!packet)return;
  const token=epoch.current;
  try{
   if(portableRows)throw Error('R730 imported capsule is read-only; export the capsule or use R722 memory import to persist original snapshots');
   const serialized=await saveTrajectoryCheckpointR729(readRows(),packet,packet.sources[cursor].id,metricKey);
   if(epoch.current!==token)return;
   localStorage.setItem(TRAJECTORY_CHECKPOINT_KEY_R729,serialized);
   setStatus('R729 checkpoint saved locally. Restoring requires all original verified source snapshots.');
   setError('');
  }catch(e){if(epoch.current===token)setError(e instanceof Error?e.message:'R729 checkpoint save refused')}
 };
 const restoreCheckpoint=async()=>{
  const token=++epoch.current;
  setPacket(null);setExportText('');setError('');setStatus('');
  try{
   const raw=localStorage.getItem(TRAJECTORY_CHECKPOINT_KEY_R729);
   if(raw===null)throw Error('R729 no browser-local checkpoint is saved');
   const restored=await restoreTrajectoryCheckpointR729(readRows(),raw);
   if(epoch.current!==token)return;
   setStart(restored.packet.sources[0].id);setEnd(restored.packet.sources.at(-1).id);
   setPortableRows(null);setCapsuleText('');setMetricKey(restored.metricKey);setCursor(restored.cursor);setPacket(restored.packet);
   setStatus('R729 restored '+restored.packet.sourceCount+' reverified source observations; no external or canonical memory claimed.');
  }catch(e){if(epoch.current===token)setError(e instanceof Error?e.message:'R729 checkpoint restore refused')}
 };
 const clearCheckpoint=()=>{
  try{localStorage.removeItem(TRAJECTORY_CHECKPOINT_KEY_R729);setStatus('R729 browser-local checkpoint cleared; original memory snapshots remain unchanged.');setError('')}
  catch(e){setError(e instanceof Error?e.message:'R729 checkpoint clear refused')}
 };
 const exportCapsule=async()=>{
  if(!packet)return;
  const token=epoch.current;
  try{
   const text=await exportTrajectoryCapsuleR730(currentRows(),packet,packet.sources[cursor].id,metricKey);
   if(epoch.current!==token)return;
   setCapsuleText(text);setError('');setStatus('R730 portable capsule prepared with '+packet.sourceCount+' verified snapshots. Copy this JSON to another browser; it contains the original snapshot data.');
  }catch(e){if(epoch.current===token)setError(e instanceof Error?e.message:'R730 capsule export refused')}
 };
 const importCapsule=async()=>{
  const token=++epoch.current;
  setError('');setStatus('');setPacket(null);setExportText('');setPortableRows(null);
  try{
   const restored=await importTrajectoryCapsuleR730(capsuleText);
   if(epoch.current!==token)return;
   setPortableRows(restored.rows);setStart(restored.packet.sources[0].id);setEnd(restored.packet.sources.at(-1).id);
   setMetricKey(restored.metricKey);setCursor(restored.cursor);setPacket(restored.packet);
   setStatus('R730 imported '+restored.packet.sourceCount+' independently reverified snapshots for read-only traversal. Nothing was written to browser memory.');
  }catch(e){if(epoch.current===token)setError(e instanceof Error?e.message:'R730 capsule import refused')}
 };
 const replay=async(source:Source)=>{
  if(!packet)return;
  const token=epoch.current;
  try{
   const fresh=await revalidateMemoryTrajectoryR726(currentRows(),packet);
   if(epoch.current!==token)return;
   const match=fresh.sources.find((item:Source)=>item.id===source.id&&item.sha256===source.sha256);
   if(!match)throw Error('R726 replay source identity changed');
   onAddress(match.address);setStatus('Verified trajectory address '+match.address+' selected; CanonState unchanged.');setError('');
  }catch(e){if(epoch.current===token)fail(e)}
 };
 return <section data-r726-trajectory aria-label='Verified memory trajectory' style={{padding:12,margin:'12px 0',border:'1px solid #65727d',borderRadius:8,maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'}}>
  <h2>R726 · Verified memory trajectory</h2>
  <p>Traverse 3–12 real, independently digest-verified snapshots in recorded order. Every adjacent comparison executes R725 arithmetic; no intervening observation is silently skipped.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <label>Start snapshot <select data-r726-start aria-label='Trajectory start source' value={start} onChange={e=>setStart(e.target.value)}>
    <option value=''>Select start</option>{options.map(o=><option key={o.id} value={o.id}>{new Date(o.at).toLocaleString()} · STATE {o.stateId} · {o.note.slice(0,32)}</option>)}
   </select></label>
   <label>End snapshot <select data-r726-end aria-label='Trajectory end source' value={end} onChange={e=>setEnd(e.target.value)}>
    <option value=''>Select end</option>{options.map(o=><option key={o.id} value={o.id}>{new Date(o.at).toLocaleString()} · STATE {o.stateId} · {o.note.slice(0,32)}</option>)}
   </select></label>
   <button type='button' data-r726-run onClick={()=>void trace()}>Compute verified trajectory</button>
  </div>
  <div data-r729-checkpoint style={{display:'flex',gap:8,flexWrap:'wrap',margin:'10px 0'}}>
   <button type='button' data-r729-save disabled={!packet||portableRows!==null} onClick={()=>void saveCheckpoint()}>Save verified local trajectory checkpoint</button>
   <button type='button' data-r729-restore onClick={()=>void restoreCheckpoint()}>Restore and reverify checkpoint</button>
   <button type='button' data-r729-clear onClick={clearCheckpoint}>Clear checkpoint only</button>
  </div>
  <div data-r730-exchange style={{margin:'12px 0',display:'grid',gap:8,maxWidth:700}}>
   <button type='button' data-r730-export disabled={!packet} onClick={()=>void exportCapsule()}>Prepare portable trajectory capsule with verified snapshots</button>
   <label>Portable trajectory capsule JSON (contains original local snapshot data)
    <textarea data-r730-json aria-label='Portable trajectory capsule JSON' rows={5} value={capsuleText} onChange={e=>setCapsuleText(e.target.value)} style={{width:'100%',boxSizing:'border-box'}}/>
   </label>
   <button type='button' data-r730-import disabled={!capsuleText.trim()} onClick={()=>void importCapsule()}>Import and independently verify capsule for read-only traversal</button>
   <small data-r730-boundary>Portable exchange includes the original selected snapshots and may contain personal notes. Share only intentionally. Import verifies every source and transition, does not write localStorage, authenticate authorship, synchronize devices, or change CanonState. Use R722 memory import separately for persistent recovery.</small>
  </div>
  <small data-r729-boundary>R729 saves only endpoint identities, selected observation, metric and a digest-bound trajectory fingerprint in this browser. Restore recomputes every source and transition; changed, missing or tampered source memory is refused. Use R722 portable memory export/import to move original snapshots between browsers. This is not cloud sync or authenticated authorship.</small>
  {error&&<p data-r726-error role='alert'>REFUSED: {error}</p>}
  {status&&<p data-r726-status role='status'>{status}</p>}
  {packet&&<div data-r726-result>
   <p>{packet.sourceCount} verified observations · {packet.elapsedRecordedMs} ms recorded interval · {packet.decisionChanges} decision changes</p>
   {explorer&&<div data-r727-explorer style={{padding:10,margin:'12px 0',border:'1px solid #526b75',borderRadius:8}}>
    <h3>R727 · Recorded trajectory explorer</h3>
    <p>Discrete source observations only. Lines connect adjacent recorded observations with values; missing metric values are never interpolated.</p>
    <label>Observed channel <select data-r727-metric aria-label='Observed trajectory channel' value={metricKey} onChange={e=>setMetricKey(e.target.value)}>
     {explorer.metricKeys.map(key=><option key={key} value={key}>{key==='address'?'20736-address path':key}</option>)}
    </select></label>
    <svg data-r727-chart role='img' aria-label={'Recorded '+metricKey+' trajectory, '+explorer.observedCount+' observed of '+explorer.points.length+' snapshots'} viewBox='0 0 640 220' style={{display:'block',width:'100%',maxWidth:700,height:'auto',margin:'10px 0',background:'#10212c',borderRadius:6}}>
     <path d='M32 30V190H608' fill='none' stroke='#8da0ac' strokeWidth='1.5'/>
     {explorer.segments.map(segment=><path key={segment.from+'-'+segment.to} d={'M'+segment.x1+' '+segment.y1+'L'+segment.x2+' '+segment.y2} fill='none' stroke='#72d6b1' strokeWidth='2.5'/>)}
     {explorer.points.filter(p=>p.y!==null).map(p=><circle key={p.id} cx={p.x} cy={p.y!} r={p.index===cursor?7:4} fill={p.index===cursor?'#ffe09b':'#b1ebd9'} stroke='#10212c' strokeWidth='1.5'/>)}
    </svg>
    <p data-r727-coverage>{explorer.observedCount} observed · {explorer.missingCount} missing · no interpolation · {metricKey} range {explorer.minimum} to {explorer.maximum}</p>
    <label>Recorded observation {cursor+1} of {packet.sources.length}
     <input data-r727-cursor aria-label='Recorded trajectory observation' type='range' min={0} max={packet.sources.length-1} step={1} value={cursor} onChange={e=>setCursor(Number(e.target.value))} style={{display:'block',width:'100%'}}/>
    </label>
    <output data-r727-selected style={{display:'block',overflowWrap:'anywhere'}}>STATE {packet.sources[cursor].stateId} · address {packet.sources[cursor].address} · {packet.sources[cursor].decision} · {new Date(packet.sources[cursor].at).toLocaleString()} · {packet.sources[cursor].note}</output>
    <button type='button' data-r727-replay onClick={()=>void replay(packet.sources[cursor])}>Reverify and select this recorded address</button>
   </div>}
   <ol style={{paddingLeft:22}}>
    {packet.sources.map((source,i)=><li key={source.id} data-r726-source style={{padding:'8px 0',overflowWrap:'anywhere'}}>
     <b>STATE {source.stateId} · {source.decision}</b> · address {source.address}
     <p>{source.note||'No recorded note'}</p>
     <small>SHA-256 {source.sha256} · recorded {new Date(source.at).toLocaleString()}</small>
     {i>0&&<p data-r726-edge>From previous: {packet.edges[i-1].elapsedRecordedMs} ms · address Δ {packet.edges[i-1].transition.addressDelta} · {packet.edges[i-1].metricCoverage.compared} shared numeric metrics compared{packet.edges[i-1].metricCoverage.truncated?' (bounded)':''}</p>}
     <button type='button' data-r726-replay onClick={()=>void replay(source)}>Select verified address {source.address}</button>
    </li>)}
   </ol>
   <button type='button' data-r726-export onClick={()=>void reverify()}>Reverify and prepare trajectory JSON</button>
   {exportText&&<label style={{display:'block'}}>Verified trajectory JSON
    <textarea data-r726-json aria-label='Verified trajectory JSON' readOnly rows={5} value={exportText} style={{width:'100%',boxSizing:'border-box'}}/>
   </label>}
  </div>}
  <small data-r726-boundary>SHA-256 detects local mutation, not authorship. Recorded timestamps are not physical time measurements. Observed differences do not establish causes, model memory, external provenance, native execution or CanonState admission. All sources are reverified before export or replay.</small>
 </section>;
}

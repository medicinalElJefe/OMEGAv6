import {useEffect,useRef,useState} from 'react';
import {getMandala20736Field,type Mandala20736Field} from '../../src/mandala20736Runtime';
import {R671_MODES} from './operationalModesR671.js';
import {R679_STORAGE_KEY,R679_TRUTH_BOUNDARY,R679_MAX_EVENTS,createSourceSessionR679,appendSourceExecutionR679,verifySourceSessionR679,parseSourceSessionR679,serializeSourceSessionR679} from './canonicalSessionReplayR679.js';
import {R684_MAX_BUNDLE_BYTES,R684_BOUNDARY,exportPortableSessionBundleR684,parsePortableSessionBundleR684,verifyPortableSessionBundleR684,serializePortableSessionBundleR684} from './portableSessionBundleR684.js';

type Props={address:number;onAddress:(address:number)=>void};
const STY={padding:10,border:'1px solid #4b6377',borderRadius:8};
export function CanonicalSessionReplayPanelR679({address,onAddress}:Props){
 const[open,setOpen]=useState(false),[field,setField]=useState<Mandala20736Field|null>(null);
 const[session,setSession]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const[verification,setVerification]=useState<any>(null),[status,setStatus]=useState('NOT_STARTED');
 const[family,setFamily]=useState('MODE_RUN'),[mode,setMode]=useState('TRANSPORT'),[depth,setDepth]=useState(10);
 const[channel,setChannel]=useState('C'),[operation,setOperation]=useState('P_rw'),[iterations,setIterations]=useState(12);
 const[file,setFile]=useState<HTMLInputElement|null>(null);
 const[portableFile,setPortableFile]=useState<HTMLInputElement|null>(null);
 const[portableBundle,setPortableBundle]=useState<any>(null),[portableProof,setPortableProof]=useState<any>(null);
 const isMounted=useRef(true);
 useEffect(()=>{isMounted.current=true;return()=>{isMounted.current=false}},[]);
 useEffect(()=>{if(!open||field)return;let active=true;getMandala20736Field().then(f=>{if(active)setField(f)}).catch(e=>{if(active)setError('Canonical source unavailable: '+String(e))});return()=>{active=false}},[open,field]);
 useEffect(()=>{try{const raw=localStorage.getItem(R679_STORAGE_KEY);if(raw){setSession(parseSourceSessionR679(raw));setStatus('PERSISTED_UNVERIFIED')}}catch(e){setError('Stored session needs inspection; not automatically trusted: '+String(e));setStatus('PERSISTENCE_INVALID')}},[]);
 const transact=async(fn:()=>Promise<void>)=>{
  if(busy)return;setBusy(true);setError('');
  try{await fn()}catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{if(isMounted.current)setBusy(false)}
 };
 const persist=(record:any)=>{const json=serializeSourceSessionR679(record);localStorage.setItem(R679_STORAGE_KEY,json);setSession(record)};
 const start=()=>transact(async()=>{
  if(!field)throw Error('Load the canonical source before starting');
  const result=await createSourceSessionR679(field);
  persist(result);setVerification(null);setStatus('RECORDING_LOCAL');
 });
 const action=family==='MODE_RUN'?{type:family,address,mode,depth}:family==='OPERATOR_RUN'?{type:family,address,channel,operation,iterations}:{type:'DONOR_REPLAY',effectiveUpdates:59};
 const append=()=>transact(async()=>{
  if(!field)throw Error('Canonical field is not available');
  if(!session)throw Error('Start a new source-bound session before recording');
  const next=await appendSourceExecutionR679(session,field,action);
  persist(next);setVerification(null);setStatus('RECORDED_UNVERIFIED');
 });
 const verify=()=>transact(async()=>{
  if(!field||!session)throw Error('Source field and recorded session are required');
  const result=await verifySourceSessionR679(session,field);setVerification(result);setStatus(result.valid?'LOCAL_REPLAY_VERIFIED':'LOCAL_REPLAY_HELD');
 });
 const exportEvidence=()=>{
  if(!session)return;
  try{
   const data=serializeSourceSessionR679(session);
   const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
   const anchor=document.createElement('a');anchor.href=url;anchor.download='omega-r679-local-session-'+session.createdAt.slice(0,10)+'.json';
   document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  }catch(e){setError(String(e))}
 };
 const importEvidence=(fileData:File)=>transact(async()=>{
  if(fileData.size>512*1024)throw Error('Import exceeds bounded 512KB');
  const imported=parseSourceSessionR679(await fileData.text());
  persist(imported);setVerification(null);setStatus('IMPORTED_UNVERIFIED');
 });
 const exportPortable=()=>transact(async()=>{
  if(!field||!session)throw Error('R684 requires canonical source and a recorded session');
  const bundle=await exportPortableSessionBundleR684(session,field);
  const proof=await verifyPortableSessionBundleR684(bundle,field);
  if(!proof.valid||proof.sourceMatchesLive!==true)throw Error('R684 portable evidence did not verify against current source');
  const data=serializePortableSessionBundleR684(bundle);
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  try{const link=document.createElement('a');link.href=url;link.download='omega-r684-portable-proof-'+session.createdAt.slice(0,10)+'.json';document.body.appendChild(link);link.click();link.remove()}
  finally{setTimeout(()=>URL.revokeObjectURL(url),0)}
  setPortableBundle(bundle);setPortableProof(proof);
 });
 const importPortable=(incoming:File)=>transact(async()=>{
  if(incoming.size>R684_MAX_BUNDLE_BYTES)throw Error('R684 oversized portable proof');
  const bundle=parsePortableSessionBundleR684(await incoming.text());
  // Never overwrite the live R679 session merely because an archive imported.
  // All source bytes and recorded computations must replay first.
  const proof=await verifyPortableSessionBundleR684(bundle,field);
  setPortableBundle(bundle);setPortableProof(proof);
  if(!proof.valid)throw Error('R684 imported source proof rejected: '+proof.failures.join(','));
 });
 const restorePortable=()=>transact(async()=>{
  if(!field||!portableBundle||!portableProof?.valid||portableProof.sourceMatchesLive!==true)
   throw Error('R684 archived source cannot overwrite a different active source session');
  const proof=await verifyPortableSessionBundleR684(portableBundle,field);
  if(!proof.valid||proof.sourceMatchesLive!==true)throw Error('R684 source changed since verification; restoration held');
  persist(parseSourceSessionR679(JSON.stringify(portableBundle.session)));
  setVerification(null);setStatus('PORTABLE_SOURCE_SESSION_RESTORED');
 });
 const clear=()=>{try{localStorage.removeItem(R679_STORAGE_KEY);setSession(null);setVerification(null);setStatus('NOT_STARTED');setError('')}catch(e){setError(String(e))}};
 return <section data-r679-session-ledger='true' style={{...STY,margin:'16px 0'}}>
  <header><h3 style={{margin:0}}>Canonical execution sessions · R679</h3><p>Recovered native replay law: source identity → typed execution → hash-chained receipt → deterministic re-execution. Record, inspect, save and replay actual mode and operator results. No cloud/device authority is inferred.</p></header>
  <button type='button' aria-expanded={open} onClick={()=>setOpen(x=>!x)}>{open?'Close':'Open'} source-bound session recorder</button>
  {open&&<div data-r679-session-open='true'>
   <p role='status'>Session status <b>{status}</b> · canonical address <b>{address+1}/20,736</b> · {(session?.events.length||0)}/{R679_MAX_EVENTS} events</p>
   {error&&<p role='alert'>{error}</p>}
   {!field&&!error&&<p>Loading the authoritative 20,736-state source…</p>}
   <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',marginBottom:12}}>
    <button type='button' disabled={busy||!field} onClick={start}>Start new source-bound session</button>
    <button type='button' disabled={busy||!field||!session||!session.events.length} onClick={verify}>Replay and verify entire session</button>
    <button type='button' disabled={!session} onClick={exportEvidence}>Export evidence JSON</button>
    <button type='button' disabled={busy} onClick={()=>file?.click()}>Import session JSON</button>
    <button type='button' disabled={busy||!field||!session} onClick={exportPortable}>Export full portable source + session</button>
    <button type='button' disabled={busy} onClick={()=>portableFile?.click()}>Import portable source proof</button>
    <input type='file' aria-label='Import R684 portable proof file' accept='.json,application/json' ref={setPortableFile} style={{display:'none'}} onChange={e=>{const selected=e.target.files?.[0];if(selected)void importPortable(selected);e.target.value=''}}/>
    <input type='file' aria-label='Import session JSON file' accept='.json,application/json' ref={setFile} style={{display:'none'}} onChange={e=>{const imported=e.target.files?.[0];if(imported)void importEvidence(imported);e.target.value=''}}/>
    <button type='button' disabled={busy||!session} onClick={clear}>Clear local session</button>
   </div>
   <div style={{...STY,display:'flex',flexWrap:'wrap',gap:10,alignItems:'end'}}>
    <label style={{display:'grid'}}>Execution family<select aria-label='R679 execution family' value={family} onChange={e=>setFamily(e.target.value)}><option value='MODE_RUN'>R651/R653 operational mode</option><option value='OPERATOR_RUN'>R676 historical graph operator</option><option value='DONOR_REPLAY'>R678 original donor replay</option></select></label>
    {family==='MODE_RUN'&&<><label style={{display:'grid'}}>Mode<select aria-label='R679 mode' value={mode} onChange={e=>setMode(e.target.value)}>{R671_MODES.map((m:string)=><option value={m} key={m}>{m}</option>)}</select></label><label style={{display:'grid'}}>Route depth<select aria-label='R679 route depth' value={depth} onChange={e=>setDepth(Number(e.target.value))}>{[4,8,10,16,24].map(n=><option key={n} value={n}>{n}</option>)}</select></label></>}
    {family==='OPERATOR_RUN'&&<><label style={{display:'grid'}}>Channel<select aria-label='R679 source channel' value={channel} onChange={e=>setChannel(e.target.value)}>{['C','Phi','q','Lambda','scar','evidence'].map(k=><option key={k}>{k}</option>)}</select></label><label style={{display:'grid'}}>Operation<select aria-label='R679 operator' value={operation} onChange={e=>setOperation(e.target.value)}>{['P_plus_011','P_minus_01m1','P_rw','PROPAGATE'].map(k=><option key={k}>{k}</option>)}</select></label>{operation==='PROPAGATE'&&<label style={{display:'grid'}}>Iterations<select aria-label='R679 iterations' value={iterations} onChange={e=>setIterations(Number(e.target.value))}>{[1,3,12,59,60].map(n=><option key={n}>{n}</option>)}</select></label>}</>}
    {family==='DONOR_REPLAY'&&<p>Archived source 59-update compatibility replay, all 1,728 values rechecked.</p>}
    <button type='button' disabled={busy||!field||!session||(session?.events.length||0)>=R679_MAX_EVENTS} onClick={append}>Execute and record source receipt</button>
   </div>
   {session&&<div data-r679-session-record='true' style={{marginTop:14}}>
    <p style={{overflowWrap:'anywhere'}}>Source SHA256: <code>{session.sourceSha256}</code></p>
    <p style={{overflowWrap:'anywhere'}}>Session head: <code>{session.head}</code></p>
    {session.events.length>0&&<div style={{display:'grid',gap:7}}>
     {session.events.map((e:any)=><div key={e.index} style={STY}><b>{e.index+1}. {e.family} · {e.proofAuthority}</b><p style={{margin:'4px 0'}}>{e.summary}</p><small style={{overflowWrap:'anywhere',display:'block'}}>Output hash: {e.outputHash}</small>{typeof e.action.address==='number'&&<button type='button' onClick={()=>onAddress(e.action.address)}>Return to address {e.action.address+1}</button>}</div>)}
    </div>}
    {verification&&<section data-r679-verification={verification.valid?'valid':'held'} style={{marginTop:12,...STY}}><b>{verification.valid?'Local deterministic replay verified':'Replay proof HELD'}</b><p>{verification.verifiedEvents}/{session.events.length} events re-executed; {verification.failures.length} contradictions</p>{verification.failures.map((reason:string,i:number)=><p key={i}>{reason}</p>)}</section>}
   </div>}
   {portableProof&&<section data-r684-portable-proof={portableProof.valid?'verified':'held'} style={{...STY,marginTop:12}}>
    <h4>R684 portable historical source proof</h4>
    <p><b>{portableProof.truthClass}</b> · {portableProof.verifiedEvents} computations replayed · source comparison {portableProof.sourceMatchesLive===true?'CURRENT SOURCE MATCHES':portableProof.sourceMatchesLive===false?'ARCHIVED SOURCE DIFFERS FROM CURRENT':'CURRENT SOURCE UNAVAILABLE'}</p>
    {portableProof.failures.map((reason:string,i:number)=><p role='alert' key={i}>{reason}</p>)}
    {portableBundle&&<p style={{overflowWrap:'anywhere'}}>Complete source SHA256: <code>{portableProof.sourceSha256}</code></p>}
    <button type='button' disabled={busy||!portableProof.valid||portableProof.sourceMatchesLive!==true} onClick={restorePortable}>Restore verified portable session locally</button>
    <p style={{fontSize:12}}>{R684_BOUNDARY}</p>
   </section>}
   <p style={{fontSize:12}}>{R679_TRUTH_BOUNDARY} Storage is local to this browser and site origin, not synchronized to PC/native workers or other devices. Exported records are untrusted until their source hash, output, and chain are verified again.</p>
  </div>}
 </section>;
}

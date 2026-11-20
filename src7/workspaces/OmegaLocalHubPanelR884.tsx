import {useRef,useState,type CSSProperties} from 'react';

type HubJob={id:string;operation:string;state:string;scheduled_ms:number;created_ms:number;updated_ms:number;error?:string|null;result_sha256?:string|null;result?:unknown;history?:{event:string;at_ms:number;details:string}[]};
type Json=Record<string,unknown>;
const BASE='http://127.0.0.1:8765';
const OPS=['HASH_TREE','CSV_STATS','COPY_ARTIFACT','EXPORT_MANIFEST','VERIFY_LEDGER_SPLIT','VERIFY_LEDGER_SET','RESIDUAL_RESTORE'] as const;
type Operation=typeof OPS[number];
const surface:CSSProperties={padding:16,borderRadius:12,border:'1px solid #436079',background:'#0d1d2d',color:'#eff6fc',margin:'14px 0'};
const field:CSSProperties={background:'#152f47',color:'#eaf5ff',border:'1px solid #607e98',padding:9,borderRadius:7,width:'100%',boxSizing:'border-box'};
const button:CSSProperties={padding:'8px 13px',border:'1px solid #6a9fae',borderRadius:7,background:'#1a4d59',color:'#fff',cursor:'pointer'};
async function requestHub(token:string,path:string,method:'GET'|'POST'='GET',body?:unknown):Promise<Json>{
 const controller=new AbortController();
 const timeout=window.setTimeout(()=>controller.abort(),7000);
 try{
  const response=await fetch(BASE+path,{method,headers:{'X-Omega-Local-Token':token,...(method==='POST'?{'content-type':'application/json'}:{})},
   ...(method==='POST'?{body:JSON.stringify(body||{})}:{}),signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error'});
  const text=await response.text();
  if(text.length>350000)throw Error('Response exceeds local UI bound.');
  let result:Json;
  try{result=JSON.parse(text)}catch{throw Error('Loopback service returned non-JSON data.')}
  if(!response.ok)throw Error('Loopback request rejected ('+response.status+'): '+String(result.state||'UNKNOWN'));
  return result;
 }finally{window.clearTimeout(timeout)}
}
export default function OmegaLocalHubPanelR884(){
 const [token,setToken]=useState(''),[state,setState]=useState<'UNCONNECTED'|'LOOPBACK_AUTHENTICATED'|'HELD'>('UNCONNECTED');
 const [operation,setOperation]=useState<Operation>('HASH_TREE'),[source,setSource]=useState('.'),[destination,setDestination]=useState('exports/omega-artifact.json');
 const [delay,setDelay]=useState('0'),[eventName,setEventName]=useState(''),[jobs,setJobs]=useState<HubJob[]>([]);
 const [selected,setSelected]=useState<string|null>(null),[info,setInfo]=useState('Local daemon is not connected.');
 const [busy,setBusy]=useState(false),[connectedAt,setConnectedAt]=useState<number|null>(null);
 const tokenRef=useRef<HTMLInputElement|null>(null);
 const act=async(fn:()=>Promise<void>)=>{
  if(busy)return;
  setBusy(true);
  try{await fn()}catch(error){setState('HELD');setInfo(error instanceof Error?error.message:'Local worker request failed. No native proof established.')}
  finally{setBusy(false)}
 };
 const refresh=async()=>{
  if(!token){setState('HELD');setInfo('Enter the private local token from your approved project root.');return}
  await act(async()=>{
   const [status,list]=await Promise.all([requestHub(token,'/api/hub/status'),requestHub(token,'/api/hub/jobs')]);
   if(status.schema!=='OMEGA_LOCAL_EDGE_HUB_R881'||status.physicalPcAccepted!==false)throw Error('Unexpected local schema or asserted PC acceptance.');
   setState('LOOPBACK_AUTHENTICATED');setConnectedAt(Date.now());setJobs(Array.isArray(list.jobs)?list.jobs as HubJob[]:[]);
   setInfo('Authenticated loopback response verified. This is NOT device, GPU, native execution, or federation acceptance.');
  });
 };
 const queue=async()=>{
  if(!token){setInfo('Local token is required.');return}
  await act(async()=>{
   const n=Number(delay);
   if(!Number.isFinite(n)||n<0||n>604800)throw Error('Delay must be between 0 and 604800 seconds.');
   const args:Record<string,unknown>={};
   if(operation==='HASH_TREE')args.path=source||'.';
   if(['CSV_STATS','VERIFY_LEDGER_SPLIT','VERIFY_LEDGER_SET','COPY_ARTIFACT'].includes(operation))args.source=source;
   if(operation==='COPY_ARTIFACT'||operation==='EXPORT_MANIFEST')args.destination=destination;
   if(operation==='EXPORT_MANIFEST')args.sources=source.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
   const payload:Record<string,unknown>={operation,args,scheduled_ms:Date.now()+Math.round(n*1000)};
   if(eventName.trim())payload.event_name=eventName.trim();
   const result=await requestHub(token,'/api/hub/jobs','POST',payload);
   const job=result.job as HubJob|undefined;
   if(!job?.id)throw Error('Worker did not return a persisted job ID.');
   setSelected(job.id);setInfo('Job persisted: '+job.id+' · '+job.state);
   const list=await requestHub(token,'/api/hub/jobs');setJobs(Array.isArray(list.jobs)?list.jobs as HubJob[]:[]);
  });
 };
 const action=async(name:'cancel'|'replay',jobId:string)=>{
  await act(async()=>{
   const result=await requestHub(token,'/api/hub/'+name+'/'+encodeURIComponent(jobId),'POST',{});
   setInfo(name+' returned: '+String(result.state||'UNKNOWN')+' · '+(result.ok===true?'receipt accepted':'not accepted'));
   const list=await requestHub(token,'/api/hub/jobs');setJobs(Array.isArray(list.jobs)?list.jobs as HubJob[]:[]);
  });
 };
 const emit=async()=>{
  if(!eventName.trim()){setInfo('Specify an event name before emitting it.');return}
  await act(async()=>{const r=await requestHub(token,'/api/hub/events','POST',{event_name:eventName.trim()});
   setInfo('Event '+String(r.event)+' released '+String(r.released)+' job(s).');
   const list=await requestHub(token,'/api/hub/jobs');setJobs(Array.isArray(list.jobs)?list.jobs as HubJob[]:[]);
  });
 };
 const chosen=jobs.find(x=>x.id===selected);
 return <section data-r884-local-hub='LOOPBACK_INTEGRATION_ONLY' style={surface}>
   <header><h2>Ω Local / Edge Automation Hub</h2><p>Persistent local jobs and byte receipts. Local daemon runs on your own computer, not in the browser. An authenticated loopback result is not R141 host acceptance.</p></header>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14}}>
    <div><label htmlFor='r884-token'>Private local token</label><input id='r884-token' ref={tokenRef} style={field} type='password' autoComplete='off' value={token} onChange={e=>{setToken(e.target.value);setState('UNCONNECTED')}} placeholder='Read from .omega/hub-r881.token' aria-label='Private local token'/><small>Token stays in this component’s memory and is never saved to storage.</small></div>
    <div><label>Loopback endpoint</label><div style={{...field,opacity:.9}}>{BASE}</div><small>Fixed destination. No arbitrary host or cross-device discovery.</small></div>
   </div>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'10px 0'}}><button type='button' disabled={busy} onClick={refresh} style={button}>Authenticate & refresh jobs</button><button type='button' disabled={busy} onClick={()=>{setToken('');setJobs([]);setSelected(null);setState('UNCONNECTED');setInfo('Disconnected; token cleared from UI.');tokenRef.current?.focus()}} style={button}>Clear credentials</button></div>
   <p role='status' data-r884-loopback-state={state}>{state==='LOOPBACK_AUTHENTICATED'?'LOOPBACK AUTHENTICATED — NOT PC ACCEPTED':state==='HELD'?'HELD — NO LOCAL PROOF':'NOT CONNECTED'} · {info}</p>
   {connectedAt!==null&&<small>Last source response: {new Date(connectedAt).toLocaleString()}</small>}
   <div style={{...surface,marginTop:14}}>
    <h3>Queue bounded work</h3>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
     <label>Operation<select style={field} value={operation} onChange={e=>setOperation(e.target.value as Operation)}>{OPS.map(x=><option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select></label>
     <label>{operation==='HASH_TREE'?'Project folder':operation==='EXPORT_MANIFEST'?'Source files (one per line)':'Source relative file'}<textarea style={field} rows={2} value={source} onChange={e=>setSource(e.target.value)} spellCheck={false}/></label>
     {(operation==='COPY_ARTIFACT'||operation==='EXPORT_MANIFEST')&&<label>New destination path<input style={field} value={destination} onChange={e=>setDestination(e.target.value)} spellCheck={false}/></label>}
     <label>Delay (seconds, maximum one week)<input style={field} type='number' min='0' max='604800' step='1' value={delay} onChange={e=>setDelay(e.target.value)}/></label>
     <label>Optional event gate<input style={field} value={eventName} onChange={e=>setEventName(e.target.value)} placeholder='example: new_asset'/></label>
    </div>
    <p><small>For VERIFY LEDGER SET, provide the relative path to the pinned ten-ledger manifest. All file paths are relative to the approved local project directory. Internal daemon files, parent traversal and shell execution are blocked. R195 restoration stays HELD until source authority is proven.</small></p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button type='button' style={button} disabled={busy||state!=='LOOPBACK_AUTHENTICATED'} onClick={queue}>Submit persistent job</button><button type='button' style={button} disabled={busy||state!=='LOOPBACK_AUTHENTICATED'} onClick={emit}>Release event-matched jobs</button></div>
   </div>
   <div style={{...surface,marginTop:12}}>
    <h3>Job history ({jobs.length})</h3>
    {jobs.length===0?<p>Nothing reported by the local daemon.</p>:<div style={{display:'grid',gap:6,maxHeight:260,overflowY:'auto'}}>
     {jobs.map(j=><button type='button' key={j.id} onClick={()=>setSelected(j.id)} style={{...button,textAlign:'left',background:j.id===selected?'#215363':'#142c3f'}}>
      <strong>{j.operation}</strong> · {j.state} · <code>{j.id.slice(0,12)}</code> {j.error?'· '+j.error:''}
     </button>)}
    </div>}
    {chosen&&<div style={{marginTop:10}}>
     <strong>Selected job: {chosen.id}</strong>
     <div style={{display:'flex',gap:8,margin:'8px 0'}}><button type='button' disabled={busy||!['QUEUED','WAIT_EVENT'].includes(chosen.state)} onClick={()=>action('cancel',chosen.id)} style={button}>Cancel pending</button><button type='button' disabled={busy||chosen.state!=='COMPLETED'} onClick={()=>action('replay',chosen.id)} style={button}>Verify replay</button></div>
     <details><summary>Source result / history</summary><pre style={{maxHeight:320,overflow:'auto',fontSize:12}}>{JSON.stringify(chosen,null,2)}</pre></details>
    </div>}
   </div>
   <footer><small>Authority: loopback-only R884 UI, R881 Python daemon. Separate from R125 admission, R141 host return, R146 history, R147 dispatch. No remote shell or autonomous source mutation.</small></footer>
  </section>;
}

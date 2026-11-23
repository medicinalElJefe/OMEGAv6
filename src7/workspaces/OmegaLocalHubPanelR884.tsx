import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {executeR908GpuProjection} from './omegaR908GpuProjection';

type HubJob={id:string;operation:string;state:string;scheduled_ms:number;created_ms:number;updated_ms:number;error?:string|null;result_sha256?:string|null;result?:unknown;history?:{event:string;at_ms:number;details:string}[]};
type Json=Record<string,unknown>;
const BASE='http://127.0.0.1:8765';
const OPS=['HASH_TREE','CSV_STATS','COPY_ARTIFACT','EXPORT_MANIFEST','VERIFY_LEDGER_SPLIT','VERIFY_LEDGER_SET','LOCAL_INFER','SPHERE_TENSOR_STEP','SPHERE_TENSOR_EXPORT','SPHERE_TENSOR_VERIFY','SPHERE_TENSOR_CONTINUE','SPHERE_TENSOR_RENDER','RESIDUAL_RESTORE'] as const;
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
async function fetchVerifiedSvgR909(token:string,jobId:string):Promise<Blob>{
 if(!/^[a-f0-9]{32}$/.test(jobId))throw Error('R909 requires a completed verified render job ID.');
 const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch(BASE+'/api/hub/artifacts/'+jobId,{
   method:'GET',headers:{'X-Omega-Local-Token':token},cache:'no-store',
   redirect:'error',credentials:'omit',signal:controller.signal
  });
  if(!response.ok||!response.headers.get('content-type')?.startsWith('image/svg+xml'))
   throw Error('R909 SVG download refused: '+response.status);
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength<64||bytes.byteLength>4*1024*1024)throw Error('R909 SVG artifact size held.');
  const advertised=response.headers.get('X-Omega-Artifact-Sha256');
  if(!advertised||!/^[a-f0-9]{64}$/.test(advertised))throw Error('R909 verified artifact hash missing.');
  const calculated=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
  if(calculated!==advertised)throw Error('R909 downloaded SVG bytes differ from receipt.');
  return new Blob([bytes],{type:'image/svg+xml'});
 }finally{window.clearTimeout(timeout)}
}
export default function OmegaLocalHubPanelR884(){
 const [token,setToken]=useState(''),[state,setState]=useState<'UNCONNECTED'|'LOOPBACK_AUTHENTICATED'|'HELD'>('UNCONNECTED');
 const [operation,setOperation]=useState<Operation>('HASH_TREE'),[source,setSource]=useState('.'),[destination,setDestination]=useState('exports/omega-artifact.json');
 const [delay,setDelay]=useState('0'),[eventName,setEventName]=useState(''),[jobs,setJobs]=useState<HubJob[]>([]);
 const [model,setModel]=useState(''),[prompt,setPrompt]=useState(''),[maxTokens,setMaxTokens]=useState('256');
 const [tensorCell,setTensorCell]=useState('0'),[tensorLane,setTensorLane]=useState('0'),[tensorMass,setTensorMass]=useState('4096'),[tensorSteps,setTensorSteps]=useState('4');
 const [exportJobId,setExportJobId]=useState('');
 const [installedModels,setInstalledModels]=useState<string[]>([]);
 const [selected,setSelected]=useState<string|null>(null),[info,setInfo]=useState('Local daemon is not connected.');
 const [selectedJobDetail,setSelectedJobDetail]=useState<HubJob|null>(null);
 const [busy,setBusy]=useState(false),[connectedAt,setConnectedAt]=useState<number|null>(null);
 const tokenRef=useRef<HTMLInputElement|null>(null);
 const projectionCanvasRef=useRef<HTMLCanvasElement|null>(null);
 const [gpuResult,setGpuResult]=useState<Record<string,unknown>|null>(null);
 const act=async(fn:()=>Promise<void>)=>{
  if(busy)return;
  setBusy(true);
  try{await fn()}catch(error){setState('HELD');setInfo(error instanceof Error?error.message:'Local worker request failed. No native proof established.')}
  finally{setBusy(false)}
 };
 const importLocalToken=async(file:File|undefined)=>{
  if(!file)return;
  if(file.name!=='hub-r881.token'||file.size<32||file.size>512){
   setState('HELD');setInfo('Choose only the local hub-r881.token file (32–512 bytes) from your approved root.');return;
  }
  try{
   const text=(await file.text()).trim();
   if(!/^[A-Za-z0-9_-]{32,256}$/.test(text))throw Error('Invalid local Hub token bytes');
   setToken(text);setState('UNCONNECTED');setConnectedAt(null);
   setInfo('Local token read in browser memory. Select Authenticate to connect over loopback. File was not uploaded or stored.');
  }catch{setState('HELD');setInfo('Token file read refused; no credentials retained.')}
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
 const discoverModels=async()=>{
  if(!token){setInfo('Authenticate the local Hub before listing installed models.');return;}
  await act(async()=>{
   try{
    const r=await requestHub(token,'/api/hub/models');
    if(r.schema!=='OMEGA_LOCAL_MODELS_R899'||!Array.isArray(r.models))throw Error('Unexpected local model inventory schema.');
    const names=(r.models as unknown[]).filter((n):n is string=>typeof n==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,127}$/.test(n));
    if(names.length!==r.models.length)throw Error('Invalid local model inventory.');
    setInstalledModels(names);
    if(names.length===1)setModel(names[0]);
    setInfo(names.length?'Installed local models loaded from authenticated loopback. No downloads.':'No local models installed; inference remains unavailable.');
   }catch(error){
    setInstalledModels([]);
    setInfo(error instanceof Error?error.message:'Local model service unavailable; no response fabricated.');
   }
  });
 };
 const queue=async()=>{
  if(!token){setInfo('Local token is required.');return}
  await act(async()=>{
   const n=Number(delay);
   if(!Number.isFinite(n)||n<0||n>604800)throw Error('Delay must be between 0 and 604800 seconds.');
   const args:Record<string,unknown>={};
   if(operation==='SPHERE_TENSOR_VERIFY'){
    if(!/^[a-f0-9]{32}$/.test(exportJobId))throw Error('Choose a completed tensor export job ID (32 lowercase hexadecimal characters).');
    args.export_job_id=exportJobId;
   }
   if(operation==='SPHERE_TENSOR_RENDER'){
    if(!/^[a-f0-9]{32}$/.test(exportJobId))throw Error('Select an earlier completed export or continuation checkpoint.');
    if(!destination.trim().toLowerCase().endsWith('.svg'))throw Error('Choose a new .svg file inside the approved project directory.');
    args.export_job_id=exportJobId;args.destination=destination.trim();
   }
   if(operation==='SPHERE_TENSOR_CONTINUE'){
    const steps=Number(tensorSteps);
    if(!/^[a-f0-9]{32}$/.test(exportJobId))throw Error('Select a completed tensor checkpoint job.');
    if(!Number.isInteger(steps)||steps<1||steps>8)throw Error('Continuation requires 1–8 exact integer steps.');
    if(!destination.trim().toLowerCase().endsWith('.csv'))throw Error('Choose a new .csv destination under the approved root.');
    args.export_job_id=exportJobId;args.destination=destination.trim();args.steps=steps;args.cell_axis=0;args.lane_axis=1;
   }
   if(operation==='SPHERE_TENSOR_STEP'||operation==='SPHERE_TENSOR_EXPORT'){
    const cell=Number(tensorCell),lane=Number(tensorLane),mass=Number(tensorMass),steps=Number(tensorSteps);
    if(![cell,lane,mass,steps].every(Number.isSafeInteger)||cell<0||cell>=20736||lane<0||lane>=20736||steps<0||steps>8||mass<=0||mass>1e15||mass%(4**steps)!==0)
     throw Error('R902 requires 0–20735 cell/lane, 0–8 steps and positive integer mass divisible by 4^steps.');
    args.seeds=[{cell,lane,mass}];args.steps=steps;args.cell_axis=0;args.lane_axis=1;
    if(operation==='SPHERE_TENSOR_EXPORT'){if(!destination.trim().toLowerCase().endsWith('.csv'))throw Error('Choose a new .csv destination inside the approved root.');args.destination=destination.trim();}
   }
   if(operation==='HASH_TREE')args.path=source||'.';
   if(operation==='LOCAL_INFER'){
    if(!/^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,127}$/.test(model)||!prompt.trim()||prompt.length>8192)
      throw Error('Select an installed local model and a 1–8192 character prompt.');
    const nTokens=Number(maxTokens);
    if(!Number.isInteger(nTokens)||nTokens<1||nTokens>512)throw Error('Local inference token limit is 1–512.');
    args.model=model;args.prompt=prompt;args.num_predict=nTokens;
   }
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
 const downloadSvg=async(jobId:string)=>{
  await act(async()=>{
   if(state!=='LOOPBACK_AUTHENTICATED')throw Error('Authenticate the local Hub before downloading the SVG.');
   const svg=await fetchVerifiedSvgR909(token,jobId);
   const uri=URL.createObjectURL(svg);
   try{
    const link=document.createElement('a');
    link.href=uri;link.download='omega-r907-'+jobId.slice(0,12)+'.svg';
    document.body.append(link);link.click();link.remove();
    setInfo('R909 downloaded the original fully SHA-verified SVG from authenticated Hub receipt '+jobId+'.');
   }finally{window.setTimeout(()=>URL.revokeObjectURL(uri),30000)}
  });
 };
 const loadSelectedJob=async(id:string)=>{
  setSelected(id);setSelectedJobDetail(null);setGpuResult(null);
  try{
   const result=await requestHub(token,'/api/hub/jobs/'+encodeURIComponent(id));
   const job=result.job as HubJob|undefined;
   if(job?.id===id)setSelectedJobDetail(job);
   else setInfo('Selected job detail was unavailable; history summary remains visible.');
  }catch(error){setInfo(error instanceof Error?error.message:'Could not load selected job detail.')}
 };
 const chosen=selectedJobDetail?.id===selected?selectedJobDetail:jobs.find(x=>x.id===selected);
 const tensorExport=chosen&&(chosen.operation==='SPHERE_TENSOR_EXPORT'||chosen.operation==='SPHERE_TENSOR_CONTINUE')&&chosen.state==='COMPLETED'&&chosen.result&&typeof chosen.result==='object'
  ?chosen.result as Record<string,unknown>:null;
 const tensorResult=tensorExport&&tensorExport.tensor&&typeof tensorExport.tensor==='object'
  ?tensorExport.tensor as Record<string,unknown>
  :chosen?.operation==='SPHERE_TENSOR_STEP'&&chosen.state==='COMPLETED'&&chosen.result&&typeof chosen.result==='object'
  ?chosen.result as Record<string,unknown>:null;
 const tensorPreview=Array.isArray(tensorResult?.preview)?(tensorResult.preview as {cell:number;lane:number;mass:number}[]).slice(0,32):[];
 const projectionReceipt=chosen?.operation==='SPHERE_TENSOR_RENDER'&&chosen.state==='COMPLETED'&&chosen.result&&typeof chosen.result==='object'
  ?chosen.result as Record<string,unknown>:null;
 const projectionData=projectionReceipt?.projection&&typeof projectionReceipt.projection==='object'
  ?projectionReceipt.projection as Record<string,unknown>:null;
 const projectionGrid=typeof projectionData?.projectionGrid==='string'&&projectionData.projectionGrid.length===20736
  ?projectionData.projectionGrid:null;
 useEffect(()=>{
  const canvas=projectionCanvasRef.current;
  if(!canvas||!projectionGrid)return;
  const context=canvas.getContext('2d');if(!context)return;
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const pixels=context.createImageData(144,144);
  for(let i=0;i<20736;i++){
   const n=alphabet.indexOf(projectionGrid[i]);
   if(n<0)return;
   const offset=i*4;
   const alpha=n===0?0:Math.min(255,Math.round(255*n/63));
   // Composite on the opaque #162a3b background, just as in the SVG.
   pixels.data[offset]=Math.round((22*(255-alpha)+94*alpha)/255);
   pixels.data[offset+1]=Math.round((42*(255-alpha)+218*alpha)/255);
   pixels.data[offset+2]=Math.round((59*(255-alpha)+197*alpha)/255);
   pixels.data[offset+3]=255;
  }
  context.putImageData(pixels,0,0);
 },[projectionGrid]);
 return <section data-r884-local-hub='LOOPBACK_INTEGRATION_ONLY' style={surface}>
   <header><h2>Ω Local / Edge Automation Hub</h2><p>Persistent local jobs and byte receipts. Local daemon runs on your own computer, not in the browser. An authenticated loopback result is not R141 host acceptance.</p></header>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14}}>
    <div><label htmlFor='r884-token'>Private local token</label><input id='r884-token' ref={tokenRef} style={field} type='password' autoComplete='off' value={token} onChange={e=>{setToken(e.target.value);setState('UNCONNECTED')}} placeholder='Read from .omega/hub-r881.token' aria-label='Private local token'/><small>Token stays in this component’s memory and is never saved to storage.</small><label style={{display:'block',marginTop:8}}>Load local token file<input type='file' accept='.token,.txt' aria-label='Load hub-r881.token from local computer' style={{...field,marginTop:4}} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';void importLocalToken(file)}}/></label><small>Local file chooser only. Select the private .omega/hub-r881.token file. Nothing is uploaded.</small></div>
    <div><label>Loopback endpoint</label><div style={{...field,opacity:.9}}>{BASE}</div><small>Fixed destination. No arbitrary host or cross-device discovery.</small></div>
   </div>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'10px 0'}}><button type='button' disabled={busy} onClick={refresh} style={button}>Authenticate & refresh jobs</button><button type='button' disabled={busy} onClick={()=>{setToken('');setJobs([]);setSelected(null);setState('UNCONNECTED');setInfo('Disconnected; token cleared from UI.');tokenRef.current?.focus()}} style={button}>Clear credentials</button></div>
   <p role='status' data-r884-loopback-state={state}>{state==='LOOPBACK_AUTHENTICATED'?'LOOPBACK AUTHENTICATED — NOT PC ACCEPTED':state==='HELD'?'HELD — NO LOCAL PROOF':'NOT CONNECTED'} · {info}</p>
   {connectedAt!==null&&<small>Last source response: {new Date(connectedAt).toLocaleString()}</small>}
   <div style={{...surface,marginTop:14}}>
    <h3>Queue bounded work</h3>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
     <label>Operation<select style={field} value={operation} onChange={e=>setOperation(e.target.value as Operation)}>{OPS.map(x=><option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select></label>
     {operation!=='LOCAL_INFER'&&operation!=='SPHERE_TENSOR_STEP'&&operation!=='SPHERE_TENSOR_EXPORT'&&operation!=='SPHERE_TENSOR_VERIFY'&&operation!=='SPHERE_TENSOR_CONTINUE'&&operation!=='SPHERE_TENSOR_RENDER'&&<label>{operation==='HASH_TREE'?'Project folder':operation==='EXPORT_MANIFEST'?'Source files (one per line)':'Source relative file'}<textarea style={field} rows={2} value={source} onChange={e=>setSource(e.target.value)} spellCheck={false}/></label>}
     {(operation==='SPHERE_TENSOR_VERIFY'||operation==='SPHERE_TENSOR_CONTINUE'||operation==='SPHERE_TENSOR_RENDER')&&<label>Original completed export job ID<input style={field} value={exportJobId} onChange={e=>setExportJobId(e.target.value.trim())} maxLength={32} placeholder='Select a completed export job below'/></label>}
     {operation==='SPHERE_TENSOR_CONTINUE'&&<label>Further state transitions (1–8)<input style={field} type='number' min={1} max={8} step={1} value={tensorSteps} onChange={e=>setTensorSteps(e.target.value)}/></label>}
     {(operation==='SPHERE_TENSOR_STEP'||operation==='SPHERE_TENSOR_EXPORT')&&<>
      <label>Cell address (0–20735)<input style={field} type='number' min={0} max={20735} step={1} value={tensorCell} onChange={e=>setTensorCell(e.target.value)}/></label>
      <label>Local state lane (0–20735)<input style={field} type='number' min={0} max={20735} step={1} value={tensorLane} onChange={e=>setTensorLane(e.target.value)}/></label>
      <label>Discrete mass (integer)<input style={field} type='number' min={1} step={1} value={tensorMass} onChange={e=>setTensorMass(e.target.value)}/></label>
      <label>Transition steps (0–8)<input style={field} type='number' min={0} max={8} step={1} value={tensorSteps} onChange={e=>setTensorSteps(e.target.value)}/></label>
     </>}
     {(operation==='COPY_ARTIFACT'||operation==='EXPORT_MANIFEST'||operation==='SPHERE_TENSOR_EXPORT'||operation==='SPHERE_TENSOR_CONTINUE'||operation==='SPHERE_TENSOR_RENDER')&&<label>New destination path<input style={field} value={destination} onChange={e=>setDestination(e.target.value)} spellCheck={false}/></label>}
     {operation==='LOCAL_INFER'&&<>
      <label>Installed local model name<input style={field} value={model} onChange={e=>setModel(e.target.value)} placeholder='e.g. llama3.2' maxLength={128}/>
       <button type='button' style={{...button,marginTop:6}} disabled={busy||state!=='LOOPBACK_AUTHENTICATED'} onClick={discoverModels}>Find installed local models</button>
       {installedModels.length>0&&<select aria-label='Choose installed Ollama model' style={{...field,marginTop:6}} value={installedModels.includes(model)?model:''} onChange={e=>setModel(e.target.value)}><option value=''>Choose a local model</option>{installedModels.map(name=><option key={name} value={name}>{name}</option>)}</select>}
      </label>
      <label>Local model prompt<textarea style={field} rows={4} maxLength={8192} value={prompt} onChange={e=>setPrompt(e.target.value)} spellCheck={false}/></label>
      <label>Maximum generated tokens (1–512)<input style={field} type='number' min={1} max={512} step={1} value={maxTokens} onChange={e=>setMaxTokens(e.target.value)}/></label>
     </>}
     <label>Delay (seconds, maximum one week)<input style={field} type='number' min='0' max='604800' step='1' value={delay} onChange={e=>setDelay(e.target.value)}/></label>
     <label>Optional event gate<input style={field} value={eventName} onChange={e=>setEventName(e.target.value)} placeholder='example: new_asset'/></label>
    </div>
    {(operation==='SPHERE_TENSOR_STEP'||operation==='SPHERE_TENSOR_EXPORT')&&<p><small>R902 executes a real deterministic sparse operator over 20,736 address cells × 20,736 state lanes. A per-cell 20,736D state is implicit, only nonzero components are computed. Exact integer mass conservation and the SHA-256 of every resulting nonzero component are recorded in the local job receipt. This is not 20,736 separately trained AI models or a GPU workload.</small></p>}
    {operation==='SPHERE_TENSOR_RENDER'&&<p><small>R907 creates an actual SVG projection from the verified full CSV checkpoint. Each 12^4 cell has a unique pixel in the 144×144 view, while all state lanes in that cell contribute their conserved integer mass. This is a mathematical representation, not GPU or physical-world evidence.</small></p>}
    {operation==='SPHERE_TENSOR_CONTINUE'&&<p><small>R906 rechecks the entire source checkpoint and its original durable receipt, then advances the true sparse state. Every input mass must be divisible by 4^steps to conserve integers exactly. Outputs are new CSV artifacts with source receipt and state lineage, never overwrites.</small></p>}
    {operation==='SPHERE_TENSOR_VERIFY'&&<p><small>R905 reopens an earlier complete CSV export and compares every row and both hashes against that job's original persistent SQLite receipt. It refuses changed, reordered, truncated or missing files. This is an internal byte/state integrity verification, not a signature or native device proof.</small></p>}
    {operation==='SPHERE_TENSOR_EXPORT'&&<p><small>Export all nonzero state entries to a new CSV in the approved project root. The CSV is hashed, never overwrites an existing file, and records the matching complete-state digest in the durable receipt.</small></p>}
    {operation==='LOCAL_INFER'&&<p><small>Requires an already installed and running Ollama model at 127.0.0.1:11434. OMEGA never downloads a model, chooses a remote endpoint, or fabricates output. A failed connection is HELD. Results are durable local job receipts, not independent model accuracy or GPU proof.</small></p>}
    <p><small>For VERIFY LEDGER SET, provide the relative path to the pinned ten-ledger manifest. All file paths are relative to the approved local project directory. Internal daemon files, parent traversal and shell execution are blocked. R195 restoration stays HELD until source authority is proven.</small></p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button type='button' style={button} disabled={busy||state!=='LOOPBACK_AUTHENTICATED'} onClick={queue}>Submit persistent job</button><button type='button' style={button} disabled={busy||state!=='LOOPBACK_AUTHENTICATED'} onClick={emit}>Release event-matched jobs</button></div>
   </div>
   <div style={{...surface,marginTop:12}}>
    <h3>Job history ({jobs.length})</h3>
    {jobs.length===0?<p>Nothing reported by the local daemon.</p>:<div style={{display:'grid',gap:6,maxHeight:260,overflowY:'auto'}}>
     {jobs.map(j=><button type='button' key={j.id} onClick={()=>{void loadSelectedJob(j.id)}} style={{...button,textAlign:'left',background:j.id===selected?'#215363':'#142c3f'}}>
      <strong>{j.operation}</strong> · {j.state} · <code>{j.id.slice(0,12)}</code> {j.error?'· '+j.error:''}
     </button>)}
    </div>}
    {chosen&&<div style={{marginTop:10}}>
     <strong>Selected job: {chosen.id}</strong>
     {(chosen.operation==='SPHERE_TENSOR_EXPORT'||chosen.operation==='SPHERE_TENSOR_CONTINUE')&&chosen.state==='COMPLETED'&&<button type='button' style={{...button,margin:'8px 0'}} onClick={()=>{setExportJobId(chosen.id);setOperation('SPHERE_TENSOR_VERIFY');setInfo('R905 round-trip verification configured against '+chosen.id)}}>Verify complete CSV against this export receipt</button>}
     <div style={{display:'flex',gap:8,margin:'8px 0'}}><button type='button' disabled={busy||!['QUEUED','WAIT_EVENT'].includes(chosen.state)} onClick={()=>action('cancel',chosen.id)} style={button}>Cancel pending</button><button type='button' disabled={busy||chosen.state!=='COMPLETED'} onClick={()=>action('replay',chosen.id)} style={button}>Verify replay</button></div>
     {(chosen.operation==='SPHERE_TENSOR_EXPORT'||chosen.operation==='SPHERE_TENSOR_CONTINUE')&&chosen.state==='COMPLETED'&&<button type='button' style={{...button,margin:'8px 0'}} onClick={()=>{setExportJobId(chosen.id);setOperation('SPHERE_TENSOR_CONTINUE');setDestination('exports/omega-tensor-next.csv');setInfo('R906 continuation configured from checkpoint '+chosen.id)}}>Continue this verified state into a new CSV</button>}
     {(chosen.operation==='SPHERE_TENSOR_EXPORT'||chosen.operation==='SPHERE_TENSOR_CONTINUE')&&chosen.state==='COMPLETED'&&<button type='button' style={{...button,margin:'8px 0'}} onClick={()=>{setExportJobId(chosen.id);setOperation('SPHERE_TENSOR_RENDER');setDestination('art/omega-verified-projection.svg');setInfo('R907 SVG projection configured from verified checkpoint '+chosen.id)}}>Render verified 20,736-cell state to SVG</button>}
     {chosen.operation==='SPHERE_TENSOR_RENDER'&&chosen.state==='COMPLETED'&&
      <button type='button' disabled={busy||state!=='LOOPBACK_AUTHENTICATED'} style={{...button,margin:'8px 0'}} onClick={()=>{void downloadSvg(chosen.id)}}>
       Download exact verified SVG
      </button>}
     {projectionData&&projectionData.schema==='OMEGA_SPARSE_CELL_PROJECTION_R907'&&<div style={{...surface,margin:'8px 0'}}>
      <h4>R907 verified state projection — 144 × 144 cells</h4>
      {projectionGrid&&<canvas ref={projectionCanvasRef} width={144} height={144} role='img' aria-label='Derived 20,736-cell verified state intensity preview' style={{display:'block',width:'min(100%,432px)',height:'auto',aspectRatio:'1',imageRendering:'pixelated',border:'1px solid #607e98'}}/>}
      <button type='button' style={button} disabled={!projectionGrid||busy} onClick={()=>{if(!projectionGrid)return;void act(async()=>{const result=await executeR908GpuProjection(projectionGrid);setGpuResult(result as Record<string,unknown>);setInfo('R908 browser GPU: '+String(result.state)+'; native PC pairing remains unverified.');});}}>Run real WebGPU projection parity on this device</button>
      {gpuResult&&<p><strong>R908:</strong> {String(gpuResult.state)} · Readback parity: {gpuResult.deviceExecutionProved===true?'MATCH':'NOT PROVEN'} · Source: this browser only, not native PC / Hybrid Link acceptance. {typeof gpuResult.error==='string'&&<small>{gpuResult.error}</small>}</p>}
      <p><strong>{String(projectionData.activeCells)}</strong> active cells · <strong>{String(projectionData.nonzeroComponents)}</strong> nonzero components · conserved mass <strong>{String(projectionData.totalMass)}</strong></p>
      <p><small>Source full-state SHA-256: <code style={{overflowWrap:'anywhere'}}>{String(projectionReceipt?.sourceFullStateSha256)}</code></small></p>
      <p><small>SVG artifact: <code>{String((projectionReceipt?.artifact as {path?:string}|undefined)?.path||'unavailable')}</code> · SHA-256: <code style={{overflowWrap:'anywhere'}}>{String((projectionReceipt?.artifact as {sha256?:string}|undefined)?.sha256||'unavailable')}</code></small></p>
      <p><small>Derived from verified complete state; no claims about physical simulation or GPU computation.</small></p>
     </div>}
     {tensorResult&&tensorResult.schema==='OMEGA_IMPLICIT_CELL_LANE_TENSOR_R902'&&<div style={{...surface,margin:'8px 0'}}>
      <h4>R902 nested-state execution receipt</h4>
      {tensorExport&&<p><strong>Complete CSV export:</strong> <code>{String((tensorExport.artifact as {path?:string}|undefined)?.path||'No file')}</code> · {String(tensorExport.exportedRows)} complete nonzero rows · File SHA-256: <code style={{overflowWrap:'anywhere'}}>{String((tensorExport.artifact as {sha256?:string}|undefined)?.sha256||'unavailable')}</code></p>}
      <p><strong>20,736 cells × 20,736 lanes</strong> · {String(tensorResult.activeComponents)} nonzero components · {String(tensorResult.steps)} transitions</p>
      <p>Conserved integer mass: <strong>{String(tensorResult.totalMassBefore)} → {String(tensorResult.totalMassAfter)}</strong> · {tensorResult.conservationExact===true?'EXACT MATCH':'NOT VERIFIED'}</p>
      <p><small>Full sparse-state SHA-256: <code style={{overflowWrap:'anywhere'}}>{String(tensorResult.fullStateSha256)}</code></small></p>
      <div style={{overflowX:'auto',maxHeight:220,overflowY:'auto'}}>
       <table style={{width:'100%',borderCollapse:'collapse',fontVariantNumeric:'tabular-nums'}}><thead><tr><th style={{textAlign:'left'}}>Cell</th><th style={{textAlign:'left'}}>State lane</th><th style={{textAlign:'right'}}>Mass</th></tr></thead>
        <tbody>{tensorPreview.map((entry,i)=><tr key={i}><td>{entry.cell}</td><td>{entry.lane}</td><td style={{textAlign:'right'}}>{entry.mass}</td></tr>)}</tbody>
       </table>
      </div>
      {tensorResult.previewTruncated===true&&<small>Only 32 sorted components are shown; SHA-256 covers every nonzero component.</small>}
      <p><small>Implicit sparse computation, not 20,736 trained AI models or verified GPU work.</small></p>
     </div>}
     <details><summary>Source result / history</summary><pre style={{maxHeight:320,overflow:'auto',fontSize:12}}>{JSON.stringify(chosen,null,2)}</pre></details>
    </div>}
   </div>
   <footer><small>Authority: loopback-only R884 UI, R881 Python daemon. Separate from R125 admission, R141 host return, R146 history, R147 dispatch. No remote shell or autonomous source mutation.</small></footer>
  </section>;
}

import {useRef,useState} from 'react';

type Json=Record<string,unknown>;
type Pointer={version:number;workspace:string;checkpoint:{count:number;head:string}};
type Status={schema:string;scope:string;pointer:Pointer;cells:number;channels:number[];queue:{jobs:number;statuses:Record<string,number>;queue_sha256:string;checkpoint:Pointer['checkpoint']};evidence:{nodes:number;live:number};operatorReady:boolean;executionEnabled:boolean;descendants:number[][];physicalPcAccepted:false;gpuAccepted:false;canonPromoted:false};
type Mode={id:number;name:string;category:string;binding:string;form:boolean;policy_hold:boolean;defaults:unknown;source_row_sha256:string};
type Preview={pointer:Pointer;path:number[];mode:number;inputs:Json;result:{status:string;output:unknown}};
const BASE='http://127.0.0.1:8766';
const HEX=/^[a-f0-9]{64}$/;
const SCHEMA='OMEGA_EVENT_WORKSPACE_BRIDGE_V1';
function object(x:unknown):x is Json{return !!x&&typeof x==='object'&&!Array.isArray(x)}
function count(x:unknown):x is number{return typeof x==='number'&&Number.isSafeInteger(x)&&x>=0}
function hash(x:unknown):x is string{return typeof x==='string'&&HEX.test(x)}
function pointer(x:unknown):x is Pointer{
 if(!object(x)||x.version!==1||!hash(x.workspace)||!object(x.checkpoint))return false;
 return count(x.checkpoint.count)&&hash(x.checkpoint.head);
}
function same(a:Pointer,b:Pointer){return a.version===b.version&&a.workspace===b.workspace&&a.checkpoint.count===b.checkpoint.count&&a.checkpoint.head===b.checkpoint.head}
function validPath(x:unknown):x is number[]{return Array.isArray(x)&&x.length>=1&&x.length<=8&&x.every(v=>count(v)&&v<20736)}
function parseAddresses(text:string):number[][]{
 const paths=text.split(/[,\n]/).map(x=>x.trim()).filter(Boolean);
 if(paths.length<1||paths.length>8||new Set(paths).size!==paths.length)throw Error('Enter one to eight distinct addresses.');
 return paths.map(p=>{const parts=p.split('/');if(parts.length>8||parts.some(x=>!/^(0|[1-9][0-9]{0,4})$/.test(x)||Number(x)>=20736))throw Error('Each address needs 1–8 integers in the range 0–20735.');return parts.map(Number)});
}
function checkedStatus(r:Json):Status{
 if(!pointer(r.pointer)||!count(r.cells)||r.cells<20736||!Array.isArray(r.channels)||r.channels.length!==3||!r.channels.every(count)||!Array.isArray(r.descendants)||!r.descendants.every(validPath)||!object(r.queue)||!count(r.queue.jobs)||!hash(r.queue.queue_sha256)||!object(r.queue.statuses)||!Object.values(r.queue.statuses).every(count)||!object(r.queue.checkpoint)||r.queue.checkpoint.count!==r.pointer.checkpoint.count||r.queue.checkpoint.head!==r.pointer.checkpoint.head||!object(r.evidence)||!count(r.evidence.live)||!count(r.evidence.nodes)||r.evidence.live>r.evidence.nodes||typeof r.operatorReady!=='boolean'||typeof r.executionEnabled!=='boolean')throw Error('Incomplete or inconsistent workspace audit.');
 return r as unknown as Status;
}
async function request(token:string,route:string,body?:unknown):Promise<Json>{
 const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),180000);
 try{
  const response=await fetch(BASE+route,{method:body===undefined?'GET':'POST',headers:{'X-Omega-Local-Token':token,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error'});
  const reader=response.body?.getReader();if(!reader)throw Error('Missing local response.');
  const chunks:Uint8Array[]=[];let size=0;
  try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>131072){await reader.cancel();throw Error('Local response exceeded protocol bound.')}chunks.push(part.value)}}finally{reader.releaseLock()}
  const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
  const result:unknown=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!object(result))throw Error('Unexpected local response.');
  if(!response.ok)throw Error(String(result.error||'Local request held')+' ('+response.status+')');
  if(result.schema!==SCHEMA||result.scope!=='LOCAL_OPERATIONAL_ONLY'||result.physicalPcAccepted!==false||result.gpuAccepted!==false||result.canonPromoted!==false||!pointer(result.pointer))throw Error('Unexpected or overclaimed local response.');
  return result;
 }finally{window.clearTimeout(timer)}
}
function workData(r:Json,expected?:Pointer):Json{
 if(!pointer(r.pointer)||!object(r.data)||!pointer(r.data.pointer)||!same(r.pointer,r.data.pointer)||(expected&&!same(expected,r.pointer)))throw Error('Workspace response changed or is incomplete.');
 return r.data;
}
function modes(data:Json):Mode[]{
 if(!Array.isArray(data.rows)||data.rows.length!==179)throw Error('Incomplete source catalogue.');
 const ids=new Set<number>();
 for(const r of data.rows){if(!object(r)||!count(r.id)||r.id<1||r.id>179||ids.has(r.id)||typeof r.name!=='string'||typeof r.category!=='string'||!['SCOPED_BINDING','HOLD_UNRECOVERED_EXECUTOR'].includes(String(r.binding))||typeof r.form!=='boolean'||typeof r.policy_hold!=='boolean'||!hash(r.source_row_sha256)||(r.form&&(r.binding!=='SCOPED_BINDING'||!object(r.defaults)))||(!r.form&&r.defaults!==null))throw Error('Malformed catalogue row.');ids.add(r.id)}
 return data.rows as Mode[];
}
export default function OperationalWorkspaceBridge(){
 const [token,setToken]=useState(''),[status,setStatus]=useState<Status|null>(null),[busy,setBusy]=useState(false),[addresses,setAddresses]=useState('188, 564/0/0'),[message,setMessage]=useState('Local workspace not connected.');
 const [catalogue,setCatalogue]=useState<Mode[]>([]),[mode,setMode]=useState(15),[search,setSearch]=useState(''),[input,setInput]=useState(''),[cell,setCell]=useState('188'),[receipt,setReceipt]=useState(''),[preview,setPreview]=useState<Preview|null>(null),[output,setOutput]=useState<unknown>(null);
 const [objective,setObjective]=useState<'audit'|'evolve'>('audit'),[missionPaths,setMissionPaths]=useState(''),[caps,setCaps]=useState({signal:'500',scar_sample:'1000',prune_sample:'1000'}),[mission,setMission]=useState<{kind:'audit'|'evolve';args:Json;plan:Json}|null>(null);
 const lock=useRef(false);
 const selected=catalogue.find(r=>r.id===mode);
 const clear=()=>{setStatus(null);setCatalogue([]);setPreview(null);setMission(null);setOutput(null);setInput('')};
 const act=async(fn:()=>Promise<void>,message:string)=>{
  if(lock.current||!token)return;lock.current=true;setBusy(true);setMessage(message);
  try{await fn()}catch(e){clear();setMessage((e instanceof Error?e.message:'Local request failed')+' — audit again; never blindly retry a write.')}
  finally{lock.current=false;setBusy(false)}
 };
 const audit=()=>void act(async()=>{clear();const r=await request(token,'/v1/status');setStatus(checkedStatus(r));setMessage('Authenticated local audit returned. No CanonState or host admission.')},'Auditing local workspace…');
 const pending=!!(status?.queue.statuses.QUEUED||status?.queue.statuses.PREPARED);
 const writable=!!status?.executionEnabled&&!pending&&!busy;
 const work=async(route:string,body:Json,p?:Pointer)=>workData(await request(token,'/v1/workbench/'+route,body),p);
 const one=()=>{const paths=parseAddresses(cell);if(paths.length!==1)throw Error('Select exactly one cell address.');return paths[0]};
 const select=(r:Mode|undefined)=>{setMode(r?.id??15);setInput(r?.form?JSON.stringify(r.defaults,null,2):'');setPreview(null);setOutput(null)};
 const readCatalogue=()=>void act(async()=>{if(!status)return;const rows=modes(await work('catalogue',{pointer:status.pointer},status.pointer));setCatalogue(rows);select(rows.find(r=>r.id===15&&r.form)??rows.find(r=>r.form));setMessage('Source catalogue loaded. Forms are scoped; held executors remain unavailable.')},'Reading local mode catalogue…');
 const inspect=()=>void act(async()=>{if(!status)return;setPreview(null);setOutput(await work('cell',{path:one(),pointer:status.pointer},status.pointer));setMessage('Trusted cell inspection returned.')},'Reading cell…');
 const inspectReceipt=()=>void act(async()=>{if(!status||!hash(receipt.trim()))throw Error('Enter a 64-character receipt ID.');setPreview(null);setOutput(await work('receipt',{rid:receipt.trim(),pointer:status.pointer},status.pointer));setMessage('Evidence inspection returned.')},'Reading receipt…');
 const evaluate=()=>void act(async()=>{if(!status||!selected?.form||input.length>4096)throw Error('Select an available bounded form.');const inp:unknown=JSON.parse(input);if(!object(inp))throw Error('Scenario inputs must be a JSON object.');const path=one();const r=await work('preview',{i:mode,inp,path,pointer:status.pointer},status.pointer);if(r.mode!==mode||!validPath(r.path)||r.path.join('/')!==path.join('/')||!object(r.inputs)||!object(r.result)||!['COMPUTED','HOLD'].includes(String(r.result.status)))throw Error('Unexpected preview.');setPreview(r as unknown as Preview);setOutput(r);setMessage('Preview returned. No event committed.')},'Evaluating scoped mode…');
 const commit=()=>void act(async()=>{if(!status||!writable||!preview||preview.result.status!=='COMPUTED'||!same(status.pointer,preview.pointer))throw Error('No current computed preview or execution held.');const r=await work('commit',{preview});if(r.status!=='DONE'||!pointer(r.pointer)||!hash((r.pointer as Pointer).workspace))throw Error('Commit not confirmed; audit before continuing.');clear();setOutput(r);setMessage('Scoped receipt committed. Audit to inspect the new checkpoint.')},'Committing explicitly approved preview…');
 const run=()=>void act(async()=>{if(!status||!writable||!status.operatorReady)throw Error('Execution or operator evidence held.');const result=await request(token,'/v1/roundtrip',{pointer:status.pointer,addresses:parseAddresses(addresses)});clear();setOutput(result);setMessage('Local batch '+String(result.status)+' · audit to inspect its checkpoint.')},'Executing explicitly approved local batch…');
 const missionArgs=():Json=>{
  if(objective==='audit')return {paths:missionPaths.trim()?parseAddresses(missionPaths):[]};
  const budgets:Record<string,number>={};
  for(const [k,v] of Object.entries(caps)){if(!/^(0|[1-9][0-9]{0,6})$/.test(v)||Number(v)>1000000)throw Error('Movement caps must be integer accounting units, 0–1,000,000.');budgets[k]=Number(v)}
  if(!Object.values(budgets).some(v=>v>0))throw Error('At least one positive movement cap required.');
  return {budgets};
 };
 const missionPlan=()=>void act(async()=>{
  if(!status)throw Error('Audit workspace first.');
  setMission(null);setPreview(null);
  const args=missionArgs(),kind=objective,p=await work(kind==='audit'?'mission-preview':'evolve-preview',{...args,pointer:status.pointer},status.pointer);
  if(typeof p.ready!=='boolean'||!hash(p.intent_sha256)||!pointer(p.pointer))throw Error('Invalid relational plan.');
  if(kind==='audit'&&(!count(p.task_count)||!object(p.statuses)||!object(p.expected)||!count(p.expected.count)||!hash(p.expected.head)||p.expected.count!==status.pointer.checkpoint.count+1))throw Error('Invalid audit checkpoint plan.');
  if(kind==='evolve'&&(!Array.isArray(p.expected_checkpoints)||p.expected_checkpoints.length!==2||!p.expected_checkpoints.every((x,i)=>object(x)&&count(x.count)&&x.count===status.pointer.checkpoint.count+i+1&&hash(x.head))||!object(p.selected)||!count(p.changed_cells)||!object(p.post_proof)))throw Error('Invalid evolution checkpoint plan.');
  setMission({kind,args,plan:p});setOutput(p);setMessage('Relational plan evaluated; no event written. '+(p.ready?'Ready for explicit execution.':'Held by evidence.'));
 },'Evaluating the existing relational operators…');
 const missionRun=()=>void act(async()=>{
  if(!status||!writable||!mission||mission.kind!==objective||mission.plan.ready!==true||!pointer(mission.plan.pointer)||!same(mission.plan.pointer,status.pointer)||JSON.stringify(mission.args)!==JSON.stringify(missionArgs()))throw Error('No current verified plan; evaluate again.');
  const p=mission.plan;const r=await work(mission.kind==='audit'?'mission-commit':'evolve-commit',{...mission.args,pointer:p.pointer,intent_sha256:p.intent_sha256});
  const expected=mission.kind==='audit'?p.expected:(p.expected_checkpoints as unknown[])[1];
  if(r.status!=='DONE'||!pointer(r.pointer)||!object(expected)||r.pointer.checkpoint.count!==expected.count||r.pointer.checkpoint.head!==expected.head)throw Error('Commit differs from approved checkpoint; audit and recover locally.');
  clear();setOutput(r);setMessage('Relational operation completed at event '+r.pointer.checkpoint.count+'. Audit to inspect the new state.');
 },'Executing the approved relational plan; never repeat an interrupted write automatically…');
 const displayed=catalogue.filter(r=>(r.id+' '+r.name+' '+r.category+' '+r.binding).toLowerCase().includes(search.toLowerCase())).sort((a,b)=>Number(b.form)-Number(a.form)||Number(a.policy_hold)-Number(b.policy_hold)||a.id-b.id);
 return <section aria-label='Recoverable operational workspace' style={{border:'1px solid #527286',borderRadius:10,padding:14,margin:'14px 0',minWidth:0,overflowWrap:'anywhere'}}>
  <h3>Recoverable operational workspace</h3><p>One local executor for OMEGA6, OMEGA7 and native operation. Local receipts do not admit CanonState, R141 host proof or GPU execution.</p>
  <label>Local bridge session token <input type='password' autoComplete='off' value={token} disabled={busy} onChange={e=>{setToken(e.target.value);clear()}} /></label>
  <button type='button' disabled={busy||!token} onClick={audit}>Audit workspace</button> <button type='button' disabled={busy} onClick={()=>{setToken('');clear();setMessage('Session cleared.')}}>Disconnect</button>
  {status&&<><p>Event {status.pointer.checkpoint.count} · {status.cells.toLocaleString()} materialized cells · {status.queue.jobs} persisted jobs · {status.evidence.live}/{status.evidence.nodes} live evidence records</p><p>Signal / scar sample / prune sample: {status.channels.join(' / ')}</p><details><summary>Checkpoint and workspace identity</summary><code>{status.pointer.checkpoint.head}</code><br/><code>{status.pointer.workspace}</code></details>
  <label>Cell addresses (comma separated; max 8)<input value={addresses} disabled={busy} onChange={e=>setAddresses(e.target.value)} /></label><button type='button' disabled={!writable||!status.operatorReady} onClick={run}>Run certified forward / inverse batch</button><small> {status.executionEnabled?'Local execution enabled by launcher.':'Read-only session. Enable execution locally to run.'}</small>
  <hr/><h4>Relational operations</h4><p>Compose the established field, nonlinear, inverse, sensitivity, exact solver and adaptive portfolio operators in one recoverable mission. Requires the updated local service.</p>
  <label>Relational objective<select value={objective} disabled={busy} onChange={e=>{setObjective(e.target.value as 'audit'|'evolve');setMission(null);setOutput(null)}}><option value='audit'>Audit and reconcile</option><option value='evolve'>Evolve and prove</option></select></label>
  {objective==='audit'?<label>Optional audit addresses<input value={missionPaths} placeholder='Blank = automatic representative witnesses' disabled={busy} onChange={e=>{setMissionPaths(e.target.value);setMission(null);setOutput(null)}}/></label>:<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:8}}>{(['signal','scar_sample','prune_sample'] as const).map(k=><label key={k}>{k.replaceAll('_',' ')} movement cap<input inputMode='numeric' style={{width:'100%',boxSizing:'border-box'}} value={caps[k]} disabled={busy} onChange={e=>{setCaps({...caps,[k]:e.target.value});setMission(null);setOutput(null)}}/></label>)}</div>}
  <button type='button' disabled={busy} onClick={missionPlan}>Plan and evaluate</button> <button type='button' disabled={!writable||mission?.plan.ready!==true} onClick={missionRun}>Execute verified plan</button>
  {mission&&<p>Plan ready: {String(mission.plan.ready)} · {mission.kind==='audit'?String(mission.plan.task_count)+' tasks':String(mission.plan.changed_cells)+' changed cells; transition and dependent proof'}.</p>}
  <small>Audits persist one event. Evolution persists two dependent events with exact movement caps. No physical simulation or Canon admission.</small>
  <hr/><h4>Atlas and source modes</h4><p>Requires the updated local workbench service. No cloud file upload.</p>
  <label>Exact cell address<input value={cell} disabled={busy} onChange={e=>{setCell(e.target.value);setPreview(null)}}/></label><button type='button' disabled={busy} onClick={inspect}>Inspect cell</button>
  <label>Evidence receipt ID<input value={receipt} disabled={busy} maxLength={64} onChange={e=>setReceipt(e.target.value)}/></label><button type='button' disabled={busy} onClick={inspectReceipt}>Inspect evidence</button>
  <button type='button' disabled={busy} onClick={readCatalogue}>Load source catalogue</button>
  {catalogue.length>0&&<><p>{catalogue.filter(r=>r.form).length} scoped forms · {catalogue.filter(r=>!r.form).length} held executors</p>
  <label>Search source modes<input value={search} disabled={busy} onChange={e=>setSearch(e.target.value)}/></label>
  <label>Source mode<select style={{maxWidth:'100%'}} value={displayed.some(r=>r.id===mode)?mode:''} disabled={busy} onChange={e=>select(catalogue.find(r=>r.id===Number(e.target.value)))}><option value='' disabled>Select a mode</option>{displayed.map(r=><option key={r.id} value={r.id}>{r.id} · {r.name} · {r.policy_hold?'POLICY HOLD':r.form?'FORM READY':'HELD'}</option>)}</select></label>
  <label>Scenario inputs<textarea rows={8} style={{width:'100%',boxSizing:'border-box'}} disabled={busy||!selected?.form} value={input} onChange={e=>{setInput(e.target.value);setPreview(null)}}/></label>
  <button type='button' disabled={busy||!selected?.form} onClick={evaluate}>Evaluate scenario</button> <button type='button' disabled={!writable||preview?.result.status!=='COMPUTED'} onClick={commit}>Commit scoped receipt</button>
  </>}
  </>}
  {output!==null&&<pre style={{maxHeight:350,overflow:'auto',whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(output,null,2)}</pre>}
  <p role='status'>{message}</p><small>Fixed endpoint {BASE}. Token stays in component memory. Never automatically resubmits an interrupted job.</small>
 </section>;
}

import {useState} from 'react';

type Pointer={version:number;workspace:string;checkpoint:{count:number;head:string}};
type Status={schema:string;scope:string;pointer:Pointer;cells:number;channels:number[];queue:{jobs:number;statuses:Record<string,number>;queue_sha256:string};evidence:{nodes:number;live:number};operatorReady:boolean;executionEnabled:boolean;descendants:number[][];physicalPcAccepted:false;gpuAccepted:false;canonPromoted:false};
const BASE='http://127.0.0.1:8766';
const HEX=/^[a-f0-9]{64}$/;
function pointer(x:unknown):x is Pointer{
 const p=x as Pointer|null;return !!p&&p.version===1&&HEX.test(p.workspace)&&Number.isSafeInteger(p.checkpoint?.count)&&p.checkpoint.count>=0&&HEX.test(p.checkpoint.head);
}
function parseAddresses(text:string):number[][]{
 const paths=text.split(/[,\n]/).map(x=>x.trim()).filter(Boolean);
 if(paths.length<1||paths.length>8||new Set(paths).size!==paths.length)throw Error('Enter one to eight distinct addresses.');
 return paths.map(p=>{const parts=p.split('/');if(parts.length>8||parts.some(x=>!/^(0|[1-9][0-9]{0,4})$/.test(x)||Number(x)>=20736))throw Error('Each address needs 1–8 integers in the range 0–20735.');return parts.map(Number)});
}
async function request(token:string,route:string,body?:unknown):Promise<Record<string,unknown>>{
 const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),180000);
 try{
  const response=await fetch(BASE+route,{method:body===undefined?'GET':'POST',headers:{'X-Omega-Local-Token':token,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error'});
  const raw=await response.text();if(raw.length>131072)throw Error('Local response exceeded the protocol bound.');
  const result=JSON.parse(raw) as Record<string,unknown>;
  if(!response.ok)throw Error(String(result.error||'Local request held')+' ('+response.status+')');
  if(result.schema!=='OMEGA_EVENT_WORKSPACE_BRIDGE_V1'||result.scope!=='LOCAL_OPERATIONAL_ONLY'||result.physicalPcAccepted!==false||result.gpuAccepted!==false||result.canonPromoted!==false||!pointer(result.pointer))throw Error('Unexpected or overclaimed local response.');
  return result;
 }finally{window.clearTimeout(timer)}
}
export default function OperationalWorkspaceBridge(){
 const [token,setToken]=useState(''),[status,setStatus]=useState<Status|null>(null),[busy,setBusy]=useState(false),[addresses,setAddresses]=useState('188, 564/0/0'),[message,setMessage]=useState('Local workspace not connected.');
 const perform=async(run:boolean)=>{
  if(busy||!token)return;setBusy(true);setMessage(run?'Executing explicitly approved local batch…':'Auditing local workspace…');
  try{
   if(run){if(!status?.executionEnabled||!status.operatorReady)throw Error('Execution or operator evidence held.');const result=await request(token,'/v1/roundtrip',{pointer:status.pointer,addresses:parseAddresses(addresses)});setMessage('Local batch '+String(result.status)+' · '+String(result.job)+' · refresh to inspect its checkpoint.');setStatus(null)}
   else{const r=await request(token,'/v1/status');const next=r as unknown as Status;if(!Number.isSafeInteger(next.cells)||!Array.isArray(next.channels)||next.channels.length!==3||!Array.isArray(next.descendants)||!next.queue||!next.evidence)throw Error('Incomplete local workspace audit.');setStatus(next);setMessage('Local workspace audit returned. No CanonState or host admission.');}
  }catch(e){setStatus(null);setMessage((e instanceof Error?e.message:'Local request failed')+' — refresh or recover locally before any repeat.');}finally{setBusy(false)}
 };
 return <section aria-label='Recoverable operational workspace' style={{border:'1px solid #527286',borderRadius:10,padding:14,margin:'14px 0'}}>
  <h3>Recoverable operational workspace</h3><p>Connect the deterministic local atlas and queue. This separate authenticated loopback adapter delegates to the existing executor; it does not admit CanonState, R141 host proof or GPU execution.</p>
  <label>Local bridge session token <input type='password' autoComplete='off' value={token} disabled={busy} onChange={e=>{setToken(e.target.value);setStatus(null)}} /></label>
  <button type='button' disabled={busy||!token} onClick={()=>void perform(false)}>Audit workspace</button> <button type='button' disabled={busy} onClick={()=>{setToken('');setStatus(null);setMessage('Session cleared.')}}>Disconnect</button>
  {status&&<><p>Event {status.pointer.checkpoint.count} · {status.cells.toLocaleString()} materialized cells · {status.queue.jobs} persisted jobs · {status.evidence.live}/{status.evidence.nodes} live evidence records</p><p>Signal / scar sample / prune sample: {status.channels.join(' / ')}</p><details><summary>Checkpoint and workspace identity</summary><code style={{overflowWrap:'anywhere'}}>{status.pointer.checkpoint.head}</code><br/><code style={{overflowWrap:'anywhere'}}>{status.pointer.workspace}</code></details><label>Cell addresses (comma separated; max 8)<input value={addresses} disabled={busy} onChange={e=>setAddresses(e.target.value)} /></label><button type='button' disabled={busy||!status.executionEnabled||!status.operatorReady||Boolean(status.queue.statuses.QUEUED)} onClick={()=>void perform(true)}>Run certified forward / inverse batch</button><small> {status.executionEnabled?'Local execution enabled by launcher.':'Read-only session. Enable execution locally to run.'}</small></>}
  <p role='status'>{message}</p><small>Fixed endpoint {BASE}. Token stays in component memory. Never automatically resubmits an interrupted job.</small>
 </section>;
}

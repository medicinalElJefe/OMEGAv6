import {useEffect,useMemo,useState} from 'react';
import {Activity,CheckCircle2,Cpu,GitBranch,PauseCircle,Play,RefreshCw,ShieldAlert,ShieldCheck,Square,Waypoints} from 'lucide-react';
import {api} from './platformAdapter';
import './wovenExecutionGraphR142.css';

type Device={id:string;name?:string;online?:boolean;revoked?:boolean;capabilities?:string[];capabilityRevision?:string};
type Task={id:string;label:string;state:string;dependsOn?:string[];assignedDeviceId?:string|null;jobId?:string|null;mutates?:boolean;steps?:{op:string;profile?:string}[];closureRef?:{fingerprintVerified?:boolean;headSha256?:string}};
type Graph={id:string;state:string;objective:string;projectPath:string;replicaPolicy:string;maxParallel:number;graphDigest:string;replicaInvariant?:{state?:string;workspaceSha256?:string|null;deviceCount?:number};candidateDeviceIds?:string[];admittedDeviceIds?:string[];attestations?:{deviceId:string;jobId:string;state:string;treeSha256?:string|null}[];tasks:Task[];joinReceipt?:{state?:string;worldHeadSha256?:string;verifiedTaskCount?:number;taskCount?:number}|null;hold?:{code?:string;detail?:string};canonicalMutation:false;canonicalAdmissionAuthority:'R125'};
const short=(v?:string|null,n=12)=>v?`${v.slice(0,n)}…`:'—';
const statusClass=(s?:string)=>s==='COMPLETE'?'r142-complete':s==='HELD'||s==='FAILED'?'r142-held':'r142-running';

function presetTasks(kind:string,projectPath:string,devices:Device[]){
 const d0=devices[0]?.id||'',d1=devices[1]?.id||d0,d2=devices[2]?.id||d1||d0;
 if(kind==='PARALLEL_PROOF')return[
  {id:'source-census',label:'Source census',dependsOn:[],writeSet:[],preferredDeviceId:d0,steps:[{id:'S01',op:'INDEX',label:'Index project manifests and sources',path:projectPath}]},
  {id:'tree-proof',label:'Independent source hash',dependsOn:[],writeSet:[],preferredDeviceId:d1,steps:[{id:'S01',op:'HASH_TREE',label:'Hash project tree',path:projectPath,maxResults:5000}]},
  {id:'node-validate',label:'Node build + test lane',dependsOn:['source-census','tree-proof'],writeSet:['dist','node_modules','.omega-build'],preferredDeviceId:d0,steps:[{id:'S01',op:'BUILD',label:'Build declared Node project',path:projectPath,profile:'NODE_BUILD'},{id:'S02',op:'TEST',label:'Run Node verification',path:projectPath,profile:'NODE_BUILD'}]},
  {id:'python-validate',label:'Python validation lane',dependsOn:['source-census','tree-proof'],writeSet:['build','.pytest_cache'],preferredDeviceId:d1,steps:[{id:'S01',op:'TEST',label:'Run Python verification where declared',path:projectPath,profile:'PYTHON_TEST'}]},
  {id:'support-proof',label:'Support evidence lane',dependsOn:['source-census','tree-proof'],writeSet:[],preferredDeviceId:d2,steps:[{id:'S01',op:'SUPPORT_BUNDLE',label:'Generate bounded support/evidence bundle',path:projectPath}]},
  {id:'package',label:'Verified package lane',dependsOn:['node-validate','python-validate','support-proof'],writeSet:['dist'],preferredDeviceId:d0,steps:[{id:'S01',op:'PACKAGE',label:'Package after all proof lanes close',path:projectPath}]}
 ];
 if(kind==='AUDIT_SWARM')return[
  {id:'index',label:'Index lane',dependsOn:[],writeSet:[],preferredDeviceId:d0,steps:[{id:'S01',op:'INDEX',label:'Index project',path:projectPath}]},
  {id:'hash',label:'Hash lane',dependsOn:[],writeSet:[],preferredDeviceId:d1,steps:[{id:'S01',op:'HASH_TREE',label:'Hash project',path:projectPath,maxResults:5000}]},
  {id:'audit',label:'Workbook audit lane',dependsOn:[],writeSet:[],preferredDeviceId:d2,steps:[{id:'S01',op:'WORKBOOK_AUDIT',label:'Audit workbooks if present',path:projectPath}]},
  {id:'join-proof',label:'Join support proof',dependsOn:['index','hash','audit'],writeSet:[],preferredDeviceId:d0,steps:[{id:'S01',op:'SUPPORT_BUNDLE',label:'Assemble bounded evidence bundle',path:projectPath}]}
 ];
 return[
  {id:'hash',label:'Pre-build tree proof',dependsOn:[],writeSet:[],preferredDeviceId:d0,steps:[{id:'S01',op:'HASH_TREE',label:'Hash project before build',path:projectPath,maxResults:5000}]},
  {id:'build',label:'Build',dependsOn:['hash'],writeSet:['dist','build','node_modules','.omega-build'],preferredDeviceId:d0,steps:[{id:'S01',op:'BUILD',label:'Run declared project build',path:projectPath,profile:'AUTO_BUILD'}]},
  {id:'test',label:'Test',dependsOn:['build'],writeSet:['build','.pytest_cache'],preferredDeviceId:d0,steps:[{id:'S01',op:'TEST',label:'Run declared verification',path:projectPath,profile:'AUTO_BUILD'}]},
  {id:'package',label:'Package',dependsOn:['test'],writeSet:['dist'],preferredDeviceId:d0,steps:[{id:'S01',op:'PACKAGE',label:'Package verified project',path:projectPath}]}
 ];
}

export default function WovenExecutionGraphR142(){
 const[hybrid,setHybrid]=useState<any>(null),[graphs,setGraphs]=useState<Graph[]>([]),[objective,setObjective]=useState('Build, test, prove and package this project using the strongest currently authenticated execution lanes.'),[projectPath,setProjectPath]=useState('.'),[policy,setPolicy]=useState<'SINGLE_HOST'|'HASH_MATCHED_REPLICAS'>('HASH_MATCHED_REPLICAS'),[preset,setPreset]=useState('PARALLEL_PROOF'),[maxParallel,setMaxParallel]=useState(4),[preview,setPreview]=useState<any>(null),[busy,setBusy]=useState(''),[message,setMessage]=useState('');
 const devices=useMemo<Device[]>(()=>((hybrid?.devices||[]) as Device[]).filter(x=>x.online&&!x.revoked),[hybrid]);
 const refresh=async()=>{try{const[h,g]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/hybrid/graphs').catch(()=>({data:{graphs:[]}}))]);setHybrid(h.data);setGraphs(g.data?.graphs||[]);setMessage(m=>m.startsWith('Status:')?'':m)}catch(e:any){setMessage('Status: '+(e?.message||String(e)))}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),4000);return()=>window.clearInterval(id)},[]);
 const request=()=>({objective,projectPath,replicaPolicy:policy,maxParallel,tasks:presetTasks(preset,projectPath,devices),deviceIds:devices.map(x=>x.id)});
 const previewGraph=async()=>{setBusy('preview');setMessage('');try{const r=await api.post<any>('/api/hybrid/graphs/preview',request());setPreview(r.data);setMessage(r.data?.ok?'Graph validates without executing. Review the topology, then explicitly start it.':'Graph preview is held by capability or topology validation.')}catch(e:any){setMessage(e?.message||String(e))}finally{setBusy('')}};
 const startGraph=async()=>{setBusy('start');setMessage('');try{const r=await api.post<any>('/api/hybrid/graphs',{...request(),confirmedGraph:true});setPreview(null);setMessage(`R142 graph ${r.data.graph?.id||''} created. ${policy==='HASH_MATCHED_REPLICAS'?'Every candidate PC must now return the same workspace SHA-256 before task execution can fan out.':'The selected single authenticated host may begin bounded tasks.'}`);await refresh()}catch(e:any){setMessage(e?.message||String(e))}finally{setBusy('')}};
 const control=async(id:string,action:'pause'|'resume'|'cancel')=>{setBusy(action+id);try{await api.post<any>(`/api/hybrid/graphs/${encodeURIComponent(id)}/${action}`,{});await refresh()}catch(e:any){setMessage(e?.message||String(e))}finally{setBusy('')}};
 return <section className='r142-graph' aria-label='R142 woven distributed execution graph'>
  <header><div><span>R142 · HASH-ATTESTED DISTRIBUTED EXECUTION</span><h3>Woven execution graph</h3><p>Split one approved objective into bounded dependency tasks. Multiple PCs are admitted only after they independently prove the same project tree hash; every dependency edge advances only from a verified R141 return.</p></div><button onClick={()=>void refresh()} disabled={busy==='refresh'}><RefreshCw/>Refresh</button></header>
  <div className='r142-builder'>
   <div className='r142-builder-main'><label>Objective<textarea value={objective} onChange={e=>setObjective(e.target.value)}/></label><label>Approved relative project path<input value={projectPath} onChange={e=>setProjectPath(e.target.value)} placeholder='.'/></label><div className='r142-device-strip'>{devices.length?devices.map(d=><span className='online' key={d.id}><Cpu/> {d.name||d.id} · {d.capabilityRevision||'unknown'} · {d.capabilities?.length||0} ops</span>):<span>No current authenticated PC heartbeat.</span>}</div></div>
   <div className='r142-builder-side'><label>Graph preset<select value={preset} onChange={e=>setPreset(e.target.value)}><option value='PARALLEL_PROOF'>Parallel build/proof lanes</option><option value='AUDIT_SWARM'>Read/audit swarm</option><option value='SERIAL_BUILD'>Strict serial build</option></select></label><label>Replica policy<select value={policy} onChange={e=>setPolicy(e.target.value as any)}><option value='HASH_MATCHED_REPLICAS'>Hash-matched replicas</option><option value='SINGLE_HOST'>Single host</option></select></label><label>Maximum parallel native jobs<input type='number' min={1} max={8} value={maxParallel} onChange={e=>setMaxParallel(Math.max(1,Math.min(8,Number(e.target.value)||1)))}/></label><div className='r142-builder-actions'><button onClick={()=>void previewGraph()} disabled={!!busy||!devices.length}><GitBranch/>Validate graph</button><button className='primary' onClick={()=>void startGraph()} disabled={!!busy||!devices.length}><Play/>Start confirmed graph</button></div></div>
  </div>
  {preview&&<div className='r142-preview'><b>{preview.ok?'VALID · NOTHING QUEUED':'HELD · NOTHING QUEUED'}</b><span>{preview.errors?.join(' · ')||`${preview.graphCore?.tasks?.length||0} tasks · ${preview.candidateDevices?.length||0} current candidate devices · digest ${short(preview.graphDigest,18)}`}</span></div>}
  {message&&<div className='r142-message'>{message}</div>}
  <div className='r142-list'>{graphs.length===0?<div className='r142-preview'><b>No active or historical R142 graph yet.</b><span>Validation is non-executing. Starting a graph is explicit and remains bounded by the existing Hybrid operation allow-list.</span></div>:graphs.map(graph=><article key={graph.id} className={`r142-card ${statusClass(graph.state)}`}>
   <header><div><code>{graph.id}</code><b>{graph.objective}</b></div><span>{graph.state}</span></header>
   <div className='r142-summary'><div><small>replica invariant</small><b>{graph.replicaInvariant?.state||'UNPROVED'}</b></div><div><small>workspace SHA</small><b>{short(graph.replicaInvariant?.workspaceSha256)}</b></div><div><small>admitted executors</small><b>{graph.admittedDeviceIds?.length||0} / {graph.candidateDeviceIds?.length||0}</b></div><div><small>graph digest</small><b>{short(graph.graphDigest)}</b></div></div>
   {!!graph.attestations?.length&&<div className='r142-attest'>{graph.attestations.map(a=><span key={a.deviceId}><b>{a.deviceId}</b><small>{a.state}</small><code>{short(a.treeSha256)}</code></span>)}</div>}
   <div className='r142-tasks'>{graph.tasks.map(task=><div className='r142-task' key={task.id}><header><b>{task.id} · {task.label}</b><span>{task.state}</span></header><small>{task.steps?.map(s=>s.op+(s.profile?`/${s.profile}`:'')).join(' → ')}</small><code>{task.assignedDeviceId||'executor pending'} · {task.jobId||'job pending'}</code><small>deps {task.dependsOn?.length?task.dependsOn.join(', '):'none'} · R141 proof {task.closureRef?.fingerprintVerified?'verified':'pending'}</small></div>)}</div>
   {graph.hold&&<div className='r142-message'><ShieldAlert/> {graph.hold.code}: {graph.hold.detail}</div>}
   <footer>{['RUNNING','ATTESTING'].includes(graph.state)&&<button onClick={()=>void control(graph.id,'pause')}><PauseCircle/>Pause new scheduling</button>}{graph.state==='PAUSED'&&<button onClick={()=>void control(graph.id,'resume')}><Play/>Resume</button>}{!['COMPLETE','FAILED','HELD','CANCELLED'].includes(graph.state)&&<button onClick={()=>void control(graph.id,'cancel')}><Square/>Cancel new scheduling</button>}<span className='join'>{graph.joinReceipt?<><CheckCircle2/> {graph.joinReceipt.state} · world {short(graph.joinReceipt.worldHeadSha256)}</>:<><Activity/> join pending</>}</span></footer>
  </article>)}</div>
  <div className='r142-boundary'><ShieldCheck/> R142 parallelizes only the already allow-listed Hybrid operations. Replica equality is proven from actual `HASH_TREE` returns; dependency completion requires R141 exact-payload proof; disagreement becomes an R134 scar/hold. Graph completion is evidence continuity only—R125 remains CanonState admission authority.</div>
 </section>
}

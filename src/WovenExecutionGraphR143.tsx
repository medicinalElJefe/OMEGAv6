import {useEffect,useMemo,useState} from 'react';
import {Activity,CheckCircle2,Cpu,GitBranch,PauseCircle,Play,RefreshCw,ShieldAlert,ShieldCheck,Square} from 'lucide-react';
import {api} from './platformAdapter';
import {R142_SCHEMA as R142_CAPABILITY_RECEIPT_SCHEMA} from './capabilityExecutionReceiptsR142';
import './wovenExecutionGraphR143.css';

type Device={id:string;name?:string;online?:boolean;revoked?:boolean;capabilities?:string[];capabilityRevision?:string};
type Task={id:string;label:string;state:string;dependsOn?:string[];assignedDeviceId?:string|null;jobId?:string|null;steps?:{op:string;profile?:string}[];closureRef?:{fingerprintVerified?:boolean;headSha256?:string;capabilityLifecycleRevision?:string;capabilityState?:string}};
type Graph={id:string;state:string;objective:string;projectPath:string;replicaPolicy:string;maxParallel:number;graphDigest:string;replicaInvariant?:{state?:string;workspaceSha256?:string|null;deviceCount?:number};candidateDeviceIds?:string[];admittedDeviceIds?:string[];attestations?:{deviceId:string;jobId:string;state:string;treeSha256?:string|null}[];tasks:Task[];joinReceipt?:{state?:string;worldHeadSha256?:string;verifiedTaskCount?:number;taskCount?:number;capabilityLifecycleRevision?:string}|null;hold?:{code?:string;detail?:string};canonicalMutation:false;canonicalAdmissionAuthority:'R125'};
const short=(v?:string|null,n=12)=>v?`${v.slice(0,n)}…`:'—';
const cls=(s?:string)=>s==='COMPLETE'?'r143-complete':s==='HELD'||s==='FAILED'?'r143-held':'r143-running';

function presetTasks(kind:string,path:string,devices:Device[]){
 const a=devices[0]?.id||'',b=devices[1]?.id||a,c=devices[2]?.id||b||a;
 if(kind==='PARALLEL_PROOF')return[
  {id:'source-census',label:'Source census',dependsOn:[],writeSet:[],preferredDeviceId:a,steps:[{id:'S01',op:'INDEX',label:'Index project manifests and sources',path}]},
  {id:'tree-proof',label:'Independent source hash',dependsOn:[],writeSet:[],preferredDeviceId:b,steps:[{id:'S01',op:'HASH_TREE',label:'Hash project tree',path,maxResults:5000}]},
  {id:'node-validate',label:'Node build + test lane',dependsOn:['source-census','tree-proof'],writeSet:['dist','node_modules','.omega-build'],preferredDeviceId:a,steps:[{id:'S01',op:'BUILD',label:'Build declared Node project',path,profile:'NODE_BUILD'},{id:'S02',op:'TEST',label:'Run Node verification',path,profile:'NODE_BUILD'}]},
  {id:'python-validate',label:'Python validation lane',dependsOn:['source-census','tree-proof'],writeSet:['build','.pytest_cache'],preferredDeviceId:b,steps:[{id:'S01',op:'TEST',label:'Run Python verification where declared',path,profile:'PYTHON_TEST'}]},
  {id:'support-proof',label:'Support evidence lane',dependsOn:['source-census','tree-proof'],writeSet:[],preferredDeviceId:c,steps:[{id:'S01',op:'SUPPORT_BUNDLE',label:'Generate bounded support/evidence bundle',path}]},
  {id:'package',label:'Verified package lane',dependsOn:['node-validate','python-validate','support-proof'],writeSet:['dist'],preferredDeviceId:a,steps:[{id:'S01',op:'PACKAGE',label:'Package after all proof lanes close',path}]}
 ];
 if(kind==='AUDIT_SWARM')return[
  {id:'index',label:'Index lane',dependsOn:[],writeSet:[],preferredDeviceId:a,steps:[{id:'S01',op:'INDEX',label:'Index project',path}]},
  {id:'hash',label:'Hash lane',dependsOn:[],writeSet:[],preferredDeviceId:b,steps:[{id:'S01',op:'HASH_TREE',label:'Hash project',path,maxResults:5000}]},
  {id:'audit',label:'Workbook audit lane',dependsOn:[],writeSet:[],preferredDeviceId:c,steps:[{id:'S01',op:'WORKBOOK_AUDIT',label:'Audit workbooks if present',path}]},
  {id:'join-proof',label:'Join support proof',dependsOn:['index','hash','audit'],writeSet:[],preferredDeviceId:a,steps:[{id:'S01',op:'SUPPORT_BUNDLE',label:'Assemble bounded evidence bundle',path}]}
 ];
 return[
  {id:'hash',label:'Pre-build tree proof',dependsOn:[],writeSet:[],preferredDeviceId:a,steps:[{id:'S01',op:'HASH_TREE',label:'Hash project before build',path,maxResults:5000}]},
  {id:'build',label:'Build',dependsOn:['hash'],writeSet:['dist','build','node_modules','.omega-build'],preferredDeviceId:a,steps:[{id:'S01',op:'BUILD',label:'Run declared project build',path,profile:'AUTO_BUILD'}]},
  {id:'test',label:'Test',dependsOn:['build'],writeSet:['build','.pytest_cache'],preferredDeviceId:a,steps:[{id:'S01',op:'TEST',label:'Run declared verification',path,profile:'AUTO_BUILD'}]},
  {id:'package',label:'Package',dependsOn:['test'],writeSet:['dist'],preferredDeviceId:a,steps:[{id:'S01',op:'PACKAGE',label:'Package verified project',path}]}
 ];
}

export default function WovenExecutionGraphR143(){
 const[hybrid,setHybrid]=useState<any>(null),[graphs,setGraphs]=useState<Graph[]>([]),[objective,setObjective]=useState('Build, test, prove and package this project using the strongest currently authenticated execution lanes.'),[projectPath,setProjectPath]=useState('.'),[policy,setPolicy]=useState<'SINGLE_HOST'|'HASH_MATCHED_REPLICAS'>('HASH_MATCHED_REPLICAS'),[preset,setPreset]=useState('PARALLEL_PROOF'),[maxParallel,setMaxParallel]=useState(4),[preview,setPreview]=useState<any>(null),[busy,setBusy]=useState(''),[message,setMessage]=useState('');
 const devices=useMemo<Device[]>(()=>((hybrid?.devices||[]) as Device[]).filter(x=>x.online&&!x.revoked),[hybrid]);
 const refresh=async()=>{try{const[h,g]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/hybrid/graphs').catch(()=>({data:{graphs:[]}}))]);setHybrid(h.data);setGraphs(g.data?.graphs||[]);setMessage(m=>m.startsWith('Status:')?'':m)}catch(e:any){setMessage('Status: '+(e?.message||String(e)))}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),4000);return()=>window.clearInterval(id)},[]);
 const payload=()=>({objective,projectPath,replicaPolicy:policy,maxParallel,tasks:presetTasks(preset,projectPath,devices),deviceIds:devices.map(x=>x.id)});
 const validate=async()=>{setBusy('preview');setMessage('');try{const r=await api.post<any>('/api/hybrid/graphs/preview',payload());setPreview(r.data);setMessage(r.data?.ok?'Graph validates without executing. Review topology and executor eligibility, then explicitly start it.':'Graph preview is held by capability, topology or safety validation.')}catch(e:any){setMessage(e?.message||String(e))}finally{setBusy('')}};
 const start=async()=>{setBusy('start');setMessage('');try{const r=await api.post<any>('/api/hybrid/graphs',{...payload(),confirmedGraph:true});setPreview(null);setMessage(`R143 graph ${r.data.graph?.id||''} created. ${policy==='HASH_MATCHED_REPLICAS'?'Every candidate PC must return the same workspace SHA-256 before task fan-out.':'The selected authenticated host may begin bounded tasks.'}`);await refresh()}catch(e:any){setMessage(e?.message||String(e))}finally{setBusy('')}};
 const control=async(id:string,action:'pause'|'resume'|'cancel')=>{setBusy(action+id);try{await api.post<any>(`/api/hybrid/graphs/${encodeURIComponent(id)}/${action}`,{});await refresh()}catch(e:any){setMessage(e?.message||String(e))}finally{setBusy('')}};
 return <section className='r143-graph' aria-label='R143 proof-aware woven distributed execution graph'>
  <header><div><span>R143 · HASH-ATTESTED · R142 LIFECYCLE-AWARE DISTRIBUTED EXECUTION</span><h3>Woven execution graph</h3><p>Split one approved objective into dependency-bound native tasks. Multiple PCs are admitted only after independent project-tree hashes agree; every returned edge must close through R141 exact proof and is then recorded as R142 capability lifecycle VERIFIED before it can unlock downstream work.</p></div><button onClick={()=>void refresh()}><RefreshCw/>Refresh</button></header>
  <div className='r143-builder'>
   <div className='r143-builder-main'><label>Objective<textarea value={objective} onChange={e=>setObjective(e.target.value)}/></label><label>Approved relative project path<input value={projectPath} onChange={e=>setProjectPath(e.target.value)} placeholder='.'/></label><div className='r143-device-strip'>{devices.length?devices.map(d=><span className='online' key={d.id}><Cpu/> {d.name||d.id} · {d.capabilityRevision||'unknown'} · {d.capabilities?.length||0} ops</span>):<span>No current authenticated PC heartbeat.</span>}</div></div>
   <div className='r143-builder-side'><label>Graph preset<select value={preset} onChange={e=>setPreset(e.target.value)}><option value='PARALLEL_PROOF'>Parallel build/proof lanes</option><option value='AUDIT_SWARM'>Read/audit swarm</option><option value='SERIAL_BUILD'>Strict serial build</option></select></label><label>Replica policy<select value={policy} onChange={e=>setPolicy(e.target.value as any)}><option value='HASH_MATCHED_REPLICAS'>Hash-matched replicas</option><option value='SINGLE_HOST'>Single host</option></select></label><label>Maximum parallel native jobs<input type='number' min={1} max={8} value={maxParallel} onChange={e=>setMaxParallel(Math.max(1,Math.min(8,Number(e.target.value)||1)))}/></label><div className='r143-builder-actions'><button onClick={()=>void validate()} disabled={!!busy||!devices.length}><GitBranch/>Validate graph</button><button className='primary' onClick={()=>void start()} disabled={!!busy||!devices.length}><Play/>Start confirmed graph</button></div><div className='r143-lifecycle'><ShieldCheck/><span>Capability receipt law</span><b>{R142_CAPABILITY_RECEIPT_SCHEMA}</b></div></div>
  </div>
  {preview&&<div className='r143-preview'><b>{preview.ok?'VALID · NOTHING QUEUED':'HELD · NOTHING QUEUED'}</b><span>{preview.errors?.join(' · ')||`${preview.graphCore?.tasks?.length||0} tasks · ${preview.candidateDevices?.length||0} current candidate devices · digest ${short(preview.graphDigest,18)}`}</span></div>}
  {message&&<div className='r143-message'>{message}</div>}
  <div className='r143-list'>{graphs.length===0?<div className='r143-preview'><b>No active or historical R143 graph yet.</b><span>Validation is non-executing. Starting a graph is explicit and remains bounded by the existing Hybrid operation allow-list.</span></div>:graphs.map(g=><article key={g.id} className={`r143-card ${cls(g.state)}`}>
   <header><div><code>{g.id}</code><b>{g.objective}</b></div><span>{g.state}</span></header>
   <div className='r143-summary'><div><small>replica invariant</small><b>{g.replicaInvariant?.state||'UNPROVED'}</b></div><div><small>workspace SHA</small><b>{short(g.replicaInvariant?.workspaceSha256)}</b></div><div><small>admitted executors</small><b>{g.admittedDeviceIds?.length||0} / {g.candidateDeviceIds?.length||0}</b></div><div><small>graph digest</small><b>{short(g.graphDigest)}</b></div></div>
   {!!g.attestations?.length&&<div className='r143-attest'>{g.attestations.map(a=><span key={a.deviceId}><b>{a.deviceId}</b><small>{a.state}</small><code>{short(a.treeSha256)}</code></span>)}</div>}
   <div className='r143-tasks'>{g.tasks.map(t=><div className='r143-task' key={t.id}><header><b>{t.id} · {t.label}</b><span>{t.state}</span></header><small>{t.steps?.map(s=>s.op+(s.profile?`/${s.profile}`:'')).join(' → ')}</small><code>{t.assignedDeviceId||'executor pending'} · {t.jobId||'job pending'}</code><small>deps {t.dependsOn?.length?t.dependsOn.join(', '):'none'} · R141 exact proof {t.closureRef?.fingerprintVerified?'verified':'pending'} · R142 lifecycle {t.closureRef?.capabilityState||'pending'}</small></div>)}</div>
   {g.hold&&<div className='r143-message'><ShieldAlert/> {g.hold.code}: {g.hold.detail}</div>}
   <footer>{['RUNNING','ATTESTING'].includes(g.state)&&<button onClick={()=>void control(g.id,'pause')}><PauseCircle/>Pause new scheduling</button>}{g.state==='PAUSED'&&<button onClick={()=>void control(g.id,'resume')}><Play/>Resume</button>}{!['COMPLETE','FAILED','HELD','CANCELLED'].includes(g.state)&&<button onClick={()=>void control(g.id,'cancel')}><Square/>Cancel new scheduling</button>}<span className='join'>{g.joinReceipt?<><CheckCircle2/> {g.joinReceipt.state} · world {short(g.joinReceipt.worldHeadSha256)} · lifecycle {g.joinReceipt.capabilityLifecycleRevision||'R142'}</>:<><Activity/> join pending</>}</span></footer>
  </article>)}</div>
  <div className='r143-boundary'><ShieldCheck/> R143 executes only existing allow-listed Hybrid operations. Replica equality comes from actual `HASH_TREE` returns; dependencies require R141 exact-payload proof and R142 VERIFIED lifecycle state; disagreement or lack of a lawful executor becomes an R134 scar/hold. Graph completion remains evidence continuity—R125 alone admits CanonState.</div>
 </section>
}

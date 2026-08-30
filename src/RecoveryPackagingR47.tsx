import {useMemo,useState} from 'react';
import {ArchiveRestore,Download,FileCheck2,PackageCheck,ShieldCheck,Trash2,Upload} from 'lucide-react';
import {localState} from './platformAdapter';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import './extremeRestorationR46.css';

type PatchOp='ADD'|'REPLACE'|'REMOVE';
type PatchEntry={id:string;target:string;operation:PatchOp;sha256?:string;size?:number;sourceName?:string;createdAt:string};
const KEY='omega.r47.patch.plan';
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
const safeTarget=(x:string)=>x.replace(/\\/g,'/').replace(/^\/+/, '').split('/').filter(p=>p&&p!=='.'&&p!=='..').join('/').slice(0,240);
const save=(name:string,x:any)=>{const u=URL.createObjectURL(new Blob([JSON.stringify(x,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),500)};
function omegaLocalSnapshot(){const out:Record<string,string>={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('omega.'))out[k]=localStorage.getItem(k)||''}return out}
export default function RecoveryPackagingR47({record,address}:{record:any;address:number}){
 const[rows,setRows]=useState<PatchEntry[]>(()=>localState.read(KEY,[])),[target,setTarget]=useState('runtime/asset.bin'),[operation,setOperation]=useState<PatchOp>('REPLACE'),[message,setMessage]=useState('');
 const persist=(next:PatchEntry[])=>{setRows(next);localState.write(KEY,next)};
 const addFile=async(file:File)=>{const clean=safeTarget(target||file.name);if(!clean){setMessage('A safe package-relative target is required.');return}const b=await file.arrayBuffer(),sha256=hex(await crypto.subtle.digest('SHA-256',b));const entry:PatchEntry={id:`${operation}:${clean}:${sha256.slice(0,12)}`,target:clean,operation,sha256,size:file.size,sourceName:file.name,createdAt:new Date().toISOString()};persist([entry,...rows.filter(x=>x.target!==clean)].slice(0,100));setMessage(`${operation} ${clean} staged by SHA-256. Nothing was installed or patched.`)};
 const addRemove=()=>{const clean=safeTarget(target);if(!clean){setMessage('A safe package-relative target is required.');return}const entry:PatchEntry={id:`REMOVE:${clean}`,target:clean,operation:'REMOVE',createdAt:new Date().toISOString()};persist([entry,...rows.filter(x=>x.target!==clean)].slice(0,100));setMessage(`REMOVE ${clean} staged. Nothing was deleted.`)};
 const collisions=useMemo(()=>rows.filter((x,i,a)=>a.findIndex(y=>y.target===x.target)!==i),[rows]);
 const packageManifest={schema:'OMEGA_RECOVERY_PACKAGE_R47',createdAt:new Date().toISOString(),hostedBuild:RUNTIME_IDENTITY.hostedBuild,address,stateId:record?.stateId,decision:record?.metrics?.decision,entries:rows,checks:{uniqueTargets:collisions.length===0,entryCount:rows.length,hashBound:rows.filter(x=>x.operation!=='REMOVE').every(x=>Boolean(x.sha256))},authority:'Manifest/patch planning only. Browser runtime cannot mutate the deployed Worker, install Windows software, or bypass B015/CI/Hybrid proof.'};
 const exportRecovery=()=>save(`OMEGA_BROWSER_RECOVERY_STATE_${address+1}.json`,{schema:'OMEGA_BROWSER_RECOVERY_R47',createdAt:new Date().toISOString(),address,stateId:record?.stateId,storage:omegaLocalSnapshot(),boundary:'Browser-local OMEGA continuity snapshot only; it is not a PC filesystem backup or native release authority.'});
 return <section className='r47-recovery-packaging'>
  <header><div><span>S11 + S20 + S23 · PATCH / RECOVERY / PACKAGING</span><h3>Recovery & Package Control</h3></div><ShieldCheck/></header>
  <div className='r47-package-grid'><section><label>Operation<select value={operation} onChange={e=>setOperation(e.target.value as PatchOp)}><option>ADD</option><option>REPLACE</option><option>REMOVE</option></select></label><label>Package-relative target<input value={target} onChange={e=>setTarget(e.target.value)} placeholder='runtime/file.json'/></label>{operation==='REMOVE'?<button className='primary-action' onClick={addRemove}><Trash2/>Stage remove</button>:<label className='r47-file-button'><Upload/>Hash + stage file<input type='file' onChange={e=>{const f=e.target.files?.[0];if(f)void addFile(f);e.currentTarget.value=''}}/></label>}<small>{message}</small></section><section className='r47-package-actions'><button onClick={()=>save(`OMEGA_PATCH_MANIFEST_STATE_${address+1}.json`,packageManifest)}><PackageCheck/>Export patch manifest</button><button onClick={exportRecovery}><ArchiveRestore/>Export browser recovery</button><div><FileCheck2/><span><b>{rows.length} staged entries</b><small>{collisions.length?'CHECK duplicate targets':'unique targets · hashed payloads'}</small></span></div></section></div>
  <div className='r47-patch-list'>{rows.map(x=><article key={x.id}><code>{x.operation}</code><div><b>{x.target}</b><small>{x.sourceName||'no payload'}{x.size?` · ${x.size.toLocaleString()} bytes`:''}</small>{x.sha256&&<span>{x.sha256}</span>}</div><button aria-label={`Remove ${x.target} from plan`} onClick={()=>persist(rows.filter(r=>r.id!==x.id))}><Trash2/></button></article>)}</div>
  <footer><ShieldCheck/>Checksums, manifests, recovery snapshots and patch plans are executable here. Actual Worker mutation remains CI/deploy authority; Windows install/repair/patch remains DEVICE_PROOF_REQUIRED through the paired sovereign host.</footer>
 </section>;
}

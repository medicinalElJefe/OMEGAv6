import {useMemo,useState} from 'react';
import {ArchiveRestore,Download,FileArchive,ShieldCheck,Trash2,Upload} from 'lucide-react';
import {ARCHIVE_DONORS,recommendedDisposition,type ArchiveDisposition} from './archiveGovernanceRuntime';
import {localState} from './platformAdapter';
import './completionR48.css';

type QueueRow={id:string;at:number;name:string;size:number;sha256:string;matchedDonor?:string;action:ArchiveDisposition;status:'FINGERPRINTED'|'QUEUED'|'QUARANTINED';note:string};
const KEY='omega.r48.archive.recovery.queue';
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
function exportJson(name:string,data:any){const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),500)}
function findDonor(name:string){const n=name.toLowerCase().replace(/[^a-z0-9]+/g,' ');return ARCHIVE_DONORS.find(d=>{const p=d.name.toLowerCase().replace(/[^a-z0-9]+/g,' ');return p.split(' ').filter(x=>x.length>5).some(x=>n.includes(x))})}

export default function ArchiveRecoveryQueueR48(){
 const[rows,setRows]=useState<QueueRow[]>(()=>localState.read(KEY,[])),[note,setNote]=useState('');
 const summary=useMemo(()=>({total:rows.length,queued:rows.filter(x=>x.status==='QUEUED').length,quarantine:rows.filter(x=>x.status==='QUARANTINED').length,matched:rows.filter(x=>x.matchedDonor).length}),[rows]);
 const persist=(next:QueueRow[])=>{setRows(next);localState.write(KEY,next)};
 const ingest=async(file:File)=>{const sha256=hex(await crypto.subtle.digest('SHA-256',await file.arrayBuffer())),donor=findDonor(file.name),action=donor?recommendedDisposition(donor):'QUARANTINE',row:QueueRow={id:crypto.randomUUID(),at:Date.now(),name:file.name,size:file.size,sha256,matchedDonor:donor?.id,action,status:action==='QUARANTINE'?'QUARANTINED':'FINGERPRINTED',note};persist([row,...rows].slice(0,80));setNote('')};
 const patch=(id:string,p:Partial<QueueRow>)=>persist(rows.map(x=>x.id===id?{...x,...p}:x));
 const receipt={schema:'OMEGA_ARCHIVE_RECOVERY_QUEUE_R48',generatedAt:new Date().toISOString(),summary,queue:rows,boundary:'Local fingerprint/recovery planning only. Archive bytes never become runtime authority automatically; execution/promotion requires separate proof, current-main ancestry and rollback gates.'};
 return <section className='r48-archive-queue'>
  <header><div><span>S20 RECOVERY BOARD · FINGERPRINT → CLASSIFY → QUEUE</span><h3>Archive Recovery Queue</h3></div><button onClick={()=>exportJson('OMEGA_ARCHIVE_RECOVERY_QUEUE_R48.json',receipt)}><Download/>Export queue</button></header>
  <div className='r48-queue-kpis'><article><b>{summary.total}</b><span>fingerprinted</span></article><article><b>{summary.matched}</b><span>matched donors</span></article><article><b>{summary.queued}</b><span>queued</span></article><article><b>{summary.quarantine}</b><span>quarantined</span></article></div>
  <div className='r48-queue-intake'><label><Upload/><b>Fingerprint archive / package / manifest</b><span>SHA-256 locally before any admission decision</span><input type='file' onChange={e=>{const f=e.target.files?.[0];if(f)void ingest(f);e.currentTarget.value=''}}/></label><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder='Optional recovery note retained with the fingerprint…'/></div>
  <div className='r48-queue-list'>{rows.map(x=>{const donor=x.matchedDonor?ARCHIVE_DONORS.find(d=>d.id===x.matchedDonor):undefined;return <article key={x.id} data-status={x.status}><FileArchive/><div><b>{x.name}</b><small>{x.size.toLocaleString()} bytes · {donor?`${donor.name} · ${donor.verification}`:'UNMATCHED FILE'}</small><code>{x.sha256}</code>{x.note&&<p>{x.note}</p>}</div><select value={x.action} onChange={e=>{const action=e.target.value as ArchiveDisposition;patch(x.id,{action,status:action==='QUARANTINE'?'QUARANTINED':'FINGERPRINTED'})}}><option>KEEP</option><option>DONOR</option><option>QUARANTINE</option><option>EXPAND</option></select><button disabled={x.action==='QUARANTINE'} onClick={()=>patch(x.id,{status:'QUEUED'})}><ArchiveRestore/>Queue</button><button aria-label={`Remove ${x.name}`} onClick={()=>persist(rows.filter(r=>r.id!==x.id))}><Trash2/></button></article>})}{rows.length===0&&<p>No archive bytes fingerprinted in this browser yet.</p>}</div>
  <footer><ShieldCheck/>Queue means “approved for governed recovery work,” not “executed.” Unknown files default to QUARANTINE; invalid or unproven donors never seize state authority.</footer>
 </section>;
}

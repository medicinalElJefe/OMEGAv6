import {useMemo} from 'react';
import {Cpu,HardDrive,MemoryStick,ShieldCheck,TriangleAlert} from 'lucide-react';
import {useHybridRuntimeSnapshotR238} from './HybridRuntimeSnapshotR238';
import {latestReturnedHostProofR239,resourceEnvelopeR239} from './hybridResourceGovernorR239';
import './hybridResourceGovernorR239.css';

const ACTIVE=new Set(['QUEUED','RUNNING']);
const bytes=(v:any)=>{let n=Number(v);if(!Number.isFinite(n)||n<0)return'—';const u=['B','KB','MB','GB','TB'];let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return`${n>=100?n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2)} ${u[i]}`};
const pct=(v:any)=>Number.isFinite(Number(v))?`${Math.round(Number(v))}%`:'—';

export default function HybridResourceGovernorR239(){
 const{device,selectedDeviceJobs,epoch,stale}=useHybridRuntimeSnapshotR238();
 const proof=useMemo(()=>latestReturnedHostProofR239(selectedDeviceJobs,String(device?.id||'')),[selectedDeviceJobs,device?.id]);
 const activeNativeWork=useMemo(()=>selectedDeviceJobs.some((job:any)=>ACTIVE.has(String(job?.status||'').toUpperCase())),[selectedDeviceJobs]);
 const envelope=useMemo(()=>resourceEnvelopeR239({profile:proof?.profile||null,snapshotCurrent:Boolean(epoch>0&&!stale),activeNativeWork}),[proof?.profile,epoch,stale,activeNativeWork]);
 const ready=envelope.tier==='READY'||envelope.tier==='HIGH_CAPACITY';
 return <section className='r239-resource-governor' aria-label='R239 adaptive Hybrid resource governor' data-r239-tier={envelope.tier} data-r239-device={device?.id||'NONE'} data-r239-profile={envelope.profileProved?'RETURNED_PROOF':'UNPROVED'}>
  <header><div><span>R239 · ADAPTIVE HYBRID RESOURCE GOVERNOR · SELECTED HOST ONLY</span><h3>Size work to the PC that is actually connected.</h3><p>R239 converts the returned R238 DESKTOP_HEALTH profile into a deterministic resource envelope for this exact authenticated host and shared snapshot epoch. It reduces worker and scan budgets under pressure, holds heavy work when memory/storage headroom is unsafe, and never treats hardware inventory as CUDA, RCWA or scientific proof.</p></div><div className={'r239-tier '+(ready?'pass':envelope.tier==='CONSTRAINED'?'warn':'hold')}><b>{envelope.tier}</b><small>{envelope.reasons.join(' · ')}</small></div></header>
  <div className='r239-grid'>
   <article><Cpu/><div><small>CPU BUDGET</small><b>{envelope.effectiveCpuWorkers} worker{envelope.effectiveCpuWorkers===1?'':'s'}</b><span>{envelope.recommendedCpuWorkers} returned advisory cap · R239 pressure-adjusted</span></div></article>
   <article><MemoryStick/><div><small>MEMORY HEADROOM</small><b>{pct(envelope.memoryLoadPercent)} load</b><span>{bytes(envelope.availableMemoryBytes)} available at returned sample</span></div></article>
   <article><HardDrive/><div><small>APPROVED ROOT FREE</small><b>{bytes(envelope.freeStorageBytes)}</b><span>package and training gates retain explicit free-space floors</span></div></article>
   <article><ShieldCheck/><div><small>BOUNDED INDEX / TRAIN</small><b>{envelope.hashMaxResults.toLocaleString()} / {envelope.trainMaxResults.toLocaleString()}</b><span>maximum R239 HASH_TREE / TRAIN_LOCAL result budgets for this envelope</span></div></article>
  </div>
  <div className='r239-admission'>
   {(Object.entries(envelope.admission) as [string,boolean][]).map(([id,ok])=><article key={id} className={ok?'pass':'hold'}>{ok?<ShieldCheck/>:<TriangleAlert/>}<div><small>{id}</small><b>{ok?'ADMISSIBLE':'HELD'}</b></div></article>)}
  </div>
  <footer><ShieldCheck/><span>{envelope.truthBoundary} {proof?`Profile source job ${proof.job?.id||'unknown'} remains inside R141 returned-payload proof continuity.`:'Run the existing R237 “Prove host + tree” preset first to obtain current returned host evidence.'}</span></footer>
 </section>;
}

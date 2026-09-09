import {useEffect,useMemo,useState} from 'react';
import {Cpu,Database,HardDrive,MemoryStick,RefreshCw,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import './hybridHostIntelligenceR238.css';

const age=(n:any)=>{const t=Number(n)||0;if(!t)return'—';const s=Math.max(0,Math.round((Date.now()-t)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};
const bytes=(n:any)=>{const v=Number(n);if(!Number.isFinite(v)||v<=0)return'—';const units=['B','KB','MB','GB','TB'];let x=v,i=0;while(x>=1024&&i<units.length-1){x/=1024;i++}return`${x>=100?x.toFixed(0):x>=10?x.toFixed(1):x.toFixed(2)} ${units[i]}`};
const text=(v:any,fallback='—')=>String(v??'').trim()||fallback;
const storedDevice=()=>{try{return window.localStorage.getItem('omega:hybrid:selectedDeviceId')||''}catch{return''}};

export default function HybridHostIntelligenceR238(){
 const[live,setLive]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[selectedDeviceId,setSelectedDeviceId]=useState(storedDevice);
 const refresh=async()=>{setBusy(true);try{const r=await api.get<any>('/api/hybrid/status');setLive(r.data||{});setSelectedDeviceId(storedDevice());setError('')}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),2500);return()=>window.clearInterval(id)},[]);
 const devices=Array.isArray(live?.devices)?live.devices:[];
 const onlineDevices=useMemo(()=>devices.filter((d:any)=>d?.online&&!d?.revoked),[devices]);
 const device=useMemo(()=>onlineDevices.find((d:any)=>d?.id===selectedDeviceId)||onlineDevices[0]||null,[onlineDevices,selectedDeviceId]);
 const jobs=Array.isArray(live?.jobs)?live.jobs:[];
 const proof=useMemo(()=>{
  if(!device)return null;
  const rows=[...jobs].reverse().filter((j:any)=>j?.targetDeviceId===device.id&&j?.returnPacket);
  for(const job of rows){
   const steps=Array.isArray(job.returnPacket?.stepProofs)?job.returnPacket.stepProofs:[];
   const step=steps.find((s:any)=>String(s?.op||'').toUpperCase()==='DESKTOP_HEALTH'&&s?.ok===true&&s?.result?.hostProfileR238);
   if(step)return{job,step,profile:step.result.hostProfileR238,macros:step.result.macroInventoryR238||null};
  }
  return null;
 },[jobs,device]);
 const p=proof?.profile||null,m=proof?.macros||null;
 const currentHeartbeat=Boolean(device?.online&&!device?.revoked);
 const gpuAdapters=Array.isArray(p?.gpu?.adapters)?p.gpu.adapters:[];
 const nvidiaSmi=Boolean(p?.gpu?.nvidiaSmi?.available);
 return <section className='r238-host-intelligence' aria-label='R238 Hybrid host intelligence' data-r238-host-intelligence={p?'RETURNED_HOST_PROOF':'AWAITING_RETURNED_PROFILE'} data-r238-selected-device={device?.id||'NONE'}>
  <header><div><span>R238 · HYBRID HOST INTELLIGENCE · RETURNED + HASH BOUND</span><h3>Use the machine you actually have.</h3><p>R238 derives compute planning from host-observed CPU, memory, GPU, approved-root storage, Python and RCWA dependency state. The values below are never hard-coded from a screenshot: they appear only after the authenticated agent returns them inside a DESKTOP_HEALTH proof packet covered by the existing R141 exact-payload fingerprint. This card follows the exact host selected by the R237 command deck, so multi-host state cannot silently cross-wire.</p></div><button onClick={()=>void refresh()} disabled={busy}><RefreshCw/>Refresh</button></header>
  <div className='r238-truth-row'>
   <article className={currentHeartbeat?'pass':'hold'}><ShieldCheck/><div><small>AUTHENTICATED HOST</small><b>{currentHeartbeat?'CURRENT HEARTBEAT':'DEVICE PROOF REQUIRED'}</b><span>{device?`${text(device.name,device.id)} · ${text(device.id)} · ${age(device.lastSeen)}`:'No current non-revoked host heartbeat'}</span></div></article>
   <article className={p?'pass':'hold'}>{p?<Database/>:<TriangleAlert/>}<div><small>RESOURCE PROFILE</small><b>{p?'RETURNED HOST PROOF':'NOT YET RETURNED'}</b><span>{p?`${text(p.profileSha256).slice(0,18)}… · ${age(p.observedAt)}`:'Run “Prove host + tree” on the selected R237 host after the R238 launcher refresh.'}</span></div></article>
   <article className={p?.rcwa?.pythonDependencyAvailable?'pass':'hold'}><Cpu/><div><small>RCWA PYTHON DEPENDENCY</small><b>{p?p.rcwa?.pythonDependencyAvailable?'AVAILABLE':'NOT INSTALLED':'UNPROVED'}</b><span>{p?text(p.rcwa?.reason):'No returned environment profile yet'}</span></div></article>
  </div>
  <div className='r238-grid'>
   <article><Cpu/><div><small>CPU</small><b>{p?text(p.cpu?.model):'—'}</b><span>{p?`${p.cpu?.physicalCores||'—'} physical · ${p.cpu?.logicalProcessors||'—'} logical · advisory workers ${p.schedulerAdvisory?.recommendedCpuWorkers??'—'}`:'Awaiting returned host proof'}</span></div></article>
   <article><MemoryStick/><div><small>MEMORY</small><b>{p?bytes(p.memory?.totalBytes):'—'}</b><span>{p?`${bytes(p.memory?.availableBytes)} available · ${p.memory?.loadPercent??'—'}% load when sampled`:'Awaiting returned host proof'}</span></div></article>
   <article><Cpu/><div><small>GPU</small><b>{p?text(p.gpu?.name,p.gpu?.present?'GPU adapter detected':'No GPU adapter returned'):'—'}</b><span>{p?`${gpuAdapters.length} Windows adapter${gpuAdapters.length===1?'':'s'} · ${bytes(p.gpu?.vramBytes||p.gpu?.adapterRamReportedBytes)} reported memory · ${nvidiaSmi?'NVIDIA SMI read-only enrichment':'no NVIDIA SMI proof'}`:'Awaiting returned host proof'}</span></div></article>
   <article><HardDrive/><div><small>APPROVED ROOT STORAGE</small><b>{p?bytes(p.storage?.totalBytes):'—'}</b><span>{p?`${bytes(p.storage?.freeBytes)} free · root ${text(p.storage?.rootLabel)}`:'Awaiting returned host proof'}</span></div></article>
   <article><Database/><div><small>PYTHON</small><b>{p?text(p.python?.version):'—'}</b><span>{p?`${text(p.python?.executable)} · ${text(p.python?.architecture)}`:'Awaiting returned host proof'}</span></div></article>
   <article><ShieldCheck/><div><small>LOCAL MACRO STORE</small><b>{m?`${m.verifiedCount||0} VERIFIED`:'—'}</b><span>{m?`${m.totalCount||0} stored · ${m.invalidCount||0} held · event contents not uploaded`:'Inventory is emitted with host proof only'}</span></div></article>
  </div>
  {proof&&<footer><ShieldCheck/><span>Proof source: authenticated Hybrid device <code>{device?.id}</code> · job <code>{proof.job.id}</code> · DESKTOP_HEALTH step · R141 exact return closure. Hardware presence does not prove CUDA runtime, RCWA numerical validity, scientific truth, source mutation, or CanonState admission. R238 only improves resource truth and safe scheduling decisions.</span></footer>}
  {error&&<div className='r238-error'><TriangleAlert/>{error}</div>}
 </section>;
}

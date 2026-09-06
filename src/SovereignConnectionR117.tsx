import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,ChevronDown,ChevronUp,Cpu,Download,RefreshCw,RotateCcw,ShieldCheck,TriangleAlert,Trash2} from 'lucide-react';
import {api,clearHybridBridge,getHybridBridge,type HybridBridgeCredential} from './platformAdapter';
import {bootstrapSovereignR117} from './hybridBootstrapR117';
import {launcherBlobUrlR117,SOVEREIGN_LAUNCHER_FILENAME_R117} from './sovereignLauncherR117';
import './sovereignConnectionR112.css';

const age=(n:number)=>{if(!n)return'never';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};
const truth=(v:any)=>String(v||'').replaceAll('_',' ');

type Props={compact?:boolean;onState?:(state:any)=>void};

export default function SovereignConnectionR117({compact=false,onState}:Props){
 const[bridge,setBridge]=useState<HybridBridgeCredential|null>(()=>getHybridBridge());
 const[live,setLive]=useState<any>(null),[fabric,setFabric]=useState<any>(null),[convergence,setConvergence]=useState<any>(null),[busy,setBusy]=useState(false),[advanced,setAdvanced]=useState(false),[message,setMessage]=useState('');
 const refresh=async()=>{try{const[h,f,c]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/federation/run/status').catch(()=>null),api.get<any>('/api/system/convergence').catch(()=>null)]);setLive(h.data||{});setFabric(f?.data||null);setConvergence(c?.data||null);setMessage(m=>m.startsWith('Status error:')?'':m)}catch(e:any){setMessage(`Status error: ${e?.message||String(e)}`)}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),2500);return()=>window.clearInterval(id)},[]);
 const devices=Array.isArray(live?.devices)?live.devices:[],current=devices.filter((d:any)=>d?.online&&!d?.revoked),proved=devices.filter((d:any)=>Number(d?.lastSeen)>0&&!d?.revoked),lastSeen=proved.length?Math.max(...proved.map((d:any)=>Number(d.lastSeen)||0)):0;
 const online=current.length>0&&live?.nativeExecutionClaimed===true;
 const rcwa=String(fabric?.nodes?.sovereign?.rcwaState||fabric?.runtime?.rcwa?.state||'NOT STARTED');
 const rcwaOnline=/ONLINE|LIVE/.test(rcwa.toUpperCase());
 const retiredOrigin=String(convergence?.connectorPolicy?.retiredOrigin||'omega-sovereign-convergence.foundasound.chatgpt.site');
 useEffect(()=>{onState?.({online,bridge:Boolean(bridge),lastSeen,rcwaState:rcwa,rcwaOnline,phase:online?3:bridge?2:1})},[online,bridge,lastSeen,rcwa,rcwaOnline,onState]);

 const forceFresh=async()=>{
  if(busy)return;
  setBusy(true);setMessage('Creating a brand-new durable pairing and clean R117 connector…');
  try{
   const fresh=await bootstrapSovereignR117();
   setBridge(getHybridBridge());
   const url=launcherBlobUrlR117(fresh.pairingCode);
   const a=document.createElement('a');a.href=url;a.download=SOVEREIGN_LAUNCHER_FILENAME_R117;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
   window.setTimeout(()=>URL.revokeObjectURL(url),1500);
   setLive(null);
   setMessage(`Fresh R117 connector downloaded: ${SOVEREIGN_LAUNCHER_FILENAME_R117}. Open that exact file. It contains the newly rotated server credential and only targets canonical OMEGAv6.`);
   window.setTimeout(()=>void refresh(),1200);
  }catch(e:any){setMessage(`Connection repair failed before download: ${e?.message||String(e)}`)}finally{setBusy(false)}
 };
 const forget=()=>{clearHybridBridge();setBridge(null);setLive(null);setMessage('Browser bridge credential removed. Use FIX CONNECTION NOW to mint a completely new one.');void refresh()};
 const capabilitySummary=useMemo(()=>[
  {label:'Local files & projects',ready:online,detail:online?'Available inside the approved root':'Current authenticated PC heartbeat required'},
  {label:'Build / test / package',ready:online,detail:online?'Native execution available through governed jobs':'Current authenticated PC heartbeat required'},
  {label:'Local learning',ready:online,detail:online?'TRAIN_LOCAL available inside the approved corpus':'Current authenticated PC heartbeat required'},
  {label:'Full-wave RCWA',ready:online&&rcwaOnline,detail:online?(rcwaOnline?'Solver heartbeat current':'PC connected; RCWA dependency/worker not current'):'Connect PC first'}
 ],[online,rcwaOnline]);

 return <section className={'r112-sovereign '+(compact?'compact ':'')+(online?'live':bridge?'prepared':'idle')} aria-label='Connect this PC to OMEGA'>
  <div className='r112-sovereign-main'>
   <div className='r112-sovereign-copy'><span>OMEGA SOVEREIGN LINK · R117</span><h3>{online?'This PC is genuinely connected':'Fix the PC connection now'}</h3><p>{online?'OMEGA is receiving a current authenticated Windows-host heartbeat.':'This control discards stale bridge ambiguity, rotates a fresh durable server credential, and downloads one clean connector bound only to canonical OMEGAv6.'}</p></div>
   <div className='r112-sovereign-primary'>
    {!online&&<button className='r112-big-action' onClick={()=>void forceFresh()} disabled={busy}>{busy?<RefreshCw className='spin'/>:<Download/>}{busy?'Building clean connector…':'FIX CONNECTION NOW'}</button>}
    {online&&<div className='r112-online-badge'><CheckCircle2/><div><b>PC ONLINE</b><small>{current.length} current authenticated heartbeat{current.length===1?'':'s'}</small></div></div>}
    <button className='r112-advanced-toggle' onClick={()=>setAdvanced(v=>!v)}>{advanced?<ChevronUp/>:<ChevronDown/>}{advanced?'Hide proof details':'Connection proof details'}</button>
   </div>
  </div>

  {!online&&<div className='r112-three-steps'>
   <article className='active'><b>1</b><div><strong>Click FIX CONNECTION NOW</strong><span>OMEGAv6 rotates a brand-new durable pairing directly on the server. Stale browser bridge headers are deliberately ignored during bootstrap.</span></div><ShieldCheck/></article>
   <article><b>2</b><div><strong>Open only <code>{SOVEREIGN_LAUNCHER_FILENAME_R117}</code></strong><span>The clean connector calls <code>omegav6.jeffdeweyeljefe.workers.dev</code>, downloads the current agent every run, and prints reachability, authentication and heartbeat live in the Windows window.</span></div><Download/></article>
   <article><b>3</b><div><strong>PC ONLINE appears only after proof</strong><span>The page polls the exact fresh bridge every few seconds. Browser pairing alone never claims native execution.</span></div><Cpu/></article>
  </div>}

  {!online&&<div className='r112-sovereign-message'><TriangleAlert/>Delete or ignore every old launcher that mentions <code>{retiredOrigin}</code>. R117 never calls it.</div>}
  {message&&<div className='r112-sovereign-message'>{message}</div>}

  <div className='r112-capabilities'>{capabilitySummary.map(x=><article key={x.label} className={x.ready?'ready':''}>{x.ready?<CheckCircle2/>:<span className='r112-cap-dot'/>}<div><b>{x.label}</b><small>{x.detail}</small></div></article>)}</div>

  {advanced&&<div className='r112-sovereign-advanced'>
   <div className='r112-facts'><div><span>BROWSER BRIDGE</span><b>{bridge?'FRESH/AVAILABLE':'NONE'}</b></div><div><span>SERVER STATE</span><b>{truth(live?.state||'DEVICE_PROOF_REQUIRED')}</b></div><div><span>LAST PC PROOF</span><b>{lastSeen?age(lastSeen):'none'}</b></div><div><span>RCWA</span><b>{truth(rcwa)}</b></div></div>
   <p><TriangleAlert/>R117 separates credential issuance from host proof. A fresh credential is not PC ONLINE; a current authenticated heartbeat is.</p>
   <div className='r112-advanced-actions'><button onClick={()=>void refresh()}><RefreshCw/>Refresh proof</button><button onClick={()=>void forceFresh()} disabled={busy}><RotateCcw/>Rotate + clean download</button><button onClick={forget}><Trash2/>Forget browser bridge</button></div>
   {bridge?.bridgeId&&<code className='r112-bridge-id'>Bridge {bridge.bridgeId}</code>}
  </div>}
 </section>;
}

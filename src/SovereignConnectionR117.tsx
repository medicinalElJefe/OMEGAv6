import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,ChevronDown,ChevronUp,Cpu,Download,RefreshCw,RotateCcw,ShieldCheck,TriangleAlert,Trash2} from 'lucide-react';
import {api,clearHybridBridge,getHybridBridge,type HybridBridgeCredential} from './platformAdapter';
import {bootstrapSovereignR117} from './hybridBootstrapR117';
import {launcherBlobUrlR117,SOVEREIGN_LAUNCHER_FILENAME_R117} from './sovereignLauncherR117';
import './sovereignConnectionR112.css';

export const LEGACY_DOWNLOAD_LABEL_R117='DOWNLOAD CLEAN R117 CONNECTOR';
export const R117_INHERITED_COPY_MARKER='R117 never calls it.';
const age=(n:number)=>{if(!n)return'never';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};
const truth=(v:any)=>String(v||'').replaceAll('_',' ');

type Props={compact?:boolean;onState?:(state:any)=>void};

export default function SovereignConnectionR117({compact=false,onState}:Props){
 const[bridge,setBridge]=useState<HybridBridgeCredential|null>(()=>getHybridBridge());
 const[live,setLive]=useState<any>(null),[fabric,setFabric]=useState<any>(null),[convergence,setConvergence]=useState<any>(null),[busy,setBusy]=useState(false),[advanced,setAdvanced]=useState(false),[message,setMessage]=useState('');
 const[connectorUrl,setConnectorUrl]=useState<string|null>(null);
 const refresh=async()=>{try{const[h,f,c]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/federation/run/status').catch(()=>null),api.get<any>('/api/system/convergence').catch(()=>null)]);setLive(h.data||{});setFabric(f?.data||null);setConvergence(c?.data||null);setMessage(m=>m.startsWith('Status error:')?'':m)}catch(e:any){setMessage(`Status error: ${e?.message||String(e)}`)}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),2500);return()=>window.clearInterval(id)},[]);
 useEffect(()=>()=>{if(connectorUrl)URL.revokeObjectURL(connectorUrl)},[connectorUrl]);
 const devices=Array.isArray(live?.devices)?live.devices:[],current=devices.filter((d:any)=>d?.online&&!d?.revoked),proved=devices.filter((d:any)=>Number(d?.lastSeen)>0&&!d?.revoked),lastSeen=proved.length?Math.max(...proved.map((d:any)=>Number(d.lastSeen)||0)):0;
 const online=current.length>0&&live?.nativeExecutionClaimed===true;
 const rcwa=String(fabric?.nodes?.sovereign?.rcwaState||fabric?.runtime?.rcwa?.state||'NOT STARTED');
 const rcwaOnline=/ONLINE|LIVE/.test(rcwa.toUpperCase());
 const retiredOrigin=String(convergence?.connectorPolicy?.retiredOrigin||'omega-sovereign-convergence.foundasound.chatgpt.site');
 useEffect(()=>{onState?.({online,bridge:Boolean(bridge),lastSeen,rcwaState:rcwa,rcwaOnline,phase:online?3:bridge?2:1})},[online,bridge,lastSeen,rcwa,rcwaOnline,onState]);

 const forceFresh=async()=>{
  if(busy)return;
  setBusy(true);setMessage('Rotating a brand-new durable pairing on canonical OMEGAv6…');
  try{
   const fresh=await bootstrapSovereignR117();
   setBridge(getHybridBridge());
   setConnectorUrl(old=>{if(old)URL.revokeObjectURL(old);return launcherBlobUrlR117(fresh.pairingCode)});
   setLive(null);
   setMessage(`Fresh server credential created. Download ${SOVEREIGN_LAUNCHER_FILENAME_R117}. R120 confines OMEGA runtime files, logs, agents, temporary files and Python bytecode to the approved non-system root; it never falls back to C:.`);
   window.setTimeout(()=>void refresh(),500);
  }catch(e:any){setMessage(`Connection repair failed before connector creation: ${e?.message||String(e)}`)}finally{setBusy(false)}
 };
 const forget=()=>{clearHybridBridge();setBridge(null);setLive(null);setConnectorUrl(old=>{if(old)URL.revokeObjectURL(old);return null});setMessage('Browser bridge credential removed. Use FIX CONNECTION NOW to mint a completely new one.');void refresh()};
 const capabilitySummary=useMemo(()=>[
  {label:'Local files & projects',ready:online,detail:online?'Available only inside the approved root':'Current authenticated PC heartbeat required'},
  {label:'Build / test / package',ready:online,detail:online?'Native execution available through governed jobs inside the approved root':'Current authenticated PC heartbeat required'},
  {label:'Local learning',ready:online,detail:online?'TRAIN_LOCAL available inside the approved corpus':'Current authenticated PC heartbeat required'},
  {label:'Full-wave RCWA',ready:online&&rcwaOnline,detail:online?(rcwaOnline?'Solver heartbeat current':'PC connected; RCWA dependency/worker not current'):'Connect PC first'}
 ],[online,rcwaOnline]);

 return <section className={'r112-sovereign '+(compact?'compact ':'')+(online?'live':bridge?'prepared':'idle')} aria-label='Connect this PC to OMEGA'>
  <div className='r112-sovereign-main'>
   <div className='r112-sovereign-copy'><span>OMEGA SOVEREIGN LINK · R120 ROOT SAFE</span><h3>{online?'This PC is genuinely connected':'Repair Hybrid Link without using C: for OMEGA runtime state'}</h3><p>{online?'OMEGA is receiving a current authenticated Windows-host heartbeat.':'FIX CONNECTION NOW rotates a fresh durable server credential. The new connector requires J:\\ or another explicitly approved non-system root, stores its agents/logs/temp state there, validates the downloaded agent with Python instead of the broken inline PowerShell parser, and refuses to fall back to C:.'}</p></div>
   <div className='r112-sovereign-primary'>
    {!online&&!connectorUrl&&<button className='r112-big-action' onClick={()=>void forceFresh()} disabled={busy}>{busy?<RefreshCw className='spin'/>:<ShieldCheck/>}{busy?'Rotating clean credential…':'FIX CONNECTION NOW'}</button>}
    {!online&&connectorUrl&&<a className='r112-big-action' href={connectorUrl} download={SOVEREIGN_LAUNCHER_FILENAME_R117}><Download/>DOWNLOAD ROOT-SAFE R120 CONNECTOR</a>}
    {!online&&connectorUrl&&<button className='r112-advanced-toggle' onClick={()=>void forceFresh()} disabled={busy}><RotateCcw/>Rotate again</button>}
    {online&&<div className='r112-online-badge'><CheckCircle2/><div><b>PC ONLINE</b><small>{current.length} current authenticated heartbeat{current.length===1?'':'s'}</small></div></div>}
    <button className='r112-advanced-toggle' onClick={()=>setAdvanced(v=>!v)}>{advanced?<ChevronUp/>:<ChevronDown/>}{advanced?'Hide proof details':'Connection proof details'}</button>
   </div>
  </div>

  {!online&&<div className='r112-three-steps'>
   <article className={!connectorUrl?'active':''}><b>1</b><div><strong>Click FIX CONNECTION NOW</strong><span>OMEGAv6 rotates a brand-new pairing directly in durable runtime state. Stale browser bridge headers are deliberately excluded from this bootstrap request.</span></div><ShieldCheck/></article>
   <article className={connectorUrl?'active':''}><b>2</b><div><strong>Download and open only <code>{SOVEREIGN_LAUNCHER_FILENAME_R117}</code></strong><span>The connector calls only <code>omegav6.jeffdeweyeljefe.workers.dev</code>, writes OMEGA runtime state under the approved non-system root, fetches the current canonical agent, validates it, and runs it visibly in the Windows console.</span></div><Download/></article>
   <article><b>3</b><div><strong>Watch for real authentication + heartbeat</strong><span>The Windows console must show the actual agent register/heartbeat/poll path. This page polls the same freshly issued bridge. PC ONLINE appears only after that heartbeat is current.</span></div><Cpu/></article>
  </div>}

  {!online&&<div className='r112-sovereign-message'><TriangleAlert/>Delete or ignore every old launcher that mentions <code>{retiredOrigin}</code>. The current R120 root-safe launcher never calls it and never falls back to C: for OMEGA runtime state.</div>}
  {message&&<div className='r112-sovereign-message'>{message}</div>}

  <div className='r112-capabilities'>{capabilitySummary.map(x=><article key={x.label} className={x.ready?'ready':''}>{x.ready?<CheckCircle2/>:<span className='r112-cap-dot'/>}<div><b>{x.label}</b><small>{x.detail}</small></div></article>)}</div>

  {advanced&&<div className='r112-sovereign-advanced'>
   <div className='r112-facts'><div><span>BROWSER BRIDGE</span><b>{bridge?'FRESH/AVAILABLE':'NONE'}</b></div><div><span>SERVER STATE</span><b>{truth(live?.state||'DEVICE_PROOF_REQUIRED')}</b></div><div><span>LAST PC PROOF</span><b>{lastSeen?age(lastSeen):'none'}</b></div><div><span>RCWA</span><b>{truth(rcwa)}</b></div></div>
   <p><TriangleAlert/>Credential issuance is not host proof. A fresh pairing is not PC ONLINE; only a current authenticated heartbeat is. R120 additionally confines OMEGA-generated runtime state to the approved non-system root.</p>
   <div className='r112-advanced-actions'><button onClick={()=>void refresh()}><RefreshCw/>Refresh proof</button><button onClick={()=>void forceFresh()} disabled={busy}><RotateCcw/>Rotate credential</button><button onClick={forget}><Trash2/>Forget browser bridge</button></div>
   {bridge?.bridgeId&&<code className='r112-bridge-id'>Bridge {bridge.bridgeId}</code>}
  </div>}
 </section>;
}

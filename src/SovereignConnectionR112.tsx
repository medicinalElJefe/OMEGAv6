import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,ChevronDown,ChevronUp,Cpu,Download,FolderOpen,RefreshCw,RotateCcw,ShieldCheck,TriangleAlert,Trash2} from 'lucide-react';
import {api,clearHybridBridge,createHybridPair,getHybridBridge,reconnectHybridBridge,type HybridBridgeCredential} from './platformAdapter';
import {launcherBlobUrlR112,SOVEREIGN_LAUNCHER_FILENAME_R112} from './sovereignLauncherR112';
import {launcherBlobUrlR116,SOVEREIGN_LAUNCHER_FILENAME_R116} from './sovereignLauncherR116';
import './sovereignConnectionR112.css';

const age=(n:number)=>{if(!n)return'never';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};
const truth=(v:any)=>String(v||'').replaceAll('_',' ');

type Props={compact?:boolean;onState?:(state:any)=>void};

export default function SovereignConnectionR112({compact=false,onState}:Props){
 const[bridge,setBridge]=useState<HybridBridgeCredential|null>(()=>getHybridBridge());
 const[live,setLive]=useState<any>(null),[fabric,setFabric]=useState<any>(null),[convergence,setConvergence]=useState<any>(null),[busy,setBusy]=useState(false),[advanced,setAdvanced]=useState(false),[message,setMessage]=useState('');
 const[launcherUrl,setLauncherUrl]=useState(''),[fallbackLauncherUrl,setFallbackLauncherUrl]=useState('');
 // Older accepted browser credentials did not always persist pairingCode separately.
 // The durable bridge credential already contains the exact two fields used by the agent pairing code,
 // so recover the launcher deterministically instead of trapping the user behind a dead download state.
 const code=bridge?.pairingCode||(bridge?.bridgeId&&bridge?.secret?`${bridge.bridgeId}.${bridge.secret}`:'');
 const refresh=async()=>{try{const[h,f,c]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/federation/run/status').catch(()=>null),api.get<any>('/api/system/convergence').catch(()=>null)]);setLive(h.data||{});setFabric(f?.data||null);setConvergence(c?.data||null);setMessage(m=>m.startsWith('Connection error:')?'':m)}catch(e:any){setMessage(`Connection error: ${e?.message||String(e)}`)}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),2500);return()=>window.clearInterval(id)},[]);
 useEffect(()=>{if(!code){setLauncherUrl('');setFallbackLauncherUrl('');return}const current=launcherBlobUrlR116(code),fallback=launcherBlobUrlR112(code);setLauncherUrl(current);setFallbackLauncherUrl(fallback);return()=>{URL.revokeObjectURL(current);URL.revokeObjectURL(fallback)}},[code]);
 const devices=Array.isArray(live?.devices)?live.devices:[],current=devices.filter((d:any)=>d?.online&&!d?.revoked),proved=devices.filter((d:any)=>Number(d?.lastSeen)>0&&!d?.revoked),lastSeen=proved.length?Math.max(...proved.map((d:any)=>Number(d.lastSeen)||0)):0;
 const online=current.length>0&&live?.nativeExecutionClaimed===true;
 const rcwa=String(fabric?.nodes?.sovereign?.rcwaState||fabric?.runtime?.rcwa?.state||'NOT STARTED');
 const rcwaOnline=/ONLINE|LIVE/.test(rcwa.toUpperCase());
 const phase=online?3:bridge?2:1;
 const retiredOrigin=String(convergence?.connectorPolicy?.retiredOrigin||'omega-sovereign-convergence.foundasound.chatgpt.site');
 useEffect(()=>{onState?.({online,bridge:Boolean(bridge),lastSeen,rcwaState:rcwa,rcwaOnline,phase})},[online,bridge,lastSeen,rcwa,rcwaOnline,phase,onState]);
 const prepare=async()=>{if(busy||online)return;setBusy(true);setMessage('');try{
  if(!bridge){await createHybridPair(false);setBridge(getHybridBridge());setMessage('Connection prepared. Download the current Windows connector below and open it once.');}
  else{try{await reconnectHybridBridge(false);setBridge(getHybridBridge());setMessage('Connection credential verified. Download or reopen the current Windows connector.');}catch(e:any){if(e?.code==='PAIR_AUTH_FAILED'||e?.status===401){await reconnectHybridBridge(true);setBridge(getHybridBridge());setMessage('The old browser key was repaired. Download the fresh R116 Windows connector.');}else throw e}}
  await refresh();
 }catch(e:any){setMessage(e?.message||String(e))}finally{setBusy(false)}};
 const rotate=async()=>{if(busy)return;setBusy(true);try{await createHybridPair(true);setBridge(getHybridBridge());setMessage('A fresh connection key was created. Older connector files are now obsolete.');await refresh()}catch(e:any){setMessage(e?.message||String(e))}finally{setBusy(false)}};
 const forget=()=>{clearHybridBridge();setBridge(null);setLive(null);setMessage('Browser connection key removed.');void refresh()};
 const title=online?'This PC is connected':bridge?'Finish connecting this PC':'Connect this PC';
 const subtitle=online?'OMEGA is receiving a current authenticated heartbeat from the Windows host.':bridge?'The secure browser side is ready. Run the current canonical Windows connector; retired preview-host launchers must not be used.':'Prepare one secure connection, download one Windows file, and run it. No cloud or solver knowledge is required.';
 const stageText=online?'CONNECTED':bridge?'RUN CURRENT FILE':'START HERE';
 const capabilitySummary=useMemo(()=>[
  {label:'Local files & projects',ready:online,detail:online?'Available inside the approved root':'Connect PC first'},
  {label:'Build / test / package',ready:online,detail:online?'Native execution may be proof-gated per job':'Connect PC first'},
  {label:'Local learning',ready:online,detail:online?'TRAIN_LOCAL can run against the approved corpus':'Connect PC first'},
  {label:'Full-wave RCWA',ready:online&&rcwaOnline,detail:online?(rcwaOnline?'Solver heartbeat current':'PC connected; solver dependency not started'):'Connect PC first'}
 ],[online,rcwaOnline]);
 return <section className={'r112-sovereign '+(compact?'compact ':'')+(online?'live':bridge?'prepared':'idle')} aria-label='Connect this PC to OMEGA'>
  <div className='r112-sovereign-main'>
   <div className='r112-sovereign-copy'><span>{stageText}</span><h3>{title}</h3><p>{subtitle}</p></div>
   <div className='r112-sovereign-primary'>
    {!online&&!bridge&&<button className='r112-big-action' onClick={()=>void prepare()} disabled={busy}>{busy?<RefreshCw className='spin'/>:<ShieldCheck/>}{busy?'Preparing…':'Prepare connection'}</button>}
    {!online&&bridge&&launcherUrl&&<a className='r112-big-action' href={launcherUrl} download={SOVEREIGN_LAUNCHER_FILENAME_R116} onClick={()=>setMessage('Current R116 Windows connector downloaded. Open it once; this screen will detect the authenticated heartbeat automatically.')}><Download/>Download current Windows connector</a>}
    {!online&&bridge&&!launcherUrl&&<button className='r112-big-action' onClick={()=>void rotate()} disabled={busy}><RefreshCw/>Create fresh connector</button>}
    {online&&<div className='r112-online-badge'><CheckCircle2/><div><b>PC ONLINE</b><small>{current.length} current authenticated heartbeat{current.length===1?'':'s'}</small></div></div>}
    <button className='r112-advanced-toggle' onClick={()=>setAdvanced(v=>!v)}>{advanced?<ChevronUp/>:<ChevronDown/>}{advanced?'Hide details':'Connection details'}</button>
   </div>
  </div>

  {!online&&bridge&&<div className='r112-three-steps'>
   <article className='done'><b>1</b><div><strong>Secure link prepared</strong><span>The browser key exists.</span></div><CheckCircle2/></article>
   <article className='active'><b>2</b><div><strong>Open the current downloaded file</strong><span>Run <code>{SOVEREIGN_LAUNCHER_FILENAME_R116}</code>. It hard-binds canonical OMEGAv6, refreshes the agent every run, and prefers J:\ as the approved root when that drive exists.</span></div><FolderOpen/></article>
   <article><b>3</b><div><strong>Watch this page change to PC ONLINE</strong><span>No refresh is required. Heartbeat proof is checked every few seconds.</span></div><Cpu/></article>
  </div>}

  {!online&&bridge&&<div className='r112-sovereign-message'><TriangleAlert/>Do not reuse a launcher that shows <code>{retiredOrigin}</code>. That preview host is retired and may return 401 Unauthorized. Use the current canonical connector above.</div>}
  {message&&<div className='r112-sovereign-message'>{message}</div>}

  <div className='r112-capabilities'>{capabilitySummary.map(x=><article key={x.label} className={x.ready?'ready':''}>{x.ready?<CheckCircle2/>:<span className='r112-cap-dot'/>}<div><b>{x.label}</b><small>{x.detail}</small></div></article>)}</div>

  {advanced&&<div className='r112-sovereign-advanced'>
   <div className='r112-facts'><div><span>BROWSER LINK</span><b>{bridge?'READY':'NOT PREPARED'}</b></div><div><span>SERVER STATE</span><b>{truth(live?.state||'DEVICE_PROOF_REQUIRED')}</b></div><div><span>LAST PC PROOF</span><b>{lastSeen?age(lastSeen):'none'}</b></div><div><span>RCWA</span><b>{truth(rcwa)}</b></div></div>
   <p><TriangleAlert/>A browser pairing is only a credential. OMEGA claims native execution only while a real PC heartbeat is current.</p>
   <div className='r112-advanced-actions'><button onClick={()=>void refresh()}><RefreshCw/>Refresh now</button><button onClick={()=>void prepare()} disabled={busy||online}><ShieldCheck/>Verify / repair</button><button onClick={()=>void rotate()} disabled={busy}><RotateCcw/>New connection key</button><button onClick={forget}><Trash2/>Forget browser key</button>{fallbackLauncherUrl&&<a href={fallbackLauncherUrl} download={SOVEREIGN_LAUNCHER_FILENAME_R112}><Download/>Download Windows connector (R112 fallback)</a>}</div>
   {bridge?.bridgeId&&<code className='r112-bridge-id'>Bridge {bridge.bridgeId}</code>}
  </div>}
 </section>;
}

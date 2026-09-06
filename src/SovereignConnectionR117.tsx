import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,ChevronDown,ChevronUp,Cpu,Download,RefreshCw,RotateCcw,ShieldCheck,TriangleAlert,Trash2} from 'lucide-react';
import {api,clearHybridBridge,getHybridBridge,type HybridBridgeCredential} from './platformAdapter';
import {bootstrapSovereignR117} from './hybridBootstrapR117';
import {launcherBlobUrlR117,SOVEREIGN_LAUNCHER_FILENAME_R117,type SovereignAgentReceiptR127} from './sovereignLauncherR117';
import './sovereignConnectionR112.css';

export const LEGACY_DOWNLOAD_LABEL_R117='DOWNLOAD CLEAN R117 CONNECTOR';
export const R117_INHERITED_COPY_MARKER='R117 never calls it.';
export const R120_INHERITED_DOWNLOAD_LABEL='DOWNLOAD ROOT-SAFE R120 CONNECTOR';
export const R127_LEGACY_FIX_LABEL='FIX CONNECTION NOW';
const PROTOCOL_R127='OMEGA_HYBRID_PROTOCOL_R127';
const age=(n:number)=>{if(!n)return'never';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};
const truth=(v:any)=>String(v||'').replaceAll('_',' ');
const shortHash=(v:any)=>String(v||'').slice(0,12)||(v?'unknown':'none');
const validSha=(v:any)=>/^[a-f0-9]{64}$/i.test(String(v||''));

type AgentManifestR127={ok?:boolean;protocol?:string;version?:string;sha256?:string;bytes?:number;connectorRevision?:string;canonicalOrigin?:string;heartbeatTtlMs?:number;pollIntervalMs?:number};
type Props={compact?:boolean;onState?:(state:any)=>void};

export default function SovereignConnectionR117({compact=false,onState}:Props){
 const[bridge,setBridge]=useState<HybridBridgeCredential|null>(()=>getHybridBridge());
 const[live,setLive]=useState<any>(null),[fabric,setFabric]=useState<any>(null),[convergence,setConvergence]=useState<any>(null),[manifest,setManifest]=useState<AgentManifestR127|null>(null),[busy,setBusy]=useState(false),[advanced,setAdvanced]=useState(false),[message,setMessage]=useState('');
 const[connectorUrl,setConnectorUrl]=useState<string|null>(null);
 const refresh=async()=>{try{const[h,f,c]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/federation/run/status').catch(()=>null),api.get<any>('/api/system/convergence').catch(()=>null)]);setLive(h.data||{});setFabric(f?.data||null);setConvergence(c?.data||null);setMessage(m=>m.startsWith('Status error:')?'':m)}catch(e:any){setMessage(`Status error: ${e?.message||String(e)}`)}};
 const loadManifest=async()=>{const r=await api.get<AgentManifestR127>('/api/hybrid/agent-manifest');const m=r.data;if(m?.protocol!==PROTOCOL_R127||!validSha(m?.sha256))throw new Error('Canonical R127 Hybrid agent manifest failed protocol/SHA-256 validation. Pairing state was not changed.');setManifest(m);return m};
 useEffect(()=>{void refresh();void loadManifest().catch(()=>{});const id=window.setInterval(()=>void refresh(),2500);return()=>window.clearInterval(id)},[]);
 useEffect(()=>()=>{if(connectorUrl)URL.revokeObjectURL(connectorUrl)},[connectorUrl]);
 const devices=Array.isArray(live?.devices)?live.devices:[],current=devices.filter((d:any)=>d?.online&&!d?.revoked),proved=devices.filter((d:any)=>Number(d?.lastSeen)>0&&!d?.revoked),sealedCurrent=current.filter((d:any)=>d?.protocol===PROTOCOL_R127&&d?.integrityState==='CURRENT_AGENT'),lastSeen=proved.length?Math.max(...proved.map((d:any)=>Number(d.lastSeen)||0)):0;
 const online=current.length>0&&live?.nativeExecutionClaimed===true;
 const sealed=online&&live?.sealedNativeExecutionClaimed===true&&sealedCurrent.length>0;
 const currentDevice=(sealedCurrent[0]||current[0]) as any;
 const rcwa=String(fabric?.nodes?.sovereign?.rcwaState||fabric?.runtime?.rcwa?.state||'NOT STARTED');
 const rcwaOnline=/ONLINE|LIVE/.test(rcwa.toUpperCase());
 const retiredOrigin=String(convergence?.connectorPolicy?.retiredOrigin||'omega-sovereign-convergence.foundasound.chatgpt.site');
 useEffect(()=>{onState?.({online, sealed,bridge:Boolean(bridge),lastSeen,rcwaState:rcwa,rcwaOnline,phase:sealed?4:online?3:bridge?2:1,protocol:currentDevice?.protocol||live?.hybridProtocol||null,agentSha256:currentDevice?.agentSha256||null})},[online,sealed,bridge,lastSeen,rcwa,rcwaOnline,currentDevice?.protocol,currentDevice?.agentSha256,live?.hybridProtocol,onState]);

 const prepareConnector=async(replacePair=false)=>{
  if(busy)return;
  setBusy(true);setMessage(replacePair?'Explicitly replacing the browser pairing after validating the canonical R127 agent…':'Checking the existing pairing first — no silent rotation…');
  try{
   const m=await loadManifest();
   let credential=getHybridBridge(),reused=false,replaced=false;
   if(!replacePair&&credential){
    try{
     await api.post<any>('/api/hybrid/reconnect',{repair:false});
     reused=true;
    }catch(e:any){
     if(e?.status===401||e?.code==='PAIR_AUTH_FAILED')credential=null;
     else throw e;
    }
   }
   if(replacePair||!credential){
    const fresh=await bootstrapSovereignR117();
    credential=getHybridBridge();replaced=true;
    if(!credential?.secret||!credential?.bridgeId)throw new Error('Fresh pairing was returned but the browser could not retain it. Connector creation stopped.');
    if(fresh.agent?.sha256&&String(fresh.agent.sha256).toLowerCase()!==String(m.sha256).toLowerCase())throw new Error('Bootstrap agent receipt changed during connector preparation. Connector creation stopped.');
   }
   if(!credential?.secret||!credential?.bridgeId)throw new Error('No authenticated Hybrid pairing is available.');
   const pairingCode=credential.pairingCode||`${credential.bridgeId}.${credential.secret}`;
   const receipt:SovereignAgentReceiptR127={sha256:m.sha256,version:m.version,protocol:m.protocol};
   setBridge(credential);
   setConnectorUrl(old=>{if(old)URL.revokeObjectURL(old);return launcherBlobUrlR117(pairingCode,receipt)});
   setMessage(reused?`Existing pairing verified and preserved — no credential rotation occurred. Download ${SOVEREIGN_LAUNCHER_FILENAME_R117}; it is pinned to agent ${m.version||'R127'} / ${shortHash(m.sha256)}… and will not execute different bytes.`:replaced?`A replacement pairing was issued only because ${replacePair?'you explicitly requested it':'the prior credential was missing or rejected'}. Download ${SOVEREIGN_LAUNCHER_FILENAME_R117}; no fallback host or unpinned agent is permitted.`:`Connector prepared from the existing browser pairing and exact canonical agent receipt.`);
   window.setTimeout(()=>void refresh(),500);
  }catch(e:any){setMessage(`Connector preparation stopped safely: ${e?.message||String(e)} No fallback, silent rotation, or unvalidated agent was used.`)}finally{setBusy(false)}
 };
 // Explicit replacement remains available, but is deliberately separate from ordinary reconnect.
 const forceFresh=async()=>prepareConnector(true);
 const forget=()=>{clearHybridBridge();setBridge(null);setLive(null);setConnectorUrl(old=>{if(old)URL.revokeObjectURL(old);return null});setMessage('Browser bridge credential removed. Prepare a sealed connector to create a new pairing.');void refresh()};
 const capabilitySummary=useMemo(()=>[
  {label:'Local files & projects',ready:sealed,detail:sealed?'R127 sealed heartbeat + exact agent integrity current':online?'Legacy PC heartbeat is live; update to the sealed connector before new native work':'Current authenticated sealed PC heartbeat required'},
  {label:'Build / test / package',ready:sealed,detail:sealed?'Governed native execution available inside the approved root':online?'Update connector to R127 before relying on native execution':'Current authenticated sealed PC heartbeat required'},
  {label:'Local learning',ready:sealed,detail:sealed?'TRAIN_LOCAL available inside the approved corpus':online?'Update connector to R127 first':'Current authenticated sealed PC heartbeat required'},
  {label:'Full-wave RCWA',ready:sealed&&rcwaOnline,detail:sealed?(rcwaOnline?'Solver heartbeat current':'Hybrid sealed; RCWA dependency/worker not current'):'Seal the PC link first'}
 ],[sealed,online,rcwaOnline]);

 return <section className={'r112-sovereign '+(compact?'compact ':'')+(sealed?'live':online?'prepared':bridge?'prepared':'idle')} aria-label='Connect this PC to OMEGA'>
  <div className='r112-sovereign-main'>
   <div className='r112-sovereign-copy'><span>OMEGA SOVEREIGN LINK · R127 SEALED</span><h3>{sealed?'This PC is connected with sealed proof':online?'This PC is online on inherited Hybrid transport — seal the connector':'Connect without rotating good credentials or accepting mutated agent bytes'}</h3><p>{sealed?'OMEGA is receiving a current authenticated monotonic heartbeat from the exact SHA-256-pinned R127 agent.':online?'The inherited heartbeat is real, but R127 adds exact agent hashing, boot-session binding, replay rejection and root identity. Prepare the sealed connector using the same valid pairing.':'PREPARE SEALED CONNECTION first validates the canonical agent manifest and reuses an existing valid pairing. It rotates only when the credential is missing/rejected. Runtime state stays under J:\\ or another explicitly approved non-system root and never falls back to C:.'}</p></div>
   <div className='r112-sovereign-primary'>
    {!sealed&&!connectorUrl&&<button className='r112-big-action' onClick={()=>void prepareConnector(false)} disabled={busy}>{busy?<RefreshCw className='spin'/>:<ShieldCheck/>}{busy?'Validating without mutation…':online?'PREPARE SEALED R127 CONNECTOR':'PREPARE SEALED CONNECTION'}</button>}
    {!sealed&&connectorUrl&&<a className='r112-big-action' href={connectorUrl} download={SOVEREIGN_LAUNCHER_FILENAME_R117}><Download/>DOWNLOAD SEALED R127 CONNECTOR</a>}
    {!sealed&&connectorUrl&&<button className='r112-advanced-toggle' onClick={()=>void prepareConnector(false)} disabled={busy}><RefreshCw/>Revalidate same pairing</button>}
    {online&&<div className='r112-online-badge'><CheckCircle2/><div><b>{sealed?'PC ONLINE — SEALED':'PC ONLINE — UPDATE RECOMMENDED'}</b><small>{sealed?`${sealedCurrent.length} current sealed heartbeat${sealedCurrent.length===1?'':'s'}`:`${current.length} inherited heartbeat${current.length===1?'':'s'}; no false sealed claim`}</small></div></div>}
    <button className='r112-advanced-toggle' onClick={()=>setAdvanced(v=>!v)}>{advanced?<ChevronUp/>:<ChevronDown/>}{advanced?'Hide proof details':'Connection proof details'}</button>
   </div>
  </div>

  {!sealed&&<div className='r112-three-steps'>
   <article className={!connectorUrl?'active':''}><b>1</b><div><strong>Prepare the sealed connection</strong><span>OMEGAv6 validates the R127 agent manifest first, then reuses the current browser pairing when it still authenticates. The legacy “{R127_LEGACY_FIX_LABEL}” behavior no longer means automatic credential rotation.</span></div><ShieldCheck/></article>
   <article className={connectorUrl?'active':''}><b>2</b><div><strong>Download and open only <code>{SOVEREIGN_LAUNCHER_FILENAME_R117}</code></strong><span>The connector calls only <code>omegav6.jeffdeweyeljefe.workers.dev</code>, writes OMEGA runtime state under the approved non-system root, downloads the current agent, and requires body SHA-256 = server receipt SHA-256 = browser-pinned SHA-256 before execution.</span></div><Download/></article>
   <article><b>3</b><div><strong>Watch for sealed registration + real heartbeat</strong><span>Registration does not create PC ONLINE. The Windows console must receive the first authenticated monotonic heartbeat. Duplicate/stale R127 connector sessions are rejected instead of silently competing.</span></div><Cpu/></article>
  </div>}

  {!sealed&&<div className='r112-sovereign-message'><TriangleAlert/>Do not use launchers that mention <code>{retiredOrigin}</code>. R127 retains the R120 root-safe law ({R120_INHERITED_DOWNLOAD_LABEL}) and never falls back to C:. Close stale connector windows when the new sealed agent takes ownership.</div>}
  {message&&<div className='r112-sovereign-message'>{message}</div>}

  <div className='r112-capabilities'>{capabilitySummary.map(x=><article key={x.label} className={x.ready?'ready':''}>{x.ready?<CheckCircle2/>:<span className='r112-cap-dot'/>}<div><b>{x.label}</b><small>{x.detail}</small></div></article>)}</div>

  {advanced&&<div className='r112-sovereign-advanced'>
   <div className='r112-facts'><div><span>BROWSER BRIDGE</span><b>{bridge?'AVAILABLE':'NONE'}</b></div><div><span>SERVER STATE</span><b>{truth(live?.state||'DEVICE_PROOF_REQUIRED')}</b></div><div><span>SEALED PROOF</span><b>{sealed?'CURRENT':'NOT CURRENT'}</b></div><div><span>LAST PC PROOF</span><b>{lastSeen?age(lastSeen):'none'}</b></div><div><span>AGENT</span><b>{currentDevice?.version||manifest?.version||'unknown'}</b></div><div><span>PROTOCOL</span><b>{currentDevice?.protocol||manifest?.protocol||'unknown'}</b></div><div><span>AGENT SHA</span><b>{shortHash(currentDevice?.agentSha256||manifest?.sha256)}</b></div><div><span>RCWA</span><b>{truth(rcwa)}</b></div></div>
   <p><TriangleAlert/>Pairing issuance, device registration, heartbeat, exact-agent integrity, RCWA health and CanonState admission are separate proofs. R127 will not call any of them equivalent.</p>
   <div className='r112-advanced-actions'><button onClick={()=>void refresh()}><RefreshCw/>Refresh proof</button><button onClick={()=>void prepareConnector(false)} disabled={busy}><ShieldCheck/>Prepare/reuse pairing</button><button onClick={()=>void forceFresh()} disabled={busy}><RotateCcw/>Replace pairing explicitly</button><button onClick={forget}><Trash2/>Forget browser bridge</button></div>
   {bridge?.bridgeId&&<code className='r112-bridge-id'>Bridge {bridge.bridgeId}</code>}
  </div>}
 </section>;
}

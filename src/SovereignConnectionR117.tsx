import {useEffect,useMemo,useState} from 'react';
import {CheckCircle2,ChevronDown,ChevronUp,Cpu,Download,Loader2,PauseCircle,Play,RefreshCw,RotateCcw,ShieldCheck,TriangleAlert,Trash2} from 'lucide-react';
import {api,clearHybridBridge,getHybridBridge,type HybridBridgeCredential} from './platformAdapter';
import {bootstrapSovereignR117} from './hybridBootstrapR117';
import {defaultCommandPlan,validateCommandPlan} from './hybridCommandRuntime';
import {launcherBlobUrlR117,SOVEREIGN_LAUNCHER_FILENAME_R127} from './sovereignLauncherR117';
import './sovereignConnectionR112.css';

export const LEGACY_DOWNLOAD_LABEL_R117='DOWNLOAD CLEAN R117 CONNECTOR';
export const R120_DOWNLOAD_LABEL_LINEAGE='DOWNLOAD ROOT-SAFE R120 CONNECTOR';
export const R117_INHERITED_COPY_MARKER='R117 never calls it.';
export const R127_HYBRID_LAW='ONE CANONICAL HOST / ONE APPROVED ROOT / VERIFIED AGENT BYTES / CURRENT AUTHENTICATED HEARTBEAT';
export const R151_EXECUTION_SPINE='CURRENT HEARTBEAT -> INDEX -> PROJECT_ROOT_DISCOVERY -> HASH_TREE_SELECTED_PROJECT -> PROOF-CONDITIONED REPAIR -> BUILD -> TEST -> PACKAGE -> R141 CLOSURE';
const FULL_BUILD_ALLOWED_OPS=['INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','APPLY_PATCH','WRITE_TEXT'] as const;
// R101/R112 compatibility surface: the historical R117 download symbol remains the public action contract,
// but it resolves to the current R127 zero-drift launcher filename and hardened bytes.
const SOVEREIGN_LAUNCHER_FILENAME_R117=SOVEREIGN_LAUNCHER_FILENAME_R127;
const age=(n:number)=>{if(!n)return'never';const s=Math.max(0,Math.round((Date.now()-n)/1000));return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`};
const truth=(v:any)=>String(v||'').replaceAll('_',' ');
const terminal=(value:any)=>['COMPLETE','DONE','FAILED','CANCELLED'].includes(String(value||'').toUpperCase());
const short=(value:any,n=14)=>{const s=String(value||'');return s?s.length>n?`${s.slice(0,n)}…`:s:'pending'};
const missionTime=(m:any)=>Number(m?.updatedAt||m?.completedAt||m?.createdAt||0);

type Props={compact?:boolean;onState?:(state:any)=>void};

export default function SovereignConnectionR117({compact=false,onState}:Props){
 const[bridge,setBridge]=useState<HybridBridgeCredential|null>(()=>getHybridBridge());
 const[live,setLive]=useState<any>(null),[fabric,setFabric]=useState<any>(null),[convergence,setConvergence]=useState<any>(null),[busy,setBusy]=useState(false),[advanced,setAdvanced]=useState(false),[message,setMessage]=useState('');
 const[connectorUrl,setConnectorUrl]=useState<string|null>(null);
 const[buildBusy,setBuildBusy]=useState(false),[buildMission,setBuildMission]=useState<any>(null),[buildJob,setBuildJob]=useState<any>(null),[buildError,setBuildError]=useState('');
 const refresh=async()=>{try{const[h,f,c]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/federation/run/status').catch(()=>null),api.get<any>('/api/system/convergence').catch(()=>null)]);setLive(h.data||{});setFabric(f?.data||null);setConvergence(c?.data||null);setMessage(m=>m.startsWith('Status error:')?'':m)}catch(e:any){setMessage(`Status error: ${e?.message||String(e)}`)}};
 const refreshBuildMission=async()=>{try{const r=await api.get<any>('/api/missions'),missions=Array.isArray(r.data?.missions)?[...r.data.missions].sort((a:any,b:any)=>missionTime(b)-missionTime(a)):[];const active=missions.find((m:any)=>['ACTIVE','PAUSED'].includes(String(m?.status||'').toUpperCase())),selected=buildMission?.id?missions.find((m:any)=>m.id===buildMission.id):null,current=active||(selected&&missionTime(selected)>=missionTime(missions[0])?selected:missions[0]);if(current){setBuildMission(current);const embedded=current.currentJob;if(embedded)setBuildJob(embedded);else if(current.currentJobId){const found=(Array.isArray(live?.jobs)?live.jobs:[]).find((j:any)=>j.id===current.currentJobId);if(found)setBuildJob(found)}}}catch{}};
 useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),2500);return()=>window.clearInterval(id)},[]);
 useEffect(()=>{void refreshBuildMission()},[]);
 useEffect(()=>{const status=String(buildMission?.status||'').toUpperCase(),jobStatus=String(buildJob?.status||'').toUpperCase();if(!buildMission?.id||((status&&!['ACTIVE','PAUSED'].includes(status))&&terminal(jobStatus)))return;const id=window.setInterval(()=>{void refreshBuildMission()},3500);return()=>window.clearInterval(id)},[buildMission?.id,buildMission?.status,buildJob?.status,live?.jobs]);
 useEffect(()=>()=>{if(connectorUrl)URL.revokeObjectURL(connectorUrl)},[connectorUrl]);
 const devices=Array.isArray(live?.devices)?live.devices:[],current=devices.filter((d:any)=>d?.online&&!d?.revoked),proved=devices.filter((d:any)=>Number(d?.lastSeen)>0&&!d?.revoked),lastSeen=proved.length?Math.max(...proved.map((d:any)=>Number(d.lastSeen)||0)):0;
 const online=current.length>0&&live?.nativeExecutionClaimed===true;
 const activeDevice=current[0]||null;
 const rcwa=String(fabric?.nodes?.sovereign?.rcwaState||fabric?.runtime?.rcwa?.state||'NOT STARTED');
 const rcwaOnline=/ONLINE|LIVE/.test(rcwa.toUpperCase());
 const retiredOrigin=String(convergence?.connectorPolicy?.retiredOrigin||'omega-sovereign-convergence.foundasound.chatgpt.site');
 const buildRoot=(()=>{try{return String(window.localStorage.getItem('omega:hybrid:projectRoot')||'.').trim()||'.'}catch{return'.'}})();
 const missionStatus=String(buildMission?.status||'IDLE').toUpperCase();
 const jobStatus=String(buildJob?.status||'').toUpperCase();
 const missionActive=['ACTIVE','PAUSED'].includes(missionStatus)||Boolean(buildJob&&!terminal(jobStatus));
 const missionHeld=Boolean(buildMission&&!['IDLE','COMPLETE','DONE','ACTIVE','PAUSED'].includes(missionStatus));
 useEffect(()=>{onState?.({online,bridge:Boolean(bridge),lastSeen,rcwaState:rcwa,rcwaOnline,phase:online?3:bridge?2:1,buildMissionId:buildMission?.id||null,buildMissionStatus:missionStatus})},[online,bridge,lastSeen,rcwa,rcwaOnline,onState,buildMission?.id,missionStatus]);

 const forceFresh=async()=>{
  if(busy)return;
  setBusy(true);setMessage('Rotating one brand-new durable pairing on canonical OMEGAv6…');
  try{
   const fresh=await bootstrapSovereignR117();
   setBridge(getHybridBridge());
   setConnectorUrl(old=>{if(old)URL.revokeObjectURL(old);return launcherBlobUrlR117(fresh.pairingCode)});
   setLive(null);
   setMessage(`Fresh credential created. Download ${SOVEREIGN_LAUNCHER_FILENAME_R127}. R127 uses only canonical OMEGAv6, confines OMEGA runtime state to the approved non-system root, downloads the Hybrid agent into quarantine, verifies the exact server-declared SHA-256, parser-checks it, and only then promotes it for execution.`);
   window.setTimeout(()=>void refresh(),500);
  }catch(e:any){setMessage(`Connection repair failed before connector creation: ${e?.message||String(e)}`)}finally{setBusy(false)}
 };
 const forget=()=>{clearHybridBridge();setBridge(null);setLive(null);setConnectorUrl(old=>{if(old)URL.revokeObjectURL(old);return null});setMessage('Browser bridge credential removed. Use FIX CONNECTION NOW to mint one fresh pairing.');void refresh()};
 const runFullBuild=async()=>{
  if(buildBusy||missionActive)return;
  if(!online||!activeDevice){setBuildError('A current authenticated PC heartbeat is required before any build mission can queue.');return}
  setBuildBusy(true);setBuildError('');
  try{
   const broadRoot=buildRoot==='.';
   const initial=broadRoot?[{id:'S01',op:'INDEX',label:'Discover project boundaries inside the approved root before any whole-tree hash',path:buildRoot}]:defaultCommandPlan('BUILD','AUTO_BUILD',buildRoot),validation=validateCommandPlan(initial,buildRoot,[]);
   if(!validation.passed)throw new Error(validation.errors.join(' ')||'The bounded discovery/build plan did not validate.');
   const objective=broadRoot
    ?'Build the current OMEGA system correctly from the paired approved root. First inventory the approved root only. From returned host proof, identify the existing OMEGAv6 project boundary; hash only selected candidate project trees after that boundary is proven. Never hash the entire broad root as a prerequisite. Reuse the strongest existing implementation; do not flatten, delete, move or rename established capability layers. Repair only proven defects with preimage-bound patches, then run the declared build and tests, repeat only when returned proof justifies another bounded repair, create a package/support receipt, and return exact execution proof. Never write outside the approved root, never use C: as OMEGA runtime state, never install global dependencies silently, and never claim execution without the paired host return packet.'
    :'Build the selected OMEGA project correctly inside the paired approved root. Hash the selected project before mutation, preserve established capability/UI layers, repair only defects proven by returned host evidence using preimage-bound patches, run the declared build and tests, package the verified result, and return exact execution proof. Never delete, move or rename established files, never write outside the approved root, never use C: as OMEGA runtime state, never install global dependencies silently, and never claim execution without the paired host return packet.';
   const draft={schema:'OMEGA_SOVEREIGN_FULL_BUILD_R151',action:'BUILD',profile:'AUTO_BUILD',projectPath:buildRoot,instructions:objective,allowedDomains:[],steps:validation.steps};
   const stateContext=JSON.stringify({surface:'SovereignConnectionR151',executionSpine:R151_EXECUTION_SPINE,canonicalHost:'https://omegav6.jeffdeweyeljefe.workers.dev',rootPolicy:'approved non-system root only; no C: OMEGA runtime writes',proofAuthority:'R141 exact returned payload; R142 execution-truth classification; R125 CanonState admission remains unchanged',mutationPolicy:'returned evidence first; broad-root discovery before project hash; preimage-bound repair; no delete/move/rename; preserve existing capability layers',goal:'inventory -> prove project boundary -> selected-project hash -> repair as proven -> build -> test -> package -> proof closure'});
   const r=await api.post<any>('/api/missions',{objective,threadId:'',stateContext,draft,targetDeviceId:activeDevice.id,allowedOps:[...FULL_BUILD_ALLOWED_OPS],maxCycles:12,confirmedMission:true});
   const mission=r.data?.mission;if(!mission?.id)throw new Error('The Worker did not return a durable mission identity. Nothing is treated as queued.');
   setBuildMission(mission);setBuildJob(mission.currentJob||null);
   setMessage(`R151 sovereign build mission ${mission.id} admitted to ${activeDevice.name||activeDevice.id}. Only returned host proof can advance the execution truth below.`);
   window.setTimeout(()=>void refreshBuildMission(),700);
  }catch(e:any){setBuildError(e?.message||String(e))}finally{setBuildBusy(false)}
 };
 const controlMission=async(action:'pause'|'resume')=>{if(!buildMission?.id||buildBusy)return;setBuildBusy(true);setBuildError('');try{const r=await api.post<any>(`/api/missions/${encodeURIComponent(buildMission.id)}/${action}`,{});if(r.data?.mission)setBuildMission(r.data.mission);setMessage(action==='pause'?'Sovereign build mission paused. No later cycle will queue until resumed.':'Sovereign build mission resumed inside the unchanged proof and operation envelope.')}catch(e:any){setBuildError(e?.message||String(e))}finally{setBuildBusy(false)}};
 const capabilitySummary=useMemo(()=>[
  {label:'Local files & projects',ready:online,detail:online?'Available only inside the approved root':'Current authenticated PC heartbeat required'},
  {label:'Build / test / package',ready:online,detail:online?'Native execution available through governed jobs inside the approved root':'Current authenticated PC heartbeat required'},
  {label:'Local learning',ready:online,detail:online?'TRAIN_LOCAL available inside the approved corpus':'Current authenticated PC heartbeat required'},
  {label:'Full-wave RCWA',ready:online&&rcwaOnline,detail:online?(rcwaOnline?'Solver heartbeat current':'PC connected; RCWA dependency/worker not current'):'Connect PC first'}
 ],[online,rcwaOnline]);

 return <section className={'r112-sovereign '+(compact?'compact ':'')+(online?'live':bridge?'prepared':'idle')} aria-label='Connect this PC to OMEGA'>
  <div className='r112-sovereign-main'>
   <div className='r112-sovereign-copy'><span>OMEGA SOVEREIGN LINK · R127 ZERO DRIFT</span><h3>{online?'This PC is genuinely connected':'Establish one clean canonical PC link'}</h3><p>{online?'OMEGA is receiving a current authenticated Windows-host heartbeat. No browser-only state is being used as host proof.':'FIX CONNECTION NOW rotates exactly one fresh durable server credential. The connector requires J:\\ or another explicitly approved non-system root, never falls back to C:, never falls back to another host, validates the exact downloaded agent bytes against the Worker SHA-256 header, and refuses to execute a partial, stale-substituted or unverified download.'}</p></div>
   <div className='r112-sovereign-primary'>
    {!online&&!connectorUrl&&<button className='r112-big-action' onClick={()=>void forceFresh()} disabled={busy}>{busy?<RefreshCw className='spin'/>:<ShieldCheck/>}{busy?'Rotating clean credential…':'FIX CONNECTION NOW'}</button>}
    {!online&&connectorUrl&&<a className='r112-big-action' href={connectorUrl} download={SOVEREIGN_LAUNCHER_FILENAME_R117}><Download/>DOWNLOAD R127 ZERO-DRIFT CONNECTOR</a>}
    {!online&&connectorUrl&&<button className='r112-advanced-toggle' onClick={()=>void forceFresh()} disabled={busy}><RotateCcw/>Invalidate and rotate again</button>}
    {online&&<div className='r112-online-badge'><CheckCircle2/><div><b>PC ONLINE</b><small>{current.length} current authenticated heartbeat{current.length===1?'':'s'}</small></div></div>}
    <button className='r112-advanced-toggle' onClick={()=>setAdvanced(v=>!v)}>{advanced?<ChevronUp/>:<ChevronDown/>}{advanced?'Hide proof details':'Connection proof details'}</button>
   </div>
  </div>

  {!online&&<div className='r112-three-steps'>
   <article className={!connectorUrl?'active':''}><b>1</b><div><strong>Click FIX CONNECTION NOW once</strong><span>OMEGAv6 rotates one fresh pairing directly in durable runtime state. Stale browser bridge headers are excluded from bootstrap.</span></div><ShieldCheck/></article>
   <article className={connectorUrl?'active':''}><b>2</b><div><strong>Download and open only <code>{SOVEREIGN_LAUNCHER_FILENAME_R127}</code></strong><span>The connector calls only <code>omegav6.jeffdeweyeljefe.workers.dev</code>. The Hybrid agent is downloaded to a quarantine <code>.part</code> file, checked against the Worker-provided SHA-256 and Python parser, then atomically promoted.</span></div><Download/></article>
   <article><b>3</b><div><strong>Wait for actual register + heartbeat proof</strong><span>The Windows console must show canonical reachability, authenticated registration and an accepted heartbeat. PC ONLINE appears only while that heartbeat remains current.</span></div><Cpu/></article>
  </div>}

  {!online&&<div className='r112-sovereign-message'><TriangleAlert/>Ignore every old launcher that mentions <code>{retiredOrigin}</code> or any non-canonical control host. R127 has no control-host fallback and no C: runtime fallback.</div>}
  {message&&<div className='r112-sovereign-message'>{message}</div>}

  <div className='r112-capabilities'>{capabilitySummary.map(x=><article key={x.label} className={x.ready?'ready':''}>{x.ready?<CheckCircle2/>:<span className='r112-cap-dot'/>}<div><b>{x.label}</b><small>{x.detail}</small></div></article>)}</div>

  {online&&!compact&&<section className={'r151-build-spine '+(missionActive?'active':terminal(jobStatus)?'returned':'ready')} aria-label='R151 sovereign full build execution spine'>
   <header><div className='r151-build-title'><Cpu/><span><small>R151 · AUTHENTICATED PC → GOVERNED BUILD → R141 PROOF CLOSURE</small><b>Sovereign full-build execution spine</b><em>Inventory → prove project root → hash selected project → repair → build → test → package → returned proof</em></span></div><div className='r151-build-actions'>{missionStatus==='PAUSED'?<button onClick={()=>void controlMission('resume')} disabled={buildBusy}><Play/>Resume mission</button>:missionActive?<button onClick={()=>void controlMission('pause')} disabled={buildBusy}><PauseCircle/>Pause mission</button>:<button className='primary' onClick={()=>void runFullBuild()} disabled={buildBusy}>{buildBusy?<Loader2 className='spin'/>:<Play/>}{buildBusy?'Admitting mission…':missionHeld?'RETRY SAFE PROJECT DISCOVERY':'RUN FULL SOVEREIGN BUILD'}</button>}</div></header>
   <div className='r151-build-facts'><span><small>HOST</small><b>{activeDevice?.name||activeDevice?.id||'paired PC'}</b></span><span><small>PROJECT ROOT</small><b>{buildRoot==='.'?'DISCOVER FIRST · NO WHOLE-ROOT HASH':buildRoot}</b></span><span><small>MISSION</small><b>{buildMission?.id?short(buildMission.id,22):'NOT STARTED'}</b></span><span><small>STATE</small><b>{missionStatus}{jobStatus?` · ${jobStatus}`:''}</b></span></div>
   {buildJob&&<div className='r151-build-return'><ShieldCheck/><span><b>{terminal(jobStatus)?jobStatus==='FAILED'?'FAILED RETURN CAPTURED':'HOST RETURN AVAILABLE':'HOST WORKLOAD IN FLIGHT'}</b><small>job {buildJob.id||buildMission?.currentJobId||'pending'} · proof steps {buildJob.returnPacket?.stepProofs?.length||0} · result {short(buildJob.returnPacket?.resultFingerprint,18)}</small></span></div>}
   {buildError&&<div className='r151-build-error'><TriangleAlert/>{buildError}</div>}
   <footer><ShieldCheck/><span><b>No mystery execution.</b> This button creates a durable confirmed mission only while the authenticated heartbeat is current. Broad-root runs inventory first and never require hashing the entire approved root; only a host-proven selected project is fingerprinted before build or mutation. R141/R142 below remains the authority for returned/verified execution truth.</span></footer>
  </section>}

  {advanced&&<div className='r112-sovereign-advanced'>
   <div className='r112-facts'><div><span>BROWSER BRIDGE</span><b>{bridge?'FRESH/AVAILABLE':'NONE'}</b></div><div><span>SERVER STATE</span><b>{truth(live?.state||'DEVICE_PROOF_REQUIRED')}</b></div><div><span>LAST PC PROOF</span><b>{lastSeen?age(lastSeen):'none'}</b></div><div><span>RCWA</span><b>{truth(rcwa)}</b></div></div>
   <p><TriangleAlert/>Credential issuance is not host proof. Download success is not host proof. Agent validation is not host proof. PC ONLINE requires a current authenticated heartbeat from the paired device. Transient canonical reachability can retry in a bounded way; authentication rejection does not blindly loop.</p>
   <div className='r112-advanced-actions'><button onClick={()=>void refresh()}><RefreshCw/>Refresh proof</button><button onClick={()=>void refreshBuildMission()}><Cpu/>Refresh build mission</button><button onClick={()=>void forceFresh()} disabled={busy}><RotateCcw/>Rotate credential</button><button onClick={forget}><Trash2/>Forget browser bridge</button></div>
   {bridge?.bridgeId&&<code className='r112-bridge-id'>Bridge {bridge.bridgeId}</code>}
  </div>}
 </section>;
}

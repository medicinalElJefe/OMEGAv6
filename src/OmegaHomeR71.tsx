import {useEffect,useMemo,useState} from 'react';
import {Activity,ArrowRight,Blocks,BrainCircuit,Command,Earth,Eye,Link2,Search,Send,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {api,localState} from './platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {unifiedFromRecord} from './unifiedCalculus';
import {calculusVisualLaw,operatorColor,type OperatorColorRole} from './calculusVisualLawR37';
import {CanonicalPacketTruthPlotR93} from './TruthVisualsR93';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import {compileFullOverallModePlanR79,compactModePlanR79} from './fullOverallModeOrchestratorR79';
import {OMEGA_ALL_ROUTES_R82,OMEGA_FIELD_PROJECTIONS_R82,OMEGA_WORKSPACES_R82,projectionForR82,type OmegaFieldProjectionR82,type OmegaWorkspaceIdR82} from './omegaExperienceRegistryR82';
import OmegaSystemInventoryR83 from './OmegaSystemInventoryR83';
import OmegaSideNavigatorR88 from './OmegaSideNavigatorR88';
import {CANON_AUTHORITY_COUNT} from './allModesAuthority';
import OmegaIntentWorkbenchR85 from './OmegaIntentWorkbenchR85';
import './omegaHomeR71.css';

type Props={onEnter:(panel:string)=>void};
type DomainId=OmegaWorkspaceIdR82;
type FieldMode=OmegaFieldProjectionR82;
const ROLES:OperatorColorRole[]=['ALPHA','BASE','CONSTRUCT','PRUNE','OMEGA'];
const ROLE_COPY:Record<OperatorColorRole,string>={
 ALPHA:'seed possibility / phase opening',
 BASE:'substrate evidence / continuity anchor',
 CONSTRUCT:'expansion / admitted growth',
 PRUNE:'inversion / contradiction reduction',
 OMEGA:'integration / coherent closure'
};
const QUICK=[['Earth','Earth Now',Earth],['Hybrid','Hybrid Link',Link2],['SAI','SAI Lab',BrainCircuit],['Proof','Evidence & Proof',ShieldCheck],['Visual','Visual Instrument',Eye],['Command','Command Center',Command]] as const;
const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
const fmt=(n:any)=>Number.isFinite(Number(n))?Number(n).toFixed(3):'—';
function forwardRoute(start:number,steps=20){const out:number[]=[];let a=clamp(start);for(let i=0;i<steps;i++){out.push(a);const next=corpusState(a).autoPing?.dataNext;a=Number.isFinite(next)?clamp(Number(next)):a}return [...new Set(out)]}

export default function OmegaHomeR71({onEnter}:Props){
 const[address,setAddress]=useState(()=>clamp(Number(localState.read('omega.v6.address',11498))));
 const[ready,setReady]=useState(false),[domain,setDomain]=useState<DomainId>(()=>{try{const x=localStorage.getItem('omega.r82.workspace') as DomainId|null;return x&&OMEGA_WORKSPACES_R82.some(w=>w.id===x)?x:'EXPLORE'}catch{return'EXPLORE'}}),[query,setQuery]=useState(''),[showApps,setShowApps]=useState(false),[browserLayer,setBrowserLayer]=useState<'APPLICATIONS'|'SOFTWARE'>('APPLICATIONS');
 const[mode,setMode]=useState<FieldMode>(()=>{try{const x=localStorage.getItem('omega.r82.homeProjection') as FieldMode|null;return x&&OMEGA_FIELD_PROJECTIONS_R82.some(m=>m.id===x)?x:'FIELD'}catch{return'FIELD'}}),[selectedRole,setSelectedRole]=useState<OperatorColorRole>('OMEGA');
 const[prompt,setPrompt]=useState(()=>localState.read('omega.b015.chatDraft.v1','')),[reply,setReply]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState<any>(null),[hybrid,setHybrid]=useState<any>(null);
 const[showSystemMap,setShowSystemMap]=useState(()=>{try{const saved=localStorage.getItem('omega.r88.systemMapOpen');if(saved!==null)return saved==='true';return false}catch{return true}});
 useEffect(()=>{let live=true;initCorpusPack().then(()=>live&&setReady(true)).catch(()=>live&&setReady(false));return()=>{live=false}},[]);
 useEffect(()=>{localState.write('omega.v6.address',address)},[address]);
 useEffect(()=>{try{localStorage.setItem('omega.r82.workspace',domain)}catch{}},[domain]);
 useEffect(()=>{try{localStorage.setItem('omega.r82.homeProjection',mode)}catch{}},[mode]);
 useEffect(()=>{localState.write('omega.b015.chatDraft.v1',prompt)},[prompt]);
 useEffect(()=>{try{localStorage.setItem('omega.r88.systemMapOpen',String(showSystemMap))}catch{}},[showSystemMap]);
 useEffect(()=>{if(!showApps)return;const prior=document.body.style.overflow;document.body.style.overflow='hidden';const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setShowApps(false)};window.addEventListener('keydown',key);return()=>{document.body.style.overflow=prior;window.removeEventListener('keydown',key)}},[showApps]);
 useEffect(()=>{let live=true;const load=async()=>{try{const[s,h]=await Promise.all([api.get<any>('/api/status'),api.get<any>('/api/hybrid/status')]);if(live){setStatus(s.data||null);setHybrid(h.data||null)}}catch{if(live){setStatus(null);setHybrid(null)}}};void load();const id=window.setInterval(load,30000);return()=>{live=false;window.clearInterval(id)}},[]);
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const coords=useMemo(()=>decodeAddress(address),[address]);
 const modes=useMemo(()=>record?sourceBackedModeSummary(record):null,[record]);
 const unified=useMemo(()=>record?unifiedFromRecord(record):null,[record]);
 const law=useMemo(()=>record?calculusVisualLaw(record):null,[record]);
 const projection=projectionForR82(mode),modePanel=projection.panel;
 const modePlan=useMemo(()=>record?compileFullOverallModePlanR79(record,modePanel,prompt):null,[record,modePanel,prompt]);
 const route=useMemo(()=>ready?forwardRoute(address,24):[],[ready,address]);
 const nextAddress=record?clamp(Number(record.autoPing?.dataNext??address)):address;
 const allRoutes=useMemo(()=>[...OMEGA_ALL_ROUTES_R82],[]),activeWorkspace=OMEGA_WORKSPACES_R82.find(x=>x.id===domain)||OMEGA_WORKSPACES_R82[0];
 const visibleRoutes=useMemo(()=>{const q=query.trim().toLowerCase();if(q)return allRoutes.filter(x=>x.toLowerCase().includes(q));return [...activeWorkspace.routes]},[query,activeWorkspace,allRoutes]);
 const enter=(panel:string)=>{if(!allRoutes.includes(panel))return;setShowApps(false);localState.write('omega.v6.panel',panel);localState.write('omega.v6.modePolicy','SOURCE_BACKED');onEnter(panel)};
 const openApplications=(workspace:DomainId=domain)=>{setDomain(workspace);setQuery('');setBrowserLayer('APPLICATIONS');window.dispatchEvent(new CustomEvent('omega-r88-open-navigator',{detail:{layer:'APPLICATIONS'}}))};
 const openSoftware=()=>{setQuery('');setBrowserLayer('SOFTWARE');window.dispatchEvent(new CustomEvent('omega-r88-open-navigator',{detail:{layer:'SOFTWARE'}}))};
 const targetRole=(role:OperatorColorRole)=>{if(!ready||!route.length)return;let best=address,bestWeight=-1;for(const a of route){const candidate=corpusState(a);const w=calculusVisualLaw(candidate).operatorWeights[role];if(w>bestWeight){bestWeight=w;best=a}}setSelectedRole(role);setAddress(best)};
 const ask=async()=>{if(!record||!modes||!modePlan||!prompt.trim()||busy)return;setBusy(true);setReply('');try{const context={address,stateId:record.stateId,coords,decision:record.metrics.decision,metrics:record.metrics,nextAddress,modePolicy:'SOURCE_BACKED_ALL_AVAILABLE',appliedModeCount:modes.appliedCount,gatedModeCount:modes.gatedCount,fullOverallModePlan:compactModePlanR79(modePlan),unified:{coherence:unified?.unifiedCoherence,motionRelativity:unified?.motionRelativity},responseContract:{plainLanguageFirst:true,showRouteBeforeGeneration:true,doNotInventMissingEvidence:true,preserveTruthBoundary:true}};await api.post('/api/route-preview',{text:prompt,context});const r=await api.post<any>('/api/chat',{text:prompt,context});setReply(String(r.data?.reply||'No response returned.'))}catch(e:any){setReply(e?.message||'No answer fabricated; provider/runtime path failed.')}finally{setBusy(false)}};
 const nativeOnline=Boolean(hybrid?.nativeExecutionClaimed===true&&(hybrid?.authenticatedHeartbeat===true||hybrid?.heartbeatAuthenticated===true||String(hybrid?.connectionState||hybrid?.state||'').toUpperCase()==='PC ONLINE'));
 const hybridLabel=nativeOnline?'PC ONLINE':hybrid?.browserCredentialReady||hybrid?.paired?'BROWSER CREDENTIAL READY · PC UNPROVEN':'PC NOT PROVEN ONLINE';
 return <main className='r71-home' data-color-authority='ALPHA BASE CONSTRUCT PRUNE OMEGA'>
  <OmegaSideNavigatorR88 onNavigate={enter}/>
  <header className='r71-topbar'>
   <button className='r71-brand' onClick={()=>{setDomain('EXPLORE');setShowApps(false)}}><span className='r71-mark'/><span><b>OMEGA</b><small>{RUNTIME_IDENTITY.hostedBuild}</small></span></button>
   <nav className='r71-domains' aria-label='Application workspaces'>{OMEGA_WORKSPACES_R82.map(w=><button key={w.id} className={domain===w.id?'active':''} data-role={w.role} onClick={()=>openApplications(w.id)}><i style={{background:law?operatorColor(law,w.role,.95):undefined}}/><span>{w.label}</span></button>)}</nav>
   <button className='r71-apps-toggle' onClick={()=>showApps?setShowApps(false):openApplications()} aria-expanded={showApps}><Search/><span>Browse OMEGA</span></button>
  </header>

  {showApps&&<section className='r71-app-drawer' role='dialog' aria-modal='true' aria-label='OMEGA system browser'>
   <div className='r71-drawer-head'><div><span>OMEGA SYSTEM BROWSER</span><b>{browserLayer==='APPLICATIONS'?activeWorkspace.label:'Complete Software System'}</b><small>{browserLayer==='APPLICATIONS'?'44 organized application routes':'systems · runtime families · host lineage · menus · capabilities · archives · V77'}</small></div><button onClick={()=>setShowApps(false)}>Close</button></div>
   <nav className='r84-home-browser-layers'><button className={browserLayer==='APPLICATIONS'?'active':''} onClick={()=>setBrowserLayer('APPLICATIONS')}>APPLICATIONS <b>44</b></button><button className={browserLayer==='SOFTWARE'?'active':''} onClick={()=>setBrowserLayer('SOFTWARE')}>SOFTWARE SYSTEM <b>100+</b></button></nav>
   {browserLayer==='APPLICATIONS'?<>
    <nav className='r84-home-browser-workspaces' aria-label='Browse application workspaces'>{OMEGA_WORKSPACES_R82.map(w=><button key={w.id} className={domain===w.id?'active':''} onClick={()=>{setDomain(w.id);setQuery('')}}><span>{w.label}</span><small>{w.routes.length} apps</small></button>)}</nav>
    <label className='r84-home-browser-search'><Search/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search all 44 OMEGA applications'/></label>
    <div className='r71-drawer-context'><b>{query?'ALL OMEGA':activeWorkspace.label}</b><span>{query?`${visibleRoutes.length} matching applications`:`${activeWorkspace.copy} · ${activeWorkspace.routes.length} applications`}</span></div>
    <div className='r71-route-grid'>{visibleRoutes.map(panel=><button key={panel} onClick={()=>enter(panel)}><span>{panel}</span><ArrowRight/></button>)}</div>
   </>:<OmegaSystemInventoryR83 compact onNavigate={enter}/>} 
  </section>}

  <section className='r84-home-launchpad' aria-label='OMEGA main navigation'>
   <header><div><span>MAIN NAVIGATION</span><b>Everything stays reachable from here.</b></div><div><button onClick={()=>openApplications()}><Search/>All 44 applications</button><button onClick={openSoftware}><Blocks/>Complete software system</button></div></header>
   <div>{OMEGA_WORKSPACES_R82.map(w=><button key={w.id} className={domain===w.id?'active':''} onClick={()=>openApplications(w.id)} style={{'--workspace-color':law?operatorColor(law,w.role,.95):undefined} as React.CSSProperties}><i/><span><b>{w.label}</b><small>{w.copy}</small></span><strong>{w.routes.length}<small>apps</small></strong></button>)}</div>
  </section>
  {record&&<OmegaIntentWorkbenchR85 record={record} address={address} currentPanel='Home' onAddress={setAddress} onNavigate={enter}/>} 

  <section className='r71-workspace'>
   <section className='r71-field-panel'>
    <div className='r71-field-toolbar'>
     <div><span>ACTIVE COMPUTATION</span><b>{record?`State ${record.stateId.toLocaleString()}`:'Materializing corpus…'}</b><small>{record?`${record.metrics.decision} · D${coords.d+1} P${coords.p+1} R${coords.r+1} L${coords.l+1}`:'source-backed canonical packet'}</small></div>
     <div className='r71-modes'>{OMEGA_FIELD_PROJECTIONS_R82.map(m=><button key={m.id} className={mode===m.id?'active':''} data-signature={m.signature} title={`${m.label} · ${m.intent}`} onClick={()=>setMode(m.id)}><b>{m.label}</b><small>{m.signature}</small></button>)}</div>
    </div>
    <div className='r71-projection-note'><b>{projection.label}</b><span>{projection.intent}</span><small>Selected analysis lens · primary Home display remains direct canonical data</small><button onClick={()=>enter(projection.panel)}>Open {projection.panel}</button></div>
    <div className='r71-field'>{record?<CanonicalPacketTruthPlotR93 record={record} title={`Home canonical packet · ${projection.label} selected`}/>:<div className='r71-loading'><Activity/><b>Loading canonical packet</b></div>}</div>
    <div className='r71-traverse'>
     <button onClick={()=>setAddress(clamp(address-1))}>− STATE</button>
     <input aria-label='Canonical atlas address' type='range' min='0' max='20735' value={address} onChange={e=>setAddress(clamp(Number(e.target.value)))}/>
     <button onClick={()=>setAddress(nextAddress)}><Waypoints/> ADMITTED NEXT</button>
    </div>
   </section>

   <aside className='r71-control-panel'>
    <section className='r71-operator-console'>
     <header><div><span>COLOR RELATIVITY</span><h1>Operator console</h1></div><Sparkles/></header>
     <p>Choose an operator to move to the strongest matching state on the current admitted route. Color encodes function, not decoration.</p>
     <div className='r71-role-buttons'>{ROLES.map(role=>{const weight=law?.operatorWeights?.[role]??0;return <button key={role} className={selectedRole===role?'active':''} onClick={()=>targetRole(role)} style={{'--role-color':law?operatorColor(law,role,.95):undefined} as React.CSSProperties}><i/><span><b>{role}</b><small>{ROLE_COPY[role]}</small></span><strong>{Number(weight).toFixed(2)}</strong></button>})}</div>
    </section>

    {record&&<section className='r71-metrics'><div><span>CΩ</span><b>{fmt(record.metrics.continuity)}</b></div><div><span>Φ</span><b>{fmt(record.metrics.plasticity)}</b></div><div><span>q</span><b>{fmt(record.metrics.contradiction)}</b></div><div><span>Λ</span><b>{fmt(record.metrics.burden)}</b></div><div><span>COHERENCE</span><b>{fmt(unified?.unifiedCoherence)}</b></div><div><span>MODES</span><b>{modes?.appliedCount??0}</b><small>{modes?.gatedCount??0} gated</small></div></section>}

    <section className='r71-actions'><header><span>DIRECT APPLICATIONS</span><small>No icon-only ambiguity.</small></header><div>{QUICK.map(([label,panel,I])=><button key={panel} onClick={()=>enter(panel)}><I/><span><b>{label}</b><small>{panel}</small></span><ArrowRight/></button>)}</div></section>
   </aside>
  </section>

  <section className='r83-home-system-map'>
   <header><div><Blocks/><span><b>COMPLETE SOFTWARE SYSTEM MAP</b><small>44 application routes · 100 system rows · 24 runtime families · 179 source modes · 57 local-host rows · 1,728 auto-ping cells · {CANON_AUTHORITY_COUNT} canon lenses · 24 V77 bins</small></span></div><div><button onClick={openSoftware}>Browse software <ArrowRight/></button><button onClick={()=>enter('System Atlas')}>System Atlas <ArrowRight/></button><button onClick={()=>setShowSystemMap(v=>!v)} aria-expanded={showSystemMap}>{showSystemMap?'Hide embedded index':'Show embedded index'}</button></div></header>
   {showSystemMap&&<OmegaSystemInventoryR83 compact onNavigate={enter}/>}
  </section>

  <section className='r71-command'>
   <div className='r71-command-copy'><span>SOURCE-BACKED ASSISTANT</span><h2>Route first. Generate second.</h2><p>The active state, applied/gated modes, next admitted state and unified calculus are attached to the request before synthesis.</p></div>
   <div className='r71-command-input'><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask()}}} placeholder='Ask OMEGA to explain, forecast, inspect, traverse, build or prove from this state…'/><button onClick={()=>void ask()} disabled={!record||busy||!prompt.trim()}><Send/><span>{busy?'RUNNING':'RUN OMEGA'}</span></button>{reply&&<div className='r71-reply'>{reply}</div>}</div>
  </section>

  <footer className='r71-truthbar'><span className={status?'ok':'warn'}><Activity/>WORKER {status?'RESPONDING':'UNVERIFIED'}</span><span className={nativeOnline?'ok':'warn'}><Link2/>{hybridLabel}</span><span><ShieldCheck/>Representation shells are model/interface coordinates, not claims of physical dimensions.</span></footer>
 </main>
}

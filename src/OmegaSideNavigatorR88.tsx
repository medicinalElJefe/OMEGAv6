import {useEffect,useMemo,useState} from 'react';
import {Activity,ChevronLeft,ChevronRight,Home,Layers3,Link2,Menu,Orbit,Search,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL} from './capabilityAuthority';
import {effectiveCapabilityReality} from './operationalCapabilityRuntimeR45';
import {omegaNavItem} from './navigationRegistry';
import {adaptiveMissionFor,adaptiveNextRoutes,missionProgress,rankMissionStacksForIntent,rankRoutesForIntent,R156_MISSION_STACKS} from './adaptiveNavigationR156';
import {useLiveNavigationR156} from './liveNavigationR156';
import {OMEGA_ALL_ROUTES_R82,OMEGA_ROUTE_INVENTORY_R107,OMEGA_WORKSPACES_R82,workspaceForRouteR82,type OmegaWorkspaceIdR82} from './omegaExperienceRegistryR82';
import {auditAuthoritativeOperationChainR143,operationContractForRouteR143} from './authoritativeOperationChainR143';
import {organizationForRouteR132,organizedRoutesR132,OMEGA_EXPERIENCE_LAWS_R132} from './experienceOrganizationR132';
import {auditWholeInstrumentConvergenceR158,convergenceContractForRouteR158} from './wholeInstrumentConvergenceR158';
import OmegaSystemInventoryR83 from './OmegaSystemInventoryR83';
import RouteOutputRibbonR111 from './RouteOutputRibbonR111';
import './omegaSideNavigatorR88.css';
import './omegaSideNavigatorR100.css';
import './extremeLayerIntegrityR104.css';
import './dataTruthNavigationR105.css';
import './omegaSideNavigatorR120.css';
import './wholeSystemExperienceR132.css';
import './omegaSideNavigatorR156.css';
import './wholeInstrumentConvergenceR158.css';

type BrowserLayer='EVERYWHERE'|'SOFTWARE';
type WorkspaceFilter='ALL'|OmegaWorkspaceIdR82;
type Props={currentPanel?:string;onNavigate:(panel:string)=>void;onHome?:()=>void;modeCount?:number;modePolicy?:string;busy?:string;record?:any};

export const R88_ALL_ROUTES=OMEGA_ALL_ROUTES_R82;
const routeMark=(name:string)=>{const words=name.split(/\s+/).filter(Boolean);return words.map((x,i)=>i<2?x[0]:'').join('').toUpperCase()||'Ω'};
const validWorkspace=(value:any):value is OmegaWorkspaceIdR82=>OMEGA_WORKSPACES_R82.some(w=>w.id===value);
const storedWorkspace=():WorkspaceFilter=>{try{const value=localStorage.getItem('omega.r82.workspace');return validWorkspace(value)?value:'ALL'}catch{return'ALL'}};
const storedRailWide=()=>{try{return localStorage.getItem('omega.r120.navWide')==='true'}catch{return false}};
const take=<T,>(items:T[],limit:number)=>items.filter((_,i)=>i<limit);
const storedRoutes=(key:string,limit:number)=>{try{const parsed=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(parsed)?take(parsed.filter(x=>typeof x==='string'&&OMEGA_ALL_ROUTES_R82.includes(x as any)).filter((x,i,a)=>a.indexOf(x)===i),limit):[]}catch{return[]}};
const short=(value:string,n=74)=>value.length>n?`${value.substring(0,n)}…`:value;
const terminal=(value:string)=>['COMPLETE','DONE','FAILED','CANCELLED','REJECTED','STALE'].includes(String(value||'').toUpperCase());
const effectLabel=(effect?:string)=>effect==='BUILD'?'BUILD':effect==='COMPUTE'?'COMPUTE':effect==='GOVERN'?'GOVERN':effect==='EXTERNAL_GATE'?'CONNECTED':'INSPECT';
const authorityLabel=(authority?:string)=>authority==='HOST_GATED'?'PC PROOF':authority==='EVIDENCE_GATED'?'SOURCE PROOF':authority==='GOVERNANCE'?'GOVERNED':authority==='DERIVED'?'DERIVED':'CANONICAL';

export default function OmegaSideNavigatorR88({currentPanel='',onNavigate,onHome,modeCount=0,modePolicy='SOURCE_BACKED',busy=''}:Props){
 const[expanded,setExpanded]=useState(false),[railWide,setRailWide]=useState(storedRailWide),[layer,setLayer]=useState<BrowserLayer>('EVERYWHERE'),[query,setQuery]=useState(''),[workspaceFilter,setWorkspaceFilter]=useState<WorkspaceFilter>('ALL'),[pinned,setPinned]=useState<string[]>(()=>storedRoutes('omega.r156.globalPins',8)),[recent,setRecent]=useState<string[]>(()=>storedRoutes('omega.r156.globalRecent',7));
 const operationAudit=useMemo(()=>auditAuthoritativeOperationChainR143(),[]),convergenceAudit=useMemo(()=>auditWholeInstrumentConvergenceR158(),[]),live=useLiveNavigationR156();
 useEffect(()=>{
  const openNavigator=(e:Event)=>{const detail=(e as CustomEvent<{layer?:'APPLICATIONS'|'SOFTWARE'|'EVERYWHERE';workspace?:OmegaWorkspaceIdR82}>).detail;if(detail?.layer==='SOFTWARE'){setLayer('SOFTWARE');setWorkspaceFilter('ALL')}else{setLayer('EVERYWHERE');const requested=validWorkspace(detail?.workspace)?detail?.workspace:detail?.layer==='APPLICATIONS'?storedWorkspace():'ALL';setWorkspaceFilter(requested)}setQuery('');setExpanded(true)};
  const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setLayer('EVERYWHERE');setWorkspaceFilter('ALL');setExpanded(true)}if((e.metaKey||e.ctrlKey)&&e.shiftKey&&e.key.toLowerCase()==='m'){e.preventDefault();setRailWide(v=>!v)}if(e.key==='Escape')setExpanded(false)};
  window.addEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.removeEventListener('keydown',key)};
 },[]);
 useEffect(()=>{document.documentElement.dataset.omegaNavPresent='true';document.documentElement.dataset.omegaNavExpanded=expanded?'true':'false';return()=>{delete document.documentElement.dataset.omegaNavPresent;delete document.documentElement.dataset.omegaNavExpanded}},[expanded]);
 useEffect(()=>{document.documentElement.dataset.omegaNavWide=railWide?'true':'false';try{localStorage.setItem('omega.r120.navWide',String(railWide))}catch{}return()=>{delete document.documentElement.dataset.omegaNavWide}},[railWide]);
 useEffect(()=>{if(!currentPanel||!OMEGA_ALL_ROUTES_R82.includes(currentPanel as any))return;setRecent(prev=>{const next=take([currentPanel,...prev.filter(x=>x!==currentPanel)],7);try{localStorage.setItem('omega.r156.globalRecent',JSON.stringify(next))}catch{}return next})},[currentPanel]);
 useEffect(()=>{if(!currentPanel||!OMEGA_ALL_ROUTES_R82.includes(currentPanel as any))return;const contract=convergenceContractForRouteR158(currentPanel),root=document.documentElement;root.dataset.omegaR158Skin=contract.skin;root.dataset.omegaR158Shell=contract.atlasShell;root.dataset.omegaR158Output=contract.output;root.dataset.omegaR158Surface=contract.surfaceClass;root.dataset.omegaR158Route=contract.routeId;root.dataset.omegaR158ModePolicy=modePolicy;root.dataset.omegaR158ModeCount=String(modeCount);return()=>{delete root.dataset.omegaR158Skin;delete root.dataset.omegaR158Shell;delete root.dataset.omegaR158Output;delete root.dataset.omegaR158Surface;delete root.dataset.omegaR158Route;delete root.dataset.omegaR158ModePolicy;delete root.dataset.omegaR158ModeCount}},[currentPanel,modeCount,modePolicy]);
 const togglePin=(route:string)=>setPinned(prev=>{const next=prev.includes(route)?prev.filter(x=>x!==route):take([route,...prev],8);try{localStorage.setItem('omega.r156.globalPins',JSON.stringify(next))}catch{}return next});
 const activeWorkspace=workspaceFilter==='ALL'?null:OMEGA_WORKSPACES_R82.find(w=>w.id===workspaceFilter)||null;
 const rows=useMemo(()=>{const q=query.trim().toLowerCase();const filtered=OMEGA_ALL_ROUTES_R82.filter(route=>{const workspace=workspaceForRouteR82(route),org=organizationForRouteR132(route),nav=omegaNavItem(route);if(workspaceFilter!=='ALL'&&workspace.id!==workspaceFilter)return false;if(!q)return true;return (route+' '+workspace.label+' '+workspace.copy+' '+org.tier+' '+org.surfaceClass+' '+org.layout+' '+(nav?.hint||'')+' '+(nav?.effect||'')+' '+(nav?.authority||'')).toLowerCase().includes(q)||rankRoutesForIntent(q,[route]).length>0});const organized=organizedRoutesR132(filtered);if(!q)return organized;const ranked=rankRoutesForIntent(q,organized);return[...ranked,...organized.filter(route=>!ranked.includes(route))]},[query,workspaceFilter]);
 const taskMatches=useMemo(()=>query.trim()?rankMissionStacksForIntent(query):R156_MISSION_STACKS,[query]);
 const nextActions=useMemo(()=>currentPanel?adaptiveNextRoutes(currentPanel,busy,live):[],[currentPanel,busy,live]);
 const activeMissionPath=currentPanel?adaptiveMissionFor(currentPanel):null,missionPathProgress=activeMissionPath?missionProgress(activeMissionPath,currentPanel):null;
 const continuityRoutes=Array.from(new Set([...pinned,...recent])).filter(x=>x!==currentPanel);
 const go=(panel:string)=>{onNavigate(panel);setExpanded(false);setQuery('')};
 const open=(next:BrowserLayer)=>{setLayer(next);setExpanded(true)};
 const currentWorkspace=currentPanel?workspaceForRouteR82(currentPanel as any):null,currentOrganization=currentPanel?organizationForRouteR132(currentPanel):null,currentContract=currentPanel&&OMEGA_ALL_ROUTES_R82.includes(currentPanel as any)?convergenceContractForRouteR158(currentPanel):null,routeCount=OMEGA_ROUTE_INVENTORY_R107.currentCount;
 const missionRunning=['ACTIVE','PAUSED'].includes(live.missionStatus)||['RUNNING','QUEUED','CLAIMED'].includes(live.jobStatus),proofReturned=/RETURN|VERIFIED|COMPLETE/.test(live.proofState.toUpperCase());
 return <aside className={'r94-side-toolbar '+(expanded?'expanded':'collapsed')+' '+(railWide?'rail-wide':'rail-compact')+' r100-professional-nav r104-readable-nav r105-context-nav r120-adaptive-nav r132-organized-nav r156-global-nav r158-whole-instrument'} aria-label='OMEGA global navigation toolbar' data-operation-chain='R143' data-operation-chain-pass={operationAudit.pass?'true':'false'} data-r158-pass={convergenceAudit.pass?'true':'false'} data-pc-online={live.pcOnline?'true':'false'} data-mission-state={live.missionStatus}>
  <div className='r94-nav-rail'>
   <button className='r88-navigator-trigger r100-rail-cap' onClick={()=>{setLayer('EVERYWHERE');setWorkspaceFilter('ALL');setExpanded(v=>!v)}} aria-label={expanded?'Collapse OMEGA navigator':'Expand OMEGA navigator'} aria-expanded={expanded}>
    <span className='r100-omega-mark'>Ω</span><small>MENU</small><b>{routeCount}</b>
   </button>
   <button className='r120-rail-width-toggle' onClick={()=>setRailWide(v=>!v)} aria-label={railWide?'Narrow side toolbar':'Widen side toolbar to show full labels'} aria-pressed={railWide} title={railWide?'Use compact toolbar':'Widen toolbar'}><ChevronRight/><span>{railWide?'COMPACT':'WIDE MENU'}</span><kbd>Ctrl⇧M</kbd></button>
   <div className='r100-rail-divider'/>
   {onHome&&<button className='r94-rail-action r100-rail-home' onClick={()=>{setExpanded(false);onHome()}} aria-label='Go to OMEGA home' title='Home'><Home/><span>HOME</span></button>}
   <button className={'r94-rail-action '+(currentPanel==='Command Center'?'active':'')} onClick={()=>go('Command Center')} aria-label='Open Command Center' title='Command Center'><Sparkles/><span>CORE</span></button>
   <button className={'r94-rail-action r156-rail-live '+(live.pcOnline?'proved ':'')+(currentPanel==='Hybrid Link'?'active':'')} onClick={()=>go('Hybrid Link')} aria-label={live.pcOnline?'Open connected Sovereign PC':'Open Hybrid Link'} title={live.pcOnline?`PC ONLINE · ${live.deviceName||'authenticated host'}`:'Hybrid Link · heartbeat required'}><Link2/><span>{live.pcOnline?'PC LIVE':'PC'}</span></button>
   <button className={'r94-rail-action r156-rail-live '+(missionRunning?'running ':'')+(currentPanel==='Cockpit'?'active':'')} onClick={()=>go('Cockpit')} aria-label={missionRunning?'Open active mission cockpit':'Open runtime cockpit'} title={missionRunning?`${live.missionStatus} · ${live.missionId}`:'Cockpit'}><Activity/><span>{missionRunning?'RUN':'STATE'}</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(currentPanel==='Extreme Traversal'?'active':'')} onClick={()=>go('Extreme Traversal')} aria-label='Open Woven Continuity traversal instrument' title='Extreme Traversal'><Waypoints/><span>WEAVE</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(currentPanel==='Matter Traversal'?'active':'')} onClick={()=>go('Matter Traversal')} aria-label='Open Matter Traversal' title='Matter Traversal'><Orbit/><span>MATTER</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(proofReturned?'proved ':'')+(currentPanel==='Evidence & Proof'?'active':'')} onClick={()=>go('Evidence & Proof')} aria-label='Open Evidence and Proof' title={proofReturned?`Returned proof · ${live.proofState}`:'Evidence & Proof'}><ShieldCheck/><span>{proofReturned?'PROOF ✓':'PROOF'}</span></button>
   <div className='r100-rail-divider'/>
   <button className={'r94-rail-action '+(layer==='EVERYWHERE'&&expanded?'active':'')} onClick={()=>{setWorkspaceFilter('ALL');open('EVERYWHERE')}} aria-label='Browse all registered OMEGA applications' title='Everywhere'><Menu/><span>APPS</span></button>
   <button className={'r94-rail-action '+(layer==='SOFTWARE'&&expanded?'active':'')} onClick={()=>{setWorkspaceFilter('ALL');open('SOFTWARE')}} aria-label='Browse full software and capability map' title='Software'><Layers3/><span>SYS</span></button>
   <div className='r94-rail-current r100-rail-current' title={currentPanel||'OMEGA'}><i/><small>ACTIVE</small><b>{railWide?(currentPanel||'OMEGA'):routeMark(currentPanel||'OMEGA')}</b></div>
  </div>
  <section className='r88-navigator r89-flat-navigator r94-nav-panel r100-nav-panel r104-nav-panel r156-nav-panel' aria-hidden={!expanded}>
   <header className='r88-navigator-head r100-navigator-head r104-navigator-head'>
    <div><span>OMEGA V6 · R158 WHOLE INSTRUMENT · R157 LIVING WORLD · R143 OPERATION CHAIN</span><b>{layer==='EVERYWHERE'?(activeWorkspace?`${activeWorkspace.label} tools`:'Live operating surface'):'Software / capability map'}</b><small>{layer==='EVERYWHERE'?(`${rows.length}/${routeCount} destinations · ${modeCount} modes · ${live.pcOnline?'PC ONLINE':'PC heartbeat held'} · ${missionRunning?`${live.missionStatus} mission active`:'no active mission'} · ${live.rcwaOnline?'RCWA LIVE':'RCWA held'} · R158 ${convergenceAudit.pass?'PASS':'HOLD'}`):'Full software lineage, capability, execution-domain, receipt, skin, output and proof authority map'}</small></div>
    <div className='r88-head-actions'><button onClick={()=>setExpanded(false)} aria-label='Collapse navigator'><ChevronLeft/></button></div>
   </header>
   <nav className='r89-nav-mode r100-nav-mode r104-nav-mode' aria-label='Navigator mode'><button className={layer==='EVERYWHERE'?'active':''} onClick={()=>{setLayer('EVERYWHERE');setWorkspaceFilter('ALL')}}><Menu/>Operate <b>{routeCount}</b></button><button className={layer==='SOFTWARE'?'active':''} onClick={()=>{setLayer('SOFTWARE');setWorkspaceFilter('ALL')}}><Layers3/>System map</button></nav>
   {currentPanel&&currentWorkspace&&<div className='r100-active-route r104-active-route r156-active-instrument'><span>ACTIVE INSTRUMENT</span><b>{currentPanel}</b><i>{currentWorkspace.label}{currentOrganization?` · ${currentOrganization.tier} · ${currentOrganization.layout.replaceAll('_',' ')}`:''}{currentContract?` · ${currentContract.skin} · ${currentContract.atlasShell}`:''}</i><small>{omegaNavItem(currentPanel)?.hint||currentWorkspace.copy}</small><button className={pinned.includes(currentPanel)?'active':''} onClick={()=>togglePin(currentPanel)}>{pinned.includes(currentPanel)?'PINNED':'PIN INSTRUMENT'}</button></div>}
   {currentPanel&&<RouteOutputRibbonR111 route={currentPanel}/>}
   {currentContract&&<div className='r158-contract-strip' aria-label='R158 current route convergence contract'><span>R158 CONTEXT</span><b>{currentContract.workspaceLabel}</b><i>{modeCount} MODES</i><i>{modePolicy||'SOURCE_BACKED'}</i><i>{currentContract.atlasShell} ATLAS</i><i>{currentContract.skin} SKIN</i><i>{currentContract.output} OUTPUT</i><i>{currentContract.executionDomain}/{currentContract.executionState}</i><i>σ STRUCTURE-SEPARATE</i></div>}
   {layer==='EVERYWHERE'?<>
    <section className='r156-global-context' aria-label='Live OMEGA operation context'>
     <div className='r156-global-live-grid'>
      <button className={live.pcOnline?'live':'held'} onClick={()=>go('Hybrid Link')}><small>HOST</small><b>{live.pcOnline?'PC ONLINE':'PC HELD'}</b><em>{live.pcOnline?short(live.deviceName||'authenticated host',30):'authenticated heartbeat required'}</em></button>
      <button className={missionRunning?'live':terminal(live.missionStatus)?'complete':'idle'} onClick={()=>go('Cockpit')}><small>MISSION</small><b>{live.missionStatus}</b><em>{live.missionId?short(live.missionId,25):'no active mission'}{live.missionProgress?` · ${live.missionProgress}`:''}</em></button>
      <button className={live.rcwaOnline?'live':'held'} onClick={()=>go('System')}><small>FULL WAVE</small><b>{live.rcwaOnline?'RCWA LIVE':'RCWA HELD'}</b><em>{short(live.rcwaState,28)}</em></button>
      <button className={proofReturned?'complete':'idle'} onClick={()=>go('Evidence & Proof')}><small>RETURN PROOF</small><b>{proofReturned?'RETURNED':'WAITING'}</b><em>{short(live.proofState,28)}</em></button>
     </div>
     {live.missionLabel&&<div className='r156-live-objective'><span>ACTIVE OBJECTIVE</span><b>{short(live.missionLabel,132)}</b>{live.currentJobOp&&<i>{live.currentJobOp} · {live.jobStatus}</i>}</div>}
     {nextActions.length>0&&<div className='r156-global-next'><header><span>NEXT BEST ACTIONS</span><small>ranked from current instrument + live execution truth</small></header>{nextActions.map(x=><button key={x.name} onClick={()=>go(x.name)}><i>{String(x.priority).padStart(2,'0')}</i><span><b>{x.name}</b><small>{x.reason}</small></span><ChevronRight/></button>)}</div>}
     {activeMissionPath&&missionPathProgress&&<details className='r156-global-path' open><summary><span><b>{activeMissionPath.label}</b><small>{activeMissionPath.intent}</small></span><i>{missionPathProgress.step}/{missionPathProgress.total}</i></summary><div>{activeMissionPath.routes.map((route,index)=><button key={route} className={currentPanel===route?'active':''} onClick={()=>go(route)}><i>{index+1}</i><span>{route}</span></button>)}</div></details>}
     {continuityRoutes.length>0&&<div className='r156-continuity-strip'><span>CONTINUITY</span>{continuityRoutes.map(route=><button key={route} onClick={()=>go(route)} data-pinned={pinned.includes(route)?'true':'false'}>{pinned.includes(route)?'◆':'↺'} {route}</button>)}</div>}
    </section>
    <nav className='r105-workspace-filter' aria-label='Application workspace submenu'><button className={workspaceFilter==='ALL'?'active':''} onClick={()=>setWorkspaceFilter('ALL')}>ALL <b>{routeCount}</b></button>{OMEGA_WORKSPACES_R82.map(workspace=><button key={workspace.id} className={workspaceFilter===workspace.id?'active':''} onClick={()=>setWorkspaceFilter(workspace.id)} title={workspace.copy}>{workspace.label} <b>{workspace.routes.length}</b></button>)}</nav>
    <div className='r105-context-note'><span>CONTEXT</span><b>{activeWorkspace?`${activeWorkspace.label} · ${activeWorkspace.copy}`:`All working contexts · ${OMEGA_EXPERIENCE_LAWS_R132.hierarchy.toLowerCase().replaceAll('_',' ')}`}</b></div>
    <small className='r156-search-intent-hint'>Describe the outcome: repair build, prove it, connected PC, Earth forecast, all modes, restore and converge…</small>
    <label className='r88-search r100-search r104-search r156-semantic-search' data-r156-search-mode='semantic-task-ranking'><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search registered OMEGA destinations' aria-label={activeWorkspace?`Search ${activeWorkspace.label} tools within the shared application registry`:'Search all registered OMEGA applications'}/><kbd>⌘K</kbd></label>
    {query.trim()&&taskMatches.length>0&&<section className='r156-task-matches'><header><span>TASK WORKSPACES</span><small>compositions of existing instruments · no automatic execution</small></header>{taskMatches.filter((_,i)=>i<3).map(stack=><button key={stack.id} onClick={()=>go(stack.routes[0])}><span><b>{stack.label}</b><small>{stack.intent}</small></span><i>{stack.routes.join(' → ')}</i></button>)}</section>}
    <div className='r89-flat-scroll r104-route-scroll r156-route-scroll' aria-label={activeWorkspace?`${activeWorkspace.label} OMEGA applications`:'All registered OMEGA applications'}>
     {rows.map(route=>{const index=OMEGA_ALL_ROUTES_R82.indexOf(route)+1,workspace=workspaceForRouteR82(route),reality=effectiveCapabilityReality(route),org=organizationForRouteR132(route),chain=operationContractForRouteR143(route),nav=omegaNavItem(route),convergence=convergenceContractForRouteR158(route);return <button key={route} title={`${workspace.copy} · ${org.layout.replaceAll('_',' ')} · ${nav?.hint||''}`} className={'r89-flat-route r104-route r156-route r158-route '+(currentPanel===route?'active':'')} aria-current={currentPanel===route?'page':undefined} onClick={()=>go(route)} data-route-id={chain.routeId} data-capability-id={chain.capabilityId} data-execution-domain={chain.executionDomain} data-execution-state={chain.state} data-r158-skin={convergence.skin} data-r158-output={convergence.output} data-r158-shell={convergence.atlasShell}>
      <i>{String(index).padStart(2,'0')}</i><span><b>{route}</b><small className='r132-route-meta r156-route-meta'><span className='r132-route-tier' data-tier={org.tier}>{org.tier}</span><span>{effectLabel(nav?.effect)}</span><span>{authorityLabel(nav?.authority)}</span><span data-state={chain.state}>{chain.state}</span><span>{CAPABILITY_REALITY_LABEL[reality]}</span><span>{convergence.skin}/{convergence.output}</span></small><em>{nav?.hint||workspace.copy}</em></span><ChevronRight/>
     </button>})}
     {rows.length===0&&<div className='r88-empty'>No route matches that workspace/search combination.</div>}
    </div>
    <footer className='r88-navigator-foot r100-navigator-foot r104-navigator-foot'><ShieldCheck/><span>Persistent rail · all 44 destinations remain reachable · R158 whole-instrument audit {convergenceAudit.pass?'PASS':'HOLD'} · R156 ranks context but never auto-executes · R143 operation chain {operationAudit.pass?'PASS':'HOLD'} · R142 receipts remain execution proof · R125 alone admits CanonState · atlas shell labels are address/model resolution, not literal physical dimensions.</span></footer>
   </>:<div className='r88-software-layer'><OmegaSystemInventoryR83 compact onNavigate={go}/></div>}
  </section>
 </aside>;
}

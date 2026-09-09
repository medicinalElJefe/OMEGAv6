import {Fragment,useEffect,useMemo,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Command,Earth,Home,Layers3,Link2,Menu,Search,ShieldCheck} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL} from './capabilityAuthority';
import {effectiveCapabilityReality} from './operationalCapabilityRuntimeR45';
import {OMEGA_ALL_ROUTES_R82,OMEGA_ROUTE_INVENTORY_R107,OMEGA_WORKSPACES_R82,workspaceForRouteR82,type OmegaWorkspaceIdR82} from './omegaExperienceRegistryR82';
import {auditAuthoritativeOperationChainR143,operationContractForRouteR143} from './authoritativeOperationChainR143';
import {organizationForRouteR132,organizedRoutesR132,OMEGA_EXPERIENCE_LAWS_R132} from './experienceOrganizationR132';
import OmegaSystemInventoryR83 from './OmegaSystemInventoryR83';
import RouteOutputRibbonR111 from './RouteOutputRibbonR111';
import './omegaSideNavigatorR88.css';
import './omegaSideNavigatorR100.css';
import './extremeLayerIntegrityR104.css';
import './dataTruthNavigationR105.css';
import './omegaSideNavigatorR120.css';
import './wholeSystemExperienceR132.css';
import './omegaSideNavigatorR210.css';
import './omegaSideNavigatorR239.css';

type BrowserLayer='EVERYWHERE'|'SOFTWARE';
type WorkspaceFilter='ALL'|OmegaWorkspaceIdR82;
type Props={currentPanel?:string;onNavigate:(panel:string)=>void;onHome?:()=>void};

export const R88_ALL_ROUTES=OMEGA_ALL_ROUTES_R82;
export const R210_NAV_REVISION='R210';
export const R239_USER_NAV_REVISION='R239';
const routeMark=(name:string)=>{const words=name.split(/\s+/).filter(Boolean);return words.map((x,i)=>i<2?x[0]:'').join('').toUpperCase()||'Ω'};
const validWorkspace=(value:any):value is OmegaWorkspaceIdR82=>OMEGA_WORKSPACES_R82.some(w=>w.id===value);
const storedWorkspace=():WorkspaceFilter=>{try{const value=localStorage.getItem('omega.r82.workspace');return validWorkspace(value)?value:'ALL'}catch{return'ALL'}};
const storedRailWide=()=>{try{return localStorage.getItem('omega.r120.navWide')==='true'}catch{return false}};
const TIER_COPY={PRIMARY:'Start here',SUPPORT:'Common supporting tools',EXPERT:'Advanced and specialist tools'} as const;

export default function OmegaSideNavigatorR88({currentPanel='',onNavigate,onHome}:Props){
 const[expanded,setExpanded]=useState(false),[railWide,setRailWide]=useState(storedRailWide),[layer,setLayer]=useState<BrowserLayer>('EVERYWHERE'),[query,setQuery]=useState(''),[workspaceFilter,setWorkspaceFilter]=useState<WorkspaceFilter>('ALL'),[showTechnical,setShowTechnical]=useState(false);
 const shellRef=useRef<HTMLElement|null>(null),searchRef=useRef<HTMLInputElement|null>(null);
 const operationAudit=useMemo(()=>auditAuthoritativeOperationChainR143(),[]);
 useEffect(()=>{
  const openNavigator=(e:Event)=>{const detail=(e as CustomEvent<{layer?:'APPLICATIONS'|'SOFTWARE'|'EVERYWHERE';workspace?:OmegaWorkspaceIdR82}>).detail;if(detail?.layer==='SOFTWARE'){setLayer('SOFTWARE');setWorkspaceFilter('ALL')}else{setLayer('EVERYWHERE');const requested=validWorkspace(detail?.workspace)?detail?.workspace:detail?.layer==='APPLICATIONS'?storedWorkspace():'ALL';setWorkspaceFilter(requested)}setQuery('');setExpanded(true)};
  const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setLayer('EVERYWHERE');setWorkspaceFilter('ALL');setExpanded(true)}if((e.metaKey||e.ctrlKey)&&e.shiftKey&&e.key.toLowerCase()==='m'){e.preventDefault();setRailWide(v=>!v)}if(e.key==='Escape'){setExpanded(false)}};
  window.addEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.removeEventListener('keydown',key)};
 },[]);
 useEffect(()=>{if(!expanded)return;const id=requestAnimationFrame(()=>searchRef.current?.focus({preventScroll:true}));const outside=(e:PointerEvent)=>{const target=e.target as Node|null;if(target&&!shellRef.current?.contains(target))setExpanded(false)};document.addEventListener('pointerdown',outside);return()=>{cancelAnimationFrame(id);document.removeEventListener('pointerdown',outside)}},[expanded,layer]);
 useEffect(()=>{document.documentElement.dataset.omegaNavPresent='true';document.documentElement.dataset.omegaNavExpanded=expanded?'true':'false';return()=>{delete document.documentElement.dataset.omegaNavPresent;delete document.documentElement.dataset.omegaNavExpanded}},[expanded]);
 useEffect(()=>{document.documentElement.dataset.omegaNavWide=railWide?'true':'false';try{localStorage.setItem('omega.r120.navWide',String(railWide))}catch{}return()=>{delete document.documentElement.dataset.omegaNavWide}},[railWide]);
 const activeWorkspace=workspaceFilter==='ALL'?null:OMEGA_WORKSPACES_R82.find(w=>w.id===workspaceFilter)||null;
 const rows=useMemo(()=>{const q=query.trim().toLowerCase();const filtered=OMEGA_ALL_ROUTES_R82.filter(route=>{const workspace=workspaceForRouteR82(route),org=organizationForRouteR132(route);if(workspaceFilter!=='ALL'&&workspace.id!==workspaceFilter)return false;if(!q)return true;return (route+' '+workspace.label+' '+workspace.copy+' '+org.tier+' '+org.surfaceClass+' '+org.layout).toLowerCase().includes(q)});return organizedRoutesR132(filtered)},[query,workspaceFilter]);
 const go=(panel:string)=>{onNavigate(panel);setExpanded(false);setQuery('')};
 const open=(next:BrowserLayer)=>{setLayer(next);setExpanded(true)};
 const currentWorkspace=currentPanel?workspaceForRouteR82(currentPanel as any):null,currentOrganization=currentPanel?organizationForRouteR132(currentPanel):null,routeCount=OMEGA_ROUTE_INVENTORY_R107.currentCount;
 return <aside ref={shellRef} className={'r94-side-toolbar '+(expanded?'expanded':'collapsed')+' '+(railWide?'rail-wide':'rail-compact')+' r100-professional-nav r104-readable-nav r105-context-nav r120-adaptive-nav r132-organized-nav r210-converged-nav r239-user-nav'} aria-label='OMEGA global navigation toolbar' data-operation-chain='R143' data-operation-chain-pass={operationAudit.pass?'true':'false'} data-navigation-revision={R239_USER_NAV_REVISION}>
  <div className='r94-nav-rail'>
   <button className='r88-navigator-trigger r100-rail-cap' onClick={()=>{setLayer('EVERYWHERE');setWorkspaceFilter('ALL');setExpanded(v=>!v)}} aria-label={expanded?'Collapse OMEGA navigator':'Expand OMEGA navigator'} aria-expanded={expanded} aria-controls='omega-global-navigator'>
    <span className='r100-omega-mark'>Ω</span><small>MENU</small><b>{routeCount}</b>
   </button>
   <button className='r120-rail-width-toggle' onClick={()=>setRailWide(v=>!v)} aria-label={railWide?'Narrow side toolbar':'Widen side toolbar to show full labels'} aria-pressed={railWide} title={railWide?'Use compact toolbar':'Widen toolbar'}><ChevronRight/><span>{railWide?'COMPACT':'WIDE MENU'}</span><kbd>Ctrl⇧M</kbd></button>
   <div className='r100-rail-divider'/>
   {onHome&&<button className='r94-rail-action r100-rail-home' onClick={()=>{setExpanded(false);onHome()}} aria-label='Go to OMEGA home' title='Home'><Home/><span>HOME</span></button>}
   <button className={'r94-rail-action '+(currentPanel==='Command Center'?'active':'')} onClick={()=>go('Command Center')} aria-label='Open Command Center' title='Command Center'><Command/><span>COMMAND</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(currentPanel==='Hybrid Link'?'active':'')} onClick={()=>go('Hybrid Link')} aria-label='Open Hybrid Link' title='Hybrid Link'><Link2/><span>HYBRID</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(currentPanel==='Earth Now'?'active':'')} onClick={()=>go('Earth Now')} aria-label='Open Earth Now' title='Earth Now'><Earth/><span>EARTH</span></button>
   <button className={'r94-rail-action '+(currentPanel==='Evidence & Proof'?'active':'')} onClick={()=>go('Evidence & Proof')} aria-label='Open Evidence and Proof' title='Evidence & Proof'><ShieldCheck/><span>PROOF</span></button>
   <div className='r100-rail-divider'/>
   <button className={'r94-rail-action '+(layer==='EVERYWHERE'&&expanded?'active':'')} onClick={()=>{setWorkspaceFilter('ALL');open('EVERYWHERE')}} aria-label='Browse all registered OMEGA tools' title='All tools'><Menu/><span>ALL</span></button>
   <button className={'r94-rail-action '+(layer==='SOFTWARE'&&expanded?'active':'')} onClick={()=>{setWorkspaceFilter('ALL');open('SOFTWARE')}} aria-label='Browse full software and capability map' title='System map'><Layers3/><span>SYSTEM</span></button>
   <div className='r94-rail-current r100-rail-current' title={currentPanel||'OMEGA'}><i/><small>ACTIVE</small><b>{railWide?(currentPanel||'OMEGA'):routeMark(currentPanel||'OMEGA')}</b></div>
  </div>
  <section id='omega-global-navigator' className='r88-navigator r89-flat-navigator r94-nav-panel r100-nav-panel r104-nav-panel' aria-label='OMEGA destination browser' aria-hidden={!expanded}>
   <header className='r88-navigator-head r100-navigator-head r104-navigator-head'>
    <div><span>OMEGA V6 · NAVIGATION</span><b>{layer==='EVERYWHERE'?(activeWorkspace?`${activeWorkspace.label} tools`:'All tools'):'System map'}</b><small>{layer==='EVERYWHERE'?(`${rows.length} of ${routeCount} destinations · ${activeWorkspace?activeWorkspace.copy:'choose a workspace or search by task'}`):'Software lineage, capability, execution domain, receipts and proof authority'}</small></div>
    <div className='r88-head-actions'><button className='r239-tech-toggle' onClick={()=>setShowTechnical(v=>!v)} aria-pressed={showTechnical} title='Show or hide execution metadata'>{showTechnical?'Simple view':'Technical'}</button><button onClick={()=>setExpanded(false)} aria-label='Collapse navigator'><ChevronLeft/></button></div>
   </header>
   <nav className='r89-nav-mode r100-nav-mode r104-nav-mode' aria-label='Navigator mode'><button className={layer==='EVERYWHERE'?'active':''} onClick={()=>{setLayer('EVERYWHERE');setWorkspaceFilter('ALL')}}><Menu/>All tools <b>{routeCount}</b></button><button className={layer==='SOFTWARE'?'active':''} onClick={()=>{setLayer('SOFTWARE');setWorkspaceFilter('ALL')}}><Layers3/>System map</button></nav>
   {currentPanel&&currentWorkspace&&<div className='r100-active-route r104-active-route'><span>YOU ARE HERE</span><b>{currentPanel}</b><i>{currentWorkspace.label}{showTechnical&&currentOrganization?` · ${currentOrganization.tier} · ${currentOrganization.layout.replaceAll('_',' ')}`:''}</i><small>{currentWorkspace.copy}</small></div>}
   {currentPanel&&<RouteOutputRibbonR111 route={currentPanel}/>}
   {layer==='EVERYWHERE'?<>
    <nav className='r105-workspace-filter' aria-label='Application workspace submenu'><button className={workspaceFilter==='ALL'?'active':''} onClick={()=>setWorkspaceFilter('ALL')}>ALL <b>{routeCount}</b></button>{OMEGA_WORKSPACES_R82.map(workspace=><button key={workspace.id} className={workspaceFilter===workspace.id?'active':''} onClick={()=>setWorkspaceFilter(workspace.id)} title={workspace.copy}>{workspace.label} <b>{workspace.routes.length}</b></button>)}</nav>
    <div className='r105-context-note'><span>WORKSPACE</span><b>{activeWorkspace?`${activeWorkspace.label} · ${activeWorkspace.copy}`:'Command · Explore · Intelligence · Evidence · Build · System'}</b></div>
    <label className='r88-search r100-search r104-search'><Search/><input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search tools, surfaces, or workflows' aria-label={activeWorkspace?`Search ${activeWorkspace.label} tools within the shared application registry`:'Search all registered OMEGA applications'}/><kbd>⌘K</kbd></label>
    <div className='r210-nav-status' role='status' aria-live='polite'>{rows.length} of {routeCount} destinations visible{query.trim()?` for “${query.trim()}”`:''}.</div>
    <div className='r89-flat-scroll r104-route-scroll' aria-label={activeWorkspace?`${activeWorkspace.label} OMEGA applications`:'All registered OMEGA applications'}>
     {rows.map(route=>{const index=OMEGA_ALL_ROUTES_R82.indexOf(route)+1,workspace=workspaceForRouteR82(route),reality=effectiveCapabilityReality(route),org=organizationForRouteR132(route),chain=operationContractForRouteR143(route),firstOfTier=rows.find(candidate=>organizationForRouteR132(candidate).tier===org.tier)===route;return <Fragment key={route}>{firstOfTier&&<div className='r239-route-group' data-tier={org.tier}><span>{org.tier}</span><small>{TIER_COPY[org.tier]}</small></div>}<button title={`${workspace.copy} · ${org.layout.replaceAll('_',' ')}`} className={'r89-flat-route r104-route '+(currentPanel===route?'active':'')} aria-current={currentPanel===route?'page':undefined} onClick={()=>go(route)} data-route-id={chain.routeId} data-capability-id={chain.capabilityId} data-execution-domain={chain.executionDomain} data-execution-state={chain.state}>
      <i>{String(index).padStart(2,'0')}</i><span><b>{route}</b><small className='r132-route-meta'><span className='r132-route-tier' data-tier={org.tier}>{org.tier}</span><span>{workspace.label}</span>{showTechnical&&<span> · {org.surfaceClass} · {org.layout.replaceAll('_',' ')}</span>}</small><em>{showTechnical?`${chain.executionDomain}/${chain.state} · ${CAPABILITY_REALITY_LABEL[reality]}`:workspace.copy}</em></span><ChevronRight/>
     </button></Fragment>})}
     {rows.length===0&&<div className='r88-empty'>No tool matches that workspace/search combination.</div>}
    </div>
    <footer className='r88-navigator-foot r100-navigator-foot r104-navigator-foot'><ShieldCheck/><span>{showTechnical?`R239 user navigation · R143 operation-chain ${operationAudit.pass?'PASS':'HOLD'} · ${operationAudit.mappedRoutes}/${operationAudit.totalRoutes} routes mapped · navigation has no execution or R125 admission authority.`:'Every registered tool remains reachable. Navigation only changes where you go; it does not execute work or change CanonState.'}</span></footer>
   </>:<div className='r88-software-layer'><OmegaSystemInventoryR83 compact onNavigate={go}/></div>}
  </section>
 </aside>;
}

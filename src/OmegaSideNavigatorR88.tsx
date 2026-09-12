import {Fragment,useEffect,useMemo,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Command,Earth,Home,Layers3,Link2,Menu,Search,ShieldCheck} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL} from './capabilityAuthority';
import {effectiveCapabilityReality} from './operationalCapabilityRuntimeR45';
import {OMEGA_ALL_ROUTES_R82,OMEGA_ROUTE_INVENTORY_R107,OMEGA_WORKSPACES_R82,workspaceForRouteR82,type OmegaWorkspaceIdR82} from './omegaExperienceRegistryR82';
import {OMEGA_MASTER_MENU_NAVIGATION_R289,omegaMasterMenuForRouteR289} from './navigationRegistry';
import {auditAuthoritativeOperationChainR143,operationContractForRouteR143} from './authoritativeOperationChainR143';
import {organizationForRouteR132} from './experienceOrganizationR132';
import {compileNavigationLemmaR242,resolveExactRouteR242,R242_NAVIGATION_LEMMA_REVISION} from './navigationLemmaCalculusR242.js';
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
import './omegaSideNavigatorR289.css';

type BrowserLayer='EVERYWHERE'|'SOFTWARE';
type WorkspaceFilter='ALL'|OmegaWorkspaceIdR82;
type MasterMenuFilterR289='ALL'|'01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'|'12';
type Props={currentPanel?:string;onNavigate:(panel:string)=>void;onHome?:()=>void};

export const R88_ALL_ROUTES=OMEGA_ALL_ROUTES_R82;
export const R210_NAV_REVISION='R210';
export const R239_USER_NAV_REVISION='R239';
export const R289_MASTER_MENU_PRESENTATION_REVISION='R289';
const routeMark=(name:string)=>{const words=name.split(/\s+/).filter(Boolean);return words.map((x,i)=>i<2?x[0]:'').join('').toUpperCase()||'Ω'};
const validWorkspace=(value:any):value is OmegaWorkspaceIdR82=>OMEGA_WORKSPACES_R82.some(w=>w.id===value);
const storedWorkspace=():WorkspaceFilter=>{try{const value=localStorage.getItem('omega.r82.workspace');return validWorkspace(value)?value:'ALL'}catch{return'ALL'}};
const storedRailWide=()=>{try{return localStorage.getItem('omega.r120.navWide')==='true'}catch{return false}};
const TIER_COPY={PRIMARY:'Start here',SUPPORT:'Common supporting tools',EXPERT:'Advanced and specialist tools'} as const;

export default function OmegaSideNavigatorR88({currentPanel='',onNavigate,onHome}:Props){
 const[expanded,setExpanded]=useState(false),[railWide,setRailWide]=useState(storedRailWide),[layer,setLayer]=useState<BrowserLayer>('EVERYWHERE'),[query,setQuery]=useState(''),[workspaceFilter,setWorkspaceFilter]=useState<WorkspaceFilter>('ALL'),[masterMenu,setMasterMenu]=useState<MasterMenuFilterR289>('ALL'),[showTechnical,setShowTechnical]=useState(false),[navigationScar,setNavigationScar]=useState('');
 const shellRef=useRef<HTMLElement|null>(null),searchRef=useRef<HTMLInputElement|null>(null);
 const operationAudit=useMemo(()=>auditAuthoritativeOperationChainR143(),[]);
 const routeRecords=useMemo(()=>OMEGA_ALL_ROUTES_R82.map((route,index)=>{const workspace=workspaceForRouteR82(route),org=organizationForRouteR132(route),chain=operationContractForRouteR143(route);return{name:route,index,workspaceId:workspace.id,workspaceLabel:workspace.label,workspaceCopy:workspace.copy,tier:org.tier,surfaceClass:org.surfaceClass,layout:org.layout,searchable:`${chain.routeId} ${chain.capabilityId} ${chain.executionDomain} ${chain.state}`}}),[]);
 useEffect(()=>{
  const openNavigator=(e:Event)=>{const detail=(e as CustomEvent<{layer?:'APPLICATIONS'|'SOFTWARE'|'EVERYWHERE';workspace?:OmegaWorkspaceIdR82}>).detail;setNavigationScar('');setMasterMenu('ALL');if(detail?.layer==='SOFTWARE'){setLayer('SOFTWARE');setWorkspaceFilter('ALL')}else{setLayer('EVERYWHERE');const requested=validWorkspace(detail?.workspace)?detail?.workspace:detail?.layer==='APPLICATIONS'?storedWorkspace():'ALL';setWorkspaceFilter(requested)}setQuery('');setExpanded(true)};
  const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setLayer('EVERYWHERE');setWorkspaceFilter('ALL');setMasterMenu('ALL');setNavigationScar('');setExpanded(true)}if((e.metaKey||e.ctrlKey)&&e.shiftKey&&e.key.toLowerCase()==='m'){e.preventDefault();setRailWide(v=>!v)}if(e.key==='Escape'){setExpanded(false)}};
  window.addEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.removeEventListener('keydown',key)};
 },[]);
 useEffect(()=>{if(!expanded)return;const id=requestAnimationFrame(()=>searchRef.current?.focus({preventScroll:true}));const outside=(e:PointerEvent)=>{const target=e.target as Node|null;if(target&&!shellRef.current?.contains(target))setExpanded(false)};document.addEventListener('pointerdown',outside);return()=>{cancelAnimationFrame(id);document.removeEventListener('pointerdown',outside)}},[expanded,layer]);
 useEffect(()=>{document.documentElement.dataset.omegaNavPresent='true';document.documentElement.dataset.omegaNavExpanded=expanded?'true':'false';return()=>{delete document.documentElement.dataset.omegaNavPresent;delete document.documentElement.dataset.omegaNavExpanded}},[expanded]);
 useEffect(()=>{document.documentElement.dataset.omegaNavWide=railWide?'true':'false';try{localStorage.setItem('omega.r120.navWide',String(railWide))}catch{}return()=>{delete document.documentElement.dataset.omegaNavWide}},[railWide]);
 const activeWorkspace=workspaceFilter==='ALL'?null:OMEGA_WORKSPACES_R82.find(w=>w.id===workspaceFilter)||null;
 const activeMasterMenu=masterMenu==='ALL'?null:OMEGA_MASTER_MENU_NAVIGATION_R289.find(m=>m.id===masterMenu)||null;
 const navigationLemma=useMemo(()=>compileNavigationLemmaR242({routes:routeRecords,query,workspaceFilter,currentRoute:currentPanel}),[routeRecords,query,workspaceFilter,currentPanel]);
 const lemmaRows=useMemo(()=>navigationLemma.routes.map((route:any)=>route.name as string),[navigationLemma]);
 const rows=useMemo(()=>lemmaRows.filter(route=>masterMenu==='ALL'||omegaMasterMenuForRouteR289(route)?.id===masterMenu),[lemmaRows,masterMenu]);
 const go=(panel:string)=>{const resolved=resolveExactRouteR242(routeRecords,panel);if(!resolved){setNavigationScar(`UNRESOLVED_ROUTE_IDENTITY:${panel}`);setLayer('EVERYWHERE');setWorkspaceFilter('ALL');setMasterMenu('ALL');setQuery(panel);setExpanded(true);return}setNavigationScar('');onNavigate(resolved.name);setExpanded(false);setQuery('')};
 const open=(next:BrowserLayer)=>{setLayer(next);setNavigationScar('');setExpanded(true)};
 const currentWorkspace=currentPanel?workspaceForRouteR82(currentPanel as any):null,currentOrganization=currentPanel?organizationForRouteR132(currentPanel):null,routeCount=OMEGA_ROUTE_INVENTORY_R107.currentCount;
 const residualCount=navigationLemma.residualCount+(navigationScar?1:0);
 return <aside ref={shellRef} className={'r94-side-toolbar '+(expanded?'expanded':'collapsed')+' '+(railWide?'rail-wide':'rail-compact')+' r100-professional-nav r104-readable-nav r105-context-nav r120-adaptive-nav r132-organized-nav r210-converged-nav r239-user-nav r289-master-menu-nav'} aria-label='OMEGA global navigation toolbar' data-operation-chain='R143' data-operation-chain-pass={operationAudit.pass?'true':'false'} data-navigation-revision={R239_USER_NAV_REVISION} data-navigation-lemma-revision={R242_NAVIGATION_LEMMA_REVISION} data-master-menu-presentation-revision={R289_MASTER_MENU_PRESENTATION_REVISION}>
  <div className='r94-nav-rail'>
   <button className='r88-navigator-trigger r100-rail-cap' onClick={()=>{setLayer('EVERYWHERE');setWorkspaceFilter('ALL');setMasterMenu('ALL');setNavigationScar('');setExpanded(v=>!v)}} aria-label={expanded?'Collapse OMEGA navigator':'Expand OMEGA navigator'} aria-expanded={expanded} aria-controls='omega-global-navigator'>
    <span className='r100-omega-mark'>Ω</span><small>MENU</small><b>{routeCount}</b>
   </button>
   <button className='r120-rail-width-toggle' onClick={()=>setRailWide(v=>!v)} aria-label={railWide?'Narrow side toolbar':'Widen side toolbar to show full labels'} aria-pressed={railWide} title={railWide?'Use compact toolbar':'Widen toolbar'}><ChevronRight/><span>{railWide?'COMPACT':'WIDE MENU'}</span><kbd>Ctrl⇧M</kbd></button>
   <div className='r100-rail-divider'/>
   {onHome&&<button className='r94-rail-action r100-rail-home' onClick={()=>{setExpanded(false);setNavigationScar('');onHome()}} aria-label='Go to OMEGA home' title='Home'><Home/><span>HOME</span></button>}
   <button className={'r94-rail-action '+(currentPanel==='Command Center'?'active':'')} onClick={()=>go('Command Center')} aria-label='Open Command Center' title='Command Center'><Command/><span>COMMAND</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(currentPanel==='Hybrid Link'?'active':'')} onClick={()=>go('Hybrid Link')} aria-label='Open Hybrid Link' title='Hybrid Link'><Link2/><span>HYBRID</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(currentPanel==='Earth Now'?'active':'')} onClick={()=>go('Earth Now')} aria-label='Open Earth Now' title='Earth Now'><Earth/><span>EARTH</span></button>
   <button className={'r94-rail-action '+(currentPanel==='Evidence & Proof'?'active':'')} onClick={()=>go('Evidence & Proof')} aria-label='Open Evidence and Proof' title='Evidence & Proof'><ShieldCheck/><span>PROOF</span></button>
   <div className='r100-rail-divider'/>
   <button className={'r94-rail-action '+(layer==='EVERYWHERE'&&expanded?'active':'')} onClick={()=>{setWorkspaceFilter('ALL');setMasterMenu('ALL');open('EVERYWHERE')}} aria-label='Browse all registered OMEGA tools' title='All tools'><Menu/><span>ALL</span></button>
   <button className={'r94-rail-action '+(layer==='SOFTWARE'&&expanded?'active':'')} onClick={()=>{setWorkspaceFilter('ALL');setMasterMenu('ALL');open('SOFTWARE')}} aria-label='Browse full software and capability map' title='System map'><Layers3/><span>SYSTEM</span></button>
   <div className='r94-rail-current r100-rail-current' title={currentPanel||'OMEGA'}><i/><small>ACTIVE</small><b>{railWide?(currentPanel||'OMEGA'):routeMark(currentPanel||'OMEGA')}</b></div>
  </div>
  <section id='omega-global-navigator' className='r88-navigator r89-flat-navigator r94-nav-panel r100-nav-panel r104-nav-panel' aria-label='OMEGA destination browser' aria-hidden={!expanded} inert={!expanded} data-navigation-lemma-revision={R242_NAVIGATION_LEMMA_REVISION} data-lemma-pass={navigationLemma.structuralPass?'true':'false'} data-lemma-residual-count={residualCount} data-lemma-operator={navigationLemma.operator} data-master-menu-presentation-revision={R289_MASTER_MENU_PRESENTATION_REVISION} data-master-menu={masterMenu}>
   <header className='r88-navigator-head r100-navigator-head r104-navigator-head'>
    <div><span>OMEGA V6 · NAVIGATION</span><b>{layer==='EVERYWHERE'?(activeWorkspace?`${activeWorkspace.label} tools`:activeMasterMenu?activeMasterMenu.label:'All tools'):'System map'}</b><small>{layer==='EVERYWHERE'?(`${rows.length} of ${routeCount} destinations · ${activeMasterMenu?`${activeMasterMenu.id} ${activeMasterMenu.label} · `:''}${activeWorkspace?activeWorkspace.copy:'choose a workspace, recovered menu, or search by task'}`):'Software lineage, capability, execution domain, receipts and proof authority'}</small></div>
    <div className='r88-head-actions'><button className='r239-tech-toggle' onClick={()=>setShowTechnical(v=>!v)} aria-pressed={showTechnical} title='Show or hide execution metadata'>{showTechnical?'Simple view':'Technical'}</button><button onClick={()=>setExpanded(false)} aria-label='Collapse navigator'><ChevronLeft/></button></div>
   </header>
   <nav className='r89-nav-mode r100-nav-mode r104-nav-mode' aria-label='Navigator mode'><button className={layer==='EVERYWHERE'?'active':''} onClick={()=>{setLayer('EVERYWHERE');setWorkspaceFilter('ALL');setMasterMenu('ALL');setNavigationScar('')}}><Menu/>All tools <b>{routeCount}</b></button><button className={layer==='SOFTWARE'?'active':''} onClick={()=>{setLayer('SOFTWARE');setWorkspaceFilter('ALL');setMasterMenu('ALL');setNavigationScar('')}}><Layers3/>System map</button></nav>
   {currentPanel&&currentWorkspace&&<div className='r100-active-route r104-active-route'><span>YOU ARE HERE</span><b>{currentPanel}</b><i>{currentWorkspace.label}{showTechnical&&currentOrganization?` · ${currentOrganization.tier} · ${currentOrganization.layout.replaceAll('_',' ')}`:''}</i><small>{currentWorkspace.copy}</small></div>}
   {currentPanel&&<RouteOutputRibbonR111 route={currentPanel}/>}
   {layer==='EVERYWHERE'?<>
    <nav className='r289-master-menu-filter' aria-label='Recovered OMEGA master menus'><button aria-pressed={masterMenu==='ALL'} className={masterMenu==='ALL'?'active':''} onClick={()=>{setMasterMenu('ALL');setNavigationScar('')}}>ALL MENUS <b>{routeCount}</b></button>{OMEGA_MASTER_MENU_NAVIGATION_R289.map(menu=><button key={menu.id} aria-pressed={masterMenu===menu.id} className={masterMenu===menu.id?'active':''} onClick={()=>{setMasterMenu(menu.id as MasterMenuFilterR289);setNavigationScar('')}} title={menu.purpose}><span>{menu.id}</span>{menu.label}<b>{menu.routes.length}</b></button>)}</nav>
    <nav className='r105-workspace-filter' aria-label='Application workspace submenu'><button className={workspaceFilter==='ALL'?'active':''} onClick={()=>{setWorkspaceFilter('ALL');setNavigationScar('')}}>ALL <b>{routeCount}</b></button>{OMEGA_WORKSPACES_R82.map(workspace=><button key={workspace.id} className={workspaceFilter===workspace.id?'active':''} onClick={()=>{setWorkspaceFilter(workspace.id);setNavigationScar('')}} title={workspace.copy}>{workspace.label} <b>{workspace.routes.length}</b></button>)}</nav>
    <div className='r105-context-note'><span>FILTERS</span><b>{activeMasterMenu?`${activeMasterMenu.id} ${activeMasterMenu.label}`:'All recovered menus'} · {activeWorkspace?`${activeWorkspace.label} · ${activeWorkspace.copy}`:'Command · Explore · Intelligence · Evidence · Build · System'}</b></div>
    <label className='r88-search r100-search r104-search'><Search/><input ref={searchRef} value={query} onChange={e=>{setQuery(e.target.value);setNavigationScar('')}} placeholder='Search tools, surfaces, or workflows' aria-label={activeWorkspace?`Search ${activeWorkspace.label} tools within the shared application registry`:'Search all registered OMEGA applications'}/><kbd>⌘K</kbd></label>
    <div className='r210-nav-status' role='status' aria-live='polite'>{rows.length} of {routeCount} destinations visible{activeMasterMenu?` in ${activeMasterMenu.id} ${activeMasterMenu.label}`:''}{query.trim()?` for “${query.trim()}”`:''}{navigationScar?` · ${navigationScar}`:residualCount?` · ${residualCount} calculus residual${residualCount===1?'':'s'} carried`:''}.</div>
    <div className='r89-flat-scroll r104-route-scroll' aria-label={activeWorkspace?`${activeWorkspace.label} OMEGA applications`:'All registered OMEGA applications'}>
     {rows.map(route=>{const index=OMEGA_ALL_ROUTES_R82.indexOf(route)+1,workspace=workspaceForRouteR82(route),reality=effectiveCapabilityReality(route),org=organizationForRouteR132(route),chain=operationContractForRouteR143(route),master=omegaMasterMenuForRouteR289(route),firstOfTier=!navigationLemma.searching&&rows.find(candidate=>organizationForRouteR132(candidate).tier===org.tier)===route;return <Fragment key={route}>{firstOfTier&&<div className='r239-route-group' data-tier={org.tier}><span>{org.tier}</span><small>{TIER_COPY[org.tier]}</small></div>}<button title={`${workspace.copy} · ${org.layout.replaceAll('_',' ')}`} className={'r89-flat-route r104-route '+(currentPanel===route?'active':'')} aria-current={currentPanel===route?'page':undefined} onClick={()=>go(route)} data-route-name={route} data-route-id={chain.routeId} data-capability-id={chain.capabilityId} data-execution-domain={chain.executionDomain} data-execution-state={chain.state} data-master-menu={master?.id||''}>
      <i>{String(index).padStart(2,'0')}</i><span><b>{route}</b><small className='r132-route-meta'><span className='r132-route-tier' data-tier={org.tier}>{org.tier}</span><span>{workspace.label}</span>{master&&<span> · {master.id} {master.label}</span>}{showTechnical&&<span> · {org.surfaceClass} · {org.layout.replaceAll('_',' ')}</span>}</small><em>{showTechnical?`${chain.executionDomain}/${chain.state} · ${CAPABILITY_REALITY_LABEL[reality]}`:workspace.copy}</em></span><ChevronRight/>
     </button></Fragment>})}
     {rows.length===0&&<div className='r88-empty'>No tool matches that recovered-menu/workspace/search combination. The query is preserved as a residual; no destination is fabricated.</div>}
    </div>
    <footer className='r88-navigator-foot r100-navigator-foot r104-navigator-foot'><ShieldCheck/><span>{showTechnical?`R242 lemma navigation ${navigationLemma.structuralPass?'PASS':'HOLD'} · R289 recovered-menu presentation downstream of lemma · residuals ${residualCount} · R143 operation-chain ${operationAudit.pass?'PASS':'HOLD'} · ${operationAudit.mappedRoutes}/${operationAudit.totalRoutes} routes mapped · R239 presentation preserved · navigation has no execution or R125 admission authority.`:'Every registered tool remains reachable. Recovered menus, workspaces and search only filter the same 44-route authority; exact route identity is preserved and navigation does not execute work or change CanonState.'}</span></footer>
   </>:<div className='r88-software-layer'><OmegaSystemInventoryR83 compact onNavigate={go}/></div>}
  </section>
 </aside>;
}

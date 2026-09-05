import {useEffect,useMemo,useState} from 'react';
import {ChevronLeft,ChevronRight,Home,Layers3,Menu,Search,ShieldCheck} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL} from './capabilityAuthority';
import {effectiveCapabilityReality} from './operationalCapabilityRuntimeR45';
import {OMEGA_ALL_ROUTES_R82,workspaceForRouteR82} from './omegaExperienceRegistryR82';
import OmegaSystemInventoryR83 from './OmegaSystemInventoryR83';
import './omegaSideNavigatorR88.css';
import './omegaSideNavigatorR100.css';

type BrowserLayer='EVERYWHERE'|'SOFTWARE';
type Props={currentPanel?:string;onNavigate:(panel:string)=>void;onHome?:()=>void};

export const R88_ALL_ROUTES=OMEGA_ALL_ROUTES_R82;

export default function OmegaSideNavigatorR88({currentPanel='',onNavigate,onHome}:Props){
 const[expanded,setExpanded]=useState(false),[layer,setLayer]=useState<BrowserLayer>('EVERYWHERE'),[query,setQuery]=useState('');
 useEffect(()=>{
  const openNavigator=(e:Event)=>{const detail=(e as CustomEvent<{layer?:'APPLICATIONS'|'SOFTWARE'|'EVERYWHERE'}>).detail;setLayer(detail?.layer==='SOFTWARE'?'SOFTWARE':'EVERYWHERE');setQuery('');setExpanded(true)};
  const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setLayer('EVERYWHERE');setExpanded(true)}if(e.key==='Escape')setExpanded(false)};
  window.addEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.removeEventListener('keydown',key)};
 },[]);
 useEffect(()=>{document.documentElement.dataset.omegaNavPresent='true';document.documentElement.dataset.omegaNavExpanded=expanded?'true':'false';return()=>{delete document.documentElement.dataset.omegaNavPresent;delete document.documentElement.dataset.omegaNavExpanded}},[expanded]);
 const rows=useMemo(()=>{const q=query.trim().toLowerCase();return OMEGA_ALL_ROUTES_R82.filter(route=>{if(!q)return true;const workspace=workspaceForRouteR82(route);return (route+' '+workspace.label+' '+workspace.copy).toLowerCase().includes(q)})},[query]);
 const activeWorkspace=useMemo(()=>currentPanel?workspaceForRouteR82(currentPanel):null,[currentPanel]);
 const go=(panel:string)=>{onNavigate(panel);setExpanded(false);setQuery('')};
 return <aside className={'r94-side-toolbar '+(expanded?'expanded':'collapsed')} aria-label='OMEGA global navigation toolbar'>
  <div className='r94-nav-rail'>
   <button className='r88-navigator-trigger' onClick={()=>{setLayer('EVERYWHERE');setExpanded(v=>!v)}} aria-label={expanded?'Collapse OMEGA navigator':'Expand OMEGA navigator'} aria-expanded={expanded}><Menu/><span>NAV</span><b>44</b></button>
   {onHome&&<button className='r94-rail-action' onClick={()=>{setExpanded(false);onHome()}} aria-label='Go to OMEGA home' title='Home'><Home/><span>HOME</span></button>}
   <button className={'r94-rail-action '+(layer==='EVERYWHERE'&&expanded?'active':'')} onClick={()=>{setLayer('EVERYWHERE');setExpanded(true)}} aria-label='Browse all OMEGA applications' title='Everywhere'><Menu/><span>APPS</span></button>
   <button className={'r94-rail-action '+(layer==='SOFTWARE'&&expanded?'active':'')} onClick={()=>{setLayer('SOFTWARE');setExpanded(true)}} aria-label='Browse software system map' title='Software'><Layers3/><span>SYS</span></button>
   <div className='r94-rail-current' title={currentPanel||'OMEGA'}><i/><span>{currentPanel||'OMEGA'}</span></div>
  </div>
  <section className='r88-navigator r89-flat-navigator r94-nav-panel' aria-hidden={!expanded}>
   <header className='r88-navigator-head'>
    <div><span>OMEGA V6 · COMMAND NAVIGATOR</span><b>{layer==='EVERYWHERE'?'Everywhere':'Software map'}</b><small>{layer==='EVERYWHERE'?(activeWorkspace?`${activeWorkspace.label} active · ${rows.length}/44 directly reachable`:`${rows.length}/44 directly reachable · one continuous list`):'Full system inventory and lineage'}</small></div>
    <div className='r88-head-actions'><button onClick={()=>setExpanded(false)} aria-label='Collapse navigator'><ChevronLeft/></button></div>
   </header>
   <nav className='r89-nav-mode' aria-label='Navigator mode'><button className={layer==='EVERYWHERE'?'active':''} onClick={()=>setLayer('EVERYWHERE')}><Menu/>Everywhere <b>44</b></button><button className={layer==='SOFTWARE'?'active':''} onClick={()=>setLayer('SOFTWARE')}><Layers3/>Software</button></nav>
   {layer==='EVERYWHERE'?<>
    <label className='r88-search'><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search applications, workspaces, capabilities' aria-label='Search all OMEGA applications'/><kbd>⌘K</kbd></label>
    <div className='r89-flat-scroll' aria-label='All 44 OMEGA applications'>
     {rows.map(route=>{const index=OMEGA_ALL_ROUTES_R82.indexOf(route)+1,workspace=workspaceForRouteR82(route),reality=effectiveCapabilityReality(route);return <button key={route} className={'r89-flat-route '+(currentPanel===route?'active':'')} aria-current={currentPanel===route?'page':undefined} onClick={()=>go(route)}>
      <i>{String(index).padStart(2,'0')}</i><span><b>{route}</b><small>{workspace.label} · {CAPABILITY_REALITY_LABEL[reality]}</small></span><ChevronRight/>
     </button>})}
     {rows.length===0&&<div className='r88-empty'>No route matches that search.</div>}
    </div>
    <footer className='r88-navigator-foot'><ShieldCheck/><span>Persistent rail · flat 44-route authority · active application remains visible.</span></footer>
   </>:<div className='r88-software-layer'><OmegaSystemInventoryR83 compact onNavigate={go}/></div>}
  </section>
 </aside>;
}

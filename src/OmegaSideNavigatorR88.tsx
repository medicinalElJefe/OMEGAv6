import {useEffect,useMemo,useState} from 'react';
import {ChevronRight,Home,Layers3,Menu,Search,ShieldCheck,X} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL} from './capabilityAuthority';
import {effectiveCapabilityReality} from './operationalCapabilityRuntimeR45';
import {OMEGA_ALL_ROUTES_R82,workspaceForRouteR82} from './omegaExperienceRegistryR82';
import OmegaSystemInventoryR83 from './OmegaSystemInventoryR83';
import './omegaSideNavigatorR88.css';

type BrowserLayer='EVERYWHERE'|'SOFTWARE';
type Props={currentPanel?:string;onNavigate:(panel:string)=>void;onHome?:()=>void};

export const R88_ALL_ROUTES=OMEGA_ALL_ROUTES_R82;

export default function OmegaSideNavigatorR88({currentPanel='',onNavigate,onHome}:Props){
 const[open,setOpen]=useState(false),[layer,setLayer]=useState<BrowserLayer>('EVERYWHERE'),[query,setQuery]=useState('');
 useEffect(()=>{
  const openNavigator=(e:Event)=>{const detail=(e as CustomEvent<{layer?:'APPLICATIONS'|'SOFTWARE'|'EVERYWHERE'}>).detail;setLayer(detail?.layer==='SOFTWARE'?'SOFTWARE':'EVERYWHERE');setQuery('');setOpen(true)};
  const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setLayer('EVERYWHERE');setOpen(true)}if(e.key==='Escape')setOpen(false)};
  window.addEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.removeEventListener('keydown',key)};
 },[]);
 useEffect(()=>{if(!open){delete document.documentElement.dataset.omegaBrowserOpen;return}const prior=document.body.style.overflow;document.body.style.overflow='hidden';document.documentElement.dataset.omegaBrowserOpen='true';return()=>{document.body.style.overflow=prior;delete document.documentElement.dataset.omegaBrowserOpen}},[open]);
 const rows=useMemo(()=>{const q=query.trim().toLowerCase();return OMEGA_ALL_ROUTES_R82.filter(route=>{if(!q)return true;const workspace=workspaceForRouteR82(route);return (route+' '+workspace.label+' '+workspace.copy).toLowerCase().includes(q)})},[query]);
 const go=(panel:string)=>{onNavigate(panel);setOpen(false);setQuery('')};
 return <>
  <button className='r88-navigator-trigger' onClick={()=>{setLayer('EVERYWHERE');setOpen(true)}} aria-label='Open OMEGA everywhere navigator' aria-expanded={open}><Menu/><span>EVERYWHERE</span><b>44</b></button>
  {open&&<div className='r88-navigator-backdrop' role='presentation' onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <aside className='r88-navigator r89-flat-navigator' role='dialog' aria-modal='true' aria-label='OMEGA everywhere navigator'>
    <header className='r88-navigator-head'>
     <div><span>OMEGA V6</span><b>{layer==='EVERYWHERE'?'Everywhere':'Software map'}</b><small>{layer==='EVERYWHERE'?(rows.length+'/44 directly reachable · one continuous list'):'Full system inventory and lineage'}</small></div>
     <div className='r88-head-actions'>{onHome&&<button onClick={()=>{setOpen(false);onHome()}} aria-label='Go to OMEGA home'><Home/></button>}<button onClick={()=>setOpen(false)} aria-label='Close navigator'><X/></button></div>
    </header>
    <nav className='r89-nav-mode' aria-label='Navigator mode'><button className={layer==='EVERYWHERE'?'active':''} onClick={()=>setLayer('EVERYWHERE')}><Menu/>Everywhere <b>44</b></button><button className={layer==='SOFTWARE'?'active':''} onClick={()=>setLayer('SOFTWARE')}><Layers3/>Software</button></nav>
    {layer==='EVERYWHERE'?<>
     <label className='r88-search'><Search/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder='Find anywhere in OMEGA'/><kbd>⌘K</kbd></label>
     <div className='r89-flat-scroll' aria-label='All 44 OMEGA applications'>
      {rows.map(route=>{const index=OMEGA_ALL_ROUTES_R82.indexOf(route)+1,workspace=workspaceForRouteR82(route),reality=effectiveCapabilityReality(route);return <button key={route} className={'r89-flat-route '+(currentPanel===route?'active':'')} aria-current={currentPanel===route?'page':undefined} onClick={()=>go(route)}>
       <i>{String(index).padStart(2,'0')}</i><span><b>{route}</b><small>{workspace.label} · {CAPABILITY_REALITY_LABEL[reality]}</small></span><ChevronRight/>
      </button>})}
      {rows.length===0&&<div className='r88-empty'>No route matches that search.</div>}
     </div>
     <footer className='r88-navigator-foot'><ShieldCheck/><span>One banner · one scroll · every route directly reachable.</span></footer>
    </>:<div className='r88-software-layer'><OmegaSystemInventoryR83 compact onNavigate={go}/></div>}
   </aside>
  </div>}
 </>;
}

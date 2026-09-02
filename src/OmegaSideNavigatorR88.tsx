import {useEffect,useMemo,useState} from 'react';
import {ChevronRight,Home,Menu,Search,ShieldCheck,X} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL} from './capabilityAuthority';
import {effectiveCapabilityReality} from './operationalCapabilityRuntimeR45';
import {OMEGA_ALL_ROUTES_R82,OMEGA_WORKSPACES_R82} from './omegaExperienceRegistryR82';
import OmegaSystemInventoryR83 from './OmegaSystemInventoryR83';
import './omegaSideNavigatorR88.css';

type BrowserLayer='APPLICATIONS'|'SOFTWARE';
type Props={
 currentPanel?:string;
 onNavigate:(panel:string)=>void;
 onHome?:()=>void;
};

export const R88_ALL_ROUTES=OMEGA_ALL_ROUTES_R82;

export default function OmegaSideNavigatorR88({currentPanel='',onNavigate,onHome}:Props){
 const[open,setOpen]=useState(false);
 const[layer,setLayer]=useState<BrowserLayer>('APPLICATIONS');
 const[query,setQuery]=useState('');
 useEffect(()=>{
  const openNavigator=(e:Event)=>{
   const detail=(e as CustomEvent<{layer?:BrowserLayer}>).detail;
   setLayer(detail?.layer==='SOFTWARE'?'SOFTWARE':'APPLICATIONS');
   setQuery('');
   setOpen(true);
  };
  const key=(e:KeyboardEvent)=>{
   if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setLayer('APPLICATIONS');setOpen(true)}
   if(e.key==='Escape')setOpen(false);
  };
  window.addEventListener('omega-r88-open-navigator',openNavigator as EventListener);
  window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('omega-r88-open-navigator',openNavigator as EventListener);window.removeEventListener('keydown',key)};
 },[]);
 useEffect(()=>{
  if(!open){delete document.documentElement.dataset.omegaBrowserOpen;return}
  const prior=document.body.style.overflow;
  document.body.style.overflow='hidden';
  document.documentElement.dataset.omegaBrowserOpen='true';
  return()=>{document.body.style.overflow=prior;delete document.documentElement.dataset.omegaBrowserOpen};
 },[open]);
 const q=query.trim().toLowerCase();
 const sections=useMemo(()=>OMEGA_WORKSPACES_R82.map(workspace=>({
  ...workspace,
  routes:workspace.routes.filter(route=>!q||route.toLowerCase().includes(q))
 })).filter(workspace=>workspace.routes.length>0),[q]);
 const visibleCount=sections.reduce((n,x)=>n+x.routes.length,0);
 const go=(panel:string)=>{onNavigate(panel);setOpen(false);setQuery('')};
 return <>
  <button className='r88-navigator-trigger' onClick={()=>{setLayer('APPLICATIONS');setOpen(true)}} aria-label='Open OMEGA side navigator' aria-expanded={open}>
   <Menu/><span>MENU</span><b>44</b>
  </button>
  {open&&<div className='r88-navigator-backdrop' role='presentation' onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <aside className='r88-navigator' role='dialog' aria-modal='true' aria-label='OMEGA global side navigator'>
    <header className='r88-navigator-head'>
     <div><span>OMEGA V6 · GLOBAL NAVIGATOR</span><b>{layer==='APPLICATIONS'?'All applications':'Complete software system'}</b><small>{layer==='APPLICATIONS'?`${visibleCount} of 44 routes directly reachable`:'System inventory, runtime families, host lineage and archives'}</small></div>
     <div className='r88-head-actions'>
      {onHome&&<button onClick={()=>{setOpen(false);onHome()}} aria-label='Go to OMEGA home'><Home/></button>}
      <button onClick={()=>setOpen(false)} aria-label='Close navigator'><X/></button>
     </div>
    </header>
    <nav className='r88-layer-switch' aria-label='Navigator layer'>
     <button className={layer==='APPLICATIONS'?'active':''} onClick={()=>setLayer('APPLICATIONS')}>APPLICATIONS <b>44</b></button>
     <button className={layer==='SOFTWARE'?'active':''} onClick={()=>setLayer('SOFTWARE')}>SOFTWARE <b>100+</b></button>
    </nav>
    {layer==='APPLICATIONS'?<>
     <label className='r88-search'><Search/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search all 44 OMEGA applications'/><kbd>⌘K</kbd></label>
     <div className='r88-route-scroll' aria-label='All OMEGA applications'>
      {sections.map(workspace=><section className='r88-route-band' key={workspace.id}>
       <header><span>{workspace.label}</span><small>{workspace.copy}</small><b>{workspace.routes.length}</b></header>
       <div>{workspace.routes.map(route=>{const index=OMEGA_ALL_ROUTES_R82.indexOf(route)+1,reality=effectiveCapabilityReality(route);return <button key={route} className={currentPanel===route?'active':''} aria-current={currentPanel===route?'page':undefined} onClick={()=>go(route)}>
        <i>{String(index).padStart(2,'0')}</i><span><b>{route}</b><small>{CAPABILITY_REALITY_LABEL[reality]}</small></span><ChevronRight/>
       </button>})}</div>
      </section>)}
      {visibleCount===0&&<div className='r88-empty'>No application matches that search.</div>}
     </div>
     <footer className='r88-navigator-foot'><ShieldCheck/><span>One scroll owner · 44 canonical routes · active software keeps the viewport.</span></footer>
    </>:<div className='r88-software-layer'><OmegaSystemInventoryR83 compact onNavigate={go}/></div>}
   </aside>
  </div>}
 </>;
}

import {useEffect,useMemo,useState} from 'react';
import {ChevronLeft,ChevronRight,Home,Layers3,Menu,Orbit,Search,ShieldCheck,Sparkles,Waypoints} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL} from './capabilityAuthority';
import {effectiveCapabilityReality} from './operationalCapabilityRuntimeR45';
import {OMEGA_ALL_ROUTES_R82,workspaceForRouteR82} from './omegaExperienceRegistryR82';
import OmegaSystemInventoryR83 from './OmegaSystemInventoryR83';
import './omegaSideNavigatorR88.css';
import './omegaSideNavigatorR100.css';

type BrowserLayer='EVERYWHERE'|'SOFTWARE';
type Props={currentPanel?:string;onNavigate:(panel:string)=>void;onHome?:()=>void};

export const R88_ALL_ROUTES=OMEGA_ALL_ROUTES_R82;
const routeMark=(name:string)=>{const words=name.split(/\s+/).filter(Boolean);return words.map((x,i)=>i<2?x[0]:'').join('').toUpperCase()||'Ω'};

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
 const go=(panel:string)=>{onNavigate(panel);setExpanded(false);setQuery('')};
 const open=(next:BrowserLayer)=>{setLayer(next);setExpanded(true)};
 return <aside className={'r94-side-toolbar r100-professional-nav '+(expanded?'expanded':'collapsed')} aria-label='OMEGA global navigation toolbar'>
  <div className='r94-nav-rail'>
   <button className='r88-navigator-trigger r100-rail-cap' onClick={()=>{setLayer('EVERYWHERE');setExpanded(v=>!v)}} aria-label={expanded?'Collapse OMEGA navigator':'Expand OMEGA navigator'} aria-expanded={expanded}>
    <span className='r100-omega-mark'>Ω</span><small>MENU</small><b>44</b>
   </button>
   <div className='r100-rail-divider'/>
   {onHome&&<button className='r94-rail-action r100-rail-home' onClick={()=>{setExpanded(false);onHome()}} aria-label='Go to OMEGA home' title='Home'><Home/><span>HOME</span></button>}
   <button className={'r94-rail-action '+(currentPanel==='Command Center'?'active':'')} onClick={()=>go('Command Center')} aria-label='Open Command Center' title='Command Center'><Sparkles/><span>CORE</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(currentPanel==='Extreme Traversal'?'active':'')} onClick={()=>go('Extreme Traversal')} aria-label='Open Woven Continuity traversal instrument' title='Extreme Traversal'><Waypoints/><span>WEAVE</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(currentPanel==='Matter Traversal'?'active':'')} onClick={()=>go('Matter Traversal')} aria-label='Open Matter Traversal' title='Matter Traversal'><Orbit/><span>MATTER</span></button>
   <button className={'r94-rail-action r100-rail-jump '+(currentPanel==='Evidence & Proof'?'active':'')} onClick={()=>go('Evidence & Proof')} aria-label='Open Evidence and Proof' title='Evidence & Proof'><ShieldCheck/><span>PROOF</span></button>
   <div className='r100-rail-divider'/>
   <button className={'r94-rail-action '+(layer==='EVERYWHERE'&&expanded?'active':'')} onClick={()=>open('EVERYWHERE')} aria-label='Browse all OMEGA applications' title='Everywhere'><Menu/><span>APPS</span></button>
   <button className={'r94-rail-action '+(layer==='SOFTWARE'&&expanded?'active':'')} onClick={()=>open('SOFTWARE')} aria-label='Browse software system map' title='Software'><Layers3/><span>SYS</span></button>
   <div className='r94-rail-current r100-rail-current' title={currentPanel||'OMEGA'}><i/><small>ACTIVE</small><b>{routeMark(currentPanel||'OMEGA')}</b></div>
  </div>
  <section className='r88-navigator r89-flat-navigator r94-nav-panel r100-nav-panel' aria-hidden={!expanded}>
   <header className='r88-navigator-head r100-navigator-head'>
    <div><span>OMEGA V6 · INSTRUMENT OS</span><b>{layer==='EVERYWHERE'?'Everywhere':'Software map'}</b><small>{layer==='EVERYWHERE'?(rows.length+'/44 routes · canonical state remains continuous'):'Full software inventory, lineage and capability truth'}</small></div>
    <div className='r88-head-actions'><button onClick={()=>setExpanded(false)} aria-label='Collapse navigator'><ChevronLeft/></button></div>
   </header>
   <nav className='r89-nav-mode r100-nav-mode' aria-label='Navigator mode'><button className={layer==='EVERYWHERE'?'active':''} onClick={()=>setLayer('EVERYWHERE')}><Menu/>Everywhere <b>44</b></button><button className={layer==='SOFTWARE'?'active':''} onClick={()=>setLayer('SOFTWARE')}><Layers3/>Software map</button></nav>
   {currentPanel&&<div className='r100-active-route'><span>ACTIVE INSTRUMENT</span><b>{currentPanel}</b><i>{workspaceForRouteR82(currentPanel as any).label}</i></div>}
   {layer==='EVERYWHERE'?<>
    <label className='r88-search r100-search'><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search all 44 OMEGA applications'/><kbd>⌘K</kbd></label>
    <div className='r89-flat-scroll' aria-label='All 44 OMEGA applications'>
     {rows.map(route=>{const index=OMEGA_ALL_ROUTES_R82.indexOf(route)+1,workspace=workspaceForRouteR82(route),reality=effectiveCapabilityReality(route);return <button key={route} className={'r89-flat-route '+(currentPanel===route?'active':'')} aria-current={currentPanel===route?'page':undefined} onClick={()=>go(route)}>
      <i>{String(index).padStart(2,'0')}</i><span><b>{route}</b><small>{workspace.label} · {CAPABILITY_REALITY_LABEL[reality]}</small></span><ChevronRight/>
     </button>})}
     {rows.length===0&&<div className='r88-empty'>No route matches that search.</div>}
    </div>
    <footer className='r88-navigator-foot r100-navigator-foot'><ShieldCheck/><span>Persistent rail · active application remains visible · one canonical packet · 44 preserved destinations.</span></footer>
   </>:<div className='r88-software-layer'><OmegaSystemInventoryR83 compact onNavigate={go}/></div>}
  </section>
 </aside>;
}

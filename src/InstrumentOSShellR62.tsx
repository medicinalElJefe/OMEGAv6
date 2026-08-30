import {useEffect,useMemo,useState} from 'react';
import {BrainCircuit,Command,Eye,Home,Layers3,Menu,Search,Settings2,ShieldCheck,Sparkles,X} from 'lucide-react';
import {CAPABILITY_REALITY_LABEL} from './capabilityAuthority';
import {effectiveCapabilityReality} from './operationalCapabilityRuntimeR45';
import type {OmegaUiMode} from './SingleFrameRuntimeShellR27';
import './instrumentOSR62.css';

type Props={uiMode:OmegaUiMode;onUiMode:(mode:OmegaUiMode)=>void;panel:string;onNavigate:(panel:string)=>void;record:any;modePolicy:string;modeCount:number;busy:string};
type WorkspaceId='COMMAND'|'EXPLORE'|'INTELLIGENCE'|'EVIDENCE'|'BUILD'|'SYSTEM';
const WORKSPACES=[
 {id:'COMMAND' as const,label:'Command',copy:'ask · work · connect',Icon:Command,routes:['Command Center','Workspace','Cockpit','Hybrid Link']},
 {id:'EXPLORE' as const,label:'Explore',copy:'matter · earth · motion · scale',Icon:Eye,routes:['Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal','Visual Instrument','Relativity','Earth Now','Forecast','Atlas','Field','Data Motion','Reality Lab','Atlas Calculator','Infinity','Convergence','Scale Compiler']},
 {id:'INTELLIGENCE' as const,label:'Intelligence',copy:'modes · SAI · memory',Icon:BrainCircuit,routes:['Modes','Kernel Intelligence','Memory','Canon Evolution','SAI Lab']},
 {id:'EVIDENCE' as const,label:'Evidence',copy:'proof · archive · governance',Icon:ShieldCheck,routes:['Quality Compiler','Evidence & Proof','Archive Census','Archive Operators','Governance','Validation']},
 {id:'BUILD' as const,label:'Build',copy:'create · develop · assets',Icon:Sparkles,routes:['Create','Projects','Render Queue','Assets','Development','Build Out']},
 {id:'SYSTEM' as const,label:'System',copy:'atlas · settings · plugins',Icon:Settings2,routes:['Instructions','Plugins','Settings','System','System Atlas','Control Matrix','Consolidation']}
] as const;
const ALL=WORKSPACES.flatMap(x=>x.routes);
const workspaceFor=(panel:string)=>WORKSPACES.find(x=>x.routes.includes(panel as never))||WORKSPACES[0];

export default function InstrumentOSShellR62({uiMode,panel,onNavigate,record,modeCount,busy}:Props){
 const[open,setOpen]=useState(false),[active,setActive]=useState<WorkspaceId>(()=>workspaceFor(panel).id),[query,setQuery]=useState('');
 useEffect(()=>{
  const media=window.matchMedia('(max-width: 900px)');
  const sync=()=>{const frame=uiMode==='MOBILE'?'mobile':uiMode==='DESKTOP'?'desktop':media.matches?'mobile':'desktop';document.documentElement.dataset.omegaFrame=frame};
  sync();
  if(uiMode==='AUTO')media.addEventListener('change',sync);
  return()=>{if(uiMode==='AUTO')media.removeEventListener('change',sync)};
 },[uiMode]);
 const current=workspaceFor(panel);
 const selected=WORKSPACES.find(x=>x.id===active)||current;
 const routes=useMemo(()=>{const q=query.trim().toLowerCase();return q?ALL.filter(x=>x.toLowerCase().includes(q)):selected.routes},[query,selected]);
 const go=(name:string)=>{onNavigate(name);setOpen(false);setQuery('')};
 return <>
  <aside className='r62-rail' aria-label='OMEGA instrument navigation'>
   <button className='r62-home' onClick={()=>window.dispatchEvent(new CustomEvent('omega-home-request'))} aria-label='OMEGA home'><Home/></button>
   <button className='r62-menu' onClick={()=>{setActive(current.id);setOpen(true)}} aria-label='Open instruments'><Menu/></button>
   <nav>{WORKSPACES.map(w=>{const I=w.Icon;return <button key={w.id} className={current.id===w.id?'active':''} title={`${w.label} — ${w.copy}`} onClick={()=>{setActive(w.id);setOpen(true)}}><I/><span>{w.label}</span></button>})}</nav>
   <div className='r62-rail-state'><span>{busy?'RUN':'LIVE'}</span><b>{record?.metrics?.decision||'—'}</b><small>{modeCount} modes</small></div>
  </aside>
  {open&&<div className='r62-overlay' role='presentation' onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <section className='r62-drawer' role='dialog' aria-modal='true' aria-label='OMEGA instrument browser'>
    <header><div><span>OMEGA INSTRUMENT OS</span><h2>{selected.label}</h2><p>{selected.copy}</p></div><button onClick={()=>setOpen(false)} aria-label='Close instruments'><X/></button></header>
    <nav className='r62-workspaces'>{WORKSPACES.map(w=>{const I=w.Icon;return <button key={w.id} className={selected.id===w.id?'active':''} onClick={()=>{setActive(w.id);setQuery('')}}><I/><span><b>{w.label}</b><small>{w.routes.length} instruments</small></span></button>})}</nav>
    <label className='r62-search'><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search every OMEGA instrument…'/></label>
    <div className='r62-route-grid'>{routes.map(name=>{const reality=effectiveCapabilityReality(name);return <button key={name} className={panel===name?'active':''} onClick={()=>go(name)}><span><b>{name}</b><small>{CAPABILITY_REALITY_LABEL[reality]}</small></span><Layers3/></button>})}</div>
    <footer><span>44 historical routes remain reachable.</span><b>Navigation no longer owns the viewport.</b></footer>
   </section>
  </div>}
 </>;
}

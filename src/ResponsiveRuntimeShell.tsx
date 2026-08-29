import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,Archive,BrainCircuit,ChevronRight,Command,Earth,Eye,Focus,FolderKanban,Hammer,Menu,Search,Settings2,ShieldCheck,X} from 'lucide-react';
import {RUNTIME_IDENTITY} from './runtimeIdentity';
import './menuUniverse.css';

export type OmegaUiMode='AUTO'|'DESKTOP'|'MOBILE';
type Props={uiMode:OmegaUiMode;onUiMode:(mode:OmegaUiMode)=>void;panel:string;onNavigate:(panel:string)=>void;record:any;modePolicy:string;modeCount:number;busy:string};
type DomainId='COMMAND'|'VISUALIZE'|'EARTH'|'INTELLIGENCE'|'BUILD'|'EVIDENCE'|'SYSTEM';
type Domain={id:DomainId;label:string;description:string;routes:readonly string[]};

const DOMAINS:readonly Domain[]=[
 {id:'COMMAND',label:'Command',description:'Ask · operate · coordinate',routes:['Command Center','Workspace','Cockpit','Hybrid Link','Create']},
 {id:'VISUALIZE',label:'Visualize',description:'Fields · traversal · relativity',routes:['Visual Instrument','Field','Data Motion','Atlas','Traversal','Immersive Traversal','Matter Traversal','Extreme Traversal','Relativity','Atlas Calculator','Infinity','Convergence','Scale Compiler']},
 {id:'EARTH',label:'Earth',description:'Evidence · now · forecast',routes:['Earth Now','Forecast','Reality Lab']},
 {id:'INTELLIGENCE',label:'Intelligence',description:'Modes · SAI · memory',routes:['Modes','Kernel Intelligence','SAI Lab','Memory','Canon Evolution']},
 {id:'BUILD',label:'Build',description:'Projects · assets · production',routes:['Development','Build Out','Projects','Render Queue','Assets','Consolidation']},
 {id:'EVIDENCE',label:'Evidence',description:'Proof · archive · governance',routes:['Evidence & Proof','Archive Census','Archive Operators','Governance','Quality Compiler','Validation']},
 {id:'SYSTEM',label:'System',description:'Runtime · controls · configuration',routes:['System Atlas','Control Matrix','System','Plugins','Settings','Instructions']}
] as const;
const ALL_ROUTES=DOMAINS.flatMap(d=>d.routes);
const ROUTE_NO=new Map(ALL_ROUTES.map((r,i)=>[r,String(i+1).padStart(2,'0')]));
const iconFor=(id:DomainId)=>id==='COMMAND'?Command:id==='VISUALIZE'?Eye:id==='EARTH'?Earth:id==='INTELLIGENCE'?BrainCircuit:id==='BUILD'?Hammer:id==='EVIDENCE'?ShieldCheck:Settings2;
function stateNumber(r:any){const x=Number(r?.stateId);return Number.isFinite(x)?x:Number(r?.address)+1}
function n(v:any,d=3){const x=Number(v);return Number.isFinite(x)?x.toFixed(d):'—'}
function domainFor(panel:string){return DOMAINS.find(d=>d.routes.includes(panel))||DOMAINS[0]}

export function LayoutModeSwitch({value,onChange,compact=false}:{value:OmegaUiMode;onChange:(mode:OmegaUiMode)=>void;compact?:boolean}){return <div className={'omega-layout-switch '+(compact?'compact':'')} role='group' aria-label='Workspace layout'>{(['AUTO','DESKTOP','MOBILE'] as OmegaUiMode[]).map(mode=><button key={mode} className={value===mode?'active':''} aria-pressed={value===mode} onClick={()=>onChange(mode)}>{compact?mode.slice(0,1):mode}</button>)}</div>}

function RouteButton({route,panel,onNavigate,close}:{route:string;panel:string;onNavigate:(p:string)=>void;close?:()=>void}){return <button className={'nav20-route '+(panel===route?'active':'')} aria-current={panel===route?'page':undefined} onClick={()=>{onNavigate(route);close?.()}}><code>{ROUTE_NO.get(route)||'--'}</code><span>{route}</span><ChevronRight size={14}/></button>}

function GlobalSearch({open,onClose,panel,onNavigate}:{open:boolean;onClose:()=>void;panel:string;onNavigate:(p:string)=>void}){const[q,setQ]=useState(''),input=useRef<HTMLInputElement|null>(null);useEffect(()=>{if(open){setQ('');setTimeout(()=>input.current?.focus(),20)}},[open]);const rows=useMemo(()=>ALL_ROUTES.filter(r=>r.toLowerCase().includes(q.trim().toLowerCase())),[q]);if(!open)return null;return <div className='nav20-search-backdrop' role='presentation' onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className='nav20-search' role='dialog' aria-modal='true' aria-label='Search OMEGA applications'><header><Search size={18}/><input ref={input} value={q} onChange={e=>setQ(e.target.value)} placeholder='Search all 44 OMEGA applications…' onKeyDown={e=>e.key==='Escape'&&onClose()}/><kbd>ESC</kbd></header><div className='nav20-search-results'>{rows.map(r=><RouteButton key={r} route={r} panel={panel} onNavigate={onNavigate} close={onClose}/>)}</div><footer><span>{rows.length} destinations</span><small>One route registry · no decorative menu entries</small></footer></section></div>}

export function ResponsiveRuntimeShell({uiMode,onUiMode,panel,onNavigate,record,modePolicy,modeCount,busy}:Props){
 const current=domainFor(panel),[domain,setDomain]=useState<DomainId>(current.id),[expanded,setExpanded]=useState(false),[search,setSearch]=useState(false),[mobileMenu,setMobileMenu]=useState(false),[focus,setFocus]=useState(false),metrics=record?.metrics||{},state=stateNumber(record);
 useEffect(()=>{setDomain(current.id)},[current.id]);
 useEffect(()=>{localStorage.setItem('omega-ui-mode',uiMode);document.documentElement.dataset.omegaLayout=uiMode.toLowerCase();return()=>{delete document.documentElement.dataset.omegaLayout}},[uiMode]);
 useEffect(()=>{document.documentElement.dataset.omegaNav=expanded?'expanded':'compact';document.documentElement.dataset.omegaFocus=focus?'true':'false';return()=>{delete document.documentElement.dataset.omegaNav;delete document.documentElement.dataset.omegaFocus}},[expanded,focus]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearch(true)}if(e.key==='Escape'){setSearch(false);setMobileMenu(false);setExpanded(false)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
 const activeDomain=DOMAINS.find(d=>d.id===domain)||current;
 const chooseDomain=(id:DomainId)=>{setDomain(id);setExpanded(true)};
 return <>
  <aside className='nav20-desktop' aria-label='OMEGA primary navigation'>
   <button className='nav20-mark' onClick={()=>onNavigate('Command Center')} aria-label='OMEGA Command Center'><span>Ω</span><small>OMEGA</small></button>
   <nav>{DOMAINS.map(d=>{const I=iconFor(d.id);return <button key={d.id} className={(domain===d.id?'selected ':'')+(current.id===d.id?'current':'')} onClick={()=>chooseDomain(d.id)} title={d.description}><I size={18}/><span>{d.label}</span></button>})}</nav>
   <div className='nav20-rail-actions'><button onClick={()=>setSearch(true)} title='Search (Ctrl/⌘ K)'><Search size={17}/><span>Search</span></button><button className={focus?'active':''} onClick={()=>setFocus(v=>!v)} title='Focus mode'><Focus size={17}/><span>Focus</span></button></div>
  </aside>
  <aside className={'nav20-context '+(expanded?'open':'')} aria-label={`${activeDomain.label} applications`}>
   <header><div><span>{activeDomain.label.toUpperCase()}</span><b>{activeDomain.description}</b></div><button onClick={()=>setExpanded(false)} aria-label='Close application rail'><X size={16}/></button></header>
   <div className='nav20-context-list'>{activeDomain.routes.map(r=><RouteButton key={r} route={r} panel={panel} onNavigate={onNavigate}/>)}</div>
   <footer><span>STATE {state.toLocaleString()}</span><b>{String(metrics.decision||'—')}</b></footer>
  </aside>
  <div className='nav20-breadcrumb' aria-label='Current workspace location'><button onClick={()=>chooseDomain(current.id)}>{current.label}</button><ChevronRight size={13}/><b>{panel}</b><span>STATE {state.toLocaleString()} · {String(metrics.decision||'—')} · CΩ {n(metrics.continuity)} · q {n(metrics.contradiction)}</span><button className='nav20-search-button' onClick={()=>setSearch(true)}><Search size={14}/>Search <kbd>⌘K</kbd></button></div>
  <GlobalSearch open={search} onClose={()=>setSearch(false)} panel={panel} onNavigate={onNavigate}/>

  <header className='nav20-mobile-head'><button className='nav20-mobile-mark' onClick={()=>onNavigate('Command Center')}>Ω</button><div><b>{panel}</b><small>{busy?'BUSY · '+busy:`${RUNTIME_IDENTITY.hostedBuild} · STATE ${state.toLocaleString()}`}</small></div><button onClick={()=>setSearch(true)} aria-label='Search'><Search size={17}/></button></header>
  <nav className='nav20-mobile-bottom' aria-label='Primary mobile navigation'>{(['COMMAND','VISUALIZE','EARTH','INTELLIGENCE'] as DomainId[]).map(id=>{const d=DOMAINS.find(x=>x.id===id)!;const I=iconFor(id);return <button key={id} className={current.id===id?'active':''} onClick={()=>{setDomain(id);setMobileMenu(true)}}><I size={18}/><span>{d.label}</span></button>})}<button className={mobileMenu?'active':''} onClick={()=>setMobileMenu(true)}><Menu size={18}/><span>More</span></button></nav>
  {mobileMenu&&<div className='nav20-mobile-sheet'><header><div><span>OMEGA WORKSPACE</span><b>All operational domains</b></div><button onClick={()=>setMobileMenu(false)}><X size={18}/></button></header><div className='nav20-mobile-domains'>{DOMAINS.map(d=>{const I=iconFor(d.id);return <button key={d.id} className={domain===d.id?'active':''} onClick={()=>setDomain(d.id)}><I size={18}/><span><b>{d.label}</b><small>{d.description}</small></span><ChevronRight size={15}/></button>})}</div><section className='nav20-mobile-routes'><header><span>{activeDomain.label}</span><small>{activeDomain.routes.length} applications</small></header>{activeDomain.routes.map(r=><RouteButton key={r} route={r} panel={panel} onNavigate={onNavigate} close={()=>setMobileMenu(false)}/>)}</section><footer><span>STATE {state.toLocaleString()}</span><span>{modePolicy} · {modeCount} modes</span><LayoutModeSwitch value={uiMode} onChange={onUiMode} compact/></footer></div>}
 </>
}
export default ResponsiveRuntimeShell;

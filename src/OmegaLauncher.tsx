import {useEffect,useMemo,useState} from 'react';
import {BrainCircuit,ChevronRight,Command,Globe2,Heart,Layers3,Search,ShieldCheck,Sparkles,Waypoints,X} from 'lucide-react';
import {OMEGA_NAVIGATION} from './navigationRegistry';
import './omegaLauncher.css';
import './omegaLauncherR12.css';
import './omegaLauncherR13.css';

type Props={onNavigate:(name:string)=>void};
export const LAUNCHER_SURFACES=OMEGA_NAVIGATION;
const DOMAIN_SECTIONS=[
 {id:'COMMAND',label:'Command',subtitle:'Start, converse, orient',icon:'command',items:['Command Center','Workspace','Cockpit','Create']},
 {id:'VISUAL',label:'Visualize',subtitle:'See and traverse the state space',icon:'visual',items:['Visual Instrument','Immersive Traversal','Matter Traversal','Extreme Traversal','Traversal','Relativity','Atlas','Atlas Calculator','Infinity','Scale Compiler']},
 {id:'EARTH',label:'Earth & Forecast',subtitle:'Evidence, field motion, futures',icon:'earth',items:['Earth Now','Forecast','Reality Lab','Data Motion','Field','Convergence']},
 {id:'INTELLIGENCE',label:'Intelligence',subtitle:'Modes, SAI, memory, guidance',icon:'intelligence',items:['Modes','Kernel Intelligence','SAI Lab','Memory','Instructions']},
 {id:'BUILD',label:'Build',subtitle:'Develop, render, organize',icon:'build',items:['Development','Build Out','Projects','Render Queue','Assets','Quality Compiler']},
 {id:'PROOF',label:'Evidence',subtitle:'Proof, validation, archive',icon:'proof',items:['Evidence & Proof','Archive Census','Archive Operators','Validation']},
 {id:'SYSTEM',label:'System',subtitle:'Hybrid, governance, configuration',icon:'system',items:['Hybrid Link','Governance','Consolidation','Canon Evolution','Plugins','Settings','System','System Atlas','Control Matrix']}
] as const;
function icon(kind:string){return kind==='command'?<Command/>:kind==='visual'?<Sparkles/>:kind==='earth'?<Globe2/>:kind==='intelligence'?<BrainCircuit/>:kind==='build'?<Layers3/>:kind==='proof'?<ShieldCheck/>:<Waypoints/>}
function readList(key:string){try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'):[]}catch{return[]}}
export default function OmegaLauncher({onNavigate}:Props){
 const[open,setOpen]=useState(false),[q,setQ]=useState(''),[domain,setDomain]=useState<(typeof DOMAIN_SECTIONS)[number]['id']>('COMMAND'),[favorites,setFavorites]=useState<string[]>(()=>readList('omega.v6.favorites')),[recent,setRecent]=useState<string[]>(()=>readList('omega.v6.recent'));
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setOpen(true)}if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
 const searchResults=useMemo(()=>{const s=q.trim().toLowerCase();return s?LAUNCHER_SURFACES.filter(x=>(x.name+' '+x.group+' '+x.hint+' '+x.id+' '+x.effect+' '+x.authority).toLowerCase().includes(s)):[]},[q]);
 const activeDomain=DOMAIN_SECTIONS.find(x=>x.id===domain)??DOMAIN_SECTIONS[0];
 const domainRows=useMemo(()=>LAUNCHER_SURFACES.filter(x=>(activeDomain.items as readonly string[]).includes(x.name)),[activeDomain]);
 const rows=q?searchResults:domainRows;
 const go=(name:string)=>{const n=[name,...recent.filter(x=>x!==name)].slice(0,6);setRecent(n);localStorage.setItem('omega.v6.recent',JSON.stringify(n));localStorage.setItem('omega.v6.panel',JSON.stringify(name));setOpen(false);onNavigate(name)};
 const fav=(name:string,e:any)=>{e.stopPropagation();const n=favorites.includes(name)?favorites.filter(x=>x!==name):[...favorites,name];setFavorites(n);localStorage.setItem('omega.v6.favorites',JSON.stringify(n))};
 const activate=(name:string,e:React.KeyboardEvent<HTMLDivElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(name)}};
 return <><button className='omega-nexus-trigger' onClick={()=>setOpen(true)} aria-label='Open OMEGA navigator'><Command/><span>OPEN</span></button>{open&&<div className='omega-nexus-backdrop' role='presentation' onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><section className='omega-nexus omega-nexus-r13' role='dialog' aria-modal='true' aria-label='OMEGA navigator'>
  <aside className='omega-r13-domains'><div className='omega-r13-brand'><span>OMEGA</span><b>Navigator</b><small>44 real applications</small></div>{DOMAIN_SECTIONS.map(d=><button key={d.id} className={domain===d.id&&!q?'active':''} onClick={()=>{setDomain(d.id);setQ('')}}>{icon(d.icon)}<span><b>{d.label}</b><small>{d.subtitle}</small></span><em>{d.items.length}</em></button>)}<div className='omega-r13-domain-foot'><ShieldCheck/><span>One route authority<br/>No decorative controls</span></div></aside>
  <div className='omega-r13-content'><header className='omega-r13-head'><div><span>{q?'SEARCH RESULTS':activeDomain.label.toUpperCase()}</span><h2>{q?`Results for “${q}”`:activeDomain.subtitle}</h2></div><button onClick={()=>setOpen(false)} aria-label='Close navigator'><X/></button></header>
  <div className='omega-nexus-search'><Search/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder='Search any capability or application…'/><kbd>CTRL K</kbd></div>
  {!q&&recent.length>0&&<div className='omega-nexus-recents'><span>RECENT</span>{recent.slice(0,4).map(name=><button key={name} onClick={()=>go(name)}>{name}<ChevronRight/></button>)}</div>}
  <main className='omega-r13-app-list'>{rows.map(x=><div className='omega-nexus-card' role='button' tabIndex={0} data-r13-app key={x.id} onClick={()=>go(x.name)} onKeyDown={e=>activate(x.name,e)} aria-label={`Open ${x.name}`}><code>{x.id}</code><span><b>{x.name}</b><small>{x.hint}</small></span><em>{x.effect.replace('_',' ')}</em><button type='button' className={'omega-nexus-fav '+(favorites.includes(x.name)?'active':'')} onClick={e=>fav(x.name,e)} aria-label={(favorites.includes(x.name)?'Remove ':'Add ')+x.name+' favorite'}><Heart/></button><ChevronRight/></div>)}{rows.length===0&&<div className='omega-r13-empty'>No matching OMEGA application.</div>}</main>
  <footer><span>{q?`${rows.length} matches`:`${activeDomain.items.length} applications in ${activeDomain.label}`}</span><b>ALL MODES remains computationally active</b></footer></div>
 </section></div>}</>}

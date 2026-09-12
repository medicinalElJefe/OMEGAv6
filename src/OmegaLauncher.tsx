import {useEffect,useMemo,useState} from 'react';
import {BrainCircuit,ChevronRight,Command,Globe2,Heart,Layers3,Search,ShieldCheck,Sparkles,Waypoints,X} from 'lucide-react';
import {OMEGA_MASTER_MENU_NAVIGATION_R289,OMEGA_NAVIGATION,omegaMasterMenuForRouteR289} from './navigationRegistry';
import './omegaLauncherR13.css';
import './omegaLauncherR289.css';

type Props={onNavigate:(name:string)=>void};
export const LAUNCHER_SURFACES=OMEGA_NAVIGATION;
export const LAUNCHER_MASTER_MENUS_R289=OMEGA_MASTER_MENU_NAVIGATION_R289;
function icon(id:string){return id==='01'||id==='12'?<Command/>:id==='03'||id==='04'?<Sparkles/>:id==='09'?<Globe2/>:id==='06'?<BrainCircuit/>:id==='07'||id==='10'?<Layers3/>:id==='02'||id==='11'?<ShieldCheck/>:<Waypoints/>}
function readList(key:string){try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'):[]}catch{return[]}}
export default function OmegaLauncher({onNavigate}:Props){
 const[open,setOpen]=useState(false),[q,setQ]=useState(''),[menu,setMenu]=useState<(typeof LAUNCHER_MASTER_MENUS_R289)[number]['id']>('12'),[favorites,setFavorites]=useState<string[]>(()=>readList('omega.v6.favorites')),[recent,setRecent]=useState<string[]>(()=>readList('omega.v6.recent'));
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setOpen(v=>!v)}if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
 const searchResults=useMemo(()=>{const s=q.trim().toLowerCase();return s?LAUNCHER_SURFACES.filter(x=>{const master=omegaMasterMenuForRouteR289(x.name);return (x.name+' '+x.group+' '+x.hint+' '+x.id+' '+x.effect+' '+x.authority+' '+(master?.label||'')+' '+(master?.purpose||'')).toLowerCase().includes(s)}):[]},[q]);
 const activeMenu=LAUNCHER_MASTER_MENUS_R289.find(x=>x.id===menu)??LAUNCHER_MASTER_MENUS_R289[0];
 const rows=q?searchResults:activeMenu.routes;
 const go=(name:string)=>{const n=[name,...recent.filter(x=>x!==name)].slice(0,6);setRecent(n);localStorage.setItem('omega.v6.recent',JSON.stringify(n));localStorage.setItem('omega.v6.panel',JSON.stringify(name));setOpen(false);onNavigate(name)};
 const fav=(name:string,e:any)=>{e.stopPropagation();const n=favorites.includes(name)?favorites.filter(x=>x!==name):[...favorites,name];setFavorites(n);localStorage.setItem('omega.v6.favorites',JSON.stringify(n))};
 const activate=(name:string,e:React.KeyboardEvent<HTMLDivElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(name)}};
 return <><button className='omega-nexus-trigger' onClick={()=>setOpen(true)} aria-label='Open OMEGA navigator'><Command/><span>Menu</span></button>{open&&<div className='omega-nexus-backdrop' role='presentation' onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><section className='omega-nexus omega-nexus-r13' role='dialog' aria-modal='true' aria-label='OMEGA navigator'>
  <aside className='omega-r13-domains' aria-label='OMEGA recovered master menus'><div className='omega-r13-brand' aria-label='OMEGA'><strong>Ω</strong></div>{LAUNCHER_MASTER_MENUS_R289.map(d=><button key={d.id} className={menu===d.id&&!q?'active':''} onClick={()=>{setMenu(d.id);setQ('')}} aria-label={`${d.id} ${d.label}`} title={`${d.id} ${d.label} — ${d.purpose}`}>{icon(d.id)}<span>{d.id} {d.label}</span></button>)}<div className='omega-r13-domain-foot'><ShieldCheck/></div></aside>
  <div className='omega-r13-content'><header className='omega-r13-head'><div><span>{q?'Search':`${activeMenu.id} · ${activeMenu.label}`}</span><small>{q?`${rows.length} matching applications`:activeMenu.purpose}</small></div><button onClick={()=>setOpen(false)} aria-label='Close navigator'><X/></button></header>
  <div className='omega-nexus-search'><Search/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder='Find an application, recovered family or capability'/><kbd>⌘K</kbd></div>
  {!q&&recent.length>0&&<div className='omega-nexus-recents'><span>Recent</span>{recent.slice(0,3).map(name=><button key={name} onClick={()=>go(name)}>{name}</button>)}</div>}
  <main className='omega-r13-app-list' aria-label={q?'Search results':`${activeMenu.label} applications`}>{rows.map(x=><div className='omega-nexus-card' role='button' tabIndex={0} data-r13-app data-master-menu={omegaMasterMenuForRouteR289(x.name)?.id||''} data-authority={x.authority} data-effect={x.effect} key={x.id} onClick={()=>go(x.name)} onKeyDown={e=>activate(x.name,e)} aria-label={`Open ${x.name}`}><span><b>{x.name}</b><small>{x.hint}</small></span><button type='button' className={'omega-nexus-fav '+(favorites.includes(x.name)?'active':'')} onClick={e=>fav(x.name,e)} aria-label={(favorites.includes(x.name)?'Remove ':'Add ')+x.name+' favorite'}><Heart/></button><ChevronRight/></div>)}{rows.length===0&&<div className='omega-r13-empty'>No matching application.</div>}</main>
  <footer><span>{q?`${rows.length} results`:`${activeMenu.routes.length} applications · menu ${activeMenu.id}`}</span><span>44 routes · 12 recovered menus · ALL MODES</span></footer></div>
 </section></div>}</>}

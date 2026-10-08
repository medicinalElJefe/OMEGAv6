import {useMemo,useState} from 'react';
import {Archive,ChevronRight,Cpu,Play,Search,ShieldCheck,Sparkles} from 'lucide-react';
import {SOFTWARE_LAUNCH_ROWS_R512,SOFTWARE_LAUNCH_SUMMARY_R512,type SoftwareLaunchClassR512} from './softwareLaunchRegistryR512';
import './softwareLibraryR512.css';

type Props={onNavigate:(route:string)=>void};
type Filter='ALL'|SoftwareLaunchClassR512;

const FILTERS:readonly {id:Filter;label:string;copy:string}[]=[
 {id:'ALL',label:'All software',copy:'Every recovered software lineage with a current executor contract'},
 {id:'WORKS_NOW',label:'Works now',copy:'Current executor is available in this runtime'},
 {id:'SUCCESSOR_ADAPTER',label:'Successor apps',copy:'Historical software runs through a current successor surface'},
 {id:'EVIDENCE_GATED',label:'Gated',copy:'Executor exists, but evidence/device/provider proof is required'},
];

const stateCopy=(state:SoftwareLaunchClassR512)=>state==='WORKS_NOW'
 ?'Current executor'
 :state==='SUCCESSOR_ADAPTER'
  ?'Runs through successor'
  :'Evidence/device gated';

export default function SoftwareLibraryR512({onNavigate}:Props){
 const[filter,setFilter]=useState<Filter>('ALL');
 const[query,setQuery]=useState('');
 const q=query.trim().toLowerCase();
 const rows=useMemo(()=>SOFTWARE_LAUNCH_ROWS_R512.filter(row=>{
  if(filter!=='ALL'&&row.launchClass!==filter)return false;
  if(!q)return true;
  return [row.id,row.name,row.domain,row.route,row.workspace,row.operation,row.contribution,row.truth,...row.aliases].join(' ').toLowerCase().includes(q);
 }),[filter,q]);
 const groups=useMemo(()=>Array.from(new Set(rows.map(x=>x.domain))),[rows]);

 return <section className='r512-software-library' data-r512-software-library='true'>
  <header className='r512-software-head'>
   <div>
    <span>OMEGA SOFTWARE LIBRARY · R512</span>
    <h3>Launch working software, not catalog labels</h3>
    <p>Recovered software names are preserved as searchable aliases. Launch opens the current executor that now carries that software’s functions. Adapter and evidence-gated states stay explicit.</p>
   </div>
   <div className='r512-software-kpis'>
    <article><b>{SOFTWARE_LAUNCH_SUMMARY_R512.worksNow}</b><small>works now</small></article>
    <article><b>{SOFTWARE_LAUNCH_SUMMARY_R512.adapters}</b><small>successor apps</small></article>
    <article><b>{SOFTWARE_LAUNCH_SUMMARY_R512.gated}</b><small>gated</small></article>
   </div>
  </header>

  <label className='r512-software-search'><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search old software names, current apps, operations, or domains…'/></label>

  <nav className='r512-software-filters' aria-label='Software readiness filters'>
   {FILTERS.map(x=><button key={x.id} className={filter===x.id?'active':''} onClick={()=>setFilter(x.id)} aria-pressed={filter===x.id} title={x.copy}>{x.label}</button>)}
  </nav>

  <div className='r512-software-summary' role='status'>
   <span>{rows.length} software lineages</span>
   <small>{filter==='ALL'?'Grouped by function and current executor state':FILTERS.find(x=>x.id===filter)?.copy}</small>
  </div>

  <div className='r512-software-scroll'>
   {groups.map(domain=><section key={domain} className='r512-software-domain' data-domain={domain}>
    <header><b>{domain}</b><small>{rows.filter(x=>x.domain===domain).length} working lineage{rows.filter(x=>x.domain===domain).length===1?'':'s'}</small></header>
    <div className='r512-software-grid'>
     {rows.filter(x=>x.domain===domain).map(row=><article key={row.id} className='r512-software-card' data-launch-class={row.launchClass} data-launchable={row.launchable?'true':'false'}>
      <div className='r512-card-state'>
       {row.launchClass==='WORKS_NOW'?<Play/>:row.launchClass==='SUCCESSOR_ADAPTER'?<Sparkles/>:<ShieldCheck/>}
       <span>{stateCopy(row.launchClass)}</span>
      </div>
      <div className='r512-card-copy'>
       <code>{row.id}</code>
       <h4>{row.name}</h4>
       <p>{row.contribution}</p>
       <div className='r512-aliases'>{row.aliases.slice(0,6).map(alias=><span key={alias}>{alias}</span>)}</div>
      </div>
      <div className='r512-executor'>
       <span>CURRENT EXECUTOR</span>
       <b>{row.route}</b>
       <small>{row.workspace} · {row.operation}</small>
      </div>
      <div className='r512-truth'><ShieldCheck/><small>{row.truth}</small></div>
      <button className='r512-launch' disabled={!row.launchable} onClick={()=>row.launchable&&onNavigate(row.route)} aria-label={`${row.actionLabel} ${row.name} through ${row.route}`}>
       {row.launchable?row.actionLabel:'No executor'}<ChevronRight/>
      </button>
     </article>)}
    </div>
   </section>)}
   {rows.length===0&&<div className='r512-empty'><Archive/><b>No software matches this search.</b><span>Nothing is fabricated. Try a historical software name, function, or current route.</span></div>}
  </div>

  <footer className='r512-software-foot'><Cpu/><span><b>Execution rule:</b> historical software does not run as a second competing OS. Its preserved functions launch through the strongest current executor. Evidence-gated software opens the executor but does not claim unavailable device/provider evidence. Archive donors remain in System Atlas and Archive Census rather than pretending to be runnable.</span></footer>
 </section>;
}

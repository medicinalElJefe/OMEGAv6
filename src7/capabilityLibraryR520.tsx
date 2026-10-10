import {useMemo,useState} from 'react';
import {Archive,ArrowUpRight,BookOpen,Compass,Database,Layers3,Search,ShieldCheck,X} from 'lucide-react';
import {OMEGA7_CAPABILITIES,OMEGA7_DOMAINS,type Omega7Domain} from './capabilityRegistry';
import {R486_VISIBLE_CAPABILITIES} from './visibleCapabilityConvergenceR486';
import {RECOVERED_SYSTEM_EXECUTION_R512} from '../src/recoveredSoftwareExecutionR512';
import type {R512RecoveredSystemResolution} from '../src/recoveredSoftwareExecutionR512';
import './capabilityLibraryR520.css';

export const R520_LIBRARY_SCHEMA='OMEGA_SOURCE_BACKED_COMPLETE_FUNCTION_LIBRARY_R520' as const;
type LibraryTab='ROUTES'|'RECOVERED'|'HISTORY';
const LABELS:Record<Omega7Domain,string>={HOME:'Home',WORK:'Work',EXPLORE:'Explore',CREATE:'Create',DEVELOP:'Develop',SYSTEM:'System'};
const matching=(query:string,...fields:string[])=>{
 const q=query.trim().toLowerCase();
 if(!q)return true;
 const text=fields.join(' ').toLowerCase();
 return q.split(/\s+/).filter(Boolean).every(term=>text.includes(term));
};
const routeOrder=[...OMEGA7_DOMAINS.filter(x=>x!=='HOME'),'HOME'] as Omega7Domain[];
const recoveredFamilies=['UNDERSTAND','EXPLORE','CREATE','BUILD','WORK','RECOVER'] as const;
const stateText=(value:string)=>value.replaceAll('_',' ').toLowerCase();

export function R520CapabilityLibrary({onClose,onRoute,onRecovered,onHistorical}:{onClose:()=>void;onRoute:(route:string)=>void;onRecovered:(row:(typeof R486_VISIBLE_CAPABILITIES)[number])=>void;onHistorical:(row:R512RecoveredSystemResolution)=>void}){
 const [tab,setTab]=useState<LibraryTab>('ROUTES');
 const [query,setQuery]=useState('');
 const [scope,setScope]=useState('ALL');
 const [openGroups,setOpenGroups]=useState<string[]>([]);
 const routes=useMemo(()=>OMEGA7_CAPABILITIES.filter(x=>(scope==='ALL'||x.domain===scope)&&matching(query,x.label,x.legacyRoute,x.family,x.description,x.effect,x.keywords.join(' '))),[query,scope]);
 const recovered=useMemo(()=>R486_VISIBLE_CAPABILITIES.filter(x=>(scope==='ALL'||x.family===scope)&&matching(query,x.name,x.family,x.operation,x.route,x.contribution,x.aliases.join(' '))),[query,scope]);
 const historical=useMemo(()=>RECOVERED_SYSTEM_EXECUTION_R512.filter(x=>(scope==='ALL'||x.state===scope)&&matching(query,x.artifact,x.family,x.role,x.capability,x.route,x.state,x.systemId)),[query,scope]);
 const setSection=(next:LibraryTab)=>{setTab(next);setScope('ALL');setQuery('');setOpenGroups([])};
 const groups=tab==='ROUTES'?routeOrder.map(d=>({key:d,label:LABELS[d],count:routes.filter(x=>x.domain===d).length})).filter(x=>x.count>0):tab==='RECOVERED'?recoveredFamilies.map(f=>({key:f,label:f[0]+f.slice(1).toLowerCase(),count:recovered.filter(x=>x.family===f).length})).filter(x=>x.count>0):['WORKING_SUCCESSOR','GATED_SUCCESSOR','RESTORATION_REQUIRED','ARCHIVE_ONLY'].map(s=>({key:s,label:s.replaceAll('_',' '),count:historical.filter(x=>x.state===s).length})).filter(x=>x.count>0);
 const isExpanded=(key:string)=>query.trim().length>0||openGroups.includes(key);
 const toggleGroup=(key:string)=>setOpenGroups(prev=>prev.includes(key)?prev.filter(x=>x!==key):[...prev,key]);
 const scopes=tab==='ROUTES'?OMEGA7_DOMAINS.map(x=>({value:x,label:LABELS[x]})):tab==='RECOVERED'?recoveredFamilies.map(x=>({value:x,label:x[0]+x.slice(1).toLowerCase()})):['WORKING_SUCCESSOR','GATED_SUCCESSOR','RESTORATION_REQUIRED','ARCHIVE_ONLY'].map(x=>({value:x,label:x.replaceAll('_',' ')}));
 const total=tab==='ROUTES'?routes.length:tab==='RECOVERED'?recovered.length:historical.length;
 return <div className='o7-r520-backdrop' data-r520-library='true' onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className='o7-r520-library' role='dialog' aria-modal='true' aria-label='OMEGA complete function library'>
   <header className='o7-r520-header'><div className='o7-r520-emblem' aria-hidden='true'>Ω</div><div><span className='o7-r520-kicker'>FULL CAPABILITY FABRIC · SOURCE CONNECTED</span><h2>All OMEGA Functions</h2><p>Find actual instruments, recovered functions and historical software without flattening their execution truth.</p></div><button type='button' className='o7-r520-close' aria-label='Close function library' onClick={onClose}><X size={20}/></button></header>
   <div className='o7-r520-matrix' role='tablist' aria-label='Function source inventories'>
    <button type='button' role='tab' aria-selected={tab==='ROUTES'} className={tab==='ROUTES'?'active':''} onClick={()=>setSection('ROUTES')} data-r520-tab='ROUTES'><Compass size={17}/><span><strong>{OMEGA7_CAPABILITIES.length}</strong> Current tools</span></button>
    <button type='button' role='tab' aria-selected={tab==='RECOVERED'} className={tab==='RECOVERED'?'active':''} onClick={()=>setSection('RECOVERED')} data-r520-tab='RECOVERED'><Layers3 size={17}/><span><strong>{R486_VISIBLE_CAPABILITIES.length}</strong> Recovered lineages</span></button>
    <button type='button' role='tab' aria-selected={tab==='HISTORY'} className={tab==='HISTORY'?'active':''} onClick={()=>setSection('HISTORY')} data-r520-tab='HISTORY'><Archive size={17}/><span><strong>{RECOVERED_SYSTEM_EXECUTION_R512.length}</strong> Historical systems</span></button>
   </div>
   <div className='o7-r520-controls'><label className='o7-r520-search'><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='HISTORY'?'Find old software by original name or function…':'Search functions, instruments, geometry, modes, aliases…'} aria-label='Search all functions' autoFocus/></label><select aria-label='Filter function group' value={scope} onChange={e=>{setScope(e.target.value);setOpenGroups([])}}><option value='ALL'>All groups</option>{scopes.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select><span className='o7-r520-result'>{total} shown</span></div>
   <div className='o7-r520-scroll' role='tabpanel' aria-label={tab==='ROUTES'?'Current executable route inventory':tab==='RECOVERED'?'Recovered capability lineages':'Historical software ledger'}>
    {groups.length===0&&<div className='o7-r520-empty'>No source entries match these filters. Try another term or group.</div>}
    {groups.map(g=><section key={g.key} className='o7-r520-group' data-r520-group={g.key}>
     <button type='button' className='o7-r520-group-title' aria-expanded={isExpanded(g.key)} onClick={()=>toggleGroup(g.key)}><span><BookOpen size={16}/>{g.label}</span><span>{g.count} source entries <span aria-hidden='true'>{isExpanded(g.key)?'−':'+'}</span></span></button>
     {isExpanded(g.key)&&<div className='o7-r520-entries'>
      {tab==='ROUTES'&&routes.filter(x=>x.domain===g.key).map(x=><article key={x.id} data-r520-route={x.legacyRoute} data-r520-state={x.availability.toLowerCase()}><div className='o7-r520-entry-copy'><span className='o7-r520-identity'>{x.family} · {x.legacyRoute}</span><h3>{x.label}</h3><p>{x.description}</p><small>{x.availability==='READY'?'Source ready':x.availability==='HELD'?'Evidence or connection gated':stateText(x.availability)} · {x.reality}</small></div><button type='button' onClick={()=>onRoute(x.legacyRoute)} aria-label={'Open '+x.label}>Open instrument <ArrowUpRight size={14}/></button></article>)}
      {tab==='RECOVERED'&&recovered.filter(x=>x.family===g.key).map(x=><article key={x.id} data-r520-recovered={x.id} data-r520-state={x.state.toLowerCase()}><div className='o7-r520-entry-copy'><span className='o7-r520-identity'>{x.family} · {x.operation}</span><h3>{x.name}</h3><p>{x.contribution}</p><small>{x.state==='TRUTH_GATED'?'Evidence gated · ':'Bound current route · '}{x.route} · {x.receiptAuthority}/{x.admissionAuthority}</small></div><button type='button' onClick={()=>onRecovered(x)}>{x.state==='TRUTH_GATED'?'Open evidence gate':'Open successor'} <ArrowUpRight size={14}/></button></article>)}
      {tab==='HISTORY'&&historical.filter(x=>x.state===g.key).map(x=><article key={x.systemId} data-r520-historical={x.systemId} data-r520-state={x.state.toLowerCase()}><div className='o7-r520-entry-copy'><span className='o7-r520-identity'>{x.systemId} · {x.family} · {x.role}</span><h3>{x.artifact}</h3><p>{x.capability}</p><small>{x.state==='ARCHIVE_ONLY'?'Donor lineage only':x.state==='RESTORATION_REQUIRED'?'No verified executable successor':x.state==='GATED_SUCCESSOR'?'Successor requires evidence':'Current successor mapped'} · {x.route}</small></div><button type='button' onClick={()=>onHistorical(x)}>{x.state==='ARCHIVE_ONLY'?'Inspect lineage':x.state==='RESTORATION_REQUIRED'?'Inspect restoration':x.state==='GATED_SUCCESSOR'?'Open evidence gate':'Open successor'} <ArrowUpRight size={14}/></button></article>)}
     </div>}
    </section>)}
   </div>
   <footer className='o7-r520-footer'><ShieldCheck size={15}/><span>Inventories overlap: historical record ≠ independently executable app. Source readiness, proof gates and canonical authority remain separate.</span><span className='o7-r520-source'><Database size={13}/> R512 · R486 · R83</span></footer>
  </section>
 </div>;
}

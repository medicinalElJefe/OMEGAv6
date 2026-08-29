import {useEffect,useMemo,useState} from 'react';
import {BrainCircuit,ChevronDown,ChevronUp,Search,ShieldCheck,Waypoints} from 'lucide-react';
import {corpusState,evaluateCorpusModes,initCorpusPack} from './corpusRuntime';
import {localState} from './platformAdapter';
import {ALL_MODES_BOUNDARY,CANON_AUTHORITY_STACK,evaluateCanonAuthorityStack,type CanonAuthorityGroup} from './allModesAuthority';
import './omegaModeAuthorityR12.css';

type Props={onNavigate:(panel:string)=>void};
const GROUPS:CanonAuthorityGroup[]=['FOUNDATION','EXECUTION','LANGUAGE_RUNTIME','LAWS'];

export default function OmegaModeAuthorityDock({onNavigate}:Props){
 const[open,setOpen]=useState(false),[ready,setReady]=useState(false),[query,setQuery]=useState(''),[address,setAddress]=useState(()=>Math.max(0,Math.min(20735,Number(localState.read('omega.v6.address',11498))||11498)));
 useEffect(()=>{let active=true;initCorpusPack().then(()=>{if(active)setReady(true)}).catch(()=>{if(active)setReady(false)});return()=>{active=false}},[]);
 useEffect(()=>{const tick=()=>{const next=Math.max(0,Math.min(20735,Number(localState.read('omega.v6.address',address))||0));setAddress(v=>v===next?v:next)};tick();const id=window.setInterval(tick,650);return()=>window.clearInterval(id)},[address]);
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const sourceModes=useMemo(()=>record?evaluateCorpusModes(record):null,[record]);
 const authorities=useMemo(()=>record?evaluateCanonAuthorityStack(record):[],[record]);
 const q=query.trim().toLowerCase();
 const sourceVisible=useMemo(()=>!sourceModes?[]:sourceModes.results.filter((m:any)=>!q||`${m.id} ${m.name} ${m.category} ${m.operator} ${m.algebra}`.toLowerCase().includes(q)),[sourceModes,q]);
 const authorityVisible=useMemo(()=>authorities.filter(a=>!q||`${a.id} ${a.name} ${a.group} ${a.basis}`.toLowerCase().includes(q)),[authorities,q]);
 const counts=useMemo(()=>({active:authorities.filter(x=>x.state==='ACTIVE').length,watch:authorities.filter(x=>x.state==='WATCH').length,quiet:authorities.filter(x=>x.state==='QUIET').length}),[authorities]);
 return <aside className={'omega-mode-authority-r12 '+(open?'open':'closed')} aria-label='OMEGA ALL MODES authority'>
   <button className='omar12-handle' onClick={()=>setOpen(v=>!v)} aria-expanded={open}>
     <BrainCircuit size={17}/><span><b>ALL MODES</b><small>{ready&&sourceModes?`${sourceModes.count}/179 SOURCE · ${CANON_AUTHORITY_STACK.length}/62 CANON`:'LOADING AUTHORITY'}</small></span>{open?<ChevronDown size={16}/>:<ChevronUp size={16}/>} 
   </button>
   {open&&<div className='omar12-body'>
     <header className='omar12-head'><div><span>OMEGA R12 · COMPLETE MODE AUTHORITY</span><h2>Source execution + canon governance</h2><p>The 179 corpus evaluations and 62 canon/calculus authorities are shown separately. They share one canonical packet and are never added together as a fake executor count.</p></div><ShieldCheck/></header>
     <div className='omar12-summary'>
       <div><span>SOURCE MODES</span><b>{sourceModes?.count??'—'} / {ALL_MODES_BOUNDARY.sourceModeEvaluations}</b><small>executable corpus registry</small></div>
       <div><span>CANON AUTHORITIES</span><b>{authorities.length} / {ALL_MODES_BOUNDARY.canonAuthorities}</b><small>governance/calculus lenses</small></div>
       <div><span>ACTIVE / WATCH / QUIET</span><b>{counts.active} / {counts.watch} / {counts.quiet}</b><small>current packet activation</small></div>
       <div><span>STATE</span><b>{address+1}</b><small>same 20,736-state authority</small></div>
     </div>
     <div className='omar12-actions'><label><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search all source modes and canon authorities…'/></label><button onClick={()=>onNavigate('Modes')}>OPEN SOURCE MODE MAP</button><button onClick={()=>onNavigate('System Atlas')}>OPEN SYSTEM ATLAS</button></div>
     <section className='omar12-canon'><div className='omar12-section-title'><Waypoints size={14}/><b>62 HIGHER-ORDER CANON / CALCULUS AUTHORITIES</b><span>{authorityVisible.length} visible</span></div>
       {GROUPS.map(group=>{const rows=authorityVisible.filter(a=>a.group===group);return rows.length?<div className='omar12-group' key={group}><header>{group.replace('_',' ')}<span>{rows.length}</span></header><div className='omar12-grid'>{rows.map(a=><article key={a.id} className={a.state.toLowerCase()}><code>{String(a.id).padStart(2,'0')}</code><div><b>{a.name}</b><small>{a.basis}</small></div><strong>{a.state}<i style={{'--activation':a.activation} as any}/></strong></article>)}</div></div>:null})}
     </section>
     <details className='omar12-source'><summary>179 SOURCE-MODE EVALUATIONS <span>{sourceVisible.length} visible · {sourceModes?.stay??0} STAY · {sourceModes?.turn??0} TURN · {sourceModes?.escalate??0} ESCALATE</span></summary><div className='omar12-source-grid'>{sourceVisible.map((m:any)=><article key={m.id}><code>{m.id}</code><div><b>{m.name}</b><small>{m.category} · {m.operator||'operator governed'}</small><em>{m.algebra||m.calculus||'source-derived evaluation'}</em></div><strong className={String(m.gate).toLowerCase()}>{m.gate}<span>{Number(m.score).toFixed(3)}</span></strong></article>)}</div></details>
     <footer><ShieldCheck size={13}/><span>{ALL_MODES_BOUNDARY.countingRule} {ALL_MODES_BOUNDARY.truthBoundary}</span></footer>
   </div>}
 </aside>
}

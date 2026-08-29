import {useEffect,useMemo,useState} from 'react';
import {BrainCircuit,ChevronDown,ChevronUp,Search,ShieldCheck,Waypoints} from 'lucide-react';
import {corpusState,evaluateCorpusModes,initCorpusPack} from './corpusRuntime';
import {localState} from './platformAdapter';
import {ALL_MODES_BOUNDARY,CANON_AUTHORITY_STACK,evaluateCanonAuthorityStack,type CanonAuthorityGroup} from './allModesAuthority';
import './omegaModeAuthorityR12.css';

type Props={onNavigate:(panel:string)=>void};
const GROUPS:CanonAuthorityGroup[]=['FOUNDATION','EXECUTION','LANGUAGE_RUNTIME','LAWS'];

export default function OmegaModeAuthorityDock({onNavigate}:Props){
 const[open,setOpen]=useState(false),[ready,setReady]=useState(false),[query,setQuery]=useState(''),[selected,setSelected]=useState(''),[address,setAddress]=useState(()=>Math.max(0,Math.min(20735,Number(localState.read('omega.v6.address',11498))||11498)));
 useEffect(()=>{let active=true;initCorpusPack().then(()=>{if(active)setReady(true)}).catch(()=>{if(active)setReady(false)});return()=>{active=false}},[]);
 useEffect(()=>{const tick=()=>{const next=Math.max(0,Math.min(20735,Number(localState.read('omega.v6.address',address))||0));setAddress(v=>v===next?v:next)};tick();const id=window.setInterval(tick,650);return()=>window.clearInterval(id)},[address]);
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const sourceModes=useMemo(()=>record?evaluateCorpusModes(record):null,[record]);
 const authorities=useMemo(()=>record?evaluateCanonAuthorityStack(record):[],[record]);
 const q=query.trim().toLowerCase();
 const sourceVisible=useMemo(()=>!sourceModes?[]:sourceModes.results.filter((m:any)=>!q||`${m.id} ${m.name} ${m.category} ${m.operator} ${m.algebra} ${m.calculus}`.toLowerCase().includes(q)),[sourceModes,q]);
 const authorityVisible=useMemo(()=>authorities.filter(a=>!q||`${a.id} ${a.name} ${a.group} ${a.basis}`.toLowerCase().includes(q)),[authorities,q]);
 const selectedMode=useMemo(()=>sourceModes?.results.find((m:any)=>String(m.id)===selected)||null,[sourceModes,selected]);
 return <aside className={'omega-mode-authority-r12 '+(open?'open':'closed')} aria-label='OMEGA source mode catalog authority'>
   <button className='omar12-handle' onClick={()=>setOpen(v=>!v)} aria-expanded={open}>
     <BrainCircuit size={17}/><span><b>SOURCE MODE CATALOG</b><small>{ready&&sourceModes?`${sourceModes.count}/179 CATALOG · ${CANON_AUTHORITY_STACK.length} DERIVED LENSES`:'LOADING SOURCE REGISTRY'}</small></span>{open?<ChevronDown size={16}/>:<ChevronUp size={16}/>} 
   </button>
   {open&&<div className='omar12-body'>
     <header className='omar12-head'><div><span>OMEGA R21 · SOURCE MODE CATALOG INSPECTOR</span><h2>Catalog first. Execution only with bound inputs.</h2><p>The 179 corpus rows retain source operator, algebra, calculus, update and proof metadata. Their legacy metric-affinity score is an inspection aid, not proof that each donor formula executed. Exact execution authority lives in the source-backed calculus runtime.</p></div><ShieldCheck/></header>
     <div className='omar12-summary'>
       <div><span>SOURCE MODE CATALOG</span><b>{sourceModes?.count??'—'} / {ALL_MODES_BOUNDARY.sourceModeEvaluations}</b><small>metadata + legacy affinity inspection</small></div>
       <div><span>DERIVED CANON LENSES</span><b>{authorities.length} / {ALL_MODES_BOUNDARY.canonAuthorities}</b><small>not independent software executors</small></div>
       <div><span>STATE</span><b>{address+1}</b><small>same 20,736-state packet</small></div>
       <div><span>DECISION</span><b>{record?.metrics?.decision??'—'}</b><small>source packet gate</small></div>
     </div>
     <div className='omar12-actions'><label><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search operators, algebra, calculus, proof…'/></label><button onClick={()=>onNavigate('Modes')}>OPEN SOURCE-BACKED MODES</button><button onClick={()=>onNavigate('System Atlas')}>OPEN SYSTEM ATLAS</button></div>
     <section className='omar12-source-exec'><div className='omar12-section-title'><BrainCircuit size={14}/><b>179 SOURCE CATALOG RECORDS</b><span>{sourceVisible.length} visible</span></div><div className='omar12-source-grid'>{sourceVisible.map((m:any)=><button key={m.id} onClick={()=>setSelected(String(m.id))} className={`omar12-mode ${String(m.gate).toLowerCase()} ${String(m.id)===selected?'selected':''}`}><code>{m.id}</code><div><b>{m.name}</b><small>{m.category} · {m.operator||'operator governed'}</small><em>{m.algebra||m.calculus||'source metadata'}</em></div><strong>AFFINITY {m.gate}<span>{Number(m.score).toFixed(3)}</span></strong></button>)}</div></section>
     {selectedMode&&<section className='omar12-proof'><header><span>SELECTED SOURCE CONTRACT</span><b>{selectedMode.name}</b></header><dl><div><dt>Operator</dt><dd>{selectedMode.operator||'—'}</dd></div><div><dt>Algebra</dt><dd>{selectedMode.algebra||'—'}</dd></div><div><dt>Calculus</dt><dd>{selectedMode.calculus||'—'}</dd></div><div><dt>Update rule</dt><dd>{selectedMode.updateRule||'—'}</dd></div><div><dt>Proof requirement</dt><dd>{selectedMode.proof||'—'}</dd></div><div><dt>Ledger fields</dt><dd>{selectedMode.ledger||'—'}</dd></div></dl><p>Execution status is intentionally not inferred from this catalog affinity score. Open Modes for source-backed execution and missing-input gates.</p></section>}
     <details className='omar12-canon'><summary><Waypoints size={14}/>62 DERIVED CANON / CALCULUS LENSES <span>{authorityVisible.length} visible</span></summary>{GROUPS.map(group=>{const rows=authorityVisible.filter(a=>a.group===group);return rows.length?<div className='omar12-group' key={group}><header>{group.replace('_',' ')}<span>{rows.length}</span></header><div className='omar12-grid'>{rows.map(a=><article key={a.id}><code>{String(a.id).padStart(2,'0')}</code><div><b>{a.name}</b><small>{a.basis}</small></div><strong>DERIVED</strong></article>)}</div></div>:null})}</details>
     <footer><ShieldCheck size={13}/><span>{ALL_MODES_BOUNDARY.countingRule} {ALL_MODES_BOUNDARY.truthBoundary}</span></footer>
   </div>}
 </aside>
}

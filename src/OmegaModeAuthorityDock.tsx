import {useEffect,useMemo,useState} from 'react';
import {BrainCircuit,ChevronDown,ChevronUp,Search,ShieldCheck,Waypoints} from 'lucide-react';
import {corpusState,evaluateCorpusModes,initCorpusPack} from './corpusRuntime';
import {localState} from './platformAdapter';
import {ALL_MODES_BOUNDARY,CANON_AUTHORITY_STACK,evaluateCanonAuthorityStack,type CanonAuthorityGroup} from './allModesAuthority';
import {compileModeRealizationRegistryR280} from './modeRealizationRegistryR280';
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
 const realization=useMemo(()=>record?compileModeRealizationRegistryR280(record):null,[record]);
 const realizationById=useMemo(()=>new Map((realization?.rows||[]).map(x=>[x.id,x])),[realization]);
 const q=query.trim().toLowerCase();
 const sourceVisible=useMemo(()=>!sourceModes?[]:sourceModes.results.filter((m:any)=>!q||`${m.id} ${m.name} ${m.category} ${m.operator} ${m.algebra} ${m.calculus}`.toLowerCase().includes(q)),[sourceModes,q]);
 const authorityVisible=useMemo(()=>authorities.filter(a=>{const r=realizationById.get(a.id);return!q||`${a.id} ${a.name} ${a.group} ${a.basis} ${r?.stage||''} ${r?.executionClass||''}`.toLowerCase().includes(q)}),[authorities,q,realizationById]);
 const selectedMode=useMemo(()=>sourceModes?.results.find((m:any)=>String(m.id)===selected)||null,[sourceModes,selected]);
 return <aside className={'omega-mode-authority-r12 '+(open?'open':'closed')} aria-label='OMEGA source mode catalog authority'>
   <button className='omar12-handle' onClick={()=>setOpen(v=>!v)} aria-expanded={open}>
     <BrainCircuit size={17}/><span><b>SOURCE MODE CATALOG</b><small>{ready&&sourceModes?`${sourceModes.count}/179 CATALOG · ${CANON_AUTHORITY_STACK.length} LENSES · ${realization?.summary.domainExecutable??0} DOMAIN-BOUND`:'LOADING SOURCE REGISTRY'}</small></span>{open?<ChevronDown size={16}/>:<ChevronUp size={16}/>} 
   </button>
   {open&&<div className='omar12-body'>
     <header className='omar12-head'><div><span>OMEGA R280 · MODE REALIZATION / SOURCE AUTHORITY</span><h2>Named is not realized. Every mode now carries an explicit implementation state.</h2><p>The 179 corpus rows retain source operator, algebra, calculus, update and proof metadata. R280 separately reports which higher-order modes are charted, implemented, tested, promoted, or still gated. A derived lens never masquerades as an independent domain executor.</p><p>legacy metric-affinity score is an inspection aid, not proof that each donor formula executed</p></div><ShieldCheck/></header>
     <div className='omar12-summary'>
       <div><span>SOURCE MODE CATALOG</span><b>{sourceModes?.count??'—'} / {ALL_MODES_BOUNDARY.sourceModeEvaluations}</b><small>metadata + source evaluation</small></div>
       <div><span>62 DERIVED CANON / CALCULUS LENSES</span><b>{authorities.length} / {ALL_MODES_BOUNDARY.canonAuthorities}</b><small>read-only derived lenses</small></div>
       <div><span>DOMAIN-BOUND</span><b>{realization?.summary.domainExecutable??'—'}</b><small>source/domain runtimes, not lens-only</small></div>
       <div><span>PROMOTED / TESTED</span><b>{realization?`${realization.summary.promoted} / ${realization.summary.tested}`:'—'}</b><small>runtime evidence classification</small></div>
       <div><span>GATED / CHARTED</span><b>{realization?`${realization.summary.gated} / ${realization.summary.charted}`:'—'}</b><small>remaining realization debt</small></div>
       <div><span>STATE</span><b>{address+1}</b><small>same 20,736-state packet</small></div>
       <div><span>DECISION</span><b>{record?.metrics?.decision??'—'}</b><small>source packet gate</small></div>
     </div>
     <div className='omar12-actions'><label><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search operators, algebra, calculus, proof, realization…'/></label><button onClick={()=>onNavigate('Modes')}>OPEN SOURCE-BACKED MODES</button><button onClick={()=>onNavigate('System Atlas')}>OPEN SYSTEM ATLAS</button></div>
     <section className='omar12-source-exec'><div className='omar12-section-title'><BrainCircuit size={14}/><b>179 SOURCE CATALOG RECORDS</b><span>{sourceVisible.length} visible</span></div><div className='omar12-source-grid'>{sourceVisible.map((m:any)=><button key={m.id} onClick={()=>setSelected(String(m.id))} className={`omar12-mode ${String(m.gate).toLowerCase()} ${String(m.id)===selected?'selected':''}`}><code>{m.id}</code><div><b>{m.name}</b><small>{m.category} · {m.operator||'operator governed'}</small><em>{m.algebra||m.calculus||'source metadata'}</em></div><strong>AFFINITY {m.gate}<span>{Number(m.score).toFixed(3)}</span></strong></button>)}</div></section>
     {selectedMode&&<section className='omar12-proof'><header><span>SELECTED SOURCE CONTRACT</span><b>{selectedMode.name}</b></header><dl><div><dt>Operator</dt><dd>{selectedMode.operator||'—'}</dd></div><div><dt>Algebra</dt><dd>{selectedMode.algebra||'—'}</dd></div><div><dt>Calculus</dt><dd>{selectedMode.calculus||'—'}</dd></div><div><dt>Update rule</dt><dd>{selectedMode.updateRule||'—'}</dd></div><div><dt>Proof requirement</dt><dd>{selectedMode.proof||'—'}</dd></div><div><dt>Ledger fields</dt><dd>{selectedMode.ledger||'—'}</dd></div></dl><p>Execution status is intentionally not inferred from this catalog affinity score. R280 realization state is evaluated independently from the source catalog.</p></section>}
     <details className='omar12-canon' open><summary><Waypoints size={14}/>R280 MODE REALIZATION REGISTRY <span>{realization?.authorityCount??0} authorities</span></summary>{GROUPS.map(group=>{const rows=authorityVisible.filter(a=>a.group===group);return rows.length?<div className='omar12-group' key={group}><header>{group.replace('_',' ')}<span>{rows.length}</span></header><div className='omar12-grid'>{rows.map(a=>{const r=realizationById.get(a.id);return <article key={a.id}><code>{String(a.id).padStart(2,'0')}</code><div><b>{a.name}</b><small>{r?.executionClass||'DERIVED_LENS'} · {r?.gaps?.length?r.gaps.join(' · '):'BOUND'}</small></div><strong>{r?.stage||'CHARTED'}</strong></article>})}</div></div>:null})}</details>
     <footer><ShieldCheck size={13}/><span>{realization?.truthBoundary||`${ALL_MODES_BOUNDARY.countingRule} ${ALL_MODES_BOUNDARY.truthBoundary}`}</span></footer>
   </div>}
 </aside>
}

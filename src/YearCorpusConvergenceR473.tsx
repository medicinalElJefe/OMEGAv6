import {useMemo,useState} from 'react';
import {Activity,ArrowRight,Filter,Search,ShieldCheck} from 'lucide-react';
import {YEAR_CORPUS_EXECUTION_R473,YEAR_CORPUS_EXECUTION_SUMMARY_R473,compileCorpusExecutionPlanR473,type CorpusBindingR473,type CorpusExecutionStateR473} from './yearCorpusExecutionR473';
import './yearCorpusConvergenceR473.css';

type Props={onNavigate:(route:string)=>void};
const STATE_LABEL:Record<CorpusExecutionStateR473,string>={
 EXECUTES_NOW:'CURRENT EXECUTOR',
 EXECUTES_AS_ADAPTER:'CURRENT ADAPTER',
 TRUTH_GATED:'TRUTH GATED'
};

function activate(binding:CorpusBindingR473){
 const plan=compileCorpusExecutionPlanR473(binding);const packet={schema:'OMEGA_CORPUS_EXECUTION_INTENT_R473',id:binding.id,name:binding.name,route:binding.route,operation:binding.operation,domain:binding.domain,state:binding.state,capabilityId:plan.capabilityId,executionDomain:plan.executionDomain,capabilityReality:plan.capabilityReality,routable:plan.routable,receiptAuthority:plan.receiptAuthority,admissionAuthority:plan.admissionAuthority,at:new Date().toISOString(),canonicalMutation:false};
 try{
  localStorage.setItem('omega.r473.corpusExecutionIntent',JSON.stringify(packet));
  window.dispatchEvent(new CustomEvent('omega:r473-corpus-execution',{detail:packet}));
 }catch{}
 return packet;
}

export default function YearCorpusConvergenceR473({onNavigate}:Props){
 const[q,setQ]=useState(''),[state,setState]=useState<'ALL'|CorpusExecutionStateR473>('ALL'),[domain,setDomain]=useState('ALL');
 const domains=useMemo(()=>['ALL',...Array.from(new Set(YEAR_CORPUS_EXECUTION_R473.map(x=>x.domain)))],[ ]);
 const rows=useMemo(()=>YEAR_CORPUS_EXECUTION_R473.filter(x=>{
  const needle=q.trim().toLowerCase();
  const text=[x.id,x.name,x.domain,x.operation,x.contribution,x.truth,...x.aliases].join(' ').toLowerCase();
  return(state==='ALL'||x.state===state)&&(domain==='ALL'||x.domain===domain)&&(!needle||text.includes(needle));
 }),[q,state,domain]);
 const run=(x:CorpusBindingR473)=>{activate(x);onNavigate(x.route)};
 return <section className='r473-corpus' aria-label='OMEGA year corpus execution fabric'>
  <header className='r473-head'>
   <div><span>R473 · YEAR-CORPUS EXECUTION FABRIC</span><h3>The historical contribution executes through the current machine</h3><p>Old names and donors remain provenance. Their valid contribution is bound to the strongest current executor or to an explicit truth gate. Nothing is sent to archive merely because it is old.</p></div>
   <strong>{YEAR_CORPUS_EXECUTION_SUMMARY_R473.bindings} bindings</strong>
  </header>
  <div className='r473-kpis'>
   <article><b>{YEAR_CORPUS_EXECUTION_SUMMARY_R473.executesNow}</b><span>execute now</span></article>
   <article><b>{YEAR_CORPUS_EXECUTION_SUMMARY_R473.adapters}</b><span>current adapters</span></article>
   <article><b>{YEAR_CORPUS_EXECUTION_SUMMARY_R473.truthGated}</b><span>truth gated</span></article>
   <article><b>0</b><span>shadow CanonState writers</span></article>
  </div>
  <div className='r473-controls'>
   <label><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder='Find any engine, mode, atlas, runtime, workstation, donor or alias…'/></label>
   <div className='r473-filter'><Filter/>{(['ALL','EXECUTES_NOW','EXECUTES_AS_ADAPTER','TRUTH_GATED'] as const).map(x=><button key={x} className={state===x?'active':''} onClick={()=>setState(x)}>{x==='ALL'?'ALL':STATE_LABEL[x]}</button>)}</div>
   <select value={domain} onChange={e=>setDomain(e.target.value)}>{domains.map(x=><option key={x}>{x}</option>)}</select>
   <b>{rows.length}/{YEAR_CORPUS_EXECUTION_R473.length}</b>
  </div>
  <div className='r473-grid'>{rows.map(x=><article key={x.id} data-state={x.state}>
   <header><code>{x.id}</code><span>{STATE_LABEL[x.state]}</span></header>
   <h4>{x.name}</h4><small>{x.domain} · {x.operation}</small>
   <p>{x.contribution}</p><small>{compileCorpusExecutionPlanR473(x).capabilityId} · {compileCorpusExecutionPlanR473(x).executionDomain} · {compileCorpusExecutionPlanR473(x).capabilityReality}</small>
   <div className='r473-aliases'>{x.aliases.slice(0,6).map(a=><i key={a}>{a}</i>)}</div>
   <aside><ShieldCheck/><span>{x.truth}</span></aside>
   <button data-confirm='Explicit local execution handoff; R142 execution proof required; R125 CanonState admission unchanged' data-action-truth='R473_LOCAL_HANDOFF_REQUIRES_R142_PROOF' onClick={()=>run(x)}><Activity/> Run through {x.route}<ArrowRight/></button>
  </article>)}</div>
  <footer><ShieldCheck/><span>{YEAR_CORPUS_EXECUTION_SUMMARY_R473.rule}. Selecting a binding emits a typed R473 execution intent and opens the present executor. CanonState mutation remains false here.</span></footer>
 </section>;
}

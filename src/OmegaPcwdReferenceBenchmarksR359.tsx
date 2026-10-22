import{useState}from'react';
import{FlaskConical,Play}from'lucide-react';
import{runPcwdReferenceBenchmarkSuiteV1,type ReferenceBenchmarkSuiteV1}from'./system/pcwdReferenceBenchmarkSuite';
import'./pcwdReferenceBenchmarksR359.css';

export default function OmegaPcwdReferenceBenchmarksR359(){
 const[state,setState]=useState<'idle'|'running'|'done'|'error'>('idle');
 const[suite,setSuite]=useState<ReferenceBenchmarkSuiteV1|null>(null);
 const[error,setError]=useState('');
 const run=async()=>{if(state==='running')return;setState('running');setError('');try{setSuite(await runPcwdReferenceBenchmarkSuiteV1());setState('done')}catch(e){setError(e instanceof Error?e.message:String(e));setState('error')}};
 return <section className='r359-reference' data-r359-reference-benchmarks='OMEGA_PCWD_REFERENCE_BENCHMARKS_v1'>
  <header><div><span>R359 · COMPETENT REFERENCES</span><h3>PCWD against methods that already solve the subproblem well</h3><p>Match, tradeoff, failure, and benchmark-driven repair remain visible. Numerical parity is not presented as novelty.</p></div><FlaskConical/></header>
  <button type='button' onClick={run} disabled={state==='running'}><Play/>{state==='running'?'Running reference suite…':'Evaluate competent reference suite'}</button>
  {error&&<p className='r359-error'>{error}</p>}
  {suite&&<div className='r359-body'>
   <div className='r359-summary'><b>{suite.summary.matches} MATCH</b><b>{suite.summary.tradeoffs} TRADEOFF</b><b>{suite.summary.fails} FAIL</b><b>{suite.summary.fixed} FIXED</b></div>
   <div className='r359-grid'>{suite.results.map(r=><article key={r.id} data-verdict={r.verdict}>
    <span>{r.verdict}</span><b>{r.problem}</b><small>{r.reference}</small><p>{r.finding}</p>
   </article>)}</div>
   <footer><b>Current conclusion</b><span>{suite.conclusion}</span><small>{suite.boundary}</small></footer>
  </div>}
 </section>;
}

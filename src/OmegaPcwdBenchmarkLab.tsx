import{useState}from'react';
import{FlaskConical,Play,ShieldCheck,TriangleAlert}from'lucide-react';
import{runPcwdBenchmarkSuiteV1,type BenchmarkSuiteV1}from'./system/pcwdBenchmarkSuite';
import{governPcwdBenchmarkSuiteV1,type BenchmarkGovernorReceiptV1}from'./system/pcwdBenchmarkGovernor';
import'./pcwdBenchmarkLab.css';

const number=(n:unknown)=>{
 const x=Number(n);
 if(!Number.isFinite(x))return String(n??'—');
 if(Math.abs(x)>=1000||Math.abs(x)>0&&Math.abs(x)<.001)return x.toExponential(3);
 return x.toFixed(4).replace(/.?0+$/,'');
};
const metricSummary=(m:Record<string,unknown>)=>Object.entries(m).slice(0,4).map(([k,v])=>k+' '+(typeof v==='number'?number(v):String(v))).join(' · ');

export default function OmegaPcwdBenchmarkLab(){
 const[status,setStatus]=useState<'idle'|'running'|'done'|'error'>('idle');
 const[suite,setSuite]=useState<BenchmarkSuiteV1|null>(null);
 const[governor,setGovernor]=useState<BenchmarkGovernorReceiptV1|null>(null);
 const[error,setError]=useState('');
 const run=async()=>{
  if(status==='running')return;
  setStatus('running');setError('');
  try{
   const next=await runPcwdBenchmarkSuiteV1();
   const receipt=await governPcwdBenchmarkSuiteV1(next);
   setSuite(next);setGovernor(receipt);setStatus('done');
  }catch(e){
   setError(e instanceof Error?e.message:String(e));setStatus('error');
  }
 };
 return <section className='r358-bench' data-r358-pcwd-benchmark='OMEGA_PCWD_BENCHMARK_SUITE_v1'>
  <header>
   <div><span>R358 · FALSIFICATION LAB</span><h3>PCWD against explicit benchmark baselines</h3><p>Measure what survives, what disappears, what fails, and what proof-carrying transport costs. No benchmark result is promoted into a novelty or scientific-validity claim.</p></div>
   <FlaskConical/>
  </header>
  <div className='r358-actions'>
   <button type='button' onClick={run} disabled={status==='running'}><Play/>{status==='running'?'Running 10 cases…':suite?'Run again':'Run 10-case benchmark suite'}</button>
   <span>coarse recovery · closed paths · tamper · evidence · qubit · covariance · branching · Lorenz-63 · negative control · overhead</span>
  </div>
  {error&&<div className='r358-error'><TriangleAlert/>{error}</div>}
  {suite&&governor&&<div className='r358-results'>
   <div className='r358-score'>
    <article><small>EXPLICIT-BASELINE WINS</small><b>{suite.summary.wins}</b><span>of {suite.summary.total}</span></article>
    <article><small>MEASURED COSTS</small><b>{suite.summary.costs}</b><span>must remain visible</span></article>
    <article><small>MEASURED LIMITS</small><b>{suite.summary.limits}</b><span>negative control</span></article>
    <article><small>INFORMATION DELTAS</small><b>{suite.summary.additionalInformationCategories.length}</b><span>named categories</span></article>
    <article data-decision={governor.decision}><small>FALSIFICATION GOVERNOR</small><b>{governor.decision}</b><span>{governor.allowAdvance?'all benchmark gates passed':'held by benchmark evidence'}</span></article>
   </div>
   <div className='r358-grid'>{suite.results.map(r=><article key={r.id} data-verdict={r.verdict}>
    <div><span>{r.verdict}</span><b>{r.problem}</b><small>{r.baseline}</small></div>
    <p>{r.interpretation}</p>
    <em>{metricSummary(r.metrics)}</em>
    {r.discardedByBaseline.length>0&&<footer><strong>baseline discards</strong>{r.discardedByBaseline.join(' · ')}</footer>}
   </article>)}</div>
   <div className='r358-boundary'><ShieldCheck/><div><b>Benchmark boundary</b><span>{suite.boundary}</span><small>{governor.boundary}</small></div></div>
  </div>}
 </section>;
}

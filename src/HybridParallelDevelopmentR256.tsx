import {useEffect,useMemo,useState} from 'react';
import {Activity,Braces,GitBranch,ShieldCheck,TriangleAlert} from 'lucide-react';
import './hybridParallelDevelopmentR256.css';

type Step={op:string;ok:boolean;mutation:boolean;changed:boolean;failureSignature:string|null};
type Run={jobId:string;status:string;executionDurationMs:number|null;steps:Step[];failureSignature:string|null;observedAt:number};
type Corpus={schema:string;revision:string;updatedAt:number;runs:Run[]};
const STORE='omega:r255:hybridExperienceCorpus';
const read=():Corpus=>{try{const x=JSON.parse(localStorage.getItem(STORE)||'null');if(x?.schema==='OMEGA_HYBRID_EXPERIENCE_CORPUS_R255'&&Array.isArray(x.runs))return x}catch{}return{schema:'OMEGA_HYBRID_EXPERIENCE_CORPUS_R255',revision:'R255',updatedAt:0,runs:[]}};
const pct=(n:number)=>`${Math.round(n*100)}%`;
const ms=(n:number|null)=>n==null?'—':n<1000?`${Math.round(n)} ms`:n<60000?`${(n/1000).toFixed(1)} s`:`${(n/60000).toFixed(1)} m`;
const q=(xs:number[],p:number)=>{const a=xs.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const i=(a.length-1)*p,l=Math.floor(i),h=Math.ceil(i);return l===h?a[l]:Math.round(a[l]*(h-i)+a[h]*(i-l))};

export default function HybridParallelDevelopmentR256(){
 const[corpus,setCorpus]=useState<Corpus>(read);
 useEffect(()=>{const sync=()=>setCorpus(read());const id=window.setInterval(sync,5000);window.addEventListener('storage',sync);return()=>{window.clearInterval(id);window.removeEventListener('storage',sync)}},[]);
 const model=useMemo(()=>{
  const byOp=new Map<string,{op:string,count:number,success:number,durations:number[]}>(),fail=new Map<string,number>();
  for(const run of corpus.runs){if(run.failureSignature)fail.set(run.failureSignature,(fail.get(run.failureSignature)||0)+1);for(const s of run.steps||[]){const x=byOp.get(s.op)||{op:s.op,count:0,success:0,durations:[]};x.count++;if(s.ok)x.success++;if(run.steps.length===1&&Number.isFinite(run.executionDurationMs))x.durations.push(Number(run.executionDurationMs));byOp.set(s.op,x);if(s.failureSignature)fail.set(s.failureSignature,(fail.get(s.failureSignature)||0)+1)}}
  const ops=[...byOp.values()].map(x=>({op:x.op,count:x.count,successRate:x.count?x.success/x.count:0,p50:q(x.durations,.5),p95:q(x.durations,.95),confidence:x.count>=12?'HIGH':x.count>=5?'MEDIUM':'LOW'})).sort((a,b)=>b.count-a.count||a.op.localeCompare(b.op));
  const repeated=[...fail.entries()].filter(([,n])=>n>1).map(([signature,count])=>({signature,count})).sort((a,b)=>b.count-a.count);
  const recommendations:string[]=[];
  for(const r of repeated.slice(0,3))recommendations.push(`Investigate repeated failure fingerprint ${r.signature} before increasing autonomy (${r.count} observations).`);
  for(const o of ops.filter(x=>x.count>=5&&x.successRate<.8).slice(0,3))recommendations.push(`${o.op}: hold automatic escalation; observed pass rate ${pct(o.successRate)} across ${o.count} samples.`);
  for(const o of ops.filter(x=>x.p95!=null&&x.p95!>120000).slice(0,2))recommendations.push(`${o.op}: long-tail latency detected at p95 ${ms(o.p95)}; prefer bounded concurrency/resource-aware scheduling.`);
  if(!recommendations.length&&corpus.runs.length<12)recommendations.push('Keep using Hybrid normally. R256 is collecting enough returned runs to calibrate policy without inventing confidence from a tiny sample.');
  if(!recommendations.length)recommendations.push('No repeated regression pattern is presently strong enough to justify a policy change; preserve current authority boundaries and continue sampling.');
  return{ops,repeated,recommendations};
 },[corpus]);
 const matured=model.ops.filter(x=>x.confidence!=='LOW').length;
 return <section className='r256-parallel' data-r256-samples={corpus.runs.length}>
  <header><div><span>R256 · PARALLEL USE + DEVELOPMENT FABRIC</span><h3>Use the system while the system learns how to improve.</h3><p>R256 reads the same sanitized R255 corpus while Hybrid remains operational. It converts accumulated execution evidence into non-mutating development guidance, so observation, normal use, analysis and the next source branch can progress concurrently instead of serially.</p></div><div className='r256-loop'><Activity/><b>USE → OBSERVE → CALIBRATE → DEVELOP</b><small>development guidance only · no automatic mutation or promotion</small></div></header>
  <div className='r256-grid'><article><GitBranch/><div><small>PARALLEL CORPUS</small><b>{corpus.runs.length}</b><span>bounded R255 observations available without stopping Hybrid use</span></div></article><article><Braces/><div><small>MATURE OP MODELS</small><b>{matured}</b><span>operations with at least five returned samples</span></div></article><article><TriangleAlert/><div><small>REPEATED SCARS</small><b>{model.repeated.length}</b><span>hashed recurrence patterns requiring correlation, not raw-log retention</span></div></article></div>
  <div className='r256-body'><div><h4>Adaptive development queue</h4>{model.recommendations.map((r,i)=><article className='r256-rec' key={i}><span>{i+1}</span><p>{r}</p></article>)}</div><div><h4>Operation evidence</h4><div className='r256-table'><div className='head'><span>OP</span><span>N</span><span>PASS</span><span>P95</span><span>CONF</span></div>{model.ops.slice(0,10).map(o=><div key={o.op}><span>{o.op}</span><span>{o.count}</span><span>{pct(o.successRate)}</span><span>{ms(o.p95)}</span><span>{o.confidence}</span></div>)}</div></div></div>
  <footer><ShieldCheck/><span>R256 is a simultaneous-development projection, not an execution authority. It may recommend what to investigate or optimize, but R237 still dispatches, R153 mutates, R141 proves returned effects, R239 governs resources, R240 promotes source, ci.yml deploys production, and R125 admits CanonState.</span></footer>
 </section>;
}

import {useEffect,useMemo,useState} from 'react';
import {Activity,Braces,GitBranch,ShieldCheck,TriangleAlert} from 'lucide-react';
import './hybridParallelDevelopmentR262.css';

type Step={op:string;ok:boolean;mutation:boolean;changed:boolean;failureSignature:string|null};
type Run={jobId:string;status:string;executionDurationMs:number|null;steps:Step[];failureSignature:string|null;observedAt:number;completedAt?:number|null;startedAt?:number|null;queuedAt?:number|null};
type Corpus={schema:string;revision:string;updatedAt:number;runs:Run[]};
const STORE='omega:r255:hybridExperienceCorpus';
const CORPUS_EVENT='omega:r255:corpus-updated';
const MAX_CORPUS_AGE_MS=30*24*60*60_000;
const MAX_RUNS=500;
const empty=():Corpus=>({schema:'OMEGA_HYBRID_EXPERIENCE_CORPUS_R255',revision:'R255',updatedAt:0,runs:[]});
const read=():Corpus=>{try{const x=JSON.parse(localStorage.getItem(STORE)||'null');if(x?.schema==='OMEGA_HYBRID_EXPERIENCE_CORPUS_R255'&&Array.isArray(x.runs)){const runs=x.runs.filter((r:any)=>r&&typeof r.jobId==='string'&&Array.isArray(r.steps)).slice(0,MAX_RUNS);return{schema:x.schema,revision:'R255',updatedAt:Number(x.updatedAt)||0,runs}}}catch{}return empty()};
const pct=(n:number)=>`${Math.round(n*100)}%`;
const ms=(n:number|null)=>n==null?'—':n<1000?`${Math.round(n)} ms`:n<60000?`${(n/1000).toFixed(1)} s`:`${(n/60000).toFixed(1)} m`;
const q=(xs:number[],p:number)=>{const a=xs.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const i=(a.length-1)*p,l=Math.floor(i),h=Math.ceil(i);return l===h?a[l]:Math.round(a[l]*(h-i)+a[h]*(i-l))};
const wilsonLower=(success:number,count:number)=>{if(count<=0)return 0;const z=1.96,p=success/count,d=1+z*z/count,centre=p+z*z/(2*count),spread=z*Math.sqrt((p*(1-p)+z*z/(4*count))/count);return Math.max(0,(centre-spread)/d)};
const runTime=(r:Run)=>Number(r.completedAt||r.startedAt||r.queuedAt||r.observedAt||0);

export default function HybridParallelDevelopmentR262(){
 const[corpus,setCorpus]=useState<Corpus>(read);
 useEffect(()=>{const sync=()=>setCorpus(read());const tick=()=>{if(document.visibilityState==='visible')sync()};const id=window.setInterval(tick,5000);window.addEventListener('storage',sync);window.addEventListener(CORPUS_EVENT,sync);document.addEventListener('visibilitychange',tick);return()=>{window.clearInterval(id);window.removeEventListener('storage',sync);window.removeEventListener(CORPUS_EVENT,sync);document.removeEventListener('visibilitychange',tick)}},[]);
 const model=useMemo(()=>{
  const now=Date.now(),freshRuns=corpus.runs.filter(r=>{const t=runTime(r);return t>0&&now-t<=MAX_CORPUS_AGE_MS}),byOp=new Map<string,{op:string,count:number,success:number,durations:number[]}>(),fail=new Map<string,number>();
  for(const run of freshRuns){if(run.failureSignature)fail.set(run.failureSignature,(fail.get(run.failureSignature)||0)+1);for(const s of run.steps||[]){if(!s||typeof s.op!=='string')continue;const x=byOp.get(s.op)||{op:s.op,count:0,success:0,durations:[]};x.count++;if(s.ok)x.success++;if(run.steps.length===1&&Number.isFinite(run.executionDurationMs))x.durations.push(Number(run.executionDurationMs));byOp.set(s.op,x);if(s.failureSignature)fail.set(s.failureSignature,(fail.get(s.failureSignature)||0)+1)}}
  const ops=[...byOp.values()].map(x=>({op:x.op,count:x.count,successRate:x.count?x.success/x.count:0,wilsonLower:wilsonLower(x.success,x.count),p50:q(x.durations,.5),p95:q(x.durations,.95),confidence:x.count>=12?'HIGH':x.count>=5?'MEDIUM':'LOW'})).sort((a,b)=>b.count-a.count||a.op.localeCompare(b.op));
  const repeated=[...fail.entries()].filter(([,n])=>n>1).map(([signature,count])=>({signature,count})).sort((a,b)=>b.count-a.count);
  const recommendations:string[]=[];
  for(const r of repeated.slice(0,3))recommendations.push(`Investigate repeated failure fingerprint ${r.signature} before increasing autonomy (${r.count} observations).`);
  for(const o of ops.filter(x=>x.count>=5&&x.wilsonLower<.7).slice(0,3))recommendations.push(`${o.op}: hold automatic escalation; conservative 95% lower-bound pass rate is ${pct(o.wilsonLower)} across ${o.count} samples.`);
  for(const o of ops.filter(x=>x.p95!=null&&Number(x.p95)>120000).slice(0,2))recommendations.push(`${o.op}: long-tail latency detected at p95 ${ms(o.p95)}; prefer bounded concurrency/resource-aware scheduling.`);
  if(!recommendations.length&&freshRuns.length<12)recommendations.push('Keep using Hybrid normally. R262 is collecting enough returned runs to calibrate policy without inventing confidence from a tiny sample.');
  if(!recommendations.length)recommendations.push('No repeated regression pattern is presently strong enough to justify a policy change; preserve current authority boundaries and continue sampling.');
  return{ops,repeated,recommendations,freshRuns,staleRuns:corpus.runs.length-freshRuns.length};
 },[corpus]);
 const matured=model.ops.filter(x=>x.confidence!=='LOW').length,corpusFresh=corpus.updatedAt>0&&Date.now()-corpus.updatedAt<=60_000;
 return <section className='r262-parallel' data-r262-samples={corpus.runs.length} data-r262-corpus-fresh={corpusFresh?'YES':'NO'}>
  <header><div><span>R262 · PARALLEL USE + DEVELOPMENT FABRIC</span><h3>Use the system while the system learns how to improve.</h3><p>R262 reads the sanitized R255 Hybrid corpus while the operating system remains active. It converts returned execution evidence into non-mutating development guidance, so operation, observation, calibration, testing and the next source candidate can progress concurrently instead of serially.</p></div><div className='r262-loop'><Activity/><b>USE → OBSERVE → CALIBRATE → DEVELOP</b><small>{corpusFresh?'live corpus signal current':'corpus signal not current'} · guidance only</small></div></header>
  <div className='r262-grid'><article><GitBranch/><div><small>PARALLEL CORPUS</small><b>{model.freshRuns.length}</b><span>{model.staleRuns} older observations excluded from current calibration</span></div></article><article><Braces/><div><small>MATURE OP MODELS</small><b>{matured}</b><span>operations with at least five returned samples</span></div></article><article><TriangleAlert/><div><small>REPEATED SCARS</small><b>{model.repeated.length}</b><span>hashed recurrence patterns requiring correlation, not raw-log retention</span></div></article></div>
  <div className='r262-body'><div><h4>Adaptive development queue</h4>{model.recommendations.map((r,i)=><article className='r262-rec' key={i}><span>{i+1}</span><p>{r}</p></article>)}</div><div><h4>Operation evidence</h4><div className='r262-table'><div className='head'><span>OP</span><span>N</span><span>PASS</span><span>P95</span><span>CONF</span></div>{model.ops.slice(0,10).map(o=><div key={o.op}><span>{o.op}</span><span>{o.count}</span><span>{pct(o.successRate)}</span><span>{ms(o.p95)}</span><span>{o.confidence}</span></div>)}</div></div></div>
  <footer><ShieldCheck/><span>R262 is a simultaneous-development projection, not an execution authority. R237 dispatches, R153 mutates, R141 proves returned effects, R239 governs resources, R240 promotes source, ci.yml deploys production, and R125 admits CanonState. Canonical R256 private SAI, R257 adaptive experience shell, R261 external-AI interoperability and R261.1 browser polish remain independent and preserved.</span></footer>
 </section>;
}

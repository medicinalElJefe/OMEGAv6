import {useMemo,useState} from 'react';
import {corpusState} from '../src/corpusRuntime';
import {executeSourceBoundR530} from './sourceBoundExecutionR530';
import {R457_AUTHORITATIVE_PROOF_FAMILIES} from './heightenedModeR457';
import type {R529Executor,R529Proposal} from './developmentalExecutionFabricR529';

type Props={address:number;onAddress:(address:number)=>void};
const EXECUTORS:readonly R529Executor[]=['VISUALIZATION','TRAVERSAL','FORECAST','SAI_HYBRID'];
const ROUTES:Record<R529Executor,string>={VISUALIZATION:'Atlas',TRAVERSAL:'Traversal',FORECAST:'Forecast',SAI_HYBRID:'Hybrid Link'};
const keys=['continuity','futurePlasticity','contradiction','burden','recoverability','proofCoverage','capabilityCoverage','humanComprehension','futureTopologyRetention','scarPressure'] as const;
export default function SourceExecutionWorkspaceR531({address,onAddress}:Props){
 const[executor,setExecutor]=useState<R529Executor>('VISUALIZATION');
 const[receipt,setReceipt]=useState<ReturnType<typeof executeSourceBoundR530>|null>(null);
 const packet=useMemo(()=>corpusState(address),[address]);
 const run=()=>{
  const m=packet.metrics;
  const parent={continuity:m.continuity,futurePlasticity:m.plasticity,contradiction:m.contradiction,burden:m.burden,recoverability:.8,proofCoverage:.9,capabilityCoverage:1,humanComprehension:.6,futureTopologyRetention:1,scarPressure:m.scar};
  const candidate={...parent,continuity:Math.min(1,parent.continuity+.01),futurePlasticity:Math.min(1,parent.futurePlasticity+.01),humanComprehension:.65};
  const evidence={parentStateRef:'source:'+address,candidateStateRef:'preview:'+address,sourceHead:'',metricRefs:Object.fromEntries(keys.map(key=>[key,'MODEL_ONLY:'+key])),proofRefs:[] as string[]};
  const proposal:R529Proposal={id:'r531-ui-preview:'+address,routes:[ROUTES[executor]],executor,parent,candidate,evidence,authorityClosed:false,proofSurvives:false,rollbackAvailable:false,dependencyOrderPreserved:true};
  setReceipt(executeSourceBoundR530({proposal,address}));
 };
 return <section className='o7-science-status' data-r531-source-execution='true' aria-label='Developmental source execution'>
  <article style={{flex:'1 1 100%'}}>
   <span>Developmental execution · evidence-gated</span>
   <b>Source operations require verified promotion evidence</b>
   <small>Inspect a candidate without fabricating exact-head proof or host execution. No canonical mutation.</small>
   <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
    {EXECUTORS.map(x=><button type='button' key={x} data-r531-executor={x} aria-pressed={executor===x} onClick={()=>{setExecutor(x);setReceipt(null)}}>{x.replace('_',' / ')}</button>)}
    <button type='button' data-r531-evaluate onClick={run}>Evaluate source admission</button>
   </div>
   {receipt&&<div data-r531-receipt={receipt.status} role='status' style={{marginTop:10}}>
    <b>{receipt.status}</b>
    <small>{receipt.status==='HELD'?receipt.admission.reasons.join(' · '):'External proof required before execution'}</small>
   </div>}
  </article>
 </section>;
}

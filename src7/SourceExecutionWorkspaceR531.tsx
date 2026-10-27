import {useEffect,useMemo,useState} from 'react';
import {corpusState} from '../src/corpusRuntime';
import {executeSourceBoundR530} from './sourceBoundExecutionR530';
import {inspectSourceInstrumentR533,traceSourceInstrumentR533} from './sourceInstrumentR533';
import {executeAccumulatedCapabilityR534} from '../src/accumulativeCapabilityExecutionR534';
import type {R529Executor,R529Proposal} from './developmentalExecutionFabricR529';

type Props={address:number;onAddress:(next:number)=>void};
const EXECUTORS:readonly R529Executor[]=['VISUALIZATION','TRAVERSAL','FORECAST','SAI_HYBRID'];
const CAPABILITY_IDS:Record<R529Executor,string>={VISUALIZATION:'SPHERE',TRAVERSAL:'TRAVERSAL',FORECAST:'FORECAST_LAE',SAI_HYBRID:'HYBRID'};
const ROUTES:Record<R529Executor,string>={VISUALIZATION:'Atlas',TRAVERSAL:'Traversal',FORECAST:'Forecast',SAI_HYBRID:'Hybrid Link'};
const keys=['continuity','futurePlasticity','contradiction','burden','recoverability','proofCoverage','capabilityCoverage','humanComprehension','futureTopologyRetention','scarPressure'] as const;
export default function SourceExecutionWorkspaceR531({address,onAddress}:Props){
 const[executor,setExecutor]=useState<R529Executor>('VISUALIZATION');
 const[receipt,setReceipt]=useState<ReturnType<typeof executeSourceBoundR530>|null>(null);
 const packet=useMemo(()=>corpusState(address),[address]);
 const[capabilityReceipt,setCapabilityReceipt]=useState<ReturnType<typeof executeAccumulatedCapabilityR534>|null>(null);
 const[modelReceipt,setModelReceipt]=useState<ReturnType<typeof inspectSourceInstrumentR533>|null>(null);
 const[traceSteps,setTraceSteps]=useState(4);
 const[traceReceipt,setTraceReceipt]=useState<ReturnType<typeof traceSourceInstrumentR533>|null>(null);
 useEffect(()=>{setReceipt(null);setModelReceipt(null);setCapabilityReceipt(null);setTraceReceipt(null)},[address]);
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
   <b>Read-only source execution · promotion independently governed</b>
   <small>Run existing local source models without modifying canonical state. Production promotion and host/device execution remain separately evidence-gated.</small>
   <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
    {EXECUTORS.map(x=><button type='button' key={x} data-r531-executor={x} aria-pressed={executor===x} onClick={()=>{setExecutor(x);setReceipt(null);setModelReceipt(null);setCapabilityReceipt(null);setTraceReceipt(null)}}>{x.replace('_',' / ')}</button>)}
    <button type='button' data-r534-execute onClick={()=>setCapabilityReceipt(executeAccumulatedCapabilityR534(CAPABILITY_IDS[executor],address))}>Execute bound capability</button>
    <button type='button' data-r533-inspect onClick={()=>setModelReceipt(inspectSourceInstrumentR533(executor,address))}>Run read-only model</button>
    <button type='button' data-r531-evaluate onClick={run}>Evaluate promotion admission</button>
    {(executor==='TRAVERSAL'||executor==='FORECAST')&&<label>Source trace steps <input type='number' aria-label='Source trace steps' min={1} max={12} step={1} value={traceSteps} onChange={e=>{setTraceSteps(Number(e.target.value));setTraceReceipt(null)}} /></label>}
    {(executor==='TRAVERSAL'||executor==='FORECAST')&&<button type='button' data-r627-trace-run onClick={()=>setTraceReceipt(traceSourceInstrumentR533(executor,address,traceSteps))}>Trace model successors</button>}
   </div>
   {capabilityReceipt&&<div data-r534-capability-receipt={capabilityReceipt.status} data-r534-capability-id={capabilityReceipt.capabilityId} role='status' style={{marginTop:10}}>
    <b>{capabilityReceipt.capabilityId} · {capabilityReceipt.status}</b>
    <small>{capabilityReceipt.status==='SOURCE_MODEL_EXECUTED'?'Read-only source-model subset executed; historical renderer and full capability parity are not proven.':capabilityReceipt.status==='EXTERNAL_HOST_PROOF_REQUIRED'?'Authenticated native host receipt required.':'Capability execution held.'}</small>
    <details><summary>Typed source receipt</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxWidth:'100%',overflowX:'auto'}}>{JSON.stringify(capabilityReceipt,null,2)}</pre></details>
   </div>}
   {traceReceipt&&<div data-r627-trace-status={traceReceipt.status} role='status' style={{marginTop:10,maxWidth:'100%',overflowX:'auto'}}>
    <b>Bounded source trace · {traceReceipt.status}</b>
    <small>Corpus addresses only. No physical traversal, observed future, historical parity, canonical mutation or production proof.</small>
    {traceReceipt.status==='HELD'?<p>{traceReceipt.reasons.join(' · ')}</p>:<><p>{traceReceipt.frames.length} model transitions · {traceReceipt.termination}</p><ol>{traceReceipt.frames.map(frame=><li key={frame.index}>Address {frame.address} → {frame.nextAddress} · {frame.decision} · continuity {frame.continuity.toFixed(3)} · scar {frame.scar.toFixed(3)} · contradiction {frame.contradiction.toFixed(3)} <button type='button' data-r627-continue-address={frame.nextAddress} onClick={()=>onAddress(frame.nextAddress)}>Continue at {frame.nextAddress}</button></li>)}</ol></>}
    <details><summary>Source trace receipt</summary><pre data-r627-trace-json style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxWidth:'100%'}}>{JSON.stringify(traceReceipt,null,2)}</pre></details>
   </div>}
   {modelReceipt&&<div data-r533-model-receipt={modelReceipt.status} role='status' style={{marginTop:10}}>
    <b>{modelReceipt.status}</b>
    <small>{modelReceipt.status==='SOURCE_MODEL_EXECUTED'?JSON.stringify(modelReceipt):modelReceipt.reasons.join(' · ')}</small>
   </div>}
   {receipt&&<div data-r531-receipt={receipt.status} role='status' style={{marginTop:10}}>
    <b>{receipt.status}</b>
    <small>{receipt.status==='HELD'?receipt.admission.reasons.join(' · '):'External proof required before execution'}</small>
   </div>}
  </article>
 </section>;
}

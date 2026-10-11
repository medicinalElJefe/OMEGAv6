import {useMemo,useState} from 'react';
import {corpusState} from '../src/corpusRuntime';
import {executeSourceBoundR530} from './sourceBoundExecutionR530';
import {inspectSourceInstrumentR533} from './sourceInstrumentR533';
import {executeAccumulatedCapabilityR534} from '../src/accumulativeCapabilityExecutionR534';
import type {R529Executor,R529Proposal} from './developmentalExecutionFabricR529';

type Props={address:number;onAddress?:(address:number)=>void};
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
 const computedNext=modelReceipt?.status==='SOURCE_MODEL_EXECUTED'?(modelReceipt.executor==='TRAVERSAL'?modelReceipt.nextAddress:modelReceipt.executor==='FORECAST'?modelReceipt.modelNextAddress:null):null;
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
   <div className='o7-r535-live-head'><div><span>LIVE DEVELOPMENTAL WORKSPACE</span><h2>Explore · Execute · Compare</h2><p>Operate source-backed models against the shared atlas address. Outputs are model results, not empirical measurements.</p></div><div className='o7-r535-address'>ADDRESS <strong>{address.toLocaleString()}</strong><small>of 20,736 states</small></div></div>
   <div className='o7-r535-metric-grid' data-r535-live-metrics='true'><div><span>Continuity</span><strong>{packet.metrics.continuity.toFixed(3)}</strong></div><div><span>Plasticity</span><strong>{packet.metrics.plasticity.toFixed(3)}</strong></div><div><span>Scar</span><strong>{packet.metrics.scar.toFixed(3)}</strong></div><div><span>Contradiction</span><strong>{packet.metrics.contradiction.toFixed(3)}</strong></div></div>
   <span>Developmental execution · evidence-gated</span>
   <b>Read-only source execution · promotion independently governed</b>
   <small>Run existing local source models without modifying canonical state. Production promotion and host/device execution remain separately evidence-gated.</small>
   <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
    {EXECUTORS.map(x=><button type='button' key={x} data-r531-executor={x} aria-pressed={executor===x} onClick={()=>{setExecutor(x);setReceipt(null);setModelReceipt(null);setCapabilityReceipt(null)}}>{x.replace('_',' / ')}</button>)}
    <button type='button' data-r534-execute onClick={()=>setCapabilityReceipt(executeAccumulatedCapabilityR534(CAPABILITY_IDS[executor],address))}>Execute bound capability</button>
    <button type='button' data-r533-inspect onClick={()=>setModelReceipt(inspectSourceInstrumentR533(executor,address))}>Run read-only model</button>
    <button type='button' data-r531-evaluate onClick={run}>Evaluate promotion admission</button>
   </div>
   {capabilityReceipt&&<div data-r534-capability-receipt={capabilityReceipt.status} data-r534-capability-id={capabilityReceipt.capabilityId} role='status' style={{marginTop:10}}>
    <b>{capabilityReceipt.capabilityId} · {capabilityReceipt.status}</b>
    <small>{capabilityReceipt.status==='SOURCE_MODEL_EXECUTED'?'Read-only source-model subset executed; historical renderer and full capability parity are not proven.':capabilityReceipt.status==='EXTERNAL_HOST_PROOF_REQUIRED'?'Authenticated native host receipt required.':'Capability execution held.'}</small>
    <details><summary>Typed source receipt</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxWidth:'100%',overflowX:'auto'}}>{JSON.stringify(capabilityReceipt,null,2)}</pre></details>
   </div>}
   {modelReceipt?.status==='SOURCE_MODEL_EXECUTED'&&<div className='o7-r535-result' data-r535-live-result={modelReceipt.executor}><b>{modelReceipt.executor==='VISUALIZATION'?'Geometry computed':modelReceipt.executor==='TRAVERSAL'?'Traversal successor computed':'Forecast successor computed'}</b><p>{modelReceipt.executor==='VISUALIZATION'?`${modelReceipt.geometry.shellCount} shells · ${modelReceipt.geometry.edgeCount} rendered edges`: `Model address ${computedNext?.toLocaleString()} · current address ${address.toLocaleString()}`}</p>{computedNext!==null&&Number.isInteger(computedNext)&&onAddress&&<button type='button' data-r535-apply-next onClick={()=>{onAddress(computedNext);setModelReceipt(null);setCapabilityReceipt(null);setReceipt(null)}}>Open computed address →</button>}<small>Read-only calculation · shared address changes only when you choose to open it</small></div>}
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

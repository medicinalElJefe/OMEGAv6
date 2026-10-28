import {useEffect,useMemo,useState} from 'react';
import {corpusState} from '../src/corpusRuntime';
import {executeSourceBoundR530} from './sourceBoundExecutionR530';
import {inspectSourceInstrumentR533,traceSourceInstrumentR533} from './sourceInstrumentR533';
import {exportSourceTraceSnapshotR628,importSourceTraceSnapshotR628} from './sourceTraceRecoveryR628';
import {compareSourceTracesR629,exportSourceComparisonR629,importSourceComparisonR629,type SourceComparisonR629} from './sourceTraceComparisonR629';
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
 const computedNext=modelReceipt?.status==='SOURCE_MODEL_EXECUTED'?(modelReceipt.executor==='TRAVERSAL'?modelReceipt.nextAddress:modelReceipt.executor==='FORECAST'?modelReceipt.modelNextAddress:null):null;
 const[traceSteps,setTraceSteps]=useState(4);
 const[traceReceipt,setTraceReceipt]=useState<ReturnType<typeof traceSourceInstrumentR533>|null>(null);
 const[traceSnapshotText,setTraceSnapshotText]=useState('');
 const[traceSnapshotStatus,setTraceSnapshotStatus]=useState('');
 const[comparisonAddress,setComparisonAddress]=useState((address+1)%20736);
 const[comparisonReceipt,setComparisonReceipt]=useState<SourceComparisonR629|null>(null);
 const[comparisonSnapshot,setComparisonSnapshot]=useState('');
 const[comparisonStatus,setComparisonStatus]=useState('');
 useEffect(()=>{setReceipt(null);setModelReceipt(null);setCapabilityReceipt(null);setTraceReceipt(null);setComparisonReceipt(null);setComparisonAddress((address+1)%20736);setComparisonStatus('')},[address]);
 const exportTrace=()=>{try{if(!traceReceipt)throw new Error('R628_EXECUTED_SOURCE_TRACE_REQUIRED');setTraceSnapshotText(exportSourceTraceSnapshotR628(traceReceipt));setTraceSnapshotStatus('EXPORTED: local read-only model trace; no authority or upload');}catch(e){setTraceSnapshotStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const importTrace=()=>{try{const replay=importSourceTraceSnapshotR628(traceSnapshotText);setExecutor(replay.executor);setTraceSteps(replay.requestedSteps);setTraceReceipt(replay);setComparisonReceipt(null);setTraceSnapshotStatus('REPLAY_VERIFIED: recomputed source trace; current Atlas address unchanged');}catch(e){setTraceSnapshotStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const compareForks=()=>{try{if(!traceReceipt)throw new Error('R629_EXECUTED_BASELINE_REQUIRED');const result=compareSourceTracesR629(traceReceipt,comparisonAddress);setComparisonReceipt(result);setComparisonStatus('COMPUTED: two independent corpus traces; no Atlas mutation');}catch(e){setComparisonReceipt(null);setComparisonStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const exportComparison=()=>{try{if(!comparisonReceipt)throw new Error('R629_COMPARISON_REQUIRED');setComparisonSnapshot(exportSourceComparisonR629(comparisonReceipt));setComparisonStatus('EXPORTED: portable recomputable source comparison');}catch(e){setComparisonStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const importComparison=()=>{try{const result=importSourceComparisonR629(comparisonSnapshot);setExecutor(result.executor);setTraceSteps(result.requestedSteps);setTraceReceipt(result.left);setComparisonAddress(result.comparisonAddress);setComparisonReceipt(result);setComparisonStatus('REPLAY_VERIFIED: both traces independently recomputed; Atlas address unchanged');}catch(e){setComparisonStatus('REFUSED: '+(e instanceof Error?e.message:String(e)));}};
 const fmtDelta=(value:number|null)=>value===null?'not defined':value.toFixed(3);
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
   <div className='o7-r535-live-head'><div><span>LIVE DEVELOPMENTAL WORKSPACE</span><h2>Explore · Execute · Compare</h2><p>Operate source-backed models against the shared Atlas address. Outputs are representational model results, not empirical measurements.</p></div><div className='o7-r535-address'>ADDRESS <strong>{address.toLocaleString()}</strong><small>of 20,736 states</small></div></div>
   <div className='o7-r535-metric-grid' data-r535-live-metrics='true'><div><span>Continuity</span><strong>{packet.metrics.continuity.toFixed(3)}</strong></div><div><span>Plasticity</span><strong>{packet.metrics.plasticity.toFixed(3)}</strong></div><div><span>Scar</span><strong>{packet.metrics.scar.toFixed(3)}</strong></div><div><span>Contradiction</span><strong>{packet.metrics.contradiction.toFixed(3)}</strong></div></div>
   <span>Developmental execution · evidence-gated</span>
   <b>Read-only source execution · promotion independently governed</b>
   <small>Run existing local source models without modifying canonical state. Production promotion and host/device execution remain separately evidence-gated.</small>
   <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
    {EXECUTORS.map(x=><button type='button' key={x} data-r531-executor={x} aria-pressed={executor===x} onClick={()=>{setExecutor(x);setReceipt(null);setModelReceipt(null);setCapabilityReceipt(null);setTraceReceipt(null);setComparisonReceipt(null)}}>{x.replace('_',' / ')}</button>)}
    <button type='button' data-r534-execute onClick={()=>setCapabilityReceipt(executeAccumulatedCapabilityR534(CAPABILITY_IDS[executor],address))}>Execute bound capability</button>
    <button type='button' data-r533-inspect onClick={()=>setModelReceipt(inspectSourceInstrumentR533(executor,address))}>Run read-only model</button>
    <button type='button' data-r531-evaluate onClick={run}>Evaluate promotion admission</button>
    {(executor==='TRAVERSAL'||executor==='FORECAST')&&<label>Source trace steps <input type='number' aria-label='Source trace steps' min={1} max={12} step={1} value={traceSteps} onChange={e=>{setTraceSteps(Number(e.target.value));setTraceReceipt(null);setComparisonReceipt(null)}} /></label>}
    {(executor==='TRAVERSAL'||executor==='FORECAST')&&<button type='button' data-r627-trace-run onClick={()=>{setTraceReceipt(traceSourceInstrumentR533(executor,address,traceSteps));setComparisonReceipt(null);setComparisonStatus('')}}>Trace model successors</button>}
   </div>
   {capabilityReceipt&&<div data-r534-capability-receipt={capabilityReceipt.status} data-r534-capability-id={capabilityReceipt.capabilityId} role='status' style={{marginTop:10}}>
    <b>{capabilityReceipt.capabilityId} · {capabilityReceipt.status}</b>
    <small>{capabilityReceipt.status==='SOURCE_MODEL_EXECUTED'?'Read-only source-model subset executed; historical renderer and full capability parity are not proven.':capabilityReceipt.status==='EXTERNAL_HOST_PROOF_REQUIRED'?'Authenticated native host receipt required.':'Capability execution held.'}</small>
    <details><summary>Typed source receipt</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxWidth:'100%',overflowX:'auto'}}>{JSON.stringify(capabilityReceipt,null,2)}</pre></details>
   </div>}
   {traceReceipt&&<div data-r627-trace-status={traceReceipt.status} role='status' style={{marginTop:10,maxWidth:'100%',overflowX:'auto'}}>
    <b>Bounded source trace · {traceReceipt.status}</b>
    <small>Corpus addresses only. Finite differences are per model successor, not physical velocities or observed time. No historical parity, canonical mutation or production proof.</small>
    {traceReceipt.status==='HELD'?<p>{traceReceipt.reasons.join(' · ')}</p>:<><p>{traceReceipt.frames.length} model transitions · {traceReceipt.termination}</p><ol>{traceReceipt.frames.map(frame=><li key={frame.index}>Address {frame.address} → {frame.nextAddress} · {frame.decision} · continuity {frame.continuity.toFixed(3)} · scar {frame.scar.toFixed(3)} · contradiction {frame.contradiction.toFixed(3)} · Δcontinuity {frame.developmental.continuityVelocity===null?'not yet defined':frame.developmental.continuityVelocity.toFixed(3)} · Δ²continuity {frame.developmental.continuityAcceleration===null?'not yet defined':frame.developmental.continuityAcceleration.toFixed(3)} · Δscar {frame.developmental.scarVelocity===null?'not yet defined':frame.developmental.scarVelocity.toFixed(3)} <button type='button' data-r627-continue-address={frame.nextAddress} onClick={()=>onAddress(frame.nextAddress)}>Continue at {frame.nextAddress}</button></li>)}</ol></>}
    <details><summary>Source trace receipt</summary><pre data-r627-trace-json style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxWidth:'100%'}}>{JSON.stringify(traceReceipt,null,2)}</pre></details>
   </div>}
   {(executor==='TRAVERSAL'||executor==='FORECAST')&&<div data-r628-recovery='true' style={{marginTop:12,maxWidth:'100%',minWidth:0}}>
    <b>Portable source-trace replay</b>
    <p>Export the executed address/derivative trace, or import and independently recompute it against this build's corpus. Mismatched or forged frames are refused. Import never changes the Atlas address, CanonState, or host execution.</p>
    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
     <button type='button' data-r628-export onClick={exportTrace} disabled={!traceReceipt||traceReceipt.status!=='SOURCE_MODEL_EXECUTED'}>Export executed trace</button>
     <button type='button' data-r628-import onClick={importTrace}>Import and verify replay</button>
    </div>
    <textarea aria-label='Source trace snapshot JSON' data-r628-snapshot value={traceSnapshotText} onChange={e=>{setTraceSnapshotText(e.target.value);setTraceSnapshotStatus('')}} rows={4} maxLength={32769} spellCheck={false} style={{display:'block',boxSizing:'border-box',width:'100%',maxWidth:'100%',marginTop:8}}/>
    <output role='status' data-r628-snapshot-status={traceSnapshotStatus.startsWith('REPLAY_VERIFIED')?'VERIFIED':traceSnapshotStatus.startsWith('REFUSED')?'REFUSED':'INFO'}>{traceSnapshotStatus}</output>
   </div>}
   {(executor==='TRAVERSAL'||executor==='FORECAST')&&<div data-r629-comparison='true' style={{marginTop:14,maxWidth:'100%',minWidth:0}}>
    <b>Independent source-trajectory comparison</b>
    <p>Compare two bounded successor paths at equal model-step indices. Each path executes against the current 20,736-address corpus; differences are source-model deltas, not physical time, observed motion, a prediction, or canonical authority.</p>
    <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:8}}>
     <label>Comparison start address <input aria-label='Comparison start address' type='number' min={0} max={20735} step={1} value={comparisonAddress} onChange={e=>{setComparisonAddress(Number(e.target.value));setComparisonReceipt(null);setComparisonStatus('')}} /></label>
     <button type='button' data-r629-run disabled={!traceReceipt||traceReceipt.status!=='SOURCE_MODEL_EXECUTED'} onClick={compareForks}>Execute and compare forks</button>
     <button type='button' data-r629-export disabled={!comparisonReceipt} onClick={exportComparison}>Export comparison</button>
     <button type='button' data-r629-import onClick={importComparison}>Import and recompute both</button>
    </div>
    {comparisonReceipt&&<div data-r629-result='SOURCE_MODEL_EXECUTED' data-r629-first-divergence={comparisonReceipt.firstDivergenceIndex===null?'NONE':String(comparisonReceipt.firstDivergenceIndex)}>
     <p>{comparisonReceipt.identical?'Identical source transitions':'Source transitions diverge'} · shared prefix {comparisonReceipt.commonPrefix} · first divergence {comparisonReceipt.firstDivergenceIndex===null?'none':comparisonReceipt.firstDivergenceIndex+1} · {comparisonReceipt.leftTermination} / {comparisonReceipt.rightTermination}</p>
     <ol>{comparisonReceipt.rows.map(row=><li key={row.index} data-r629-row={row.index}>
      Model step {row.index+1}: {row.leftAddress??'ended'} → {row.leftNextAddress??'ended'} versus {row.rightAddress??'ended'} → {row.rightNextAddress??'ended'} · {row.sameSourceTransition?'same transition':'different transition'} · Δcontinuity {fmtDelta(row.continuityDelta)} · Δplasticity {fmtDelta(row.plasticityDelta)} · Δscar {fmtDelta(row.scarDelta)} · Δcontradiction {fmtDelta(row.contradictionDelta)} · Δvelocity {fmtDelta(row.continuityVelocityDelta)} · Δacceleration {fmtDelta(row.continuityAccelerationDelta)}
      {row.leftNextAddress!==null&&<button type='button' data-r629-continue-left={row.leftNextAddress} onClick={()=>onAddress(row.leftNextAddress!)}>Continue baseline</button>}
      {row.rightNextAddress!==null&&<button type='button' data-r629-continue-right={row.rightNextAddress} onClick={()=>onAddress(row.rightNextAddress!)}>Continue comparison</button>}
     </li>)}</ol>
     <details><summary>Recomputed fork receipt</summary><pre data-r629-json style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxWidth:'100%',overflowX:'auto'}}>{JSON.stringify(comparisonReceipt,null,2)}</pre></details>
    </div>}
    <textarea aria-label='Source comparison snapshot JSON' data-r629-snapshot value={comparisonSnapshot} onChange={e=>{setComparisonSnapshot(e.target.value);setComparisonStatus('')}} rows={4} maxLength={65537} spellCheck={false} style={{display:'block',boxSizing:'border-box',width:'100%',maxWidth:'100%',marginTop:8}}/>
    <output role='status' data-r629-status={comparisonStatus.startsWith('REPLAY_VERIFIED')?'VERIFIED':comparisonStatus.startsWith('REFUSED')?'REFUSED':'INFO'}>{comparisonStatus}</output>
   </div>}
   {modelReceipt?.status==='SOURCE_MODEL_EXECUTED'&&<div className='o7-r535-result' data-r535-live-result={modelReceipt.executor}><b>{modelReceipt.executor==='VISUALIZATION'?'Geometry computed':modelReceipt.executor==='TRAVERSAL'?'Traversal successor computed':'Forecast successor computed'}</b><p>{modelReceipt.executor==='VISUALIZATION'?`${modelReceipt.geometry.shellCount} shells · ${modelReceipt.geometry.edgeCount} rendered edges`: `Model address ${computedNext?.toLocaleString()} · current address ${address.toLocaleString()}`}</p>{computedNext!==null&&Number.isSafeInteger(computedNext)&&<button type='button' data-r535-apply-next onClick={()=>{onAddress(computedNext);setModelReceipt(null);setCapabilityReceipt(null);setReceipt(null);setTraceReceipt(null);setComparisonReceipt(null)}}>Open computed address</button>}<small>Read-only calculation · shared address changes only when you explicitly open it</small></div>}
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

import{useMemo}from'react';
import{Clock3,History,ShieldCheck,Waypoints}from'lucide-react';
import{compileCanonicalTypedFieldR349}from'./system/wovenHardwareFieldR349';
import{compileTemporalBudgetFromR193R350,evolveTemporalTimelineR350,proveTimelineReplayR350,timelineFramesR350}from'./system/temporalCheckpointReplayR350';
import'./omegaTemporalCheckpointR350.css';

const short=(x:string)=>x.slice(0,8);
export default function OmegaTemporalCheckpointR350(){
 const model=useMemo(()=>{
  const source=compileCanonicalTypedFieldR349(0);
  const compiled=compileTemporalBudgetFromR193R350({run:{id:'r350-convergence-surface',contract:{executionDomain:'LOCAL',routeId:'CONVERGENCE_R350'}},hint:{motion:.35,residual:.22,temporalError:.18,truthGap:.12,coherenceGap:.14,combined:.24,priority:.5},predictedPressure:.28,input:{observerPressure:.2},history:{maturity:.5}});
  const timeline=evolveTemporalTimelineR350(source,{steps:8,checkpointEvery:2,orientations:[1,-1,1,0],transportRate:.125,nowTick:4,budget:compiled.budget});
  return{timeline,proof:proveTimelineReplayR350(timeline),frames:timelineFramesR350(timeline,4)};
 },[]);
 return <section className='r350-time' data-r350-temporal-checkpoint='OMEGA_TEMPORAL_CHECKPOINT_REPLAY_R350'>
  <header><div><span>R350 · TEMPORAL CHECKPOINT / REPLAY</span><h3>Deterministic time traversal over the 20,736-address typed field</h3><p>Integer model ticks are hash-bound to complete field state. HISTORY / NOW / FORECAST are explicit model-time roles. Seek uses the nearest prior checkpoint and declared step receipts; FORECAST remains model projection, never observation.</p></div><Clock3/></header>
  <div className='r350-proof'>
   <article><ShieldCheck/><span><small>REPLAY PROOF</small><b>{model.proof.deterministicReplay?'PASS':'FAIL'}</b><em>checkpoint + lineage + final hash</em></span></article>
   <article><Waypoints/><span><small>CHECKPOINTS</small><b>{model.timeline.checkpoints.length}</b><em>{model.timeline.stepReceipts.length} deterministic ticks</em></span></article>
   <article><History/><span><small>FINAL FIELD HASH</small><b>{short(model.timeline.finalFieldHash)}</b><em>full typed state, not screenshot identity</em></span></article>
   <article><Clock3/><span><small>TEMPORAL BUDGET</small><b>{model.timeline.budget.targetHz} Hz · {model.timeline.budget.addressScale.toLocaleString()}</b><em>R185/R193 declared scheduling metadata</em></span></article>
  </div>
  <div className='r350-track' aria-label='R350 model time checkpoint lineage'>
   {model.frames.map((f,i)=><div key={f.tick} className={`r350-node ${f.relation.toLowerCase()}`}>
    {i>0&&<span className='r350-link'/>}<i>{f.tick}</i><b>{f.relation}</b><small>{short(f.fieldHash)}</small><em>{f.epistemicState.replaceAll('_',' ')}</em>
   </div>)}
  </div>
  <footer><b>Authority boundary</b><span>R141 exact return · R146 durable history · R185 temporal scheduling · R193 multi-axis refinement · R125 sole CanonState admission. R350 itself claims only deterministic software/model replay.</span></footer>
 </section>;
}

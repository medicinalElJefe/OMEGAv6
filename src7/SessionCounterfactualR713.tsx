import {useEffect,useRef,useState} from 'react';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {compareComputationalSessionsR713} from '../src/computationalSessionComparisonR713.mjs';
import {enumerateInterventionFrontierR715} from '../src/interventionFrontierR715.mjs';
import {enumerateJointInterventionsR716} from '../src/jointInterventionCompositionR716.mjs';
import {analyzeMinimalRouteCutsR717} from '../src/minimalRouteCutsR717.mjs';
import {compareCrossFrameInterventionsR718} from '../src/crossFrameDevelopmentalInteractionR718.mjs';

// Local source-model intervention only; never an edit to CanonState.
export function SessionCounterfactualR713({baselineSession,frameIndex,projection}:{baselineSession:any;frameIndex:number;projection:any}){
 const [edgeId,setEdgeId]=useState('');
 const [candidateText,setCandidateText]=useState('');
 const [comparison,setComparison]=useState<any|null>(null);
 const [error,setError]=useState('');
 const [frontier,setFrontier]=useState<any|null>(null);
 const [frontierError,setFrontierError]=useState('');
 const [joint,setJoint]=useState<any|null>(null);
 const [jointError,setJointError]=useState('');
 const [minimalCuts,setMinimalCuts]=useState<any|null>(null);
 const [minimalCutsError,setMinimalCutsError]=useState('');
 const [temporal,setTemporal]=useState<any|null>(null);
 const [temporalError,setTemporalError]=useState('');
 const [firstFrame,setFirstFrame]=useState(0);
 const [secondFrame,setSecondFrame]=useState(1);
 const [firstEdge,setFirstEdge]=useState(0);
 const [secondEdge,setSecondEdge]=useState(0);
// Keep both frame selectors controlled by React state. The DOM refs are
 // retained to verify exact visible selection at execution time.
 const firstFrameSelect=useRef<HTMLSelectElement>(null),secondFrameSelect=useRef<HTMLSelectElement>(null);
 const firstEdgeSelect=useRef<HTMLSelectElement>(null),secondEdgeSelect=useRef<HTMLSelectElement>(null);
 // A selected display frame is not a new source session. Keep independent
 // cross-frame choices stable while users traverse the single-frame views.
 // Only a new source session invalidates those choices.
 useEffect(()=>{setComparison(null);setCandidateText('');setError('');setFrontier(null);setFrontierError('');setJoint(null);setJointError('');setMinimalCuts(null);setMinimalCutsError('');setTemporal(null);setTemporalError('');setFirstFrame(0);setSecondFrame(1);setFirstEdge(0);setSecondEdge(0);},[baselineSession.sessionJson]);
 useEffect(()=>{setFrontier(null);setFrontierError('');setJoint(null);setJointError('');setMinimalCuts(null);setMinimalCutsError('');},[frameIndex]);
 const eligible=projection.edges.filter((e:any)=>e.kind!=='BLOCKED'&&e.weight>0);
 const chosen=eligible.find((e:any)=>e.id===edgeId)??eligible[0];
 function compare(text:string){
  try{const result=compareComputationalSessionsR713(baselineSession.sessionJson,text);setComparison(result);setError('');}
  catch(e){setComparison(null);setError(e instanceof Error?e.message:'Comparison refused');}
 }
 function evaluateFrontier(offset=0){
  try{const result=enumerateInterventionFrontierR715(baselineSession.sessionJson,{frameIndex,offset,limit:8});setFrontier(result);setFrontierError('');}
  catch(e){setFrontier(null);setFrontierError(e instanceof Error?e.message:'Frontier refused');}
 }
 function evaluateJoint(offset=0){
  try{const result=enumerateJointInterventionsR716(baselineSession.sessionJson,{frameIndex,offset,limit:6});setJoint(result);setJointError('');}
  catch(e){setJoint(null);setJointError(e instanceof Error?e.message:'Joint intervention refused');}
 }
 function evaluateMinimalCuts(){
  try{const result=analyzeMinimalRouteCutsR717(baselineSession.sessionJson,{frameIndex});setMinimalCuts(result);setMinimalCutsError('');}
  catch(e){setMinimalCuts(null);setMinimalCutsError(e instanceof Error?e.message:'Minimal route-cut proof refused');}
 }
 function evaluateTemporal(){
  try{
   // Execute the exact values visibly selected by the user. React state may be
   // awaiting an update after rapid successive native select changes.
   const frameA=Number(firstFrameSelect.current?.value??firstFrame);
   const frameB=Number(secondFrameSelect.current?.value??secondFrame);
   const edgeA=Number(firstEdgeSelect.current?.value??selectedFirstEdge);
   const edgeB=Number(secondEdgeSelect.current?.value??selectedSecondEdge);
   const result=compareCrossFrameInterventionsR718(baselineSession.sessionJson,{
    firstFrameIndex:frameA,firstEdgeIndex:edgeA,secondFrameIndex:frameB,secondEdgeIndex:edgeB
   });
   setTemporal(result);setTemporalError('');
  }catch(e){setTemporal(null);setTemporalError(e instanceof Error?e.message:'Temporal comparison refused');}
 }
 const frameChoices=baselineSession.sourceScenario.edgeFrames as any[][];
 const eligibleAt=(frame:number)=>frameChoices[frame]?.map((edge:any,index:number)=>({edge,index})).filter(({edge}:any)=>edge.kind!=='BLOCKED'&&edge.weight>0)??[];
 // A filtered option's value is the ORIGINAL source-edge index, not its ordinal
 // position in the eligible list. When index zero is blocked, never silently
 // submit that blocked edge while the select visually displays index one.
 const firstEligible=eligibleAt(firstFrame),secondEligible=eligibleAt(secondFrame);
 const selectedFirstEdge=firstEligible.some(({index}:any)=>index===firstEdge)?firstEdge:(firstEligible[0]?.index??-1);
 const selectedSecondEdge=secondEligible.some(({index}:any)=>index===secondEdge)?secondEdge:(secondEligible[0]?.index??-1);
 const chooseFirstFrame=(value:number)=>{setFirstFrame(value);setFirstEdge(eligibleAt(value)[0]?.index??-1);setTemporal(null);setTemporalError('');};
 const chooseSecondFrame=(value:number)=>{setSecondFrame(value);setSecondEdge(eligibleAt(value)[0]?.index??-1);setTemporal(null);setTemporalError('');};
 function intervene(){
  if(!chosen){setError('No eligible source edge in this frame');return;}
  const index=Number(chosen.id.replace('edge-',''));
  if(!Number.isSafeInteger(index)||index<0||index>=baselineSession.sourceScenario.edgeFrames[frameIndex].length){setError('Invalid source edge selection');return;}
  const source=JSON.parse(JSON.stringify(baselineSession.sourceScenario));
  source.edgeFrames[frameIndex][index].kind='BLOCKED';
  try{
   const altered=executeComputationalSessionR711(source,{origin:baselineSession.origin,target:baselineSession.target,mirrored:baselineSession.mirrored});
   setCandidateText(altered.sessionJson);compare(altered.sessionJson);
  }catch(e){setComparison(null);setError(e instanceof Error?e.message:'Intervention refused');}
 }
 return <section data-r713-counterfactual aria-label='Developmental counterfactual comparison' style={{borderTop:'1px solid #65727d',paddingTop:10,marginTop:10}}>
  <h5>R713 · Counterfactual developmental propagation</h5>
  <p>Hold initial state, kernel parameters, endpoints and observer fixed; change one source edge and independently recompute all frames. This does not measure real-world causation.</p>
  <label>Edge to block in frame {frameIndex+1} <select data-r713-edge value={chosen?.id??''} onChange={e=>{setEdgeId(e.target.value);setComparison(null);setError('');}}>{eligible.map((e:any)=><option key={e.id} value={e.id}>{e.from} → {e.to} ({e.kind}, {e.id})</option>)}</select></label>
  <button type='button' data-r713-intervene disabled={!chosen} onClick={intervene}>Block selected edge and recompute both histories</button>
  <label htmlFor='r713-candidate'>Or compare against another portable R711 session with the same initial state and route</label>
  <textarea id='r713-candidate' data-r713-candidate value={candidateText} onChange={e=>{setCandidateText(e.target.value);setComparison(null);setError('');}} rows={3} style={{display:'block',width:'100%',boxSizing:'border-box'}} />
  <button type='button' data-r713-compare onClick={()=>compare(candidateText)}>Recompute and compare candidate</button>
  <section data-r715-frontier aria-label='Enumerated source intervention frontier' style={{margin:'12px 0',paddingTop:8,borderTop:'1px solid #65727d'}}>
   <h6>R715 · Source-edge intervention frontier</h6>
   <p>Recompute one blocked edge at a time for this declared frame. The ranked results show modeled route vulnerability and Heightened sensitivity, not empirical forecasts. At most eight eligible edges are evaluated per page; incomplete coverage is explicitly reported.</p>
   <button type='button' data-r715-run onClick={()=>evaluateFrontier(0)}>Evaluate eligible edge interventions</button>
   {frontierError&&<p role='alert' data-r715-error>REFUSED: {frontierError}</p>}
   {frontier&&<div data-r715-result>
    <p role='status' data-r715-coverage>{frontier.evaluated} of {frontier.totalEligible} eligible source edges evaluated on this page · offset {frontier.offset} · {frontier.coverage==='COMPLETE_DECLARED_FRAME'?'complete declared-frame coverage':'partial declared-frame coverage; other edges not yet evaluated'}</p>
    <div style={{maxWidth:'100%',overflowX:'auto'}}><table><thead><tr><th>Source edge</th><th>Model gate</th><th>Lost route frames</th><th>Changed route frames</th><th>Changed node states</th><th>Peak jerk delta</th></tr></thead><tbody>
     {frontier.ranking.map((item:any)=><tr key={item.edgeIndex} data-r715-edge-row={item.edgeIndex}><td>{item.from} → {item.to} ({item.kind}, #{item.edgeIndex})</td><td data-r715-impact>{item.gate}</td><td>{item.routeLossFrames}</td><td>{item.changedRouteFrames}</td><td>{item.changedNodeStates}</td><td>{item.peakByOrder.jerk.toFixed(5)}</td></tr>)}
    </tbody></table></div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
     <button type='button' data-r715-prev disabled={frontier.offset===0} onClick={()=>evaluateFrontier(Math.max(0,frontier.offset-8))}>Previous eligible edges</button>
     <button type='button' data-r715-next disabled={!frontier.hasMore} onClick={()=>evaluateFrontier(frontier.offset+frontier.evaluated)}>Next eligible edges</button>
    </div>
    <small data-r715-boundary>{frontier.boundary}</small>
   </div>}
  </section>
  <section data-r716-composition aria-label='Joint source-edge intervention composition' style={{margin:'12px 0',paddingTop:8,borderTop:'1px solid #65727d'}}>
   <h6>R716 · Joint intervention and nonadditive model response</h6>
   <p>Block each eligible source-edge pair together, recompute both single cuts and the joint cut, and inspect route redundancy and the finite state interaction residual. This is local graph and mathematical model behavior, not a causal forecast.</p>
   <button type='button' data-r716-run onClick={()=>evaluateJoint(0)}>Evaluate joint edge interventions</button>
   {jointError&&<p role='alert' data-r716-error>REFUSED: {jointError}</p>}
   {joint&&<div data-r716-result>
    <p role='status' data-r716-coverage>{joint.evaluated} of {joint.totalEligiblePairs} eligible edge pairs evaluated on this page · {joint.coverage==='COMPLETE_DECLARED_FRAME_PAIRS'?'complete declared-frame pair coverage':'partial declared-frame pair coverage'} · offset {joint.offset}</p>
    <div style={{maxWidth:'100%',overflowX:'auto'}}><table><thead><tr><th>Source pair</th><th>Model gate</th><th>Joint-only route losses</th><th>Total lost route frames</th><th>Changed node states</th><th>Peak state interaction residual</th><th>Peak jerk delta</th></tr></thead><tbody>
     {joint.candidates.map((item:any)=><tr key={item.edgeIndices.join('-')} data-r716-row={item.edgeIndices.join('-')}>
      <td>{item.edges.map((e:any)=>e.from+' → '+e.to+' ('+e.kind+', #'+e.index+')').join(' + ')}</td>
      <td data-r716-gate>{item.gate}</td><td>{item.jointOnlyLossFrames.length}</td><td>{item.routeLossFrames}</td><td>{item.changedNodeStates}</td>
      <td>{item.peakStateInteraction?item.peakStateInteraction.absoluteResidual.toFixed(6)+' ('+item.peakStateInteraction.nodeId+' '+item.peakStateInteraction.field+', state '+item.peakStateInteraction.stateIndex+')':'none'}</td>
      <td>{item.peakJerk.toFixed(6)}</td>
     </tr>)}
    </tbody></table></div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
     <button type='button' data-r716-prev disabled={joint.offset===0} onClick={()=>evaluateJoint(Math.max(0,joint.offset-6))}>Previous pairs</button>
     <button type='button' data-r716-next disabled={!joint.hasMore} onClick={()=>evaluateJoint(joint.offset+joint.evaluated)}>Next pairs</button>
    </div>
    <small data-r716-boundary>{joint.boundary}</small>
   </div>}
  </section>
  <section data-r718-temporal aria-label='Cross-frame developmental interaction' style={{margin:'12px 0',paddingTop:8,borderTop:'1px solid #65727d'}}>
   <h6>R718 · Temporal carry and cross-frame interaction</h6>
   <p>Choose two source edges in different frames. Recompute the baseline, both individual interventions and their composition, then inspect longitudinal continuity, scar and other state residuals. This is a mathematical source model, not an empirical forecast.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <label>First frame <select data-r718-first-frame data-r718-first-frame-state={firstFrame} ref={firstFrameSelect} value={firstFrame} onChange={e=>chooseFirstFrame(Number(e.currentTarget.value))}>{frameChoices.map((_:any,i:number)=><option key={i} value={i}>{i+1}</option>)}</select></label>
    <label>First source edge <select data-r718-first-edge ref={firstEdgeSelect} value={selectedFirstEdge} onChange={e=>{setFirstEdge(Number(e.target.value));setTemporal(null);setTemporalError('');}}>{eligibleAt(firstFrame).map(({edge,index}:any)=><option key={index} value={index}>{edge.from} → {edge.to} ({edge.kind}, #{index})</option>)}</select></label>
    <label>Second frame <select data-r718-second-frame data-r718-second-frame-state={secondFrame} ref={secondFrameSelect} value={secondFrame} onChange={e=>chooseSecondFrame(Number(e.currentTarget.value))}>{frameChoices.map((_:any,i:number)=><option key={i} value={i}>{i+1}</option>)}</select></label>
    <label>Second source edge <select data-r718-second-edge ref={secondEdgeSelect} value={selectedSecondEdge} onChange={e=>{setSecondEdge(Number(e.target.value));setTemporal(null);setTemporalError('');}}>{eligibleAt(secondFrame).map(({edge,index}:any)=><option key={index} value={index}>{edge.from} → {edge.to} ({edge.kind}, #{index})</option>)}</select></label>
   </div>
   <div aria-label='Cross-frame navigation' style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button type='button' data-r718-second-previous disabled={secondFrame<=0} onClick={()=>chooseSecondFrame(Math.max(0,secondFrame-1))}>Previous second frame</button>
    <button type='button' data-r718-second-next disabled={secondFrame>=frameChoices.length-1} onClick={()=>chooseSecondFrame(Math.min(frameChoices.length-1,secondFrame+1))}>Next second frame</button>
   </div>
   <button type='button' data-r718-run onClick={evaluateTemporal}>Recompute cross-frame temporal interaction</button>
   {temporalError&&<p role='alert' data-r718-error>REFUSED: {temporalError}</p>}
   {temporal&&<div data-r718-result>
    <p role='status' data-r718-summary>{temporal.jointChangedNodeStates} joint-changed node states · {temporal.interactionSamples} nonadditive state samples · {temporal.tailChangedStates} changed states after the second intervention frame · {temporal.jointOnlyRouteLossFrames.length} joint-only route losses</p>
    <div style={{maxWidth:'100%',overflowX:'auto'}}><table><thead><tr><th>State</th><th>Joint-changed nodes</th><th>Nonadditive nodes</th><th>Sum absolute interaction</th></tr></thead><tbody>
     {temporal.timeline.map((item:any)=><tr key={item.stateIndex} data-r718-timeline={item.stateIndex}><td>{item.stateIndex}</td><td>{item.jointChangedNodes}</td><td>{item.changedNodes}</td><td>{item.absoluteInteraction.toFixed(6)}</td></tr>)}
    </tbody></table></div>
    <p data-r718-peak>{temporal.peakInteraction?'Peak interaction: '+temporal.peakInteraction.nodeId+' '+temporal.peakInteraction.field+' at state '+temporal.peakInteraction.stateIndex+' = '+temporal.peakInteraction.residual.toFixed(6):'No nonadditive model-state residual observed'} · peak joint jerk delta {temporal.peakJointJerkDelta.toFixed(6)}</p>
    <small data-r718-boundary>{temporal.boundary}</small>
   </div>}
  </section>
  <section data-r717-minimal-cuts aria-label='Bounded exact minimum route-cut analysis' style={{margin:'12px 0',paddingTop:8,borderTop:'1px solid #65727d'}}>
   <h6>R717 · Minimum source-route cut witnesses</h6>
   <p>Prove the smallest one- or two-edge source cut that destroys the selected route. Exhaustive only for at most eight eligible edges in the chosen frame; other frames and larger cuts are not silently promoted to proof.</p>
   <button type='button' data-r717-run onClick={evaluateMinimalCuts}>Prove bounded minimum route cuts</button>
   {minimalCutsError&&<p role='alert' data-r717-error>REFUSED: {minimalCutsError}</p>}
   {minimalCuts&&<div data-r717-result>
    <p role='status' data-r717-coverage>{minimalCuts.evaluatedSingletons} single-edge cuts and {minimalCuts.evaluatedPairs} paired cuts recomputed · {minimalCuts.eligibleEdges.length} eligible source edges · exact minimum up to size two</p>
    <div style={{maxWidth:'100%',overflowX:'auto'}}><table><thead><tr><th>Frame</th><th>Baseline route</th><th>Minimum cut</th><th>Source-edge witnesses</th><th>Peak model jerk delta</th></tr></thead><tbody>
     {minimalCuts.frames.map((item:any)=><tr key={item.frameIndex} data-r717-row={item.frameIndex}>
      <td>{item.frameIndex+1}</td><td>{item.baselineReachable?'reachable':'unreachable'}</td>
      <td data-r717-minimum>{item.minimumCutSize===null?item.status:item.minimumCutSize}</td>
      <td>{item.witnesses.length?item.witnesses.map((w:any)=>w.edges.map((e:any)=>e.from+' → '+e.to+' ('+e.kind+', #'+e.index+')').join(' + ')).join('; '):'none'}</td>
      <td>{item.witnesses.length?Math.max(...item.witnesses.map((w:any)=>w.peakJerkDelta)).toFixed(6):'none'}</td>
     </tr>)}
    </tbody></table></div>
    <small data-r717-boundary>{minimalCuts.boundary}</small>
   </div>}
  </section>
  {error&&<p role='alert' data-r713-error>REFUSED: {error}</p>}
  {comparison&&<div data-r713-result>
   <p role='status' data-r713-summary>{comparison.changedSourceFrames.length} changed source frames · {comparison.changedNodeStates} changed node states · {comparison.changedRouteFrames} changed route frames · first state divergence {comparison.firstStateDivergence===null?'none':comparison.firstStateDivergence}</p>
   <div style={{maxWidth:'100%',overflowX:'auto'}}><table><thead><tr><th>Frame</th><th>Route baseline</th><th>Route intervention</th><th>Path changed</th></tr></thead><tbody>{comparison.routes.map((row:any)=><tr key={row.frameIndex}><td>{row.frameIndex+1}</td><td>{row.baselineReachable?'reachable':'blocked'}</td><td>{row.interventionReachable?'reachable':'blocked'}</td><td>{row.pathChanged?'yes':'no'}</td></tr>)}</tbody></table></div>
   <details data-r713-state-deltas><summary>Recomputed continuity, scar, contradiction and plasticity deltas</summary>{comparison.states.map((row:any)=><div key={row.stateIndex}>State {row.stateIndex}: {row.changedNodes.length?row.changedNodes.map((n:any)=>`${n.id} ΔC=${n.delta.continuity.toFixed(5)} Δscar=${n.delta.scar.toFixed(5)} Δq=${n.delta.contradiction.toFixed(5)} ΔΦ=${n.delta.plasticity.toFixed(5)}`).join('; '):'no change'}</div>)}</details>
   <section data-r714-derivatives aria-label='Heightened derivative counterfactual sensitivity'>
    <h6>R714 · Heightened developmental sensitivity (finite differences)</h6>
    <p>Independent R651 velocity, acceleration and jerk comparisons for continuity, burden, scar, contradiction and plasticity. These are model derivatives, not physical motion.</p>
    <div style={{maxWidth:'100%',overflowX:'auto'}}><table><thead><tr><th>Derivative</th><th>Changed node samples</th><th>First changed sample</th><th>Peak absolute delta</th></tr></thead><tbody>
     {(['velocity','acceleration','jerk'] as const).map(order=>{const result=comparison.developmentalSensitivity.orders[order];return <tr key={order} data-r714-order={order}><td>{order}</td><td>{result.changedSamples}</td><td>{result.firstDivergenceIndex===null?'none':result.firstDivergenceIndex}</td><td>{result.peak?result.peak.absoluteDelta.toFixed(5)+' ('+result.peak.nodeId+' '+result.peak.field+')':'none'}</td></tr>;})}
    </tbody></table></div>
    <details data-r714-witnesses><summary>Inspect per-sample derivative deltas</summary>
     {(['velocity','acceleration','jerk'] as const).map(order=><div key={order}><strong>{order}</strong>{comparison.developmentalSensitivity.orders[order].samples.map((sample:any)=><p key={sample.sampleIndex}>Sample {sample.sampleIndex}: {sample.changedNodes.length?sample.changedNodes.map((node:any)=>node.id+' '+Object.entries(node.delta).filter(([,delta])=>Math.abs(delta as number)>1e-12).map(([metric,delta])=>metric+' '+(delta as number).toFixed(5)).join(', ')).join('; '):'no change'}</p>)}</div>)}
    </details>
    <small data-r714-boundary>{comparison.developmentalSensitivity.boundary}</small>
   </section>
   <small>{comparison.boundary}</small>
  </div>}
 </section>;
}

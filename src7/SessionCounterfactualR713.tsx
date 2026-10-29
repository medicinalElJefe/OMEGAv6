import {useEffect,useState} from 'react';
import {executeComputationalSessionR711} from '../src/computationalSessionR711.mjs';
import {compareComputationalSessionsR713} from '../src/computationalSessionComparisonR713.mjs';

// Local source-model intervention only; never an edit to CanonState.
export function SessionCounterfactualR713({baselineSession,frameIndex,projection}:{baselineSession:any;frameIndex:number;projection:any}){
 const [edgeId,setEdgeId]=useState('');
 const [candidateText,setCandidateText]=useState('');
 const [comparison,setComparison]=useState<any|null>(null);
 const [error,setError]=useState('');
 useEffect(()=>{setComparison(null);setCandidateText('');setError('');},[baselineSession.sessionJson,frameIndex]);
 const eligible=projection.edges.filter((e:any)=>e.kind!=='BLOCKED'&&e.weight>0);
 const chosen=eligible.find((e:any)=>e.id===edgeId)??eligible[0];
 function compare(text:string){
  try{const result=compareComputationalSessionsR713(baselineSession.sessionJson,text);setComparison(result);setError('');}
  catch(e){setComparison(null);setError(e instanceof Error?e.message:'Comparison refused');}
 }
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

import {useEffect,useState} from 'react';
import {traceCrossFrameTrajectoryR720} from '../src/crossFrameTrajectoryR720.mjs';

const STORAGE='omega-r720-source-trajectory-v1';
const COLORS:{[key:string]:string}={baseline:'#6fc5ff',first:'#65e2b1',second:'#ffd17d',joint:'#c5a4ff'};
const SERIES=['baseline','first','second','joint'] as const;
function points(rows:any[],key:string,min:number,max:number){
 const span=Math.max(1e-9,max-min);
 return rows.map((row,i)=>`${(28+i*560/Math.max(1,rows.length-1)).toFixed(2)},${(196-(row[key]-min)/span*164).toFixed(2)}`).join(' ');
}
export function CrossFrameTrajectoryR720({baselineSession,selection}:{baselineSession:any;selection:any}){
 const [chosen,setChosen]=useState<any>(selection);
 const [nodeId,setNodeId]=useState(baselineSession.sourceScenario.nodes[0]?.id??'');
 const [metric,setMetric]=useState('continuity');
 const [trajectory,setTrajectory]=useState<any|null>(null);
 const [error,setError]=useState('');
 const [status,setStatus]=useState('');
 useEffect(()=>{
  setChosen(selection);setNodeId(baselineSession.sourceScenario.nodes[0]?.id??'');
  setMetric('continuity');setTrajectory(null);setError('');setStatus('');
 },[baselineSession.sessionJson,selection.firstFrameIndex,selection.firstEdgeIndex,selection.secondFrameIndex,selection.secondEdgeIndex]);
 function compute(){
  try{
   const result=traceCrossFrameTrajectoryR720(baselineSession.sessionJson,chosen,{nodeId,metric});
   setTrajectory(result);setError('');setStatus('');
  }catch(e){setTrajectory(null);setError(e instanceof Error?e.message:'R720 trajectory refused');}
 }
 function save(){
  if(!trajectory)return;
  try{
   const pair={
    firstFrameIndex:trajectory.selected[0].frameIndex,firstEdgeIndex:trajectory.selected[0].edgeIndex,
    secondFrameIndex:trajectory.selected[1].frameIndex,secondEdgeIndex:trajectory.selected[1].edgeIndex
   };
   const portable={schema:'OMEGA_R720_PORTABLE_SOURCE_SELECTION_V1',sessionJson:baselineSession.sessionJson,
    selection:pair,nodeId:trajectory.nodeId,metric:trajectory.metric};
   window.localStorage.setItem(STORAGE,JSON.stringify(portable));
   setError('');setStatus('Saved reproducible selection locally. Restore recomputes the source histories.');
  }catch(e){setError(e instanceof Error?e.message:'R720 save refused');}
 }
 function restore(){
  try{
   const raw=window.localStorage.getItem(STORAGE);
   if(!raw||raw.length>131072)throw Error('R720 no valid bounded local trajectory selection');
   const saved=JSON.parse(raw);
   if(!saved||saved.schema!=='OMEGA_R720_PORTABLE_SOURCE_SELECTION_V1'||
      Object.keys(saved).sort().join(',')!=='metric,nodeId,schema,selection,sessionJson')
    throw Error('R720 unsupported local selection envelope');
   if(saved.sessionJson!==baselineSession.sessionJson)
    throw Error('R720 selection belongs to a different source session; restore that R711 session first');
   const result=traceCrossFrameTrajectoryR720(saved.sessionJson,saved.selection,{nodeId:saved.nodeId,metric:saved.metric});
   setChosen(saved.selection);setNodeId(result.nodeId);setMetric(result.metric);
   setTrajectory(result);setError('');setStatus('Restored and independently recomputed four source histories.');
  }catch(e){setTrajectory(null);setError(e instanceof Error?e.message:'R720 restore refused');}
 }
 const values=trajectory?trajectory.states.flatMap((row:any)=>SERIES.map(key=>row[key])):[];
 const low=values.length?Math.min(...values):0,high=values.length?Math.max(...values):1;
 const residualMax=trajectory?Math.max(1e-9,...trajectory.states.map((row:any)=>Math.abs(row.residual))):1;
 return <section data-r720-trajectory aria-label='Recomputed four-way developmental trajectory' style={{margin:'12px 0',paddingTop:8,borderTop:'1px solid #65727d'}}>
  <h6>R720 · Four-way developmental trajectory</h6>
  <p>View actual source-model values under baseline, first cut, second cut and joint cut. The lower plot shows their nonadditive residual. Finite differences count model steps, not measured time.</p>
  <p data-r720-selection>Frame {chosen.firstFrameIndex+1} edge #{chosen.firstEdgeIndex} / frame {chosen.secondFrameIndex+1} edge #{chosen.secondEdgeIndex}</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <label>Node <select data-r720-node value={nodeId} onChange={e=>{setNodeId(e.target.value);setTrajectory(null);setStatus('');}}>{baselineSession.sourceScenario.nodes.map((node:any)=><option key={node.id} value={node.id}>{node.id}</option>)}</select></label>
   <label>Field <select data-r720-metric value={metric} onChange={e=>{setMetric(e.target.value);setTrajectory(null);setStatus('');}}>{['continuity','burden','scar','contradiction','plasticity'].map(field=><option key={field} value={field}>{field}</option>)}</select></label>
  </div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button type='button' data-r720-run onClick={compute}>Recompute four histories and plot</button>
   <button type='button' data-r720-save disabled={!trajectory} onClick={save}>Save selection locally</button>
   <button type='button' data-r720-restore onClick={restore}>Restore and recompute</button>
  </div>
  {error&&<p role='alert' data-r720-error>REFUSED: {error}</p>}
  {status&&<p role='status' data-r720-status>{status}</p>}
  {trajectory&&<div data-r720-result>
   <p role='status' data-r720-summary>{trajectory.states.length} recomputed states · {trajectory.nodeId} / {trajectory.metric} · absolute residual sum {trajectory.absoluteResidual.toFixed(6)} · peak at state {trajectory.peakResidual.stateIndex}</p>
   <div style={{maxWidth:720}}>
    <svg data-r720-history role='img' aria-label='Four independent source-model state trajectories' viewBox='0 0 620 232' style={{width:'100%',height:'auto',background:'#101c28',borderRadius:6}}>
     <line x1='28' y1='196' x2='588' y2='196' stroke='#8195a7'/><line x1='28' y1='32' x2='28' y2='196' stroke='#8195a7'/>
     {SERIES.map(key=><polyline key={key} data-r720-curve={key} fill='none' stroke={COLORS[key]} strokeWidth='2.5' points={points(trajectory.states,key,low,high)}/>)}
     <text x='30' y='21' fill='#e4edf7' fontSize='12'>Source model · {trajectory.nodeId} · {trajectory.metric}</text>
     <text x='30' y='216' fill='#d1deeb' fontSize='11'>State 0</text><text x='520' y='216' fill='#d1deeb' fontSize='11'>State {trajectory.states.length-1}</text>
     <text x='30' y='44' fill='#d1deeb' fontSize='10'>max {high.toFixed(4)}</text><text x='30' y='189' fill='#d1deeb' fontSize='10'>min {low.toFixed(4)}</text>
    </svg>
    <div data-r720-legend style={{display:'flex',gap:12,flexWrap:'wrap'}}>{SERIES.map(key=><span key={key} style={{color:COLORS[key]}}>● {key}</span>)}</div>
    <svg data-r720-residual role='img' aria-label='Nonadditive interaction residual by source state' viewBox='0 0 620 232' style={{width:'100%',height:'auto',background:'#101c28',borderRadius:6}}>
     <line x1='28' y1='114' x2='588' y2='114' stroke='#8195a7' strokeDasharray='4 4'/><line x1='28' y1='32' x2='28' y2='196' stroke='#8195a7'/>
     <polyline data-r720-residual-curve fill='none' stroke='#ffac7c' strokeWidth='2.5' points={points(trajectory.states,'residual',-residualMax,residualMax)}/>
     <text x='30' y='21' fill='#e4edf7' fontSize='12'>Joint − first − second + baseline</text>
     <text x='30' y='216' fill='#d1deeb' fontSize='11'>State 0</text><text x='520' y='216' fill='#d1deeb' fontSize='11'>State {trajectory.states.length-1}</text>
     <text x='30' y='44' fill='#d1deeb' fontSize='10'>+{residualMax.toFixed(4)}</text><text x='30' y='189' fill='#d1deeb' fontSize='10'>−{residualMax.toFixed(4)}</text>
    </svg>
   </div>
   <div style={{maxWidth:'100%',overflowX:'auto'}}><table><thead><tr><th>State</th><th>Baseline</th><th>First</th><th>Second</th><th>Joint</th><th>Residual</th></tr></thead><tbody>
    {trajectory.states.map((row:any)=><tr key={row.stateIndex} data-r720-state={row.stateIndex}><td>{row.stateIndex}</td><td>{row.baseline.toFixed(6)}</td><td>{row.first.toFixed(6)}</td><td>{row.second.toFixed(6)}</td><td>{row.joint.toFixed(6)}</td><td data-r720-state-residual>{row.residual.toFixed(6)}</td></tr>)}
   </tbody></table></div>
   <p data-r720-derivatives>Finite differences: {trajectory.derivatives.velocity.length} velocity, {trajectory.derivatives.acceleration.length} acceleration and {trajectory.derivatives.jerk.length} jerk samples, computed from each of the four source histories.</p>
   <small data-r720-boundary>{trajectory.boundary}</small>
  </div>}
 </section>;
}

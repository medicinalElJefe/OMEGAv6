import {useEffect,useState} from 'react';
import {computeCrossFrameFieldAtlasR721} from '../src/crossFrameFieldAtlasR721.mjs';

const STORAGE='omega-r721-source-field-atlas-v1';
export function CrossFrameFieldAtlasR721({baselineSession,selection}:{baselineSession:any;selection:any}){
 const [atlas,setAtlas]=useState<any|null>(null);
 const [stateIndex,setStateIndex]=useState(0);
 const [cellKey,setCellKey]=useState('');
 const [error,setError]=useState('');
 const [status,setStatus]=useState('');
 useEffect(()=>{
  setAtlas(null);setStateIndex(0);setCellKey('');setError('');setStatus('');
 },[baselineSession.sessionJson,selection.firstFrameIndex,selection.firstEdgeIndex,
    selection.secondFrameIndex,selection.secondEdgeIndex]);
 function compute(){
  try{
   const result=computeCrossFrameFieldAtlasR721(baselineSession.sessionJson,selection);
   setAtlas(result);setStateIndex(0);
   setCellKey(result.nodeIds[0]+':'+result.fields[0]);setError('');setStatus('');
  }catch(e){setAtlas(null);setError(e instanceof Error?e.message:'R721 source atlas refused');}
 }
 function save(){
  if(!atlas)return;
  try{
   const portable={schema:'OMEGA_R721_SOURCE_FIELD_SELECTION_V1',
    sessionJson:baselineSession.sessionJson,
    selection:{firstFrameIndex:atlas.selected[0].frameIndex,firstEdgeIndex:atlas.selected[0].edgeIndex,
     secondFrameIndex:atlas.selected[1].frameIndex,secondEdgeIndex:atlas.selected[1].edgeIndex},
    stateIndex,cellKey};
   window.localStorage.setItem(STORAGE,JSON.stringify(portable));
   setStatus('Saved source field and state selection locally.');setError('');
  }catch(e){setError(e instanceof Error?e.message:'R721 save refused');}
 }
 function restore(){
  try{
   const raw=window.localStorage.getItem(STORAGE);
   if(!raw||raw.length>131072)throw Error('R721 no bounded saved field selection');
   const saved=JSON.parse(raw);
   if(!saved||saved.schema!=='OMEGA_R721_SOURCE_FIELD_SELECTION_V1'||
      Object.keys(saved).sort().join(',')!=='cellKey,schema,selection,sessionJson,stateIndex')
    throw Error('R721 unsupported saved selection');
   if(saved.sessionJson!==baselineSession.sessionJson)
    throw Error('R721 selection belongs to a different source session; restore the source first');
   const result=computeCrossFrameFieldAtlasR721(saved.sessionJson,saved.selection);
   if(!Number.isSafeInteger(saved.stateIndex)||saved.stateIndex<0||saved.stateIndex>=result.stateCount||
      !result.ranking.some((entry:any)=>entry.nodeId+':'+entry.field===saved.cellKey))
    throw Error('R721 saved field or state is invalid');
   setAtlas(result);setStateIndex(saved.stateIndex);setCellKey(saved.cellKey);
   setError('');setStatus('Restored and independently recomputed the full source field atlas.');
  }catch(e){setAtlas(null);setError(e instanceof Error?e.message:'R721 restore refused');}
 }
 const state=atlas?.states[stateIndex];
 const selected=state?.cells.find((cell:any)=>cell.nodeId+':'+cell.field===cellKey);
 const maxAbs=state?Math.max(1e-12,...state.cells.map((cell:any)=>Math.abs(cell.residual))):1;
 return <section data-r721-atlas aria-label='Cross-frame all-node developmental field atlas'
  style={{margin:'12px 0',paddingTop:8,borderTop:'1px solid #65727d'}}>
  <h6>R721 · All-node developmental field atlas</h6>
  <p>Recompute every node and model field for the selected cross-frame pair. Inspect signed nonadditive residuals and move through source-model states without inventing physical dimensions.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button type='button' data-r721-run onClick={compute}>Compute full source field atlas</button>
   <button type='button' data-r721-save disabled={!atlas} onClick={save}>Save field selection locally</button>
   <button type='button' data-r721-restore onClick={restore}>Restore and recompute</button>
  </div>
  {error&&<p role='alert' data-r721-error>REFUSED: {error}</p>}
  {status&&<p role='status' data-r721-status>{status}</p>}
  {atlas&&state&&<div data-r721-result>
   <p role='status' data-r721-coverage>{atlas.cellCount} source cells recomputed across {atlas.stateCount} states, {atlas.nodeIds.length} nodes and {atlas.fields.length} fields. Coverage: {atlas.coverage}.</p>
   <p data-r721-peak>Largest absolute source interaction: {atlas.peak?.nodeId} / {atlas.peak?.field} at state {atlas.peak?.stateIndex} = {atlas.peak?.residual.toFixed(6)}. Cumulative absolute interaction {atlas.absoluteInteraction.toFixed(6)}.</p>
   <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
    <button type='button' data-r721-previous disabled={stateIndex===0} onClick={()=>setStateIndex(n=>Math.max(0,n-1))}>Previous state</button>
    <output data-r721-state-index aria-live='polite'>State {stateIndex} of {atlas.stateCount-1}</output>
    <button type='button' data-r721-next disabled={stateIndex===atlas.stateCount-1} onClick={()=>setStateIndex(n=>Math.min(atlas.stateCount-1,n+1))}>Next state</button>
   </div>
   <p data-r721-state-summary>Absolute interaction {state.absoluteInteraction.toFixed(6)} · {state.changedNodes} changed source nodes. Blue is positive, amber is negative; intensity is relative to the selected state.</p>
   <div style={{maxWidth:'100%',overflowX:'auto'}}>
    <table data-r721-matrix><thead><tr><th>Node</th>{atlas.fields.map((field:string)=><th key={field}>{field}</th>)}</tr></thead>
     <tbody>{atlas.nodeIds.map((nodeId:string)=><tr key={nodeId}><th scope='row'>{nodeId}</th>
      {atlas.fields.map((field:string)=>{
       const cell=state.cells.find((item:any)=>item.nodeId===nodeId&&item.field===field);
       const intensity=Math.abs(cell.residual)/maxAbs;
       const background=cell.residual>=0?'rgba(74,166,225,'+(0.10+0.65*intensity)+')':'rgba(227,155,73,'+(0.10+0.65*intensity)+')';
       const key=nodeId+':'+field;
       return <td key={field} style={{padding:3}}>
        <button type='button' data-r721-cell={key} aria-pressed={cellKey===key}
         title={nodeId+' '+field+' signed model interaction '+cell.residual.toFixed(6)}
         onClick={()=>setCellKey(key)} style={{background,color:'inherit',border:cellKey===key?'2px solid currentColor':'1px solid #65727d',borderRadius:4,padding:'8px 5px',width:'100%',minWidth:74}}>
         {cell.residual.toFixed(4)}
        </button>
       </td>;
      })}</tr>)}</tbody>
    </table>
   </div>
   {selected&&<div data-r721-detail>
    <p>Selected {selected.nodeId} / {selected.field} · state {stateIndex}. Residual = joint − first − second + baseline.</p>
    <div style={{maxWidth:'100%',overflowX:'auto'}}><table data-r721-values>
     <thead><tr><th>Baseline</th><th>First cut</th><th>Second cut</th><th>Joint cut</th><th>Residual</th></tr></thead>
     <tbody><tr>{['baseline','first','second','joint','residual'].map(key=><td key={key}>{selected[key].toFixed(6)}</td>)}</tr></tbody>
    </table></div>
   </div>}
   <p data-r721-ranking>Largest cumulative source cell: {atlas.ranking[0]?.nodeId} / {atlas.ranking[0]?.field}, absolute residual {atlas.ranking[0]?.absoluteResidual.toFixed(6)}, tail carry {atlas.ranking[0]?.tailAbsoluteResidual.toFixed(6)}.</p>
   <small data-r721-boundary>{atlas.boundary}</small>
  </div>}
 </section>;
}

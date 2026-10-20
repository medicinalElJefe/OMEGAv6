// R655 intrinsic state projection: no invented spatial geometry or visual objects.
import {executeProvenFrameR654,sha256R654} from './provenFrameR654.js';
const finite=(n,label)=>{if(typeof n!=='number'||!Number.isFinite(n))throw Error('invalid '+label);return n};
export function projectContinuityFieldR655(input,{width=512,height=512,columns=12}={}){
 for(const [label,value] of Object.entries({width,height,columns})){if(!Number.isInteger(value)||value<1||value>4096)throw Error('invalid '+label)}
 const proven=executeProvenFrameR654(input),state=proven.output.canonicalState,projection=proven.output.projection.nodes;
 if(state.length!==projection.length)throw Error('state/projection mismatch');
 const rows=Math.ceil(state.length/columns),cellWidth=width/columns,cellHeight=height/rows;
 const cells=state.map((s,i)=>{
  const p=projection[i];if(s.id!==p.id)throw Error('identity drift');
  const values={continuity:s.continuity,burden:s.burden,contradiction:s.contradiction,scar:s.scar,plasticity:s.plasticity,symmetry:p.symmetryRatio,asymmetry:p.motionRatio,stability:p.projectedStability,future:p.futureConductance};
  for(const [key,value] of Object.entries(values))finite(value,key);
  return {id:s.id,index:i,rect:{x:(i%columns)*cellWidth,y:Math.floor(i/columns)*cellHeight,width:cellWidth,height:cellHeight},values,sourceStateSha256:proven.proof.stateSha256};
 });
 const manifest={schema:'OMEGA_INTRINSIC_FIELD_PROJECTION_R655',truthClass:'LOCAL_COMPUTED_STATE_PROJECTION',geometry:'ADDRESS_GRID_NOT_PHYSICAL_SPACE',width,height,columns,rows,mode:proven.output.receipt.mode,cells,sourceProof:proven.proof};
 return {...manifest,projectionSha256:sha256R654(manifest)};
}

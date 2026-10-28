// R657: observer traversal across proof-bound address cells, not fabricated physical space.
import {projectContinuityFieldR655} from './intrinsicFieldR655.js';
import {sha256R654} from './provenFrameR654.js';
const indexFor=(cells,id)=>cells.findIndex(c=>c.id===id);
export function traverseIntrinsicFieldR657(input,{startId,steps=[],columns=12,width=512,height=512}={}){
 if(!Array.isArray(steps)||steps.length>4096)throw Error('bounded traversal steps required');
 const projection=projectContinuityFieldR655(input,{columns,width,height});const cells=projection.cells;
 let current=startId===undefined?0:indexFor(cells,startId);if(current<0)throw Error('unknown startId');
 const path=[{index:current,id:cells[current].id,values:cells[current].values}];
 for(const step of steps){
  if(!['NEXT','PREVIOUS','ROW_NEXT','ROW_PREVIOUS','RETURN','GOTO'].includes(step?.kind))throw Error('invalid traversal operation');
  let target=current;
  if(step.kind==='NEXT')target=current+1;
  if(step.kind==='PREVIOUS')target=current-1;
  if(step.kind==='ROW_NEXT')target=current+columns;
  if(step.kind==='ROW_PREVIOUS')target=current-columns;
  if(step.kind==='RETURN')target=0;
  if(step.kind==='GOTO')target=indexFor(cells,step.id);
  if(target<0||target>=cells.length)throw Error('traversal outside admitted field');
  current=target;path.push({index:current,id:cells[current].id,values:cells[current].values});
 }
 const record={schema:'OMEGA_PROVEN_ADDRESS_TRAVERSAL_R657',truthClass:'LOCAL_ADDRESS_TRAVERSAL_NOT_PHYSICAL_MOTION',sourceStateSha256:projection.sourceProof.stateSha256,sourceProjectionSha256:projection.projectionSha256,steps:structuredClone(steps),path,finalId:cells[current].id,coordinateLaw:'row-major address grid; not spatial adjacency'};
 return {...record,pathSha256:sha256R654(record)};
}

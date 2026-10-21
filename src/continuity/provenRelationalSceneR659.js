// R659: one source-bound scene combining computed state, intrinsic SVG, and typed traversal.
import {renderIntrinsicSvgR656} from './intrinsicSvgR656.js';
import {traverseRelationalFieldR658} from './relationalTraversalR658.js';
import {sha256R654} from './provenFrameR654.js';
export function buildProvenRelationalSceneR659(input,{startId,steps=[],width=512,height=512,columns=12}={}){
 const rendered=renderIntrinsicSvgR656(input,{width,height,columns});
 const state=rendered.manifest.cells.map(c=>({id:c.id,continuity:c.values.continuity,burden:c.values.burden,contradiction:c.values.contradiction,plasticity:c.values.plasticity,scar:c.values.scar}));
 const route=traverseRelationalFieldR658({nodes:state,edges:input.edges,startId:startId??state[0].id,steps});
 const cellById=new Map(rendered.manifest.cells.map(c=>[c.id,c]));
 const routeOverlay=route.path.map((p,index)=>({step:index,id:p.id,index:cellById.get(p.id).index,rect:cellById.get(p.id).rect,values:cellById.get(p.id).values}));
 const record={schema:'OMEGA_PROVEN_RELATIONAL_SCENE_R659',truthClass:'LOCAL_EXECUTABLE_SCENE_NOT_PRODUCTION_RENDER',mode:rendered.manifest.mode,sourceStateSha256:rendered.manifest.sourceProof.stateSha256,sourceProjectionSha256:rendered.sourceProjectionSha256,sourceGraphSha256:route.sourceGraphSha256,svg:rendered.svg,route:routeOverlay,routeEvidence:route.evidence,routeSha256:route.traversalSha256,rule:'traversal follows admitted directed graph edges; visualization uses canonical field projection; no fabricated physical geometry'};
 return {...record,sceneSha256:sha256R654(record)};
}

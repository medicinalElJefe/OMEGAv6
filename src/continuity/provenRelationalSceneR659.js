// R659: one source-bound scene combining computed state, intrinsic SVG, and typed traversal.
import {renderIntrinsicSvgR656} from './intrinsicSvgR656.js';
import {traverseRelationalFieldR658} from './relationalTraversalR658.js';
import {sha256R654} from './provenFrameR654.js';
import {normalizeState,normalizeEdge} from './wovenFieldR651.js';
export function buildProvenRelationalSceneR659(input,{startId,steps=[],width=512,height=512,columns=12}={}){
 // Capture the input graph before executing the frame; fail closed if callers mutate it during execution.
 const sourceNodes=input.nodes.map(normalizeState),sourceIds=new Set(sourceNodes.map(n=>n.id));
 const sourceEdges=input.edges.map(e=>normalizeEdge(e,sourceIds));
 const sourceGraphSha256=sha256R654({states:sourceNodes,links:sourceEdges});
 const rendered=renderIntrinsicSvgR656(input,{width,height,columns});
 const state=rendered.manifest.cells.map(c=>({id:c.id,continuity:c.values.continuity,burden:c.values.burden,contradiction:c.values.contradiction,plasticity:c.values.plasticity,scar:c.values.scar}));
 const route=traverseRelationalFieldR658({nodes:state,edges:sourceEdges,startId:startId??state[0].id,steps});
 const evolvedGraphSha256=sha256R654({states:state.map(normalizeState),links:sourceEdges});
 if(route.sourceGraphSha256!==evolvedGraphSha256)throw Error('traversal/evolved-state snapshot mismatch');
 const cellById=new Map(rendered.manifest.cells.map(c=>[c.id,c]));
 const routeOverlay=route.path.map((p,index)=>({step:index,id:p.id,index:cellById.get(p.id).index,rect:cellById.get(p.id).rect,values:cellById.get(p.id).values}));
 const record={schema:'OMEGA_PROVEN_RELATIONAL_SCENE_R659',truthClass:'LOCAL_EXECUTABLE_SCENE_NOT_PRODUCTION_RENDER',mode:rendered.manifest.mode,sourceStateSha256:rendered.manifest.sourceProof.stateSha256,sourceProjectionSha256:rendered.sourceProjectionSha256,sourceGraphSha256,sourceEvolvedGraphSha256:route.sourceGraphSha256,svg:rendered.svg,route:routeOverlay,routeEvidence:route.evidence,routeSha256:route.traversalSha256,rule:'traversal follows admitted directed graph edges; visualization uses canonical field projection; no fabricated physical geometry'};
 return {...record,sceneSha256:sha256R654(record)};
}

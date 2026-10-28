import {projectWovenTopologyR707} from './wovenTopologyProjectionR707.mjs';
import {inspectWovenRouteR708} from './wovenRouteInspectorR708.mjs';

// R709 tracks one selected directed route through all *recomputed* R706/R623/R651/R653
// source-model frames. A route's existence is structural, not measured transported matter.
export function traceWovenRouteR709(scenario,origin,target,mirrored=false){
 if(typeof mirrored!=='boolean')throw Error('R709 observer reflection must be boolean');
 const initial=projectWovenTopologyR707(scenario,0,mirrored);
 if(!initial.nodes.some(n=>n.id===origin)||!initial.nodes.some(n=>n.id===target))throw Error('R709 route endpoints must exist in computed scenario');
 const frames=[];
 let previous=null,firstLossFrame=null,firstRecoveryFrame=null,routeChanges=0,weightChanges=0;
 for(let index=0;index<initial.frames;index++){
  const projection=index===0?initial:projectWovenTopologyR707(scenario,index,mirrored);
  const witness=inspectWovenRouteR708(projection,origin,target);
  const signature=witness.pathEdges.map(e=>e.from+'>'+e.to+':'+e.kind).join('|');
  let event='INITIAL';
  if(previous){
   if(previous.reachable&&!witness.reachable){event='PATH_LOST';if(firstLossFrame===null)firstLossFrame=index;}
   else if(!previous.reachable&&witness.reachable){event='PATH_RECOVERED';if(firstRecoveryFrame===null)firstRecoveryFrame=index;}
   else if(witness.reachable&&previous.reachable){
    const rewired=previous.signature!==signature;
    const changedWeight=previous.bottleneck!==witness.bottleneckDeclaredWeight;
    if(rewired)routeChanges++;
    if(changedWeight)weightChanges++;
    event=rewired?'PATH_CHANGED':changedWeight?'DECLARED_WEIGHT_CHANGED':'UNCHANGED';
   }else event='UNCHANGED';
  }
  frames.push({frameIndex:index,reachable:witness.reachable,event,pathNodes:witness.pathNodes,
   pathEdgeIds:witness.pathEdges.map(e=>e.id),hops:witness.hops,bottleneckDeclaredWeight:witness.bottleneckDeclaredWeight,
   reachableNodeIds:witness.reachableNodeIds,excludedFrontier:witness.excludedFrontier});
  previous={reachable:witness.reachable,signature,bottleneck:witness.bottleneckDeclaredWeight};
 }
 const reachableFrames=frames.filter(f=>f.reachable).length;
 return {schema:'OMEGA_WOVEN_ROUTE_CONTINUITY_R709',truthClass:'LOCAL_RECOMPUTED_GRAPH_TIMELINE_ONLY',
  origin,target,frameCount:frames.length,reachableFrames,unreachableFrames:frames.length-reachableFrames,
  firstLossFrame,firstRecoveryFrame,routeChanges,weightChanges,frames,
  boundary:'Bounded recomputation of directed graph reachability over each actual R706 source frame. PATH_LOST and PATH_RECOVERED describe topology only; edge weights are declared parameters, not measured transport, probabilities, empirical time or physical dimensions. No CanonState admission, original AG-009 parity, native-host proof or production authority.'};
}

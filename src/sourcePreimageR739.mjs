// R739: exact inverse traversal of the existing finite 20,736-address successor graph.
// Every reverse edge is a witnessed source successor, never a physical flow or donor recovery.
import {ROUTE_BASIN_SCHEMA_R732} from './routeBasinR732.mjs';
export const SOURCE_PREIMAGE_SCHEMA_R739='OMEGA_SOURCE_PREIMAGE_R739_V1';
export function buildSourcePreimageIndexR739(routeNext,graph){
 const n=routeNext?.length;
 if(!Number.isSafeInteger(n)||n<1||n>20736||!graph||graph.schema!==ROUTE_BASIN_SCHEMA_R732||
    graph.nodeCount!==n||graph.basinOf?.length!==n||graph.depth?.length!==n)
  throw Error('R739 complete governed source graph required');
 const indegree=new Uint32Array(n),offsets=new Uint32Array(n+1),sources=new Uint32Array(n);
 for(let i=0;i<n;i++){
  const to=routeNext[i];
  if(!Number.isSafeInteger(to)||to<0||to>=n||graph.basinOf[i]!==graph.basinOf[to]||
     !Number.isSafeInteger(graph.depth[i])||graph.depth[i]<0||
     (graph.depth[i]>0&&graph.depth[i]!==graph.depth[to]+1))
   throw Error('R739 source successor/basin continuity refused at '+i);
  indegree[to]++;
 }
 for(let i=0;i<n;i++)offsets[i+1]=offsets[i]+indegree[i];
 if(offsets[n]!==n)throw Error('R739 reverse edge conservation failed');
 const cursor=offsets.slice(0,n);
 for(let i=0;i<n;i++)sources[cursor[routeNext[i]]++]=i;
 let hubAddress=0;
 for(let i=1;i<n;i++)if(indegree[i]>indegree[hubAddress])hubAddress=i;
 return {schema:SOURCE_PREIMAGE_SCHEMA_R739,nodeCount:n,indegree,offsets,sources,routeNext,hubAddress,
  edgeCount:n,sourceBound:true,canonicalMutation:false,physicalMeasurement:false};
}
export function inspectSourcePreimagesR739(index,graph,address,maxDepth=4,maxNodes=96){
 const n=index?.nodeCount;
 if(index?.schema!==SOURCE_PREIMAGE_SCHEMA_R739||!Number.isSafeInteger(n)||n<1||
    graph?.schema!==ROUTE_BASIN_SCHEMA_R732||graph.nodeCount!==n||
    index.offsets?.length!==n+1||index.sources?.length!==n||
    !Number.isSafeInteger(address)||address<0||address>=n||
    !Number.isSafeInteger(maxDepth)||maxDepth<1||maxDepth>16||
    !Number.isSafeInteger(maxNodes)||maxNodes<2||maxNodes>512)
  throw Error('R739 invalid inverse traversal request');
 const seen=new Set([address]);
 const nodes=[{address,layer:0,successor:null,indegree:index.indegree[address],
  distanceToCycle:graph.depth[address],cycleMember:graph.depth[address]===0}];
 const edges=[],layerCounts=[1];
 let omittedEdges=0,cycleClosureEdges=0;
 for(let cursor=0;cursor<nodes.length;cursor++){
  const node=nodes[cursor],start=index.offsets[node.address],end=index.offsets[node.address+1];
  if(node.layer>=maxDepth){omittedEdges+=end-start;continue;}
  for(let k=start;k<end;k++){
   const predecessor=index.sources[k];
   if(index.routeNext[predecessor]!==node.address||graph.basinOf[predecessor]!==graph.basinOf[address])
    throw Error('R739 inverse source edge mismatch');
   if(seen.has(predecessor)){
    edges.push({from:predecessor,to:node.address,cycleClosure:true});
    cycleClosureEdges++;
    continue;
   }
   if(nodes.length>=maxNodes){omittedEdges++;continue;}
   seen.add(predecessor);
   const layer=node.layer+1;
   nodes.push({address:predecessor,layer,successor:node.address,indegree:index.indegree[predecessor],
    distanceToCycle:graph.depth[predecessor],cycleMember:graph.depth[predecessor]===0});
   layerCounts[layer]=(layerCounts[layer]||0)+1;
   edges.push({from:predecessor,to:node.address,cycleClosure:false});
  }
 }
 return {schema:SOURCE_PREIMAGE_SCHEMA_R739,root:address,basinId:graph.basinOf[address],
  directPredecessors:index.indegree[address],hubAddress:index.hubAddress,
  nodeCount:n,visitedCount:nodes.length,edges,cycleClosureEdges,omittedEdges,
  truncated:omittedEdges>0,maxDepth,maxNodes,layerCounts,nodes,
  sourceBound:true,canonicalMutation:false,physicalMeasurement:false,
  boundary:'Exact inverse of declared source-model successor edges, bounded by depth and node budget. Not observed causal ancestry, physical bifurcation, original donor parity or CanonState admission.'};
}

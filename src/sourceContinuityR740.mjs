// R740: source successor / predecessor conservation proof, no physical or donor claims.
import {SOURCE_PREIMAGE_SCHEMA_R739} from './sourcePreimageR739.mjs';
import {ROUTE_BASIN_SCHEMA_R732} from './routeBasinR732.mjs';
export const SOURCE_CONTINUITY_SCHEMA_R740='OMEGA_SOURCE_CONTINUITY_R740_V1';
export function proveSourceContinuityR740(index,graph){
 const n=index?.nodeCount;
 if(index?.schema!==SOURCE_PREIMAGE_SCHEMA_R739||graph?.schema!==ROUTE_BASIN_SCHEMA_R732||
    !Number.isSafeInteger(n)||n<1||n>20736||graph.nodeCount!==n||
    index.edgeCount!==n||index.indegree?.length!==n||index.offsets?.length!==n+1||
    index.sources?.length!==n||index.routeNext?.length!==n||graph.basinOf?.length!==n||
    graph.depth?.length!==n)throw Error('R740 complete source graph required');
 if(index.offsets[0]!==0||index.offsets[n]!==n)throw Error('R740 edge boundary mismatch');
 const seen=new Uint8Array(n),basinNodes=new Map(),basinEdges=new Map();
 let cycleNodes=0,transientNodes=0,branchNodes=0,zeroPreimageNodes=0,maxIndegree=0;
 for(let i=0;i<n;i++){
  const basin=graph.basinOf[i],to=index.routeNext[i],degree=index.indegree[i];
  if(!Number.isSafeInteger(basin)||basin<0||!Number.isSafeInteger(to)||to<0||to>=n||
     graph.basinOf[to]!==basin||!Number.isSafeInteger(degree)||degree<0||
     index.offsets[i+1]-index.offsets[i]!==degree||
     !Number.isSafeInteger(graph.depth[i])||graph.depth[i]<0||
     (graph.depth[i]>0&&graph.depth[to]!==graph.depth[i]-1))
    throw Error('R740 address or basin continuity mismatch at '+i);
  basinNodes.set(basin,(basinNodes.get(basin)||0)+1);
  if(graph.depth[i]===0)cycleNodes++;else transientNodes++;
  if(degree>1)branchNodes++;
  if(degree===0)zeroPreimageNodes++;
  if(degree>maxIndegree)maxIndegree=degree;
  for(let k=index.offsets[i];k<index.offsets[i+1];k++){
   const from=index.sources[k];
   if(!Number.isSafeInteger(from)||from<0||from>=n||seen[from]++||
      index.routeNext[from]!==i||graph.basinOf[from]!==basin)
    throw Error('R740 inverse/forward edge bijection refused');
   basinEdges.set(basin,(basinEdges.get(basin)||0)+1);
  }
 }
 for(let i=0;i<n;i++)if(seen[i]!==1)throw Error('R740 missing or duplicated source edge '+i);
 const basins=[...basinNodes].sort((a,b)=>a[0]-b[0]).map(([basinId,nodeCount])=>{
  const edgeCount=basinEdges.get(basinId)||0;
  if(edgeCount!==nodeCount)throw Error('R740 basin edge conservation mismatch');
  return {basinId,nodeCount,edgeCount};
 });
 if(cycleNodes<1||cycleNodes+transientNodes!==n||basins.reduce((sum,b)=>sum+b.nodeCount,0)!==n||
    graph.cyclicNodes!==cycleNodes||graph.transientNodes!==transientNodes||
    graph.basinCount!==basins.length||graph.cycles?.length!==basins.length)
  throw Error('R740 global source conservation mismatch');
 for(const basin of basins){
  const cycle=graph.cycles[basin.basinId];
  if(!cycle||cycle.id!==basin.basinId||cycle.size!==basin.nodeCount||
     !Number.isSafeInteger(cycle.period)||cycle.period<1||
     !Array.isArray(cycle.nodes)||cycle.nodes.length!==cycle.period||
     cycle.nodes.some(node=>graph.basinOf[node]!==basin.basinId||graph.depth[node]!==0))
   throw Error('R740 source cycle and basin ledger mismatch');
 }
 return {schema:SOURCE_CONTINUITY_SCHEMA_R740,nodeCount:n,edgeCount:n,
  cycleNodes,transientNodes,branchNodes,zeroPreimageNodes,maxIndegree,basinCount:basins.length,
  basins,forwardInverseBijection:true,edgeConservation:true,basinConservation:true,
  sourceBound:true,canonicalMutation:false,physicalMeasurement:false,
  boundary:'Exact finite source-model edge and basin accounting; not historical donor parity, physical dynamics or CanonState admission.'};
}

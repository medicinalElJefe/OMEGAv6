// R741: exact directed reachability through the declared finite source successor graph.
// One successor per state: no invented reverse motion, branch crossing or physical travel.
import {SOURCE_PREIMAGE_SCHEMA_R739} from './sourcePreimageR739.mjs';
import {ROUTE_BASIN_SCHEMA_R732} from './routeBasinR732.mjs';
import {SOURCE_CONTINUITY_SCHEMA_R740} from './sourceContinuityR740.mjs';
export const SOURCE_DIRECTED_ROUTE_SCHEMA_R741='OMEGA_SOURCE_DIRECTED_ROUTE_R741_V1';
export function findDirectedSourceRouteR741(index,graph,conservation,from,to,limit=96){
 const n=index?.nodeCount;
 if(index?.schema!==SOURCE_PREIMAGE_SCHEMA_R739||
    graph?.schema!==ROUTE_BASIN_SCHEMA_R732||
    conservation?.schema!==SOURCE_CONTINUITY_SCHEMA_R740||
    conservation.nodeCount!==n||!conservation.forwardInverseBijection||
    !conservation.edgeConservation||!conservation.basinConservation||
    !Number.isSafeInteger(n)||n<1||n>20736||graph.nodeCount!==n||
    index.routeNext?.length!==n||graph.basinOf?.length!==n||
    graph.depth?.length!==n||graph.entry?.length!==n||
    !Number.isSafeInteger(from)||from<0||from>=n||
    !Number.isSafeInteger(to)||to<0||to>=n||
    !Number.isSafeInteger(limit)||limit<2||limit>128)
  throw Error('R741 complete verified source route and bounded addresses required');
 const sourceBasin=graph.basinOf[from],targetBasin=graph.basinOf[to];
 let steps=null,reason='unreachable';
 if(sourceBasin!==targetBasin)reason='different source basins: no directed route';
 else if(graph.depth[to]>0){
  if(graph.depth[from]<graph.depth[to])reason='target is upstream of source: forward edges cannot reverse';
  else{
   const distance=graph.depth[from]-graph.depth[to];
   let cursor=from;
   for(let i=0;i<distance;i++)cursor=index.routeNext[cursor];
   if(cursor===to)steps=distance;
   else reason='separate predecessor branches: forward paths do not cross';
  }
 }else{
  const cycle=graph.cycles[sourceBasin],entry=graph.entry[from];
  const entryIndex=cycle?.nodes?.indexOf(entry)??-1,targetIndex=cycle?.nodes?.indexOf(to)??-1;
  if(entryIndex<0||targetIndex<0||cycle.period!==cycle.nodes.length)
   throw Error('R741 source cycle entry witness refused');
  steps=graph.depth[from]+(targetIndex-entryIndex+cycle.period)%cycle.period;
 }
 const reachable=steps!==null;
 const addresses=[];
 if(reachable){
  let cursor=from;
  for(let i=0;i<=steps;i++){
   if(i<limit)addresses.push(cursor);
   if(i<steps){
    const next=index.routeNext[cursor];
    if(!Number.isSafeInteger(next)||next<0||next>=n||graph.basinOf[next]!==sourceBasin)
     throw Error('R741 source edge mismatch');
    cursor=next;
   }
  }
  if(cursor!==to)throw Error('R741 directed endpoint witness mismatch');
  reason='exact directed source successor route';
 }
 return {schema:SOURCE_DIRECTED_ROUTE_SCHEMA_R741,from,to,sourceBasin,targetBasin,
  reachable,steps,addresses,omittedAddresses:reachable?steps+1-addresses.length:0,
  reason,sourceBound:true,canonicalMutation:false,physicalMeasurement:false,
  boundary:'Directed reachability in the declared finite source-model graph only; not physical travel, historical donor parity or CanonState admission.'};
}

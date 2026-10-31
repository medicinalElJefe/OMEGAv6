// R732: exact finite functional-graph decomposition of the existing 20,736-address source route.
// The address atlas is a computational state space, not a physical dimensionality or time axis.
export const ROUTE_BASIN_SCHEMA_R732='OMEGA_SOURCE_ROUTE_BASINS_R732_V1';
export const ROUTE_BASIN_MAX_R732=20736;
export function computeRouteBasinsR732(routeNext){
 if(!routeNext||!Number.isSafeInteger(routeNext.length)||routeNext.length<1||routeNext.length>ROUTE_BASIN_MAX_R732)
  throw Error('R732 bounded source route count refused');
 const n=routeNext.length,indegree=new Int32Array(n),queue=new Int32Array(n),order=new Int32Array(n);
 for(let i=0;i<n;i++){
  const next=routeNext[i];
  if(!Number.isSafeInteger(next)||next<0||next>=n)throw Error('R732 invalid source route target at '+i);
  indegree[next]++;
 }
 let head=0,tail=0,removed=0;
 for(let i=0;i<n;i++)if(indegree[i]===0)queue[tail++]=i;
 while(head<tail){
  const node=queue[head++];order[removed++]=node;
  const next=routeNext[node];
  if(--indegree[next]===0)queue[tail++]=next;
 }
 const basinOf=new Int32Array(n).fill(-1),depth=new Int32Array(n),entry=new Int32Array(n).fill(-1),cycles=[];
 for(let i=0;i<n;i++){
  if(indegree[i]===0||basinOf[i]>=0)continue;
  const id=cycles.length,nodes=[];
  let node=i;
  do{
   if(basinOf[node]>=0||indegree[node]===0)throw Error('R732 cycle traversal invariant failed');
   basinOf[node]=id;entry[node]=node;nodes.push(node);node=routeNext[node];
  }while(node!==i);
  cycles.push({id,nodes,period:nodes.length,size:nodes.length,representative:Math.min(...nodes),maxDepth:0});
 }
 for(let k=removed-1;k>=0;k--){
  const node=order[k],next=routeNext[node],id=basinOf[next];
  if(id<0)throw Error('R732 missing successor basin');
  basinOf[node]=id;entry[node]=entry[next];depth[node]=depth[next]+1;
  cycles[id].size++;cycles[id].maxDepth=Math.max(cycles[id].maxDepth,depth[node]);
 }
 const assigned=cycles.reduce((sum,c)=>sum+c.size,0);
 if(assigned!==n)throw Error('R732 source conservation failed');
 const ranked=[...cycles].sort((a,b)=>b.size-a.size||a.representative-b.representative);
 return {schema:ROUTE_BASIN_SCHEMA_R732,nodeCount:n,basinCount:cycles.length,
  cyclicNodes:n-removed,transientNodes:removed,cycles,ranked,basinOf,depth,entry,
  maxDepth:cycles.reduce((m,c)=>Math.max(m,c.maxDepth),0),
  sourceBound:true,canonicalMutation:false,physicalTimeMeasurement:false};
}
export function inspectRouteBasinR732(graph,routeNext,address,limit=48){
 if(!graph||graph.schema!==ROUTE_BASIN_SCHEMA_R732||graph.nodeCount!==routeNext?.length||
  !Number.isSafeInteger(address)||address<0||address>=graph.nodeCount||
  !Number.isSafeInteger(limit)||limit<1||limit>128)throw Error('R732 invalid source basin inspection');
 const basinId=graph.basinOf[address],cycle=graph.cycles[basinId];
 if(!cycle)throw Error('R732 missing source basin');
 const trace=[];let cursor=address;
 for(let i=0;i<Math.min(limit,graph.depth[address]+cycle.period);i++){
  trace.push(cursor);cursor=routeNext[cursor];
 }
 return {address,basinId,cycleEntry:graph.entry[address],distanceToCycle:graph.depth[address],
  cycleLength:cycle.period,basinSize:cycle.size,trace,truncated:trace.length<graph.depth[address]+cycle.period,
  nextAddress:routeNext[address],truthClass:'SOURCE_MODEL_ROUTE_TOPOLOGY_ONLY'};
}

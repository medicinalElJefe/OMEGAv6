// R708 is a bounded, deterministic reachability witness over an already computed R707 frame.
// It neither changes the R651/R653 transport equations nor asserts physical causality.
const kinds=new Set(['INGRESS','EGRESS','BLOCKED','RESIDUE','RETURN']);
const admissible=new Set(['INGRESS','EGRESS','RESIDUE','RETURN']);
export function inspectWovenRouteR708(projection,origin,target){
 if(projection?.schema!=='OMEGA_WOVEN_TOPOLOGY_R707'||projection.truthClass!=='LOCAL_COMPUTED_VECTOR_MODEL_ONLY'||!Array.isArray(projection.nodes)||!Array.isArray(projection.edges)||projection.nodes.length<1||projection.nodes.length>12||projection.edges.length>48)throw Error('R708 requires bounded computed R707 frame');
 const ids=projection.nodes.map(n=>n.id),known=new Set(ids);
 if(known.size!==ids.length||ids.some(id=>typeof id!=='string'||!/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(id)))throw Error('R708 invalid node identities');
 if(!known.has(origin)||!known.has(target))throw Error('R708 route endpoints must exist in computed frame');
 const edges=projection.edges.map((e,index)=>{
  if(!e||e.id!=='edge-'+index||!known.has(e.from)||!known.has(e.to)||!kinds.has(e.kind)||typeof e.weight!=='number'||!Number.isFinite(e.weight)||e.weight<0||e.weight>1||e.blocked!==(e.kind==='BLOCKED'))throw Error('R708 invalid computed edge');
  const reason=e.kind==='BLOCKED'?'BLOCKED':e.weight===0?'ZERO_DECLARED_WEIGHT':null;
  return {id:e.id,from:e.from,to:e.to,kind:e.kind,weight:e.weight,reason};
 });
 const adjacency=new Map(ids.map(id=>[id,[]]));
 for(const e of edges)if(!e.reason&&admissible.has(e.kind))adjacency.get(e.from).push(e);
 const queue=[origin],visited=new Set(queue),predecessor=new Map();
 for(let head=0;head<queue.length;head++)for(const e of adjacency.get(queue[head]))if(!visited.has(e.to)){
  visited.add(e.to);predecessor.set(e.to,e);queue.push(e.to);
 }
 const reachable=visited.has(target),pathEdges=[],pathNodes=[];
 if(reachable){
  let current=target;pathNodes.unshift(current);
  while(current!==origin){const edge=predecessor.get(current);if(!edge)throw Error('R708 missing path predecessor');pathEdges.unshift({id:edge.id,from:edge.from,to:edge.to,kind:edge.kind,weight:edge.weight});current=edge.from;pathNodes.unshift(current);}
 }
 const excluded=edges.filter(e=>e.reason).map(e=>({id:e.id,from:e.from,to:e.to,kind:e.kind,reason:e.reason}));
 const frontier=excluded.filter(e=>visited.has(e.from)&&!visited.has(e.to));
 return {schema:'OMEGA_WOVEN_ROUTE_WITNESS_R708',truthClass:'LOCAL_GRAPH_REACHABILITY_ONLY',sourceFrame:projection.frameIndex,origin,target,reachable,
  pathNodes,pathEdges,hops:pathEdges.length,bottleneckDeclaredWeight:pathEdges.length?Math.min(...pathEdges.map(e=>e.weight)):null,
  reachableNodeIds:queue,excludedEdges:excluded,excludedFrontier:frontier,
  boundary:'Directed shortest-hop graph witness over computed R707 source-model edges. BLOCKED and zero-weight edges are excluded; RESIDUE remains a typed R651 carry edge. Graph reachability does not establish nonzero carried amount. Declared weights are not probabilities, observed flows, or physical causality. No CanonState, historical parity, native execution or production authority.'};
}

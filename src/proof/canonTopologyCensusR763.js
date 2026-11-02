/** R763 — independently replay the entire five-axis V27 topology.
 * A one-step edge is a +/-1 ordinal change in exactly one dimension.
 * No inference of physical motion or causal reachability is authorized.
 */
import {canonNodeR763,R763_AXES,R763_STRIDES,canonNeighborEdgesR763} from './canonNavigationR763.js';
export function auditFullCanonTopologyR763(){
 const N=248832,classes=new Uint8Array(N+1),modes=new Set();
 const c={ESCALATE:0,TURN:0,STAY:0};
 for(let i=1;i<=N;i++){const n=canonNodeR763(i);classes[i]=n.decision==='STAY'?3:n.decision==='TURN'?2:1;c[n.decision]++;modes.add(n.mode188)}
 const byAxis={},boundary=new Uint8Array(N+1);let edges=0,changes=0;
 for(let k=0;k<5;k++){
  const stride=R763_STRIDES[k];let n=0,x=0;
  for(let id=1;id<=N;id++){
   const coordinate=Math.floor((id-1)/stride)%12;
   if(coordinate===11)continue;
   n++;const next=id+stride;
   if(classes[id]!==classes[next]){x++;boundary[id]=1;boundary[next]=1;}
  }
  edges+=n;changes+=x;byAxis[R763_AXES[k]]={edges:n,changes:x};
 }
 let boundaryNodes=0;for(let i=1;i<=N;i++)boundaryNodes+=boundary[i];
 const seen=new Uint8Array(N+1),components={ESCALATE:0,TURN:0,STAY:0},largest={ESCALATE:0,TURN:0,STAY:0};
 for(let id=1;id<=N;id++){
  if(seen[id])continue;
  const code=classes[id],name=code===1?'ESCALATE':code===2?'TURN':'STAY';
  const queue=[id];let pos=0;seen[id]=1;
  while(pos<queue.length){const u=queue[pos++];for(const e of canonNeighborEdgesR763(u))if(!seen[e.to]&&classes[e.to]===code){seen[e.to]=1;queue.push(e.to)}}
  components[name]++;if(queue.length>largest[name])largest[name]=queue.length;
 }
 const dist=new Int8Array(N+1).fill(-1),queue=[];let ptr=0,max=0;
 for(let i=1;i<=N;i++)if(classes[i]===3){dist[i]=0;queue.push(i)}
 const histogram={};
 while(ptr<queue.length){const u=queue[ptr++],dd=dist[u];histogram[dd]=(histogram[dd]||0)+1;if(dd>max)max=dd;
  for(const e of canonNeighborEdgesR763(u))if(dist[e.to]===-1){dist[e.to]=dd+1;queue.push(e.to)}
 }
 return {schema:'OMEGA_R763_FULL_GRID_AUDIT_V1',nodes:N,modes:modes.size,classCounts:c,
  edges,changes,boundaryNodes,byAxis,components,largest,nearestStayMaximum:max,
  nearestStayHistogram:histogram,fullGraphVisited:ptr,
  proofScope:'ONE_STEP_SYMBOLIC_ADJACENCY_NOT_CALIBRATED_MOTION',
  physicalActionAuthority:false,canonicalMutation:false};
}
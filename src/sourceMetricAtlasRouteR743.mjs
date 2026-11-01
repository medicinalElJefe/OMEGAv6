// R743: exact A* route over R742's reversible 4-axis address graph, with
// edge weights computed from an existing R734 source-metric channel.
// This is an optimization of model-address traversal, not donor A* parity.
import {decodePiAddressR742,piAxisNeighborsR742} from './piAtlasTraversalR742.mjs';
export const METRIC_ATLAS_ROUTE_SCHEMA_R743='omega.r743.source-metric-route.v1';
export const METRIC_ATLAS_CHANNELS_R743=Object.freeze(['C','Phi','q','Lambda','scar','evidence','rsc','geometry','motion','symmetry','forecast','continuityGate','motionDrive','velocity','acceleration']);
const COUNT=20736;
function distance(a,b){
 const x=decodePiAddressR742(a),y=decodePiAddressR742(b);
 return x.reduce((n,v,i)=>{const d=Math.abs(v-y[i]);return n+Math.min(d,12-d)},0);
}
function heapPush(heap,item){
 heap.push(item);let i=heap.length-1;
 while(i>0){const p=(i-1)>>1;if(compare(heap[p],item)<=0)break;heap[i]=heap[p];i=p}
 heap[i]=item;
}
function compare(a,b){return a.f-b.f||a.g-b.g||a.address-b.address}
function heapPop(heap){
 const first=heap[0],last=heap.pop();if(heap.length){
  let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&compare(heap[c+1],heap[c])<0)c++;if(compare(last,heap[c])<=0)break;heap[i]=heap[c];i=c}
  heap[i]=last;
 }return first;
}
function validate(field,from,to,channel){
 decodePiAddressR742(from);decodePiAddressR742(to);
 if(!METRIC_ATLAS_CHANNELS_R743.includes(channel))throw Error('R743 unsupported source metric');
 if(!field||field.count!==COUNT)throw Error('R743 complete source field required');
 const values=field[channel];
 if(!(values instanceof Float32Array)||values.length!==COUNT)throw Error('R743 complete Float32 metric channel required');
 for(let i=0;i<COUNT;i++)if(!Number.isFinite(values[i]))throw Error('R743 nonfinite source metric at '+i);
 return values;
}
export function computeMetricAtlasRouteR743(field,from,to,channel='C'){
 const values=validate(field,from,to,channel),dist=new Float64Array(COUNT).fill(Infinity);
 const previous=new Int32Array(COUNT).fill(-1),axisOf=new Int8Array(COUNT),directionOf=new Int8Array(COUNT);
 const heap=[];dist[from]=0;heapPush(heap,{address:from,g:0,f:distance(from,to)});
 let expanded=0;
 while(heap.length){
  const {address,g}=heapPop(heap);
  if(g!==dist[address])continue;
  expanded++;
  if(address===to)break;
  const neighbors=piAxisNeighborsR742(address);
  for(let i=0;i<neighbors.length;i++){
   const next=neighbors[i],cost=1+Math.abs(values[address]-values[next]),candidate=g+cost;
   if(candidate>=dist[next])continue;
   dist[next]=candidate;previous[next]=address;axisOf[next]=i>>1;directionOf[next]=i%2===0?1:-1;
   heapPush(heap,{address:next,g:candidate,f:candidate+distance(next,to)});
  }
 }
 if(!Number.isFinite(dist[to]))throw Error('R743 route not found in complete toroidal graph');
 const addresses=[to],axisMoves=[];
 for(let current=to;current!==from;){
  const parent=previous[current];if(parent<0)throw Error('R743 broken predecessor chain');
  axisMoves.push({axis:axisOf[current],direction:directionOf[current]});
  addresses.push(parent);current=parent;
 }
 addresses.reverse();axisMoves.reverse();
 return {schema:METRIC_ATLAS_ROUTE_SCHEMA_R743,from,to,channel,addresses,axisMoves,
  steps:axisMoves.length,weightedCost:dist[to],axisLowerBound:distance(from,to),expanded,
  sourceBound:true,donorWeighted:false,physicalMeasurement:false,canonicalMutation:false,
  boundary:'Source-metric edge cost 1 + absolute channel difference; admissible axis-distance heuristic. Model-space only; no donor-weighted A* parity or physical travel.'};
}
export function verifyMetricAtlasRouteR743(raw,field){
 if(typeof raw!=='string'||raw.length>262144)throw Error('R743 route size refused');
 let candidate;try{candidate=JSON.parse(raw)}catch{throw Error('R743 invalid JSON')}
 if(!candidate||candidate.schema!==METRIC_ATLAS_ROUTE_SCHEMA_R743)throw Error('R743 route schema refused');
 const expected=computeMetricAtlasRouteR743(field,candidate.from,candidate.to,candidate.channel);
 if(JSON.stringify(candidate)!==JSON.stringify(expected))throw Error('R743 route differs from fresh source computation');
 return expected;
}

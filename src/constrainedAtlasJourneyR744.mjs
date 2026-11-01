// R744: source-metric A* journey with explicit intermediate addresses and excluded model cells.
// Reuses the R742 reversible graph and R743 edge semantics; not donor/physical routing.
import {decodePiAddressR742,piAxisNeighborsR742} from './piAtlasTraversalR742.mjs';
import {METRIC_ATLAS_CHANNELS_R743} from './sourceMetricAtlasRouteR743.mjs';
export const CONSTRAINED_ATLAS_JOURNEY_SCHEMA_R744='omega.r744.constrained-atlas-journey.v1';
const COUNT=20736;
function validAddress(value){
 decodePiAddressR742(value);
 return value;
}
function validList(values,max,label){
 if(!Array.isArray(values)||values.length>max)throw Error('R744 '+label+' limit refused');
 const seen=new Set();
 for(const value of values){
  validAddress(value);
  if(seen.has(value))throw Error('R744 duplicate '+label+' refused');
  seen.add(value);
 }
 return [...values];
}
function axisDistance(a,b){
 const x=decodePiAddressR742(a),y=decodePiAddressR742(b);
 return x.reduce((sum,v,i)=>{const d=Math.abs(v-y[i]);return sum+Math.min(d,12-d)},0);
}
function compare(a,b){return a.f-b.f||a.g-b.g||a.address-b.address}
function push(heap,item){
 heap.push(item);let i=heap.length-1;
 while(i>0){const p=(i-1)>>1;if(compare(heap[p],item)<=0)break;heap[i]=heap[p];i=p}
 heap[i]=item;
}
function pop(heap){
 const first=heap[0],last=heap.pop();
 if(heap.length){let i=0;
  while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&compare(heap[c+1],heap[c])<0)c++;if(compare(last,heap[c])<=0)break;heap[i]=heap[c];i=c}
  heap[i]=last;
 }
 return first;
}
function leg(values,from,to,excluded){
 const distance=new Float64Array(COUNT).fill(Infinity),parent=new Int32Array(COUNT).fill(-1);
 const heap=[];distance[from]=0;push(heap,{address:from,g:0,f:axisDistance(from,to)});
 let expanded=0;
 while(heap.length){
  const {address,g}=pop(heap);
  if(g!==distance[address])continue;
  expanded++;
  if(address===to)break;
  for(const next of piAxisNeighborsR742(address)){
   if(excluded.has(next))continue;
   const candidate=g+1+Math.abs(values[address]-values[next]);
   if(candidate>=distance[next])continue;
   distance[next]=candidate;parent[next]=address;
   push(heap,{address:next,g:candidate,f:candidate+axisDistance(next,to)});
  }
 }
 if(!Number.isFinite(distance[to]))throw Error('R744 no admissible route through requested constraints');
 const addresses=[to];
 for(let at=to;at!==from;){
  at=parent[at];
  if(at<0||addresses.length>COUNT)throw Error('R744 invalid predecessor chain');
  addresses.push(at);
 }
 addresses.reverse();
 return {from,to,addresses,steps:addresses.length-1,weightedCost:distance[to],
  axisLowerBound:axisDistance(from,to),expanded};
}
export function computeConstrainedAtlasJourneyR744(field,from,to,channel='C',waypoints=[],blocked=[]){
 validAddress(from);validAddress(to);
 const via=validList(waypoints,4,'waypoint'),excludedAddresses=validList(blocked,64,'blocked address').sort((a,b)=>a-b);
 if(!METRIC_ATLAS_CHANNELS_R743.includes(channel))throw Error('R744 unsupported metric');
 if(!field||field.count!==COUNT||!(field[channel] instanceof Float32Array)||field[channel].length!==COUNT)
  throw Error('R744 complete source metric required');
 const values=field[channel];
 for(let i=0;i<COUNT;i++)if(!Number.isFinite(values[i]))throw Error('R744 nonfinite source metric at '+i);
 const excluded=new Set(excludedAddresses),stops=[from,...via,to];
 for(const stop of stops)if(excluded.has(stop))throw Error('R744 endpoint or waypoint is blocked');
 const legs=[],addresses=[from];
 let weightedCost=0,expanded=0,axisLowerBound=0;
 for(let i=1;i<stops.length;i++){
  const segment=leg(values,stops[i-1],stops[i],excluded);
  legs.push(segment);
  addresses.push(...segment.addresses.slice(1));
  weightedCost+=segment.weightedCost;expanded+=segment.expanded;axisLowerBound+=segment.axisLowerBound;
 }
 return {schema:CONSTRAINED_ATLAS_JOURNEY_SCHEMA_R744,from,to,channel,waypoints:via,blocked:excludedAddresses,
  legs,addresses,steps:addresses.length-1,weightedCost,axisLowerBound,expanded,
  sourceBound:true,donorWeighted:false,physicalMeasurement:false,canonicalMutation:false,
  boundary:'Model-address route with user-declared exclusions and intermediate stops; R743 source-metric edge costs. No empirical obstacle, donor path or physical travel claim.'};
}
export function verifyConstrainedAtlasJourneyR744(raw,field){
 if(typeof raw!=='string'||raw.length>1048576)throw Error('R744 journey size refused');
 let candidate;
 try{candidate=JSON.parse(raw)}catch{throw Error('R744 invalid JSON')}
 if(!candidate||candidate.schema!==CONSTRAINED_ATLAS_JOURNEY_SCHEMA_R744)throw Error('R744 journey schema refused');
 const expected=computeConstrainedAtlasJourneyR744(field,candidate.from,candidate.to,candidate.channel,candidate.waypoints,candidate.blocked);
 if(JSON.stringify(candidate)!==JSON.stringify(expected))throw Error('R744 journey differs from fresh source computation');
 return expected;
}

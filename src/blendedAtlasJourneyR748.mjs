// R748: exact scalarized source-metric A* journey, constrained by R747's verified inputs.
// The scalar weight is a user-selected model objective, never an empirical physical metric.
import {decodePiAddressR742,piAxisNeighborsR742} from './piAtlasTraversalR742.mjs';
import {verifyAtlasTradeoffR747} from './atlasTradeoffR747.mjs';
export const BLENDED_ATLAS_SCHEMA_R748='omega.r748.blended-atlas-journey.v1';
const COUNT=20736;
function axisDistance(a,b){
 const x=decodePiAddressR742(a),y=decodePiAddressR742(b);
 return x.reduce((s,v,i)=>{const d=Math.abs(v-y[i]);return s+Math.min(d,12-d)},0);
}
function cmp(a,b){return a.f-b.f||a.g-b.g||a.address-b.address}
function push(h,v){h.push(v);let i=h.length-1;while(i){const p=(i-1)>>1;if(cmp(h[p],v)<=0)break;h[i]=h[p];i=p}h[i]=v}
function pop(h){const first=h[0],last=h.pop();if(h.length){let i=0;while(2*i+1<h.length){let j=2*i+1;if(j+1<h.length&&cmp(h[j+1],h[j])<0)j++;if(cmp(last,h[j])<=0)break;h[i]=h[j];i=j}h[i]=last}return first}
function costs(a,b,primary,secondary){return [1+Math.abs(primary[a]-primary[b]),1+Math.abs(secondary[a]-secondary[b])]}
function segment(from,to,blocked,primary,secondary,alpha){
 const dist=new Float64Array(COUNT).fill(Infinity),parents=new Int32Array(COUNT).fill(-1),heap=[];
 dist[from]=0;push(heap,{address:from,g:0,f:axisDistance(from,to)});
 let expanded=0;
 while(heap.length){
  const {address,g}=pop(heap);if(g!==dist[address])continue;
  expanded++;if(address===to)break;
  for(const next of piAxisNeighborsR742(address)){
   if(blocked.has(next))continue;
   const [p,s]=costs(address,next,primary,secondary);
   const candidate=g+alpha*p+(1-alpha)*s;
   if(candidate>=dist[next])continue;
   dist[next]=candidate;parents[next]=address;
   push(heap,{address:next,g:candidate,f:candidate+axisDistance(next,to)});
  }
 }
 if(!Number.isFinite(dist[to]))throw Error('R748 no admissible blended route');
 const addresses=[to];
 for(let at=to;at!==from;){
  at=parents[at];if(at<0||addresses.length>COUNT)throw Error('R748 broken predecessor chain');
  addresses.push(at);
 }
 addresses.reverse();
 return {from,to,addresses,steps:addresses.length-1,weightedCost:dist[to],expanded};
}
function evaluate(addresses,primary,secondary,alpha){
 let primaryCost=0,secondaryCost=0;
 for(let i=1;i<addresses.length;i++){
  const [p,s]=costs(addresses[i-1],addresses[i],primary,secondary);
  primaryCost+=p;secondaryCost+=s;
 }
 return {primaryCost,secondaryCost,blendedCost:alpha*primaryCost+(1-alpha)*secondaryCost};
}
export function computeBlendedAtlasJourneyR748(field,tradeoff,alpha=0.5){
 if(typeof alpha!=='number'||!Number.isFinite(alpha)||alpha<0||alpha>1)
  throw Error('R748 blend weight must be finite within 0..1');
 // Verify both endpoints, constraints, and source-channel identity by fresh R747 execution.
 const baseline=verifyAtlasTradeoffR747(JSON.stringify(tradeoff),field);
 const primary=field[baseline.primaryChannel],secondary=field[baseline.secondaryChannel];
 const stops=[baseline.primary.from,...baseline.primary.waypoints,baseline.primary.to];
 const blocked=new Set(baseline.primary.blocked),legs=[],addresses=[stops[0]];
 let expanded=0,weightedCost=0;
 for(let i=1;i<stops.length;i++){
  const leg=segment(stops[i-1],stops[i],blocked,primary,secondary,alpha);
  legs.push(leg);addresses.push(...leg.addresses.slice(1));
  weightedCost+=leg.weightedCost;expanded+=leg.expanded;
 }
 const measured=evaluate(addresses,primary,secondary,alpha);
 if(Math.abs(weightedCost-measured.blendedCost)>1e-7)throw Error('R748 path cost inconsistent');
 const endpointPrimary=evaluate(baseline.primary.addresses,primary,secondary,alpha);
 const endpointSecondary=evaluate(baseline.secondary.addresses,primary,secondary,alpha);
 const bestEndpointBlendCost=Math.min(endpointPrimary.blendedCost,endpointSecondary.blendedCost);
 if(measured.blendedCost>bestEndpointBlendCost+1e-7)throw Error('R748 blended optimum violated');
 return {schema:BLENDED_ATLAS_SCHEMA_R748,tradeoff:baseline,alpha,
  from:stops[0],to:stops.at(-1),waypoints:[...baseline.primary.waypoints],blocked:[...baseline.primary.blocked],
  addresses,legs,steps:addresses.length-1,expanded,
  ...measured,bestEndpointBlendCost,improvement:Math.max(0,bestEndpointBlendCost-measured.blendedCost),
  sourceBound:true,donorParity:false,physicalMeasurement:false,canonicalMutation:false,
  boundary:'A* minimizes a convex sum of two actual source-field edge costs over the R742 graph and R744 constraints. Not a full Pareto frontier, physical route, empirical metric or historical donor parity.'};
}
export function verifyBlendedAtlasJourneyR748(raw,field){
 if(typeof raw!=='string'||raw.length>4194304)throw Error('R748 export size refused');
 let value;try{value=JSON.parse(raw)}catch{throw Error('R748 invalid JSON')}
 if(!value||value.schema!==BLENDED_ATLAS_SCHEMA_R748)throw Error('R748 schema refused');
 const expected=computeBlendedAtlasJourneyR748(field,value.tradeoff,value.alpha);
 if(JSON.stringify(value)!==JSON.stringify(expected))throw Error('R748 journey differs from fresh source computation');
 return expected;
}

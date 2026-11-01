// R749: bounded supported-Pareto candidate sweep over real R748 constrained A* routes.
// Finite scalarization samples are not an exhaustive multiobjective Pareto frontier.
import {computeBlendedAtlasJourneyR748} from './blendedAtlasJourneyR748.mjs';
import {verifyAtlasTradeoffR747} from './atlasTradeoffR747.mjs';
export const SOURCE_FRONTIER_SCHEMA_R749='omega.r749.source-frontier-sweep.v1';
export const SOURCE_FRONTIER_WEIGHTS_R749=Object.freeze([0,0.25,0.5,0.75,1]);
const EPS=1e-8;
function dominates(a,b){
 return a.primaryCost<=b.primaryCost+EPS&&a.secondaryCost<=b.secondaryCost+EPS
  &&(a.primaryCost<b.primaryCost-EPS||a.secondaryCost<b.secondaryCost-EPS);
}
export function computeSourceFrontierSweepR749(field,tradeoff){
 const baseline=verifyAtlasTradeoffR747(JSON.stringify(tradeoff),field);
 const samples=SOURCE_FRONTIER_WEIGHTS_R749.map(alpha=>{
  const result=computeBlendedAtlasJourneyR748(field,baseline,alpha);
  return {alpha,primaryCost:result.primaryCost,secondaryCost:result.secondaryCost,
   blendedCost:result.blendedCost,steps:result.steps,addresses:result.addresses,
   expanded:result.expanded};
 });
 const unique=[];
 for(const sample of samples){
  const match=unique.find(entry=>entry.addresses.length===sample.addresses.length
   &&entry.addresses.every((address,i)=>address===sample.addresses[i]));
  if(match){match.weights.push(sample.alpha)}
  else unique.push({...sample,weights:[sample.alpha]});
 }
 const candidates=unique.map((sample,index)=>({...sample,index,
  dominated:unique.some(other=>other!==sample&&dominates(other,sample))}));
 const supported=candidates.filter(candidate=>!candidate.dominated);
 const primaryMin=Math.min(...samples.map(s=>s.primaryCost));
 const secondaryMin=Math.min(...samples.map(s=>s.secondaryCost));
 return {schema:SOURCE_FRONTIER_SCHEMA_R749,tradeoff:baseline,
  weights:[...SOURCE_FRONTIER_WEIGHTS_R749],samples,candidates,
  supportedIndices:supported.map(x=>x.index),uniqueRoutes:unique.length,
  supportedCount:supported.length,primaryMin,secondaryMin,
  sourceBound:true,donorParity:false,physicalMeasurement:false,canonicalMutation:false,
  exhaustivePareto:false,
  boundary:'Five exact constrained scalarized A* optima from the current two source channels. Non-dominated among sampled paths only; unsupported Pareto routes and historical donor parity are not established.'};
}
export function verifySourceFrontierSweepR749(raw,field){
 if(typeof raw!=='string'||raw.length>4194304)throw Error('R749 sweep export size refused');
 let value;try{value=JSON.parse(raw)}catch{throw Error('R749 invalid JSON')}
 if(!value||value.schema!==SOURCE_FRONTIER_SCHEMA_R749)throw Error('R749 schema refused');
 const expected=computeSourceFrontierSweepR749(field,value.tradeoff);
 if(JSON.stringify(value)!==JSON.stringify(expected))throw Error('R749 sweep differs from fresh source computation');
 return expected;
}

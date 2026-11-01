// R747: compare independently optimized R744 journeys under two actual source channels.
// This is a model-space tradeoff, not a physical Pareto frontier or donor parity.
import {computeConstrainedAtlasJourneyR744,verifyConstrainedAtlasJourneyR744} from './constrainedAtlasJourneyR744.mjs';
import {METRIC_ATLAS_CHANNELS_R743} from './sourceMetricAtlasRouteR743.mjs';
export const ATLAS_TRADEOFF_SCHEMA_R747='omega.r747.atlas-two-metric-tradeoff.v1';
const COUNT=20736;
function evaluate(field,addresses,channel){
 const values=field?.[channel];
 if(field?.count!==COUNT||!(values instanceof Float32Array)||values.length!==COUNT)throw Error('R747 complete source channel required');
 for(let i=0;i<COUNT;i++)if(!Number.isFinite(values[i]))throw Error('R747 nonfinite source metric at '+i);
 let cost=0;
 for(let i=1;i<addresses.length;i++)cost+=1+Math.abs(values[addresses[i-1]]-values[addresses[i]]);
 return cost;
}
export function computeAtlasTradeoffR747(field,rawPrimary,secondaryChannel){
 const primary=verifyConstrainedAtlasJourneyR744(JSON.stringify(rawPrimary),field);
 if(!METRIC_ATLAS_CHANNELS_R743.includes(secondaryChannel)||secondaryChannel===primary.channel)
  throw Error('R747 choose a distinct supported secondary channel');
 const secondary=computeConstrainedAtlasJourneyR744(field,primary.from,primary.to,secondaryChannel,primary.waypoints,primary.blocked);
 const primaryOnPrimary=evaluate(field,primary.addresses,primary.channel);
 const secondaryOnPrimary=evaluate(field,secondary.addresses,primary.channel);
 const primaryOnSecondary=evaluate(field,primary.addresses,secondaryChannel);
 const secondaryOnSecondary=evaluate(field,secondary.addresses,secondaryChannel);
 const alternativeRegret=secondaryOnPrimary-primaryOnPrimary;
 const baselineRegret=primaryOnSecondary-secondaryOnSecondary;
 if(alternativeRegret < -1e-8||baselineRegret < -1e-8)throw Error('R747 independent optimization bound violated');
 if(Math.abs(primaryOnPrimary-primary.weightedCost)>1e-8||Math.abs(secondaryOnSecondary-secondary.weightedCost)>1e-8)
  throw Error('R747 recomputed segment cost mismatch');
 const shared=new Set(primary.addresses);
 return {schema:ATLAS_TRADEOFF_SCHEMA_R747,primary,secondary,primaryChannel:primary.channel,secondaryChannel,
  costs:{primaryOnPrimary,secondaryOnPrimary,primaryOnSecondary,secondaryOnSecondary},
  regrets:{secondaryOnPrimary:Math.max(0,alternativeRegret),primaryOnSecondary:Math.max(0,baselineRegret)},
  pathChanged:JSON.stringify(primary.addresses)!==JSON.stringify(secondary.addresses),
  sharedAddressCount:new Set(secondary.addresses.filter(a=>shared.has(a))).size,
  sourceBound:true,physicalMeasurement:false,donorParity:false,canonicalMutation:false,
  boundary:'Two independently optimal source-metric R744 journeys over identical model addresses and constraints. Cross-channel costs are evaluated on actual computed source fields; no empirical motion, donor parity or physical Pareto frontier.'};
}
export function verifyAtlasTradeoffR747(raw,field){
 if(typeof raw!=='string'||raw.length>2097152)throw Error('R747 tradeoff size refused');
 let value;try{value=JSON.parse(raw)}catch{throw Error('R747 invalid JSON')}
 if(!value||value.schema!==ATLAS_TRADEOFF_SCHEMA_R747)throw Error('R747 schema refused');
 const expected=computeAtlasTradeoffR747(field,value.primary,value.secondaryChannel);
 if(JSON.stringify(value)!==JSON.stringify(expected))throw Error('R747 tradeoff differs from fresh source computation');
 return expected;
}

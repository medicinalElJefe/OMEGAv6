// R746: source-metric route sensitivity to one additional excluded model cell.
// Recomputes R744; not empirical obstruction, physical travel or historical donor parity.
import {decodePiAddressR742} from './piAtlasTraversalR742.mjs';
import {computeConstrainedAtlasJourneyR744,verifyConstrainedAtlasJourneyR744} from './constrainedAtlasJourneyR744.mjs';
export const ATLAS_DETOUR_SCHEMA_R746='omega.r746.atlas-detour.v1';
export function computeAtlasDetourR746(field,rawBaseline,avoid){
 const baseline=verifyConstrainedAtlasJourneyR744(JSON.stringify(rawBaseline),field);
 decodePiAddressR742(avoid);
 if(avoid===baseline.from||avoid===baseline.to||baseline.waypoints.includes(avoid))throw Error('R746 endpoint or ordered stop cannot be excluded');
 if(baseline.blocked.includes(avoid))throw Error('R746 address already excluded');
 if(!baseline.addresses.includes(avoid))throw Error('R746 exclusion must affect the current route');
 if(baseline.blocked.length>=64)throw Error('R746 exclusion capacity exhausted');
 const detour=computeConstrainedAtlasJourneyR744(field,baseline.from,baseline.to,baseline.channel,baseline.waypoints,[...baseline.blocked,avoid]);
 if(detour.addresses.includes(avoid))throw Error('R746 detour still contains excluded address');
 const costDelta=detour.weightedCost-baseline.weightedCost;
 if(costDelta < -1e-8)throw Error('R746 constrained optimization violates monotonicity');
 const baselineSet=new Set(baseline.addresses);
 const sharedAddressCount=new Set(detour.addresses.filter(a=>baselineSet.has(a))).size;
 return {schema:ATLAS_DETOUR_SCHEMA_R746,avoid,baseline,detour,costDelta,stepDelta:detour.steps-baseline.steps,sharedAddressCount,sourceBound:true,physicalMeasurement:false,donorParity:false,canonicalMutation:false,boundary:'Counterfactual single-cell exclusion in the R744 model-address graph. Costs use the existing source field, not empirical obstructions, physical motion or historical donor weights.'};
}
export function verifyAtlasDetourR746(raw,field){
 if(typeof raw!=='string'||raw.length>2097152)throw Error('R746 detour size refused');
 let value;try{value=JSON.parse(raw)}catch{throw Error('R746 invalid JSON')}
 if(!value||value.schema!==ATLAS_DETOUR_SCHEMA_R746)throw Error('R746 schema refused');
 const expected=computeAtlasDetourR746(field,value.baseline,value.avoid);
 if(JSON.stringify(value)!==JSON.stringify(expected))throw Error('R746 detour differs from fresh source computation');
 return expected;
}

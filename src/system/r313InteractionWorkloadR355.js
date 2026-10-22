export const R313_WORKLOAD_CENSUS_SCHEMA_R355='OMEGA_R313_INTERACTION_WORKLOAD_CENSUS_R355';
export const R313_WORKLOAD_CENSUS_SOURCE_R355='R286 exact-head browser census from R355 repair run 35939407842';
export const R313_R286_OBSERVED_ELAPSED_MS_R355=Object.freeze({
 "desktop:Archive Census":10632,
 "desktop:Archive Operators":14240,
 "desktop:Assets":3382,
 "desktop:Atlas":28794,
 "desktop:Atlas Calculator":5309,
 "desktop:Build Out":4719,
 "desktop:Canon Evolution":3420,
 "desktop:Cockpit":14997,
 "desktop:Command Center":7588,
 "desktop:Consolidation":17139,
 "desktop:Control Matrix":56344,
 "desktop:Convergence":18494,
 "desktop:Create":3768,
 "desktop:Data Motion":18386,
 "desktop:Development":7142,
 "desktop:Earth Now":6263,
 "desktop:Evidence & Proof":3687,
 "desktop:Extreme Traversal":57928,
 "desktop:Field":16666,
 "desktop:Forecast":4226,
 "desktop:Governance":3748,
 "desktop:Hybrid Link":11050,
 "desktop:Immersive Traversal":48385,
 "desktop:Infinity":5084,
 "desktop:Instructions":7090,
 "desktop:Kernel Intelligence":2462,
 "desktop:Matter Traversal":8230,
 "desktop:Memory":3078,
 "desktop:Modes":9775,
 "desktop:Plugins":2225,
 "desktop:Projects":4050,
 "desktop:Quality Compiler":2457,
 "desktop:Reality Lab":3504,
 "desktop:Relativity":108864,
 "desktop:Render Queue":4495,
 "desktop:SAI Lab":4528,
 "desktop:Scale Compiler":3035,
 "desktop:Settings":3643,
 "desktop:System":4304,
 "desktop:System Atlas":61322,
 "desktop:Traversal":30267,
 "desktop:Validation":1481,
 "desktop:Visual Instrument":11438,
 "desktop:Workspace":9824,
 "mobile:Archive Census":8621,
 "mobile:Archive Operators":13384,
 "mobile:Assets":2384,
 "mobile:Atlas":15347,
 "mobile:Atlas Calculator":5435,
 "mobile:Build Out":3586,
 "mobile:Canon Evolution":2352,
 "mobile:Cockpit":10220,
 "mobile:Command Center":3507,
 "mobile:Consolidation":13791,
 "mobile:Control Matrix":89628,
 "mobile:Convergence":19371,
 "mobile:Create":2473,
 "mobile:Data Motion":3227,
 "mobile:Development":4328,
 "mobile:Earth Now":4962,
 "mobile:Evidence & Proof":2917,
 "mobile:Extreme Traversal":44459,
 "mobile:Field":20142,
 "mobile:Forecast":3466,
 "mobile:Governance":3024,
 "mobile:Hybrid Link":9253,
 "mobile:Immersive Traversal":15043,
 "mobile:Infinity":1614,
 "mobile:Instructions":4950,
 "mobile:Kernel Intelligence":2167,
 "mobile:Matter Traversal":4191,
 "mobile:Memory":2317,
 "mobile:Modes":9334,
 "mobile:Plugins":1542,
 "mobile:Projects":3598,
 "mobile:Quality Compiler":1628,
 "mobile:Reality Lab":2154,
 "mobile:Relativity":26512,
 "mobile:Render Queue":2155,
 "mobile:SAI Lab":3881,
 "mobile:Scale Compiler":3841,
 "mobile:Settings":3168,
 "mobile:System":1938,
 "mobile:System Atlas":88881,
 "mobile:Traversal":11581,
 "mobile:Validation":1329,
 "mobile:Visual Instrument":3580,
 "mobile:Workspace":3918
});

export function partitionInteractionCasesR355({surfaces,shardCount}){
 const count=Math.floor(Number(shardCount));
 if(!Number.isInteger(count)||count<1||count>16)throw new Error('R355 interaction partition requires shardCount 1..16');
 const cases=[];
 for(let profileIndex=0;profileIndex<2;profileIndex++){
  const profile=profileIndex===0?'desktop':'mobile';
  for(let surfaceIndex=0;surfaceIndex<surfaces.length;surfaceIndex++){
   const surface=surfaces[surfaceIndex],key=profile+':'+surface;
   const weight=Number(R313_R286_OBSERVED_ELAPSED_MS_R355[key]||1000);
   cases.push({profileIndex,profile,surfaceIndex,surface,key,weight});
  }
 }
 cases.sort((a,b)=>b.weight-a.weight||a.profileIndex-b.profileIndex||a.surfaceIndex-b.surfaceIndex||a.surface.localeCompare(b.surface));
 const bins=Array.from({length:count},(_,index)=>({index,weight:0,cases:[]}));
 for(const item of cases){
  bins.sort((a,b)=>a.weight-b.weight||a.cases.length-b.cases.length||a.index-b.index);
  const bin=bins[0];bin.cases.push(item);bin.weight+=item.weight;
 }
 bins.sort((a,b)=>a.index-b.index);
 return Object.freeze(bins.map(bin=>Object.freeze({index:bin.index,weight:bin.weight,cases:Object.freeze(bin.cases.slice().sort((a,b)=>a.profileIndex-b.profileIndex||a.surfaceIndex-b.surfaceIndex))})));
}

export function auditInteractionPartitionR355({surfaces,shardCount}){
 const bins=partitionInteractionCasesR355({surfaces,shardCount}),all=bins.flatMap(x=>x.cases);
 const keys=all.map(x=>x.key),unique=new Set(keys),expected=surfaces.length*2;
 const weights=bins.map(x=>x.weight),max=Math.max(...weights),min=Math.min(...weights);
 return{schema:'OMEGA_R313_INTERACTION_PARTITION_AUDIT_R355',expected,assigned:all.length,unique:unique.size,complete:all.length===expected&&unique.size===expected,weights,max,min,spread:max-min,ratio:min>0?max/min:Infinity,bins};
}

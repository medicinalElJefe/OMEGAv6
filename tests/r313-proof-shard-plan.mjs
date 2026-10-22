export const R313_PROOF_SHARD_PLAN_REVISION='R355-R286-EVIDENCE-20260924';
export const R313_PROOF_PARTITION_OPERATOR='CASE SET → EVIDENCE COST → LPT MIN-BURDEN PARTITION → IDENTITY CARRY → COMPLETE RECOMBINATION';

// These hints are scheduling evidence from the exact passing R286 browser sweep on the
// repaired R355 candidate. They influence partition placement only. The R313 child proof
// still inventories and actuates the live DOM and retains every original assertion.
export const R313_EVIDENCE_COST_HINTS=Object.freeze({
 'Relativity':{maxControls:52,maxElapsedMs:108864},
 'Control Matrix':{maxControls:551,maxElapsedMs:89628},
 'System Atlas':{maxControls:551,maxElapsedMs:88881},
 'Extreme Traversal':{maxControls:65,maxElapsedMs:57928},
 'Immersive Traversal':{maxControls:51,maxElapsedMs:48385},
 'Traversal':{maxControls:38,maxElapsedMs:30267},
 'Atlas':{maxControls:18,maxElapsedMs:28794},
 'Field':{maxControls:31,maxElapsedMs:20142},
 'Convergence':{maxControls:73,maxElapsedMs:19371},
 'Data Motion':{maxControls:16,maxElapsedMs:18386},
 'Consolidation':{maxControls:18,maxElapsedMs:17139},
 'Cockpit':{maxControls:24,maxElapsedMs:14997},
 'Archive Operators':{maxControls:164,maxElapsedMs:14240},
 'Visual Instrument':{maxControls:26,maxElapsedMs:11438},
 'Hybrid Link':{maxControls:30,maxElapsedMs:11050},
 'Archive Census':{maxControls:103,maxElapsedMs:10632},
 'Workspace':{maxControls:8,maxElapsedMs:9824},
 'Modes':{maxControls:104,maxElapsedMs:9775},
 'Matter Traversal':{maxControls:19,maxElapsedMs:8230},
 'Command Center':{maxControls:12,maxElapsedMs:7588},
 'Development':{maxControls:43,maxElapsedMs:7142},
 'Instructions':{maxControls:60,maxElapsedMs:7090},
 'Earth Now':{maxControls:36,maxElapsedMs:6263},
 'Atlas Calculator':{maxControls:3,maxElapsedMs:5435},
 'Infinity':{maxControls:0,maxElapsedMs:5084},
 'Build Out':{maxControls:31,maxElapsedMs:4719},
 'SAI Lab':{maxControls:37,maxElapsedMs:4528},
 'Render Queue':{maxControls:19,maxElapsedMs:4495},
 'System':{maxControls:17,maxElapsedMs:4304},
 'Forecast':{maxControls:8,maxElapsedMs:4226},
 'Projects':{maxControls:17,maxElapsedMs:4050},
 'Scale Compiler':{maxControls:0,maxElapsedMs:3841},
 'Create':{maxControls:18,maxElapsedMs:3768},
 'Governance':{maxControls:22,maxElapsedMs:3748},
 'Evidence & Proof':{maxControls:22,maxElapsedMs:3687},
 'Settings':{maxControls:26,maxElapsedMs:3643},
 'Reality Lab':{maxControls:1,maxElapsedMs:3504},
 'Canon Evolution':{maxControls:21,maxElapsedMs:3420},
 'Assets':{maxControls:17,maxElapsedMs:3382},
 'Memory':{maxControls:18,maxElapsedMs:3078},
 'Kernel Intelligence':{maxControls:12,maxElapsedMs:2462},
 'Quality Compiler':{maxControls:6,maxElapsedMs:2457},
 'Plugins':{maxControls:7,maxElapsedMs:2225},
 'Validation':{maxControls:6,maxElapsedMs:1481}
});

export function r313EstimatedInteractionCost(route){
 const hint=R313_EVIDENCE_COST_HINTS[route];
 if(!hint)throw new Error(`R313 proof scheduler missing evidence cost hint for canonical route: ${route}`);
 // Approximate both route/materialization burden and per-control interaction burden.
 // This is a scheduler weight only; it cannot suppress, skip, weaken or pass a proof case.
 return 20+Math.ceil(hint.maxElapsedMs/250)+(hint.maxControls*3);
}

export function compileR313BalancedShardPlan({surfaces,profileCount=2,shardCount=8}={}){
 if(!Array.isArray(surfaces)||!surfaces.length)throw new Error('R313 shard plan requires canonical surfaces');
 if(new Set(surfaces).size!==surfaces.length)throw new Error('R313 shard plan refuses duplicate surface identity');
 if(!Number.isInteger(profileCount)||profileCount<1)throw new Error('R313 shard plan requires positive profileCount');
 if(!Number.isInteger(shardCount)||shardCount<1||shardCount>16)throw new Error('R313 shard plan requires shardCount 1..16');
 for(const route of surfaces)r313EstimatedInteractionCost(route);

 const cases=[];
 for(let profileIndex=0;profileIndex<profileCount;profileIndex++){
  for(let surfaceIndex=0;surfaceIndex<surfaces.length;surfaceIndex++){
   const surface=surfaces[surfaceIndex];
   cases.push(Object.freeze({
    id:`${profileIndex}:${surfaceIndex}:${surface}`,
    profileIndex,surfaceIndex,surface,
    weight:r313EstimatedInteractionCost(surface)
   }));
  }
 }
 const bins=Array.from({length:shardCount},(_,index)=>({index,load:0,cases:[]}));
 const ordered=[...cases].sort((a,b)=>b.weight-a.weight||a.profileIndex-b.profileIndex||a.surfaceIndex-b.surfaceIndex);
 for(const proofCase of ordered){
  const target=bins.reduce((best,bin)=>bin.load<best.load||(bin.load===best.load&&bin.index<best.index)?bin:best,bins[0]);
  target.cases.push(proofCase);target.load+=proofCase.weight;
 }
 const ids=bins.flatMap(bin=>bin.cases.map(x=>x.id));
 const loads=bins.map(x=>x.load),minLoad=Math.min(...loads),maxLoad=Math.max(...loads);
 return Object.freeze({
  revision:R313_PROOF_SHARD_PLAN_REVISION,
  operator:R313_PROOF_PARTITION_OPERATOR,
  caseCount:cases.length,
  expectedCaseCount:surfaces.length*profileCount,
  uniqueCaseCount:new Set(ids).size,
  complete:ids.length===cases.length&&new Set(ids).size===cases.length,
  bins:Object.freeze(bins.map(bin=>Object.freeze({index:bin.index,load:bin.load,cases:Object.freeze([...bin.cases])}))),
  loads:Object.freeze(loads),
  minLoad,maxLoad,
  loadRatio:minLoad>0?maxLoad/minLoad:1,
  boundary:'R313 evidence-cost partitioning changes only which child process proves each canonical route/viewport case. Complete case conservation, live DOM interaction assertions, fail-closed semantics and recombination remain unchanged.'
 });
}

import type {CompiledSystemPlan} from './systemFoundryR268';

export type FoundryEvidenceGapR275={
 blocker:string;
 directBlocked:string[];
 structuralReach:string[];
 activeReach:string[];
 blockedReach:string[];
 affectedCount:number;
};

export type FoundryEvidenceAnalysisR275={
 selectedId:string;
 selectedDeclaredEvidence:string[];
 selectedCurrentBlockers:string[];
 gapCount:number;
 blockedCapabilityCount:number;
 reviewOrder:FoundryEvidenceGapR275[];
};

export function analyzeFoundryEvidenceR275(plan:CompiledSystemPlan,selectedId:string):FoundryEvidenceAnalysisR275{
 const byId=new Map(plan.activeFrontier.map(capability=>[capability.id,capability]));
 const selected=byId.get(selectedId)||plan.activeFrontier[0];
 const reverse=new Map<string,string[]>();
 for(const capability of plan.activeFrontier){
  for(const dependency of capability.dependsOn||[]){
   if(!byId.has(dependency))continue;
   const rows=reverse.get(dependency)||[];rows.push(capability.id);reverse.set(dependency,rows);
  }
 }
 for(const [id,rows] of reverse)reverse.set(id,[...new Set(rows)].sort());
 const downstreamFrom=(startId:string)=>{
  const seen=new Set<string>(),queue=[...(reverse.get(startId)||[])];
  while(queue.length){
   const id=queue.shift()!;if(seen.has(id))continue;seen.add(id);
   for(const child of reverse.get(id)||[])if(!seen.has(child))queue.push(child);
  }
  return [...seen].sort();
 };
 const blockers=[...new Set(plan.activeFrontier.flatMap(capability=>capability.blockers))].sort();
 const reviewOrder=blockers.map(blocker=>{
  const directBlocked=plan.activeFrontier.filter(capability=>capability.status==='BLOCKED'&&capability.blockers.includes(blocker)).map(capability=>capability.id).sort();
  const reach=new Set<string>();
  for(const id of directBlocked){reach.add(id);for(const child of downstreamFrom(id))reach.add(child)}
  const structuralReach=[...reach].sort();
  const activeReach=structuralReach.filter(id=>byId.get(id)?.status==='ACTIVE');
  const blockedReach=structuralReach.filter(id=>byId.get(id)?.status==='BLOCKED');
  return{blocker,directBlocked,structuralReach,activeReach,blockedReach,affectedCount:structuralReach.length};
 }).sort((a,b)=>b.affectedCount-a.affectedCount||b.directBlocked.length-a.directBlocked.length||a.blocker.localeCompare(b.blocker));
 return{
  selectedId:selected?.id||'',
  selectedDeclaredEvidence:selected?[...selected.evidence]:[],
  selectedCurrentBlockers:selected?[...selected.blockers]:[],
  gapCount:reviewOrder.length,
  blockedCapabilityCount:plan.activeFrontier.filter(capability=>capability.status==='BLOCKED').length,
  reviewOrder
 };
}

export const FOUNDRY_EVIDENCE_BOUNDARY_R275={
 revision:'R275',
 readOnly:true,
 source:'current compiled blockers, declared evidence gates, and declared dependency edges only',
 gapTruth:'a blocker class is an observed compiled gate, not proof of why external evidence is absent',
 reachTruth:'structural reach is diagnostic topology, not a claim that clearing one blocker will activate downstream capabilities',
 recompileTruth:'any changed evidence or runtime condition must be recompiled and re-proven before status changes are accepted',
 authority:'no evidence acquisition, polling, dispatch, execution, remediation, source mutation, CanonState admission or deployment authority'
} as const;

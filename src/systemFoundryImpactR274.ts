import type {CompiledCapability,CompiledSystemPlan} from './systemFoundryR268';

export type FoundryImpactNodeR274={id:string;status:CompiledCapability['status'];blockers:string[];directDependents:string[];downstreamCount:number};
export type FoundryImpactAnalysisR274={
 selectedId:string;
 directDependents:string[];
 downstreamImpact:string[];
 activeDownstream:string[];
 blockedDownstream:string[];
 blockedReviewOrder:FoundryImpactNodeR274[];
};

export function analyzeFoundryImpactR274(plan:CompiledSystemPlan,selectedId:string):FoundryImpactAnalysisR274{
 const byId=new Map(plan.activeFrontier.map(capability=>[capability.id,capability]));
 const selected=byId.get(selectedId)||plan.activeFrontier[0];
 if(!selected)return{selectedId:'',directDependents:[],downstreamImpact:[],activeDownstream:[],blockedDownstream:[],blockedReviewOrder:[]};
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
 const downstreamImpact=downstreamFrom(selected.id);
 const activeDownstream=downstreamImpact.filter(id=>byId.get(id)?.status==='ACTIVE');
 const blockedDownstream=downstreamImpact.filter(id=>byId.get(id)?.status==='BLOCKED');
 const blockedReviewOrder=plan.activeFrontier.filter(capability=>capability.status==='BLOCKED').map(capability=>({
  id:capability.id,
  status:capability.status,
  blockers:[...capability.blockers],
  directDependents:[...(reverse.get(capability.id)||[])],
  downstreamCount:downstreamFrom(capability.id).length
 })).sort((a,b)=>b.downstreamCount-a.downstreamCount||b.directDependents.length-a.directDependents.length||a.id.localeCompare(b.id));
 return{selectedId:selected.id,directDependents:[...(reverse.get(selected.id)||[])],downstreamImpact,activeDownstream,blockedDownstream,blockedReviewOrder};
}

export const FOUNDRY_IMPACT_BOUNDARY_R274={
 revision:'R274',
 readOnly:true,
 source:'already-compiled capability frontier and declared dependsOn edges only',
 impactTruth:'downstream impact is structural reachability, not proof that a downstream capability would fail or recover',
 reviewTruth:'blocked review order is deterministic diagnostic priority by structural reach, not mutation authorization',
 authority:'no polling, dispatch, execution, source mutation, CanonState admission or deployment authority'
} as const;

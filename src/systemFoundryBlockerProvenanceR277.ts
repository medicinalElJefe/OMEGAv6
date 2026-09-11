import type {CompiledCapability,CompiledSystemPlan} from './systemFoundryR268';

export type BlockerProvenanceR277='DEPENDENCY_DERIVED'|'RESOURCE_RUNTIME'|'DECLARED_EVIDENCE'|'EXECUTOR_AVAILABILITY'|'OTHER_DIRECT';
export type BlockerProvenanceRowR277={
 blocker:string;
 provenance:BlockerProvenanceR277;
 capabilities:string[];
 structuralReach:string[];
 affectedCount:number;
};
export type FoundryBlockerProvenanceAnalysisR277={
 selectedId:string;
 selectedRows:{blocker:string;provenance:BlockerProvenanceR277}[];
 primaryRows:BlockerProvenanceRowR277[];
 derivedRows:BlockerProvenanceRowR277[];
 primaryBlockerCount:number;
 derivedBlockerCount:number;
};

const provenanceOf=(capability:CompiledCapability,blocker:string):BlockerProvenanceR277=>{
 if(blocker.startsWith('DEPENDENCY_BLOCKED:'))return 'DEPENDENCY_DERIVED';
 if(blocker==='R239_RESOURCE_PROOF_REQUIRED'||blocker.startsWith('R239_'))return 'RESOURCE_RUNTIME';
 if(capability.evidence.includes(blocker as never))return 'DECLARED_EVIDENCE';
 if(blocker==='NO_EXECUTOR')return 'EXECUTOR_AVAILABILITY';
 return 'OTHER_DIRECT';
};

export function analyzeFoundryBlockerProvenanceR277(plan:CompiledSystemPlan,selectedId:string):FoundryBlockerProvenanceAnalysisR277{
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
  while(queue.length){const id=queue.shift()!;if(seen.has(id))continue;seen.add(id);for(const child of reverse.get(id)||[])if(!seen.has(child))queue.push(child)}
  return [...seen].sort();
 };
 const keyed=new Map<string,{blocker:string;provenance:BlockerProvenanceR277;capabilities:Set<string>;reach:Set<string>}>();
 for(const capability of plan.activeFrontier){
  for(const blocker of capability.blockers){
   const provenance=provenanceOf(capability,blocker),key=`${provenance}:${blocker}`;
   const row=keyed.get(key)||{blocker,provenance,capabilities:new Set<string>(),reach:new Set<string>()};
   row.capabilities.add(capability.id);row.reach.add(capability.id);for(const child of downstreamFrom(capability.id))row.reach.add(child);keyed.set(key,row);
  }
 }
 const rows=[...keyed.values()].map(row=>({blocker:row.blocker,provenance:row.provenance,capabilities:[...row.capabilities].sort(),structuralReach:[...row.reach].sort(),affectedCount:row.reach.size}));
 const sortRows=(a:BlockerProvenanceRowR277,b:BlockerProvenanceRowR277)=>b.affectedCount-a.affectedCount||b.capabilities.length-a.capabilities.length||a.blocker.localeCompare(b.blocker);
 const primaryRows=rows.filter(row=>row.provenance!=='DEPENDENCY_DERIVED').sort(sortRows);
 const derivedRows=rows.filter(row=>row.provenance==='DEPENDENCY_DERIVED').sort(sortRows);
 return{
  selectedId:selected?.id||'',
  selectedRows:selected?selected.blockers.map(blocker=>({blocker,provenance:provenanceOf(selected,blocker)})):[],
  primaryRows,derivedRows,primaryBlockerCount:primaryRows.length,derivedBlockerCount:derivedRows.length
 };
}

export const FOUNDRY_BLOCKER_PROVENANCE_BOUNDARY_R277={
 revision:'R277',
 readOnly:true,
 source:'current compiled blocker tokens + capability declared evidence + dependency graph only',
 primaryTruth:'primary means not dependency-derived; it does not prove external root cause or remediation sufficiency',
 dependencyTruth:'DEPENDENCY_BLOCKED tokens are derived structural propagation from R276, never re-labeled as missing external evidence',
 reachTruth:'affectedCount is declared graph reachability, not observed failure impact',
 authority:'classification only; no evidence acquisition, polling, dispatch, execution, remediation, source mutation, CanonState admission or deployment authority'
} as const;

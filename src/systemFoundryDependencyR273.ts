import type {CompiledCapability,CompiledSystemPlan} from './systemFoundryR268';

export type FoundryDependencyAnalysisR273={
 selectedId:string;
 dependencyOrder:string[];
 rootBlockers:{id:string;blockers:string[]}[];
 criticalPath:string[];
 abstractLatency:number;
 abstractCost:number;
};

export function analyzeFoundryDependenciesR273(plan:CompiledSystemPlan,selectedId:string):FoundryDependencyAnalysisR273{
 const byId=new Map(plan.activeFrontier.map(capability=>[capability.id,capability]));
 const selected=byId.get(selectedId)||plan.activeFrontier[0];
 if(!selected)return{selectedId:'',dependencyOrder:[],rootBlockers:[],criticalPath:[],abstractLatency:0,abstractCost:0};
 const visited=new Set<string>(),visiting=new Set<string>(),dependencyOrder:string[]=[];
 const visit=(id:string)=>{
  if(visited.has(id)||visiting.has(id))return;
  const capability=byId.get(id);if(!capability)return;
  visiting.add(id);for(const dependency of capability.dependsOn||[])visit(dependency);visiting.delete(id);visited.add(id);dependencyOrder.push(id);
 };
 visit(selected.id);
 const blockedInClosure=dependencyOrder.map(id=>byId.get(id)!).filter(capability=>capability.status==='BLOCKED');
 const blockedIds=new Set(blockedInClosure.map(capability=>capability.id));
 const rootBlockers=blockedInClosure.filter(capability=>!(capability.dependsOn||[]).some(id=>blockedIds.has(id))).map(capability=>({id:capability.id,blockers:[...capability.blockers]}));
 const memo=new Map<string,{path:string[];latency:number;cost:number}>(),stack=new Set<string>();
 const longest=(capability:CompiledCapability):{path:string[];latency:number;cost:number}=>{
  const cached=memo.get(capability.id);if(cached)return cached;
  if(stack.has(capability.id))return{path:[capability.id],latency:capability.latency,cost:capability.cost};
  stack.add(capability.id);
  const candidates=(capability.dependsOn||[]).map(id=>byId.get(id)).filter((x):x is CompiledCapability=>Boolean(x)).map(longest);
  stack.delete(capability.id);
  const upstream=candidates.sort((a,b)=>b.latency-a.latency||b.cost-a.cost||a.path.join('>').localeCompare(b.path.join('>')))[0];
  const result=upstream?{path:[...upstream.path,capability.id],latency:upstream.latency+capability.latency,cost:upstream.cost+capability.cost}:{path:[capability.id],latency:capability.latency,cost:capability.cost};
  memo.set(capability.id,result);return result;
 };
 const critical=longest(selected);
 return{selectedId:selected.id,dependencyOrder,rootBlockers,criticalPath:critical.path,abstractLatency:critical.latency,abstractCost:critical.cost};
}

export const FOUNDRY_DEPENDENCY_BOUNDARY_R273={
 revision:'R273',
 readOnly:true,
 source:'already-compiled capability frontier only',
 performanceTruth:'cost and latency are declared abstract planning weights, not measured wall-clock performance',
 authority:'no polling, dispatch, execution, source mutation, CanonState admission or deployment authority'
} as const;

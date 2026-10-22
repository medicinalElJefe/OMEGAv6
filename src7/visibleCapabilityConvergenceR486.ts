import {YEAR_CORPUS_EXECUTION_R473,compileCorpusExecutionPlanR473,type CorpusBindingR473} from '../src/yearCorpusExecutionR473';
export const R486_VISIBLE_SCHEMA='OMEGA_VISIBLE_CAPABILITY_CONVERGENCE_R486' as const;
export type VisibleFamilyR486='UNDERSTAND'|'EXPLORE'|'CREATE'|'BUILD'|'WORK'|'RECOVER';
const family=(x:CorpusBindingR473):VisibleFamilyR486=>{
 if(['RECOVERY'].includes(x.domain))return'RECOVER';
 if(['RENDER','GEOMETRY'].includes(x.domain))return'CREATE';
 if(['WORLD','SCIENCE','BIOLOGY'].includes(x.domain))return'EXPLORE';
 if(['NATIVE','AUTONOMY','AI'].includes(x.domain))return'BUILD';
 if(['APPLICATIONS'].includes(x.domain))return'WORK';
 return'UNDERSTAND';
};
export const R486_VISIBLE_CAPABILITIES=YEAR_CORPUS_EXECUTION_R473.map(binding=>{
 const plan=compileCorpusExecutionPlanR473(binding);
 return Object.freeze({id:binding.id,name:binding.name,family:family(binding),route:binding.route,operation:binding.operation,state:binding.state,
  contribution:binding.contribution,aliases:binding.aliases,truth:binding.truth,routable:plan.routable,capabilityId:plan.capabilityId,
  executionDomain:plan.executionDomain,capabilityReality:plan.capabilityReality,truthBoundary:plan.truthBoundary,
  receiptAuthority:plan.receiptAuthority,admissionAuthority:plan.admissionAuthority,canonicalMutation:false as const});
});
export const R486_VISIBLE_SUMMARY=Object.freeze({
 schema:R486_VISIBLE_SCHEMA,total:R486_VISIBLE_CAPABILITIES.length,
 executesNow:R486_VISIBLE_CAPABILITIES.filter(x=>x.state==='EXECUTES_NOW').length,
 adapters:R486_VISIBLE_CAPABILITIES.filter(x=>x.state==='EXECUTES_AS_ADAPTER').length,
 truthGated:R486_VISIBLE_CAPABILITIES.filter(x=>x.state==='TRUTH_GATED').length,
 routable:R486_VISIBLE_CAPABILITIES.filter(x=>x.routable).length,
 rule:'RECOVERED_CAPABILITY_IS_PRODUCT_VISIBLE_THROUGH_ITS_CURRENT_EXECUTOR_WITH_PROOF_AND_TRUTH_BOUNDARY_ATTACHED',
 canonicalMutation:false
});
export function visibleCapabilitiesForRouteR486(route:string){return R486_VISIBLE_CAPABILITIES.filter(x=>x.route===route)}
export function visibleCapabilitiesForFamilyR486(familyId:VisibleFamilyR486){return R486_VISIBLE_CAPABILITIES.filter(x=>x.family===familyId)}

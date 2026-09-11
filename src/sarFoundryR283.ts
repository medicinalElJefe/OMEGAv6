import{compileSystemGenomeR268,genomeByIdR268,type FoundryContext}from'./systemFoundryR268';
import{SAR_CAPABILITIES_R283,sarCapabilityCoverageR283}from'./sarCapabilityMapR283';
import{SAR_MODE_BINDINGS_R283}from'./sarModesR283';

export interface SarFoundryContextR283 extends FoundryContext{boundSarProducts:number;boundComplexProducts:number;externalCatalogBound:boolean;benchmarkReferences:number}
export function compileSarSystemR283(ctx:SarFoundryContextR283){
 const base=compileSystemGenomeR268(genomeByIdR268('sar.lab'),ctx);
 const detailed=SAR_CAPABILITIES_R283.map(c=>{const blockers:string[]=[];
  if(c.state==='EXTERNAL_BINDING_REQUIRED'&&!ctx.externalCatalogBound)blockers.push('EXTERNAL_EO_BINDING_REQUIRED');
  if(c.id==='sar.complex.measurement'&&ctx.boundComplexProducts<1)blockers.push('COMPLEX_PRODUCT_REQUIRED_FOR_LIVE_MEASUREMENT');
  if(c.id==='sar.interferometry.stack'&&ctx.boundComplexProducts<2)blockers.push('TWO_COMPLEX_ACQUISITIONS_REQUIRED');
  if(c.id==='proof.external.benchmark'&&ctx.benchmarkReferences<1)blockers.push('AUTHORITATIVE_BENCHMARK_REQUIRED');
  return{...c,status:blockers.length?'BLOCKED' as const:'ACTIVE' as const,blockers};
 });
 const operators=[...new Set(detailed.flatMap(x=>x.module.split('|')))];
 const modes=SAR_MODE_BINDINGS_R283.map(m=>({id:m.id,role:m.role,status:m.role==='DORMANT'?'DORMANT' as const:'ACTIVE' as const,physicalAuthority:false}));
 return{schema:'OMEGA_SAR_FOUNDRY_R283',base,detailed,coverage:sarCapabilityCoverageR283(),operators,modes,authority:base.authority,truthBoundary:'R283 extends the existing sar.lab genome. It does not create another CanonState, dispatch, deployment, runtime or evidence authority.'};
}

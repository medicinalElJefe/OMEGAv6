import type{SarObservationR280}from'./sarTruthR280';

export interface FusionInputR280{observation:SarObservationR280;role:'PRIMARY'|'AUXILIARY'|'REFERENCE';weight?:number}
export interface FusionPlanR280{admitted:boolean;warnings:string[];transforms:string[];donors:{id:string;sourceId:string;truth:string;crs:string;surfaceClass:string;band:string;productLevel:string}[]}

export function planSarFusionR280(inputs:FusionInputR280[]):FusionPlanR280{
 const warnings:string[]=[];const transforms:string[]=[];if(inputs.length<2)warnings.push('TWO_OR_MORE_DONORS_REQUIRED');
 const donors=inputs.map(x=>({id:x.observation.id,sourceId:x.observation.provenance.sourceId,truth:x.observation.truth,crs:x.observation.geometry.crs,surfaceClass:x.observation.geometry.surfaceClass,band:x.observation.band,productLevel:x.observation.productLevel}));
 const crs=new Set(donors.map(x=>x.crs));if(crs.size>1){warnings.push('REGISTRATION_REQUIRED');transforms.push('geometry.register/common-frame')}
 const levels=new Set(donors.map(x=>x.productLevel));if(levels.size>1)warnings.push('PRODUCT_LEVELS_DIFFER');
 if(donors.some(x=>x.truth==='SIMULATED'||x.truth==='FORECAST'))warnings.push('MODEL_STATE_PRESENT');
 if(inputs.some(x=>!x.observation.sourceEvidenceBound))warnings.push('UNBOUND_SOURCE_PRESENT');
 if(new Set(donors.map(x=>x.surfaceClass)).size>1)warnings.push('MEASUREMENT_SURFACES_DIFFER');
 transforms.push('provenance-preserving-fusion');
 return{admitted:!warnings.includes('TWO_OR_MORE_DONORS_REQUIRED')&&!warnings.includes('UNBOUND_SOURCE_PRESENT'),warnings,transforms,donors};
}

export function fusionTruthClassR280(inputs:FusionInputR280[]){return inputs.length?'FUSED' as const:null}
export function fusionTruthBoundaryR280(){return'Fused output is derived. It retains every donor and transform and cannot claim direct-observation truth merely because all donors are observed.'}

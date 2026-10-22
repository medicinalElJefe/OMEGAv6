import type{SarObservationR280,SarTruthClassR280}from'./sarTruthR280';

export interface SarProofR280{admitted:boolean;truth:SarTruthClassR280;score:number;reasons:string[];warnings:string[]}
export function proveSarObservationR280(obs:SarObservationR280):SarProofR280{
 const reasons:string[]=[];const warnings:string[]=[];let score=100;
 if(!obs.sourceEvidenceBound){reasons.push('SOURCE_EVIDENCE_REQUIRED');score-=35}
 if(!obs.nativeDataBound){reasons.push('NATIVE_DATA_REQUIRED');score-=20}
 if(obs.band==='UNKNOWN'){reasons.push('BAND_REQUIRED');score-=10}
 if(!obs.geometry.crs){reasons.push('CRS_REQUIRED');score-=10}
 if(obs.missingness.includes('NO_SOURCE')){reasons.push('NO_SOURCE');score=0}
 if(obs.truth==='SIMULATED'||obs.truth==='FORECAST'||obs.truth==='DERIVED_MODEL'||obs.truth==='VISUAL_ENHANCED')warnings.push('NOT_DIRECT_OBSERVATION');
 if(!obs.calibration&&obs.truth==='OBSERVED_CALIBRATED')reasons.push('CALIBRATION_RECORD_REQUIRED');
 if(obs.missingness.length)warnings.push(...obs.missingness.map(x=>'MISSINGNESS:'+x));
 return{admitted:reasons.length===0,truth:obs.truth,score:Math.max(0,score),reasons,warnings};
}
export function canRenderAsObservedR280(proof:SarProofR280){return proof.admitted&&(proof.truth==='OBSERVED_NATIVE'||proof.truth==='OBSERVED_CALIBRATED')}

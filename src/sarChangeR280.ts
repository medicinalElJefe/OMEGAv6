import type{SarObservationR280}from'./sarTruthR280';

export type SarChangeKindR280='AMPLITUDE_DB'|'COHERENCE'|'LOS_DEFORMATION'|'POLARIMETRIC'|'MULTI_BAND';
export interface SarChangePairR280{before:SarObservationR280;after:SarObservationR280;kind:SarChangeKindR280}
export function changePairAdmissionR280(x:SarChangePairR280){const reasons:string[]=[];if(!x.before.sourceEvidenceBound||!x.after.sourceEvidenceBound)reasons.push('BOUND_SOURCES_REQUIRED');if(x.before.geometry.crs!==x.after.geometry.crs)reasons.push('COMMON_FRAME_REQUIRED');if(x.kind!=='MULTI_BAND'&&x.before.band!==x.after.band)reasons.push('BAND_MISMATCH');if(x.before.polarization!==x.after.polarization&&x.kind!=='POLARIMETRIC')reasons.push('POLARIZATION_MISMATCH');if(x.kind==='LOS_DEFORMATION'&&(!x.before.complexDataBound||!x.after.complexDataBound))reasons.push('COMPLEX_DATA_REQUIRED');return{admitted:reasons.length===0,reasons}}
export function changeTruthBoundaryR280(){return'Change is a relation between declared observations. Amplitude change, coherence loss, phase-derived LOS displacement and multi-band differences remain distinct quantities.'}

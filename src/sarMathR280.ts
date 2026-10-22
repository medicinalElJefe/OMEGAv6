import type{SarComplexPixelR280,SarObservationR280}from'./sarTruthR280';

export const TAU=Math.PI*2;
export const C0=299_792_458;

export function frequencyToWavelengthM(frequencyHz:number){return C0/frequencyHz}
export function wavelengthToFrequencyHz(wavelengthM:number){return C0/wavelengthM}
export function wrapPhaseR280(x:number){const y=((x+Math.PI)%TAU+TAU)%TAU-Math.PI;return y===-Math.PI?Math.PI:y}
export function phaseDifferenceR280(a:number,b:number){return wrapPhaseR280(b-a)}
export function phaseToLosDisplacementM_R280(phaseRad:number,wavelengthM:number){return -(phaseRad*wavelengthM)/(4*Math.PI)}
export function losDisplacementToPhaseR280(displacementM:number,wavelengthM:number){return -(4*Math.PI*displacementM)/wavelengthM}

export function complexFromAmpPhaseR280(amplitude:number,phaseRad:number){return {re:amplitude*Math.cos(phaseRad),im:amplitude*Math.sin(phaseRad)}}
export function ampPhaseFromComplexR280(re:number,im:number){return {amplitude:Math.hypot(re,im),phaseRad:Math.atan2(im,re)}}
export function complexConjugateMultiplyR280(a:{re:number;im:number},b:{re:number;im:number}){return {re:a.re*b.re+a.im*b.im,im:a.im*b.re-a.re*b.im}}

export function interferogramPixelR280(master:SarComplexPixelR280,slave:SarComplexPixelR280){
 const a=complexFromAmpPhaseR280(master.amplitude,master.phaseRad);const b=complexFromAmpPhaseR280(slave.amplitude,slave.phaseRad);
 const z=complexConjugateMultiplyR280(a,b);const p=ampPhaseFromComplexR280(z.re,z.im);
 return {amplitude:p.amplitude,wrappedPhaseRad:wrapPhaseR280(p.phaseRad)};
}

export function coherenceR280(master:SarComplexPixelR280[],slave:SarComplexPixelR280[]){
 const n=Math.min(master.length,slave.length);if(!n)return null;let crossRe=0,crossIm=0,p1=0,p2=0,count=0;
 for(let i=0;i<n;i++){
  const a=master[i],b=slave[i];if(a.missing?.length||b.missing?.length)continue;
  const z=interferogramPixelR280(a,b);crossRe+=z.amplitude*Math.cos(z.wrappedPhaseRad);crossIm+=z.amplitude*Math.sin(z.wrappedPhaseRad);p1+=a.amplitude*a.amplitude;p2+=b.amplitude*b.amplitude;count++;
 }
 if(!count||p1<=0||p2<=0)return null;return Math.max(0,Math.min(1,Math.hypot(crossRe,crossIm)/Math.sqrt(p1*p2)));
}

export function sigma0LinearToDbR280(sigma0:number){return sigma0>0?10*Math.log10(sigma0):Number.NEGATIVE_INFINITY}
export function sigma0DbToLinearR280(db:number){return Math.pow(10,db/10)}

export function incidenceNormalizeR280(sigma0Linear:number,incidenceDeg:number,exponent=1){
 const c=Math.max(1e-6,Math.cos(incidenceDeg*Math.PI/180));return sigma0Linear/Math.pow(c,exponent);
}

export function slantRangeFromTimeR280(twoWaySeconds:number){return(C0*twoWaySeconds)/2}
export function dopplerVelocityR280(dopplerHz:number,wavelengthM:number){return-(dopplerHz*wavelengthM)/2}

export function projectVectorToLosR280(vector:[number,number,number],los:[number,number,number]){return vector[0]*los[0]+vector[1]*los[1]+vector[2]*los[2]}
export function normalize3R280(v:[number,number,number]):[number,number,number]{const n=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/n,v[1]/n,v[2]/n]}

export interface SarResidualDecompositionR280{observed:number;deformation:number;topography:number;orbit:number;atmosphere:number;noise:number;closure:number}
export function decomposeInterferometricPhaseR280(x:Omit<SarResidualDecompositionR280,'closure'>):SarResidualDecompositionR280{
 const known=x.deformation+x.topography+x.orbit+x.atmosphere+x.noise;return{...x,closure:wrapPhaseR280(x.observed-known)};
}

export function qualityScoreR280(obs:SarObservationR280){
 let q=1;if(!obs.sourceEvidenceBound)q-=.35;if(!obs.nativeDataBound)q-=.2;if(obs.band==='UNKNOWN')q-=.1;if(!obs.calibration)q-=.08;
 q-=Math.min(.12,obs.missingness.length*.03);q-=Math.min(.15,(obs.residuals.decorrelation||0)*.15);return Math.max(0,Math.min(1,q));
}

export function relativeMeasurementAddressR280(obs:SarObservationR280){
 const g=obs.geometry;return[
  obs.missionId,obs.sensor,obs.band,obs.polarization,obs.provenance.acquiredAt,obs.productLevel,
  g.crs,g.surfaceClass,g.incidenceDeg??'incidence?',g.lookDirection??'look?',g.orbitDirection??'orbit?'
 ].join('|');
}

export function multiBandDifferenceR280(a:{value:number;observation:SarObservationR280},b:{value:number;observation:SarObservationR280}){
 const warnings:string[]=[];if(a.observation.band===b.observation.band)warnings.push('SAME_BAND');if(a.observation.geometry.crs!==b.observation.geometry.crs)warnings.push('CRS_MISMATCH');
 if(a.observation.geometry.surfaceClass!==b.observation.geometry.surfaceClass)warnings.push('SCATTERING_SURFACE_MISMATCH');
 if(a.observation.polarization!==b.observation.polarization)warnings.push('POLARIZATION_DIFFERS');
 return{delta:b.value-a.value,warnings,addressA:relativeMeasurementAddressR280(a.observation),addressB:relativeMeasurementAddressR280(b.observation)};
}

import{clamp01R280,normalizeDbR280,normalizeLinearR280,normalizePhaseR280,normalizeSignedR280}from'./sarVisualMathR280';
export interface SarRasterFieldR283{
 width:number;height:number;sourceId:string;native:boolean;
 nativeIntensity?:number[];validMask?:number[];sourceUnits?:string;sampling?:{sourceWidth:number;sourceHeight:number;selectedIfdOffset:number;overview:boolean;method:string;validSamples:number;totalSamples:number};georeference?:{bound:boolean;affineBound?:boolean;gcpBound?:boolean;method:string;crs:string|null;epsg:number|null;affine:number[]|null;corners:Array<{x:number;y:number}|null>;gcpCount?:number;gcps?:Array<{pixel:number;line:number;zPixel:number;x:number;y:number;z:number}>};
 amplitudeDb?:number[];beta0?:number[];sigma0?:number[];gamma0?:number[];terrainFlattenedGamma0?:number[];complexI?:number[];complexQ?:number[];phaseRad?:number[];interferogramPhaseRad?:number[];correctedInterferometricPhaseRad?:number[];unwrappedPhaseRad?:number[];correctedUnwrappedPhaseRad?:number[];unwrapComponentId?:number[];coherence?:number[];losDisplacementM?:number[];correctedLosDisplacementM?:number[];deformationEastM?:number[];deformationNorthM?:number[];deformationUpM?:number[];elevationM?:number[];polarimetricPower?:number[];multiBandRelative?:number[];timeStackRelative?:number[];uncertainty?:number[];quality?:number[];
 scarBurden?:number[];proofCoverage?:number[];
 derivationR336?:{schema:string;sourceId:string;evidenceClass:string;operators:string[];truthBoundary:string};
 pairDerivationR341?:{schema:string;masterSourceId:string;slaveSourceId:string;gridIdentity:string;sampledGridIdentity?:boolean;subpixelCoregistrationBound?:boolean;interferometricPhaseValidity?:'HELD'|'ESTABLISHED';windowRadius:number;commonValid:number};
 calibrationR343?:{schema:string;source:string[];validSamples:number};
 physicalClosureR343?:{schema:string;coregistrationBound:boolean;interferometricPhaseValidated:boolean;calibrationBound:boolean;terrainFlattenedBound:boolean;unwrappedPhaseBound:boolean;correctionLedgerBound:boolean;losDisplacementBound:boolean;correctedLosBound?:boolean;proof:string[];scars:string[]};
 ranges?:{nativeIntensity?:[number,number];amplitudeDb?:[number,number];beta0?:[number,number];sigma0?:[number,number];gamma0?:[number,number];terrainFlattenedGamma0?:[number,number];losDisplacementM?:[number,number];correctedLosDisplacementM?:[number,number];elevationM?:[number,number];polarimetricPower?:[number,number];multiBandRelative?:[number,number];timeStackRelative?:[number,number]};
}
const at=(a:number[]|undefined,i:number,mask?:number[])=>a&&i>=0&&i<a.length&&Number.isFinite(a[i])&&(!mask||mask[i]>0)?a[i]:null;
const range=(a:number[]|undefined,fallback:[number,number]):[number,number]=>{if(!a?.length)return fallback;let lo=Infinity,hi=-Infinity;for(const v of a)if(Number.isFinite(v)){lo=Math.min(lo,v);hi=Math.max(hi,v)}return Number.isFinite(lo)&&Number.isFinite(hi)?[lo,hi]:fallback};
export function rasterIndexR283(r:SarRasterFieldR283,x01:number,y01:number){const x=Math.max(0,Math.min(r.width-1,Math.round(x01*(r.width-1)))),y=Math.max(0,Math.min(r.height-1,Math.round(y01*(r.height-1))));return y*r.width+x}
export function rasterVisualValueR283(r:SarRasterFieldR283,view:string,x01:number,y01:number){const i=rasterIndexR283(r,x01,y01);let v:number|null=null;
 if(view==='SOURCE'){v=at(r.nativeIntensity,i,r.validMask);if(v!=null){const q=r.ranges?.nativeIntensity||range(r.nativeIntensity,[0,1]);if(q[0]>=0&&q[1]>q[0])return normalizeLinearR280(Math.log1p(v),Math.log1p(q[0]),Math.log1p(q[1]));return normalizeLinearR280(v,q[0],q[1])}v=at(r.amplitudeDb,i);if(v==null)return null;const q=r.ranges?.amplitudeDb||[-30,5];return normalizeDbR280(v,q[0],q[1])}
 if(view==='AMPLITUDE'){const power=r.terrainFlattenedGamma0?.length?r.terrainFlattenedGamma0:r.gamma0?.length?r.gamma0:r.sigma0?.length?r.sigma0:r.beta0?.length?r.beta0:undefined;v=at(power,i,r.validMask);if(v!=null&&v>0){const db=10*Math.log10(v);return normalizeDbR280(db,-35,10)}v=at(r.amplitudeDb,i);if(v!=null){const q=r.ranges?.amplitudeDb||[-30,5];return normalizeDbR280(v,q[0],q[1])}v=at(r.nativeIntensity,i,r.validMask);if(v==null)return null;const q=r.ranges?.nativeIntensity||range(r.nativeIntensity,[0,1]);if(q[0]>=0&&q[1]>q[0])return normalizeLinearR280(Math.log1p(v),Math.log1p(q[0]),Math.log1p(q[1]));return normalizeLinearR280(v,q[0],q[1])}
 if(view==='TIME_STACK'){v=at(r.timeStackRelative,i);if(v==null)return null;const q=r.ranges?.timeStackRelative||range(r.timeStackRelative,[0,1]);return normalizeLinearR280(v,q[0],q[1])}
 if(view==='PHASE'){v=at(r.phaseRad,i);return v==null?null:normalizePhaseR280(v)}
 if(view==='INTERFEROGRAM'){const a=r.correctedInterferometricPhaseRad?.length?r.correctedInterferometricPhaseRad:r.interferogramPhaseRad;v=at(a,i,r.validMask);return v==null?null:normalizePhaseR280(v)}
 if(view==='COHERENCE'){v=at(r.coherence,i);return v==null?null:clamp01R280(v)}
 if(view==='DEFORMATION'){const a=r.correctedLosDisplacementM?.length?r.correctedLosDisplacementM:r.losDisplacementM;v=at(a,i,r.validMask);if(v==null)return null;const q=r.ranges?.correctedLosDisplacementM||r.ranges?.losDisplacementM||range(a,[-.05,.05]);const limit=Math.max(Math.abs(q[0]),Math.abs(q[1]),1e-9);return normalizeSignedR280(v,limit)}
 if(view==='ELEVATION'){v=at(r.elevationM,i);if(v==null)return null;const q=r.ranges?.elevationM||range(r.elevationM,[0,1]);return normalizeLinearR280(v,q[0],q[1])}
 if(view==='POLARIMETRY'){v=at(r.polarimetricPower,i);if(v==null)return null;const q=r.ranges?.polarimetricPower||range(r.polarimetricPower,[0,1]);return normalizeLinearR280(v,q[0],q[1])}
 if(view==='MULTI_BAND'){v=at(r.multiBandRelative,i);if(v==null)return null;const q=r.ranges?.multiBandRelative||range(r.multiBandRelative,[-1,1]);const limit=Math.max(Math.abs(q[0]),Math.abs(q[1]),1e-9);return normalizeSignedR280(v,limit)}
 if(view==='SCAR_UNCERTAINTY'){v=at(r.uncertainty,i);if(v==null)v=at(r.scarBurden,i);return v==null?null:clamp01R280(v)}
 if(view==='PROOF'){v=at(r.quality,i);if(v==null)v=at(r.proofCoverage,i);return v==null?null:clamp01R280(v)}return null;
}
export function rasterCoverageR283(r:SarRasterFieldR283,view:string){
 const key=view==='SOURCE'?(r.nativeIntensity?.length?'nativeIntensity':'amplitudeDb'):
  view==='AMPLITUDE'?(r.terrainFlattenedGamma0?.length?'terrainFlattenedGamma0':r.gamma0?.length?'gamma0':r.sigma0?.length?'sigma0':r.beta0?.length?'beta0':r.amplitudeDb?.length?'amplitudeDb':'nativeIntensity'):
  view==='TIME_STACK'?'timeStackRelative':
  view==='PHASE'?'phaseRad':
  view==='INTERFEROGRAM'?(r.correctedInterferometricPhaseRad?.length?'correctedInterferometricPhaseRad':'interferogramPhaseRad'):
  view==='COHERENCE'?'coherence':
  view==='DEFORMATION'?(r.correctedLosDisplacementM?.length?'correctedLosDisplacementM':'losDisplacementM'):
  view==='ELEVATION'?'elevationM':
  view==='POLARIMETRY'?'polarimetricPower':
  view==='MULTI_BAND'?'multiBandRelative':
  view==='SCAR_UNCERTAINTY'?(r.uncertainty?.length?'uncertainty':'scarBurden'):
  view==='PROOF'?(r.quality?.length?'quality':'proofCoverage'):'amplitudeDb';
 const a=(r as any)[key] as number[]|undefined,mask=r.validMask?.length===r.width*r.height?r.validMask:undefined,actual=a?.length?(mask?mask.filter((x,i)=>x>0&&Number.isFinite(a[i])).length:a.filter(Number.isFinite).length):0;
 return{field:key,bound:actual>0,expected:r.width*r.height,actual,complete:actual===r.width*r.height}
}
export function rasterTruthBoundaryR283(){return'R283/R336/R343 rendering preserves source, calibrated, pair-derived, corrected, unwrapped and metric fields as separate evidence layers. AMPLITUDE prefers terrain-flattened gamma0, gamma0, sigma0 or beta0 only when those arrays are explicitly materialized; otherwise it falls back to declared amplitude/native DN without relabeling. INTERFEROGRAM prefers a correction-ledger field only when bound. DEFORMATION prefers corrected LOS only when materialized. Missing arrays/pixels remain missing as NaN/masked; no display path promotes an absent physical correction.'}

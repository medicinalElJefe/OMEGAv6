import{clamp01R280,normalizeDbR280,normalizeLinearR280,normalizePhaseR280,normalizeSignedR280}from'./sarVisualMathR280';
export interface SarRasterFieldR283{
 width:number;height:number;sourceId:string;native:boolean;
 nativeIntensity?:number[];validMask?:number[];sourceUnits?:string;sampling?:{sourceWidth:number;sourceHeight:number;selectedIfdOffset:number;overview:boolean;method:string;validSamples:number;totalSamples:number};georeference?:{bound:boolean;affineBound?:boolean;gcpBound?:boolean;method:string;crs:string|null;epsg:number|null;affine:number[]|null;corners:Array<{x:number;y:number}|null>;gcpCount?:number;gcps?:Array<{pixel:number;line:number;zPixel:number;x:number;y:number;z:number}>};
 amplitudeDb?:number[];complexI?:number[];complexQ?:number[];phaseRad?:number[];interferogramPhaseRad?:number[];coherence?:number[];losDisplacementM?:number[];elevationM?:number[];polarimetricPower?:number[];multiBandRelative?:number[];timeStackRelative?:number[];uncertainty?:number[];quality?:number[];
 scarBurden?:number[];proofCoverage?:number[];
 derivationR336?:{schema:string;sourceId:string;evidenceClass:string;operators:string[];truthBoundary:string};
 pairDerivationR341?:{schema:string;masterSourceId:string;slaveSourceId:string;gridIdentity:string;sampledGridIdentity?:boolean;subpixelCoregistrationBound?:boolean;interferometricPhaseValidity?:'HELD'|'ESTABLISHED';windowRadius:number;commonValid:number};
 ranges?:{nativeIntensity?:[number,number];amplitudeDb?:[number,number];losDisplacementM?:[number,number];elevationM?:[number,number];polarimetricPower?:[number,number];multiBandRelative?:[number,number];timeStackRelative?:[number,number]};
}
const at=(a:number[]|undefined,i:number,mask?:number[])=>a&&i>=0&&i<a.length&&Number.isFinite(a[i])&&(!mask||mask[i]>0)?a[i]:null;
const range=(a:number[]|undefined,fallback:[number,number]):[number,number]=>{if(!a?.length)return fallback;let lo=Infinity,hi=-Infinity;for(const v of a)if(Number.isFinite(v)){lo=Math.min(lo,v);hi=Math.max(hi,v)}return Number.isFinite(lo)&&Number.isFinite(hi)?[lo,hi]:fallback};
export function rasterIndexR283(r:SarRasterFieldR283,x01:number,y01:number){const x=Math.max(0,Math.min(r.width-1,Math.round(x01*(r.width-1)))),y=Math.max(0,Math.min(r.height-1,Math.round(y01*(r.height-1))));return y*r.width+x}
export function rasterVisualValueR283(r:SarRasterFieldR283,view:string,x01:number,y01:number){const i=rasterIndexR283(r,x01,y01);let v:number|null=null;
 if(view==='SOURCE'){v=at(r.nativeIntensity,i,r.validMask);if(v!=null){const q=r.ranges?.nativeIntensity||range(r.nativeIntensity,[0,1]);if(q[0]>=0&&q[1]>q[0])return normalizeLinearR280(Math.log1p(v),Math.log1p(q[0]),Math.log1p(q[1]));return normalizeLinearR280(v,q[0],q[1])}v=at(r.amplitudeDb,i);if(v==null)return null;const q=r.ranges?.amplitudeDb||[-30,5];return normalizeDbR280(v,q[0],q[1])}
 if(view==='AMPLITUDE'){v=at(r.amplitudeDb,i);if(v!=null){const q=r.ranges?.amplitudeDb||[-30,5];return normalizeDbR280(v,q[0],q[1])}v=at(r.nativeIntensity,i,r.validMask);if(v==null)return null;const q=r.ranges?.nativeIntensity||range(r.nativeIntensity,[0,1]);if(q[0]>=0&&q[1]>q[0])return normalizeLinearR280(Math.log1p(v),Math.log1p(q[0]),Math.log1p(q[1]));return normalizeLinearR280(v,q[0],q[1])}
 if(view==='TIME_STACK'){v=at(r.timeStackRelative,i);if(v==null)return null;const q=r.ranges?.timeStackRelative||range(r.timeStackRelative,[0,1]);return normalizeLinearR280(v,q[0],q[1])}
 if(view==='PHASE'){v=at(r.phaseRad,i);return v==null?null:normalizePhaseR280(v)}
 if(view==='INTERFEROGRAM'){v=at(r.interferogramPhaseRad,i);return v==null?null:normalizePhaseR280(v)}
 if(view==='COHERENCE'){v=at(r.coherence,i);return v==null?null:clamp01R280(v)}
 if(view==='DEFORMATION'){v=at(r.losDisplacementM,i);if(v==null)return null;const q=r.ranges?.losDisplacementM||range(r.losDisplacementM,[-.05,.05]);const limit=Math.max(Math.abs(q[0]),Math.abs(q[1]),1e-9);return normalizeSignedR280(v,limit)}
 if(view==='ELEVATION'){v=at(r.elevationM,i);if(v==null)return null;const q=r.ranges?.elevationM||range(r.elevationM,[0,1]);return normalizeLinearR280(v,q[0],q[1])}
 if(view==='POLARIMETRY'){v=at(r.polarimetricPower,i);if(v==null)return null;const q=r.ranges?.polarimetricPower||range(r.polarimetricPower,[0,1]);return normalizeLinearR280(v,q[0],q[1])}
 if(view==='MULTI_BAND'){v=at(r.multiBandRelative,i);if(v==null)return null;const q=r.ranges?.multiBandRelative||range(r.multiBandRelative,[-1,1]);const limit=Math.max(Math.abs(q[0]),Math.abs(q[1]),1e-9);return normalizeSignedR280(v,limit)}
 if(view==='SCAR_UNCERTAINTY'){v=at(r.uncertainty,i);if(v==null)v=at(r.scarBurden,i);return v==null?null:clamp01R280(v)}
 if(view==='PROOF'){v=at(r.quality,i);if(v==null)v=at(r.proofCoverage,i);return v==null?null:clamp01R280(v)}return null;
}
export function rasterCoverageR283(r:SarRasterFieldR283,view:string){
 const key=view==='SOURCE'?(r.nativeIntensity?.length?'nativeIntensity':'amplitudeDb'):
  view==='AMPLITUDE'?(r.amplitudeDb?.length?'amplitudeDb':'nativeIntensity'):
  view==='TIME_STACK'?'timeStackRelative':
  view==='PHASE'?'phaseRad':
  view==='INTERFEROGRAM'?'interferogramPhaseRad':
  view==='COHERENCE'?'coherence':
  view==='DEFORMATION'?'losDisplacementM':
  view==='ELEVATION'?'elevationM':
  view==='POLARIMETRY'?'polarimetricPower':
  view==='MULTI_BAND'?'multiBandRelative':
  view==='SCAR_UNCERTAINTY'?(r.uncertainty?.length?'uncertainty':'scarBurden'):
  view==='PROOF'?(r.quality?.length?'quality':'proofCoverage'):'amplitudeDb';
 const a=(r as any)[key] as number[]|undefined,mask=r.validMask?.length===r.width*r.height?r.validMask:undefined,actual=a?.length?(mask?mask.filter((x,i)=>x>0&&Number.isFinite(a[i])).length:a.filter(Number.isFinite).length):0;
 return{field:key,bound:actual>0,expected:r.width*r.height,actual,complete:actual===r.width*r.height}
}
export function rasterTruthBoundaryR283(){return'R283/R336 raster rendering reads declared measurement arrays plus R336 evidence diagnostics. SOURCE reads exact decoded native samples. AMPLITUDE may display those same native DN samples as an explicitly uncalibrated native-intensity lens until a separately authoritative amplitudeDb field is bound. SCAR/PROOF may display exact validity/evidence coverage diagnostics. Missing arrays/pixels remain missing and never become claimed source evidence; no native DN is promoted into calibrated sigma0/gamma0, phase, coherence, deformation, elevation, polarimetry, multi-band, or time-stack measurements. R341 pair fields, when present, remain separately typed and never overwrite source phase.'}

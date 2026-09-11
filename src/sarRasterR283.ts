import{clamp01R280,normalizeDbR280,normalizeLinearR280,normalizePhaseR280,normalizeSignedR280}from'./sarVisualMathR280';
export interface SarRasterFieldR283{
 width:number;height:number;sourceId:string;native:boolean;
 amplitudeDb?:number[];phaseRad?:number[];coherence?:number[];losDisplacementM?:number[];elevationM?:number[];polarimetricPower?:number[];multiBandRelative?:number[];uncertainty?:number[];quality?:number[];
 ranges?:{amplitudeDb?:[number,number];losDisplacementM?:[number,number];elevationM?:[number,number];polarimetricPower?:[number,number];multiBandRelative?:[number,number]};
}
const at=(a:number[]|undefined,i:number)=>a&&i>=0&&i<a.length&&Number.isFinite(a[i])?a[i]:null;
const range=(a:number[]|undefined,fallback:[number,number]):[number,number]=>{if(!a?.length)return fallback;let lo=Infinity,hi=-Infinity;for(const v of a)if(Number.isFinite(v)){lo=Math.min(lo,v);hi=Math.max(hi,v)}return Number.isFinite(lo)&&Number.isFinite(hi)?[lo,hi]:fallback};
export function rasterIndexR283(r:SarRasterFieldR283,x01:number,y01:number){const x=Math.max(0,Math.min(r.width-1,Math.round(x01*(r.width-1)))),y=Math.max(0,Math.min(r.height-1,Math.round(y01*(r.height-1))));return y*r.width+x}
export function rasterVisualValueR283(r:SarRasterFieldR283,view:string,x01:number,y01:number){const i=rasterIndexR283(r,x01,y01);let v:number|null=null;
 if(view==='SOURCE'||view==='AMPLITUDE'||view==='TIME_STACK'){v=at(r.amplitudeDb,i);if(v==null)return null;const q=r.ranges?.amplitudeDb||[-30,5];return normalizeDbR280(v,q[0],q[1])}
 if(view==='PHASE'||view==='INTERFEROGRAM'){v=at(r.phaseRad,i);return v==null?null:normalizePhaseR280(v)}
 if(view==='COHERENCE'){v=at(r.coherence,i);return v==null?null:clamp01R280(v)}
 if(view==='DEFORMATION'){v=at(r.losDisplacementM,i);if(v==null)return null;const q=r.ranges?.losDisplacementM||range(r.losDisplacementM,[-.05,.05]);const limit=Math.max(Math.abs(q[0]),Math.abs(q[1]),1e-9);return normalizeSignedR280(v,limit)}
 if(view==='ELEVATION'){v=at(r.elevationM,i);if(v==null)return null;const q=r.ranges?.elevationM||range(r.elevationM,[0,1]);return normalizeLinearR280(v,q[0],q[1])}
 if(view==='POLARIMETRY'){v=at(r.polarimetricPower,i);if(v==null)return null;const q=r.ranges?.polarimetricPower||range(r.polarimetricPower,[0,1]);return normalizeLinearR280(v,q[0],q[1])}
 if(view==='MULTI_BAND'){v=at(r.multiBandRelative,i);if(v==null)return null;const q=r.ranges?.multiBandRelative||range(r.multiBandRelative,[-1,1]);const limit=Math.max(Math.abs(q[0]),Math.abs(q[1]),1e-9);return normalizeSignedR280(v,limit)}
 if(view==='SCAR_UNCERTAINTY'){v=at(r.uncertainty,i);return v==null?null:clamp01R280(v)}
 if(view==='PROOF'){v=at(r.quality,i);return v==null?null:clamp01R280(v)}return null;
}
export function rasterCoverageR283(r:SarRasterFieldR283,view:string){const key=view==='PHASE'||view==='INTERFEROGRAM'?'phaseRad':view==='COHERENCE'?'coherence':view==='DEFORMATION'?'losDisplacementM':view==='ELEVATION'?'elevationM':view==='POLARIMETRY'?'polarimetricPower':view==='MULTI_BAND'?'multiBandRelative':view==='SCAR_UNCERTAINTY'?'uncertainty':view==='PROOF'?'quality':'amplitudeDb';const a=(r as any)[key] as number[]|undefined;return{field:key,bound:!!a?.length,expected:r.width*r.height,actual:a?.length||0,complete:!!a&&a.length===r.width*r.height}}
export function rasterTruthBoundaryR283(){return'R283 raster rendering reads declared measurement arrays. Missing arrays/pixels remain missing and fall back only to explicitly labeled demonstration rendering, never to claimed source evidence.'}

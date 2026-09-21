import type{SarRasterFieldR283}from'./sarRasterR283';

export const SAR_PHYSICAL_CLOSURE_SCHEMA_R343='OMEGA_SAR_PHYSICAL_CLOSURE_R343';
export const TWO_PI_R343=2*Math.PI;

export type SarLutVectorR343={line:number;pixels:number[];values:number[]};
export type SarSparseLutR343={vectors:SarLutVectorR343[];source:string;units:string;kind:string};
export type SarAzimuthNoiseBlockR343={swath?:string|null;firstAzimuthLine:number;lastAzimuthLine:number;firstRangeSample:number;lastRangeSample:number;lines:number[];values:number[]};
export type SarNoiseModelR343={range:SarSparseLutR343;azimuth?:SarAzimuthNoiseBlockR343[];source:string};
export type SarCoregReceiptR343={
 method:string;fullResolution:boolean;burstGeometryBound:boolean;orbitBound:boolean;
 azimuthResidualSamples:number;rangeResidualSamples:number;rangeThresholdSamples:number;
 resampler:string;source:string;
};
export type SarCorrectionLedgerR343={
 topographicPhaseRad?:number[];flatEarthPhaseRad?:number[];atmosphericPhaseRad?:number[];
 etadPhaseRad?:number[];otherPhaseRad?:number[];validMask?:number[];source:string[];
};
export type SarUnwrapReceiptR343={unwrappedPhaseRad:number[];validMask:number[];componentId:number[];residueCount:number;closureRmsRad:number;largestComponent:number;expected:number;established:boolean;truthBoundary:string};
export type SarPhysicalClosureR343={
 raster:SarRasterFieldR283;
 coregistrationBound:boolean;
 interferometricPhaseValidated:boolean;
 calibrationBound:boolean;
 terrainFlattenedBound:boolean;
 unwrappedPhaseBound:boolean;
 correctionLedgerBound:boolean;
 losDisplacementBound:boolean;
 proof:string[];
 scars:string[];
 truthBoundary:string;
};

const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const wrap=(x:number)=>{let y=(x+Math.PI)%TWO_PI_R343;if(y<0)y+=TWO_PI_R343;return y-Math.PI};
const expected=(r:SarRasterFieldR283)=>Math.max(0,r.width*r.height);
const validAt=(r:SarRasterFieldR283,i:number)=>Number(r.validMask?.[i]??1)>0;
const arrayBound=(a:number[]|undefined,n:number)=>!!a&&a.length===n&&a.some(Number.isFinite);

function interpolateRow(pixels:number[],values:number[],x:number){
 if(!pixels.length||pixels.length!==values.length)return Number.NaN;
 if(x<=pixels[0])return Number(values[0]);
 if(x>=pixels[pixels.length-1])return Number(values[values.length-1]);
 let lo=0,hi=pixels.length-1;
 while(hi-lo>1){const m=(lo+hi)>>1;if(pixels[m]<=x)lo=m;else hi=m}
 const x0=Number(pixels[lo]),x1=Number(pixels[hi]),v0=Number(values[lo]),v1=Number(values[hi]);
 if(!finite(x0)||!finite(x1)||!finite(v0)||!finite(v1))return Number.NaN;
 if(x1===x0)return v0;
 const t=(x-x0)/(x1-x0);return v0+(v1-v0)*t;
}
export function interpolateSparseLutR343(lut:SarSparseLutR343,line:number,pixel:number){
 const vs=[...(lut.vectors||[])].filter(v=>finite(v.line)&&v.pixels?.length===v.values?.length&&v.pixels.length).sort((a,b)=>a.line-b.line);
 if(!vs.length)return Number.NaN;
 if(line<=vs[0].line)return interpolateRow(vs[0].pixels,vs[0].values,pixel);
 if(line>=vs[vs.length-1].line)return interpolateRow(vs[vs.length-1].pixels,vs[vs.length-1].values,pixel);
 let lo=0,hi=vs.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(vs[m].line<=line)lo=m;else hi=m}
 const a=vs[lo],b=vs[hi],va=interpolateRow(a.pixels,a.values,pixel),vb=interpolateRow(b.pixels,b.values,pixel);
 if(!finite(va)||!finite(vb))return Number.NaN;if(b.line===a.line)return va;
 const t=(line-a.line)/(b.line-a.line);return va+(vb-va)*t;
}

export function materializeSparseLutR343(r:SarRasterFieldR283,lut:SarSparseLutR343){
 const n=expected(r),out=new Array(n).fill(Number.NaN),mask=new Array(n).fill(0),sw=r.sampling?.sourceWidth||r.width,sh=r.sampling?.sourceHeight||r.height;
 for(let y=0;y<r.height;y++)for(let x=0;x<r.width;x++){const i=y*r.width+x;if(!validAt(r,i))continue;const sx=r.width<=1?0:x*(sw-1)/(r.width-1),sy=r.height<=1?0:y*(sh-1)/(r.height-1),v=interpolateSparseLutR343(lut,sy,sx);if(finite(v)){out[i]=v;mask[i]=1}}
 return{values:out,validMask:mask,source:lut.source,kind:lut.kind,units:lut.units};
}
export function calibratedPowerR343(dn:number,A:number,noiseLinearPower=0){
 if(!finite(dn)||!finite(A)||A<=0||!finite(noiseLinearPower)||noiseLinearPower<0)return Number.NaN;
 const p=dn*dn-noiseLinearPower;return p>0?p/(A*A):Number.NaN;
}
function interpolate1d(xs:number[],ys:number[],x:number){
 if(!xs.length||xs.length!==ys.length)return Number.NaN;if(x<=xs[0])return Number(ys[0]);if(x>=xs[xs.length-1])return Number(ys[ys.length-1]);let lo=0,hi=xs.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(xs[m]<=x)lo=m;else hi=m}const a=Number(xs[lo]),b=Number(xs[hi]),va=Number(ys[lo]),vb=Number(ys[hi]);if(![a,b,va,vb].every(finite))return Number.NaN;return b===a?va:va+(vb-va)*(x-a)/(b-a);
}
export function materializeNoiseMapR343(r:SarRasterFieldR283,noise:SarNoiseModelR343|SarSparseLutR343){
 const model=('range'in noise)?noise:{range:noise,source:noise.source},n=expected(r),range=materializeSparseLutR343(r,model.range).values,out=new Array(n).fill(Number.NaN),mask=new Array(n).fill(0),sw=r.sampling?.sourceWidth||r.width,sh=r.sampling?.sourceHeight||r.height,blocks=model.azimuth||[];let validSamples=0;
 for(let y=0;y<r.height;y++)for(let x=0;x<r.width;x++){const i=y*r.width+x;if(!validAt(r,i)||!finite(range[i]))continue;const sx=r.width<=1?0:x*(sw-1)/(r.width-1),sy=r.height<=1?0:y*(sh-1)/(r.height-1);let az=1;if(blocks.length){const b=blocks.find(q=>sy>=q.firstAzimuthLine&&sy<=q.lastAzimuthLine&&sx>=q.firstRangeSample&&sx<=q.lastRangeSample);if(!b)continue;az=interpolate1d(b.lines,b.values,sy);if(!finite(az))continue}const v=range[i]*az;if(finite(v)&&v>=0){out[i]=v;mask[i]=1;validSamples++}}
 return{noiseLinearPower:out,validMask:mask,validSamples,rangeSource:model.range.source,source:model.source,azimuthBlocks:blocks.length,operator:blocks.length?'noise = interpolated range LUT × interpolated azimuth LUT':'noise = interpolated range LUT'};
}
export function materializeRadiometryR343(r:SarRasterFieldR283,cal:{beta0?:SarSparseLutR343;sigma0?:SarSparseLutR343;gamma0?:SarSparseLutR343},noise?:SarNoiseModelR343|SarSparseLutR343){
 const n=expected(r),src=r.nativeIntensity,beta0=new Array(n).fill(Number.NaN),sigma0=new Array(n).fill(Number.NaN),gamma0=new Array(n).fill(Number.NaN),mask=new Array(n).fill(0);
 if(!src?.length)return{beta0,sigma0,gamma0,validMask:mask,validSamples:0,calibrationBound:false};
 const b=cal.beta0?materializeSparseLutR343(r,cal.beta0).values:null,s=cal.sigma0?materializeSparseLutR343(r,cal.sigma0).values:null,g=cal.gamma0?materializeSparseLutR343(r,cal.gamma0).values:null,eta=noise?materializeNoiseMapR343(r,noise).noiseLinearPower:null;
 let validSamples=0;
 for(let i=0;i<n;i++){if(!validAt(r,i)||!finite(src[i]))continue;const q=finite(eta?.[i])?Number(eta![i]):0;if(b&&finite(b[i]))beta0[i]=calibratedPowerR343(src[i],b[i],q);if(s&&finite(s[i]))sigma0[i]=calibratedPowerR343(src[i],s[i],q);if(g&&finite(g[i]))gamma0[i]=calibratedPowerR343(src[i],g[i],q);if(finite(beta0[i])||finite(sigma0[i])||finite(gamma0[i])){mask[i]=1;validSamples++}}
 return{beta0,sigma0,gamma0,validMask:mask,validSamples,calibrationBound:validSamples>0};
}

export function coregistrationAdmittedR343(receipt?:SarCoregReceiptR343|null){
 if(!receipt)return false;
 return receipt.fullResolution===true&&receipt.burstGeometryBound===true&&receipt.orbitBound===true&&finite(receipt.azimuthResidualSamples)&&Math.abs(receipt.azimuthResidualSamples)<=0.001&&finite(receipt.rangeResidualSamples)&&finite(receipt.rangeThresholdSamples)&&receipt.rangeThresholdSamples>0&&Math.abs(receipt.rangeResidualSamples)<=receipt.rangeThresholdSamples;
}

function complexBilinear(r:SarRasterFieldR283,x:number,y:number){
 if(!r.complexI||!r.complexQ)return null;const x0=Math.floor(x),y0=Math.floor(y),x1=x0+1,y1=y0+1;if(x0<0||y0<0||x1>=r.width||y1>=r.height)return null;
 const tx=x-x0,ty=y-y0,pts=[[x0,y0,(1-tx)*(1-ty)],[x1,y0,tx*(1-ty)],[x0,y1,(1-tx)*ty],[x1,y1,tx*ty]];
 let I=0,Q=0,w=0;for(const[pX,pY,pW]of pts){const i=pY*r.width+pX;if(!validAt(r,i)||!finite(r.complexI[i])||!finite(r.complexQ[i]))continue;I+=r.complexI[i]*pW;Q+=r.complexQ[i]*pW;w+=pW}return w>.999?{I,Q}:null;
}
export function resampleComplexTranslationR343(slave:SarRasterFieldR283,rangeShiftSamples:number,azimuthShiftSamples:number){
 const n=expected(slave),I=new Array(n).fill(Number.NaN),Q=new Array(n).fill(Number.NaN),mask=new Array(n).fill(0);let validSamples=0;
 for(let y=0;y<slave.height;y++)for(let x=0;x<slave.width;x++){const i=y*slave.width+x,z=complexBilinear(slave,x+rangeShiftSamples,y+azimuthShiftSamples);if(z){I[i]=z.I;Q[i]=z.Q;mask[i]=1;validSamples++}}
 return{complexI:I,complexQ:Q,validMask:mask,validSamples,rangeShiftSamples,azimuthShiftSamples,resampler:'COMPLEX_BILINEAR_TRANSLATION_R343'};
}

export function deriveValidatedInterferogramR343(master:SarRasterFieldR283,slaveCoreg:SarRasterFieldR283,receipt:SarCoregReceiptR343,windowRadius=1){
 const n=expected(master),phase=new Array(n).fill(Number.NaN),coherence=new Array(n).fill(Number.NaN),mask=new Array(n).fill(0);
 if(master.width!==slaveCoreg.width||master.height!==slaveCoreg.height||!coregistrationAdmittedR343(receipt))return{phase,coherence,validMask:mask,validSamples:0,validated:false};
 let validSamples=0;
 const coherent=(x:number,y:number)=>{let re=0,im=0,p1=0,p2=0,k=0;for(let yy=Math.max(0,y-windowRadius);yy<=Math.min(master.height-1,y+windowRadius);yy++)for(let xx=Math.max(0,x-windowRadius);xx<=Math.min(master.width-1,x+windowRadius);xx++){const i=yy*master.width+xx;if(!validAt(master,i)||!validAt(slaveCoreg,i)||!finite(master.complexI?.[i])||!finite(master.complexQ?.[i])||!finite(slaveCoreg.complexI?.[i])||!finite(slaveCoreg.complexQ?.[i]))continue;const ai=Number(master.complexI![i]),aq=Number(master.complexQ![i]),bi=Number(slaveCoreg.complexI![i]),bq=Number(slaveCoreg.complexQ![i]);re+=ai*bi+aq*bq;im+=aq*bi-ai*bq;p1+=ai*ai+aq*aq;p2+=bi*bi+bq*bq;k++}const d=Math.sqrt(p1*p2);return k>=3&&d>0?clamp(Math.hypot(re,im)/d,0,1):Number.NaN};
 for(let y=0;y<master.height;y++)for(let x=0;x<master.width;x++){const i=y*master.width+x;if(!validAt(master,i)||!validAt(slaveCoreg,i))continue;const ai=Number(master.complexI?.[i]),aq=Number(master.complexQ?.[i]),bi=Number(slaveCoreg.complexI?.[i]),bq=Number(slaveCoreg.complexQ?.[i]);if(![ai,aq,bi,bq].every(finite))continue;phase[i]=Math.atan2(aq*bi-ai*bq,ai*bi+aq*bq);coherence[i]=coherent(x,y);mask[i]=1;validSamples++}
 return{phase,coherence,validMask:mask,validSamples,validated:validSamples>0};
}

export function subtractPhaseLedgerR343(phase:number[],ledger:SarCorrectionLedgerR343,mask?:number[]){
 const n=phase.length,out=new Array(n).fill(Number.NaN),validMask=new Array(n).fill(0),parts=[ledger.flatEarthPhaseRad,ledger.topographicPhaseRad,ledger.atmosphericPhaseRad,ledger.etadPhaseRad,ledger.otherPhaseRad].filter(Boolean)as number[][];
 let validSamples=0;
 for(let i=0;i<n;i++){if(mask&&Number(mask[i])<=0||ledger.validMask&&Number(ledger.validMask[i])<=0||!finite(phase[i]))continue;let v=phase[i],ok=true;for(const a of parts){if(a.length!==n||!finite(a[i])){ok=false;break}v-=a[i]}if(ok){out[i]=wrap(v);validMask[i]=1;validSamples++}}
 return{correctedWrappedPhaseRad:out,validMask,validSamples,correctionCount:parts.length,source:ledger.source};
}

function phaseResiduesR343(phase:number[],mask:number[],width:number,height:number){
 let count=0,sum2=0,n=0;for(let y=0;y<height-1;y++)for(let x=0;x<width-1;x++){const a=y*width+x,b=a+1,c=a+width+1,d=a+width;if(!mask[a]||!mask[b]||!mask[c]||!mask[d]||![phase[a],phase[b],phase[c],phase[d]].every(finite))continue;const closure=wrap(phase[b]-phase[a])+wrap(phase[c]-phase[b])+wrap(phase[d]-phase[c])+wrap(phase[a]-phase[d]);sum2+=closure*closure;n++;if(Math.abs(closure)>Math.PI)count++}return{count,rms:n?Math.sqrt(sum2/n):Infinity,cells:n};
}
export function unwrapQualityGuidedR343(wrapped:number[],quality:number[]|undefined,mask:number[],width:number,height:number,maxClosureRmsRad=.25):SarUnwrapReceiptR343{
 const n=width*height,out=new Array(n).fill(Number.NaN),componentId=new Array(n).fill(-1),validMask=new Array(n).fill(0),seen=new Array(n).fill(false);let component=0,largest=0;
 const q=(i:number)=>finite(quality?.[i])?Number(quality![i]):1;
 const neighbors=(i:number)=>{const x=i%width,y=Math.floor(i/width),a:number[]=[];if(x>0)a.push(i-1);if(x+1<width)a.push(i+1);if(y>0)a.push(i-width);if(y+1<height)a.push(i+width);return a};
 while(true){let seed=-1,best=-Infinity;for(let i=0;i<n;i++)if(!seen[i]&&mask[i]>0&&finite(wrapped[i])&&q(i)>best){seed=i;best=q(i)}if(seed<0)break;component++;out[seed]=wrapped[seed];seen[seed]=true;componentId[seed]=component;validMask[seed]=1;const frontier=[seed];let size=0;
  while(frontier.length){let pick=0;for(let j=1;j<frontier.length;j++)if(q(frontier[j])>q(frontier[pick]))pick=j;const i=frontier.splice(pick,1)[0];size++;for(const k of neighbors(i)){if(seen[k]||mask[k]<=0||!finite(wrapped[k]))continue;out[k]=out[i]+wrap(wrapped[k]-wrapped[i]);seen[k]=true;componentId[k]=component;validMask[k]=1;frontier.push(k)}}largest=Math.max(largest,size)}
 const residues=phaseResiduesR343(wrapped,mask,width,height),established=largest>0&&residues.rms<=maxClosureRmsRad;
 return{unwrappedPhaseRad:out,validMask,componentId,residueCount:residues.count,closureRmsRad:residues.rms,largestComponent:largest,expected:n,established,truthBoundary:'R343 quality-guided masked unwrapping preserves disconnected components and missing pixels. Establishment additionally requires an explicit closure threshold and does not infer across invalid gaps.'};
}

export function terrainFlattenGammaR343(gamma0:number[],localIncidenceDeg:number[],referenceIncidenceDeg:number[],mask?:number[]){
 const n=gamma0.length,out=new Array(n).fill(Number.NaN),validMask=new Array(n).fill(0);let validSamples=0;
 for(let i=0;i<n;i++){if(mask&&Number(mask[i])<=0||!finite(gamma0[i])||gamma0[i]<=0||!finite(localIncidenceDeg[i])||!finite(referenceIncidenceDeg[i]))continue;const li=localIncidenceDeg[i]*Math.PI/180,ri=referenceIncidenceDeg[i]*Math.PI/180,c=Math.cos(li),r=Math.cos(ri);if(c<=0||r<=0)continue;out[i]=gamma0[i]*r/c;validMask[i]=1;validSamples++}
 return{terrainFlattenedGamma0:out,validMask,validSamples,operator:'gamma0_terrain = gamma0_ellipsoid * cos(referenceIncidence)/cos(localIncidence)'};
}

export function materializeLosR343(unwrappedCorrectedPhaseRad:number[],wavelengthM:number,sign:1|-1,mask?:number[]){
 const n=unwrappedCorrectedPhaseRad.length,out=new Array(n).fill(Number.NaN),validMask=new Array(n).fill(0);let validSamples=0;if(!finite(wavelengthM)||wavelengthM<=0)return{losDisplacementM:out,validMask,validSamples};
 for(let i=0;i<n;i++){if(mask&&Number(mask[i])<=0||!finite(unwrappedCorrectedPhaseRad[i]))continue;out[i]=sign*wavelengthM*unwrappedCorrectedPhaseRad[i]/(4*Math.PI);validMask[i]=1;validSamples++}return{losDisplacementM:out,validMask,validSamples};
}

export function applyDisplacementCorrectionsR343(los:number[],correctionsM:number[][],mask?:number[]){
 const n=los.length,out=new Array(n).fill(Number.NaN),validMask=new Array(n).fill(0);let validSamples=0;for(let i=0;i<n;i++){if(mask&&Number(mask[i])<=0||!finite(los[i]))continue;let v=los[i],ok=true;for(const a of correctionsM){if(a.length!==n||!finite(a[i])){ok=false;break}v-=a[i]}if(ok){out[i]=v;validMask[i]=1;validSamples++}}return{correctedLosDisplacementM:out,validMask,validSamples,correctionCount:correctionsM.length};
}

export function closeSarPhysicalChainR343(input:{
 master:SarRasterFieldR283;slave?:SarRasterFieldR283;coregisteredSlave?:SarRasterFieldR283;coregReceipt?:SarCoregReceiptR343;
 calibration?:{beta0?:SarSparseLutR343;sigma0?:SarSparseLutR343;gamma0?:SarSparseLutR343};noise?:SarNoiseModelR343|SarSparseLutR343;
 localIncidenceDeg?:number[];referenceIncidenceDeg?:number[];correctionLedger?:SarCorrectionLedgerR343;
 wavelengthM?:number;losSign?:1|-1;unwrapClosureRmsMax?:number;
}):SarPhysicalClosureR343{
 let r={...input.master},proof:string[]=[],scars:string[]=[];
 let calibrationBound=false,terrainFlattenedBound=false,coregistrationBound=false,interferometricPhaseValidated=false,unwrappedPhaseBound=false,correctionLedgerBound=false,losDisplacementBound=false;
 if(input.calibration){const rad=materializeRadiometryR343(r,input.calibration,input.noise);if(rad.calibrationBound){r={...r,beta0:rad.beta0,sigma0:rad.sigma0,gamma0:rad.gamma0,calibrationR343:{schema:SAR_PHYSICAL_CLOSURE_SCHEMA_R343,source:[input.calibration.beta0?.source,input.calibration.sigma0?.source,input.calibration.gamma0?.source,input.noise?.source].filter(Boolean)as string[],validSamples:rad.validSamples}} as SarRasterFieldR283;calibrationBound=true;proof.push('RADIOMETRY_BOUND')}else scars.push('CALIBRATION_MATERIALIZATION_EMPTY')}else scars.push('CALIBRATION_ANNOTATION_REQUIRED');
 if(calibrationBound&&arrayBound((r as any).gamma0,expected(r))&&input.localIncidenceDeg?.length===expected(r)&&input.referenceIncidenceDeg?.length===expected(r)){const tf=terrainFlattenGammaR343((r as any).gamma0,input.localIncidenceDeg,input.referenceIncidenceDeg,r.validMask);if(tf.validSamples){r={...r,terrainFlattenedGamma0:tf.terrainFlattenedGamma0} as SarRasterFieldR283;terrainFlattenedBound=true;proof.push('TERRAIN_FLATTENED_GAMMA0_BOUND')}}else scars.push('DEM_LOCAL_GEOMETRY_REQUIRED');
 coregistrationBound=coregistrationAdmittedR343(input.coregReceipt);if(coregistrationBound)proof.push('TOPS_COREGISTRATION_BOUND');else scars.push('SUBPIXEL_COREGISTRATION_NOT_PROVEN');
 if(input.slave&&input.coregisteredSlave&&input.coregReceipt&&coregistrationBound){const ig=deriveValidatedInterferogramR343(r,input.coregisteredSlave,input.coregReceipt);if(ig.validated){r={...r,interferogramPhaseRad:ig.phase,coherence:ig.coherence,validMask:ig.validMask} as SarRasterFieldR283;interferometricPhaseValidated=true;proof.push('INTERFEROMETRIC_PHASE_VALIDATED')}}else scars.push('PHASE_VALIDITY_REQUIRES_COREGISTRATION');
 let wrapped=r.interferogramPhaseRad,phaseMask=r.validMask;
 if(interferometricPhaseValidated&&wrapped&&input.correctionLedger){const corrected=subtractPhaseLedgerR343(wrapped,input.correctionLedger,phaseMask);if(corrected.validSamples){wrapped=corrected.correctedWrappedPhaseRad;phaseMask=corrected.validMask;r={...r,correctedInterferometricPhaseRad:wrapped}as SarRasterFieldR283;correctionLedgerBound=true;proof.push('PHASE_CORRECTION_LEDGER_BOUND')}}else scars.push('PHASE_CORRECTION_LEDGER_REQUIRED');
 if(interferometricPhaseValidated&&wrapped&&phaseMask){const uw=unwrapQualityGuidedR343(wrapped,r.coherence,phaseMask,r.width,r.height,input.unwrapClosureRmsMax??.25);r={...r,unwrappedPhaseRad:uw.unwrappedPhaseRad,unwrapComponentId:uw.componentId}as SarRasterFieldR283;if(uw.established){unwrappedPhaseBound=true;proof.push('UNWRAP_CLOSURE_BOUND')}else scars.push('UNWRAP_CLOSURE_NOT_PROVEN')}else scars.push('UNWRAP_INPUT_REQUIRED');
 if(unwrappedPhaseBound&&finite(input.wavelengthM)&&input.losSign){const los=materializeLosR343((r as any).unwrappedPhaseRad,input.wavelengthM,input.losSign,phaseMask);if(los.validSamples){r={...r,losDisplacementM:los.losDisplacementM}as SarRasterFieldR283;losDisplacementBound=true;proof.push('LOS_DISPLACEMENT_BOUND')}}else scars.push('WAVELENGTH_SIGN_RESIDUAL_CHAIN_REQUIRED');
 return{raster:r,coregistrationBound,interferometricPhaseValidated,calibrationBound,terrainFlattenedBound,unwrappedPhaseBound,correctionLedgerBound,losDisplacementBound,proof:[...new Set(proof)],scars:[...new Set(scars)],truthBoundary:'R343 executes the full evidence-gated SAR closure graph. Computational availability never substitutes for missing Sentinel-1 annotation, full-resolution TOPS residual, DEM geometry, correction, unwrap-closure, wavelength/sign, or independent-geometry evidence.'};
}

import type{SarObservationR280}from'./sarTruthR280';
import type{SarRasterFieldR283}from'./sarRasterR283';
import type{SarViewR325}from'./sarFieldPlanR325';

export const SAR_FIELD_DERIVATION_SCHEMA_R336='OMEGA_SAR_FIELD_DERIVATION_R336';

export type SarFieldStateR336=
 |'UNBOUND'|'SOURCE_BOUND'|'COMPUTABLE'|'DERIVED'|'VALIDATED'|'DISPLAYABLE'
 |'DEPENDENCY_MISSING'|'UNAVAILABLE_FROM_PRODUCT'|'PARTIAL'|'INVALIDATED'|'NOT_APPLICABLE';

export type SarFieldEvidenceR336=
 |'OBSERVED_NATIVE'|'OBSERVED_CALIBRATED'|'DERIVED_MEASUREMENT'|'DERIVED_RELATIONAL'
 |'DERIVED_TEMPORAL'|'DERIVED_DIAGNOSTIC'|'EXTERNAL_OBSERVED'|'PROOF'|'UNBOUND';

export interface SarFieldResultR336{
 view:SarViewR325;
 state:SarFieldStateR336;
 evidenceClass:SarFieldEvidenceR336;
 field:string|null;
 units:string;
 actual:number;
 expected:number;
 coverage:number;
 calibrated:boolean;
 operator:string;
 formula:string;
 dependencies:string[];
 missing:string[];
 interpretation:string;
}

const VIEWS:SarViewR325[]=['SOURCE','AMPLITUDE','PHASE','COHERENCE','INTERFEROGRAM','DEFORMATION','ELEVATION','POLARIMETRY','MULTI_BAND','TIME_STACK','SCAR_UNCERTAINTY','PROOF'];
const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
const has=(a?:number[])=>!!a?.some(finite);
const count=(a:number[]|undefined,mask:number[]|undefined)=>a?.reduce((n,v,i)=>n+(finite(v)&&(!mask||Number(mask[i])>0)?1:0),0)||0;
const cov=(a:number[]|undefined,r:SarRasterFieldR283,mask=r.validMask)=>{const expected=Math.max(0,r.width*r.height),actual=count(a,mask);return{actual,expected,coverage:expected?actual/expected:0}};
const result=(view:SarViewR325,state:SarFieldStateR336,evidenceClass:SarFieldEvidenceR336,field:string|null,units:string,r:SarRasterFieldR283|undefined,a:number[]|undefined,calibrated:boolean,operator:string,formula:string,dependencies:string[],missing:string[],interpretation:string,mask?:number[]):SarFieldResultR336=>{
 const c=r?cov(a,r,mask):{actual:0,expected:0,coverage:0};
 return{view,state,evidenceClass,field,units,...c,calibrated,operator,formula,dependencies,missing,interpretation};
};

export function materializeSarSafeDerivationsR336(obs:SarObservationR280,raster?:SarRasterFieldR283):SarRasterFieldR283|undefined{
 if(!raster)return raster;
 const expected=Math.max(0,raster.width*raster.height);
 const native=raster.nativeIntensity;
 const mask=(raster.validMask?.length===expected?raster.validMask:Array.from({length:expected},(_,i)=>finite(native?.[i])?1:0)).map(v=>Number(v)>0?1:0);
 const scarBurden=raster.scarBurden?.length===expected?raster.scarBurden:mask.map(v=>v>0?0:1);
 const proofCoverage=raster.proofCoverage?.length===expected?raster.proofCoverage:mask.map((v,i)=>v>0&&finite(native?.[i])?1:0);
 return{...raster,validMask:mask,scarBurden,proofCoverage,derivationR336:{
  schema:SAR_FIELD_DERIVATION_SCHEMA_R336,
  sourceId:obs.provenance.sourceId,
  evidenceClass:'OBSERVED_NATIVE',
  operators:['VALID_MASK_TO_SCAR_BURDEN','VALID_NATIVE_SAMPLE_TO_PROOF_COVERAGE'],
  truthBoundary:'R336 materializes only evidence diagnostics from already-bound source samples. It does not invent radiometric calibration, phase, coherence, interferograms, deformation, elevation, polarimetry, multi-band measurements, or time-series observations.'
 }};
}

export function resolveSarFieldR336(obs:SarObservationR280,r0:SarRasterFieldR283|undefined,view:SarViewR325):SarFieldResultR336{
 const r=materializeSarSafeDerivationsR336(obs,r0),p=obs.provenance.processingParameters||{},calibrated=!!obs.calibration||['OBSERVED_CALIBRATED','CORRECTED','GEOCODED','FUSED','ASSIMILATED'].includes(obs.truth);
 if(!r)return result(view,'UNBOUND','UNBOUND',null,'',undefined,undefined,false,'none','none',[],['NATIVE_DATA_UNBOUND'],'No decoded measurement raster is bound.');

 if(view==='SOURCE'){
  if(has(r.nativeIntensity))return result(view,'DISPLAYABLE','OBSERVED_NATIVE','nativeIntensity',r.sourceUnits||'NATIVE_DN',r,r.nativeIntensity,false,'exact native raster decode','source sample = decoded native sample',[],[],'Exact decoded source samples with the native validity mask.',r.validMask);
  if(has(r.amplitudeDb))return result(view,'DISPLAYABLE',calibrated?'OBSERVED_CALIBRATED':'OBSERVED_NATIVE','amplitudeDb','dB',r,r.amplitudeDb,calibrated,'source field pass-through','source = bound amplitude field',[],[],'Bound source field; evidence class is inherited from its calibration state.');
 }
 if(view==='AMPLITUDE'){
  if(has(r.amplitudeDb))return result(view,'DISPLAYABLE',calibrated?'OBSERVED_CALIBRATED':'DERIVED_MEASUREMENT','amplitudeDb','dB',r,r.amplitudeDb,calibrated,'declared radiometric amplitude/backscatter field','display = normalized bound amplitudeDb',['native raster','radiometric calibration/declared units'],[],calibrated?'Radiometrically declared amplitude/backscatter field.':'A bound amplitude array is present but calibration authority is not declared.');
  if(has(r.nativeIntensity))return result(view,'DISPLAYABLE','OBSERVED_NATIVE','nativeIntensity',r.sourceUnits||'NATIVE_DN',r,r.nativeIntensity,false,'native intensity amplitude lens','display = normalized log1p(native DN)',['native raster'],['RADIOMETRIC_CALIBRATION_UNBOUND'],'Real decoded GRD intensity is shown as native DN only. It is not sigma0/gamma0 and is not promoted to calibrated backscatter.',r.validMask);
 }
 if(view==='PHASE'){
  if(has(r.phaseRad))return result(view,'DISPLAYABLE',obs.complexDataBound?'OBSERVED_NATIVE':'DERIVED_MEASUREMENT','phaseRad','rad',r,r.phaseRad,false,'complex phase extraction','phase = atan2(Q,I)',['SLC complex I/Q'],[], 'Bound phase radians from a declared complex-data path.');
  const productBlock=obs.productLevel==='GRD';
  return result(view,productBlock?'UNAVAILABLE_FROM_PRODUCT':'DEPENDENCY_MISSING','UNBOUND',null,'rad',r,undefined,false,'complex phase extraction','phase = atan2(Q,I)',['SLC complex I/Q'],[productBlock?'GRD_HAS_NO_COMPLEX_PHASE':'SLC_COMPLEX_IQ_REQUIRED'],productBlock?'GRD intensity cannot reconstruct phase; select and decode SLC complex I/Q.':'Decode SLC complex I/Q before phase can be calculated.');
 }
 if(view==='COHERENCE'){
  if(has(r.coherence))return result(view,'DISPLAYABLE','DERIVED_MEASUREMENT','coherence','unitless',r,r.coherence,false,'normalized complex cross-correlation','gamma = |sum(s1*conj(s2))| / sqrt(sum|s1|^2 sum|s2|^2)',['proven identical sampled complex grid','coherence window','TOPS subpixel coregistration proof for physical interferometry'],[],'Exact-grid normalized complex correlation. It is displayable as a candidate pair statistic, but physical interferometric coherence remains held until TOPS subpixel coregistration is independently proved.');
  return result(view,obs.productLevel==='GRD'?'UNAVAILABLE_FROM_PRODUCT':'DEPENDENCY_MISSING','UNBOUND',null,'unitless',r,undefined,false,'normalized complex cross-correlation','gamma = normalized complex correlation',['co-registered SLC pair','common geometry','coherence window'],['SECOND_COMPLEX_ACQUISITION_REQUIRED'],'Coherence requires two compatible complex observations; a single GRD scene cannot supply it.');
 }
 if(view==='INTERFEROGRAM'){
  if(has(r.interferogramPhaseRad))return result(view,'DISPLAYABLE','DERIVED_MEASUREMENT','interferogramPhaseRad','rad',r,r.interferogramPhaseRad,false,'complex conjugate product','I = master * conj(slave); wrapped phase = arg(I)',['proven identical sampled complex grid','complex SLC pair','TOPS subpixel coregistration proof for physical interferometry'],[],'Exact-grid wrapped cross-phase derived from two complex source rasters. It is not promoted to physically valid Sentinel-1 TOPS interferometric phase until subpixel coregistration is proved.');
  return result(view,obs.productLevel==='GRD'?'UNAVAILABLE_FROM_PRODUCT':'DEPENDENCY_MISSING','UNBOUND',null,'rad',r,undefined,false,'complex conjugate product','I = master * conj(slave)',['co-registered SLC pair','wrapped phase difference'],['COMPATIBLE_SLC_PAIR_REQUIRED'],'An interferogram is a pair-derived field and is not synthesized from single-scene intensity.');
 }
 if(view==='DEFORMATION'){
  if(has(r.losDisplacementM))return result(view,'DISPLAYABLE','DERIVED_MEASUREMENT','losDisplacementM','m',r,r.losDisplacementM,false,'phase-to-LOS after residual handling','d_LOS = -(lambda * phi_unwrapped)/(4*pi)',['unwrapped interferometric phase','orbit correction','topographic phase removal','atmospheric handling','sign convention'],[],'Metric LOS displacement with required residual handling declared upstream.');
  const ready=p.unwrappedPhaseBound===true&&p.topographyHandled===true&&p.orbitHandled===true&&p.atmosphereHandled===true;
  return result(view,ready?'COMPUTABLE':obs.productLevel==='GRD'?'UNAVAILABLE_FROM_PRODUCT':'DEPENDENCY_MISSING','UNBOUND',null,'m',r,undefined,false,'phase-to-LOS after residual handling','d_LOS = -(lambda * phi_unwrapped)/(4*pi)',['unwrapped interferometric phase','orbit correction','topographic phase removal','atmospheric handling','sign convention'],ready?['LOS_ARRAY_NOT_MATERIALIZED']:['INTERFEROMETRIC_RESIDUAL_LEDGER_INCOMPLETE'],'Metric deformation remains gated until the corrected unwrapped phase path is complete and materialized.');
 }
 if(view==='ELEVATION'){
  if(has(r.elevationM))return result(view,'DISPLAYABLE','EXTERNAL_OBSERVED','elevationM','m',r,r.elevationM,false,'declared DEM/elevation binding','elevation = bound vertical-reference field',['DEM or admitted InSAR elevation product','vertical datum'],[],'Bound elevation field with a separately declared vertical reference.');
  return result(view,'DEPENDENCY_MISSING','UNBOUND',null,'m',r,undefined,false,'DEM/elevation binding','none',['authoritative DEM or admitted InSAR elevation product','vertical datum'],['ELEVATION_SOURCE_REQUIRED'],'Elevation is a separate observation/derived source and is not inferred from GRD brightness.');
 }
 if(view==='POLARIMETRY'){
  if(has(r.polarimetricPower))return result(view,'DISPLAYABLE','DERIVED_MEASUREMENT','polarimetricPower','declared relative power',r,r.polarimetricPower,calibrated,'polarimetric channel combination','declared calibrated channel operator',['calibrated dual/quad polarization channels','common geometry'],[],'Bound polarimetric field from multiple declared channels.');
  return result(view,['DUAL','QUAD'].includes(obs.polarization)?'COMPUTABLE':'DEPENDENCY_MISSING','UNBOUND',null,'',r,undefined,false,'polarimetric channel combination','declared calibrated channel operator',['calibrated dual/quad polarization channels','common geometry'],['POLARIMETRIC_CHANNEL_ARRAYS_REQUIRED'],'Polarimetry requires the actual calibrated channel arrays, not only a catalogue polarization label.');
 }
 if(view==='MULTI_BAND'){
  if(has(r.multiBandRelative))return result(view,'DISPLAYABLE','DERIVED_RELATIONAL','multiBandRelative','relative',r,r.multiBandRelative,false,'cross-band frame comparison','delta = normalized bandB - normalized bandA',['two or more physical radar bands','common frame/normalization'],[],'Bound cross-band relational field.');
  return result(view,'DEPENDENCY_MISSING','UNBOUND',null,'relative',r,undefined,false,'cross-band frame comparison','delta = normalized bandB - normalized bandA',['two or more physical radar bands','common frame/normalization'],['SECOND_RADAR_BAND_REQUIRED'],'A different polarization is not a different wavelength band.');
 }
 if(view==='TIME_STACK'){
  if(has(r.timeStackRelative))return result(view,'DISPLAYABLE','DERIVED_TEMPORAL','timeStackRelative','ln amplitude ratio',r,r.timeStackRelative,false,'two-epoch complex amplitude change','ln(|slave|/|master|), defined only for positive finite amplitudes',['two complex acquisitions','proven identical sampled grid','epoch ordering','positive finite amplitudes'],[],'Scale-invariant two-epoch log-amplitude ratio on the exact sampled grid; this is temporal change, not deformation.');
  return result(view,Number(p.timeStackCount)>=2?'COMPUTABLE':'DEPENDENCY_MISSING','UNBOUND',null,'relative',r,undefined,false,'registered temporal stack','value = declared multi-epoch stack operator',['multiple acquisitions','common grid','epoch ordering','declared time-stack array'],['MULTI_EPOCH_ARRAY_REQUIRED'],'A time stack cannot reuse a single-scene raster.');
 }
 if(view==='SCAR_UNCERTAINTY'){
  if(has(r.uncertainty))return result(view,'DISPLAYABLE','DERIVED_DIAGNOSTIC','uncertainty','normalized',r,r.uncertainty,false,'declared uncertainty field','declared upstream uncertainty model',['quality/mask/residual evidence','declared uncertainty mapping'],[],'Declared uncertainty field.');
  if(has(r.scarBurden))return result(view,'DISPLAYABLE','DERIVED_DIAGNOSTIC','scarBurden','binary missingness burden',r,r.scarBurden,false,'validity-mask scar projection','scar = 0 for valid source sample; 1 for missing/invalid source sample',['native validity mask'],['PHYSICAL_UNCERTAINTY_MODEL_UNBOUND'],'Exact source-validity scar/missingness burden. This is not a physical measurement-uncertainty estimate.',undefined);
 }
 if(view==='PROOF'){
  if(has(r.quality))return result(view,'DISPLAYABLE','PROOF','quality','normalized',r,r.quality,false,'declared quality/proof field','declared upstream quality mapping',['source identity','provenance','field coverage','processing lineage'],[],'Bound proof/quality field.');
  if(has(r.proofCoverage))return result(view,'DISPLAYABLE','PROOF','proofCoverage','binary evidence coverage',r,r.proofCoverage,false,'native evidence coverage projection','proof = 1 only where an exact finite native sample is valid',['source identity','native validity mask','decoded finite sample'],[],'Per-cell evidence coverage derived directly from the native validity mask and finite decoded samples.',undefined);
 }
 return result(view,'DEPENDENCY_MISSING','UNBOUND',null,'',r,undefined,false,'none','none',[],['FIELD_NOT_MATERIALIZED'],'The requested field is not materialized from the currently bound evidence.');
}

export function resolveAllSarFieldsR336(obs:SarObservationR280,r?:SarRasterFieldR283){
 return VIEWS.map(view=>resolveSarFieldR336(obs,r,view));
}

export function sarDerivationTruthBoundaryR336(){
 return'R336/R341 resolves each analytical lens through an explicit evidence/dependency graph. Native GRD intensity may be displayed as native DN in the AMPLITUDE lens but is never promoted to calibrated sigma0/gamma0. R341 exact-grid pair statistics do not establish Sentinel-1 TOPS subpixel coregistration or phase-valid interferometry. GRD cannot recreate complex phase, coherence, interferograms, or deformation. Scar and proof projections derived from the validity mask are diagnostics of evidence coverage, not physical uncertainty.';
}

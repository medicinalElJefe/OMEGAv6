export const SAR_ESTABLISHMENT_SCHEMA_R342='OMEGA_SAR_ESTABLISHMENT_R342_20736D';
export const SAR_ESTABLISHMENT_CARDINALITY_R342=12**4;
export const S1_TOPS_AZIMUTH_COREG_TARGET_SAMPLES_R342=0.001;

export const SAR_R342_AUTHORITIES=Object.freeze({
 sentinel1ProductSpecification:'https://sentiwiki.copernicus.eu/__attachments/1673968/S1-RS-MDA-52-7441-Sentinel-1-Product-Specification-2025-3.16.3.pdf',
 sentinel1Processing:'https://sentiwiki.copernicus.eu/web/s1-processing',
 sentinel1Etad:'https://sentiwiki.copernicus.eu/web/s1-products'
});

export const SAR_EVIDENCE_AXIS_R342=[
 'SOURCE_IDENTITY','NATIVE_DN','COMPLEX_IQ','PAIR_METADATA','COMMON_POLARIZATION','SAMPLED_GRID',
 'BURST_GEOMETRY','PRECISE_ORBIT','CALIBRATION_LUT','NOISE_LUT','DEM_GEOMETRY','ETAD_AUXILIARY'
]as const;
export const SAR_TRANSFORM_AXIS_R342=[
 'DECODE','VALIDITY_MASK','COMPLEX_PHASE','PAIR_CROSS_PRODUCT','NORMALIZED_CORRELATION','RADIOMETRIC_CALIBRATION',
 'NOISE_REMOVAL','TOPS_COREGISTRATION','TOPOGRAPHIC_CORRECTION','PHASE_UNWRAP','RESIDUAL_CORRECTION','LOS_OR_3D_INVERSION'
]as const;
export const SAR_PROOF_AXIS_R342=[
 'SOURCE_BOUND','HASH_BOUND','GRID_PROVEN','SAME_POLARIZATION','CALIBRATION_PROVEN','COREG_RESIDUAL_PROVEN',
 'UNWRAP_CLOSURE_PROVEN','DEM_PROVEN','ATMOSPHERE_PROVEN','SIGN_CONVENTION_PROVEN','UNCERTAINTY_PROPAGATED','PROMOTION_READY'
]as const;
export const SAR_SURFACE_AXIS_R342=[
 'INGRESS','SOURCE_LENS','AMPLITUDE_LENS','PHASE_LENS','COHERENCE_LENS','INTERFEROGRAM_LENS',
 'TIME_STACK_LENS','DEFORMATION_LENS','ELEVATION_LENS','SCAR_LENS','PROOF_LENS','LEDGER_EXPORT'
]as const;

export type SarEstablishmentStateR342='ESTABLISHED'|'COMPUTABLE'|'HELD'|'NOT_DERIVABLE_FROM_SINGLE_LOS';
export type SarLayerIdR342=
 |'EXACT_ACQUISITION'|'NATIVE_GRD'|'NATIVE_SLC_IQ'|'COMPATIBLE_PAIR_METADATA'|'SAME_POLARIZATION'
 |'SAMPLED_GRID_IDENTITY'|'PAIR_CROSS_PRODUCT'|'NORMALIZED_CORRELATION'|'TOPS_SUBPIXEL_COREGISTRATION'
 |'PHYSICALLY_VALID_INTERFEROMETRIC_PHASE'|'RADIOMETRIC_BACKSCATTER'|'TERRAIN_FLATTENED_GAMMA0'
 |'UNWRAPPED_PHASE'|'LOS_DISPLACEMENT'|'CORRECTED_LOS'|'FULL_3D_DEFORMATION';

export interface SarEstablishmentEvidenceR342{
 sourceIdentityBound?:boolean; provenanceHashBound?:boolean; nativeGrdBound?:boolean; nativeSlcIqBound?:boolean;
 pairMetadataBound?:boolean; commonPolarizationBound?:boolean; sampledGridIdentityBound?:boolean; crossProductBound?:boolean;
 normalizedCorrelationBound?:boolean; burstGeometryBound?:boolean; preciseOrbitBound?:boolean;
 coregResidualAzimuthSamples?:number|null; coregResidualRangeSamples?:number|null; coregRangeToleranceSamples?:number|null;
 wrappedInterferometricPhaseBound?:boolean; calibrationAnnotationBound?:boolean; calibrationLutBound?:boolean; noiseLutBound?:boolean;
 calibratedBackscatterBound?:boolean; demBound?:boolean; localIncidenceBound?:boolean; rtcOperatorBound?:boolean;
 terrainFlattenedGamma0Bound?:boolean; unwrappedPhaseBound?:boolean; unwrapClosureBound?:boolean;
 topographicCorrectionBound?:boolean; orbitCorrectionBound?:boolean; atmosphericCorrectionBound?:boolean;
 correctedUnwrappedPhaseBound?:boolean; wavelengthBound?:boolean; signConventionBound?:boolean; losDisplacementBound?:boolean;
 correctedLosBound?:boolean; losGeometryCount?:number; losGeometryRank?:number; gnssConstraintBound?:boolean; deformation3dBound?:boolean;
 uncertaintyPropagated?:boolean;
}

export interface SarLayerEstablishmentR342{
 layer:SarLayerIdR342; state:SarEstablishmentStateR342; dependencies:string[]; missing:string[];
 operator:string; proofGate:string; scarCarry:string[]; next:string; machineAction:'RETAIN'|'COMPUTE'|'PROVE'|'ACQUIRE_OR_LEAVE_OPEN';
 truthBoundary:string;
}

export interface Sar20736AddressR342{
 index:number; address:string; evidenceIndex:number; transformIndex:number; proofIndex:number; surfaceIndex:number;
 evidence:(typeof SAR_EVIDENCE_AXIS_R342)[number]; transform:(typeof SAR_TRANSFORM_AXIS_R342)[number];
 proof:(typeof SAR_PROOF_AXIS_R342)[number]; surface:(typeof SAR_SURFACE_AXIS_R342)[number];
}

const ok=(x:unknown)=>x===true;
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const held=(layer:SarLayerIdR342,dependencies:string[],missing:string[],operator:string,proofGate:string,next:string,truthBoundary:string):SarLayerEstablishmentR342=>({
 layer,state:'HELD',dependencies,missing,operator,proofGate,scarCarry:[...missing],next,machineAction:missing.length?'ACQUIRE_OR_LEAVE_OPEN':'PROVE',truthBoundary
});
const established=(layer:SarLayerIdR342,dependencies:string[],operator:string,proofGate:string,truthBoundary:string):SarLayerEstablishmentR342=>({
 layer,state:'ESTABLISHED',dependencies,missing:[],operator,proofGate,scarCarry:[],next:'retain provenance + residuals; admit downstream computation',machineAction:'RETAIN',truthBoundary
});

export function sar20736AddressR342(index:number):Sar20736AddressR342{
 if(!Number.isInteger(index)||index<0||index>=SAR_ESTABLISHMENT_CARDINALITY_R342)throw new RangeError('R342_ADDRESS_OUT_OF_RANGE');
 let q=index;
 const surfaceIndex=q%12;q=Math.floor(q/12);
 const proofIndex=q%12;q=Math.floor(q/12);
 const transformIndex=q%12;q=Math.floor(q/12);
 const evidenceIndex=q%12;
 return{index,address:`${evidenceIndex.toString(12).toUpperCase()}-${transformIndex.toString(12).toUpperCase()}-${proofIndex.toString(12).toUpperCase()}-${surfaceIndex.toString(12).toUpperCase()}`,evidenceIndex,transformIndex,proofIndex,surfaceIndex,
  evidence:SAR_EVIDENCE_AXIS_R342[evidenceIndex],transform:SAR_TRANSFORM_AXIS_R342[transformIndex],proof:SAR_PROOF_AXIS_R342[proofIndex],surface:SAR_SURFACE_AXIS_R342[surfaceIndex]};
}
export function sar20736IndexR342(evidenceIndex:number,transformIndex:number,proofIndex:number,surfaceIndex:number){
 for(const v of[evidenceIndex,transformIndex,proofIndex,surfaceIndex])if(!Number.isInteger(v)||v<0||v>11)throw new RangeError('R342_AXIS_OUT_OF_RANGE');
 return(((evidenceIndex*12)+transformIndex)*12+proofIndex)*12+surfaceIndex;
}

export function evaluateSarEstablishmentR342(e:SarEstablishmentEvidenceR342):SarLayerEstablishmentR342[]{
 const azCoreg=finite(e.coregResidualAzimuthSamples)&&e.coregResidualAzimuthSamples<=S1_TOPS_AZIMUTH_COREG_TARGET_SAMPLES_R342;
 const rangeTol=finite(e.coregRangeToleranceSamples)?Math.max(0,e.coregRangeToleranceSamples):null;
 const rgCoreg=finite(e.coregResidualRangeSamples)&&rangeTol!=null&&e.coregResidualRangeSamples<=rangeTol;
 const coreg=ok(e.burstGeometryBound)&&ok(e.preciseOrbitBound)&&azCoreg&&rgCoreg;
 const phaseValid=coreg&&ok(e.wrappedInterferometricPhaseBound);
 const radiometry=ok(e.calibrationAnnotationBound)&&ok(e.calibrationLutBound)&&ok(e.calibratedBackscatterBound);
 const rtc=radiometry&&ok(e.demBound)&&ok(e.localIncidenceBound)&&ok(e.rtcOperatorBound)&&ok(e.terrainFlattenedGamma0Bound);
 const unwrap=phaseValid&&ok(e.unwrappedPhaseBound)&&ok(e.unwrapClosureBound);
 const corrected=unwrap&&ok(e.topographicCorrectionBound)&&ok(e.orbitCorrectionBound)&&ok(e.atmosphericCorrectionBound)&&ok(e.correctedUnwrappedPhaseBound);
 const los=corrected&&ok(e.wavelengthBound)&&ok(e.signConventionBound)&&ok(e.losDisplacementBound);
 const correctedLos=los&&ok(e.correctedLosBound);
 const rank3=Number(e.losGeometryCount||0)>=3&&Number(e.losGeometryRank||0)>=3;
 const full3d=correctedLos&&rank3&&ok(e.deformation3dBound);
 const rows:SarLayerEstablishmentR342[]=[];
 rows.push(ok(e.sourceIdentityBound)&&ok(e.provenanceHashBound)?established('EXACT_ACQUISITION',['catalogue identity','exact provenance/hash'],'identity + provenance binding','SOURCE_BOUND + HASH_BOUND','Acquisition identity is evidential, not inferred from pixels.'):held('EXACT_ACQUISITION',['catalogue identity','exact provenance/hash'],[!ok(e.sourceIdentityBound)?'SOURCE_IDENTITY_REQUIRED':'',!ok(e.provenanceHashBound)?'PROVENANCE_HASH_REQUIRED':''].filter(Boolean),'identity + provenance binding','SOURCE_BOUND + HASH_BOUND','bind source identity and exact provenance','Never synthesize source identity.'));
 rows.push(ok(e.nativeGrdBound)?established('NATIVE_GRD',['decoded GRD measurement bytes'],'lossless/native raster decode','FINITE_SAMPLE + VALID_MASK','Native GRD values retain native units until calibration.'):held('NATIVE_GRD',['decoded GRD measurement bytes'],['NATIVE_GRD_DECODE_REQUIRED'],'native raster decode','FINITE_SAMPLE + VALID_MASK','decode exact measurement asset','Catalogue discovery is not pixel evidence.'));
 rows.push(ok(e.nativeSlcIqBound)?established('NATIVE_SLC_IQ',['decoded complex SLC I/Q'],'complex raster decode','FINITE_IQ + SOURCE_PHASE_SEPARATION','Native source phase remains distinct from pair phase.'):held('NATIVE_SLC_IQ',['decoded complex SLC I/Q'],['COMPLEX_SLC_IQ_REQUIRED'],'complex raster decode','FINITE_IQ + SOURCE_PHASE_SEPARATION','decode exact complex SLC asset','GRD cannot recreate SLC phase.'));
 rows.push(ok(e.pairMetadataBound)?established('COMPATIBLE_PAIR_METADATA',['distinct SLC acquisitions','mode/orbit/time/overlap compatibility'],'metadata pair planner','PAIR_METADATA_GATE','Metadata compatibility is necessary but not co-registration.'):held('COMPATIBLE_PAIR_METADATA',['distinct SLC acquisitions'],['COMPATIBLE_REPEAT_PASS_PAIR_REQUIRED'],'metadata pair planner','PAIR_METADATA_GATE','select compatible repeat-pass acquisition','Metadata cannot prove phase registration.'));
 rows.push(ok(e.commonPolarizationBound)?established('SAME_POLARIZATION',['matching measurement channel'],'exact polarization asset match','COMMON_POLARIZATION_ASSET_REQUIRED','Cross-polarization interferometry remains rejected.'):held('SAME_POLARIZATION',['matching measurement channel'],['COMMON_POLARIZATION_ASSET_REQUIRED'],'exact polarization asset match','COMMON_POLARIZATION_ASSET_REQUIRED','bind same VV/VH/HH/HV asset','A polarization label without exact asset identity is insufficient.'));
 rows.push(ok(e.sampledGridIdentityBound)?established('SAMPLED_GRID_IDENTITY',['same computational sample grid'],'affine/GCP sampled-grid identity','GRID_PROVEN','Sample-grid identity is not TOPS subpixel co-registration.'):held('SAMPLED_GRID_IDENTITY',['same computational sample grid'],['SAMPLED_GRID_IDENTITY_REQUIRED'],'affine/GCP sampled-grid identity','GRID_PROVEN','prove exact computational grid identity','Do not promote grid equality to interferometric registration.'));
 rows.push(ok(e.crossProductBound)?established('PAIR_CROSS_PRODUCT',['complex SLC pair','same polarization','sampled-grid identity'],'master * conj(slave)','PAIR_CROSS_PRODUCT_REPRODUCED','Exact-grid complex cross-product is a computation, not yet phase-valid InSAR.'):held('PAIR_CROSS_PRODUCT',['complex SLC pair','same polarization','sampled-grid identity'],['PAIR_CROSS_PRODUCT_NOT_MATERIALIZED'],'master * conj(slave)','PAIR_CROSS_PRODUCT_REPRODUCED','materialize exact-grid complex cross-product','Carry source phase and pair phase separately.'));
 rows.push(ok(e.normalizedCorrelationBound)?established('NORMALIZED_CORRELATION',['complex pair','declared window'],'|sum(s1*conj(s2))|/sqrt(sum|s1|^2 sum|s2|^2)','NUMERICAL_REPRODUCTION','Exact-grid normalized complex correlation is retained as a candidate statistic until co-registration is proved.'):held('NORMALIZED_CORRELATION',['complex pair','declared window'],['NORMALIZED_CORRELATION_NOT_MATERIALIZED'],'normalized complex correlation','NUMERICAL_REPRODUCTION','compute correlation with validity mask','Missing pixels remain missing, not zero.'));
 rows.push(coreg?established('TOPS_SUBPIXEL_COREGISTRATION',['burst geometry','precise orbit','azimuth residual','range residual/tolerance'],'TOPS burst co-registration + residual proof','AZ_RESIDUAL<=0.001_SAMPLE + RANGE_RESIDUAL<=DECLARED_TOLERANCE','Residual proof, not matching affine metadata, establishes TOPS registration.'):held('TOPS_SUBPIXEL_COREGISTRATION',['burst geometry','precise orbit','azimuth residual','range residual/tolerance'],[!ok(e.burstGeometryBound)?'BURST_GEOMETRY_REQUIRED':'',!ok(e.preciseOrbitBound)?'PRECISE_ORBIT_REQUIRED':'',!azCoreg?'AZIMUTH_COREG_RESIDUAL_NOT_PROVEN':'',!rgCoreg?'RANGE_COREG_RESIDUAL_NOT_PROVEN':''].filter(Boolean),'TOPS burst co-registration + residual proof','AZ_RESIDUAL<=0.001_SAMPLE + RANGE_RESIDUAL<=DECLARED_TOLERANCE','bind burst/orbit geometry and prove residuals','Exact sampled-grid identity alone never closes this gate.'));
 rows.push(phaseValid?established('PHYSICALLY_VALID_INTERFEROMETRIC_PHASE',['TOPS coregistration','wrapped pair phase'],'phase-valid wrapped interferogram','COREGISTRATION_PROOF_REQUIRED','Pair phase becomes physical InSAR only after registration proof.'):held('PHYSICALLY_VALID_INTERFEROMETRIC_PHASE',['TOPS coregistration','wrapped pair phase'],[!coreg?'TOPS_SUBPIXEL_COREGISTRATION_REQUIRED':'',!ok(e.wrappedInterferometricPhaseBound)?'WRAPPED_INTERFEROMETRIC_PHASE_REQUIRED':''].filter(Boolean),'phase-valid wrapped interferogram','COREGISTRATION_PROOF_REQUIRED','prove TOPS registration and bind wrapped phase','Candidate exact-grid cross-phase is not promoted early.'));
 rows.push(radiometry?established('RADIOMETRIC_BACKSCATTER',['calibration annotation/LUT','native power'], 'value=(power-noise)/A^2 where declared','CALIBRATION_LUT + SOURCE_POWER + UNIT_PROOF','beta0/sigma0/gamma0 are admitted only from product calibration authority.'):held('RADIOMETRIC_BACKSCATTER',['calibration annotation/LUT','native power'],[!ok(e.calibrationAnnotationBound)?'CALIBRATION_ANNOTATION_REQUIRED':'',!ok(e.calibrationLutBound)?'CALIBRATION_LUT_REQUIRED':'',!ok(e.calibratedBackscatterBound)?'CALIBRATED_ARRAY_NOT_MATERIALIZED':''].filter(Boolean),'Sentinel-1 radiometric calibration','CALIBRATION_LUT + SOURCE_POWER + UNIT_PROOF','ingest calibration/noise annotations and materialize calibrated arrays','Dewey calculus governs evidence flow; Sentinel annotation governs measurement calibration.'));
 rows.push(rtc?established('TERRAIN_FLATTENED_GAMMA0',['radiometry','DEM','local incidence/area geometry','RTC operator'],'radiometric terrain correction','DEM + LOCAL_GEOMETRY + RTC_REPRODUCTION','Terrain flattening is not approximated from image brightness.'):held('TERRAIN_FLATTENED_GAMMA0',['radiometry','DEM','local incidence/area geometry','RTC operator'],[!radiometry?'RADIOMETRIC_BACKSCATTER_REQUIRED':'',!ok(e.demBound)?'AUTHORITATIVE_DEM_REQUIRED':'',!ok(e.localIncidenceBound)?'LOCAL_INCIDENCE_GEOMETRY_REQUIRED':'',!ok(e.rtcOperatorBound)?'RTC_OPERATOR_REQUIRED':'',!ok(e.terrainFlattenedGamma0Bound)?'RTC_GAMMA0_ARRAY_REQUIRED':''].filter(Boolean),'radiometric terrain correction','DEM + LOCAL_GEOMETRY + RTC_REPRODUCTION','bind DEM/geometry and reproduce RTC','Do not call calibration gamma0 terrain-flattened gamma0.'));
 rows.push(unwrap?established('UNWRAPPED_PHASE',['phase-valid interferogram','unwrapper output','closure/quality proof'],'2-D phase unwrapping','UNWRAP_CLOSURE + MASK_TOPOLOGY','Unwrapped phase is admitted only with ambiguity/closure evidence.'):held('UNWRAPPED_PHASE',['phase-valid interferogram','unwrapper output','closure/quality proof'],[!phaseValid?'PHASE_VALID_INTERFEROGRAM_REQUIRED':'',!ok(e.unwrappedPhaseBound)?'UNWRAPPED_PHASE_REQUIRED':'',!ok(e.unwrapClosureBound)?'UNWRAP_CLOSURE_PROOF_REQUIRED':''].filter(Boolean),'2-D phase unwrapping','UNWRAP_CLOSURE + MASK_TOPOLOGY','run/ingest unwrapper and prove closure','Never fill disconnected or low-coherence regions with synthetic phase.'));
 rows.push(los?established('LOS_DISPLACEMENT',['corrected unwrapped phase','wavelength','sign convention'],'d_LOS=sign*lambda*phi/(4*pi)','WAVELENGTH + SIGN + RESIDUAL_CHAIN','Metric LOS is a projection in a declared sign convention.'):held('LOS_DISPLACEMENT',['corrected unwrapped phase','wavelength','sign convention'],[!corrected?'CORRECTED_UNWRAPPED_PHASE_REQUIRED':'',!ok(e.wavelengthBound)?'WAVELENGTH_REQUIRED':'',!ok(e.signConventionBound)?'SIGN_CONVENTION_REQUIRED':'',!ok(e.losDisplacementBound)?'LOS_ARRAY_NOT_MATERIALIZED':''].filter(Boolean),'phase to LOS','WAVELENGTH + SIGN + RESIDUAL_CHAIN','close residual chain and materialize LOS','Wrapped phase cannot be converted directly to metric displacement.'));
 rows.push(correctedLos?established('CORRECTED_LOS',['LOS','topography','orbit','atmosphere'],'residual-corrected LOS','TOPOGRAPHY + ORBIT + ATMOSPHERE + UNCERTAINTY','Each correction remains separately ledgered and reversible.'):held('CORRECTED_LOS',['LOS','topography','orbit','atmosphere'],[!ok(e.topographicCorrectionBound)?'TOPOGRAPHIC_CORRECTION_REQUIRED':'',!ok(e.orbitCorrectionBound)?'ORBIT_CORRECTION_REQUIRED':'',!ok(e.atmosphericCorrectionBound)?'ATMOSPHERIC_CORRECTION_REQUIRED':'',!ok(e.correctedLosBound)?'CORRECTED_LOS_ARRAY_REQUIRED':''].filter(Boolean),'residual-corrected LOS','TOPOGRAPHY + ORBIT + ATMOSPHERE + UNCERTAINTY','bind DEM/orbit/ETAD-or-equivalent correction evidence','No correction is silently folded into a scalar score.'));
 if(full3d)rows.push(established('FULL_3D_DEFORMATION',['>=3 independent LOS geometries','rank-3 design matrix'],'weighted LOS vector inversion','GEOMETRY_RANK_3 + RESIDUAL_PROOF','3-D displacement is established only when the observation geometry has enough independent information.'));
 else rows.push({layer:'FULL_3D_DEFORMATION',state:'NOT_DERIVABLE_FROM_SINGLE_LOS',dependencies:['>=3 independent LOS geometries or additional external constraints'],missing:[!correctedLos?'CORRECTED_LOS_REQUIRED':'',!rank3?'RANK_3_VIEWING_GEOMETRY_REQUIRED':'',!ok(e.deformation3dBound)?'3D_ARRAY_NOT_MATERIALIZED':''].filter(Boolean),operator:'weighted LOS vector inversion',proofGate:'GEOMETRY_RANK_3 + RESIDUAL_PROOF',scarCarry:['projection null space','geometry condition burden'],next:'add independent look geometries and/or GNSS constraints; solve only when rank is sufficient',machineAction:'ACQUIRE_OR_LEAVE_OPEN',truthBoundary:'One SAR LOS cannot uniquely determine a 3-D displacement vector.'});
 return rows;
}

export function calibrateSentinel1LinearR342(power:number,calibrationLut:number,noiseLut=0){
 if(!finite(power)||!finite(calibrationLut)||!finite(noiseLut)||calibrationLut<=0)return Number.NaN;
 const correctedPower=power-noiseLut;
 if(correctedPower<0)return Number.NaN;
 return correctedPower/(calibrationLut*calibrationLut);
}
export function calibrateSentinel1AmplitudeR342(amplitude:number,calibrationLut:number,noiseLut=0){
 return calibrateSentinel1LinearR342(amplitude*amplitude,calibrationLut,noiseLut);
}
export function calibrateSentinel1ComplexR342(i:number,q:number,calibrationLut:number,noiseLut=0){
 return calibrateSentinel1LinearR342(i*i+q*q,calibrationLut,noiseLut);
}

export function subtractPhaseResidualsR342(unwrappedPhaseRad:number,phaseToRemoveRad:number[]){
 if(!finite(unwrappedPhaseRad)||phaseToRemoveRad.some(x=>!finite(x)))return Number.NaN;
 return unwrappedPhaseRad-phaseToRemoveRad.reduce((a,b)=>a+b,0);
}
export function phaseToLosR342(correctedUnwrappedPhaseRad:number,wavelengthM:number,signConvention:-1|1=-1){
 if(!finite(correctedUnwrappedPhaseRad)||!finite(wavelengthM)||wavelengthM<=0)return Number.NaN;
 return signConvention*wavelengthM*correctedUnwrappedPhaseRad/(4*Math.PI);
}

export interface SarLosObservationR342{losUnit:[number,number,number];displacementM:number;weight?:number}
export interface SarLosVectorSolutionR342{state:'ESTABLISHED'|'HELD';eastM:number|null;northM:number|null;upM:number|null;determinant:number;conditionProxy:number;reason:string}
export function solveLosVectorR342(observations:SarLosObservationR342[]):SarLosVectorSolutionR342{
 const valid=observations.filter(o=>o.losUnit.length===3&&o.losUnit.every(finite)&&finite(o.displacementM)&&(!finite(o.weight)||Number(o.weight)>0));
 if(valid.length<3)return{state:'HELD',eastM:null,northM:null,upM:null,determinant:0,conditionProxy:Infinity,reason:'AT_LEAST_THREE_INDEPENDENT_LOS_REQUIRED'};
 const a=[[0,0,0],[0,0,0],[0,0,0]],b=[0,0,0];
 for(const o of valid){const w=finite(o.weight)?Number(o.weight):1,u=o.losUnit;for(let r=0;r<3;r++){b[r]+=w*u[r]*o.displacementM;for(let c=0;c<3;c++)a[r][c]+=w*u[r]*u[c];}}
 const det=a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
 const scale=Math.max(1,...a.flat().map(Math.abs)),tol=1e-12*scale*scale*scale;
 if(!finite(det)||Math.abs(det)<=tol)return{state:'HELD',eastM:null,northM:null,upM:null,determinant:det,conditionProxy:Infinity,reason:'LOS_GEOMETRY_RANK_DEFICIENT'};
 const inv=[
  [(a[1][1]*a[2][2]-a[1][2]*a[2][1])/det,(a[0][2]*a[2][1]-a[0][1]*a[2][2])/det,(a[0][1]*a[1][2]-a[0][2]*a[1][1])/det],
  [(a[1][2]*a[2][0]-a[1][0]*a[2][2])/det,(a[0][0]*a[2][2]-a[0][2]*a[2][0])/det,(a[0][2]*a[1][0]-a[0][0]*a[1][2])/det],
  [(a[1][0]*a[2][1]-a[1][1]*a[2][0])/det,(a[0][1]*a[2][0]-a[0][0]*a[2][1])/det,(a[0][0]*a[1][1]-a[0][1]*a[1][0])/det]
 ];
 const x=inv.map(row=>row.reduce((s,v,j)=>s+v*b[j],0));
 const conditionProxy=scale/Math.max(Math.abs(det)**(1/3),1e-15);
 return{state:'ESTABLISHED',eastM:x[0],northM:x[1],upM:x[2],determinant:det,conditionProxy,reason:'RANK_3_WEIGHTED_LOS_INVERSION'};
}

export function sarDeweyContinuityContractR342(){
 return{
  operatorSequence:['PARTITION','PRUNE','TRANSLATE','PROVE','INVARIANT_CARRY','SCAR_CARRY','RECONTEXTUALIZE'],
  rscLoop:['Parent','Interaction','Scar','Continuity','Compression','Skin','Interpretation','Behavior','New Parent'],
  hardRules:['NO_NEW_PHYSICAL_PRIMITIVE','NO_SYNTHETIC_ZERO_FOR_MISSING_EVIDENCE','NO_METADATA_SHORTCUT_TO_COREGISTRATION','NO_SINGLE_LOS_TO_3D','NO_POST_HOC_RETUNING'],
  truthBoundary:'Dewey/Woven calculus governs evidence routing, state continuity, residual/scar retention, falsification and promotion. Mission/product physics remains governed by authoritative SAR definitions and returned measurement evidence.'
 };
}

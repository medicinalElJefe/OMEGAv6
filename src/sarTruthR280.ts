export type SarTruthClassR280=
 |'OBSERVED_NATIVE'|'OBSERVED_CALIBRATED'|'CORRECTED'|'GEOCODED'|'FUSED'
 |'ASSIMILATED'|'SIMULATED'|'FORECAST'|'DERIVED_MODEL'|'VISUAL_ENHANCED';

export type SarMissingnessR280=
 |'NO_SOURCE'|'OUT_OF_SWATH'|'RADAR_SHADOW'|'LAYOVER'|'NO_COHERENCE'
 |'CLOUD_MASKED'|'ATMOSPHERICALLY_DEGRADED'|'INTERPOLATED_ONLY';

export type SarBandR280='X'|'C'|'S'|'L'|'P'|'Ka'|'Ku'|'K'|'UNKNOWN';
export type SarPolarizationR280='HH'|'VV'|'HV'|'VH'|'DUAL'|'QUAD'|'UNKNOWN';
export type SarProductLevelR280='L0'|'L1A'|'L1B'|'SLC'|'GRD'|'RTC'|'L2'|'L3'|'DERIVED'|'UNKNOWN';
export type SarSurfaceClassR280='ELLIPSOID'|'DTM'|'DSM'|'DEM_UNSPECIFIED'|'SCATTERING_SURFACE'|'UNKNOWN';

export interface SarProvenanceR280{
 sourceId:string; sourceUrl?:string; provider?:string; checksum?:string; acquiredAt:string;
 receivedAt?:string; processedAt?:string; publishedAt?:string; processor?:string; processorVersion?:string;
 processingParameters?:Record<string,string|number|boolean|null>;
}

export interface SarMissionSpecR280{
 id:string; label:string; bands:SarBandR280[]; wavelengthCm?:number[]; frequencyGHz?:number[];
 revisitDays?:number; nominalResolutionM?:number[]; swathKm?:number[]; notes:string[];
}

export interface SarCalibrationR280{
 id:string; method:string; units:string; validFrom?:string; validTo?:string;
 coefficients?:number[]; uncertainty?:number; reference?:string;
}

export interface SarGeometryFrameR280{
 crs:string; datum?:string; verticalDatum?:string; surfaceClass:SarSurfaceClassR280;
 orbitDirection?:'ASCENDING'|'DESCENDING'|'UNKNOWN'; incidenceDeg?:number; azimuthDeg?:number;
 lookDirection?:'LEFT'|'RIGHT'|'UNKNOWN'; losUnit?:[number,number,number]; baselineM?:number;
 temporalBaselineDays?:number; nativeResolutionM?:[number,number]; pixelSpacingM?:[number,number];
 footprint?:Array<[number,number]>;
}

export interface SarComplexPixelR280{
 amplitude:number; phaseRad:number; i?:number; q?:number; sigma0Db?:number; coherence?:number;
 truth:SarTruthClassR280; missing?:SarMissingnessR280[]; quality?:number;
}

export interface SarResidualLedgerR280{
 atmosphereRad?:number; orbitRad?:number; topographyRad?:number; noiseRad?:number;
 decorrelation?:number; speckleBurden?:number; interpolationBurden?:number;
 notes:string[];
}

export interface SarObservationR280{
 id:string; missionId:string; sensor:string; productId?:string; productLevel:SarProductLevelR280;
 band:SarBandR280; frequencyGHz?:number; wavelengthCm?:number; polarization:SarPolarizationR280;
 provenance:SarProvenanceR280; geometry:SarGeometryFrameR280; calibration?:SarCalibrationR280;
 truth:SarTruthClassR280; missingness:SarMissingnessR280[]; residuals:SarResidualLedgerR280;
 nativeDataBound:boolean; complexDataBound:boolean; sourceEvidenceBound:boolean;
}

export interface SarInterferometricPairR280{
 masterId:string; slaveId:string; wavelengthCm:number; baselineM:number; temporalBaselineDays:number;
 meanCoherence?:number; wrappedPhaseBound:boolean; unwrappedPhaseBound:boolean;
 topographyHandled:boolean; orbitHandled:boolean; atmosphereHandled:boolean; noiseCharacterized:boolean;
}

export interface SarWovenStateR280{
 partition:{mission:string;band:SarBandR280;polarization:SarPolarizationR280;epoch:string;productLevel:SarProductLevelR280};
 transforms:string[];
 invariantCarry:string[];
 scarCarry:string[];
 recontextualizedAs:string[];
 admission:{state:'ADMITTED'|'HELD'|'REJECTED';reasons:string[]};
}

export const SAR_MISSION_REGISTRY_R280:SarMissionSpecR280[]=[
 {id:'sentinel-1',label:'Sentinel-1',bands:['C'],wavelengthCm:[5.55],frequencyGHz:[5.405],revisitDays:6,nominalResolutionM:[5,10,20],swathKm:[80,250,400],notes:['Systematic all-weather C-band SAR','Mode-dependent resolution/swath','Revisit depends on active constellation and latitude']},
 {id:'nisar',label:'NISAR',bands:['L','S'],wavelengthCm:[24,10],revisitDays:12,nominalResolutionM:[3,10],swathKm:[240],notes:['Dual-frequency SAR','Use mission product metadata as authority for actual acquisition mode']},
 {id:'terrasar-x',label:'TerraSAR-X',bands:['X'],frequencyGHz:[9.65],revisitDays:11,nominalResolutionM:[1,3,18],notes:['High-resolution X-band SAR']},
 {id:'tandem-x',label:'TanDEM-X',bands:['X'],frequencyGHz:[9.65],revisitDays:11,notes:['Formation-flying interferometric partner to TerraSAR-X','Baseline is part of observation geometry']},
 {id:'radarsat',label:'RADARSAT family',bands:['C'],notes:['Mission-specific modes and product metadata govern actual resolution/swath/revisit']},
 {id:'biomass',label:'ESA Biomass',bands:['P'],wavelengthCm:[69],frequencyGHz:[0.435],notes:['Long-wavelength polarimetric P-band SAR','Forest structure/biomass observation']},
 {id:'srtm',label:'SRTM',bands:['C','X'],notes:['Single-pass interferometric elevation reference mission','Historical acquisition']}
];

export const SAR_BAND_RELATIVITY_R280:Record<SarBandR280,{label:string;relativeScattering:string;interpretation:string}>=
{
 X:{label:'X-band',relativeScattering:'shallow / fine surface-structure sensitivity',interpretation:'Do not assume equivalence with C/L/P scattering surfaces.'},
 C:{label:'C-band',relativeScattering:'surface-to-canopy interaction depending target/moisture/geometry',interpretation:'Common operational SAR band; preserve incidence and polarization.'},
 S:{label:'S-band',relativeScattering:'intermediate wavelength interaction',interpretation:'Treat as distinct observation frame from L/C.'},
 L:{label:'L-band',relativeScattering:'deeper vegetation/soil/ice interaction than C/X in many scenes',interpretation:'Longer wavelength changes effective scattering volume.'},
 P:{label:'P-band',relativeScattering:'deep canopy/volume interaction in suitable targets',interpretation:'Long wavelength can observe structure beneath shorter-band dominant scattering.'},
 Ka:{label:'Ka-band',relativeScattering:'very short microwave wavelength',interpretation:'System-specific atmospheric/target behavior must be declared.'},
 Ku:{label:'Ku-band',relativeScattering:'short microwave wavelength',interpretation:'System-specific observation semantics.'},
 K:{label:'K-band',relativeScattering:'short microwave wavelength',interpretation:'System-specific observation semantics.'},
 UNKNOWN:{label:'Unknown band',relativeScattering:'unknown',interpretation:'Physical comparison held until band/wavelength is known.'}
};

export function sarFreshnessR280(p:SarProvenanceR280,now=Date.now()){
 const acquired=Date.parse(p.acquiredAt); const received=p.receivedAt?Date.parse(p.receivedAt):NaN;
 const published=p.publishedAt?Date.parse(p.publishedAt):NaN;
 return {
  sceneAgeSeconds:Number.isFinite(acquired)?Math.max(0,(now-acquired)/1000):null,
  acquisitionToReceiveSeconds:Number.isFinite(acquired)&&Number.isFinite(received)?Math.max(0,(received-acquired)/1000):null,
  acquisitionToPublishSeconds:Number.isFinite(acquired)&&Number.isFinite(published)?Math.max(0,(published-acquired)/1000):null
 };
}

export function compileSarWovenStateR280(obs:SarObservationR280,transforms:string[],recontextualizedAs:string[]):SarWovenStateR280{
 const reasons:string[]=[];
 if(!obs.sourceEvidenceBound)reasons.push('SOURCE_EVIDENCE_REQUIRED');
 if(!obs.nativeDataBound)reasons.push('NATIVE_DATA_NOT_BOUND');
 if(obs.band==='UNKNOWN')reasons.push('BAND_REQUIRED_FOR_PHYSICAL_COMPARISON');
 if(!obs.geometry?.crs)reasons.push('GEOMETRY_FRAME_REQUIRED');
 if(obs.missingness.includes('NO_SOURCE'))reasons.push('NO_SOURCE_MUST_REMAIN_MISSING');
 const state=reasons.includes('NO_SOURCE_MUST_REMAIN_MISSING')?'REJECTED':reasons.length?'HELD':'ADMITTED';
 return {
  partition:{mission:obs.missionId,band:obs.band,polarization:obs.polarization,epoch:obs.provenance.acquiredAt,productLevel:obs.productLevel},
  transforms:[...transforms],
  invariantCarry:['sourceId','acquiredAt','missionId','sensor','band','polarization','productLevel','geometry.crs','geometry.surfaceClass','truth','calibration'],
  scarCarry:['missingness','residuals.atmosphereRad','residuals.orbitRad','residuals.topographyRad','residuals.noiseRad','residuals.decorrelation','residuals.speckleBurden','residuals.interpolationBurden'],
  recontextualizedAs:[...recontextualizedAs], admission:{state,reasons}
 };
}

export function interferometricAdmissionR280(pair:SarInterferometricPairR280){
 const reasons:string[]=[];
 if(!pair.wrappedPhaseBound)reasons.push('WRAPPED_PHASE_REQUIRED');
 if(!pair.unwrappedPhaseBound)reasons.push('UNWRAPPED_PHASE_REQUIRED_FOR_METRIC_DISPLACEMENT');
 if(!(pair.meanCoherence!=null&&pair.meanCoherence>=0.2))reasons.push('COHERENCE_INSUFFICIENT_OR_UNKNOWN');
 if(!pair.topographyHandled)reasons.push('TOPOGRAPHIC_PHASE_UNRESOLVED');
 if(!pair.orbitHandled)reasons.push('ORBIT_PHASE_UNRESOLVED');
 if(!pair.atmosphereHandled)reasons.push('ATMOSPHERIC_PHASE_UNRESOLVED');
 if(!pair.noiseCharacterized)reasons.push('NOISE_NOT_CHARACTERIZED');
 return {admitted:reasons.length===0,reasons};
}

export function phaseToLosDisplacementR280(unwrappedPhaseRad:number,wavelengthCm:number){
 // Standard line-of-sight phase/displacement magnitude relation for a declared sign convention.
 const wavelengthM=wavelengthCm/100;
 return -(unwrappedPhaseRad*wavelengthM)/(4*Math.PI);
}

export function relativeBandComparisonR280(a:SarObservationR280,b:SarObservationR280){
 const reasons:string[]=[];
 if(a.band==='UNKNOWN'||b.band==='UNKNOWN')reasons.push('BAND_UNKNOWN');
 if(a.geometry.crs!==b.geometry.crs)reasons.push('COMMON_CRS_REQUIRED');
 if(a.geometry.surfaceClass!==b.geometry.surfaceClass)reasons.push('MEASUREMENT_SURFACE_DIFFERS');
 if(a.truth==='SIMULATED'||b.truth==='SIMULATED')reasons.push('SIMULATION_PRESENT');
 return {
  comparable:!reasons.includes('BAND_UNKNOWN')&&!reasons.includes('COMMON_CRS_REQUIRED'), reasons,
  frameA:SAR_BAND_RELATIVITY_R280[a.band], frameB:SAR_BAND_RELATIVITY_R280[b.band]
 };
}

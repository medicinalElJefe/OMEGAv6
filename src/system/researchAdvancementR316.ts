export const R316_RESEARCH_ADVANCEMENT_SCHEMA='OMEGA_RESEARCH_ADVANCEMENT_R316' as const;
export const R316_RESEARCH_ADVANCEMENT_REVISION='R316' as const;

export type R316AtlasResolution=12|144|1728|20736|248832;
export const R316_ATLAS_RESOLUTIONS:readonly R316AtlasResolution[]=[12,144,1728,20736,248832] as const;

export type R316FabricationProcess={
 cdBiasNm:number;
 etchDepthErrorNm:number;
 overlayXNm:number;
 overlayYNm:number;
 roughnessRmsNm:number;
 sidewallAngleDeg:number;
};

export type R316GeometryRecord={pitch_nm?:number;width_nm?:number;length_nm?:number;height_nm?:number;[key:string]:number|undefined};
export type R316FabricatedGeometry={geometry:R316GeometryRecord;process:R316FabricationProcess;processScar:string[]};

const finite=(value:number)=>Number.isFinite(value);
const canonical=(value:unknown):string=>{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return`[${value.map(canonical).join(',')}]`;
 const record=value as Record<string,unknown>;
 return`{${Object.keys(record).sort().map(key=>`${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
};
const fnv=(value:unknown)=>{
 const source=canonical(value);let hash=0x811c9dc5;
 for(let i=0;i<source.length;i++){hash^=source.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0}
 return hash.toString(16).padStart(8,'0');
};

export function applyFabricationTransformR316(ideal:R316GeometryRecord,process:R316FabricationProcess):R316FabricatedGeometry{
 for(const [key,value] of Object.entries(process))if(!finite(value))throw new Error(`R316 fabrication process ${key} must be finite`);
 const geometry:R316GeometryRecord={...ideal};
 if(finite(Number(ideal.width_nm)))geometry.width_nm=Number(ideal.width_nm)+process.cdBiasNm;
 if(finite(Number(ideal.length_nm)))geometry.length_nm=Number(ideal.length_nm)+process.cdBiasNm;
 if(finite(Number(ideal.height_nm)))geometry.height_nm=Math.max(0,Number(ideal.height_nm)+process.etchDepthErrorNm);
 const processScar=[
  `CD_BIAS_NM:${process.cdBiasNm}`,
  `ETCH_DEPTH_ERROR_NM:${process.etchDepthErrorNm}`,
  `OVERLAY_NM:${process.overlayXNm},${process.overlayYNm}`,
  `ROUGHNESS_RMS_NM:${process.roughnessRmsNm}`,
  `SIDEWALL_ANGLE_DEG:${process.sidewallAngleDeg}`,
 ];
 return{geometry,process:{...process},processScar};
}

export type R316Direction={thetaRad:number;phiRad:number};
export type R316StokesState={kind:'STOKES';s0:number;s1:number;s2:number;s3:number};
export type R316JonesState={kind:'JONES';exRe:number;exIm:number;eyRe:number;eyIm:number};
export type R316PolarizationState=R316StokesState|R316JonesState;
export type R316OpticalFieldSample={
 x:number;y:number;wavelengthNm:number;intensity:number;phaseRad:number;
 direction:R316Direction;polarization:R316PolarizationState;time:string;frameId:string;
};

export function validateOpticalFieldSampleR316(sample:R316OpticalFieldSample){
 const numeric=[sample.x,sample.y,sample.wavelengthNm,sample.intensity,sample.phaseRad,sample.direction.thetaRad,sample.direction.phiRad];
 if(numeric.some(value=>!finite(value)))return false;
 if(sample.wavelengthNm<=0||sample.intensity<0||!sample.frameId.trim()||!Number.isFinite(Date.parse(sample.time)))return false;
 if(sample.polarization.kind==='STOKES'){
  const {s0,s1,s2,s3}=sample.polarization;
  if([s0,s1,s2,s3].some(value=>!finite(value))||s0<0)return false;
  return Math.sqrt(s1*s1+s2*s2+s3*s3)<=s0+1e-9;
 }
 return [sample.polarization.exRe,sample.polarization.exIm,sample.polarization.eyRe,sample.polarization.eyIm].every(value=>finite(value));
}

export type R316RelationalGeometry={dxNm:number;dyNm:number;dzNm:number;thetaDeg:number;sigma:-1|0|1;phaseRad:number};
export type R316OpticalCandidateIdentityInput={
 geometry:unknown;
 relation:R316RelationalGeometry;
 material:unknown;
 boundary:unknown;
};
export function opticalCandidateIdentityR316(input:R316OpticalCandidateIdentityInput){return`r316-opt-${fnv(input)}`}

export type R316SolverCapability='STATIC_PERIODIC'|'STATIC_FINITE'|'DISPERSIVE'|'ANISOTROPIC'|'NONLINEAR'|'TIME_VARYING';
export const R316_OPTICAL_PROMOTION_SEQUENCE=['PROPOSE','FAST_SCREEN','RCWA','FDTD','FABRICATION_TOLERANCE','VALIDATED'] as const;

export type R316ExperimentEpisode={
 episodeId:string;hypothesisHash:string;parameterVector:Record<string,number>;
 predicted:Record<string,number>;measured:Record<string,number>;uncertainty:Record<string,number>;
 residual:Record<string,number>;sourceReceiptIds:string[];scarIds:string[];canonicalAdmission:false;
};
export function experimentResidualR316(predicted:Record<string,number>,measured:Record<string,number>){
 const keys=[...new Set([...Object.keys(predicted),...Object.keys(measured)])].sort();
 const residual:Record<string,number>={};let l2=0;
 for(const key of keys){const p=Number(predicted[key]),m=Number(measured[key]);if(!finite(p)||!finite(m))throw new Error(`R316 residual requires finite ${key}`);const delta=m-p;residual[key]=delta;l2+=delta*delta}
 return{residual,l2:Math.sqrt(l2)};
}

export type R316SpectralObservation={
 observationId:string;sourceId:string;instrument:string;eventTime:string;receiveTime:string;
 frameId:string;atlasResolution:R316AtlasResolution;wavelengthsNm:number[];values:number[];
 calibrationId:string;uncertaintyId:string;provenanceReceiptId:string;derived:false;
};
export function validateSpectralObservationR316(observation:R316SpectralObservation){
 return Boolean(
  observation.derived===false&&observation.observationId.trim()&&observation.sourceId.trim()&&observation.instrument.trim()&&
  Number.isFinite(Date.parse(observation.eventTime))&&Number.isFinite(Date.parse(observation.receiveTime))&&
  R316_ATLAS_RESOLUTIONS.includes(observation.atlasResolution)&&observation.wavelengthsNm.length>0&&
  observation.wavelengthsNm.length===observation.values.length&&observation.wavelengthsNm.every(value=>finite(value)&&value>0)&&
  observation.values.every(finite)&&observation.calibrationId.trim()&&observation.uncertaintyId.trim()&&observation.provenanceReceiptId.trim()
 );
}

export type R316AcquisitionReceipt={
 schema:'OMEGA_ACQUISITION_RECEIPT_R316';receiptId:string;uri:string;requestedAt:string;requester:string;
 purpose:string;authorityId:string;responseHash:string;policyHash:string;parentReceiptId:string|null;
 transformedArtifactHash:string|null;canonicalAdmission:false;
};
export function acquisitionReceiptDigestR316(receipt:Omit<R316AcquisitionReceipt,'receiptId'>){return`r316-src-${fnv(receipt)}`}
export function createAcquisitionReceiptR316(input:Omit<R316AcquisitionReceipt,'schema'|'receiptId'|'canonicalAdmission'>):R316AcquisitionReceipt{
 if(!input.uri.trim()||!input.requester.trim()||!input.purpose.trim()||!input.authorityId.trim()||!input.responseHash.trim()||!input.policyHash.trim())throw new Error('R316 acquisition receipt missing required provenance');
 if(!Number.isFinite(Date.parse(input.requestedAt)))throw new Error('R316 acquisition requestedAt must be ISO-parseable');
 const base={schema:'OMEGA_ACQUISITION_RECEIPT_R316' as const,...input,canonicalAdmission:false as const};
 return{...base,receiptId:acquisitionReceiptDigestR316(base)};
}

export type R316Interconnect='PCIE'|'NVLINK'|'ETHERNET'|'OPTICAL'|'CLOUD';
export type R316HardwareNode={
 nodeId:string;online:boolean;authorityScopes:string[];capabilities:string[];latencyMs:number;energyJPerTask:number;
 estimatedCost:number;bandwidthGbps:number;risk:number;interconnect:R316Interconnect;
};
export type R316ScheduleWeights={latency:number;energy:number;cost:number;bandwidth:number;risk:number};
export function scheduleHardwareR316(nodes:R316HardwareNode[],requiredCapability:string,requiredScope:string,weights:R316ScheduleWeights){
 const eligible=nodes.filter(node=>node.online&&node.capabilities.includes(requiredCapability)&&node.authorityScopes.includes(requiredScope)&&node.bandwidthGbps>0);
 if(!eligible.length)return null;
 return eligible.map(node=>({node,score:weights.latency*node.latencyMs+weights.energy*node.energyJPerTask+weights.cost*node.estimatedCost+weights.bandwidth*(1/node.bandwidthGbps)+weights.risk*node.risk}))
  .sort((a,b)=>a.score-b.score||a.node.nodeId.localeCompare(b.node.nodeId))[0];
}

export type R316ResearchDelta={id:string;title:string;buildStage:string;implementation:string;proof:string;state:'INTEGRATED'|'EVIDENCE_GATED'|'DEVICE_GATED'};
export const R316_RESEARCH_DELTAS:readonly R316ResearchDelta[]=[
 {id:'R316-D01',title:'Fabrication-aware optical validation',buildStage:'R314-B14',implementation:'Ideal geometry is transformed through explicit CD/etch/overlay/roughness/sidewall process state before promotion.',proof:'Tolerance sweeps must preserve declared optical merit before physical claims.',state:'INTEGRATED'},
 {id:'R316-D02',title:'Directional spectral optical-field state',buildStage:'R314-B07',implementation:'Field samples bind wavelength, intensity, phase, outgoing direction, frame and Jones/Stokes polarization.',proof:'Conventional raster/polarizer cases must be recoverable as constrained subsets.',state:'INTEGRATED'},
 {id:'R316-D03',title:'Relational optical candidate identity',buildStage:'R314-B06',implementation:'Candidate identity hashes intrinsic geometry plus relative transform, material and boundary conditions.',proof:'Changing only relation must produce a distinct candidate identity.',state:'INTEGRATED'},
 {id:'R316-D04',title:'Receipt-backed experiment episodes',buildStage:'R314-B08',implementation:'Prediction, measurement, residual, uncertainty and scar carry are stored per experiment episode.',proof:'Known wrong models must accumulate residual instead of silently promoting.',state:'INTEGRATED'},
 {id:'R316-D05',title:'Immutable spectral observation packets',buildStage:'R314-B10',implementation:'Spectral source observations remain calibrated, provenance-bound and explicitly non-derived beneath renders.',proof:'Derived views must be reproducible after deleting render products.',state:'INTEGRATED'},
 {id:'R316-D06',title:'Unified acquisition provenance receipts',buildStage:'R314-B16',implementation:'External acquisition binds URI, requester, purpose, authority, policy and response/artifact hashes.',proof:'Every derived research claim must trace to source evidence without self-admission.',state:'INTEGRATED'},
 {id:'R316-D07',title:'Hardware/interconnect-aware federation scheduling',buildStage:'R314-B13',implementation:'Scheduler scores authorized nodes by latency, energy, cost, inverse bandwidth and risk with explicit interconnect type.',proof:'Offline or unauthorized nodes must never win dispatch.',state:'INTEGRATED'},
 {id:'R316-D08',title:'Time-varying/nonlinear solver capability flags',buildStage:'R314-B14',implementation:'Solver declarations distinguish static periodic/finite, dispersive, anisotropic, nonlinear and time-varying regimes.',proof:'Static validation cannot satisfy a time-varying material claim.',state:'INTEGRATED'},
 {id:'R316-D09',title:'Physical fabrication and measurement closure',buildStage:'R314-B14',implementation:'Software can represent fabrication/measurement evidence but does not invent it.',proof:'Promotion to empirical truth remains blocked until returned physical evidence exists.',state:'EVIDENCE_GATED'},
] as const;

export function buildResearchAdvancementR316(){
 return{
  schema:R316_RESEARCH_ADVANCEMENT_SCHEMA,
  revision:R316_RESEARCH_ADVANCEMENT_REVISION,
  atlasResolutions:R316_ATLAS_RESOLUTIONS,
  opticalPromotion:R316_OPTICAL_PROMOTION_SEQUENCE,
  deltas:R316_RESEARCH_DELTAS,
  truthBoundary:'R316 integrates software schemas, transforms, routing inputs and proof obligations derived from current research. It does not assert fabrication, FDTD, measurement, hardware, scientific or CanonState evidence that has not actually been returned.',
  wovenContinuity:['PARTITION','EXCHANGE_TRANSFORM','INVARIANT_CARRY','SCAR_HISTORY_CARRY','RE_CONTEXTUALIZE_REPARTITION'] as const,
 };
}

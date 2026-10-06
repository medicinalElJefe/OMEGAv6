import{
 OMEGA_EXACT_CANON_VERSION,
 OMEGA_EXACT_CANON_BOUNDARY,
 exactAtlasAddressV3,
 verifyExactAtlasAddressV3,
 type ExactProvenanceV3,
}from'./omegaExactCanonV3';
import{addressBearingSampleR356}from'./atlas360TriangulationR356.js';
import{
 modelMappedWgs84R347,
 sourceClocksR347,
 R347_TRUTH_BOUNDARY,
}from'../visualTraversalContextR347';

export const R500_EXACT_TRAVERSAL_SCHEMA='OMEGA_EXACT_TRAVERSAL_ENVELOPE_R500' as const;
export const R500_EXACT_TRAVERSAL_REVISION='R500' as const;
export const R500_NEUTRAL_BEARING_SOURCE='NEUTRAL_REFERENCE_FRAME_NOT_MEASUREMENT' as const;
export const R500_CALLER_BEARING_SOURCE='CALLER_SUPPLIED_MODEL_REFERENCE_FRAME_NOT_MEASUREMENT' as const;
export const R500_EXACT_TRAVERSAL_BOUNDARY='R500 reconciles orphaned R409/R428 capability onto the current R499 lineage. Exact-v3 address identity, Atlas360 deterministic geometry, Earth query context and returned source clocks travel in one read-only envelope. Atlas→WGS84 remains DER query context, model bearing never becomes a measured physical frame, returned source clocks alone may carry OBS provenance, and CanonState/source/SAR/weather/Hybrid/deployment authority remain unchanged.' as const;

export type R500ClockEvidence={
 id:string;
 label:string;
 source:string;
 observedAt:string|null;
 verifiedAt:string|null;
 timeClass:'OBSERVATION'|'SNAPSHOT_VERIFICATION';
 bound:boolean;
 provenance:ExactProvenanceV3;
 claimClass:'SOURCE_OBSERVATION_CLOCK'|'SOURCE_SNAPSHOT_VERIFICATION_CLOCK';
};

const clampAddress=(v:number)=>Math.max(0,Math.min(20735,Math.floor(Number(v)||0)));
const finite=(v:number)=>Number.isFinite(Number(v));

function sourceEvidenceR500(earth:any):R500ClockEvidence[]{
 return sourceClocksR347(earth).map(clock=>({
  ...clock,
  provenance:(clock.bound?'OBS':'GAP') as ExactProvenanceV3,
  claimClass:clock.timeClass==='OBSERVATION'?'SOURCE_OBSERVATION_CLOCK':'SOURCE_SNAPSHOT_VERIFICATION_CLOCK',
 }));
}

function geometryCongruenceR500(index0:number,atlas360:any){
 const exact=exactAtlasAddressV3(index0);
 const d=atlas360?.hierarchy?.digits;
 if(!Array.isArray(d)||d.length!==4)return false;
 return(
  Number(d[0])+1===exact.coordinate.D_domain&&
  Number(d[1])+1===exact.coordinate.P_phase&&
  Number(d[2])+1===exact.coordinate.R_reg&&
  Number(d[3])+1===exact.coordinate.L_lens&&
  Number(atlas360?.hierarchy?.leafIndex)===exact.index0
 );
}

export function compileExactTraversalEnvelopeR500(input:{address:number;theta?:number;earth?:any}){
 const index0=clampAddress(input.address);
 const suppliedTheta=Number(input.theta);
 const callerBearing=Number.isFinite(suppliedTheta);
 const theta=callerBearing?suppliedTheta:0;
 const exactAddress=exactAtlasAddressV3(index0);
 const atlas360=addressBearingSampleR356(index0,theta);
 const earthQuery=modelMappedWgs84R347(index0);
 const sourceEvidence=sourceEvidenceR500(input.earth);
 const sourceObservationCount=sourceEvidence.filter(x=>x.bound&&x.provenance==='OBS').length;
 const sourceGapCount=sourceEvidence.filter(x=>x.provenance==='GAP').length;
 const geometryCongruent=geometryCongruenceR500(index0,atlas360);
 return{
  schema:R500_EXACT_TRAVERSAL_SCHEMA,
  revision:R500_EXACT_TRAVERSAL_REVISION,
  recoveredLineage:['R409','#824','R428','#853','R499'] as const,
  canonVersion:OMEGA_EXACT_CANON_VERSION,
  exactAddress,
  atlas360:{
   schema:atlas360.schema,
   hierarchy:atlas360.hierarchy,
   bearing:atlas360.bearing,
   bearingSource:callerBearing?R500_CALLER_BEARING_SOURCE:R500_NEUTRAL_BEARING_SOURCE,
   geometryProofTier:'ENUMERATED' as const,
   provenance:'DER' as const,
   geometryCongruent,
   physicalVectorClaimed:false as const,
  },
  earthQuery:{
   lat:earthQuery.lat,
   lon:earthQuery.lon,
   provenance:earthQuery.provenance,
   exactAddress:earthQuery.exactAddress,
   physicalEarthCoordinateClaimed:earthQuery.physicalEarthCoordinateClaimed,
   observationClaimed:earthQuery.observationClaimed,
   boundary:earthQuery.boundary,
  },
  sourceEvidence,
  evidenceSummary:{
   sourceObservationCount,
   sourceGapCount,
   allReturnedClocksRemainSourceBound:sourceEvidence.every(x=>x.provenance==='GAP'||x.bound),
  },
  claims:{
   atlasIdentityExact:verifyExactAtlasAddressV3(exactAddress),
   atlas360GeometryCongruent:geometryCongruent,
   queryMappingIsDerived:earthQuery.provenance==='DER',
   observationFromModelClaimed:false as const,
   physicalEarthCoordinateClaimed:false as const,
   modelBearingClaimedAsMeasurement:false as const,
   canonicalMutation:false as const,
   productionAuthorityChanged:false as const,
  },
  boundaries:[OMEGA_EXACT_CANON_BOUNDARY,R347_TRUTH_BOUNDARY,R500_EXACT_TRAVERSAL_BOUNDARY],
 };
}

export function verifyExactTraversalEnvelopeR500(envelope:ReturnType<typeof compileExactTraversalEnvelopeR500>){
 if(envelope?.schema!==R500_EXACT_TRAVERSAL_SCHEMA||envelope.canonVersion!==OMEGA_EXACT_CANON_VERSION)return false;
 if(!verifyExactAtlasAddressV3(envelope.exactAddress))return false;
 if(envelope.exactAddress.index0!==envelope.earthQuery.exactAddress.index0)return false;
 if(!geometryCongruenceR500(envelope.exactAddress.index0,{hierarchy:envelope.atlas360.hierarchy}))return false;
 if(envelope.atlas360.geometryCongruent!==true)return false;
 if(envelope.atlas360.provenance!=='DER'||envelope.atlas360.geometryProofTier!=='ENUMERATED')return false;
 if(envelope.atlas360.physicalVectorClaimed!==false)return false;
 if(![R500_NEUTRAL_BEARING_SOURCE,R500_CALLER_BEARING_SOURCE].includes(envelope.atlas360.bearingSource as any))return false;
 if(envelope.earthQuery.provenance!=='DER'||envelope.earthQuery.observationClaimed!==false||envelope.earthQuery.physicalEarthCoordinateClaimed!==false)return false;
 if(!finite(envelope.earthQuery.lat)||!finite(envelope.earthQuery.lon))return false;
 if(envelope.sourceEvidence.some(x=>x.provenance==='OBS'&&!x.bound))return false;
 if(envelope.sourceEvidence.some(x=>x.provenance==='GAP'&&x.bound))return false;
 if(envelope.claims.observationFromModelClaimed!==false||envelope.claims.physicalEarthCoordinateClaimed!==false||envelope.claims.modelBearingClaimedAsMeasurement!==false)return false;
 if(envelope.claims.canonicalMutation!==false||envelope.claims.productionAuthorityChanged!==false)return false;
 return true;
}

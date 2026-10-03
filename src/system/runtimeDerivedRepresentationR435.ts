import {corpusState} from '../corpusRuntime';
import {compileAllModesTruthFusionR151} from '../allModesTruthFusionR151';
import {compileUniversalTruthEnvelopeR152,type UniversalEvidencePacketR152} from '../universalTruthEnvelopeR152';
import {provenanceForSurfaceR94} from '../surfaceProvenanceR94';
import {compileCanonicalTypedFieldR349,type TypedFieldR349} from './wovenHardwareFieldR349';
import {addressBearingSampleR356,compileAtlas360ExecutionPlanR356,sampleR349FieldAtBearingR356,compareAntipodalFieldR356,evaluateTriangleR356,R356_ATLAS360_SOURCE} from './atlas360TriangulationR356.js';

export const R435_SCHEMA='OMEGA_RUNTIME_DERIVED_REPRESENTATION_R435' as const;
export const R435_LAWS=Object.freeze([
 'REPRESENTATION_MUST_DESCEND_FROM_CURRENT_RUNTIME_STATE',
 'EVERY_DISPLAYED_CLAIM_CARRIES_PROVENANCE_AND_CLAIM_CEILING',
 'RETURNED_EVIDENCE_OUTRANKS_MODEL_COHERENCE',
 'MODEL_STATE_MAY_RENDER_AS_MODEL_STATE_BUT_NOT_AS_OBSERVATION',
 'FORECAST_MAY_RENDER_AS_FORECAST_BUT_NEVER_AS_FUTURE_OBSERVATION',
 'ATLAS360_GEOMETRY_MAY_RENDER_DETERMINISTICALLY_WITHOUT_CREATING_MEASUREMENT',
 'TRIANGLE_CLOSURE_MAY_RENDER_ONLY_FROM_EXPLICIT_INDEPENDENT_ANCHORS_AND_TRANSFORMS',
 'CONTRADICTION_AND_UNCERTAINTY_REDUCE_REPRESENTATION_PERMISSION',
 'MISSING_EVIDENCE_HOLDS_THE_CLAIM_INSTEAD_OF_SYNTHESIZING_COMPLETION',
 'R125_R141_R146_R147_AND_GOVERNED_PRODUCTION_AUTHORITY_REMAIN_UNCHANGED'
]);
export const R435_BOUNDARY='R435 makes presentation a compiled consequence of canonical packet state, returned evidence/proof, R151 truth fusion, R152 evidence weighting, R349 typed-field computation and R356 Atlas360 geometry. It does not create observations, physical dimensions, proof, CanonState admission, dispatch or production authority.';

export type RepresentationStateR435='EMPIRICAL_BOUND'|'SOURCE_BOUND'|'RUNTIME_BOUND'|'MODEL_BOUND'|'HELD_CONTRADICTION'|'HELD_UNKNOWN';
export type RepresentationInputR435={
 address:number;theta?:number;surface?:string;record?:any;evidence?:UniversalEvidencePacketR152[];
 executionProof?:{state?:string;verified?:boolean;receiptId?:string;fingerprint?:string}|null;
 triangle?:any;hardware?:{logicalCores?:number;deviceMemoryGB?:number|null;workerAvailable?:boolean};
};
let fieldCache:TypedFieldR349|null=null;
const field=()=>fieldCache||(fieldCache=compileCanonicalTypedFieldR349(0));
const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const fnv=(text:string)=>{let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')};

function stateFromTruth(t:any):RepresentationStateR435{
 if(t.evidenceStatus==='CONTRADICTED_EVIDENCE')return'HELD_CONTRADICTION';
 if(t.evidenceStatus==='EMPIRICAL_STRONG'||t.evidenceStatus==='EMPIRICAL_PARTIAL')return'EMPIRICAL_BOUND';
 if(t.evidenceStatus==='SOURCE_BOUND')return'SOURCE_BOUND';
 if(t.evidenceStatus==='RUNTIME_BOUND')return'RUNTIME_BOUND';
 if(t.evidenceStatus==='MODEL_ONLY')return'MODEL_BOUND';
 return'HELD_UNKNOWN';
}
function claimCeiling(state:RepresentationStateR435){
 if(state==='EMPIRICAL_BOUND')return'OBSERVED_EVIDENCE';
 if(state==='SOURCE_BOUND')return'SOURCE_BOUND_FACT';
 if(state==='RUNTIME_BOUND')return'RETURNED_RUNTIME_STATE';
 if(state==='MODEL_BOUND')return'DERIVED_MODEL';
 return'HELD_NO_POSITIVE_CLAIM';
}

export function compileRuntimeDerivedRepresentationR435(input:RepresentationInputR435){
 const address=Math.max(0,Math.min(20735,Math.floor(Number(input.address)||0)));
 const theta=((Math.floor(Number(input.theta)||0)%360)+360)%360;
 const record=input.record||corpusState(address);
 const surface=String(input.surface||'Convergence');
 const provenance=provenanceForSurfaceR94(surface);
 const fusion=compileAllModesTruthFusionR151(record);
 const truth=compileUniversalTruthEnvelopeR152({
  address,evidence:input.evidence||[],executionProof:input.executionProof||null,
  scar:{priorUncertainty:cl(record?.metrics?.uncertainty),priorContradiction:cl(record?.metrics?.contradiction)}
 });
 const typed=field(),sample=sampleR349FieldAtBearingR356(typed,address,theta),antipode=compareAntipodalFieldR356(typed,address,theta);
 const atlas=addressBearingSampleR356(address,theta);
 const plan=compileAtlas360ExecutionPlanR356({activeAddresses:[address],bearingStep:1,logicalCores:input.hardware?.logicalCores??1,deviceMemoryGB:input.hardware?.deviceMemoryGB??null,workerAvailable:input.hardware?.workerAvailable===true});
 const triangle=input.triangle?evaluateTriangleR356(input.triangle):{schema:'OMEGA_ATLAS360_TRIANGLE_EVALUATION_R356',gateState:'HOLD',reasons:['REAL_ANCHOR_TRIANGLE_NOT_SUPPLIED'],measurementDependent:true,measurementFabricated:false,canonicalMutation:false};
 const representationState=stateFromTruth(truth),ceiling=claimCeiling(representationState);
 const permissions={
  renderCanonicalAddress:true,
  renderAtlasGeometry:true,
  renderModelField:true,
  renderReturnedEvidence:truth.evidence.valid>0,
  renderEmpiricalClaim:representationState==='EMPIRICAL_BOUND',
  renderRuntimeClaim:representationState==='RUNTIME_BOUND'||representationState==='EMPIRICAL_BOUND',
  renderSourceClaim:['SOURCE_BOUND','RUNTIME_BOUND','EMPIRICAL_BOUND'].includes(representationState),
  renderTriangleClosure:triangle.gateState==='PASS',
  renderForecastAsForecast:truth.evidenceStatus!=='CONTRADICTED_EVIDENCE',
  renderForecastAsObserved:false,
  renderPhysicalMeasurement:representationState==='EMPIRICAL_BOUND'&&truth.evidence.empiricalCount>0,
  renderUnsupportedCompletion:false
 };
 const reasons=[
  ...(representationState==='HELD_UNKNOWN'?['NO_VERIFIED_EXTERNAL_OR_RUNTIME_EVIDENCE_BOUND']:[]),
  ...(representationState==='HELD_CONTRADICTION'?['VERIFIED_EVIDENCE_CONTRADICTION_RETAINED']:[]),
  ...(triangle.gateState!=='PASS'?triangle.reasons||[]:[]),
  ...(truth.uncertainty>.45?['HIGH_UNCERTAINTY']:[])
 ];
 const compact={address,theta,surface,state:representationState,ceiling,truth:truth.fingerprint,fusion:fusion.fingerprint,field:sample.state,antipode:antipode.invariantDelta,triangle:triangle.gateState,evidence:truth.evidence.packets.map((x:any)=>x.id)};
 const receipt=fnv(JSON.stringify(compact));
 return{
  schema:R435_SCHEMA,laws:R435_LAWS,boundary:R435_BOUNDARY,receipt,
  address,stateId:record.stateId,surface,representationState,claimCeiling:ceiling,reasons:[...new Set(reasons)].sort(),
  provenance:{primary:provenance.primary,inputs:provenance.inputs,proof:provenance.proof,forbidden:provenance.forbidden},
  truth:{status:truth.evidenceStatus,confidence:truth.truthConfidence,uncertainty:truth.uncertainty,weakestEdge:truth.weakestEdge,responsePath:truth.responsePath,nextAction:truth.nextAction,independentSourceFamilies:truth.evidence.independentSourceFamilies,validEvidence:truth.evidence.valid,empiricalCount:truth.evidence.empiricalCount,runtimeReceiptCount:truth.evidence.runtimeReceiptCount,packets:truth.evidence.packets},
  fusion:{channels:fusion.channelCount,truthConfidence:fusion.consensus.truthConfidence,agreement:fusion.consensus.agreement,fingerprint:fusion.fingerprint,canonicalOperator:fusion.operator.canonical,advisoryOperator:fusion.operator.advisory},
  field:{...sample.state,relativeMotionVector:sample.relativeMotionVector,source:sample.measurementSource},
  atlas:{hierarchy:atlas.hierarchy,bearing:atlas.bearing,source:R356_ATLAS360_SOURCE,execution:{pairCount:plan.pairCount,geometryBytes:plan.geometryBytes,workerCount:plan.workerCount,fullTensorMaterialized:plan.fullTensorMaterialized},antipode},
  triangle,permissions,canonicalMutation:false,productionAuthorityChanged:false
 };
}

import type {EvidencePacket as R126EvidencePacket,EvidenceKind} from './causal/causalInteractionRelativityR126';
import {corpusState,STATE_COUNT} from './corpusRuntime';
import {allModesTruthFusionAtAddressR151} from './allModesTruthFusionR151';

export const R152_SCHEMA='OMEGA_UNIVERSAL_TRUTH_ENVELOPE_R152' as const;
export const R152_LAWS=Object.freeze([
  'EVERY_DATUM_REQUIRES_SOURCE_FRAME_TIME_PROVENANCE_AND_UNCERTAINTY_WHEN_NUMERIC',
  'VERIFIED_EMPIRICAL_EVIDENCE_OUTWEIGHS_MODEL_AND_CANON_COHERENCE',
  'INDEPENDENT_SOURCE_FAMILIES_ARE_COUNTED_ONCE_PER_FAMILY_NOT_ONCE_PER_MODE',
  'ALL_MODES_OPERATE_ON_THE_SHARED_PACKET_WITHOUT_BECOMING_INDEPENDENT_OBSERVATIONS',
  'CONTRADICTION_IS_RETAINED_AS_RESIDUAL_NOT_AVERAGED_AWAY',
  'MISSING_DATA_RETURNS_UNKNOWN_OR_NEXT_ACTION_NOT_SYNTHETIC_COMPLETION',
  'INTERNAL_COHERENCE_CAN_PRIORITIZE_WHERE_TO_MEASURE_BUT_CANNOT_CREATE_MEASUREMENT',
  'CANONICAL_SOURCE_DISPATCH_AND_R125_ADMISSION_REMAIN_EXTERNAL_AUTHORITIES'
]);

export type UniversalEvidencePacketR152=R126EvidencePacket&{
  authority?:'MEASURED'|'REPLICATED'|'INTERVENTION'|'SIGNED_SOURCE'|'RUNTIME_RECEIPT'|'MODEL'|'DONOR_MODEL'|'OPERATOR_SUPPLIED';
  datasetId?:string;
  rowId?:string|number;
  field?:string;
};
export type TruthStatusR152='EMPIRICAL_STRONG'|'EMPIRICAL_PARTIAL'|'SOURCE_BOUND'|'RUNTIME_BOUND'|'MODEL_ONLY'|'CONTRADICTED_EVIDENCE'|'UNKNOWN_INSUFFICIENT';
export type ResponsePathR152='FAST_DETERMINISTIC'|'ROUTED_MODEL_FULL'|'MEASURE_OR_FETCH'|'VERIFY_CONTRADICTION'|'EXECUTION_PROOF_REQUIRED';
export type UniversalTruthInputR152={
  address:number;
  claimId?:string;
  claim?:string;
  intent?:string;
  evidence?:UniversalEvidencePacketR152[];
  executionProof?:{state?:string;verified?:boolean;receiptId?:string;fingerprint?:string}|null;
  scar?:{priorUncertainty?:number;priorContradiction?:number}|null;
};

type EvaluatedDatum={
  packet:UniversalEvidencePacketR152;
  validation:{ok:boolean;errors:string[];weight:number};
  weight:number;
  role:'SUPPORT'|'CONTRADICT'|'RELEVANT';
};

const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const validIso=(s:any)=>typeof s==='string'&&Number.isFinite(Date.parse(s));
const fnv1a32=(text:string)=>{let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)}return(h>>>0).toString(16).padStart(8,'0')};
const KIND_WEIGHT:Record<EvidenceKind,number>={MEASUREMENT:.92,INTERVENTION:1,REPLICATION:.97,MODEL:.35,SOURCE:.72,NEGATIVE_RESULT:.84};
const AUTH_WEIGHT:Record<string,number>={MEASURED:1,REPLICATED:1,INTERVENTION:1,SIGNED_SOURCE:.88,RUNTIME_RECEIPT:.82,MODEL:.4,DONOR_MODEL:.30,OPERATOR_SUPPLIED:.45};

function datumWeight(e:UniversalEvidencePacketR152){
  const uncertainty=e.quantity?.uncertainty==null?0.18:cl(e.quantity.uncertainty);
  const authority=AUTH_WEIGHT[String(e.authority||'')]??.62;
  const reproducibilityBoost=e.reproducible?.06:0;
  const verified=e.verified?1:0;
  return cl((KIND_WEIGHT[e.kind]??.4)*authority*(1-.55*uncertainty)+reproducibilityBoost)*verified;
}

function validateDatum(e:UniversalEvidencePacketR152){
  const errors:string[]=[];
  if(!e.id)errors.push('id');
  if(!e.source)errors.push('source');
  if(!e.sourceFamily)errors.push('sourceFamily');
  if(!e.claim)errors.push('claim');
  if(!validIso(e.observedAt))errors.push('observedAt');
  if(!e.frame?.space)errors.push('frame.space');
  if(!e.frame?.time)errors.push('frame.time');
  if(!e.verified)errors.push('verified');
  if(e.quantity){
    if(!Number.isFinite(Number(e.quantity.value)))errors.push('quantity.value');
    if(!e.quantity.unit)errors.push('quantity.unit');
    if(e.quantity.uncertainty!=null&&(!Number.isFinite(Number(e.quantity.uncertainty))||Number(e.quantity.uncertainty)<0))errors.push('quantity.uncertainty');
  }
  return{ok:errors.length===0,errors,weight:errors.length?0:datumWeight(e)};
}

function evidenceRole(e:UniversalEvidencePacketR152,claimId:string):EvaluatedDatum['role']{
  if(!claimId)return'RELEVANT';
  if(e.contradicts?.includes(claimId))return'CONTRADICT';
  if(e.supports?.includes(claimId))return'SUPPORT';
  return'RELEVANT';
}

function strongestByFamily(rows:EvaluatedDatum[]){
  const map=new Map<string,EvaluatedDatum>();
  for(const row of rows){
    const key=row.packet.sourceFamily||row.packet.source;
    const prior=map.get(key);
    if(!prior||row.weight>prior.weight)map.set(key,row);
  }
  return[...map.values()];
}

const averageWeight=(rows:EvaluatedDatum[])=>cl(rows.reduce((n,x)=>n+x.weight,0)/Math.max(1,rows.length));

export function compileUniversalTruthEnvelopeR152(input:UniversalTruthInputR152){
  const address=Math.max(0,Math.min(STATE_COUNT-1,Math.floor(Number(input.address)||0)));
  const record=corpusState(address);
  const fusion=allModesTruthFusionAtAddressR151(address);
  const claimId=String(input.claimId||'').trim();
  const rows:EvaluatedDatum[]=(input.evidence||[]).map(packet=>{
    const validation=validateDatum(packet);
    return{packet,validation,weight:validation.weight,role:evidenceRole(packet,claimId)};
  });
  const valid=rows.filter(x=>x.validation.ok);
  const invalid=rows.filter(x=>!x.validation.ok);
  const familyRows=strongestByFamily(valid);
  const support=familyRows.filter(x=>x.role==='SUPPORT'||(!claimId&&x.role==='RELEVANT'));
  const contradict=familyRows.filter(x=>x.role==='CONTRADICT');
  const empirical=support.filter(x=>['MEASUREMENT','INTERVENTION','REPLICATION','NEGATIVE_RESULT'].includes(x.packet.kind));
  const sources=support.filter(x=>x.packet.kind==='SOURCE');
  const models=support.filter(x=>x.packet.kind==='MODEL');
  const runtime=support.filter(x=>x.packet.authority==='RUNTIME_RECEIPT');
  const families=new Set(support.map(x=>x.packet.sourceFamily));
  const supportMass=cl(support.reduce((n,x)=>n+x.weight,0)/Math.max(1,Math.min(3,families.size||1)));
  const contradictionMass=cl(contradict.reduce((n,x)=>n+x.weight,0)/Math.max(1,contradict.length));
  const meanDatumUncertainty=support.length?support.reduce((n,x)=>n+cl(x.packet.quantity?.uncertainty??.18),0)/support.length:1;
  const executionVerified=input.executionProof?.verified===true||String(input.executionProof?.state||'')==='VERIFIED';
  const internalTruth=cl(fusion.consensus.truthConfidence);
  const internalAgreement=cl(fusion.consensus.agreement);

  const empiricalMass=averageWeight(empirical);
  const sourceMass=averageWeight(sources);
  const modelMass=averageWeight(models);
  const runtimeMass=averageWeight(runtime);
  const externalAuthority=cl(.68*empiricalMass+.20*sourceMass+.12*(executionVerified?1:runtimeMass));
  const truthConfidence=valid.length
    ?cl(.78*externalAuthority+.12*supportMass+.06*internalTruth+.04*internalAgreement)
    :cl(.28*internalTruth+.12*internalAgreement);
  const uncertainty=cl(Math.max(
    meanDatumUncertainty,
    1-truthConfidence,
    .85*contradictionMass,
    invalid.length?Math.min(.5,invalid.length/Math.max(1,rows.length)):0
  ));
  const priorU=cl(input.scar?.priorUncertainty??0);
  const priorQ=cl(input.scar?.priorContradiction??0);
  const carriedUncertainty=cl(.82*priorU+.18*uncertainty);
  const carriedContradiction=cl(.82*priorQ+.18*contradictionMass);

  let evidenceStatus:TruthStatusR152='UNKNOWN_INSUFFICIENT';
  if(contradictionMass>=.45)evidenceStatus='CONTRADICTED_EVIDENCE';
  else if(empirical.length>=2&&families.size>=2&&empiricalMass>=.68&&truthConfidence>=.68)evidenceStatus='EMPIRICAL_STRONG';
  else if(empirical.length>0)evidenceStatus='EMPIRICAL_PARTIAL';
  else if(sources.length>0)evidenceStatus='SOURCE_BOUND';
  else if(executionVerified||runtime.length>0)evidenceStatus='RUNTIME_BOUND';
  else if(models.length>0||fusion.channelCount>0)evidenceStatus='MODEL_ONLY';

  let responsePath:ResponsePathR152='ROUTED_MODEL_FULL';
  let nextAction='SYNTHESIZE_WITH_TRUTH_BOUNDARY';
  if(evidenceStatus==='EMPIRICAL_STRONG'){
    responsePath='FAST_DETERMINISTIC';
    nextAction='CARRY_VERIFIED_EVIDENCE';
  }else if(evidenceStatus==='CONTRADICTED_EVIDENCE'){
    responsePath='VERIFY_CONTRADICTION';
    nextAction='PRESERVE_CONTRADICTION_AND_ACQUIRE_INDEPENDENT_CHECK';
  }else if(!valid.length||evidenceStatus==='MODEL_ONLY'){
    responsePath='MEASURE_OR_FETCH';
    nextAction='ACQUIRE_VERIFIED_EXTERNAL_EVIDENCE';
  }else if(input.executionProof&&!executionVerified){
    responsePath='EXECUTION_PROOF_REQUIRED';
    nextAction='VERIFY_EXECUTION_RECEIPT_BEFORE_USE';
  }else if(uncertainty>.45){
    responsePath='MEASURE_OR_FETCH';
    nextAction='TARGET_WEAKEST_UNCERTAINTY';
  }

  const weakestEdge=contradictionMass>=.45?'CONTRADICTORY_VERIFIED_EVIDENCE'
    :invalid.length?'INVALID_OR_INCOMPLETE_EVIDENCE_PACKET'
    :!valid.length?'NO_VERIFIED_EXTERNAL_EVIDENCE'
    :families.size<2?'LOW_SOURCE_INDEPENDENCE'
    :uncertainty>.45?'HIGH_UNCERTAINTY'
    :fusion.consensus.agreement<.55?'INTERNAL_MODE_DISAGREEMENT'
    :'NO_DOMINANT_WEAK_EDGE';

  const compact={
    address,claimId,evidenceStatus,truthConfidence,uncertainty,carriedUncertainty,carriedContradiction,
    validEvidence:valid.map(x=>({id:x.packet.id,family:x.packet.sourceFamily,kind:x.packet.kind,weight:x.weight,role:x.role})),
    invalidEvidence:invalid.map(x=>({id:x.packet.id,errors:x.validation.errors})),
    fusion:fusion.fingerprint,
    execution:input.executionProof?.fingerprint||input.executionProof?.receiptId||null,
    responsePath,nextAction,weakestEdge
  };

  return{
    schema:R152_SCHEMA,laws:R152_LAWS,address,stateId:record.stateId,claimId:claimId||null,
    claim:String(input.claim||'').trim()||null,intent:String(input.intent||'').trim()||null,
    evidenceStatus,responsePath,nextAction,weakestEdge,truthConfidence,uncertainty,
    scarCarry:{priorUncertainty:priorU,priorContradiction:priorQ,uncertainty:carriedUncertainty,contradiction:carriedContradiction},
    evidence:{
      supplied:rows.length,valid:valid.length,invalid:invalid.length,independentSourceFamilies:families.size,
      empiricalCount:empirical.length,sourceCount:sources.length,modelCount:models.length,runtimeReceiptCount:runtime.length,
      supportMass,contradictionMass,externalAuthority,modelEvidenceMass:modelMass,
      packets:valid.map(x=>({
        id:x.packet.id,kind:x.packet.kind,source:x.packet.source,sourceFamily:x.packet.sourceFamily,
        observedAt:x.packet.observedAt,frame:x.packet.frame,quantity:x.packet.quantity,authority:x.packet.authority||null,
        datasetId:x.packet.datasetId||null,rowId:x.packet.rowId??null,field:x.packet.field||null,
        weight:x.weight,role:x.role,hash:x.packet.hash||null
      }))
    },
    allModes:{
      schema:fusion.schema,channels:fusion.channelCount,truthConfidence:internalTruth,agreement:internalAgreement,
      truthClass:fusion.consensus.truthClass,canonicalOperator:fusion.operator.canonical,advisoryOperator:fusion.operator.advisory,
      fingerprint:fusion.fingerprint,weakestTrusted:fusion.weakestTrusted?.name||null,outliers:fusion.outliers.slice(0,5)
    },
    executionProof:input.executionProof||null,
    appliedModes:{sourceModes:fusion.sourceModeCount,canonAuthorities:fusion.canonAuthorityCount,totalChannels:fusion.channelCount,provenance:fusion.provenance},
    fingerprint:fnv1a32(JSON.stringify(compact)),canonicalMutation:false,canonicalAdmissionAuthority:'R125',
    truthBoundary:'R152 is a maximum-available truth envelope, not absolute or omniscient truth. Verified empirical evidence and independent source families outrank model/canon coherence. R151 all-mode agreement supplies internal coherence and measurement priority only. Missing, contradictory or unverified data remain explicit; execution truth, physical validation and R125 CanonState admission remain separate.'
  };
}

export function normalizeUniversalEvidenceR152(input:{
  id:string;source:string;sourceFamily:string;observedAt:string;space:string;timeFrame:string;claim:string;
  kind:EvidenceKind;verified:boolean;value?:number;unit?:string;uncertainty?:number;
  authority?:UniversalEvidencePacketR152['authority'];datasetId?:string;rowId?:string|number;field?:string;
  supports?:string[];contradicts?:string[];
}):UniversalEvidencePacketR152{
  return{
    id:input.id,kind:input.kind,source:input.source,sourceFamily:input.sourceFamily,observedAt:input.observedAt,
    frame:{space:input.space,time:input.timeFrame},
    quantity:input.value==null?undefined:{value:Number(input.value),unit:String(input.unit||'dimensionless'),uncertainty:input.uncertainty},
    claim:input.claim,supports:input.supports,contradicts:input.contradicts,verified:input.verified,
    authority:input.authority,datasetId:input.datasetId,rowId:input.rowId,field:input.field
  };
}

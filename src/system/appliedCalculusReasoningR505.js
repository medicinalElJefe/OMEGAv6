import {referenceDeterministicWorkerAttestationR503} from './calculusNativeAutonomyR503.js';

export const R505_APPLIED_CALCULUS_SCHEMA='OMEGA_APPLIED_CALCULUS_REASONING_R505';

const uniq=a=>[...new Set(Array.isArray(a)?a.map(v=>String(v).trim()).filter(Boolean):[])];

export function allowedAppliedCalculusR505(packet){
 return new Set([
  ...(packet?.calculus?.operators||[]),
  ...(packet?.calculus?.decisionLaw||[]),
  ...(packet?.calculus?.proofSequence||[]),
  ...(packet?.calculus?.relationalLoop||[]),
  'CAPABILITY_LINEAGE_NOT_ROUTE',
  'HEIGHTENED_MODE',
 ]);
}

export function bindAppliedReasoningWorkerR505(packet,proposal,{residualId=null}={}){
 const reasons=[];
 if(!packet||packet.schema!=='OMEGA_CALCULUS_NATIVE_WORKER_PACKET_R503')reasons.push('R505_PACKET_INVALID');
 if(String(proposal?.calculusContextId||'')!==String(packet?.contextId||''))reasons.push('R505_CONTEXT_ID_MISMATCH');

 const applied=uniq(proposal?.appliedCalculus);
 if(applied.length<2)reasons.push('R505_APPLIED_CALCULUS_MINIMUM_REQUIRED');
 const allowed=allowedAppliedCalculusR505(packet);
 for(const item of applied)if(!allowed.has(item))reasons.push('R505_APPLIED_CALCULUS_UNKNOWN_'+item.replace(/[^A-Z0-9_]/gi,'_').toUpperCase());

 const alternatives=uniq(proposal?.alternativesConsidered);
 if(alternatives.length<2)reasons.push('R505_MULTIPLE_ALTERNATIVES_REQUIRED');
 const evidence=uniq(proposal?.residualEvidenceIds);
 if(evidence.length<1)reasons.push('R505_RESIDUAL_EVIDENCE_REQUIRED');
 if(residualId&&String(proposal?.developmentalDelta?.intendedResidual||'')!==String(residualId))reasons.push('R505_INTENDED_RESIDUAL_MISMATCH');

 if(reasons.length)return{schema:R505_APPLIED_CALCULUS_SCHEMA,valid:false,reasons,proposal:null,contextId:packet?.contextId||null};

 const attestation=referenceDeterministicWorkerAttestationR503(packet);
 attestation.workerClass='REASONING_DEVELOPER';
 attestation.alternativesConsidered=[...alternatives];
 attestation.residualEvidenceIds=[...evidence];
 attestation.developmentalDelta=structuredClone(proposal.developmentalDelta||{});

 const boundProposal={
  ...proposal,
  calculusContextId:packet.contextId,
  appliedCalculus:applied,
  alternativesConsidered:alternatives,
  residualEvidenceIds:evidence,
  workerAttestation:attestation,
 };
 return{
  schema:R505_APPLIED_CALCULUS_SCHEMA,
  valid:true,
  reasons:[],
  proposal:boundProposal,
  contextId:packet.contextId,
  appliedCalculus:applied,
 };
}

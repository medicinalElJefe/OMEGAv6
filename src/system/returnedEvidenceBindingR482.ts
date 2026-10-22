import {evaluateReturnedClosureR480,type R480ClosureTarget} from './truthGateClosureFrontierR480';

export const R482_BINDING_SCHEMA='OMEGA_RETURNED_EVIDENCE_BINDING_R482' as const;
export type R482Receipt={kind:'HYBRID_SNAPSHOT'|'HOST_PROFILE'|'MISSION_RETURN'|'GPU_FRAME'|'RCWA_RESULT'|'EARTH_PROVIDER'|'SAR_RESULT';current?:boolean;authenticated?:boolean;nonRevoked?:boolean;r141ExactFingerprint?:boolean;profileReturned?:boolean;gpuPresent?:boolean;referenceSemanticsMatch?:boolean;deterministicFrame?:boolean;missionReturned?:boolean;solverHeartbeat?:boolean;fullwaveReturned?:boolean;converged?:boolean;energyBalanced?:boolean;providerResponse?:boolean;sourceTimestamp?:boolean;provenance?:boolean;stalenessClassified?:boolean;projectionFrame?:boolean;grdOrSlc?:boolean;deformationUncertainty?:boolean};

export function evidenceIdsFromReturnedReceiptsR482(receipts:readonly R482Receipt[]):readonly string[]{
 const ids=new Set<string>();
 for(const r of receipts){
  if(r.kind==='HYBRID_SNAPSHOT'&&r.current&&r.authenticated&&r.nonRevoked)ids.add('CURRENT_AUTHENTICATED_NON_REVOKED_HEARTBEAT');
  if(r.kind==='HOST_PROFILE'&&r.current&&r.authenticated&&r.r141ExactFingerprint&&r.profileReturned){
   ids.add('CURRENT_AUTHENTICATED_DEVICE_HEARTBEAT');ids.add('R141_EXACT_RETURN_FINGERPRINT');ids.add('RETURNED_GPU_PROFILE');
   if(r.gpuPresent)ids.add('CURRENT_DEVICE_OR_BROWSER_GPU_CAPABILITY');
  }
  if(r.kind==='MISSION_RETURN'&&r.current&&r.authenticated&&r.r141ExactFingerprint&&r.missionReturned)ids.add('MISSION_RETURN_RECEIPT');
  if(r.kind==='GPU_FRAME'&&r.current&&r.referenceSemanticsMatch)ids.add('CPU_GPU_REFERENCE_SEMANTIC_CORRESPONDENCE');
  if(r.kind==='GPU_FRAME'&&r.current&&r.referenceSemanticsMatch)ids.add('REFERENCE_SEMANTICS_MATCH');
  if(r.kind==='GPU_FRAME'&&r.current&&r.deterministicFrame)ids.add('DETERMINISTIC_FRAME_RECEIPT');
  if(r.kind==='RCWA_RESULT'&&r.current&&r.authenticated&&r.solverHeartbeat)ids.add('CURRENT_SOVEREIGN_SOLVER_HEARTBEAT');
  if(r.kind==='RCWA_RESULT'&&r.current&&r.authenticated&&r.fullwaveReturned)ids.add('RETURNED_RCWA_OR_OTHER_DECLARED_FULLWAVE_RESULT');
  if(r.kind==='RCWA_RESULT'&&r.current&&r.converged&&r.energyBalanced)ids.add('CONVERGENCE_AND_ENERGY_BALANCE_PROOF');
  if(r.kind==='EARTH_PROVIDER'&&r.current&&r.providerResponse)ids.add('CURRENT_PROVIDER_RESPONSE');
  if(r.kind==='EARTH_PROVIDER'&&r.sourceTimestamp)ids.add('SOURCE_TIMESTAMP');
  if(r.kind==='EARTH_PROVIDER'&&r.provenance)ids.add('PROVENANCE_RECEIPT');
  if(r.kind==='EARTH_PROVIDER'&&r.stalenessClassified)ids.add('STALENESS_CLASSIFICATION');
  if(r.kind==='SAR_RESULT'&&r.provenance)ids.add('SOURCE_PROVENANCE');
  if(r.kind==='SAR_RESULT'&&r.projectionFrame)ids.add('PROJECTION_FRAME_PROOF');
  if(r.kind==='SAR_RESULT'&&r.grdOrSlc)ids.add('RETURNED_GRD_OR_SLC_EVIDENCE');
  if(r.kind==='SAR_RESULT'&&r.deformationUncertainty)ids.add('DEFORMATION_UNCERTAINTY');
 }
 return Object.freeze([...ids].sort());
}

export function evaluateReceiptBoundClosureR482(target:R480ClosureTarget,receipts:readonly R482Receipt[]){
 const evidenceIds=evidenceIdsFromReturnedReceiptsR482(receipts);
 const closure=evaluateReturnedClosureR480(target,evidenceIds);
 return Object.freeze({schema:R482_BINDING_SCHEMA,capabilityId:target.capabilityId,evidenceIds,closure,canonicalAdmission:false as const,admissionAuthority:'R125' as const,truthBoundary:'Only fields present on returned current receipts are translated into R480 evidence. R482 never synthesizes a heartbeat, provider response, solver result, GPU equivalence, or physical measurement.'});
}

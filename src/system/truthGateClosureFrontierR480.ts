import {YEAR_CORPUS_CAPABILITY_GRAPH_R474,type CapabilityNodeR474} from '../yearCorpusCapabilityGraphR474';
import {compileWholeCorpusResidualsR479} from './wholeCorpusConvergenceMissionR479';

export const R480_CLOSURE_SCHEMA='OMEGA_TRUTH_GATE_CLOSURE_FRONTIER_R480' as const;
export type R480ClosureState='IMPLEMENTED_AWAITING_RETURN'|'EXTERNAL_EVIDENCE_REQUIRED'|'ADAPTER_REQUIRES_DIRECT_EXECUTOR';
export type R480ClosureTarget={capabilityId:string;pillar:string;state:R480ClosureState;requiredEvidence:readonly string[];maySelfClose:false};

const REQUIREMENTS:Readonly<Record<string,readonly string[]>>=Object.freeze({
 GPU:['CURRENT_DEVICE_OR_BROWSER_GPU_CAPABILITY','CPU_GPU_REFERENCE_SEMANTIC_CORRESPONDENCE','DETERMINISTIC_FRAME_RECEIPT'],
 GPU_NATIVE_V12:['CURRENT_AUTHENTICATED_DEVICE_HEARTBEAT','RETURNED_GPU_PROFILE','REFERENCE_SEMANTICS_MATCH'],
 HYBRID:['CURRENT_AUTHENTICATED_NON_REVOKED_HEARTBEAT','R141_EXACT_RETURN_FINGERPRINT','MISSION_RETURN_RECEIPT'],
 OPTICAL:['CURRENT_SOVEREIGN_SOLVER_HEARTBEAT','RETURNED_RCWA_OR_OTHER_DECLARED_FULLWAVE_RESULT','CONVERGENCE_AND_ENERGY_BALANCE_PROOF'],
 SAR:['SOURCE_PROVENANCE','PROJECTION_FRAME_PROOF','RETURNED_GRD_OR_SLC_EVIDENCE','DEFORMATION_UNCERTAINTY'],
 EARTH_EVIDENCE:['CURRENT_PROVIDER_RESPONSE','SOURCE_TIMESTAMP','PROVENANCE_RECEIPT','STALENESS_CLASSIFICATION'],
});

function stateFor(n:CapabilityNodeR474):R480ClosureState{
 if(n.strongestImplementation.state==='EXECUTES_AS_ADAPTER')return'ADAPTER_REQUIRES_DIRECT_EXECUTOR';
 if(['GPU','GPU_NATIVE_V12','HYBRID','OPTICAL'].includes(n.identity.id))return'IMPLEMENTED_AWAITING_RETURN';
 return'EXTERNAL_EVIDENCE_REQUIRED';
}

export function compileTruthGateClosureFrontierR480(graph:readonly CapabilityNodeR474[]=YEAR_CORPUS_CAPABILITY_GRAPH_R474):readonly R480ClosureTarget[]{
 const residualIds=new Set(compileWholeCorpusResidualsR479(graph).filter(x=>x.class==='TRUTH_GATE'||x.class==='ADAPTER_GAP').map(x=>x.capabilityId));
 return Object.freeze(graph.filter(n=>residualIds.has(n.identity.id)).map(n=>Object.freeze({
  capabilityId:n.identity.id,pillar:n.pillar,state:stateFor(n),
  requiredEvidence:REQUIREMENTS[n.identity.id]||Object.freeze(['DIRECT_EXECUTOR_OR_EXTERNAL_RETURN','PROVENANCE_RECEIPT','CURRENT_PROOF']),
  maySelfClose:false as const,
 })));
}

export function evaluateReturnedClosureR480(target:R480ClosureTarget,returnedEvidenceIds:readonly string[]){
 const evidence=new Set(returnedEvidenceIds.filter(Boolean));
 const missing=target.requiredEvidence.filter(x=>!evidence.has(x));
 return Object.freeze({
  schema:R480_CLOSURE_SCHEMA,capabilityId:target.capabilityId,state:target.state,
  requiredEvidence:target.requiredEvidence,returnedEvidenceIds:Object.freeze([...evidence].sort()),missing,
  closed:missing.length===0,
  canonicalAdmission:false as const,
  admissionAuthority:'R125' as const,
  truthBoundary:'Closure is evidence-driven. Source code, CI, pairing, queue success, browser labels, or historical archives cannot substitute for a required current external/device return.'
 });
}

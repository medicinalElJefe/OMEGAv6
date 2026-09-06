import {classifyResidual,proposalFor,type BuildProposal,type EvidenceRef,type RepairRecipe,type Residual,type ResidualKind,type ResidualSeverity} from './accuracyResidualEngineR125';
import type {CapabilityExecutionReceiptR142} from './capabilityExecutionReceiptsR142';

export const R143_SCHEMA='OMEGA_EXECUTION_RESIDUAL_CLOSURE_R143' as const;
export const R143_REVISION='R143' as const;
export const R143_LAWS=Object.freeze([
 'EXECUTION_STATE_PRECEDES_RESIDUAL_CLASSIFICATION',
 'AVAILABLE_WITHOUT_INVOCATION_IS_NOT_A_DEFECT',
 'INVOKED_WITHOUT_TIMEOUT_IS_NOT_A_DEFECT',
 'RETURNED_WITHOUT_VERIFICATION_REMAINS_A_PROOF_RESIDUAL',
 'FINGERPRINT_DIGEST_OR_SEMANTIC_MISMATCH_IS_A_TRUTH_BOUNDARY_RISK',
 'ONLY_EXPLICIT_NEGATIVE_OR_STALE_EXECUTION_STATE_CREATES_A_REPAIR_RESIDUAL',
 'R125_REMAINS_RESIDUAL_CONFIDENCE_AND_REPAIR_POLICY_AUTHORITY',
 'R124_REMAINS_GOVERNED_SELF_BUILD_CANDIDATE_AUTHORITY',
 'R141_REMAINS_EXACT_HYBRID_PAYLOAD_PROOF_AUTHORITY',
 'REPAIR_ELIGIBILITY_NEVER_EQUALS_CANONSTATE_ADMISSION',
 'NO_RESIDUAL_REPAIR_MAY_SET_CANONICAL_MUTATION_TRUE',
 'R125_REMAINS_THE_CANONSTATE_ADMISSION_AUTHORITY'
]);

export const R143_REPAIR_RECIPES:RepairRecipe[]=[
 {id:'RR143-HYBRID-PROOF-REPLAY',handles:['INVARIANT_GAP'],risk:'LOW',requires:['returned-payload','R141-exact-payload-closure','replay-endpoint'],preserves:['R141','R134','R136','R140','R142','R125','canonicalMutation=false'],generator:'R141_REPLAY_EXISTING_PAYLOAD'},
 {id:'RR143-SOURCE-REFRESH',handles:['SOURCE_LINEAGE_GAP'],risk:'LOW',requires:['registered-source','bounded-refetch','lineage-recheck'],preserves:['source-lineage','truth-boundary','R125','canonicalMutation=false'],generator:'REFRESH_REGISTERED_SOURCE_AND_REVERIFY'},
 {id:'RR143-CAPABILITY-REWIRE',handles:['CAPABILITY_UNWIRED'],risk:'MEDIUM',requires:['registered-capability','dependency-proof','focused-regression'],preserves:['R139','R140','R142','R125','canonicalMutation=false'],generator:'R124_GOVERNED_REWIRE_CANDIDATE'},
 {id:'RR143-TEST-DIAGNOSTIC',handles:['TEST_FAILURE'],risk:'MEDIUM',requires:['reproducible-failure','focused-test','inherited-gates'],preserves:['failed-state-visible','rollback-lineage','R125','canonicalMutation=false'],generator:'R124_GOVERNED_TEST_REPAIR_CANDIDATE'},
 {id:'RR143-BUILD-DIAGNOSTIC',handles:['BUILD_FAILURE'],risk:'MEDIUM',requires:['reproducible-build-failure','build-log','inherited-gates'],preserves:['build-truth','rollback-lineage','R125','canonicalMutation=false'],generator:'R124_GOVERNED_BUILD_REPAIR_CANDIDATE'},
 {id:'RR143-DEPLOYMENT-REVERIFY',handles:['DEPLOYMENT_UNPROVEN'],risk:'LOW',requires:['canonical-url','bounded-live-probe','release-lineage'],preserves:['deployment-truth','R125','canonicalMutation=false'],generator:'REPROBE_CANONICAL_DEPLOYMENT'}
];

export type ExecutionResidualClosureR143={
 schema:typeof R143_SCHEMA;
 revision:typeof R143_REVISION;
 receipts:CapabilityExecutionReceiptR142[];
 residuals:Residual[];
 proposals:BuildProposal[];
 autoRepairEligible:BuildProposal[];
 blocked:BuildProposal[];
 canonicalMutation:false;
 admissionAuthority:'R125';
 selfBuildAuthority:'R124';
 proofAuthority:'R141';
 truthBoundary:string;
};

const nowIso=()=>new Date().toISOString();
const evidenceId=(r:CapabilityExecutionReceiptR142,suffix:string)=>`R143:${r.receiptId}:${suffix}`;

function executionEvidenceR143(r:CapabilityExecutionReceiptR142):EvidenceRef[]{
 const observedAt=r.finishedAt||r.startedAt||nowIso();
 const out:EvidenceRef[]=[{id:evidenceId(r,'runtime'),kind:'RUNTIME',source:r.source,observedAt,claim:`R142 execution lifecycle state is ${r.state}`,verified:true,value:r.state}];
 if(r.responseHash)out.push({id:evidenceId(r,'source'),kind:'SOURCE',source:r.route||r.capabilityId,observedAt,claim:'returned execution fingerprint is present',verified:true,value:r.responseHash});
 if(r.proofRef)out.push({id:evidenceId(r,'proof'),kind:'PROOF',source:r.proofRef,observedAt,claim:'execution proof reference is present',verified:true,value:r.proofRef});
 if(r.failureReason)out.push({id:evidenceId(r,'failure'),kind:'TEST',source:r.source,observedAt,claim:'runtime reported an explicit failure reason',verified:true,value:r.failureReason});
 return out;
}

function mismatchReason(r:CapabilityExecutionReceiptR142){return /fingerprint|digest|semantic|mismatch|truth.boundary|tamper/i.test(r.failureReason||'')}

function residualClassR143(r:CapabilityExecutionReceiptR142):{kind:ResidualKind;severity:ResidualSeverity;summary:string}|null{
 if(r.state==='VERIFIED'||r.state==='AVAILABLE'||r.state==='AUTHORIZED'||r.state==='DISCOVERED'||r.state==='INVOKED')return null;
 if(r.state==='RETURNED')return{kind:'INVARIANT_GAP',severity:'MEDIUM',summary:`${r.capabilityId} returned output but has not satisfied verification.`};
 if(r.state==='STALE')return{kind:'SOURCE_LINEAGE_GAP',severity:'HIGH',summary:`${r.capabilityId} execution evidence is stale and requires bounded source refresh/reverification.`};
 if(r.state==='UNAVAILABLE')return{kind:'CAPABILITY_UNWIRED',severity:'MEDIUM',summary:`${r.capabilityId} is explicitly unavailable in the execution fabric.`};
 if(r.state==='REJECTED'||mismatchReason(r))return{kind:'TRUTH_BOUNDARY_RISK',severity:'CRITICAL',summary:`${r.capabilityId} execution was rejected or violated exact proof identity; autonomous mutation is blocked.`};
 if(r.state==='FAILED'&&r.domain==='BUILD')return{kind:'BUILD_FAILURE',severity:'MEDIUM',summary:`${r.capabilityId} reported a reproducible build execution failure.`};
 if(r.state==='FAILED')return{kind:'TEST_FAILURE',severity:'MEDIUM',summary:`${r.capabilityId} reported an execution failure that requires bounded diagnosis.`};
 return null;
}

export function residualFromExecutionReceiptR143(r:CapabilityExecutionReceiptR142):Residual|null{
 const c=residualClassR143(r);if(!c)return null;
 return classifyResidual({id:`XR-${r.receiptId}`,kind:c.kind,severity:c.severity,summary:c.summary,evidence:executionEvidenceR143(r),affected:[r.capabilityId,r.route||r.domain],reproducible:Boolean(r.returned||r.failureReason||r.state==='STALE'||r.state==='UNAVAILABLE')});
}

export function compileExecutionResidualClosureR143(receipts:CapabilityExecutionReceiptR142[]):ExecutionResidualClosureR143{
 const residuals=receipts.map(residualFromExecutionReceiptR143).filter((x):x is Residual=>Boolean(x));
 const proposals=residuals.map(r=>proposalFor(r,R143_REPAIR_RECIPES));
 return{schema:R143_SCHEMA,revision:R143_REVISION,receipts,residuals,proposals,autoRepairEligible:proposals.filter(p=>p.mode==='AUTO_REPAIR'),blocked:proposals.filter(p=>p.mode==='BLOCK'),canonicalMutation:false,admissionAuthority:'R125',selfBuildAuthority:'R124',proofAuthority:'R141',truthBoundary:'R143 may detect execution residuals and identify bounded repair eligibility. It cannot convert route readiness into execution proof, cannot weaken R141 exact-payload verification, cannot bypass R124 governed self-build, and cannot mutate CanonState outside R125 admission.'};
}

export function boundedRepairActionR143(receipt:CapabilityExecutionReceiptR142,proposal:BuildProposal|undefined){
 if(!proposal||proposal.mode==='BLOCK'||proposal.mode==='OBSERVE_ONLY')return null;
 if(proposal.recipeId==='RR143-HYBRID-PROOF-REPLAY'&&receipt.domain==='HYBRID'&&receipt.receiptId.startsWith('hybrid:')){
  const jobId=receipt.receiptId.slice('hybrid:'.length);
  return{kind:'POST' as const,path:`/api/hybrid/jobs/${encodeURIComponent(jobId)}/replay`,label:'Replay exact Hybrid proof',authority:'R141' as const,canonicalMutation:false as const,admissionAuthority:'R125' as const};
 }
 return{kind:'GOVERNED_CANDIDATE' as const,path:null,label:`Route ${proposal.recipeId} through R124 governed self-build`,authority:'R124' as const,canonicalMutation:false as const,admissionAuthority:'R125' as const};
}

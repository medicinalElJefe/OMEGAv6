/** Governed successor-cycle admission for an exhausted R170 roadmap.
 * Never edits R170's five admitted generations or grants mutation authority.
 * Requires independently attested new source bodies before activation. */
export const R535_SUCCESSOR_SCHEMA='OMEGA_R535_SELFBUILD_SUCCESSOR_ADMISSION';
export function evaluateSuccessorCycleR535({priorState={},capsules=[],sourceProofs=[],deploymentProof=null}={}){
 const reasons=[];
 const admitted=new Set(priorState.admittedSourceCapsules||[]);
 const original=Array.isArray(priorState.roadmap)?priorState.roadmap:[];
 const originalIds=new Set(original.map(x=>x.id));
 if(admitted.size!==Number(priorState.maxAutonomousGenerations)||original.some(x=>!admitted.has(x.id)))reasons.push('PRIOR_CYCLE_NOT_FULLY_CLOSED');
 if(priorState.currentCapsuleId)reasons.push('PRIOR_CANDIDATE_PENDING');
 if(!Array.isArray(capsules)||capsules.length===0)reasons.push('NO_NEW_CAPSULES');
 if(capsules.length>5)reasons.push('SUCCESSOR_BATCH_LIMIT_5');
 const seen=new Set();
 const successorIds=new Set((Array.isArray(capsules)?capsules:[]).map(c=>String(c?.id||'')));
 const dependencyGraph=new Map();
 const proofRows=Array.isArray(sourceProofs)?sourceProofs:[];
 const proofIds=new Set();
 for(const proof of proofRows){if(proofIds.has(proof?.capsuleId))reasons.push('DUPLICATE_SOURCE_PROOF:'+String(proof?.capsuleId));proofIds.add(proof?.capsuleId)}
 for(const c of capsules){
  const id=String(c?.id||'');
  if(!id||seen.has(id)||originalIds.has(id)||admitted.has(id))reasons.push('DUPLICATE_OR_REUSED_CAPSULE:'+id);
  seen.add(id);
  if(!String(c?.target||'').startsWith('src/generated/selfbuildR535/'))reasons.push('UNSCOPED_TARGET:'+id);
  if(!Array.isArray(c?.prerequisites)||c.prerequisites.some(x=>typeof x!=='string'||(!admitted.has(x)&&!successorIds.has(x))||x===id))reasons.push('UNPROVEN_DEPENDENCY:'+id);
  dependencyGraph.set(id,Array.isArray(c?.prerequisites)?c.prerequisites.filter(x=>successorIds.has(x)):[]);
  const proof=proofRows.find(p=>p.capsuleId===id);
  if(!proof||proof.status!=='SOURCE_HASH_VERIFIED'||proof.historicalParityClaimed!==false||!(/^[a-f0-9]{64}$/.test(String(proof.actualSha256||''))))reasons.push('SOURCE_PROOF_REQUIRED:'+id);
 }
 const visited=new Set(),active=new Set();
 function visit(id){
  if(active.has(id)){reasons.push('SUCCESSOR_DEPENDENCY_CYCLE:'+id);return}
  if(visited.has(id))return;
  active.add(id);
  for(const parent of dependencyGraph.get(id)||[])visit(parent);
  active.delete(id);visited.add(id);
 }
 for(const id of successorIds)visit(id);
 if(!deploymentProof||deploymentProof.exactPromotedSha!==deploymentProof.liveRuntimeSha||!(/^[a-f0-9]{40}$/.test(String(deploymentProof.exactPromotedSha||'')))||deploymentProof.productionBrowserVerified!==true)reasons.push('PRIOR_PRODUCTION_PROOF_REQUIRED');
 return Object.freeze({schema:R535_SUCCESSOR_SCHEMA,status:reasons.length?'HELD':'READY_FOR_SEPARATE_GOVERNED_REVIEW',reasons:Object.freeze(reasons),priorAdmittedCount:admitted.size,successorCount:capsules.length,sourceMutationAuthorized:false,canonicalMutation:false,productionAdmissionAuthorized:false,requiresR245GeneratorExtension:true,requiresR503WorkerAdmission:true,requiresR164ResidualGate:true});
}

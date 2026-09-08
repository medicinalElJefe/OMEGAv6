export const MACHINE_ID='CLOUD-01';
export const AUTHORITY_BOUNDARIES=Object.freeze({
  canonAdmission:'R125',
  dispatch:'R147',
  durableHistory:'R146',
  hybridReturnProof:'R141',
  productionDeploymentWorkflow:'ci.yml',
  evolutionHost:'CLOUDFLARE_WORKER',
  retiredDurableObjects:Object.freeze(['R201','R203']),
});

export function scoreCapsule(capsule){
  const riskFactor=capsule.risk==='LOW'?1:capsule.risk==='MEDIUM'?0.7:0.35;
  return Number(capsule.expectedGain||0)/Math.max(0.01,Number(capsule.complexity||0)+Number(capsule.contradictionRisk||0))*riskFactor;
}

export function selectCapsule(state){
  const admitted=new Set(state.admittedSourceCapsules||[]);
  return (state.roadmap||[])
    .filter(c=>!admitted.has(c.id)&&(c.prerequisites||[]).every(p=>admitted.has(p)))
    .sort((a,b)=>scoreCapsule(b)-scoreCapsule(a)||a.id.localeCompare(b.id))[0]||null;
}

export function classifyHeldCandidates({currentMainSha,candidates}){
  const exact=[],stale=[];
  for(const candidate of candidates||[]){
    const baseSha=candidate?.receipt?.baseSha||candidate?.baseSha||null;
    (baseSha===currentMainSha?exact:stale).push(candidate);
  }
  return {exact,stale};
}

export function deriveResidualGate({coreHealth,releaseEvidence,runtimeAttestation}){
  if(!(coreHealth?.ok===true&&coreHealth?.state==='LIVE'&&coreHealth?.schema==='OMEGA_CANONICAL_CORE_HEALTH_R163'))return{allow:false,state:'BLOCK',reason:'R163 canonical core health is not first-hand LIVE'};
  const releaseSha=releaseEvidence?.source?.sha||null;
  const runtimeSha=runtimeAttestation?.source?.sha||null;
  if(releaseSha&&runtimeSha&&releaseSha!==runtimeSha)return{allow:false,state:'BLOCK',reason:'release/runtime source SHA mismatch'};
  return{allow:true,state:'PASS',reason:'no high/critical autonomous-source blocker observed'};
}

export function reconcileObservedSource(state,presentTargets){
  const next=structuredClone(state);
  const admitted=new Set(next.admittedSourceCapsules||[]);
  for(const capsule of next.roadmap||[])if(presentTargets.has(capsule.target))admitted.add(capsule.id);
  next.admittedSourceCapsules=[...admitted];
  if(next.currentCapsuleId){
    const current=(next.roadmap||[]).find(c=>c.id===next.currentCapsuleId);
    if(current&&presentTargets.has(current.target))next.currentCapsuleId=null;
  }
  return next;
}

export function decideCycle({currentMainSha,productionProofGreen,state,candidates,evidence}){
  if(!productionProofGreen)return{action:'OBSERVE_ONLY',reason:'exact current main lacks green canonical production proof'};
  if(!state?.active)return{action:'OBSERVE_ONLY',reason:'self-build state inactive'};
  const held=classifyHeldCandidates({currentMainSha,candidates});
  if(held.exact.length)return{action:'OBSERVE_ONLY',reason:'exact-head candidate already held',held};
  const gate=deriveResidualGate(evidence);
  if(!gate.allow)return{action:'OBSERVE_ONLY',reason:gate.reason,gate,held};
  const capsule=selectCapsule(state);
  if(!capsule)return{action:'OBSERVE_ONLY',reason:'bounded roadmap exhausted or no dependency-ready capsule',gate,held};
  return{action:'PROPOSE',capsule,gate,held,canonicalAdmission:false,deploymentAuthority:AUTHORITY_BOUNDARIES.productionDeploymentWorkflow,machineId:MACHINE_ID};
}

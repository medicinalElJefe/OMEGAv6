import {buildDevelopmentResidualGraphR164} from '../../src/system/developmentResidualGraphR164.js';
import {deriveResidualGateR245,R245_GOVERNED_SELFBUILD_CONTRACT} from '../../src/system/governedSelfBuildContractR245.js';
import {candidateScoreR240} from '../../scripts/lib/r240-recursive-selfbuild-fabric.mjs';
import {planGovernedCandidateR245} from '../../scripts/lib/r245-governed-selfbuild-selection.mjs';

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

function asResidualGraph(evidence={}){
  return evidence?.schema==='OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164'?evidence:buildDevelopmentResidualGraphR164({runtimeEvidence:evidence||{}});
}

export function scoreCapsule(capsule){return candidateScoreR240(capsule)}

export function selectCapsule(state,evidence={}){
  const graph=asResidualGraph(evidence);
  const plan=planGovernedCandidateR245({state,evidence:graph});
  return plan.state==='PROPOSE'?plan.capsule:null;
}

export function classifyHeldCandidates({currentMainSha,candidates}){
  const exact=[],stale=[];
  for(const candidate of candidates||[]){
    const baseSha=candidate?.receipt?.baseSha||candidate?.baseSha||null;
    (baseSha===currentMainSha?exact:stale).push(candidate);
  }
  return {exact,stale};
}

export function deriveResidualGate(evidence,stateOrPolicy={}){
  const graph=asResidualGraph(evidence);
  const policy=stateOrPolicy?.residualPolicy||stateOrPolicy;
  return deriveResidualGateR245(graph,policy);
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
  if(held.exact.length)return{action:'OBSERVE_ONLY',reason:'exact-head autonomous candidate already held',held,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT};
  const graph=asResidualGraph(evidence);
  const gate=deriveResidualGateR245(graph,state.residualPolicy);
  if(!gate.allow)return{action:'OBSERVE_ONLY',reason:gate.reason,gate,held,residualGraphState:graph.state,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT};
  const plan=planGovernedCandidateR245({state,evidence:graph});
  if(plan.state!=='PROPOSE'||!plan.capsule)return{action:'OBSERVE_ONLY',reason:plan.reason||plan.state||'bounded roadmap exhausted or no dependency-ready capsule',gate,held,plan,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT};
  return{action:'PROPOSE',capsule:plan.capsule,score:plan.score,frontier:plan.frontier,woven:plan.woven,selectionLaw:plan.selectionLaw,gate,held,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,canonicalAdmission:false,deploymentAuthority:AUTHORITY_BOUNDARIES.productionDeploymentWorkflow,machineId:MACHINE_ID};
}

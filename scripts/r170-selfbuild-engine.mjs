import fs from 'node:fs';
import path from 'node:path';
import {planGovernedCandidateR245} from './lib/r245-governed-selfbuild-selection.mjs';
import {capsuleBodyR245,deriveResidualGateR245,R245_GOVERNED_SELFBUILD_CONTRACT,R245_CAPSULE_GENERATOR_REVISION} from '../src/system/governedSelfBuildContractR245.js';

const STATE_PATH='public/omega-r170-selfbuild-state.json';
const CANDIDATE_PATH='public/omega-r170-selfbuild-candidate.json';
const APPLY=process.env.OMEGA_R170_SELFBUILD_APPLY==='1';
const state=JSON.parse(fs.readFileSync(STATE_PATH,'utf8'));
const roadmap=Array.isArray(state.roadmap)?state.roadmap:[];

function reconcileMergedSourceCandidates(){
 const admitted=new Set(state.admittedSourceCapsules||[]);let changed=false;
 for(const receipt of state.receipts||[]){
  if(!['PROVED_PENDING_PR','SOURCE_PROMOTED_PENDING_PRODUCTION'].includes(receipt.status))continue;
  const capsule=roadmap.find(x=>x.id===receipt.capsuleId);
  if(!capsule||!fs.existsSync(capsule.target))continue;
  receipt.status='SOURCE_MERGE_OBSERVED';receipt.sourceMergedAt=receipt.sourceMergedAt||new Date().toISOString();receipt.canonicalAdmission=false;admitted.add(receipt.capsuleId);changed=true;
 }
 state.admittedSourceCapsules=[...admitted];
 if(state.currentCapsuleId&&admitted.has(state.currentCapsuleId)){state.currentCapsuleId=null;changed=true}
 return changed;
}
function readResidualEvidence(){const p=process.env.OMEGA_R170_RESIDUAL_EVIDENCE_PATH;if(!p||!fs.existsSync(p))return null;return JSON.parse(fs.readFileSync(p,'utf8'))}
function returnedAdaptiveRowR266(evidence){const s=String(evidence?.state||'').toUpperCase();if(!['HEALTHY','RESIDUALS_PRESENT','BLOCKED'].includes(s))return null;return{provenanceKind:'RETURNED_PROOF',outcomeScore:s==='HEALTHY'?1:s==='BLOCKED'?0:.5,residual:Number(evidence?.summary?.blocking||0)>0?1:Number(evidence?.summary?.review||0)>0?.5:0,recordedAt:new Date().toISOString(),sourceSchema:String(evidence?.schema||'RETURNED_RESIDUAL_EVIDENCE')}}

const reconciled=reconcileMergedSourceCandidates();
if(reconciled&&!APPLY)fs.writeFileSync(STATE_PATH,JSON.stringify(state,null,2)+'\n');
if(!state.active){console.log(JSON.stringify({status:'IDLE',reason:'state inactive'}));process.exit(0)}
if((state.admittedSourceCapsules||[]).length>=Number(state.maxAutonomousGenerations||0)){console.log(JSON.stringify({status:'OBSERVE',reason:'bounded R170 roadmap exhausted',generation:state.generation}));process.exit(0)}
if(state.currentCapsuleId){console.log(JSON.stringify({status:'WAITING_FOR_GOVERNED_MERGE',capsuleId:state.currentCapsuleId,generation:state.generation}));process.exit(0)}

const evidence=readResidualEvidence();
const gate=deriveResidualGateR245(evidence,state.residualPolicy);
if(!gate.allow){console.log(JSON.stringify({status:'BLOCKED_BY_RESIDUAL_GATE',governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,gate},null,2));process.exit(0)}

const plan=planGovernedCandidateR245({state,evidence:evidence||{}});
const r265=plan.wovenDimensionalRelativityR265||null;
const r265Summary=r265?{schema:r265.schema,revision:r265.revision,cycle:r265.cycle,decision:r265.metrics?.decision,computationCoherence:r265.metrics?.computationCoherence,waterTransportCoherence:r265.water?.transportCoherence,wovenContinuity:r265.woven?.continuity,violetFuturePreservingSoftwareScore:r265.violet?.futurePreservingSoftwareScore,promotionPosture:r265.development?.promotionPosture,blockedByR265:r265.development?.blockedByR265,sourceSkin:r265.dimensionalRelativity?.sourceSkin,targetSkin:r265.dimensionalRelativity?.targetSkin,sourceResolution:r265.dimensionalRelativity?.sourceResolution,targetResolution:r265.dimensionalRelativity?.targetResolution,physicalDimensionsClaimed:r265.dimensionalRelativity?.physicalDimensionsClaimed,orientation:r265.dimensionalRelativity?.orientation,provenanceState:r265.proof?.provenanceState,authority:r265.authority,externalScientificTruthClaimed:r265.proof?.externalScientificTruthClaimed}:null;
const r266=plan.adaptiveCoherenceR266||null;
const r266Summary=r266?{schema:r266.schema,revision:r266.revision,cycle:r266.cycle,sampleCount:r266.history?.sampleCount,confidence:r266.history?.confidence,trend:r266.history?.trend,calibrationDelta:r266.adaptation?.calibrationDelta,adaptiveCoherence:r266.adaptation?.adaptiveCoherence,adaptiveFuturePreservation:r266.adaptation?.adaptiveFuturePreservation,carriedScar:r266.adaptation?.carriedScar,residualMemory:r266.adaptation?.residualMemory,coldStartEquivalentToR265:r266.adaptation?.coldStartEquivalentToR265,foundationWeightsChanged:r266.adaptation?.foundationWeightsChanged,nextContext:r266.nextContext,proof:r266.proof,authority:r266.authority}:null;
const cycleContext={dimensionalRelativityR265:r265Summary,adaptiveCoherenceR266:r266Summary};
if(plan.state==='BLOCKED_BY_R243_FABRIC'){
 console.log(JSON.stringify({status:'BLOCKED_BY_R243_FABRIC',generation:state.generation,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,gate,fabric:plan.woven,...cycleContext},null,2));process.exit(0);
}
if(plan.state==='BLOCKED_R243_R240_SELECTION_DIVERGENCE'){
 console.log(JSON.stringify({status:'BLOCKED_BY_R243_R240_SELECTION_DIVERGENCE',generation:state.generation,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,gate,r240Candidate:plan.r240CandidateId,r243Candidate:plan.r243CandidateId,frontier:plan.frontier,fabric:plan.woven,...cycleContext},null,2));process.exit(0);
}
if(plan.state!=='PROPOSE'||!plan.capsule){
 console.log(JSON.stringify({status:'OBSERVE',reason:plan.reason||'no dependency-ready predefined capsule',generation:state.generation,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,gate,frontier:plan.frontier,fabric:plan.woven,...cycleContext},null,2));process.exit(0);
}

const capsule=plan.capsule;
const generation=Number(state.generation||0)+1;
if(!APPLY){
 console.log(JSON.stringify({status:'PROPOSE',generation,capsuleId:capsule.id,title:capsule.title,target:capsule.target,score:plan.score,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,residualPolicy:state.residualPolicy?.schema||null,gate,frontier:plan.frontier,fabric:plan.woven,...cycleContext,selectionLaw:plan.selectionLaw},null,2));process.exit(0);
}

const body=capsuleBodyR245(capsule.id);
fs.mkdirSync(path.dirname(capsule.target),{recursive:true});
if(fs.existsSync(capsule.target))throw new Error(`Refusing to overwrite existing generated target ${capsule.target}`);
fs.writeFileSync(capsule.target,body,'utf8');

const wovenPlan=plan.woven;
const wovenSummary={schema:wovenPlan.schema,revision:wovenPlan.revision,state:wovenPlan.state,addressSpace:wovenPlan.addressSpace,activeCells:wovenPlan.activeCells.map(c=>({id:c.id,address:c.address.address,score:c.score,roleCount:c.rolePackets.length,state:c.state})),packetCount:wovenPlan.packets.length,scarCount:wovenPlan.scars.length,sourceMutationCandidateId:wovenPlan.sourceMutationCandidateId,parallelPlanning:wovenPlan.parallelPlanning,parallelEvaluation:wovenPlan.parallelEvaluation,parallelSourceMutation:wovenPlan.parallelSourceMutation,authority:wovenPlan.authority,canonicalAdmission:false};
const receipt={schema:'OMEGA_SELFBUILD_CANDIDATE_RECEIPT_R170',generation,capsuleId:capsule.id,target:capsule.target,startedAt:new Date().toISOString(),baseSha:process.env.GITHUB_SHA||'UNKNOWN',branch:null,candidateSha:null,residualGate:'PASS',residualEvidence:gate,residualPolicy:state.residualPolicy?.schema||null,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,recursiveFrontierR240:plan.frontier,wovenFabricR243:wovenSummary,wovenDimensionalRelativityR265:r265Summary,adaptiveCoherenceR266:r266Summary,pressureProvenance:'R164_RETURNED_RESIDUAL_EVIDENCE_PLUS_DEPENDENCY_TOPOLOGY',tests:{},status:'SANDBOX',canonicalAdmission:false,notes:['Generated deterministically from bounded R170 roadmap through the shared R245 governed self-build contract.','R170 and CLOUD-01 share one R164 residual policy, R240/R243 selection law and capsule generator.','R243 activated typed dependency-ready planning/evaluation cells and carried returned residual scars without granting mutation authority.','R265 applies Water transport → Woven path/correspondence → Violet re-expression → proof/carry/recontextualization while preserving structure/orientation separation and provenance.','R265 may influence bounded planning capacity through R249 computation coherence but cannot block a capability merely because it is new or uses a new skin.','R266 closes returned proof/carry into bounded next-cycle context; cold start remains exactly R265 and calibration is confidence-gated and bounded.','R266 accepts only explicit operator outcomes, observed transitions or returned proof and never treats unchosen candidates as failures.','R266 foundationWeightsChanged remains false and adds no source-mutation, deployment or CanonState authority.','R240 retained exactly one source-mutation/promotion candidate.','R239 Hybrid resource governor remains separate and preserved.','R125 remains sole CanonState admission authority.']};
const returnedRow=returnedAdaptiveRowR266(evidence);
state.generation=generation;state.currentCapsuleId=capsule.id;state.selfBuildScars=wovenPlan.scars;state.receipts=[...(state.receipts||[]),receipt].slice(-64);if(returnedRow)state.adaptiveCoherenceHistoryR266=[...(state.adaptiveCoherenceHistoryR266||[]),returnedRow].slice(-64);
fs.writeFileSync(STATE_PATH,JSON.stringify(state,null,2)+'\n','utf8');
fs.writeFileSync(CANDIDATE_PATH,JSON.stringify({schema:'OMEGA_SELFBUILD_CANDIDATE_R170',revision:'R170.2',schedulerRevision:'R240',planningFabricRevision:'R243',dimensionalRelativityRevision:'R265',adaptiveCoherenceRevision:'R266',governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,residualPolicy:state.residualPolicy?.schema||null,capsule,score:plan.score,frontier:plan.frontier,wovenFabric:wovenSummary,wovenDimensionalRelativityR265:r265Summary,adaptiveCoherenceR266:r266Summary,receipt},null,2)+'\n','utf8');
console.log(JSON.stringify({status:'SANDBOX',generation,capsuleId:capsule.id,target:capsule.target,score:plan.score,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,gate,frontier:plan.frontier,fabric:wovenSummary,...cycleContext},null,2));

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

const reconciled=reconcileMergedSourceCandidates();
if(reconciled&&!APPLY)fs.writeFileSync(STATE_PATH,JSON.stringify(state,null,2)+'\n');
if(!state.active){console.log(JSON.stringify({status:'IDLE',reason:'state inactive'}));process.exit(0)}
if((state.admittedSourceCapsules||[]).length>=Number(state.maxAutonomousGenerations||0)){console.log(JSON.stringify({status:'OBSERVE',reason:'bounded R170 roadmap exhausted',generation:state.generation}));process.exit(0)}
if(state.currentCapsuleId){console.log(JSON.stringify({status:'WAITING_FOR_GOVERNED_MERGE',capsuleId:state.currentCapsuleId,generation:state.generation}));process.exit(0)}

const evidence=readResidualEvidence();
const gate=deriveResidualGateR245(evidence,state.residualPolicy);
if(!gate.allow){console.log(JSON.stringify({status:'BLOCKED_BY_RESIDUAL_GATE',governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,gate},null,2));process.exit(0)}

const plan=planGovernedCandidateR245({state,evidence:evidence||{}});
if(plan.state==='BLOCKED_BY_R243_FABRIC'){
 console.log(JSON.stringify({status:'BLOCKED_BY_R243_FABRIC',generation:state.generation,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,gate,fabric:plan.woven},null,2));process.exit(0);
}
if(plan.state==='BLOCKED_R243_R240_SELECTION_DIVERGENCE'){
 console.log(JSON.stringify({status:'BLOCKED_BY_R243_R240_SELECTION_DIVERGENCE',generation:state.generation,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,gate,r240Candidate:plan.r240CandidateId,r243Candidate:plan.r243CandidateId,frontier:plan.frontier,fabric:plan.woven},null,2));process.exit(0);
}
if(plan.state!=='PROPOSE'||!plan.capsule){
 console.log(JSON.stringify({status:'OBSERVE',reason:plan.reason||'no dependency-ready predefined capsule',generation:state.generation,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,gate,frontier:plan.frontier,fabric:plan.woven},null,2));process.exit(0);
}

const capsule=plan.capsule;
const generation=Number(state.generation||0)+1;
if(!APPLY){
 console.log(JSON.stringify({status:'PROPOSE',generation,capsuleId:capsule.id,title:capsule.title,target:capsule.target,score:plan.score,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,residualPolicy:state.residualPolicy?.schema||null,gate,frontier:plan.frontier,fabric:plan.woven,selectionLaw:plan.selectionLaw},null,2));process.exit(0);
}

const body=capsuleBodyR245(capsule.id);
fs.mkdirSync(path.dirname(capsule.target),{recursive:true});
if(fs.existsSync(capsule.target))throw new Error(`Refusing to overwrite existing generated target ${capsule.target}`);
fs.writeFileSync(capsule.target,body,'utf8');

const wovenPlan=plan.woven;
const wovenSummary={schema:wovenPlan.schema,revision:wovenPlan.revision,state:wovenPlan.state,addressSpace:wovenPlan.addressSpace,activeCells:wovenPlan.activeCells.map(c=>({id:c.id,address:c.address.address,score:c.score,roleCount:c.rolePackets.length,state:c.state})),packetCount:wovenPlan.packets.length,scarCount:wovenPlan.scars.length,sourceMutationCandidateId:wovenPlan.sourceMutationCandidateId,parallelPlanning:wovenPlan.parallelPlanning,parallelEvaluation:wovenPlan.parallelEvaluation,parallelSourceMutation:wovenPlan.parallelSourceMutation,authority:wovenPlan.authority,canonicalAdmission:false};
const receipt={schema:'OMEGA_SELFBUILD_CANDIDATE_RECEIPT_R170',generation,capsuleId:capsule.id,target:capsule.target,startedAt:new Date().toISOString(),baseSha:process.env.GITHUB_SHA||'UNKNOWN',branch:null,candidateSha:null,residualGate:'PASS',residualEvidence:gate,residualPolicy:state.residualPolicy?.schema||null,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,recursiveFrontierR240:plan.frontier,wovenFabricR243:wovenSummary,pressureProvenance:'R164_RETURNED_RESIDUAL_EVIDENCE_PLUS_DEPENDENCY_TOPOLOGY',tests:{},status:'SANDBOX',canonicalAdmission:false,notes:['Generated deterministically from bounded R170 roadmap through the shared R245 governed self-build contract.','R170 and CLOUD-01 share one R164 residual policy, R240/R243 selection law and capsule generator.','R243 activated typed dependency-ready planning/evaluation cells and carried returned residual scars without granting mutation authority.','R243 planning must agree with the R240 strongest candidate or the pulse blocks fail-closed.','R242 navigation remains read-only and separately authoritative for route projection only.','R240 retained exactly one source-mutation/promotion candidate.','No direct main mutation is authorized by the planning fabric.','R239 Hybrid resource governor remains separate and preserved.','R125 remains sole CanonState admission authority.']};
state.generation=generation;state.currentCapsuleId=capsule.id;state.selfBuildScars=wovenPlan.scars;state.receipts=[...(state.receipts||[]),receipt].slice(-64);
fs.writeFileSync(STATE_PATH,JSON.stringify(state,null,2)+'\n','utf8');
fs.writeFileSync(CANDIDATE_PATH,JSON.stringify({schema:'OMEGA_SELFBUILD_CANDIDATE_R170',revision:'R170.2',schedulerRevision:'R240',planningFabricRevision:'R243',governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,residualPolicy:state.residualPolicy?.schema||null,capsule,score:plan.score,frontier:plan.frontier,wovenFabric:wovenSummary,receipt},null,2)+'\n','utf8');
console.log(JSON.stringify({status:'SANDBOX',generation,capsuleId:capsule.id,target:capsule.target,score:plan.score,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,gate,frontier:plan.frontier,fabric:wovenSummary},null,2));

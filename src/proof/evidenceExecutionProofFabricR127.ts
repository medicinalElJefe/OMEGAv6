import crypto from 'node:crypto';
import {compileCausalGraphR126,type CausalCompileInput,type EvidencePacket} from '../causal/causalInteractionRelativityR126.ts';
import {planAutonomicMissionR125} from '../swarm/swarmAutonomicR125.js';

export const R127_REVISION='R127' as const;
export const R127_SCHEMA='OMEGA_EVIDENCE_EXECUTION_PROOF_FABRIC_R127' as const;
export const R127_HIERARCHY={seed:1,organs:12,branches:144,cells:1728,lanes:20736} as const;
export const R127_LAWS=[
 'NO_EVIDENCE_NO_EMPIRICAL_CLAIM',
 'CORRELATION_IS_NOT_CAUSATION',
 'PLANNING_IS_NOT_EXECUTION',
 'EXECUTION_RECEIPT_IS_NOT_TRUTH',
 'MODEL_OUTPUT_IS_NOT_MEASUREMENT',
 'QUORUM_IS_NOT_CONSENSUS_TRUTH',
 'CANONICAL_MUTATION_REQUIRES_R125_ADMISSION',
 'MISSING_EXTERNAL_EXECUTION_PROOF_RETURNS_NOT_EXECUTED',
 'UNITS_FRAME_TIME_PROVENANCE_AND_UNCERTAINTY_CARRY_FORWARD',
 'SCAR_HISTORY_SURVIVES_RECONVERGENCE',
 'OBSERVER_PROJECTION_DOES_NOT_REWRITE_SOURCE EVIDENCE'.replace('SOURCE EVIDENCE','SOURCE_EVIDENCE'),
 'ADDRESS_SCALE_IS_NOT_LITERAL_PHYSICAL_DIMENSION'
] as const;

export type ExecutionReceipt={
 id:string;
 missionId:string;
 status:'COMPLETE'|'FAILED'|'TIMED_OUT'|'PARTIAL';
 completedCells:number;
 failedCells:number;
 merkleRoot?:string;
 checkpointSha256?:string;
 canonicalMutation:false;
 authority:string;
 observedAt:string;
 source:string;
 verified:boolean;
};

export type VerificationReceipt={
 id:string;
 verifier:string;
 sourceFamily:string;
 observedAt:string;
 targetHash:string;
 verdict:'PASS'|'FAIL'|'INCONCLUSIVE';
 reproducible:boolean;
 independent:boolean;
 notes?:string;
};

export type R127Input={
 intent:string;
 causal:CausalCompileInput;
 metrics?:Record<string,number>;
 requestedCells?:number;
 scope?:{type?:'BODY'|'ORGAN'|'BRANCH'|'CELL';domain?:number;phase?:number;regulation?:number};
 providerBudget?:number;
 genesisBudget?:number;
 opticalBudget?:number;
 allowFullAuto?:boolean;
 executionReceipt?:ExecutionReceipt|null;
 verificationReceipts?:VerificationReceipt[];
 currentCanonHash?:string;
 priorScar?:Record<string,number>;
};

const sha=(x:unknown)=>crypto.createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const iso=(s:string)=>Number.isFinite(Date.parse(s));
const hex64=(s:unknown)=>/^[a-f0-9]{64}$/i.test(String(s??''));
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));

function verifyExecutionReceipt(r:ExecutionReceipt|null|undefined,expectedCells:number){
 if(!r)return{state:'NOT_EXECUTED' as const,valid:false,reasons:['EXECUTION_RECEIPT_MISSING']};
 const reasons:string[]=[];
 if(!r.verified)reasons.push('UNVERIFIED');
 if(!iso(r.observedAt))reasons.push('INVALID_TIME');
 if(!r.source)reasons.push('SOURCE_MISSING');
 if(r.canonicalMutation!==false)reasons.push('CANONICAL_MUTATION_FORBIDDEN');
 if(!Number.isInteger(r.completedCells)||r.completedCells<0)reasons.push('COMPLETED_CELLS_INVALID');
 if(!Number.isInteger(r.failedCells)||r.failedCells<0)reasons.push('FAILED_CELLS_INVALID');
 if(r.completedCells+r.failedCells>expectedCells)reasons.push('CELL_COUNT_EXCEEDS_PLAN');
 if(r.status==='COMPLETE'&&r.completedCells!==expectedCells)reasons.push('COMPLETE_WITHOUT_ALL_CELLS');
 if(r.status==='COMPLETE'&&!hex64(r.merkleRoot))reasons.push('MERKLE_MISSING');
 if(r.checkpointSha256&&!hex64(r.checkpointSha256))reasons.push('CHECKPOINT_INVALID');
 return{state:reasons.length?'EXECUTION_UNPROVED' as const:(r.status==='COMPLETE'?'EXECUTION_PROVED' as const:'EXECUTION_PARTIAL' as const),valid:reasons.length===0,reasons};
}

function verifyIndependentReceipts(receipts:VerificationReceipt[]|undefined,targetHash:string){
 const rows=(receipts??[]).filter(r=>r&&iso(r.observedAt)&&r.targetHash===targetHash&&r.independent===true&&r.reproducible===true);
 const pass=rows.filter(r=>r.verdict==='PASS');
 const fail=rows.filter(r=>r.verdict==='FAIL');
 const families=new Set(pass.map(r=>r.sourceFamily));
 return{rows,pass:pass.length,fail:fail.length,families:families.size,independentlyVerified:pass.length>=2&&families.size>=2&&fail.length===0};
}

function empiricalEvidenceCoverage(evidence:EvidencePacket[]){
 const total=evidence.length;
 const empirical=evidence.filter(e=>['MEASUREMENT','INTERVENTION','REPLICATION','NEGATIVE_RESULT','SOURCE'].includes(e.kind)&&e.verified).length;
 return{total,empirical,coverage:total?empirical/total:0};
}

export function compileEvidenceExecutionProofR127(input:R127Input){
 const intent=String(input.intent??'').trim();
 if(!intent)throw new Error('INTENT_REQUIRED');
 const causal=compileCausalGraphR126({...input.causal,requestedCells:input.requestedCells??input.causal.requestedCells,priorScar:input.priorScar??input.causal.priorScar});
 const causalHash=causal.proof.graphSha256;
 const evidenceCoverage=empiricalEvidenceCoverage(input.causal.evidence);
 const executionPlan=planAutonomicMissionR125({
  intent,
  metrics:input.metrics,
  requestedCells:input.requestedCells??causal.requestedCells,
  scope:input.scope,
  providerBudget:input.providerBudget,
  genesisBudget:input.genesisBudget,
  opticalBudget:input.opticalBudget,
  allowFullAuto:input.allowFullAuto===true,
  evidence:[{id:'r126-causal-graph',type:'CAUSAL_GRAPH',sha256:causalHash,summary:`supported=${causal.summary.supportedCausal}; correlated=${causal.summary.correlated}; contradicted=${causal.summary.contradicted}; insufficient=${causal.summary.insufficient}`,authority:'R126_CAUSAL_CANDIDATE_NOT_CANON'}]
 });
 const execution=verifyExecutionReceipt(input.executionReceipt,executionPlan.totalCells);
 const packetCore={revision:R127_REVISION,intent,causalHash,evidenceHash:causal.proof.evidenceSha256,plan:{projection:executionPlan.projection,decision:executionPlan.decision,scope:executionPlan.scope,totalCells:executionPlan.totalCells,totalBranches:executionPlan.totalBranches,budgets:executionPlan.budgets},executionReceipt:input.executionReceipt??null,currentCanonHash:input.currentCanonHash??null};
 const candidateHash=sha(packetCore);
 const verification=verifyIndependentReceipts(input.verificationReceipts,candidateHash);
 const causalSupported=causal.summary.supportedCausal>0&&causal.summary.contradicted===0&&causal.summary.invalidEvidence===0;
 const empiricalAdequate=evidenceCoverage.empirical>0&&evidenceCoverage.coverage>=0.5;
 const executionAdequate=execution.state==='EXECUTION_PROVED';
 const verificationAdequate=verification.independentlyVerified;
 const admissionEligible=causalSupported&&empiricalAdequate&&executionAdequate&&verificationAdequate;
 const blockers:string[]=[];
 if(causal.summary.invalidEvidence)blockers.push('INVALID_EVIDENCE');
 if(!causalSupported)blockers.push('CAUSAL_SUPPORT_INSUFFICIENT_OR_CONTRADICTED');
 if(!empiricalAdequate)blockers.push('EMPIRICAL_EVIDENCE_COVERAGE_INSUFFICIENT');
 if(!executionAdequate)blockers.push(execution.state);
 if(!verificationAdequate)blockers.push('INDEPENDENT_VERIFICATION_INSUFFICIENT');
 const uncertainty=clamp((causal.edges.reduce((s,e)=>s+e.uncertainty,0)/Math.max(1,causal.edges.length))+(1-evidenceCoverage.coverage)+(verificationAdequate?0:0.5)+(executionAdequate?0:0.5),0,4)/4;
 const scar=clamp((Object.values(causal.scar).reduce((a,b)=>a+Number(b),0)/Math.max(1,Object.keys(causal.scar).length))+.25*uncertainty,0,1);
 return{
  schema:R127_SCHEMA,
  revision:R127_REVISION,
  intent,
  hierarchy:R127_HIERARCHY,
  stages:[
   {id:1,name:'PROVENANCE',state:causal.summary.invalidEvidence===0?'PASS':'BLOCK'},
   {id:2,name:'CAUSAL_COMPILE',state:causalSupported?'SUPPORTED':'CANDIDATE'},
   {id:3,name:'BOUNDED_PLAN',state:'PLANNED_NOT_EXECUTED'},
   {id:4,name:'EXECUTION',state:execution.state},
   {id:5,name:'RECEIPT',state:input.executionReceipt?'PRESENT':'MISSING'},
   {id:6,name:'INDEPENDENT_VERIFY',state:verificationAdequate?'PASS':'INSUFFICIENT'},
   {id:7,name:'CANDIDATE_DIFF',state:admissionEligible?'ELIGIBLE':'BLOCKED'},
   {id:8,name:'R125_ADMISSION',state:'EXTERNAL_AUTHORITY_REQUIRED'}
  ],
  causal,
  executionPlan:{...executionPlan,canonicalMutation:false},
  execution,
  verification:{pass:verification.pass,fail:verification.fail,independentFamilies:verification.families,independentlyVerified:verificationAdequate},
  evidenceCoverage,
  uncertainty,
  scar,
  candidate:{hash:candidateHash,admissionEligible,blockers,canonicalMutation:false,authority:'R127_CANDIDATE_NOT_CANON'},
  admission:{authority:'OMEGAV6_R125_ACCURACY_ADMISSION',automatic:false,eligible:admissionEligible,required:'R125 registered proof-gated admission or explicit human-governed promotion'},
  truthBoundary:'R127 connects evidence, causal analysis, bounded logical swarm planning, execution receipts and independent verification. It never substitutes planning for execution, execution for truth, model output for measurement, quorum for causal consensus, address scale for literal physical dimensions, or candidate eligibility for canonical admission.'
 };
}

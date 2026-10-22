import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {compileEvidenceExecutionProofR127,R127_HIERARCHY,R127_LAWS} from '../src/proof/evidenceExecutionProofFabricR127.ts';

const frame={space:'LAB_FRAME',time:'UTC',orientation:'RH'};
const observedAt='2026-09-06T18:00:00Z';
const evidence=[
 {id:'i1',kind:'INTERVENTION',source:'lab-a',sourceFamily:'lab-a',observedAt,frame,verified:true,claim:'controlled intervention changes output',supports:['edge'],intervention:true,reproducible:true,quantity:{value:1.2,unit:'ratio',uncertainty:0.03}},
 {id:'r1',kind:'REPLICATION',source:'lab-b',sourceFamily:'lab-b',observedAt,frame,verified:true,claim:'independent replication',supports:['edge'],reproducible:true,quantity:{value:1.18,unit:'ratio',uncertainty:0.04}},
 {id:'m1',kind:'MEASUREMENT',source:'sensor-c',sourceFamily:'sensor-c',observedAt,frame,verified:true,claim:'measured response',supports:['edge'],reproducible:true,quantity:{value:1.19,unit:'ratio',uncertainty:0.02}}
];
const causal={nodes:[{id:'A',label:'input'},{id:'B',label:'output'}],edges:[{id:'edge',cause:'A',effect:'B',sign:1,evidenceIds:evidence.map(e=>e.id)}],evidence,canonicalTime:observedAt};

const planned=compileEvidenceExecutionProofR127({intent:'prove a bounded causal execution path',causal,requestedCells:12,providerBudget:0});
assert.equal(planned.hierarchy.cells,1728);
assert.equal(planned.hierarchy.lanes,20736);
assert.equal(planned.causal.edges[0].status,'SUPPORTED_CAUSAL');
assert.equal(planned.execution.state,'NOT_EXECUTED');
assert.equal(planned.candidate.admissionEligible,false);
assert.ok(planned.candidate.blockers.includes('NOT_EXECUTED'));
assert.equal(planned.executionPlan.totalCells,12);
assert.equal(planned.executionPlan.canonicalMutation,false);
assert.equal(planned.admission.automatic,false);
assert.match(planned.truthBoundary,/never substitutes planning for execution/);

const receipt={id:'exec-1',missionId:'mission-1',status:'COMPLETE',completedCells:12,failedCells:0,merkleRoot:'a'.repeat(64),checkpointSha256:'b'.repeat(64),canonicalMutation:false,authority:'AUTONOMIC_RECEIPT_NOT_CANON',observedAt,source:'cloudflare-runtime',verified:true};
const executed=compileEvidenceExecutionProofR127({intent:'prove a bounded causal execution path',causal,requestedCells:12,providerBudget:0,executionReceipt:receipt});
assert.equal(executed.execution.state,'EXECUTION_PROVED');
assert.equal(executed.candidate.admissionEligible,false,'execution alone must never admit truth');
assert.ok(executed.candidate.blockers.includes('INDEPENDENT_VERIFICATION_INSUFFICIENT'));

const core={revision:'R127',intent:'prove a bounded causal execution path',causalHash:executed.causal.proof.graphSha256,evidenceHash:executed.causal.proof.evidenceSha256,plan:{projection:executed.executionPlan.projection,decision:executed.executionPlan.decision,scope:executed.executionPlan.scope,totalCells:executed.executionPlan.totalCells,totalBranches:executed.executionPlan.totalBranches,budgets:executed.executionPlan.budgets},executionReceipt:receipt,currentCanonHash:null};
const candidateHash=crypto.createHash('sha256').update(JSON.stringify(core)).digest('hex');
const verificationReceipts=[
 {id:'v1',verifier:'validator-a',sourceFamily:'validation-lab-a',observedAt,targetHash:candidateHash,verdict:'PASS',reproducible:true,independent:true},
 {id:'v2',verifier:'validator-b',sourceFamily:'validation-lab-b',observedAt,targetHash:candidateHash,verdict:'PASS',reproducible:true,independent:true}
];
const eligible=compileEvidenceExecutionProofR127({intent:'prove a bounded causal execution path',causal,requestedCells:12,providerBudget:0,executionReceipt:receipt,verificationReceipts});
assert.equal(eligible.verification.independentlyVerified,true);
assert.equal(eligible.candidate.admissionEligible,true);
assert.equal(eligible.candidate.canonicalMutation,false);
assert.equal(eligible.stages.at(-1).name,'R125_ADMISSION');
assert.equal(eligible.stages.at(-1).state,'EXTERNAL_AUTHORITY_REQUIRED');

const badReceipt={...receipt,completedCells:11};
const invalidExecution=compileEvidenceExecutionProofR127({intent:'do not accept a false complete receipt',causal,requestedCells:12,providerBudget:0,executionReceipt:badReceipt,verificationReceipts});
assert.equal(invalidExecution.execution.state,'EXECUTION_UNPROVED');
assert.ok(invalidExecution.execution.reasons.includes('COMPLETE_WITHOUT_ALL_CELLS'));
assert.equal(invalidExecution.candidate.admissionEligible,false);

const modelEvidence=[{id:'model',kind:'MODEL',source:'model-a',sourceFamily:'model-a',observedAt,frame,verified:true,claim:'prediction only',supports:['edge']}];
const modelCausal={nodes:causal.nodes,edges:[{id:'edge',cause:'A',effect:'B',sign:1,evidenceIds:['model']}],evidence:modelEvidence,canonicalTime:observedAt};
const modelOnly=compileEvidenceExecutionProofR127({intent:'model-only hypothesis',causal:modelCausal,requestedCells:1,providerBudget:0});
assert.equal(modelOnly.causal.edges[0].status,'CORRELATED');
assert.equal(modelOnly.candidate.admissionEligible,false);
assert.ok(modelOnly.candidate.blockers.includes('EMPIRICAL_EVIDENCE_COVERAGE_INSUFFICIENT'));

assert.deepEqual(R127_HIERARCHY,{seed:1,organs:12,branches:144,cells:1728,lanes:20736});
for(const law of ['PLANNING_IS_NOT_EXECUTION','EXECUTION_RECEIPT_IS_NOT_TRUTH','CANONICAL_MUTATION_REQUIRES_R125_ADMISSION','ADDRESS_SCALE_IS_NOT_LITERAL_PHYSICAL_DIMENSION'])assert.ok(R127_LAWS.includes(law));
console.log('R127 evidence-to-execution proof fabric: PASS');

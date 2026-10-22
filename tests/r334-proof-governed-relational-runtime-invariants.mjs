import assert from 'node:assert/strict';
import {
 buildRelationalStateR334,
 evaluateRelationalCycleR334,
 finalizeRelationalCycleR334,
 paretoDominatesR334,
 relationalManifestR334,
 verifyRelationalReturnR334,
 R334_B06_PROGRESS_RECEIPT,
 R334_OPERATORS,
} from '../src/system/proofGovernedRelationalRuntimeR334.js';

const metric=(value,name)=>({value,sourceId:'fixture-'+name,method:'fixture '+name+' metric'});
const state=buildRelationalStateR334({
 stateVersion:'state-r334-42',
 parentStateVersion:'state-r334-41',
 metrics:{
  continuity:metric(.72,'continuity'),
  plasticity:metric(.64,'plasticity'),
  contradiction:metric(.46,'contradiction'),
  burden:metric(.38,'burden'),
  evidence:metric(.81,'evidence'),
 },
 observations:[
  {observationId:'obs-a',sourceId:'source-a',frameId:'OMEGA_CANONICAL',provenanceId:'prov-a',evidenceIds:['evidence-a'],scarIds:['scar-a']},
  {observationId:'obs-b',sourceId:'source-b',frameId:'OBSERVER-B',provenanceId:'prov-b',evidenceIds:['evidence-b']},
 ],
 relations:[
  {relationId:'rel-a-b',from:'obs-a',to:'obs-b',kind:'CROSS_SKIN_EQUIVALENCE',evidenceIds:['proof-rel-a-b']},
 ],
 constraints:['PHYSICALITY','NO_CANON_SELF_ADMISSION'],
 scarIds:['scar-prior'],
 provenanceIds:['prov-a','prov-b'],
});

assert.equal(state.canonicalAdmission,false);
assert.equal(state.observations.length,2);
assert.throws(()=>buildRelationalStateR334({
 stateVersion:'bad',
 observations:[{observationId:'x',sourceId:'s',frameId:'f'}],
 metrics:{continuity:{value:.5},plasticity:metric(.5,'p'),contradiction:metric(.5,'q'),burden:metric(.5,'b'),evidence:metric(.5,'e')}
}),/requires sourceId and method/,'metrics must never silently become unproven defaults');

const qtiProposal=(proposalId,transactionId,stateVersion='state-r334-42')=>({
 proposalId,
 actionClass:'EXTERNAL_REVERSIBLE',
 stateVersion,
 evidence:{count:5,quality:.94},
 invariants:[{id:'identity',pass:true},{id:'authority',pass:true},{id:'scar-carry',pass:true}],
 permissions:{capability:true,scopeAllowed:true,revoked:false},
 resources:{used:{compute:2,time:12,tokens:320,memory:48,network:1,actions:1},limit:{compute:8,time:60,tokens:2000,memory:256,network:10,actions:4}},
 reversibility:{rollbackAvailable:true,safeUndo:true},
 externalEffect:true,
 externalConsequence:{classification:'MEDIUM',allowed:true},
 security:{isolated:true,inputValidated:true,policyIntegrity:true,unresolvedCriticalThreat:false},
 requiresHumanApproval:true,
 humanAuthorization:{approved:true,approvalId:'approval-'+proposalId,stateVersion},
 requiresSimulation:true,
 simulation:{status:'PASS',confidence:.96},
 postcondition:{observable:true,transactionId,stateVersion,checks:[{id:'return-proof'},{id:'state-recheck'}]},
});

const improve={
 candidateId:'candidate-improve',
 priority:1,
 actionClass:'EXTERNAL_REVERSIBLE',
 predictedMetrics:{
  continuity:metric(.82,'c1'),
  plasticity:metric(.71,'p1'),
  contradiction:metric(.31,'q1'),
  burden:metric(.29,'b1'),
  evidence:metric(.91,'e1'),
 },
 predictionEvidenceIds:['prediction-proof-1'],
 scarCarryIds:['scar-candidate-1'],
 qtiProposal:qtiProposal('proposal-improve','tx-improve'),
};

const dominated={
 candidateId:'candidate-dominated',
 priority:2,
 actionClass:'EXTERNAL_REVERSIBLE',
 predictedMetrics:{
  continuity:metric(.77,'c2'),
  plasticity:metric(.67,'p2'),
  contradiction:metric(.39,'q2'),
  burden:metric(.34,'b2'),
  evidence:metric(.85,'e2'),
 },
 predictionEvidenceIds:['prediction-proof-2'],
 qtiProposal:qtiProposal('proposal-dominated','tx-dominated'),
};

assert.equal(paretoDominatesR334({predictedMetrics:improve.predictedMetrics},{predictedMetrics:dominated.predictedMetrics}),true);

const cycle=evaluateRelationalCycleR334({
 state,
 qtiState:{stateVersion:'state-r334-42'},
 candidates:[dominated,improve],
 policy:{contradictionEscalate:.8,burdenEscalate:.8},
});
assert.equal(cycle.decision,'TURN');
assert.deepEqual(cycle.paretoFrontier,['candidate-improve']);
assert.deepEqual(cycle.improvingFrontier,['candidate-improve']);
assert.equal(cycle.selectedCandidate.candidateId,'candidate-improve');
assert.equal(cycle.selectedCandidate.qti.outcome,'PASS');
assert.equal(cycle.authorizationRequest.transactionId,'tx-improve');
assert.equal(cycle.execution,null);
assert.equal(cycle.canonicalAdmission,false);
assert.equal(cycle.calibration.revision,'R334');
assert.equal(cycle.calibration.releaseId,'DEWEY_OMEGA_CERN_RELATIVITY_CLOSURE_2026-09-19');
assert.equal(cycle.calibration.canonicalMutation,false);

const finalized=await finalizeRelationalCycleR334({
 state,
 qtiState:{stateVersion:'state-r334-42'},
 candidates:[dominated,improve],
 policy:{contradictionEscalate:.8,burdenEscalate:.8},
 previousLedgerDigest:'previous-ledger-digest',
});
assert.match(finalized.ledgerEvent.ledgerDigest,/^[a-f0-9]{64}$/);
assert.equal(finalized.ledgerEvent.previousLedgerDigest,'previous-ledger-digest');
assert.equal(finalized.ledgerEvent.selectedCandidateId,'candidate-improve');
assert.equal(finalized.ledgerEvent.canonicalAdmission,false);

const returned=verifyRelationalReturnR334({
 cycle,
 executionReceipt:{proposalId:'proposal-improve',transactionId:'tx-improve',status:'COMPLETE'},
 observation:{transactionId:'tx-improve',stateVersion:'state-r334-42',checks:[{id:'return-proof',pass:true},{id:'state-recheck',pass:true}]},
});
assert.equal(returned.outcome,'PASS');
assert.equal(returned.successfulOutcome,true);
assert.equal(returned.nextParentProposal.candidateId,'candidate-improve');
assert.equal(returned.nextParentProposal.requiresR125Admission,true);
assert.equal(returned.nextParentProposal.canonicalAdmission,false);

const wrongReturn=verifyRelationalReturnR334({
 cycle,
 executionReceipt:{proposalId:'proposal-improve',transactionId:'wrong-tx',status:'COMPLETE'},
 observation:{transactionId:'tx-improve',stateVersion:'state-r334-42',checks:[{id:'return-proof',pass:true}]},
});
assert.equal(wrongReturn.successfulOutcome,false);
assert.equal(wrongReturn.nextParentProposal,null);

const staleCandidate={...improve,candidateId:'candidate-stale',qtiProposal:qtiProposal('proposal-stale','tx-stale','state-r334-41')};
const staleCycle=evaluateRelationalCycleR334({
 state,
 qtiState:{stateVersion:'state-r334-42'},
 candidates:[staleCandidate],
 policy:{contradictionEscalate:.8,burdenEscalate:.8},
});
assert.equal(staleCycle.decision,'STAY');
assert.equal(staleCycle.evaluated[0].qti.outcome,'DENY');
assert.equal(staleCycle.authorizationRequest,null);

const highPressure=buildRelationalStateR334({
 stateVersion:'state-r334-high',
 metrics:{
  continuity:metric(.41,'hc'),
  plasticity:metric(.33,'hp'),
  contradiction:metric(.92,'hq'),
  burden:metric(.84,'hb'),
  evidence:metric(.55,'he'),
 },
 observations:[{observationId:'obs-high',sourceId:'source-high',frameId:'OMEGA_CANONICAL'}],
 scarIds:['scar-high'],
});
const escalation=evaluateRelationalCycleR334({
 state:highPressure,
 qtiState:{stateVersion:'state-r334-high'},
 candidates:[],
 policy:{contradictionEscalate:.8,burdenEscalate:.8},
});
assert.equal(escalation.decision,'ESCALATE');
assert.equal(escalation.selectedCandidate,null);

const manifest=relationalManifestR334();
assert.deepEqual(manifest.operators,R334_OPERATORS);
assert.equal(manifest.authorizationAuthority,false);
assert.equal(manifest.executionAuthority,false);
assert.equal(manifest.canonicalAdmission,false);
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.calibration.revision,'R334');
assert.equal(manifest.calibration.canonicalMutation,false);

assert.equal(R334_B06_PROGRESS_RECEIPT.stage,'R314-B06');
assert.equal(R334_B06_PROGRESS_RECEIPT.calibrationRelease,'DEWEY_OMEGA_CERN_RELATIVITY_CLOSURE_2026-09-19');
assert.equal(R334_B06_PROGRESS_RECEIPT.state,'ACTIVE_PARTIAL');
assert.equal(R334_B06_PROGRESS_RECEIPT.authorizationAuthority,false);
assert.equal(R334_B06_PROGRESS_RECEIPT.executionAuthority,false);
assert.equal(R334_B06_PROGRESS_RECEIPT.canonicalAdmission,false);

console.log('R334 PROOF-GOVERNED RELATIONAL RUNTIME PASS · typed evidence state · Pareto prune · R332 proof binding · STAY/TURN/ESCALATE · hash ledger · observed return proof · R125 admission boundary');

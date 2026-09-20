import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateQtiR332,qtiManifestR332,riskClassR332,verifyObservedOutcomeR332,R332_B12_PROGRESS_RECEIPT,R332_GATE_IDS} from '../src/system/qtiControlR332.js';

const state={stateVersion:'state-42'};
const base={
 proposalId:'proposal-1',
 actionClass:'EXTERNAL_REVERSIBLE',
 stateVersion:'state-42',
 evidence:{count:4,quality:.92},
 invariants:[{id:'identity',pass:true},{id:'authority',pass:true},{id:'memory',pass:true}],
 permissions:{capability:true,scopeAllowed:true,revoked:false},
 resources:{used:{compute:2,time:10,tokens:200,memory:32,network:1,actions:1},limit:{compute:8,time:60,tokens:2000,memory:256,network:10,actions:4}},
 reversibility:{rollbackAvailable:true,safeUndo:true},
 externalEffect:true,
 externalConsequence:{classification:'MEDIUM',allowed:true},
 security:{isolated:true,inputValidated:true,policyIntegrity:true,unresolvedCriticalThreat:false},
 requiresHumanApproval:true,
 humanAuthorization:{approved:true,approvalId:'approval-1',stateVersion:'state-42'},
 requiresSimulation:true,
 simulation:{status:'PASS',confidence:.94},
 postcondition:{observable:true,transactionId:'tx-1',stateVersion:'state-42',checks:[{id:'return-proof'},{id:'state-recheck'}]}
};

const pass=evaluateQtiR332(base,state);
assert.equal(pass.outcome,'PASS');
assert.equal(pass.authorizationEligible,true);
assert.equal(pass.authorizedCommand,null);
assert.equal(pass.execution,null);
assert.equal(pass.observedOutcome,null);
assert.equal(pass.authorizationRequest.transactionId,'tx-1');
assert.equal(pass.gates.length,10);
assert.deepEqual(pass.gates.map(x=>x.id),R332_GATE_IDS);
assert.ok(pass.gates.filter(x=>x.required).every(x=>x.outcome==='PASS'));
assert.equal(pass.canonicalAdmission,false);

const noHuman=evaluateQtiR332({...base,humanAuthorization:null},state);
assert.equal(noHuman.outcome,'ESCALATE','required human approval must escalate rather than silently pass');
assert.equal(noHuman.authorizationRequest,null);

const stale=evaluateQtiR332({...base,stateVersion:'state-41'},state);
assert.equal(stale.outcome,'DENY','stale state-version binding must deny');
assert.equal(stale.gates.find(x=>x.id==='G2_STATE_CONSISTENCY').outcome,'DENY');

const simFail=evaluateQtiR332({...base,simulation:{status:'FAIL',confidence:.99}},state);
assert.equal(simFail.outcome,'DENY');
assert.equal(simFail.gates.find(x=>x.id==='G9_SIMULATION_VALIDATION').outcome,'DENY');

const missingEvidence=evaluateQtiR332({...base,evidence:{count:0,quality:0}},state);
assert.equal(missingEvidence.outcome,'DENY');
assert.equal(missingEvidence.gates.find(x=>x.id==='G1_EVIDENCE_SUFFICIENCY').outcome,'DENY');

const overBudget=evaluateQtiR332({...base,resources:{used:{compute:9},limit:{compute:8}}},state);
assert.equal(overBudget.outcome,'DENY');
assert.equal(overBudget.gates.find(x=>x.id==='G4_RESOURCE_BUDGET').outcome,'DENY');

const insecure=evaluateQtiR332({...base,security:{isolated:true,inputValidated:true,policyIntegrity:true,unresolvedCriticalThreat:true}},state);
assert.equal(insecure.outcome,'DENY');

const irreversible=evaluateQtiR332({...base,actionClass:'IRREVERSIBLE',reversibility:{explicitIrreversible:true},humanAuthorization:{approved:true,approvalId:'approval-2',stateVersion:'state-42'}},state);
assert.equal(riskClassR332(irreversible),'CRITICAL');
assert.equal(irreversible.outcome,'DENY','critical irreversible action without rollback must remain denied');

const observed=verifyObservedOutcomeR332({
 authorizationRequest:pass.authorizationRequest,
 executionReceipt:{proposalId:'proposal-1',transactionId:'tx-1',status:'COMPLETE'},
 observation:{transactionId:'tx-1',stateVersion:'state-42',checks:[{id:'return-proof',pass:true},{id:'state-recheck',pass:true}]}
});
assert.equal(observed.outcome,'PASS');
assert.equal(observed.successfulOutcome,true);
assert.equal(observed.canonicalAdmission,false);

const wrongTx=verifyObservedOutcomeR332({
 authorizationRequest:pass.authorizationRequest,
 executionReceipt:{proposalId:'proposal-1',transactionId:'other',status:'COMPLETE'},
 observation:{transactionId:'tx-1',stateVersion:'state-42',checks:[{id:'return-proof',pass:true}]}
});
assert.equal(wrongTx.outcome,'REVISE');
assert.equal(wrongTx.successfulOutcome,false);

const failedObserved=verifyObservedOutcomeR332({
 authorizationRequest:pass.authorizationRequest,
 executionReceipt:{proposalId:'proposal-1',transactionId:'tx-1',status:'COMPLETE'},
 observation:{transactionId:'tx-1',stateVersion:'state-42',checks:[{id:'return-proof',pass:false}]}
});
assert.equal(failedObserved.outcome,'DENY');
assert.equal(failedObserved.successfulOutcome,false);

const manifest=qtiManifestR332();
assert.equal(manifest.gates.length,10);
assert.equal(manifest.authorizationAuthority,false);
assert.equal(manifest.executionAuthority,false);
assert.equal(manifest.canonicalAdmission,false);
assert.match(manifest.law,/every policy-required gate passes/);

assert.equal(R332_B12_PROGRESS_RECEIPT.stage,'R314-B12');
assert.equal(R332_B12_PROGRESS_RECEIPT.state,'ACTIVE_PARTIAL');

const worker=fs.readFileSync('src/workerR116.js','utf8');
for(const token of [
 "from './system/qtiWorkerR332.js'",
 "path.startsWith('/api/intelligence/r332/qti/')",
 'publicQtiR332(request)'
])assert.ok(worker.includes(token),`R332 Worker integration missing ${token}`);

const qtiWorker=fs.readFileSync('src/system/qtiWorkerR332.js','utf8');
for(const token of [
 '/api/intelligence/r332/qti/manifest',
 '/api/intelligence/r332/qti/evaluate',
 '/api/intelligence/r332/qti/postcondition',
 'evaluateQtiR332',
 'verifyObservedOutcomeR332'
])assert.ok(qtiWorker.includes(token),`R332 QTI API missing ${token}`);

console.log('R332 EXECUTABLE QTI PASS · G1-G10 · fail-closed required gates · state-version binding · human escalation · simulation/security/resource denial · authorization-request-only boundary · observed postcondition proof');

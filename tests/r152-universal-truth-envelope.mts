import assert from 'node:assert/strict';
import {initCorpusPack} from '../src/corpusRuntime';
import {compileUniversalTruthEnvelopeR152,normalizeUniversalEvidenceR152} from '../src/universalTruthEnvelopeR152';

await initCorpusPack();
const observedAt='2026-09-06T23:58:00.000Z';
const claimId='claim:alpha';
const support=(x:any)=>normalizeUniversalEvidenceR152({observedAt,space:'declared-test-frame',timeFrame:'UTC',claim:'test observation',verified:true,supports:[claimId],...x});

const modelOnly=compileUniversalTruthEnvelopeR152({address:0,claimId,claim:'alpha',evidence:[]});
assert.equal(modelOnly.evidenceStatus,'MODEL_ONLY');
assert.equal(modelOnly.responsePath,'MEASURE_OR_FETCH');
assert.equal(modelOnly.nextAction,'ACQUIRE_VERIFIED_EXTERNAL_EVIDENCE');
assert.equal(modelOnly.evidence.valid,0);
assert.equal(modelOnly.appliedModes.totalChannels,241);
assert.equal(modelOnly.canonicalMutation,false);
assert.equal(modelOnly.canonicalAdmissionAuthority,'R125');

const intervention=support({id:'m-a',source:'instrument-a',sourceFamily:'lab-a',kind:'INTERVENTION',authority:'INTERVENTION',value:1,unit:'ratio',uncertainty:0,reproducible:true,intervention:true});
const replication=support({id:'m-b',source:'instrument-b',sourceFamily:'lab-b',kind:'REPLICATION',authority:'REPLICATED',value:1,unit:'ratio',uncertainty:0,reproducible:true});
const strong=compileUniversalTruthEnvelopeR152({address:0,claimId,claim:'alpha',evidence:[intervention,replication]});
assert.equal(strong.evidence.independentSourceFamilies,2);
assert.equal(strong.evidence.empiricalCount,2);
assert.equal(strong.evidenceStatus,'EMPIRICAL_STRONG');
assert.equal(strong.responsePath,'FAST_DETERMINISTIC');
assert.equal(strong.nextAction,'CARRY_VERIFIED_EVIDENCE');
assert.ok(strong.truthConfidence>modelOnly.truthConfidence,'independent empirical evidence must outrank internal-model-only confidence');

const sameFamilyReplication=support({id:'m-a2',source:'instrument-a-2',sourceFamily:'lab-a',kind:'REPLICATION',authority:'REPLICATED',value:1,unit:'ratio',uncertainty:0,reproducible:true});
const sameFamily=compileUniversalTruthEnvelopeR152({address:0,claimId,claim:'alpha',evidence:[intervention,sameFamilyReplication]});
assert.equal(sameFamily.evidence.independentSourceFamilies,1);
assert.notEqual(sameFamily.evidenceStatus,'EMPIRICAL_STRONG','duplicate evidence from one source family must not masquerade as independent replication');

const contradiction=normalizeUniversalEvidenceR152({id:'m-c',source:'instrument-c',sourceFamily:'lab-c',observedAt,space:'declared-test-frame',timeFrame:'UTC',claim:'contradictory measurement',kind:'INTERVENTION',verified:true,authority:'INTERVENTION',value:0,unit:'ratio',uncertainty:0,intervention:true,contradicts:[claimId]});
const contradicted=compileUniversalTruthEnvelopeR152({address:0,claimId,claim:'alpha',evidence:[intervention,contradiction]});
assert.equal(contradicted.evidenceStatus,'CONTRADICTED_EVIDENCE');
assert.equal(contradicted.responsePath,'VERIFY_CONTRADICTION');
assert.equal(contradicted.nextAction,'PRESERVE_CONTRADICTION_AND_ACQUIRE_INDEPENDENT_CHECK');
assert.equal(contradicted.weakestEdge,'CONTRADICTORY_VERIFIED_EVIDENCE');

const invalid=normalizeUniversalEvidenceR152({id:'bad',source:'operator',sourceFamily:'operator',observedAt:'invalid-time',space:'',timeFrame:'',claim:'bad packet',kind:'SOURCE',verified:false,authority:'OPERATOR_SUPPLIED'});
const invalidResult=compileUniversalTruthEnvelopeR152({address:0,claimId,claim:'alpha',evidence:[invalid]});
assert.equal(invalidResult.evidence.valid,0);
assert.equal(invalidResult.evidence.invalid,1);
assert.equal(invalidResult.responsePath,'MEASURE_OR_FETCH');
assert.equal(invalidResult.nextAction,'ACQUIRE_VERIFIED_EXTERNAL_EVIDENCE');

const runtimeReceipt=support({id:'runtime',source:'hybrid-result',sourceFamily:'hybrid-host',kind:'SOURCE',authority:'RUNTIME_RECEIPT'});
const unverifiedExecution=compileUniversalTruthEnvelopeR152({address:0,claimId,claim:'alpha',evidence:[runtimeReceipt],executionProof:{state:'INVOKED',verified:false,receiptId:'run-1'}});
assert.equal(unverifiedExecution.responsePath,'EXECUTION_PROOF_REQUIRED');
assert.equal(unverifiedExecution.nextAction,'VERIFY_EXECUTION_RECEIPT_BEFORE_USE');
const verifiedExecution=compileUniversalTruthEnvelopeR152({address:0,claimId,claim:'alpha',evidence:[runtimeReceipt],executionProof:{state:'VERIFIED',verified:true,receiptId:'run-1'}});
assert.equal(verifiedExecution.evidenceStatus,'SOURCE_BOUND');
assert.ok(verifiedExecution.evidence.externalAuthority>unverifiedExecution.evidence.externalAuthority);

const scarred=compileUniversalTruthEnvelopeR152({address:0,claimId,claim:'alpha',evidence:[],scar:{priorUncertainty:.9,priorContradiction:.7}});
assert.ok(scarred.scarCarry.uncertainty>.7,'prior uncertainty must survive recontextualization');
assert.ok(scarred.scarCarry.contradiction>.5,'prior contradiction must survive recontextualization');

console.log(JSON.stringify({schema:modelOnly.schema,status:'PASS',modelOnly:{evidenceStatus:modelOnly.evidenceStatus,responsePath:modelOnly.responsePath,truthConfidence:modelOnly.truthConfidence},empirical:{evidenceStatus:strong.evidenceStatus,responsePath:strong.responsePath,truthConfidence:strong.truthConfidence,independentFamilies:strong.evidence.independentSourceFamilies},contradiction:{evidenceStatus:contradicted.evidenceStatus,responsePath:contradicted.responsePath},allModesChannels:modelOnly.appliedModes.totalChannels,boundary:modelOnly.truthBoundary},null,2));

import assert from 'node:assert/strict';
import {evaluateEmpiricalCalibrationR128,replayCapsuleR128,semanticReplayHashR128,R128_LAWS} from '../src/validation/empiricalCalibrationReplayR128.ts';

const mk=(id,split,score,label,extra={})=>({id,datasetId:'external-benchmark-1',datasetClass:'EXTERNAL',source:'external-fixture',sourceFamily:'external-lab-a',split,score,label,provenanceHash:'a'.repeat(64),...extra});
const calibration=[mk('c1','CALIBRATION',.95,1),mk('c2','CALIBRATION',.85,1),mk('c3','CALIBRATION',.70,1),mk('c4','CALIBRATION',.42,0),mk('c5','CALIBRATION',.22,0),mk('c6','CALIBRATION',.05,0)];
const holdout=Array.from({length:24},(_,i)=>i<12?mk(`h${i}`,'HOLDOUT',.72+(i%6)*.04,1,{sourceFamily:'external-lab-b'}):mk(`h${i}`,'HOLDOUT',.08+(i%6)*.04,0,{sourceFamily:'external-lab-b'}));
const base={experimentId:'exp-r128-1',modelId:'omega-candidate-r128',claim:'bounded benchmark candidate predicts external binary outcome',examples:[...calibration,...holdout],policy:{minExternalHoldout:20,minF1:.9,maxBrier:.12,maxCalibrationError:.22,requireReproduction:true}};

const hash1=semanticReplayHashR128(base);
const hash2=semanticReplayHashR128({...base,examples:base.examples.map((x,i)=>({...x,observedAt:`2026-09-06T18:${String(i).padStart(2,'0')}:00Z`}))});
assert.equal(hash1,hash2,'wall clock metadata must not change semantic replay identity');
const changed=semanticReplayHashR128({...base,examples:base.examples.map(x=>x.id==='h0'?{...x,score:.31}:x)});
assert.notEqual(hash1,changed,'semantic evidence change must change replay identity');
const shuffled=semanticReplayHashR128({...base,examples:[...base.examples].reverse()});
assert.equal(hash1,shuffled,'row ordering must not change semantic identity');

const noReproduction=evaluateEmpiricalCalibrationR128(base);
assert.equal(noReproduction.status,'INCONCLUSIVE');
assert.equal(noReproduction.reason,'INDEPENDENT_REPRODUCTION_INSUFFICIENT');
assert.equal(noReproduction.receipt.threshold.holdoutUsedForFit,false);
assert.equal(noReproduction.receipt.boundaries.syntheticValidationCredit,0);
assert.ok(Number.isFinite(noReproduction.receipt.holdout.confusion.f1));
assert.ok(Number.isFinite(noReproduction.receipt.holdout.brier));
assert.ok(Number.isFinite(noReproduction.receipt.holdout.expectedCalibrationError));

const reproductionReceipts=[
 {id:'rep-a',targetSemanticHash:hash1,sourceFamily:'validator-a',verdict:'PASS',reproducible:true,independent:true,observedAt:'2026-09-06T19:00:00Z'},
 {id:'rep-b',targetSemanticHash:hash1,sourceFamily:'validator-b',verdict:'PASS',reproducible:true,independent:true,observedAt:'2026-09-06T19:01:00Z'}
];
const validated=evaluateEmpiricalCalibrationR128({...base,reproductionReceipts});
assert.equal(validated.status,'VALIDATED');
assert.equal(validated.reason,'POLICY_PASSED');
assert.equal(validated.receipt.reproduction.independentPassFamilies,2);
assert.equal(validated.receipt.boundaries.canonicalMutation,false);
assert.equal(validated.receipt.boundaries.universalTruthClaim,false);
assert.match(validated.receipt.receiptSha256,/^[a-f0-9]{64}$/);

const failed=evaluateEmpiricalCalibrationR128({...base,reproductionReceipts:[...reproductionReceipts,{id:'rep-fail',targetSemanticHash:hash1,sourceFamily:'validator-c',verdict:'FAIL',reproducible:true,independent:true,observedAt:'2026-09-06T19:02:00Z'}]});
assert.equal(failed.status,'NOT_VALIDATED');
assert.equal(failed.reason,'REPRODUCTION_FAILED');

const synthetic=[...calibration,...holdout].map(x=>({...x,id:'s-'+x.id,datasetId:'synthetic-only',datasetClass:'SYNTHETIC',source:'generator',sourceFamily:'synthetic-generator'}));
const synth=evaluateEmpiricalCalibrationR128({...base,examples:synthetic,reproductionReceipts:[]});
assert.equal(synth.status,'INCONCLUSIVE');
assert.equal(synth.reason,'EXTERNAL_CALIBRATION_OR_HOLDOUT_MISSING');
assert.equal(synth.syntheticValidationCredit,0);

const internal=[...calibration].map(x=>({...x,id:'i-'+x.id,datasetClass:'INTERNAL_DERIVED',datasetId:'internal-derived'}));
const noExternalHoldout=evaluateEmpiricalCalibrationR128({...base,examples:internal});
assert.equal(noExternalHoldout.status,'INCONCLUSIVE');

assert.throws(()=>evaluateEmpiricalCalibrationR128({...base,examples:[...base.examples,{...holdout[0],split:'CALIBRATION'}]}),/HOLDOUT_LEAKAGE_DETECTED/);

const bad=[...base.examples];bad[0]={...bad[0],score:2};
const invalid=evaluateEmpiricalCalibrationR128({...base,examples:bad});
assert.equal(invalid.status,'INCONCLUSIVE');
assert.equal(invalid.reason,'INVALID_EXAMPLES');

const capsule=replayCapsuleR128(base);
assert.equal(capsule.semanticHash,hash1);
assert.equal(capsule.deterministic,true);
assert.equal(capsule.wallClockExcludedFromSemanticHash,true);
assert.match(capsule.datasetHashes[0].sha256,/^[a-f0-9]{64}$/);
for(const law of ['SYNTHETIC_DATA_NEVER_COUNTS_AS_EXTERNAL_VALIDATION','HOLDOUT_DATA_NEVER_PARTICIPATES_IN_THRESHOLD_FIT','NO_GROUND_TRUTH_MEANS_INCONCLUSIVE','EXTERNAL_VALIDATION_DOES_NOT_BYPASS_R125_CANONICAL_ADMISSION'])assert.ok(R128_LAWS.includes(law));
console.log('R128 empirical calibration + deterministic replay ledger: PASS');

import assert from'node:assert/strict';
import{runPcwdBenchmarkSuiteV1,PCWD_BENCHMARK_SCHEMA,PCWD_BENCHMARK_BOUNDARY}from'../src/system/pcwdBenchmarkSuite';

const suite=await runPcwdBenchmarkSuiteV1();
assert.equal(suite.schema,PCWD_BENCHMARK_SCHEMA);
assert.equal(suite.revision,'R358');
assert.equal(suite.results.length,10);
assert.equal(suite.summary.total,10);
assert.equal(suite.summary.wins,8);
assert.equal(suite.summary.costs,1);
assert.equal(suite.summary.limits,1);
assert.equal(suite.summary.ties,0);
assert.equal(suite.summary.pcwdPassCount,10);
assert.match(PCWD_BENCHMARK_BOUNDARY,/explicit minimal baselines/i);
assert.match(PCWD_BENCHMARK_BOUNDARY,/does not establish scientific novelty/i);

const by=(id:string)=>suite.results.find(x=>x.id===id)!;

const lens=by('RECOVERABLE_RESOLUTION_LENS');
assert.equal(lens.verdict,'WIN');
assert.ok(Number(lens.metrics.pcwdMeanRmse)<=1e-12);
assert.ok(Number(lens.metrics.baselineMeanRmse)>1e-3);
assert.ok(Number(lens.metrics.storageOverheadRatio)>1);
assert.ok(lens.discardedByBaseline.includes('within-bin residual'));

const path=by('CLOSED_PATH_HISTORY');
assert.equal(path.verdict,'WIN');
assert.equal(path.metrics.sameEndpoint,true);
assert.equal(path.metrics.pcwdPathDistinct,true);
assert.ok(path.discardedByBaseline.includes('route/order history'));

const tamper=by('PACKET_TAMPER');
assert.equal(tamper.verdict,'WIN');
assert.equal(tamper.metrics.validAccepted,true);
assert.equal(tamper.metrics.mutatedAcceptedByPCWD,false);
assert.equal(tamper.metrics.baselineDetectsMutation,false);

const evidence=by('EVIDENCE_ADMISSIBILITY');
assert.equal(evidence.verdict,'WIN');
assert.equal(evidence.metrics.numericStateEqual,true);
assert.equal(evidence.metrics.missingEvidenceBlocked,true);
assert.equal(evidence.metrics.missingEvidenceDecision,'ESCALATE');

const quantum=by('QUBIT_UNITARY_VALIDITY');
assert.equal(quantum.verdict,'WIN');
assert.equal(quantum.metrics.validPromotion,true);
assert.equal(quantum.metrics.invalidPromotion,false);
assert.equal(quantum.metrics.invalidInvariantGate,false);
assert.ok(Number(quantum.metrics.validFidelity)>1-1e-12);

const covariance=by('COVARIANCE_CARRY');
assert.equal(covariance.verdict,'WIN');
assert.ok(Number(covariance.metrics.baselineFrobeniusError)>1e-6);
assert.equal(covariance.metrics.uncertaintyCollapsed,false);

const forecast=by('FORECAST_BRANCH_RETENTION');
assert.equal(forecast.verdict,'WIN');
assert.equal(forecast.metrics.pcwdRetainedBranches,3);
assert.equal(forecast.metrics.baselineRetainedBranches,1);
assert.ok(Number(forecast.metrics.baselineDiscardedWeight)>0);
assert.ok(Math.abs(Number(forecast.metrics.weightsSum)-1)<1e-12);

const lorenz=by('LORENZ63_DYNAMICS_CORRESPONDENCE');
assert.equal(lorenz.verdict,'WIN');
assert.ok(Number(lorenz.metrics.correctDynamicsError)<=1e-12);
assert.ok(Number(lorenz.metrics.perturbedDynamicsError)>1e-3);
assert.equal(lorenz.metrics.correctDecision,'STAY');
assert.equal(lorenz.metrics.perturbedDecision,'TURN');

const limit=by('NO_RESIDUAL_NEGATIVE_CONTROL');
assert.equal(limit.verdict,'LIMIT');
assert.ok(Number(limit.metrics.recoveryError)>0);
assert.equal(limit.metrics.scarRetained,false);
assert.equal(limit.metrics.recoveryBounded,false);
assert.equal(limit.pcwdPass,true);

const overhead=by('PROOF_OVERHEAD');
assert.equal(overhead.verdict,'COST');
assert.ok(Number(overhead.metrics.pcwdBytes)>Number(overhead.metrics.baselineBytes));
assert.ok(Number(overhead.metrics.overheadRatio)>1);
assert.equal(overhead.metrics.compactIndexVerified,true);
assert.ok(Number(overhead.metrics.compactIndexBytes)<Number(overhead.metrics.pcwdBytes));
assert.ok(Number(overhead.metrics.compactVsFullRatio)<.5);
assert.equal(overhead.pcwdPass,true);

for(const result of suite.results){
 assert.ok(result.problem.length>0);
 assert.ok(result.baseline.length>0);
 assert.ok(result.interpretation.length>0);
}

for(const required of[
 'within-bin residual','high-frequency/impulse detail','route/order history','mutation evidence',
 'evidence provenance/admissibility','validity proof for the supplied transform','input correlation/cross-covariance',
 'non-argmax admissible futures','discarded branch weight','model-correspondence error',
])assert.ok(suite.summary.additionalInformationCategories.includes(required),`missing information category: ${required}`);

console.log(JSON.stringify({
 schema:suite.schema,
 summary:suite.summary,
 results:suite.results.map(r=>({
  id:r.id,verdict:r.verdict,pcwdPass:r.pcwdPass,baselinePass:r.baselinePass,metrics:r.metrics,
  discardedByBaseline:r.discardedByBaseline,
 })),
 boundary:suite.boundary,
},null,2));
console.log('R358 PCWD BENCHMARK PASS · 8 explicit-baseline wins · 1 measured proof-overhead cost · 1 negative-control recovery limit correctly held · no novelty claim');

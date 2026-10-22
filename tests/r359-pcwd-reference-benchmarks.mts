import assert from'node:assert/strict';
import{runPcwdReferenceBenchmarkSuiteV1,PCWD_REFERENCE_BENCHMARK_SCHEMA,PCWD_REFERENCE_BENCHMARK_BOUNDARY}from'../src/system/pcwdReferenceBenchmarkSuite';

const suite=await runPcwdReferenceBenchmarkSuiteV1();
assert.equal(suite.schema,PCWD_REFERENCE_BENCHMARK_SCHEMA);
assert.equal(suite.revision,'R359');
assert.equal(suite.summary.total,10);
assert.equal(suite.summary.matches,7);
assert.equal(suite.summary.tradeoffs,1);
assert.equal(suite.summary.fails,1);
assert.equal(suite.summary.fixed,1);
assert.equal(suite.summary.referencePassCount,10);
assert.equal(suite.summary.pcwdPassCount,9);
assert.match(suite.conclusion,/mostly matches rather than numerically outperforms/i);
assert.match(suite.conclusion,/missing additive process noise/i);
assert.match(PCWD_REFERENCE_BENCHMARK_BOUNDARY,/MATCH means numerical\/information parity, not novelty/i);

const by=(id:string)=>suite.results.find(x=>x.id===id)!;

const haar=by('HAAR_WAVELET_ROUND_TRIP');
assert.equal(haar.verdict,'TRADEOFF');
assert.ok(Number(haar.metrics.referenceRmse)<=1e-12);
assert.ok(Number(haar.metrics.pcwdRmse)<=1e-12);
assert.ok(Number(haar.metrics.pcwdScalarRatio)>1);

const linear=by('LINEAR_COVARIANCE_REFERENCE');
assert.equal(linear.verdict,'MATCH');
assert.ok(Number(linear.metrics.frobeniusError)<=1e-12);

const legacy=by('KALMAN_PROCESS_NOISE_LEGACY');
assert.equal(legacy.verdict,'FAIL');
assert.equal(legacy.referencePass,true);
assert.equal(legacy.pcwdPass,false);
assert.ok(Number(legacy.metrics.frobeniusError)>1e-6);

const fixed=by('KALMAN_PROCESS_NOISE_R359');
assert.equal(fixed.verdict,'FIXED');
assert.equal(fixed.referencePass,true);
assert.equal(fixed.pcwdPass,true);
assert.ok(Number(fixed.metrics.frobeniusError)<=1e-12);
assert.equal(fixed.metrics.symmetric,true);

const event=by('EVENT_SOURCING_PATH_HISTORY');
assert.equal(event.verdict,'MATCH');
assert.equal(event.metrics.referenceDistinct,true);
assert.equal(event.metrics.pcwdDistinct,true);
assert.equal(event.metrics.pcwdProofIntegrity,true);

const hash=by('HASH_CHAIN_INTEGRITY');
assert.equal(hash.verdict,'MATCH');
assert.equal(hash.metrics.referenceDetects,true);
assert.equal(hash.metrics.pcwdDetects,true);

const prob=by('PROBABILISTIC_BRANCH_RETENTION');
assert.equal(prob.verdict,'MATCH');
assert.ok(Number(prob.metrics.weightRmse)<=1e-12);
assert.equal(prob.metrics.referenceBranches,3);
assert.equal(prob.metrics.pcwdBranches,3);

const lorenz=by('LORENZ63_RK4_REFERENCE');
assert.equal(lorenz.verdict,'MATCH');
assert.equal(lorenz.metrics.steps,100);
assert.ok(Number(lorenz.metrics.trajectoryRmse)<=1e-15);

const qubit=by('QUBIT_UNITARY_REFERENCE');
assert.equal(qubit.verdict,'MATCH');
assert.equal(qubit.metrics.promotionEligible,true);
assert.ok(Number(qubit.metrics.fidelity)>1-1e-12);

const cat=by('ARNOLD_CAT_MAP_REVERSIBILITY');
assert.equal(cat.verdict,'MATCH');
assert.equal(cat.metrics.recoveryError,0);

for(const result of suite.results){
 assert.ok(result.reference.length>0);
 assert.ok(result.problem.length>0);
 assert.ok(result.finding.length>0);
 assert.ok(result.referenceRetains.length>0);
 assert.ok(result.pcwdRetains.length>0);
}

console.log(JSON.stringify({schema:suite.schema,summary:suite.summary,results:suite.results.map(x=>({id:x.id,verdict:x.verdict,pcwdPass:x.pcwdPass,referencePass:x.referencePass,metrics:x.metrics,finding:x.finding})),conclusion:suite.conclusion,boundary:suite.boundary},null,2));
console.log('R359 REFERENCE BENCHMARK PASS · 7 competent-reference matches · 1 tradeoff · 1 preserved legacy failure · 1 benchmark-driven fix · no numerical-superiority claim');

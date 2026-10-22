import assert from'node:assert/strict';
import{runPcwdBenchmarkSuiteV1}from'../src/system/pcwdBenchmarkSuite';
import{DEFAULT_BENCHMARK_POLICY_V1,governPcwdBenchmarkSuiteV1,verifyBenchmarkGovernorReceiptV1}from'../src/system/pcwdBenchmarkGovernor';

const suite=await runPcwdBenchmarkSuiteV1();
const receipt=await governPcwdBenchmarkSuiteV1(suite);
assert.equal(receipt.decision,'ADVANCE');
assert.equal(receipt.allowAdvance,true);
assert.equal(receipt.measurements.cases,10);
assert.equal(receipt.measurements.wins,8);
assert.equal(receipt.measurements.costs,1);
assert.equal(receipt.measurements.limits,1);
assert.equal(receipt.gates.schemaValid,true);
assert.equal(receipt.gates.enoughCases,true);
assert.equal(receipt.gates.enoughWins,true);
assert.equal(receipt.gates.costExposed,true);
assert.equal(receipt.gates.limitExposed,true);
assert.equal(receipt.gates.expectedBehaviorPassed,true);
assert.equal(receipt.gates.informationDeltaMeasured,true);
assert.equal(receipt.gates.noHiddenResultClass,true);
assert.equal(receipt.noveltyClaimed,false);
assert.equal(receipt.superiorityClaimed,false);
assert.match(receipt.receiptDigest,/^[0-9a-f]{64}$/);
assert.equal(await verifyBenchmarkGovernorReceiptV1(receipt),true);

const cherryPicked=structuredClone(suite);
cherryPicked.summary.costs=0;
cherryPicked.summary.total=9;
cherryPicked.results=cherryPicked.results.filter(x=>x.verdict!=='COST');
const held=await governPcwdBenchmarkSuiteV1(cherryPicked,{...DEFAULT_BENCHMARK_POLICY_V1,minimumCases:9});
assert.equal(held.allowAdvance,false);
assert.equal(held.decision,'HOLD');
assert.equal(held.gates.costExposed,false);
assert.ok(held.reasons.includes('costExposed'));

const noLimit=structuredClone(suite);
noLimit.summary.limits=0;
noLimit.summary.total=9;
noLimit.results=noLimit.results.filter(x=>x.verdict!=='LIMIT');
const held2=await governPcwdBenchmarkSuiteV1(noLimit,{...DEFAULT_BENCHMARK_POLICY_V1,minimumCases:9});
assert.equal(held2.allowAdvance,false);
assert.equal(held2.gates.limitExposed,false);

const tampered=structuredClone(receipt);
tampered.measurements.wins=999;
assert.equal(await verifyBenchmarkGovernorReceiptV1(tampered),false);

console.log('R358 BENCHMARK GOVERNOR PASS · ADVANCE requires explicit wins + exposed cost + exposed limit + complete classification + information-delta measurement · cherry-picking fails closed · no novelty/superiority authority');

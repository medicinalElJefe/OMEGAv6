import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileSingmasterShardedExactR297,SINGMASTER_SHARDED_BASELINE_R297} from '../src/proof/singmasterShardedExactR297.js';
import {compilePairStarFromFibersR298,compileSingmasterPairStarR298,SINGMASTER_PAIR_STAR_BOUNDARY_R298,SINGMASTER_PAIR_STAR_SCHEMA_R298} from '../src/proof/singmasterPairStarR298.js';

const source=compileSingmasterShardedExactR297(SINGMASTER_SHARDED_BASELINE_R297);
const atlas=compileSingmasterPairStarR298(source);
assert.equal(atlas.schema,SINGMASTER_PAIR_STAR_SCHEMA_R298);
assert.equal(atlas.globalClaimStatus,'OPEN');
assert.equal(atlas.proofScope,'EXACT_LABELED_PAIR_STAR_REDUCTION');
assert.equal(atlas.sourceFingerprint,source.fingerprint);
assert.equal(atlas.sourceFourfoldCandidateCount,0);
assert.equal(atlas.coherentFourTupleCount,0);
assert.equal(atlas.equivalencePass,true,'labeled pair-star result must exactly agree with source fourfold fibers');
assert.equal(atlas.exhaustiveWithinSourceBox,true);
assert.equal(atlas.terminalForGlobalClaim,false);
assert.equal(atlas.exteriorOpen,true);
assert.equal(atlas.truthMutationAuthority,false);
assert.equal(atlas.sourceMutationAuthority,false);
assert.equal(atlas.productionAuthority,false);
assert.match(atlas.exteriorStatement,/G09\/G10\/G13/);
assert.match(SINGMASTER_PAIR_STAR_BOUNDARY_R298,/identical exact coefficient label survives on all six pair edges/);
assert.match(SINGMASTER_PAIR_STAR_BOUNDARY_R298,/not a global proof/);

const edge=(a,b)=>atlas.edges.find(x=>x.a===Math.min(a,b)&&x.b===Math.max(a,b));
assert.deepEqual(edge(2,5)?.labels,['3003','11628'],'column pair 2/5 must retain both exact labels rather than collapse to an unlabeled edge');
assert.deepEqual(edge(2,6)?.labels,['3003']);
assert.deepEqual(edge(5,6)?.labels,['3003']);
assert.deepEqual(edge(39,40)?.labels,['61218182743304701891431482520']);
assert(atlas.stars.some(x=>x.center===2&&x.arms.includes(5)&&x.arms.includes(6)&&x.commonArmLabels.includes('3003')),'3003 exact star label must survive at center k=2');

const syntheticFalse=compilePairStarFromFibersR298([
 {value:'101',representations:[{k:2},{k:3}]},
 {value:'102',representations:[{k:2},{k:4}]},
 {value:'103',representations:[{k:2},{k:5}]},
 {value:'104',representations:[{k:3},{k:4}]},
 {value:'105',representations:[{k:3},{k:5}]},
 {value:'106',representations:[{k:4},{k:5}]}
]);
assert.equal(syntheticFalse.unlabeledCompleteCount,1,'six pairwise edges should form one unlabeled K4');
assert.equal(syntheticFalse.coherentFourTupleCount,0,'different labels on six edges are not one common integer fiber');
assert.equal(syntheticFalse.falsePairwisePositiveCount,1,'R298 must expose the unlabeled pairwise false positive');
assert.deepEqual(syntheticFalse.falsePairwisePositives[0].columns,[2,3,4,5]);
assert.deepEqual(syntheticFalse.falsePairwisePositives[0].commonLabels,[]);

const syntheticTrue=compilePairStarFromFibersR298([
 {value:'999',representations:[{k:2},{k:3},{k:4},{k:5}]}
]);
assert.equal(syntheticTrue.unlabeledCompleteCount,1);
assert.equal(syntheticTrue.coherentFourTupleCount,1);
assert.equal(syntheticTrue.falsePairwisePositiveCount,0);
assert.deepEqual(syntheticTrue.coherentFourTuples[0].columns,[2,3,4,5]);
assert.deepEqual(syntheticTrue.coherentFourTuples[0].commonLabels,['999']);

const mixed=compilePairStarFromFibersR298([
 {value:'999',representations:[{k:2},{k:3},{k:4},{k:5}]},
 {value:'111',representations:[{k:2},{k:3}]},
 {value:'222',representations:[{k:4},{k:5}]}
]);
assert.equal(mixed.coherentFourTupleCount,1,'extra pair labels must not erase a genuine coherent common label');
assert.deepEqual(mixed.coherentFourTuples[0].commonLabels,['999']);

const docs=fs.readFileSync('R298_SINGMASTER_LABELED_PAIR_STAR.md','utf8');
for(const token of ['six pair edges','same exact value','fixed-column uniqueness','false positive','OPEN','G09','G10','G13'])assert(docs.includes(token),`R298 documentation missing ${token}`);

console.log('R298 SINGMASTER LABELED PAIR-STAR PASS');
console.log(JSON.stringify({columns:atlas.columns.length,edges:atlas.edgeCount,tuples:atlas.tupleCount,unlabeledComplete:atlas.unlabeledCompleteCount,coherentFourTuples:atlas.coherentFourTupleCount,falsePairwisePositives:atlas.falsePairwisePositiveCount,equivalencePass:atlas.equivalencePass,globalClaimStatus:atlas.globalClaimStatus,fingerprint:atlas.fingerprint}));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileSingmasterExactClosureR296} from '../src/proof/singmasterExactClosureR296.js';
import {compileShardedNoGoAtlasR297,compileSingmasterShardedExactR297,exactValueBucketR297,planColumnShardsR297,SINGMASTER_SHARDED_BASELINE_R297,SINGMASTER_SHARDED_EXACT_BOUNDARY_R297,SINGMASTER_SHARDED_EXACT_SCHEMA_R297,verifyR297Baseline} from '../src/proof/singmasterShardedExactR297.js';

const baseline=verifyR297Baseline();
assert.equal(baseline.pass,true,'R297 baseline sharded certificate must replay exactly');
const cert=baseline.certificate;
assert.equal(cert.schema,SINGMASTER_SHARDED_EXACT_SCHEMA_R297);
assert.equal(cert.globalClaimStatus,'OPEN');
assert.equal(cert.proofScope,'EXACT_BOUNDED_SHARDED_COMPOSITION');
assert.equal(cert.scope.maxN,1000);
assert.equal(cert.scope.maxK,100);
assert.equal(cert.scope.scannedCells,89001);
assert.equal(cert.distinctValues,88992);
assert.equal(cert.collisionFiberCount,8);
assert.equal(cert.crossShardCollisionCount,3);
assert.equal(cert.maxNontrivialMultiplicity,3);
assert.equal(cert.fourfoldCandidateCount,0);
assert.equal(cert.boundedStatementPass,true);
assert.equal(cert.composition.shardWidth,3);
assert.equal(cert.composition.shardCount,33);
assert.equal(cert.composition.bucketCount,64);
assert.equal(cert.composition.cellConservation,true);
assert.equal(cert.composition.mergedRepresentationCount,cert.scope.scannedCells);
assert.equal(cert.composition.sameValueSameBucketByConstruction,true);
assert.equal(cert.openExterior,true);
assert.equal(cert.sourceMutationAuthority,false);
assert.equal(cert.truthMutationAuthority,false);
assert.equal(cert.productionAuthority,false);
assert.match(SINGMASTER_SHARDED_EXACT_BOUNDARY_R297,/cross-shard collisions cannot be discarded/);
assert.match(SINGMASTER_SHARDED_EXACT_BOUNDARY_R297,/does not prove the global Sharp Singmaster Bound/);
assert.match(cert.exteriorStatement,/G09\/G10\/G13 remain open/);

const expected=[...SINGMASTER_SHARDED_BASELINE_R297.expectedCollisionValues].sort((a,b)=>a.length-b.length||a.localeCompare(b));
assert.deepEqual(cert.collisionFibers.map(x=>x.value).sort((a,b)=>a.length-b.length||a.localeCompare(b)),expected);
assert(cert.collisionFibers.every(x=>x.pass&&x.signaturePass&&x.kummerPass),'all composed collision fibers must preserve complete exact signatures');
const cross=cert.collisionFibers.filter(x=>x.crossShard).map(x=>x.value).sort((a,b)=>a.length-b.length||a.localeCompare(b));
assert.deepEqual(cross,['3003','11628','24310'],'expected cross-shard equalities must survive composition');
const fib=cert.collisionFibers.find(x=>x.value==='61218182743304701891431482520');
assert(fib,'R297 enlarged box must recover the first Fibonacci-family collision');
assert.deepEqual(fib.representations.map(({n,k})=>({n,k})),[{n:104,k:39},{n:103,k:40}]);
assert.equal(fib.multiplicity,2);

for(const fiber of cert.collisionFibers){
 const buckets=new Set(fiber.representations.map(()=>exactValueBucketR297(fiber.value,cert.composition.bucketCount)));
 assert.equal(buckets.size,1,`equal exact value ${fiber.value} must route to exactly one coordinator bucket`);
 assert.equal([...buckets][0],fiber.bucket,`fiber ${fiber.value} bucket receipt mismatch`);
}
assert.equal(cert.bucketReceipts.reduce((n,x)=>n+x.representations,0),cert.scope.scannedCells,'bucket representation conservation failed');
assert.equal(cert.shardReceipts.reduce((n,x)=>n+x.scannedCells,0),cert.scope.scannedCells,'shard cell conservation failed');
assert(cert.shardReceipts.every(x=>x.scannedCells===x.plannedCells),'every shard must close its declared cell count');

const plan=planColumnShardsR297(SINGMASTER_SHARDED_BASELINE_R297);
assert.equal(plan.shards[0].id,'K2-4');
assert.equal(plan.shards.at(-1).id,'K98-100');
assert.equal(plan.shards.reduce((n,x)=>n+x.plannedCells,0),plan.plannedCells);

const mono=compileSingmasterExactClosureR296({maxN:300,maxK:30,maxCells:250000});
const sharded300=compileSingmasterShardedExactR297({maxN:300,maxK:30,shardWidth:3,bucketCount:32,maxCells:250000});
assert.equal(sharded300.scope.scannedCells,mono.scope.scannedCells);
assert.equal(sharded300.distinctValues,mono.distinctValues);
assert.equal(sharded300.collisionFiberCount,mono.collisionFiberCount);
assert.equal(sharded300.maxNontrivialMultiplicity,mono.maxNontrivialMultiplicity);
const normalize=x=>x.collisionFibers.map(f=>({value:f.value,reps:f.representations.map(r=>[r.n,r.k]).sort((a,b)=>a[1]-b[1]||a[0]-b[0])})).sort((a,b)=>a.value.length-b.value.length||a.value.localeCompare(b.value));
assert.deepEqual(normalize(sharded300),normalize(mono),'R297 sharded composition must be semantically identical to R296 monolithic exact scan on the same box');

const alternate=compileSingmasterShardedExactR297({maxN:300,maxK:30,shardWidth:7,bucketCount:17,maxCells:250000});
assert.deepEqual(normalize(alternate),normalize(sharded300),'collision semantics must not depend on shard width or exact-value bucket count');
assert.notEqual(alternate.fingerprint,sharded300.fingerprint,'composition provenance should change when shard/bucket topology changes');

const noGo=compileShardedNoGoAtlasR297(cert);
assert.equal(noGo.globalClaimStatus,'OPEN');
assert.equal(noGo.boundedNoGo.status,'PRUNE_EXACT_COMPOSED');
assert.equal(noGo.boundedNoGo.exhaustiveWithinDeclaredBox,true);
assert.equal(noGo.boundedNoGo.terminalForGlobalClaim,false);
assert.equal(noGo.boundedNoGo.crossShardCollisionCount,3);
assert.throws(()=>compileSingmasterShardedExactR297({maxN:1000,maxK:100,maxCells:1000}),/above maxCells/);

const docs=fs.readFileSync('R297_SINGMASTER_SHARDED_EXACT_FABRIC.md','utf8');
for(const token of ['89,001','cross-shard','61218182743304701891431482520','EXACT_BOUNDED_SHARDED_COMPOSITION','G09','G10','G13','OPEN'])assert(docs.includes(token),`R297 documentation missing ${token}`);
const script=fs.readFileSync('scripts/r297-singmaster-sharded-exact.mjs','utf8');
for(const token of ['OMEGA_R297_MAX_N','OMEGA_R297_MAX_K','OMEGA_R297_SHARD_WIDTH','OMEGA_R297_BUCKET_COUNT','sha256:','compileSingmasterShardedExactR297'])assert(script.includes(token),`R297 headless bridge missing ${token}`);

console.log('R297 SINGMASTER SHARDED EXACT FABRIC PASS');
console.log(JSON.stringify({scope:cert.scope,shards:cert.composition.shardCount,buckets:cert.composition.bucketCount,collisionFibers:cert.collisionFiberCount,crossShardCollisions:cert.crossShardCollisionCount,maxNontrivialMultiplicity:cert.maxNontrivialMultiplicity,fourfoldCandidates:cert.fourfoldCandidateCount,globalClaimStatus:cert.globalClaimStatus,fingerprint:cert.fingerprint}));

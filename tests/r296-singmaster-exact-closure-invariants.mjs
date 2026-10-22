import './r297-singmaster-sharded-exact-fabric-invariants.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 binomialBigIntR296,
 carryCountBasePR296,
 compileSingmasterExactClosureR296,
 compileSingmasterNoGoAtlasR296,
 completePrimeSignatureR296,
 findSeparatingPrimeR296,
 primesThroughR296,
 SINGMASTER_EXACT_BASELINE_R296,
 SINGMASTER_EXACT_CLOSURE_BOUNDARY_R296,
 SINGMASTER_EXACT_CLOSURE_SCHEMA_R296,
 verifyCompleteKummerR296,
 verifyR296Baseline,
 vpBinomialR296
} from '../src/proof/singmasterExactClosureR296.js';

const baseline=verifyR296Baseline();
assert.equal(baseline.pass,true,'R296 baseline finite-box certificate must replay exactly');
const cert=baseline.certificate;
assert.equal(cert.schema,SINGMASTER_EXACT_CLOSURE_SCHEMA_R296);
assert.equal(cert.globalClaimStatus,'OPEN','bounded exact search must never promote the global theorem');
assert.equal(cert.proofScope,'EXACT_BOUNDED_ONLY');
assert.equal(cert.scope.maxN,300);
assert.equal(cert.scope.maxK,30);
assert.equal(cert.scope.scannedCells,7801);
assert.equal(cert.scope.scannedCells,SINGMASTER_EXACT_BASELINE_R296.expectedScannedCells);
assert.equal(cert.collisionFiberCount,7);
assert.equal(cert.maxNontrivialMultiplicity,3);
assert.equal(cert.fourfoldCandidateCount,0);
assert.equal(cert.boundedStatementPass,true);
assert.equal(cert.openExterior,true);
assert.equal(cert.truthMutationAuthority,false);
assert.equal(cert.sourceMutationAuthority,false);
assert.equal(cert.productionAuthority,false);
assert.match(cert.exteriorStatement,/G09\/G10\/G13 therefore remain open/);
assert.match(SINGMASTER_EXACT_CLOSURE_BOUNDARY_R296,/finite box/);
assert.match(SINGMASTER_EXACT_CLOSURE_BOUNDARY_R296,/does not prove the global Sharp Singmaster Bound/);

const expected=['120','210','1540','3003','7140','11628','24310'];
assert.deepEqual(cert.collisionFibers.map(x=>x.value).sort((a,b)=>a.length-b.length||a.localeCompare(b)),expected);
assert(cert.collisionFibers.every(x=>x.pass&&x.kummerPass&&x.signaturesEquivalent),'every bounded collision fiber must preserve the complete prime/carry signature');

const witness=cert.collisionFibers.find(x=>x.value==='3003');
assert(witness,'3003 sharpness witness must remain visible inside the exact box');
assert.equal(witness.multiplicity,3);
assert.deepEqual(witness.representations,[{n:78,k:2},{n:15,k:5},{n:14,k:6}]);
assert.equal(binomialBigIntR296(3003,1),3003n);
assert.equal(binomialBigIntR296(78,2),3003n);
assert.equal(binomialBigIntR296(15,5),3003n);
assert.equal(binomialBigIntR296(14,6),3003n);

const primes=primesThroughR296(300);
assert.equal(primes.length,62,'prime coverage through 300 changed unexpectedly');
const sig=completePrimeSignatureR296(78,2,300);
assert.deepEqual(sig,[[3,1],[7,1],[11,1],[13,1]],'complete 3003 factor signature must be exact');
for(const rep of witness.representations){
 assert.deepEqual(completePrimeSignatureR296(rep.n,rep.k,300),sig,`3003 signature mismatch C(${rep.n},${rep.k})`);
 const kummer=verifyCompleteKummerR296(rep.n,rep.k,300);assert.equal(kummer.pass,true);assert.equal(kummer.checkCount,62);
 for(const p of [2,3,5,7,11,13,17,19,23,29,31])assert.equal(vpBinomialR296(rep.n,rep.k,p),carryCountBasePR296(rep.k,rep.n-rep.k,p));
}

const separator=findSeparatingPrimeR296({n:78,k:2},{n:79,k:2});
assert(separator,'unequal exact coefficients must admit a separating-prime certificate');
assert.equal(separator.p,7);
assert.equal(separator.leftValue,'3003');
assert.equal(separator.rightValue,'3081');
assert.equal(separator.certificate,'SEPARATING_PRIME');
assert.equal(findSeparatingPrimeR296({n:78,k:2},{n:15,k:5}),null,'equal coefficient representations must not fabricate a separating prime');

const noGo=compileSingmasterNoGoAtlasR296(cert);
assert.equal(noGo.globalClaimStatus,'OPEN');
assert.equal(noGo.boundedNoGo.status,'PRUNE_EXACT_BOUNDED');
assert.equal(noGo.boundedNoGo.exhaustiveWithinDeclaredBox,true);
assert.equal(noGo.boundedNoGo.terminalForGlobalClaim,false,'finite box must never masquerade as global terminal closure');
assert.equal(noGo.fibers.find(x=>x.value==='3003')?.status,'SURVIVES_EQUALITY');

const smaller=compileSingmasterExactClosureR296({maxN:80,maxK:10,maxCells:5000});
assert.equal(smaller.boundedStatementPass,true);
assert.equal(smaller.maxNontrivialMultiplicity,3);
assert.equal(smaller.fourfoldCandidateCount,0);
assert.throws(()=>compileSingmasterExactClosureR296({maxN:300,maxK:30,maxCells:100}),/above maxCells/,'bounded engine must refuse accidental over-budget scans');
assert.throws(()=>compileSingmasterExactClosureR296({maxN:20,maxK:11}),/maxK must satisfy/);

const registry=fs.readFileSync('src/proof/proofDomainRegistryR295.js','utf8');
assert(registry.includes('tests/r296-singmaster-exact-closure-invariants.mjs'),'R295 proof-domain registry must carry the R296 exact-closure regression');
const docs=fs.readFileSync('R296_SINGMASTER_EXACT_CLOSURE_KERNEL.md','utf8');
for(const token of ['EXACT_BOUNDED_ONLY','7,801','3003','G09','G10','G13','OPEN'])assert(docs.includes(token),`R296 documentation missing ${token}`);
const bridge=fs.readFileSync('scripts/r296-singmaster-exact-closure.mjs','utf8');
for(const token of ['OMEGA_R296_MAX_N','OMEGA_R296_MAX_K','sha256:','compileSingmasterExactClosureR296','globalClaimStatus'])assert(bridge.includes(token),`R296 headless bridge missing ${token}`);

console.log('R296 SINGMASTER EXACT CLOSURE KERNEL PASS');
console.log(JSON.stringify({scope:cert.scope,collisionFibers:cert.collisionFiberCount,maxNontrivialMultiplicity:cert.maxNontrivialMultiplicity,fourfoldCandidates:cert.fourfoldCandidateCount,globalClaimStatus:cert.globalClaimStatus,fingerprint:cert.fingerprint}));

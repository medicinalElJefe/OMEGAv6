import assert from 'node:assert/strict';
import {R753_BOUNDARY,pellGcdSkinR753,kummerCarriesR753,pellRequiredValuationR753,screenAdditionalPellCandidateR753} from '../src/proof/singmasterPellSkinR753.js';
const expected=[[1,'15','5','5','2','21'],[2,'104','39','13','1','824'],[3,'714','272','34','1','14973'],[4,'4895','1869','89','2','134585'],[5,'33552','12815','233','1','4831344']];
for(const[t,n,k,g1,g2,L]of expected){const x=pellGcdSkinR753(t);assert.deepEqual([x.n,x.k,x.gcdFirst,x.gcdSecond,x.forcedDivisor],[n,k,g1,g2,L]);}
const PRIMES=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];
function legendre(n,p){n=BigInt(n);p=BigInt(p);let v=0n;while(n){n/=p;v+=n;}return v;}
let count=0;for(let t=1;t<=129;t++){const x=pellGcdSkinR753(t),n=BigInt(x.n),k=BigInt(x.k);assert.equal(x.globalFourfoldStatus,'OPEN');
 for(const p of PRIMES){const v=pellRequiredValuationR753(t,p);assert.equal(v.actualSharedCoefficientCarries,Number(legendre(n,p)-legendre(k,p)-legendre(n-k,p)));assert(v.actualSharedCoefficientCarries>=v.requiredMinCarries);count++;}}
assert.equal(count,3225);
assert.throws(()=>kummerCarriesR753(14,6,4));assert.throws(()=>kummerCarriesR753(14,15,2));assert.throws(()=>pellGcdSkinR753(-1));
assert.equal(screenAdditionalPellCandidateR753(3,713,273).status,'OUTSIDE_DECLARED_THIRD_REPRESENTATION_WINDOW');
let excluded=0,held=0;for(let row=548;row<=712;row++){const res=screenAdditionalPellCandidateR753(3,row,274);
 if(res.status==='CERTIFIED_NOT_EQUAL_BY_NECESSARY_VALUATION')excluded++;
 if(res.status==='NOT_EXCLUDED_BY_SELECTED_PRIMES')held++;}
assert.equal(excluded,86);assert.equal(held,79);
assert.equal(R753_BOUNDARY.sharpSingmaster,'OPEN');assert.equal(R753_BOUNDARY.fourfoldClosures,0);assert.equal(R753_BOUNDARY.productionAuthority,false);
console.log('R753 exact Pell gcd/divisor skin + 3225 Kummer/Legendre crosschecks + bounded prime-sieve controls PASS');

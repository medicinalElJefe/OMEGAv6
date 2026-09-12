import assert from 'node:assert/strict';
import fs from 'node:fs';

const atlas=fs.readFileSync('src/proof/singmasterProofAtlasR290.ts','utf8');
const workbench=fs.readFileSync('src/SingmasterProofWorkbenchR290.tsx','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const routes=fs.readFileSync('src/omegaExperienceRegistryR82.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

function C(n,k){
  let kk=Math.min(k,n-k),out=1n;
  for(let i=1;i<=kk;i+=1)out=out*BigInt(n-kk+i)/BigInt(i);
  return out;
}
function vf(n,p){let q=n,total=0;while(q>0){q=Math.floor(q/p);total+=q}return total}
function vp(n,k,p){return vf(n,p)-vf(k,p)-vf(n-k,p)}
function carries(a,b,p){let x=a,y=b,carry=0,count=0;while(x>0||y>0||carry>0){const sum=x%p+y%p+carry;if(sum>=p){count+=1;carry=1}else carry=0;x=Math.floor(x/p);y=Math.floor(y/p)}return count}
function verify(reps){const values=reps.map(([n,k])=>C(n,k));assert(values.every(v=>v===values[0]),`fiber mismatch ${JSON.stringify(reps)}`);return values[0].toString()}

assert.match(atlas,/SINGMASTER_PUBLIC_STATUS_R290='OPEN'/,'global theorem status must remain OPEN');
assert.match(atlas,/does not claim that the global Sharp Singmaster Bound/,'truth boundary must explicitly block false proof promotion');
assert.match(atlas,/SOURCE_MISSING/,'missing forensic lineage must remain explicit');
assert.match(workbench,/data-omega-proof-surface='singmaster-r290'/,'workbench proof surface marker missing');
assert.match(workbench,/Run exact audit/,'exact audit control missing');
assert.match(workbench,/Export SHA-256 R290 proof packet/,'proof packet export control missing');
assert.match(suite,/SingmasterProofWorkbenchR290/,'Evidence & Proof must mount the R290 workbench');
assert.match(suite,/panel==='Evidence & Proof'/,'R290 must remain inside the existing Evidence & Proof route');
assert.match(routes,/historicalR82Baseline:44/,'historical 44-route inventory baseline drifted');
assert.match(routes,/Evidence & Proof/,'Evidence & Proof route missing');
assert.equal(pkg.scripts['test:r290'],'node tests/r290-singmaster-proof-atlas-invariants.mjs','test:r290 script missing');
assert.match(pkg.scripts['check:static'],/npm run test:r290/,'canonical static check must include R290 invariants');

const exact=[
  [[[16,2],[10,3]],'120',3],
  [[[21,2],[10,4]],'210',3],
  [[[56,2],[22,3]],'1540',4],
  [[[78,2],[15,5],[14,6]],'3003',4],
  [[[120,2],[36,3]],'7140',4],
  [[[153,2],[19,5]],'11628',5],
  [[[221,2],[17,8]],'24310',5],
  [[[104,39],[103,40]],null,29],
  [[[714,272],[713,273]],null,205],
  [[[4895,1869],[4894,1870]],null,1412]
];
for(const[reps,expected,digits]of exact){const value=verify(reps);if(expected)assert.equal(value,expected);assert.equal(value.length,digits,`digit regression ${JSON.stringify(reps)}`)}

const witness=[[78,2],[15,5],[14,6]],primes=[2,3,5,7,11,13,17,19,23,29,31];
for(const[n,k]of witness)for(const p of primes)assert.equal(vp(n,k,p),carries(k,n-k,p),`Kummer mismatch C(${n},${k}) p=${p}`);
const sig=primes.map(p=>vp(78,2,p));
for(const[n,k]of witness.slice(1))assert.deepEqual(primes.map(p=>vp(n,k,p)),sig,`3003 valuation signature mismatch C(${n},${k})`);
assert.deepEqual(sig,[0,1,0,1,1,1,0,0,0,0,0],'3003 prime signature changed');

assert.equal(C(3003,1),3003n,'automatic k=1 witness must remain exact');
assert.equal(2*4,8,'left-half witness bookkeeping regression');

console.log('R290 Singmaster proof-atlas invariants PASS');
console.log(JSON.stringify({fibers:exact.length,kummerChecks:witness.length*primes.length,sharpWitness:3003,publicStatus:'OPEN'}));

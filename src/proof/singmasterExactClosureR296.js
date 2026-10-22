export const SINGMASTER_EXACT_CLOSURE_SCHEMA_R296='OMEGA_SINGMASTER_EXACT_CLOSURE_R296';
export const SINGMASTER_EXACT_CLOSURE_REVISION_R296='R296';
export const SINGMASTER_EXACT_CLOSURE_BOUNDARY_R296='R296 performs exact finite BigInt enumeration and complete prime-valuation/carry verification inside explicitly declared (n,k) bounds. A bounded closure certificate proves only the stated finite box. It does not prove the global Sharp Singmaster Bound, does not close G09/G10/G13, and does not create source-promotion, production, or CanonState authority.';
export const SINGMASTER_EXACT_BASELINE_R296=Object.freeze({maxN:300,maxK:30,maxCells:250000,expectedScannedCells:7801,expectedCollisionValues:Object.freeze(['120','210','1540','3003','7140','11628','24310']),expectedMaxNontrivialMultiplicity:3});

const CLAIM_ID='SHARP_SINGMASTER_N_LE_8';
const DOMAIN_ID='NUMBER_THEORY/PASCAL/SINGMASTER';
const stable=value=>{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`};
const hash32=value=>{const text=String(value);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const fingerprint=value=>`r296-${hash32(stable(value)).toString(16).padStart(8,'0')}`;
const compareIntegerStrings=(a,b)=>String(a).length-String(b).length||String(a).localeCompare(String(b));

export function binomialBigIntR296(n,k){
 if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||n<0||k<0||k>n)throw new Error(`invalid binomial C(${n},${k})`);
 const kk=Math.min(k,n-k);let out=1n;
 for(let i=1;i<=kk;i+=1)out=out*BigInt(n-kk+i)/BigInt(i);
 return out;
}

function vpFactorialR296(n,p){let q=n,total=0;while(q>0){q=Math.floor(q/p);total+=q}return total}
export function vpBinomialR296(n,k,p){
 if(!Number.isSafeInteger(p)||p<2)throw new Error('prime base must be an integer >= 2');
 return vpFactorialR296(n,p)-vpFactorialR296(k,p)-vpFactorialR296(n-k,p);
}
export function carryCountBasePR296(a,b,p){
 if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<0||b<0||!Number.isSafeInteger(p)||p<2)throw new Error('invalid Kummer carry inputs');
 let x=a,y=b,carry=0,count=0;
 while(x>0||y>0||carry>0){const sum=x%p+y%p+carry;if(sum>=p){count+=1;carry=1}else carry=0;x=Math.floor(x/p);y=Math.floor(y/p)}
 return count;
}

export function primesThroughR296(limit){
 if(!Number.isSafeInteger(limit)||limit<1)throw new Error('prime limit must be a positive safe integer');
 if(limit<2)return[];
 const sieve=new Uint8Array(limit+1);const out=[];
 for(let p=2;p<=limit;p+=1){if(sieve[p])continue;out.push(p);if(p*p<=limit)for(let q=p*p;q<=limit;q+=p)sieve[q]=1}
 return out;
}

export function completePrimeSignatureR296(n,k,primeBound=n){
 if(primeBound<n)throw new Error('complete prime signature requires primeBound >= n');
 return primesThroughR296(primeBound).map(p=>[p,vpBinomialR296(n,k,p)]).filter(([,e])=>e!==0);
}

export function verifyCompleteKummerR296(n,k,primeBound=n){
 if(primeBound<n)throw new Error('complete Kummer verification requires primeBound >= n');
 const checks=primesThroughR296(primeBound).map(p=>{const valuation=vpBinomialR296(n,k,p),carries=carryCountBasePR296(k,n-k,p);return{p,valuation,carries,pass:valuation===carries}});
 return{n,k,primeBound,checkCount:checks.length,pass:checks.every(x=>x.pass),checks};
}

export function findSeparatingPrimeR296(left,right){
 const a={n:Number(left?.n),k:Number(left?.k)},b={n:Number(right?.n),k:Number(right?.k)};
 const av=binomialBigIntR296(a.n,a.k),bv=binomialBigIntR296(b.n,b.k);
 if(av===bv)return null;
 const primeBound=Math.max(a.n,b.n);
 for(const p of primesThroughR296(primeBound)){
  const lv=vpBinomialR296(a.n,a.k,p),rv=vpBinomialR296(b.n,b.k,p);
  if(lv!==rv)return{p,leftValuation:lv,rightValuation:rv,left:a,right:b,leftValue:av.toString(),rightValue:bv.toString(),primeBound,certificate:'SEPARATING_PRIME'};
 }
 throw new Error('unequal exact binomial values had no separating prime; arithmetic invariant failure');
}

function normalizedBounds(options={}){
 const maxN=Number(options.maxN??SINGMASTER_EXACT_BASELINE_R296.maxN),maxK=Number(options.maxK??SINGMASTER_EXACT_BASELINE_R296.maxK),maxCells=Number(options.maxCells??SINGMASTER_EXACT_BASELINE_R296.maxCells);
 if(!Number.isSafeInteger(maxN)||maxN<4)throw new Error('maxN must be a safe integer >= 4');
 if(!Number.isSafeInteger(maxK)||maxK<2||maxK>Math.floor(maxN/2))throw new Error('maxK must satisfy 2 <= maxK <= floor(maxN/2)');
 if(!Number.isSafeInteger(maxCells)||maxCells<1)throw new Error('maxCells must be a positive safe integer');
 let plannedCells=0;for(let k=2;k<=maxK;k+=1)plannedCells+=Math.max(0,maxN-2*k+1);
 if(plannedCells>maxCells)throw new Error(`requested exact box contains ${plannedCells} cells, above maxCells=${maxCells}`);
 return{maxN,maxK,maxCells,plannedCells};
}

function representationSignatureR296(rep,primeBound){
 const signature=completePrimeSignatureR296(rep.n,rep.k,primeBound),kummer=verifyCompleteKummerR296(rep.n,rep.k,primeBound);
 return{n:rep.n,k:rep.k,signature,kummerPass:kummer.pass,kummerChecks:kummer.checkCount};
}

function certifyCollisionFiberR296(value,reps,primeBound){
 const exactValues=reps.map(rep=>binomialBigIntR296(rep.n,rep.k));
 if(!exactValues.every(v=>v===exactValues[0]))throw new Error(`collision fiber ${value} is not exact`);
 const signatures=reps.map(rep=>representationSignatureR296(rep,primeBound));
 const signatureKey=stable(signatures[0]?.signature||[]);
 const signaturesEquivalent=signatures.every(x=>stable(x.signature)===signatureKey);
 const kummerPass=signatures.every(x=>x.kummerPass);
 return{value:String(value),digits:String(value).length,multiplicity:reps.length,representations:reps.map(x=>({n:x.n,k:x.k})),completePrimeBound:primeBound,signaturesEquivalent,kummerPass,signature:signatures[0]?.signature||[],signatureChecks:signatures.reduce((a,b)=>a+b.kummerChecks,0),pass:signaturesEquivalent&&kummerPass};
}

export function compileSingmasterExactClosureR296(options={}){
 const bounds=normalizedBounds(options),valueMap=new Map();let scannedCells=0;
 for(let k=2;k<=bounds.maxK;k+=1){
  for(let n=2*k;n<=bounds.maxN;n+=1){
   const value=binomialBigIntR296(n,k).toString(),row=valueMap.get(value)||[];row.push({n,k});valueMap.set(value,row);scannedCells+=1;
  }
 }
 if(scannedCells!==bounds.plannedCells)throw new Error('exact scan cell-count mismatch');
 const collisionFibers=[...valueMap.entries()].filter(([,reps])=>reps.length>=2).map(([value,reps])=>certifyCollisionFiberR296(value,reps,bounds.maxN)).sort((a,b)=>b.multiplicity-a.multiplicity||compareIntegerStrings(a.value,b.value));
 const maxNontrivialMultiplicity=collisionFibers.reduce((m,x)=>Math.max(m,x.multiplicity),1),fourfoldCandidates=collisionFibers.filter(x=>x.multiplicity>=4),boundedStatementPass=fourfoldCandidates.length===0,sharpWitness=collisionFibers.find(x=>x.value==='3003')||null;
 const core={
  schema:SINGMASTER_EXACT_CLOSURE_SCHEMA_R296,
  revision:SINGMASTER_EXACT_CLOSURE_REVISION_R296,
  domainId:DOMAIN_ID,
  claimId:CLAIM_ID,
  globalClaimStatus:'OPEN',
  proofScope:'EXACT_BOUNDED_ONLY',
  scope:{minK:2,maxK:bounds.maxK,rowConstraint:'2k <= n <= maxN',maxN:bounds.maxN,plannedCells:bounds.plannedCells,scannedCells},
  distinctValues:valueMap.size,
  collisionFiberCount:collisionFibers.length,
  maxNontrivialMultiplicity,
  fourfoldCandidateCount:fourfoldCandidates.length,
  boundedStatementPass,
  boundedStatement:`No exact coefficient in the scanned box 2 <= k <= ${bounds.maxK}, 2k <= n <= ${bounds.maxN} has four distinct nontrivial left-half representations.`,
  openExterior:true,
  exteriorStatement:`Rows n > ${bounds.maxN} and columns k > ${bounds.maxK} remain outside this finite certificate; G09/G10/G13 therefore remain open.`,
  arithmeticAuthority:'EXACT_BIGINT_PLUS_COMPLETE_PRIME_VALUATION_AND_KUMMER_CARRY',
  completePrimeBound:bounds.maxN,
  collisionFibers,
  fourfoldCandidates,
  sharpWitness3003:sharpWitness,
  sourceMutationAuthority:false,
  truthMutationAuthority:false,
  productionAuthority:false,
  canonAdmissionAuthority:'R125',
  boundary:SINGMASTER_EXACT_CLOSURE_BOUNDARY_R296
 };
 return{...core,fingerprint:fingerprint({scope:core.scope,distinctValues:core.distinctValues,collisions:collisionFibers.map(x=>[x.value,x.representations,x.signature,x.pass]),fourfold:fourfoldCandidates.map(x=>x.value),boundedStatementPass})};
}

export function compileSingmasterNoGoAtlasR296(certificate=compileSingmasterExactClosureR296()){
 if(certificate?.schema!==SINGMASTER_EXACT_CLOSURE_SCHEMA_R296)throw new Error('R296 exact closure certificate required');
 const fibers=certificate.collisionFibers.map(f=>({id:`FIBER-${f.value}`,status:f.multiplicity>=4?'COUNTEREXAMPLE_CANDIDATE':'SURVIVES_EQUALITY',value:f.value,multiplicity:f.multiplicity,representations:f.representations,certificate:f.pass?'EXACT_BIGINT_PLUS_COMPLETE_CARRY':'CERTIFICATE_FAILURE'}));
 const boundedNoGo={id:`BOX-N${certificate.scope.maxN}-K${certificate.scope.maxK}`,status:certificate.boundedStatementPass?'PRUNE_EXACT_BOUNDED':'COUNTEREXAMPLE_CANDIDATE',parentFamily:'MIXED-BOUNDARY',terminalForGlobalClaim:false,exhaustiveWithinDeclaredBox:true,scope:certificate.boundedStatement,evidenceFingerprint:certificate.fingerprint};
 return{schema:'OMEGA_SINGMASTER_NO_GO_ATLAS_R296',revision:'R296',domainId:certificate.domainId,claimId:certificate.claimId,globalClaimStatus:'OPEN',boundedNoGo,fibers,boundary:SINGMASTER_EXACT_CLOSURE_BOUNDARY_R296};
}

export function verifyR296Baseline(){
 const certificate=compileSingmasterExactClosureR296(SINGMASTER_EXACT_BASELINE_R296),values=certificate.collisionFibers.map(x=>x.value).sort(compareIntegerStrings),expected=[...SINGMASTER_EXACT_BASELINE_R296.expectedCollisionValues].sort(compareIntegerStrings);
 return{pass:certificate.scope.scannedCells===SINGMASTER_EXACT_BASELINE_R296.expectedScannedCells&&certificate.maxNontrivialMultiplicity===SINGMASTER_EXACT_BASELINE_R296.expectedMaxNontrivialMultiplicity&&certificate.fourfoldCandidateCount===0&&stable(values)===stable(expected)&&certificate.collisionFibers.every(x=>x.pass),certificate,values,expected};
}

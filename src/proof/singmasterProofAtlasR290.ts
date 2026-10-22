import {compileProofCarryR292} from './proofCarryRuntimeR292.js';
import {compileSingmasterExactClosureR296,SINGMASTER_EXACT_CLOSURE_BOUNDARY_R296} from './singmasterExactClosureR296.js';

export type SingmasterGateStatusR290='PASS'|'ESTABLISHED_EXTERNAL'|'OPEN'|'SOURCE_MISSING'|'AUDITED_HOLD';
export type SingmasterRepresentationR290={n:number;k:number};
export type SingmasterFiberR290={id:string;representations:SingmasterRepresentationR290[];className:'sporadic'|'sharp-witness'|'fibonacci-family';expectedDigits?:number;expectedValue?:string};
export type SingmasterFamilyR290={id:string;status:string;scope:string;exhaustive:boolean;terminal?:boolean;parentFamily?:string};

export const SINGMASTER_PUBLIC_STATUS_R290='OPEN' as const;
export const SINGMASTER_ATLAS_VERSION_R290='R290+R296';
export const SINGMASTER_TRUTH_BOUNDARY_R290='OMEGA R290/R296 is a proof-audit and exact-arithmetic research instrument. R296 adds exact finite-box closure, but it does not claim that the global Sharp Singmaster Bound N(a) <= 8 is proved. Promotion is allowed only after every four-nontrivial-column family is exhaustively closed by reproducible certificates.';

export const SINGMASTER_EQUIVALENCES_R290=[
  'For every integer a > 1: N(a) <= 8.',
  'Equivalent left-half form: L(a) <= 4.',
  'Because C(a,1)=a is automatic: M(a) <= 3 for nontrivial left-half representations 2 <= k <= n/2.',
  'Equivalent counterexample exclusion: no four distinct nontrivial columns share one admissible integer fiber.'
] as const;

export const SINGMASTER_SOURCES_R290=[
  {id:'S1',authority:'PEER_REVIEWED',label:'Matomaki–Radziwill–Shao–Tao–Teravainen (2022), QJM',url:'https://doi.org/10.1093/qmath/haac006'},
  {id:'S6',authority:'PUBLISHED',label:'Blokhuis–Brouwer–de Weger (2017), binomial collisions',url:'https://math.deweger.net/papers/%5B57%5DBBdW-BinColl-Int%5B2017%5D.pdf'},
  {id:'S7',authority:'PEER_REVIEWED',label:'de Weger (1997), equal binomial coefficients',url:'https://math.deweger.net/papers/%5B20%5DdW-EqBinom-JNumTh%5B1997%5D.pdf'},
  {id:'S8',authority:'PUBLISHED',label:'Singmaster (1975), repeated binomial coefficients',url:'https://www.fq.math.ca/Scanned/13-4/singmaster.pdf'},
  {id:'S9',authority:'CURATED_DATABASE',label:'OEIS A062527',url:'https://oeis.org/A062527'},
  {id:'S10',authority:'CURATED_STATUS',label:'Erdos Problems #849',url:'https://www.erdosproblems.com/849'},
  {id:'S11',authority:'AUDIT_ONLY',label:'2026 Zenodo formal-resolution claim',url:'https://doi.org/10.5281/zenodo.21660302'},
  {id:'S12',authority:'AUDIT_ONLY',label:'Public Lean source accompanying S11',url:'https://github.com/AEjonanonymous/Singmasters-Conjecture'}
] as const;

export const SINGMASTER_PROOF_GATES_R290:{id:string;label:string;status:SingmasterGateStatusR290;detail:string}[]=[
  {id:'G01',label:'Scope a > 1',status:'PASS',detail:'Excludes the infinite boundary multiplicity of 1.'},
  {id:'G02',label:'Symmetry and left-half reduction',status:'PASS',detail:'C(n,k)=C(n,n-k), with central bookkeeping retained.'},
  {id:'G03',label:'Automatic k=1 reduction',status:'PASS',detail:'C(a,1)=a, so a counterexample needs four additional nontrivial left-half representations.'},
  {id:'G04',label:'Fixed-column uniqueness',status:'PASS',detail:'For fixed k, n -> C(n,k) is strictly increasing on n >= 2k.'},
  {id:'G05',label:'Real/complex terminal inference',status:'PASS',detail:'False closure removed: real common levels exist; integrality is the actual obstruction.'},
  {id:'G06',label:'Prime-valuation / Kummer carry invariant',status:'PASS',detail:'Equal integer coefficients have identical v_p signatures for every prime.'},
  {id:'G07',label:'Interior control',status:'ESTABLISHED_EXTERNAL',detail:'MRSTT controls sufficiently deep interior multiplicity.'},
  {id:'G08',label:'Known fixed-pair collision atlas',status:'ESTABLISHED_EXTERNAL',detail:'2017 classification and bounded verification are inherited, not re-proved.'},
  {id:'G09',label:'Small-k four-column family exhaustion',status:'OPEN',detail:'R296 exactly closes the baseline box 2 <= k <= 30, 2k <= n <= 300; every remaining nontrivial 4-tuple outside that finite box still requires an exhaustive certified family partition.'},
  {id:'G10',label:'Residual arithmetic-geometry closure',status:'OPEN',detail:'Every surviving curve/variety needs a complete admissible integral/rational point certificate.'},
  {id:'G11',label:'Referenced UCD forensic lineage',status:'SOURCE_MISSING',detail:'UCD_DEEP_FORENSIC_PROJECT_AUDIT_PASS1.txt is not available in the current connected corpus.'},
  {id:'G12',label:'2026 external Lean resolution claim',status:'AUDITED_HOLD',detail:'Inspected artifact defines the target proposition but was not admitted as a proof term for the uniform bound.'},
  {id:'G13',label:'Final global M(a) <= 3 gate',status:'OPEN',detail:'This is the theorem-bearing closure and cannot be promoted from bounded search, including a fully exact R296 finite-box certificate.'},
  {id:'G14',label:'Sharpness witness 3003',status:'PASS',detail:'3003 has three nontrivial left-half representations plus the automatic k=1 representation, giving N(3003)=8.'},
  {id:'G15',label:'R296 exact finite-box closure',status:'PASS',detail:'Exact BigInt enumeration of 7,801 cells with 2 <= k <= 30 and 2k <= n <= 300 finds maximum nontrivial multiplicity 3; this closes only that declared finite box.'}
];

export const SINGMASTER_CERTIFICATE_FIELDS_R290=[
  'familyId','parentFamily','columnTuple','domainConstraints','commonFiberEquations','reductionMap','invariantCarry','localTests','separatingPrime','residualObject','pointCertificate','exhaustivenessParent','sourceOrCode','status','promotionHash'
] as const;

export const SINGMASTER_FOUR_TUPLE_REGISTRY_R290:SingmasterFamilyR290[]=[
  {id:'ROOT-ALL',status:'OPEN',scope:'Every possible four-nontrivial-column common fiber.',exhaustive:false,terminal:false},
  {id:'KNOWN-3003',status:'KEEP_BELOW_THRESHOLD',scope:'k={2,5,6}; M(3003)=3, not a counterexample.',exhaustive:true},
  {id:'INTERIOR-4',status:'PRUNE_EXTERNAL',scope:'Four columns entirely inside the stated MRSTT interior hypotheses.',exhaustive:true},
  {id:'MIXED-BOUNDARY',status:'OPEN',scope:'At least one small-k/boundary column; primary unresolved global family.',exhaustive:false},
  {id:'R296-BOX-N300-K30',status:'PRUNE_EXACT_BOUNDED',scope:'Exact finite subregion 2 <= k <= 30 and 2k <= n <= 300; exhaustive within this box only.',exhaustive:true,terminal:false,parentFamily:'MIXED-BOUNDARY'}
];

export const SINGMASTER_KNOWN_FIBERS_R290:SingmasterFiberR290[]=[
  {id:'120',representations:[{n:16,k:2},{n:10,k:3}],className:'sporadic',expectedValue:'120',expectedDigits:3},
  {id:'210',representations:[{n:21,k:2},{n:10,k:4}],className:'sporadic',expectedValue:'210',expectedDigits:3},
  {id:'1540',representations:[{n:56,k:2},{n:22,k:3}],className:'sporadic',expectedValue:'1540',expectedDigits:4},
  {id:'3003',representations:[{n:78,k:2},{n:15,k:5},{n:14,k:6}],className:'sharp-witness',expectedValue:'3003',expectedDigits:4},
  {id:'7140',representations:[{n:120,k:2},{n:36,k:3}],className:'sporadic',expectedValue:'7140',expectedDigits:4},
  {id:'11628',representations:[{n:153,k:2},{n:19,k:5}],className:'sporadic',expectedValue:'11628',expectedDigits:5},
  {id:'24310',representations:[{n:221,k:2},{n:17,k:8}],className:'sporadic',expectedValue:'24310',expectedDigits:5},
  {id:'fib-1',representations:[{n:104,k:39},{n:103,k:40}],className:'fibonacci-family',expectedDigits:29},
  {id:'fib-2',representations:[{n:714,k:272},{n:713,k:273}],className:'fibonacci-family',expectedDigits:205},
  {id:'fib-3',representations:[{n:4895,k:1869},{n:4894,k:1870}],className:'fibonacci-family',expectedDigits:1412}
];

export function binomialBigIntR290(n:number,k:number):bigint{
  if(!Number.isInteger(n)||!Number.isInteger(k)||n<0||k<0||k>n)throw new Error(`invalid binomial C(${n},${k})`);
  const kk=Math.min(k,n-k);let out=1n;
  for(let i=1;i<=kk;i+=1)out=out*BigInt(n-kk+i)/BigInt(i);
  return out;
}

function vpFactorialR290(n:number,p:number){let q=n,total=0;while(q>0){q=Math.floor(q/p);total+=q}return total}
export function vpBinomialR290(n:number,k:number,p:number){if(!Number.isInteger(p)||p<2)throw new Error('prime base must be >= 2');return vpFactorialR290(n,p)-vpFactorialR290(k,p)-vpFactorialR290(n-k,p)}
export function carryCountBasePR290(a:number,b:number,p:number){let x=a,y=b,carry=0,count=0;while(x>0||y>0||carry>0){const sum=x%p+y%p+carry;if(sum>=p){count+=1;carry=1}else carry=0;x=Math.floor(x/p);y=Math.floor(y/p)}return count}

export function compactBigIntR290(value:string){return value.length<=32?value:`${value.slice(0,14)}…${value.slice(-10)} (${value.length} digits)`}

export function verifyFiberR290(fiber:SingmasterFiberR290){
  const values=fiber.representations.map(({n,k})=>binomialBigIntR290(n,k));
  const first=values[0];const equal=values.every(v=>v===first);const value=first.toString();
  const expectedValueOk=fiber.expectedValue==null||value===fiber.expectedValue;
  const expectedDigitsOk=fiber.expectedDigits==null||value.length===fiber.expectedDigits;
  return {...fiber,value,digits:value.length,equal,expectedValueOk,expectedDigitsOk,pass:equal&&expectedValueOk&&expectedDigitsOk};
}

export function verifyKnownFibersR290(){return SINGMASTER_KNOWN_FIBERS_R290.map(verifyFiberR290)}

export const SINGMASTER_KUMMER_PRIMES_R290=[2,3,5,7,11,13,17,19,23,29,31] as const;
export function verify3003CarryR290(){
  const witness=SINGMASTER_KNOWN_FIBERS_R290.find(x=>x.id==='3003');if(!witness)throw new Error('3003 witness missing');
  return witness.representations.flatMap(rep=>SINGMASTER_KUMMER_PRIMES_R290.map(p=>{const valuation=vpBinomialR290(rep.n,rep.k,p),carries=carryCountBasePR290(rep.k,rep.n-rep.k,p);return {...rep,p,valuation,carries,pass:valuation===carries}}));
}

export function singmasterProofStatsR290(){
  const fibers=verifyKnownFibersR290(),carry=verify3003CarryR290(),bounded=compileSingmasterExactClosureR296();
  const gates=SINGMASTER_PROOF_GATES_R290.reduce<Record<string,number>>((acc,g)=>{acc[g.status]=(acc[g.status]||0)+1;return acc},{});
  return {publicStatus:SINGMASTER_PUBLIC_STATUS_R290,fibersPassed:fibers.filter(x=>x.pass).length,fiberCount:fibers.length,carryPassed:carry.filter(x=>x.pass).length,carryCount:carry.length,boundedExact:{revision:'R296',scope:bounded.scope,collisionFiberCount:bounded.collisionFiberCount,maxNontrivialMultiplicity:bounded.maxNontrivialMultiplicity,fourfoldCandidateCount:bounded.fourfoldCandidateCount,boundedStatementPass:bounded.boundedStatementPass,fingerprint:bounded.fingerprint,boundary:SINGMASTER_EXACT_CLOSURE_BOUNDARY_R296},gates};
}

export const SINGMASTER_INVARIANT_TRANSFORMS_R292=[
  {id:'LEFT_HALF_SYMMETRY',preservesInvariant:true,domainMapVerified:true,detail:'C(n,k)=C(n,n-k) preserves integer coefficient equality while choosing a canonical left-half representative.'},
  {id:'AUTOMATIC_K1_REDUCTION',preservesInvariant:true,domainMapVerified:true,detail:'C(a,1)=a removes exactly one automatic left-half representation for a>1.'},
  {id:'FIXED_COLUMN_MONOTONICITY',preservesInvariant:true,domainMapVerified:true,detail:'Strict increase in n at fixed k prevents duplicate n-values within one nontrivial column.'},
  {id:'KUMMER_VALUATION_CARRY',preservesInvariant:true,domainMapVerified:true,detail:'Equal integer binomial coefficients must carry identical prime-adic valuation signatures; Kummer converts each valuation to a base-p carry count.'}
] as const;

export function compileSingmasterProofCarryR292(){
  const fibers=verifyKnownFibersR290(),carry=verify3003CarryR290(),bounded=compileSingmasterExactClosureR296();
  const exactChecks=[...fibers.map(x=>({id:`FIBER-${x.id}`,pass:x.pass,detail:`Exact BigInt fiber ${x.id}`})),{id:'KUMMER-3003',pass:carry.every(x=>x.pass),detail:`${carry.length} exact valuation/carry checks on the sharpness witness`},{id:'R296-BOUNDED-N300-K30',pass:bounded.boundedStatementPass&&bounded.fourfoldCandidateCount===0&&bounded.collisionFibers.every((x:any)=>x.pass),detail:`Exact R296 finite closure: ${bounded.scope.scannedCells} cells, ${bounded.collisionFiberCount} collision fibers, maximum nontrivial multiplicity ${bounded.maxNontrivialMultiplicity}; global exterior remains open.`}];
  return compileProofCarryR292({
    domainId:'NUMBER_THEORY/PASCAL/SINGMASTER',
    claimId:'SHARP_SINGMASTER_N_LE_8',
    claimLabel:'Sharp Singmaster Bound N(a) <= 8',
    claimStatus:SINGMASTER_PUBLIC_STATUS_R290,
    requirements:{exhaustivePartition:true,sourceLineage:true,invariantCarry:true,exactChecks:true},
    gates:SINGMASTER_PROOF_GATES_R290,
    partitions:SINGMASTER_FOUR_TUPLE_REGISTRY_R290.map(x=>({...x,terminal:x.terminal??x.id!=='ROOT-ALL'})),
    transforms:SINGMASTER_INVARIANT_TRANSFORMS_R292,
    sources:SINGMASTER_SOURCES_R290,
    exactChecks
  });
}

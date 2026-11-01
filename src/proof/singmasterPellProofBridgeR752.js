import {compileProofCarryR292} from './proofCarryRuntimeR292.js';
import {compileProofEvolutionR293} from './proofEvolutionRuntimeR293.js';
import {certifyPellMapR752,pellThreadR752,R752_TRUTH} from './singmasterPellThreadR752.js';
/** Research evidence only. Existing R292 and R293 remain authoritative; no R295 domain registration. */
export function compilePellProofContextR752(){
 const polynomial=certifyPellMapR752(),thread=pellThreadR752(8);
 const carry=compileProofCarryR292({
  domainId:'NUMBER_THEORY/PASCAL/PELL_PAIR_THREAD',claimId:'PELL_ADJACENT_PAIR_VERSUS_GLOBAL_FOURFOLD',
  claimLabel:'Known Pell adjacent-pair orbit and unresolved fourth representation',
  claimStatus:'OPEN',
  gates:[
   {id:'R752-POLYNOMIAL-INVARIANT',status:polynomial.isGlobalIdentity?'PASS':'OPEN',detail:'Six-point exact quadratic coefficient certificate Q(T(n,k))=Q(n,k)'},
   {id:'R752-EXACT-ORBIT',status:'PASS',detail:'Exact reversible orbit; first eight admissible pairs are symbolic equalities'},
   {id:'R752-EXTERNAL-PRIOR-ART',status:'ESTABLISHED_EXTERNAL',detail:'Known infinite pair family, Singmaster 1975'},
   {id:'R752-ADDITIONAL-REPS',status:'OPEN',detail:'No global exclusion of further nontrivial representations of Pell values'},
   {id:'G09-G10-G13',status:'OPEN',detail:'Sharp Singmaster global fourfold exclusion remains unresolved'},
  ],
  partitions:[
   {id:'ADJACENT-PAIR-ORBIT',terminal:true,exhaustive:true,scope:'Declared forward affine orbit only'},
   {id:'FURTHER-REPRESENTATIONS',terminal:true,exhaustive:false,scope:'All other admissible binomial columns for all Pell coefficients'},
  ],
  transforms:[{id:'R752-AFFINE-PELLOP',preservesInvariant:polynomial.isGlobalIdentity,domainMapVerified:true,detail:'Global exact Q identity; inverse integer affine map'}],
  exactChecks:[{id:'R752-SIX-POINT-INTERPOLATION',pass:polynomial.isGlobalIdentity},{id:'R752-ORBIT',pass:thread.states.length===9}],
  sources:[{id:'SINGMASTER-1975',status:'ESTABLISHED_EXTERNAL',detail:'Fibonacci Quarterly 13 (1975), pp 295-298'},
           {id:'V14-LOCAL-CSV-INGESTION',status:'SOURCE_MISSING',detail:'V14 20376 chart has not been source-digest ingested into production'}],
  requirements:{exhaustivePartition:true,sourceLineage:true,invariantCarry:true,exactChecks:true}
 });
 const evolution=compileProofEvolutionR293({...carry,bound:true,supportScore:carry.metrics.supportScore,scarPressure:carry.metrics.scarPressure});
 return{carry,evolution,mathematicalPriorArt:R752_TRUTH.priorArt,sourceAdmission:false,autopingActivated:false,canonMutation:false,productionAuthority:false};
}

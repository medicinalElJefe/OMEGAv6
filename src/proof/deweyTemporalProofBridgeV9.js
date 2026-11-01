import {compileProofCarryR292} from './proofCarryRuntimeR292.js';
import {compileProofEvolutionR293} from './proofEvolutionRuntimeR293.js';
import {V9_MODELS,compositionDefect,rotatedReturnDefect,equivarianceCertificate,filterFiniteCandidates} from './deweyTemporalRotationV9.js';
import {ND_EXAMPLES,exactCommutatorND,observationRankND} from './deweyTemporalNDV9.js';

export const DEWEY_V9_PROOF_DOMAIN='DYNAMICAL_SYSTEMS/DISCRETE_ROTATION/CONTINUITY';
export const DEWEY_V9_PROOF_CLAIM='UNIVERSAL_TIME_ROTATION_CONTINUITY';

export function compileTemporalProofCarryV9(){
 const states=[];for(let x=-2;x<=2;x++)for(let y=-2;y<=2;y++)states.push([x,y]);
 const first=filterFiniteCandidates(states,[{kind:'x',quarterTurns:0,value:1}]);
 const both=filterFiniteCandidates(states,[{kind:'x',quarterTurns:0,value:1},{kind:'x',quarterTurns:1,value:-2}]);
 const repeat=filterFiniteCandidates(states,[{kind:'x',quarterTurns:0,value:1},{kind:'x',quarterTurns:0,value:1}]);
 const norm=filterFiniteCandidates(states,[{kind:'norm2',quarterTurns:0,value:5},{kind:'norm2',quarterTurns:1,value:5}]);
 const tests=[
  {id:'C4-ROTATION',pass:equivarianceCertificate(V9_MODELS.relative).allIntegerStatesAndAllQuarterTurns},
  {id:'ANISOTROPIC-COUNTEREXAMPLE',pass:compositionDefect(V9_MODELS.anisotropic,[1,2],1,1).squaredDefect==='5'},
  {id:'RELATIVE-NOT-ORDINARY-RETURN',pass:rotatedReturnDefect(V9_MODELS.relative,[1,2],1,1).squaredDefect==='0'&&rotatedReturnDefect(V9_MODELS.relative,[1,2],1,0).squaredDefect==='10'},
  {id:'OBSERVATION-REFINEMENT',pass:first.remainingCount===5&&both.remainingCount===1&&repeat.remainingCount===5&&norm.remainingCount===8},
  {id:'ND-RANK-OBSERVABILITY',pass:exactCommutatorND(ND_EXAMPLES.commuting3,ND_EXAMPLES.r3).universalCommutation&&observationRankND(ND_EXAMPLES.commuting3,ND_EXAMPLES.r3,[{projection:[[1,0,0]],timeSteps:0,rotationSteps:0},{projection:[[1,0,0]],timeSteps:0,rotationSteps:1}]).rank===2},
 ];
 return compileProofCarryR292({
  domainId:DEWEY_V9_PROOF_DOMAIN,claimId:DEWEY_V9_PROOF_CLAIM,
  claimLabel:'Dewey time-rotation continuity, exact model and unresolved global scope',
  claimStatus:'OPEN',
  gates:[
   {id:'V9-C4-ALGEBRA',status:'PASS',detail:'Exact matrix identities for six declared 2D integer-linear maps'},
   {id:'V9-OBSERVABILITY',status:'PASS',detail:'Finite 25-state set intersection, redundancy and alias examples'},
   {id:'V9-ND-RANK',status:'PASS',detail:'Exact 3D/4D integer-linear observability rank and unobservability counterexamples'},
   {id:'V9-GENERAL-NONLINEAR',status:'OPEN',detail:'Nonlinear, arbitrary dimensional, and continuous-time generalization absent'},
   {id:'V9-EMPIRICAL-PHYSICS',status:'OPEN',detail:'No empirical claim about all physical dimensions or mechanisms is certified'},
   {id:'G09-G10-G13',status:'OPEN',detail:'Singmaster uniform fourfold exclusion remains unproved and independent'},
  ],
  partitions:[
   {id:'V9-EXACT-C4-SUITE',terminal:true,exhaustive:true,scope:'Six finite specified 2x2 integer-linear models only'},
   {id:'V9-UNIVERSAL-EXTERIOR',terminal:true,exhaustive:false,scope:'All unspecified dynamical systems and empirical laws'},
  ],
  transforms:[{id:'C4-MATRIX-EQUIVALENCE',preservesInvariant:true,domainMapVerified:true,detail:'Exact TR=RT algebra and nonnegative powers'}],
  exactChecks:tests,
  sources:[{id:'V9-EXECUTABLE-KERNEL',status:'PASS',detail:'src/proof/deweyTemporalRotationV9.js'},
   {id:'V8-ATLAS-INGESTION',status:'SOURCE_MISSING',detail:'Local V8 CSV requires separate immutable source ingestion and digest verification'}],
  requirements:{exhaustivePartition:true,sourceLineage:true,invariantCarry:true,exactChecks:true}
 });
}

export function compileTemporalResearchPlanV9(){
 const packet=compileTemporalProofCarryV9();
 const evidenceContext={...packet,bound:true,supportScore:packet.metrics.supportScore,scarPressure:packet.metrics.scarPressure};
 const evolution=compileProofEvolutionR293(evidenceContext);
 return {proofCarry:packet,proofEvolution:evolution,sourceMutation:false,canonicalMutation:false,productionAuthority:false,autopingActivated:false,
  boundary:'R292/R293 derived research only: no proof promotion, no global dynamics truth, no production or CanonState authority.'};
}

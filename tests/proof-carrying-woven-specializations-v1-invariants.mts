import assert from'node:assert/strict';
import{compileCanonicalTypedFieldR349}from'../src/system/wovenHardwareFieldR349';
import{executeProofCarryingWovenStepV1}from'../src/system/proofCarryingWovenDynamics';
import{
 PCWD_ATLAS_LEVELS,RSC_LOOP_V1,QUBIT,
 applyUnitaryQubitLemmaV1,certifyLemmaMorphismV1,compileRscLoopReceiptV1,
 composeLemmaMorphismsV1,identityLemmaMorphismV1,
 sparseAtlasAddressV1,sparseAtlasChildrenV1,sparseAtlasParentV1,
 type LemmaMorphismV1,type Matrix2V1,
}from'../src/system/proofCarryingWovenSpecializations';

assert.deepEqual(PCWD_ATLAS_LEVELS,[12,144,1728,20736,248832]);
const a4=sparseAtlasAddressV1(4242,4);
assert.equal(a4.resolution,20736);
assert.equal(a4.digits.reduce((s,d,i)=>s+d*12**i,0),4242);
assert.equal(a4.physicalDimensionsClaimed,false);
const parent=sparseAtlasParentV1(a4)!;
assert.equal(parent.level,3);
assert.equal(parent.index,Math.floor(4242/12));
const children=sparseAtlasChildrenV1(parent);
assert.equal(children.length,12);
assert.ok(children.some(x=>x.index===4242));
assert.equal(sparseAtlasChildrenV1(sparseAtlasAddressV1(0,5)).length,0);

const AtoB:LemmaMorphismV1={id:'AtoB',domain:'A',codomain:'B',forward:x=>x.map(v=>v+1),recover:y=>y.map(v=>v-1),invariants:[x=>x.reduce((s,v)=>s+v,0)]};
const BtoC:LemmaMorphismV1={id:'BtoC',domain:'B',codomain:'C',forward:x=>x.map(v=>v*2),recover:y=>y.map(v=>v/2)};
const CtoD:LemmaMorphismV1={id:'CtoD',domain:'C',codomain:'D',forward:x=>[...x].reverse(),recover:y=>[...y].reverse()};
const input=[1,2,3,4];
const left=composeLemmaMorphismsV1(composeLemmaMorphismsV1(AtoB,BtoC),CtoD);
const right=composeLemmaMorphismsV1(AtoB,composeLemmaMorphismsV1(BtoC,CtoD));
assert.deepEqual(left.forward(input),right.forward(input));
assert.deepEqual(left.recover!(left.forward(input)),input);
assert.deepEqual(right.recover!(right.forward(input)),input);
assert.equal(certifyLemmaMorphismV1(left,input).promotionEligible,true);
const id=identityLemmaMorphismV1('A');
assert.deepEqual(composeLemmaMorphismsV1(id,AtoB).forward(input),AtoB.forward(input));

const sampler=(a:number)=>({continuity:.8,plasticity:.7,burden:.05,contradiction:.02,scar:(a%5)/100,evidence:.9,invariantCarry:.4+(a%7)/50,motionRate:.1,support:.9,orientation:1 as const});
const field=compileCanonicalTypedFieldR349(0,sampler);
const step=await executeProofCarryingWovenStepV1(field,{tick:2,address:144,orientation:1,transportRate:.125,evidence:{admissible:true,sources:['DECLARED_TEST_SOURCE'],support:.9,authority:'TEST',observedClaim:false}});
const rsc=compileRscLoopReceiptV1(step.packet);
assert.deepEqual(rsc.phases.map(x=>x.phase),RSC_LOOP_V1);
assert.equal(rsc.closedLoop,true);
assert.equal(rsc.decision,'STAY');
assert.equal(rsc.canonicalMutation,false);
assert.ok(rsc.phases.every(x=>x.proofDigest===step.packet.Pi_t.proofDigest));

const s=1/Math.sqrt(2),z=QUBIT.c(0),one=QUBIT.c(1);
const rho:Matrix2V1=[one,z,z,z];
const H:Matrix2V1=[QUBIT.c(s),QUBIT.c(s),QUBIT.c(s),QUBIT.c(-s)];
const Z:Matrix2V1=[one,z,z,QUBIT.c(-1)];
const q=await applyUnitaryQubitLemmaV1(rho,H,[Z],1e-9);
assert.equal(q.gates.inputDensityValid,true);
assert.equal(q.gates.unitaryValid,true);
assert.equal(q.gates.recoveredDensityValid,true);
assert.equal(q.gates.recoveryBounded,true);
assert.equal(q.gates.observablesBounded,true);
assert.equal(q.promotionEligible,true);
assert.ok(q.fidelity>1-1e-12);
assert.ok(q.recoveryError<1e-12);
assert.ok(q.observableError<1e-12);
assert.match(q.proofDigest,/^[0-9a-f]{64}$/);
assert.equal(q.physicalLawClaimed,false);
assert.match(q.boundary,/does not replace quantum mechanics/);

const badU:Matrix2V1=[one,z,z,one];
badU[0]=QUBIT.c(2);
const bad=await applyUnitaryQubitLemmaV1(rho,badU,[Z],1e-9);
assert.equal(bad.gates.unitaryValid,false);
assert.equal(bad.promotionEligible,false);

console.log('PCWD SPECIALIZATIONS v1 PASS · sparse 12^n atlas addressing · composable/recoverable lemma morphisms · eight-phase RSC receipt · finite qubit unitary density-channel specialization with recovery/fidelity/observable proof · no new physical or Canon authority');

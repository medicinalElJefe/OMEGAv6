import assert from'node:assert/strict';
import{compileCanonicalTypedFieldR349}from'../src/system/wovenHardwareFieldR349';
import{executeProofCarryingWovenStepV1}from'../src/system/proofCarryingWovenDynamics';
import{QUBIT,type Matrix2V1}from'../src/system/proofCarryingWovenSpecializations';
import{
 UNIFIED_PCWD_GATES,UNIFIED_PCWD_STAGES,executeUnifiedProofChainV1,executeUnifiedProofTransportV1,verifyUnifiedProofTransportV1,
 type UnifiedDomainContractV1,
}from'../src/system/unifiedProofTransportKernel';
import{runQubitThroughUnifiedKernelV1,runR349PacketThroughUnifiedKernelV1}from'../src/system/unifiedProofTransportAdapters';

type ToyInput={address:number;x:number[];evidence:boolean};
const toy:UnifiedDomainContractV1<ToyInput,number[],number[],{projected:number[];residual:number[]},{reduced:number[]},{state:number[]},{state:number[]}>={
 id:'PCWD_TOY_DOMAIN',
 version:'1',
 address:i=>({level:1,address:i.address}),
 sense:i=>[...i.x],
 normalize:x=>[...x],
 decompose:x=>({projected:[...x],residual:x.map(()=>0)}),
 lemma:d=>({reduced:[...d.projected]}),
 transport:l=>({state:[...l.reduced]}),
 recover:t=>({state:[...t.state]}),
 measures:({input,sensed,recovered})=>{
  const err=Math.max(...sensed.map((v,i)=>Math.abs(v-recovered.state[i])));
  return{
   continuity:1,futurePlasticity:1,contradiction:0,burden:.1,
   errors:{recovery:err,dynamics:0,observables:0,path:err,invariants:0},
   tolerances:{recovery:1e-12,dynamics:0,observables:0,path:1e-12,invariants:0,continuity:.5},
   scarRetained:true,evidenceAdmissible:input.evidence,pathRecoverable:true,
  };
 },
 packet:ctx=>({
  A_t:ctx.input.address,x_t:ctx.sensed,P_G_x_t:ctx.decomposed.projected,r_t:ctx.decomposed.residual,
  C_omega:1,Phi:1,q:0,Lambda:.1,Sigma_t:{residual:ctx.decomposed.residual},Gamma_t:{kind:'IDENTITY'},
  L_t:ctx.lemma,E_t:{admissible:ctx.input.evidence},Pi_t:ctx.proof,
 }),
 boundary:'Synthetic deterministic software-domain fixture only.',
};

assert.deepEqual(UNIFIED_PCWD_STAGES,['Sense','Normalize','Decompose','Lemma','Transport','Recover','Prove']);
assert.deepEqual(UNIFIED_PCWD_GATES,['continuityValid','invariantsPreserved','scarRetained','recoveryBounded','dynamicsBounded','observablesBounded','evidenceAdmissible','pathRecoverable']);

const toyPass=await executeUnifiedProofTransportV1(toy,{address:12,x:[1,2,3],evidence:true});
assert.equal(toyPass.promotionEligible,true);
assert.equal(toyPass.decision,'STAY');
assert.equal(toyPass.stages.length,7);
assert.equal(await verifyUnifiedProofTransportV1(toyPass),true);
assert.match(toyPass.proof.proofDigest,/^[0-9a-f]{64}$/);
assert.match(toyPass.proof.stageChainDigest,/^[0-9a-f]{64}$/);
assert.match(toyPass.seal.packetDigest,/^[0-9a-f]{64}$/);
assert.match(toyPass.seal.envelopeDigest,/^[0-9a-f]{64}$/);

const toyHold=await executeUnifiedProofTransportV1(toy,{address:13,x:[1,2,3],evidence:false});
assert.equal(toyHold.promotionEligible,false);
assert.equal(toyHold.proof.gates.evidenceAdmissible,false);
assert.equal(toyHold.decision,'ESCALATE');
assert.equal(await verifyUnifiedProofTransportV1(toyHold),true);

const chain=await executeUnifiedProofChainV1(toy,[
 {address:1,x:[1,1],evidence:true},
 {address:2,x:[2,2],evidence:true},
 {address:3,x:[3,3],evidence:true},
]);
assert.equal(chain.results.length,3);
assert.equal(chain.linkIntegrity,true);
assert.equal(chain.proofIntegrity,true);
assert.equal(chain.results[1].proof.previousProofDigest,chain.results[0].proof.proofDigest);
assert.equal(chain.chainDigest,chain.results[2].proof.proofDigest);

const sampler=(a:number)=>({
 continuity:.9,plasticity:.8,burden:.03,contradiction:.01,scar:(a%3)/100,evidence:.95,invariantCarry:.5,
 motionRate:.1,support:.95,orientation:(a%2?1:-1) as -1|1,
});
const field=compileCanonicalTypedFieldR349(0,sampler);
const r349=await executeProofCarryingWovenStepV1(field,{
 tick:4,address:4242,orientation:1,transportRate:.125,
 evidence:{admissible:true,sources:['UNIFIED_ADAPTER_TEST'],support:1,authority:'TEST',observedClaim:false},
});
assert.equal(r349.packet.Pi_t.promotionEligible,true);
const unifiedR349=await runR349PacketThroughUnifiedKernelV1(r349.packet);
assert.equal(unifiedR349.promotionEligible,true);
assert.equal(unifiedR349.decision,'STAY');
assert.equal(await verifyUnifiedProofTransportV1(unifiedR349),true);
assert.equal((unifiedR349.packet as any).sourceProofDigest,r349.packet.Pi_t.proofDigest);

const s=1/Math.sqrt(2),z=QUBIT.c(0),one=QUBIT.c(1);
const rho:Matrix2V1=[one,z,z,z];
const H:Matrix2V1=[QUBIT.c(s),QUBIT.c(s),QUBIT.c(s),QUBIT.c(-s)];
const Z:Matrix2V1=[one,z,z,QUBIT.c(-1)];
const unifiedQubit=await runQubitThroughUnifiedKernelV1({rho,unitary:H,observables:[Z],evidenceAdmissible:true,address:'Q:TEST'});
assert.equal(unifiedQubit.promotionEligible,true);
assert.equal(unifiedQubit.decision,'STAY');
assert.equal(await verifyUnifiedProofTransportV1(unifiedQubit),true);
assert.ok((unifiedQubit.packet as any).fidelity>1-1e-12);

const badU:Matrix2V1=[QUBIT.c(2),z,z,one];
const unifiedQubitHeld=await runQubitThroughUnifiedKernelV1({rho,unitary:badU,observables:[Z],evidenceAdmissible:true,address:'Q:BAD'});
assert.equal(unifiedQubitHeld.promotionEligible,false);
assert.equal(unifiedQubitHeld.proof.gates.invariantsPreserved,false);
assert.equal(unifiedQubitHeld.decision,'ESCALATE');
assert.equal(await verifyUnifiedProofTransportV1(unifiedQubitHeld),true);

const tampered=structuredClone(toyPass);
tampered.proof.decision='TURN';
assert.equal(await verifyUnifiedProofTransportV1(tampered),false);
const packetTampered=structuredClone(toyPass);
(packetTampered.packet as any).q=99;
assert.equal(await verifyUnifiedProofTransportV1(packetTampered),false);

console.log('UNIFIED PCWD KERNEL PASS · one seven-stage/eight-gate proof contract across generic state, R349 woven field and standard-QM unitary specialization · SHA-256 stage/proof/packet envelope chaining · proof + packet tamper rejection · fail-closed evidence/invariant gates · no authority inflation');

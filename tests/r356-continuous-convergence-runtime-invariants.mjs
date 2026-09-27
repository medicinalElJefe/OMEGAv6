import assert from 'node:assert/strict';
import {R356_ATLAS_LEVELS,R356_STAGES,R356_LAWS,PCWD_PROMOTION_GATES,compileRelativeStateR356,mandalaGateR356,scarR356,admissionR356,atlas360AdviceR356,proofDynamicsR356,convergeR356} from '../src/system/continuousConvergenceRuntimeR356.js';
import {compileForecastBranchesPCWD,decomposeSymmetryPCWD,quantumPureStateAdapterPCWD} from '../src/system/proofCarryingWovenDynamics.js';
const sha='6a1cebcb09f4432ae711ff28b0af4cbc304a3912', cand='d82ea398f536395d454b1512780ee9841548ae7b';
assert.deepEqual(R356_ATLAS_LEVELS,[12,144,1728,20736,248832]);
assert.equal(R356_STAGES[0],'OBSERVE'); assert.equal(R356_STAGES.at(-1),'OBSERVE');
assert(R356_LAWS.includes('AUTONOMOUS_GENERATION_IS_NOT_AUTONOMOUS_AUTHORITY'));
assert(R356_LAWS.includes('PROOF_CARRYING_WOVEN_DYNAMICS_EIGHT_GATE_PROMOTION'));
assert.deepEqual(PCWD_PROMOTION_GATES,['continuityValid','invariantsPreserved','scarRetained','recoveryBounded','dynamicsBounded','observablesBounded','evidenceAdmissible','pathRecoverable']);
const obs=['GITHUB','CLOUD','SOVEREIGN','OBSERVATION'].map(frame=>({frame,canonicalHash:'canon-A',artifactHash:'artifact-A',state:'LIVE',health:'HEALTHY'}));
const rel=compileRelativeStateR356(obs); assert.equal(rel.converged,true);
assert.equal(compileRelativeStateR356(obs.map((x,i)=>i===1?{...x,artifactHash:'artifact-B'}:x)).converged,false);
assert.equal(mandalaGateR356({shell:'ATTESTED',evidence:{deploymentAttested:true,observationAttested:true,returnProof:true}}).allow,true);
assert.equal(mandalaGateR356({shell:'CANONICAL',evidence:{admissionAuthorized:true,rollbackParentRetained:false}}).allow,false);
const scar=scarR356({parent:sha,candidate:cand,intent:'repair',failurePoint:'browser',contradiction:'control dead'}); assert.match(scar.fingerprint,/^r356-/);
const evidence={admissionAuthorized:true,rollbackParentRetained:true,returnProof:true,directProductionMutation:false};
assert.equal(admissionR356({parentSha:sha,candidateSha:cand,relativeState:rel,evidence,scarLedger:[scar]}).allow,true);
assert.equal(admissionR356({parentSha:sha,candidateSha:cand,relativeState:{...rel,converged:false},evidence}).allow,false);
const out=convergeR356({observations:obs,candidate:{parentSha:sha,candidateSha:cand,evidence,metrics:{continuity:1,futurePlasticity:1,contradiction:0,burden:.1}},scarLedger:[scar]});
assert.equal(out.next,'ADMIT'); assert.equal(out.continuous,true); assert.equal(out.productionWriter,'.github/workflows/ci.yml');
assert.equal(out.atlas360.executionPlan.fullTensorMaterialized,false);assert.equal(out.atlas360.triangle.gateState,'HOLD');assert.equal(out.atlas360.canonicalMutation,false);
const a360=atlas360AdviceR356({leafIndex:20735,theta:359,execution:{activeAddresses:[20735]}});assert.equal(a360.selection.hierarchy.address,'11.11.11.11');assert.equal(a360.selection.bearing.antipode,179);assert.equal(a360.advisoryOnly,true);

const symmetry=decomposeSymmetryPCWD([1,3],[{id:'identity'},{id:'mirror',permutation:[1,0]}]);
assert.deepEqual(symmetry.projected,[2,2]);assert(Math.abs(symmetry.residualNorm-Math.SQRT2)<1e-12);assert.equal(symmetry.exactProjection,true);

const pcwdInput={
 address:{level:20736,index:42},
 state:[1,1,2,2],
 normalization:{mode:'IDENTITY'},
 symmetryTransforms:[{id:'identity'}],
 lemma:{id:'pair-mean',kind:'BLOCK_MEAN',blockSize:2},
 path:{id:'forward-frame',steps:[{kind:'SHIFT',offset:1}]},
 referencePath:{id:'reference-frame',steps:[]},
 invariants:[
  {id:'mass',kind:'SUM',tolerance:1e-9},
  {id:'quadratic',kind:'NORM_SQ',tolerance:1e-9}
 ],
 observables:[
  {id:'mass',kind:'SUM',tolerance:1e-9},
  {id:'quadratic',kind:'NORM_SQ',tolerance:1e-9}
 ],
 dynamics:{expectedFullState:[2,2,1,1]},
 evidence:[{id:'synthetic-test-fixture',kind:'TEST',source:'r356 invariant test',hash:'fixture-1',admissible:true}],
 continuity:.95,futurePlasticity:.8,contradiction:0,burden:.1,
 tolerances:{continuity:.5,recovery:1e-9,dynamics:1e-9,observables:1e-9,path:1e-9}
};
const pcwd=proofDynamicsR356(pcwdInput);
assert.equal(pcwd.promotion.allow,true);assert.equal(pcwd.promotion.motion,'STAY');assert.equal(pcwd.packet.Pi_t.gates.pathRecoverable,true);
assert.equal(pcwd.packet.L_t.compressionRatio,.5);assert(pcwd.packet.Sigma_t.norm>0);assert.equal(pcwd.proof.canonicalMutation,false);
const withPcwd=convergeR356({observations:obs,candidate:{parentSha:sha,candidateSha:cand,evidence,metrics:{continuity:1,futurePlasticity:1,contradiction:0,burden:.1},proofDynamics:pcwdInput},scarLedger:[scar]});
assert.equal(withPcwd.admissionReceipt.proofDynamicsBound,true);assert.equal(withPcwd.admissionReceipt.allow,true);assert.equal(withPcwd.next,'ADMIT');
const failedPcwd=convergeR356({observations:obs,candidate:{parentSha:sha,candidateSha:cand,evidence,metrics:{continuity:1,futurePlasticity:1,contradiction:0,burden:.1},proofDynamics:{...pcwdInput,evidence:[{id:'bad',admissible:false}]}},scarLedger:[scar]});
assert.equal(failedPcwd.admissionReceipt.allow,false);assert(failedPcwd.admissionReceipt.reasons.includes('PROOF_CARRYING_WOVEN_DYNAMICS_GATE_FAILED'));assert.equal(failedPcwd.motion.motion,'ESCALATE');

const forecast=compileForecastBranchesPCWD({parentPacket:pcwd.packet,branches:[
 {id:'stay',probability:.6,...pcwdInput,path:{id:'stay-path',steps:[]},dynamics:{expectedFullState:[1,1,2,2]}},
 {id:'turn',probability:.4,...pcwdInput,path:{id:'turn-path',steps:[{kind:'SHIFT',offset:1}]}}
]});
assert.equal(forecast.retainedBranchCount,2);assert.equal(forecast.prunedBranchCount,0);assert(Math.abs(forecast.probabilityMass-1)<1e-12);
const q=quantumPureStateAdapterPCWD([[Math.SQRT1_2,0],[0,Math.SQRT1_2]]);
assert(Math.abs(q.normSquared-1)<1e-12);assert.equal(q.invariants[0].kind,'NORM_SQ');
console.log('R356 continuous convergence runtime invariants PASS');

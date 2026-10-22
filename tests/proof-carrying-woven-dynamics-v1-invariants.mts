import assert from'node:assert/strict';
import{compileCanonicalTypedFieldR349,R349_RESOLUTION}from'../src/system/wovenHardwareFieldR349';
import{
  PCWD_BOUNDARY,PCWD_PACKET_SCHEMA,PCWD_SCHEMA,PCWD_STAGES,
  atlasAddressV1,compileForecastBranchesV1,compileTemporalChainV1,
  computeHolonomyLoopV1,executeProofCarryingWovenStepV1,verifyProofReceiptV1,
}from'../src/system/proofCarryingWovenDynamics';

const sampler=(a:number)=>({
  continuity:.55+(a%13)/40,
  plasticity:.35+(a%7)/20,
  burden:.05+(a%5)/50,
  contradiction:.03+(a%3)/60,
  scar:(a%11)/100,
  evidence:.9,
  invariantCarry:.2+(a%17)/40,
  motionRate:(a%9)/20,
  support:.85,
  orientation:(a%2?1:-1) as -1|1,
});
const source=compileCanonicalTypedFieldR349(0,sampler);
const evidence={admissible:true,sources:['TEST_DECLARED_SOURCE_A','TEST_DECLARED_SOURCE_B'],support:.95,authority:'TEST_DECLARED_EVIDENCE',observedClaim:false};

assert.equal(PCWD_SCHEMA,'OMEGA_PROOF_CARRYING_WOVEN_DYNAMICS_v1');
assert.deepEqual(PCWD_STAGES,['Sense','Normalize','Decompose','Lemma','Transport','Recover','Prove']);
assert.match(PCWD_BOUNDARY,/no new physical primitive/i);
assert.match(PCWD_BOUNDARY,/R125 CanonState admission/);

const address=4242;
const A=atlasAddressV1(address);
assert.equal(A.resolution,20736);
assert.equal(A.level,4);
assert.equal(A.physicalDimensionsClaimed,false);
assert.equal(A.digits[0]+12*A.digits[1]+144*A.digits[2]+1728*A.digits[3],address);

const step=await executeProofCarryingWovenStepV1(source,{tick:7,address,orientation:1,transportRate:.125,evidence});
const p=step.packet;
assert.equal(p.schema,PCWD_PACKET_SCHEMA);
assert.equal(p.t,7);
assert.equal(p.A_t.address,address);
assert.equal(p.A_t.resolution,R349_RESOLUTION);
assert.equal(p.L_t.group,'Z2_ATLAS_COMPLEMENT_WITH_ORIENTATION_INVERSION');
assert.equal(p.L_t.partnerAddress,R349_RESOLUTION-1-address);
assert.equal(p.L_t.recoveryRule,'x = P_G(x) + r');
assert.equal(p.L_t.exactResidualCarry,true);

for(const k of['continuity','plasticity','burden','contradiction','scar','evidence','invariant','motion','support']as const){
  assert.ok(Math.abs(p.x_t[k]-(p.P_G_x_t[k]+p.r_t[k]))<=1e-9,`decomposition failed for ${k}`);
}
assert.equal(Math.sign(p.x_t.orientation),Math.sign(p.P_G_x_t.orientation+p.r_t.orientation));

assert.equal(p.Gamma_t.sourceRetained,true);
assert.equal(p.Gamma_t.recoverableViaLedger,true);
assert.equal(p.Sigma_t.ledger.length,2);
assert.ok(Number.isFinite(p.Sigma_t.holonomyResidual));
assert.ok(p.Sigma_t.holonomyResidual>=0);
assert.equal(p.Pi_t.gates.continuityValid,true);
assert.equal(p.Pi_t.gates.invariantsPreserved,true);
assert.equal(p.Pi_t.gates.scarRetained,true);
assert.equal(p.Pi_t.gates.recoveryBounded,true);
assert.equal(p.Pi_t.gates.dynamicsBounded,true);
assert.equal(p.Pi_t.gates.observablesBounded,true);
assert.equal(p.Pi_t.gates.evidenceAdmissible,true);
assert.equal(p.Pi_t.gates.pathRecoverable,true);
assert.equal(p.Pi_t.promotionEligible,true);
assert.equal(p.Pi_t.decision,'STAY');
assert.equal(p.Pi_t.canonicalMutation,false);
assert.equal(p.Pi_t.observedHistoryClaimed,false);
assert.equal(p.Pi_t.physicalPrimitiveAdded,false);
assert.match(p.Pi_t.proofDigest,/^[0-9a-f]{64}$/);
assert.equal(await verifyProofReceiptV1(p),true);
assert.deepEqual(p.stages.map(x=>x.stage),PCWD_STAGES);
assert.ok(p.stages.every(x=>x.status==='PASS'));

const held=await executeProofCarryingWovenStepV1(source,{tick:7,address,orientation:1,transportRate:.125,evidence:{admissible:false,sources:[],support:0,authority:'UNBOUND',observedClaim:false}});
assert.equal(held.packet.Pi_t.gates.evidenceAdmissible,false);
assert.equal(held.packet.Pi_t.promotionEligible,false);
assert.equal(held.packet.Pi_t.decision,'ESCALATE');
assert.equal(held.packet.stages.at(-1)?.status,'HOLD');

const holo=computeHolonomyLoopV1(source,.125);
assert.equal(holo.inverseClaimed,false);
assert.equal(holo.sourceRetained,true);
assert.match(holo.interpretation,/not physical curvature/);
assert.ok(holo.invariantMaxResidual>=0);

const chain=await compileTemporalChainV1(source,{steps:3,address,orientations:[1,-1,0],transportRate:.125,evidence});
assert.equal(chain.packets.length,3);
assert.equal(chain.linkIntegrity,true);
assert.equal(chain.allProofDigestsValid,true);
assert.equal(chain.packets[0].Pi_t.previousProofDigest,'PCWD-GENESIS');
assert.equal(chain.packets[1].Pi_t.previousProofDigest,chain.packets[0].Pi_t.proofDigest);
assert.equal(chain.packets[2].Pi_t.previousProofDigest,chain.packets[1].Pi_t.proofDigest);
assert.equal(chain.chainDigest,chain.packets[2].Pi_t.proofDigest);

const forecast=await compileForecastBranchesV1(source,{tick:9,address,transportRate:.125,evidence,weights:{NEGATIVE:2,HOLD:1,POSITIVE:3}});
assert.equal(forecast.branches.length,3);
assert.deepEqual(forecast.branches.map(b=>b.orientation),[-1,0,1]);
assert.ok(Math.abs(forecast.weightsSum-1)<=1e-12);
assert.equal(forecast.allBranchesRetained,true);
assert.equal(forecast.observationClaimed,false);
assert.ok(forecast.branches.every(b=>b.packet.Pi_t.promotionEligible));

console.log('PCWD v1 PASS · K_t packet · Sense→Normalize→Decompose→Lemma→Transport→Recover→Prove · exact quotient+residual recovery · bounded recovery/dynamics/observable errors · invariant/scar/path gates · hash-linked temporal chain · retained forecast branches · software holonomy residual · R125/R141/R146/R147 authority preserved · no new physical primitive');

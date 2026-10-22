import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 R265_SCHEMA,R265_REVISION,R265_OPERATOR,R265_CYCLE,R265_ADDRESS_LEVELS,R265_SKIN_CONTRACTS,R265_AUTHORITY,R265_INVARIANTS,
 compileWovenDimensionalRelativityR265,compileSkinCycleR265,compareR265Structures
} from '../src/system/wovenDimensionalRelativityR265.js';
import {compileOperationalConvergenceR249} from '../src/system/operationalConvergenceR249.js';

const policy=JSON.parse(fs.readFileSync('public/omega-r265-woven-dimensional-relativity-runtime.json','utf8'));
const docs=fs.readFileSync('docs/R265_WOVEN_DIMENSIONAL_RELATIVITY_RUNTIME.md','utf8');
const world=fs.readFileSync('src/worldModelRuntime.ts','utf8');
const weave=fs.readFileSync('src/weaveStateR100.ts','utf8');
const selection=fs.readFileSync('scripts/lib/r245-governed-selfbuild-selection.mjs','utf8');
const engine=fs.readFileSync('scripts/r170-selfbuild-engine.mjs','utf8');
const r240Test=fs.readFileSync('tests/r240-recursive-exact-self-promotion-invariants.mjs','utf8');

assert.equal(R265_SCHEMA,'OMEGA_WOVEN_DIMENSIONAL_RELATIVITY_R265');
assert.equal(R265_REVISION,'R265');
assert.equal(policy.schema,R265_SCHEMA);
assert.equal(policy.revision,R265_REVISION);
assert.equal(policy.state,'SOURCE_CANDIDATE_NOT_PRODUCTION_PROOF');
assert.equal(policy.operator,R265_OPERATOR);
assert.deepEqual(policy.cycle,R265_CYCLE);
assert.deepEqual(R265_ADDRESS_LEVELS,[12,144,1728,20736,248832]);
assert.equal(policy.physicalDimensionsClaimed,false);
assert.equal(policy.healthyPromotion.newCapabilityBlockedMerelyForBeingNew,false);
assert.equal(policy.healthyPromotion.newSkinBlockedMerelyForBeingNew,false);
assert.equal(policy.healthyPromotion.forwardCompatibleWhenInvariantContractPreserved,true);
assert.equal(policy.healthyPromotion.explicitVersionMigrationAllowed,true);
assert.equal(policy.healthyPromotion.versionMigrationMustBeReproved,true);
assert.equal(policy.healthyPromotion.r265AddsPromotionAuthority,false);
assert.equal(policy.authority.sourceMutationAndPromotion,'R240_SINGLE_CANDIDATE_ONLY');
assert.equal(policy.authority.dispatch,'R147');
assert.equal(policy.authority.returnProof,'R141');
assert.equal(policy.authority.durableHistory,'R146');
assert.equal(policy.authority.canonAdmission,'R125');
assert.equal(policy.authority.productionWriter,'.github/workflows/ci.yml');
assert.equal(policy.authority.canonicalAdmissionClaimed,false);
assert.equal(R265_AUTHORITY.addsPromotionAuthority,false);
assert.equal(R265_AUTHORITY.sourceMutation,'R240_SINGLE_CANDIDATE_ONLY');
assert.ok(R265_INVARIANTS.includes('SCAR_HISTORY_IS_CARRIED_NOT_SILENTLY_RESET'));
assert.ok(R265_INVARIANTS.includes('STRUCTURE_AND_ORIENTATION_ARE_FACTORED'));
assert.ok(R265_INVARIANTS.includes('FOUNDATION_WEIGHTS_CHANGED_MUST_NOT_BE_CLAIMED_WITHOUT_ACTUAL_WEIGHT_TRAINING_PROOF'));
assert.ok(R265_INVARIANTS.includes('HEALTHY_NEW_SKINS_MAY_PROMOTE_WHEN_INVARIANTS_ARE_PRESERVED_OR_VERSION_MIGRATED_AND_REPROVED'));

const base={metrics:{continuity:.9,plasticity:.82,contradiction:.09,burden:.18,scar:.08,evidence:.91},water:{flow:.86,boundary:.17,pressure:.18,memory:.76,curvature:.08,hysteresis:.08},correspondence:.88,invariantCarry:.92,residual:.06,provenance:['TEST_RETURNED_EVIDENCE'],sourceFrame:'SOURCE_FRAME',targetFrame:'TARGET_FRAME',sourceSkin:'COMPUTE',targetSkin:'RENDER',sourceResolution:20736,targetResolution:248832};
const plus=compileWovenDimensionalRelativityR265({...base,orientation:1});
const minus=compileWovenDimensionalRelativityR265({...base,orientation:-1});
const comparison=compareR265Structures(plus,minus);
assert.equal(plus.schema,R265_SCHEMA);
assert.equal(plus.dimensionalRelativity.physicalDimensionsClaimed,false);
assert.equal(plus.dimensionalRelativity.sourceResolutionIs12Power,true);
assert.equal(plus.dimensionalRelativity.targetResolutionIs12Power,true);
assert.equal(plus.dimensionalRelativity.structureOrientationFactored,true);
assert.equal(plus.dimensionalRelativity.orientation,1);
assert.equal(minus.dimensionalRelativity.orientation,-1);
assert.equal(comparison.sameStructureWithinTolerance,true,'orientation reversal must not silently rewrite structural state');
assert.equal(comparison.orientationChanged,true);
assert.equal(plus.violet.mode,'SOFTWARE_TRANSFIGURATION_REEXPRESSION_CONTRACT');
assert.equal(plus.violet.formulaClaimed,false,'R265 must not invent a universal Violet physical equation');
assert.equal(plus.proof.externalScientificTruthClaimed,false);
assert.equal(plus.proof.roundTripStatus,'NOT_MEASURED','round-trip proof may not be fabricated when no residual was measured');
assert.equal(plus.proof.commutationStatus,'NOT_MEASURED');
assert.equal(plus.development.blockedByR265,false,'R265 is an integrity contract, not a new blanket promotion gate');
assert.equal(plus.development.promotionPosture,'HEALTHY_FORWARD');
assert.ok(plus.water.shapeSignature>=0&&plus.water.shapeSignature<=1);
assert.ok(plus.water.transportCoherence>=0&&plus.water.transportCoherence<=1);
assert.ok(plus.woven.continuity>=0&&plus.woven.continuity<=1);
assert.ok(plus.metrics.computationCoherence>=0&&plus.metrics.computationCoherence<=1);

const measured=compileWovenDimensionalRelativityR265({...base,roundTripResidual:.01,commutationResidual:.02,residualThreshold:.05,orientation:1});
assert.equal(measured.proof.roundTripStatus,'PASS');
assert.equal(measured.proof.commutationStatus,'PASS');
const failedResidual=compileWovenDimensionalRelativityR265({...base,roundTripResidual:.12,residualThreshold:.05,orientation:1});
assert.equal(failedResidual.proof.roundTripStatus,'FAIL');
assert.equal(failedResidual.development.requiresExistingGateReview,true);
assert.equal(failedResidual.development.blockedByR265,false,'failed R265 residual requests existing-gate review instead of inventing a new promotion authority');

const lowScar=compileWovenDimensionalRelativityR265({...base,metrics:{...base.metrics,scar:.02},water:{...base.water,hysteresis:.02}});
const highScar=compileWovenDimensionalRelativityR265({...base,metrics:{...base.metrics,scar:.9},water:{...base.water,hysteresis:.9}});
assert.ok(highScar.woven.residualCarry>lowScar.woven.residualCarry,'scar/history must materially carry into the computation');
assert.ok(highScar.metrics.computationCoherence<lowScar.metrics.computationCoherence,'high carried scar must not disappear from coherence');

for(const skin of ['FUNCTION','COMPUTE','ORGANIZE','LEARN','RENDER','EXECUTE','SELF_BUILD','EVIDENCE']){
 assert.ok(R265_SKIN_CONTRACTS[skin],`missing R265 skin contract ${skin}`);
 const cycle=compileSkinCycleR265(plus,skin);
 assert.equal(cycle.skin,skin);
 assert.deepEqual(cycle.cycle,R265_CYCLE);
 assert.equal(cycle.sourceMutationAuthorized,false);
 assert.equal(cycle.canonicalAdmission,false);
}

const operational=compileOperationalConvergenceR249({metrics:{continuity:.86,plasticity:.78,contradiction:.12,burden:.2,evidence:.9,uncertainty:.1,scar:.1},configuredParallel:12,effectiveCpuWorkers:12});
assert.equal(operational.wovenDimensionalRelativityR265.schema,R265_SCHEMA);
assert.equal(operational.organizationSkinR265.skin,'ORGANIZE');
assert.equal(operational.organizationSkinR265.sourceMutationAuthorized,false);
assert.ok(operational.capacity>=0&&operational.capacity<=1);
assert.equal(operational.authority.sourcePromotion,'R240');
assert.equal(operational.authority.canonAdmission,'R125');

for(const token of ['compileWovenDimensionalRelativityR265','compileSkinCycleR265','r265Coherence','learningContract:\'R265_LEARN\'','unchosen candidates are not silently treated as failures'])assert.ok(world.includes(token),`world-model LEARN skin missing ${token}`);
for(const token of ['compileWovenDimensionalRelativityR265','dimensionalRelativityR265','sourceSkin:\'COMPUTE\'','targetSkin:\'RENDER\'','r265Coherence'])assert.ok(weave.includes(token),`woven RENDER skin missing ${token}`);
for(const token of ['wovenDimensionalRelativityR265','r265ComputationCoherence','r265PromotionPosture','R265 never blocks a healthy new capability'])assert.ok(selection.includes(token),`R245 ORGANIZE/SELF_BUILD carry missing ${token}`);
for(const token of ['dimensionalRelativityRevision:\'R265\'','wovenDimensionalRelativityR265','Water transport → Woven path/correspondence → Violet re-expression','cannot block a capability merely because it is new or uses a new skin'])assert.ok(engine.includes(token),`R170 receipt/cycle integration missing ${token}`);
for(const token of ['Water Geometry','Woven Continuity','Violet','Dimensional Relativity','Healthy promotion rule','The semantic invariants are locked. Implementations are not.'])assert.ok(docs.includes(token),`R265 semantic-lock documentation missing ${token}`);
assert.ok(r240Test.includes("await import('./r265-woven-dimensional-relativity-invariants.mjs')"),'mandatory R240 promotion proof chain must transitively execute R265 invariants');

console.log('OMEGA R265 WOVEN DIMENSIONAL RELATIVITY PASS · Water deformation + Woven path identity + Violet software re-expression + frame/resolution relativity + scar/orientation/provenance carry · applied to ORGANIZE/LEARN/RENDER/SELF_BUILD skins · measured-residual proof boundary · healthy promotion remains forward-compatible · R240/R147/R141/R146/R125/ci authorities unchanged');

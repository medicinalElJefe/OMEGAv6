import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  R243_CONTINUITY_OPERATOR,R243_RESOLUTION,R243_ROLES,R243_INVARIANT_CARRY,
  addressForCellR243,validateRoadmapDagR243,carryScarsR243,buildWorkCellR243,rolePacketsForCellR243,planWovenBuildFabricR243
} from '../scripts/lib/r243-woven-selfbuild-fabric.mjs';

const policy=JSON.parse(fs.readFileSync('public/omega-r243-woven-selfbuild-fabric.json','utf8'));
const r240=JSON.parse(fs.readFileSync('public/omega-r240-recursive-exact-self-promotion.json','utf8'));
const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const engine=fs.readFileSync('scripts/r170-selfbuild-engine.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const r240Test=fs.readFileSync('tests/r240-recursive-exact-self-promotion-invariants.mjs','utf8');
const navLemma=fs.readFileSync('src/navigationLemmaCalculusR242.js','utf8');

assert.equal(policy.schema,'OMEGA_WOVEN_SELFBUILD_FABRIC_R243');
assert.equal(policy.revision,'R243');
assert.equal(policy.inherits.navigationLemma,'R242');
assert.equal(policy.inherits.recursiveScheduler,'R240');
assert.equal(policy.inherits.exactSelfPromotion,'R240');
assert.equal(policy.fabric.parallelPlanning,true);
assert.equal(policy.fabric.parallelEvaluation,true);
assert.equal(policy.fabric.parallelSourceMutation,false);
assert.equal(policy.fabric.maxActivePlanningCellsPerPulse,12);
assert.equal(policy.fabric.userValueDeficitMayBeInferred,false);
assert.deepEqual(policy.fabric.typedRoles,R243_ROLES);
assert.equal(policy.continuityOperator,R243_CONTINUITY_OPERATOR);
assert.equal(policy.resolution.physicalDimensionsClaimed,false);
assert.equal(R243_RESOLUTION.organs,12);
assert.equal(R243_RESOLUTION.branches,144);
assert.equal(R243_RESOLUTION.cells,1728);
assert.equal(R243_RESOLUTION.lanes,20736);
assert.equal(R243_RESOLUTION.deepAddress,248832);

const addresses=Array.from({length:1728},(_,i)=>addressForCellR243(i));
assert.equal(new Set(addresses.map(x=>x.address)).size,1728,'every R243 cell address must be unique');
assert.equal(new Set(addresses.map(x=>x.branch)).size,144,'R243 must expose exactly 144 branches');
assert.equal(addresses[0].laneStart,0);
assert.equal(addresses.at(-1).laneEnd,20735);
assert.equal(addresses.at(-1).deepEnd,248831);
assert.throws(()=>addressForCellR243(1728),RangeError);

const roadmap=[
  {id:'A',title:'A',objective:'A objective',target:'src/generated/a.ts',risk:'LOW',expectedGain:.9,complexity:.2,contradictionRisk:.05,prerequisites:[]},
  {id:'B',title:'B',objective:'B objective',target:'src/generated/b.ts',risk:'LOW',expectedGain:.7,complexity:.25,contradictionRisk:.05,prerequisites:[]},
  {id:'C',title:'C',objective:'C objective',target:'src/generated/c.ts',risk:'LOW',expectedGain:1,complexity:.1,contradictionRisk:.02,prerequisites:['A']}
];
assert.equal(validateRoadmapDagR243(roadmap).valid,true);
assert.equal(validateRoadmapDagR243([{id:'A',prerequisites:['MISSING']}]).valid,false);
assert.equal(validateRoadmapDagR243([{id:'A',prerequisites:['B']},{id:'B',prerequisites:['A']}]).valid,false);
assert.equal(validateRoadmapDagR243([{id:'A'},{id:'A'}]).valid,false);

const evidence={state:'RESIDUALS_PRESENT',summary:{blocking:0,review:1,observe:1},residuals:[
  {id:'R-A',severity:'LOW',mode:'OBSERVE_ONLY',summary:'carry this observation'},
  {id:'R-B',severity:'MEDIUM',mode:'QUEUE_FOR_REVIEW',summary:'review this residual'}
]};
const scars=carryScarsR243([{scarId:'OLD',severity:'LOW',mode:'OBSERVE_ONLY',summary:'older scar',provenance:'R146_DURABLE_HISTORY'}],evidence);
assert.equal(scars.length,3);
assert.ok(scars.some(x=>x.scarId==='OLD'&&x.carried===true));
assert.ok(scars.some(x=>x.scarId==='R-A'&&x.provenance==='R164_RETURNED_RESIDUAL_EVIDENCE'));

let plan=planWovenBuildFabricR243({roadmap,admitted:[],maxParallel:12,evidence,previousScars:scars.filter(x=>x.scarId==='OLD')});
assert.equal(plan.schema,'OMEGA_WOVEN_SELFBUILD_FABRIC_R243');
assert.equal(plan.revision,'R243');
assert.equal(plan.state,'PLANNED');
assert.equal(plan.dag.valid,true);
assert.equal(plan.activeCells.length,2,'only A and B are dependency-ready before A is admitted');
assert.equal(plan.packets.length,16,'eight typed role packets are emitted for each active planning cell');
assert.equal(plan.addressSpace.cells,1728);
assert.equal(plan.addressSpace.lanes,20736);
assert.equal(plan.addressSpace.deepAddress,248832);
assert.equal(plan.parallelPlanning,true);
assert.equal(plan.parallelEvaluation,true);
assert.equal(plan.parallelSourceMutation,false);
assert.equal(plan.authority,'PLANNING_AND_EVALUATION_ONLY');
assert.equal(plan.canonicalAdmission,false);
assert.ok(['A','B'].includes(plan.sourceMutationCandidateId));
assert.equal(plan.activeCells[0].id,plan.sourceMutationCandidateId,'R243 may rank the same strongest candidate but cannot mutate it itself');
for(const cell of plan.activeCells){
  for(const field of ['address','parent','objective','inputs','dependencies','invariants','files','tests','expectedOutputs','authorityBoundary','residuals','state','provenance','evidenceClass','sigma','transformationHistory','executionIdentity','proofIdentity'])assert.ok(Object.hasOwn(cell,field),`R243 work cell missing ${field}`);
  assert.equal(cell.sigma,0);
  assert.equal(cell.sourceMutationAuthorized,false);
  assert.equal(cell.canonicalAdmission,false);
  assert.equal(cell.authorityBoundary.sourceMutation,'R240_SINGLE_CANDIDATE_ONLY');
  assert.equal(cell.authorityBoundary.dispatch,'R147');
  assert.equal(cell.authorityBoundary.returnVerification,'R141');
  assert.equal(cell.authorityBoundary.durableHistory,'R146');
  assert.equal(cell.authorityBoundary.canonAdmission,'R125');
  assert.equal(cell.rolePackets.length,R243_ROLES.length);
  assert.deepEqual(cell.rolePackets.map(x=>x.role),R243_ROLES);
  for(const packet of cell.rolePackets){
    assert.equal(packet.sourceMutationAuthorized,false);
    assert.equal(packet.dispatchAuthorized,false);
    assert.equal(packet.canonicalAdmission,false);
    assert.equal(packet.sigma,0);
    assert.equal(packet.authorityBoundary.singleSourceMutation,'R240');
    assert.equal(packet.authorityBoundary.dispatch,'R147');
    assert.equal(packet.authorityBoundary.exactReturn,'R141');
    assert.equal(packet.authorityBoundary.durableHistory,'R146');
    assert.equal(packet.authorityBoundary.canonAdmission,'R125');
  }
}
assert.ok(R243_INVARIANT_CARRY.includes('CI_YML_SOLE_CANONICAL_PRODUCTION_WRITER'));
assert.ok(R243_INVARIANT_CARRY.includes('SOURCE_MUTATION_REQUIRES_EXACT_APPLY_PATCH_OR_WRITE_TEXT_RETURN_PROOF'));
assert.ok(R243_INVARIANT_CARRY.includes('R242_READ_ONLY_NAVIGATION_LEMMA'));

plan=planWovenBuildFabricR243({roadmap,admitted:['A'],maxParallel:12,evidence,previousScars:[]});
assert.ok(plan.activeCells.some(x=>x.id==='C'),'C must become ready only after A is admitted');
const badPlan=planWovenBuildFabricR243({roadmap:[{id:'A',prerequisites:['B']},{id:'B',prerequisites:['A']}],admitted:[],evidence});
assert.equal(badPlan.state,'BLOCKED_INVALID_DAG');
assert.equal(badPlan.sourceMutationCandidateId,null);
assert.equal(badPlan.parallelSourceMutation,false);
assert.equal(badPlan.canonicalAdmission,false);

const standalone=buildWorkCellR243(roadmap[0],0,{admitted:new Set(),evidence,scars});
assert.equal(rolePacketsForCellR243(standalone).length,8);

for(const token of ["import {planWovenBuildFabricR243} from './lib/r243-woven-selfbuild-fabric.mjs'",'const wovenPlan=planWovenBuildFabricR243','BLOCKED_BY_R243_FABRIC','BLOCKED_BY_R243_R240_SELECTION_DIVERGENCE','const capsule=candidates[0]||null','wovenFabricR243',"planningFabricRevision:'R243'",'R240 retained exactly one source-mutation/promotion candidate'])assert.ok(engine.includes(token),`R243 engine integration missing ${token}`);
assert.ok(!/git\s+push/i.test(engine),'R243 planning engine must not directly push source');
assert.equal(state.recursiveSchedulerRevision,'R240','R243 must not silently replace R240 exact source scheduler/promotion authority');
assert.equal(state.exactSelfPromotionRevision,'R240');
assert.equal(r240.selfPromotion.twoParentMergeRequired,true);
assert.equal(r240.deployment.soleCanonicalWriter,'.github/workflows/ci.yml');
assert.equal(policy.authority.sourceMutationAndPromotion,'R240_SINGLE_CANDIDATE_ONLY');
assert.equal(policy.authority.hybridResourceAdmission,'R239');
assert.equal(policy.authority.dispatch,'R147');
assert.equal(policy.authority.hybridReturn,'R141');
assert.equal(policy.authority.durableHistory,'R146');
assert.equal(policy.authority.canonStateAdmission,'R125');
assert.equal(policy.authority.canonAdmissionClaimed,false);
assert.ok(navLemma.includes("R242_NAVIGATION_LEMMA_REVISION='R242'"),'R243 must preserve already-promoted R242 navigation identity rather than renaming it');
assert.ok(r240Test.includes("await import('./r243-woven-selfbuild-fabric-invariants.mjs')"),'mandatory R240 invariant must transitively execute R243 proof');
assert.ok(ci.includes('node tests/r240-recursive-exact-self-promotion-invariants.mjs'),'canonical CI must execute the R240→R243 proof chain');
assert.ok(workflow.includes('node tests/r240-recursive-exact-self-promotion-invariants.mjs'),'governed self-build must execute the R240→R243 proof chain before generation/promotion');
assert.ok(!/^\s*workflow_run\s*:/m.test(workflow),'R243 must not create recursive workflow fanout');

console.log('OMEGA R243 WOVEN SELF-BUILD FABRIC PASS · production R242 navigation preserved · 12/144/1728/20736/248832 address topology · DAG fail-closed · sparse multi-cell planning/evaluation · typed work packets · scar/invariant carry · R240 single mutation/promotion · R239/R147/R141/R146/R125 authorities preserved');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {attachEvidencePressureR240,candidateScoreR240,planParallelFrontierR240,rankDependencyReadyCapsulesR240,residualPressureR240,R240_RESOLUTION,R240_CONTINUITY_OPERATOR} from '../scripts/lib/r240-recursive-selfbuild-fabric.mjs';

const policy=JSON.parse(fs.readFileSync('public/omega-r240-recursive-exact-self-promotion.json','utf8'));
const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));
const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const engine=fs.readFileSync('scripts/r170-selfbuild-engine.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const verifier=fs.readFileSync('scripts/verify_live_hybrid_command_authority_r237.mjs','utf8');
const r239=fs.readFileSync('src/hybridResourceGovernorR239.ts','utf8');
const ui=fs.readFileSync('src/RecursiveSelfBuildR240.tsx','utf8');
const calculusUi=fs.readFileSync('src/CalculusAddressFabricR240.tsx','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');

assert.equal(policy.schema,'OMEGA_RECURSIVE_EXACT_SELF_PROMOTION_R240');
assert.equal(policy.revision,'R240');
assert.deepEqual(R240_RESOLUTION,{organs:12,branches:144,cells:1728,lanes:20736,deepAddress:248832});
assert.equal(policy.resolution.physicalDimensionsClaimed,false);
assert.equal(policy.scheduler.parallelPlanningDoesNotEqualParallelMutation,true);
assert.equal(policy.scheduler.userValueDeficitPolicy,'zero unless explicitly evidenced; never inferred');
assert.equal(policy.scheduler.empiricalTruthClaimed,false);
assert.equal(policy.selfPromotion.githubAutoMergeFeature,false);
assert.equal(policy.selfPromotion.exactSuccessfulProductionBaseRequired,true);
assert.equal(policy.selfPromotion.r164ResidualGateRequired,'PASS');
assert.equal(policy.selfPromotion.highOrCriticalResidualPromotion,false);
assert.equal(policy.selfPromotion.committedCandidateReproofRequired,true);
assert.equal(policy.selfPromotion.allDeclaredCandidateTestsRequired,true);
assert.equal(policy.selfPromotion.allowlistedDiffRequired,true);
assert.equal(policy.selfPromotion.unchangedBaseImmediatelyBeforeMerge,true);
assert.equal(policy.selfPromotion.expectedHeadShaRequired,true);
assert.equal(policy.selfPromotion.mergeMethod,'merge');
assert.equal(policy.selfPromotion.twoParentMergeRequired,true);
assert.equal(policy.selfPromotion.directMainPushFromGenerator,false);
assert.equal(policy.deployment.soleCanonicalWriter,'.github/workflows/ci.yml');
assert.equal(policy.deployment.selfBuilderMayDeployDirectly,false);
assert.equal(policy.deployment.selfBuilderMayDispatchItself,false);
assert.equal(policy.deployment.exactMergedShaProductionSuccessRequired,true);
assert.equal(policy.authority.hybridResourceAdmission,'R239');
assert.equal(policy.authority.dispatch,'R147');
assert.equal(policy.authority.hybridReturn,'R141');
assert.equal(policy.authority.durableHistory,'R146');
assert.equal(policy.authority.canonStateAdmission,'R125');
assert.equal(policy.authority.canonAdmissionClaimed,false);
assert.equal(policy.continuityOperator,R240_CONTINUITY_OPERATOR);

const roadmap=[
 {id:'A',risk:'LOW',expectedGain:.9,complexity:.2,contradictionRisk:.05,prerequisites:[]},
 {id:'B',risk:'LOW',expectedGain:.8,complexity:.2,contradictionRisk:.05,prerequisites:[]},
 {id:'C',risk:'LOW',expectedGain:1,complexity:.1,contradictionRisk:.02,prerequisites:['A']}
];
const evidence={state:'RESIDUALS_PRESENT',summary:{blocking:0,review:1,observe:1},residuals:[{id:'LOW',severity:'LOW',mode:'OBSERVE_ONLY'},{id:'MED',severity:'MEDIUM',mode:'QUEUE_FOR_REVIEW'}]};
const p=residualPressureR240(evidence);
assert.equal(p.provenance,'R164_RETURNED_RESIDUAL_EVIDENCE');
assert.equal(p.userValueDeficit,0,'R240 may not invent user-value deficit');
assert.equal(p.userValueSignal,'NOT_INFERRED');
const pressured=attachEvidencePressureR240(roadmap,evidence);
assert.ok(pressured.every(x=>x.pressure?.provenance==='R164_RETURNED_RESIDUAL_EVIDENCE'));
assert.ok(pressured.find(x=>x.id==='A').pressure.bottleneck>pressured.find(x=>x.id==='B').pressure.bottleneck,'dependency topology must expose bottleneck without fabricating residuals');
let frontier=rankDependencyReadyCapsulesR240(pressured,new Set(),12);
assert.equal(frontier.length,2);
assert.ok(frontier.every(x=>x.id!=='C'));
assert.ok(candidateScoreR240(frontier[0])>=candidateScoreR240(frontier[1]));
frontier=rankDependencyReadyCapsulesR240(pressured,new Set(['A']),12);
assert.ok(frontier.some(x=>x.id==='C'));
const plan=planParallelFrontierR240({roadmap,admitted:new Set(),maxParallel:12,evidence});
assert.equal(plan.schema,'OMEGA_RECURSIVE_SELFBUILD_FRONTIER_R240');
assert.equal(plan.authority,'SCHEDULING_ONLY');
assert.equal(plan.canonicalAdmission,false);
assert.equal(plan.readyCount,2);
assert.equal(plan.pressureProvenance,'R164_RETURNED_RESIDUAL_EVIDENCE_PLUS_DEPENDENCY_TOPOLOGY');

for(const token of ['attachEvidencePressureR240','planParallelFrontierR240','rankDependencyReadyCapsulesR240','const capsule=candidates[0]||null',"schedulerRevision:'R240'",'canonicalAdmission:false'])assert.ok(engine.includes(token),`R240 engine integration missing ${token}`);
assert.ok(!/git\s+push/i.test(engine),'R240 scheduler engine itself must not push source');
assert.equal(state.revision,'R170.2');
assert.equal(state.recursiveSchedulerRevision,'R240');
assert.equal(governor.currentCapabilityFloor,'R239','R240 must preserve production R239 capability floor until R240 proof completes');
assert.equal(governor.preservedRuntime.hybridResourceGovernor,'R239_SELECTED_HOST_PRESSURE_AWARE_ADMISSION_AND_BOUNDED_WORK_SIZING');
for(const token of ["schema:'OMEGA_HYBRID_RESOURCE_ENVELOPE_R239'","revision:'R239'","profile?.schema==='OMEGA_HYBRID_HOST_PROFILE_R238'",'SHARED_SNAPSHOT_STALE_OR_UNPROVED','RETURNED_RESOURCE_PROFILE_STALE_OR_CLOCK_INVALID','ONE_ACTIVE_NATIVE_JOB_PER_DEVICE','RESOURCE_PRESSURE_CRITICAL','mutate CanonState'])assert.ok(r239.includes(token),`production R239 Hybrid resource governor contract missing ${token}`);
assert.ok(!r239.includes('canonicalAdmission:true'),'R239 must not gain CanonState admission authority');

for(const token of ["data-r240-recursive-selfbuild='EVIDENCE_BOUND_SPARSE_PLAN_EXACT_PROMOTION'",'R240 · FULL OVERALL CANON · RECURSIVE SELF-BUILD + EXACT PROMOTION','R239 PRESERVED','GENERATED ≠ PROVED ≠ SOURCE-PROMOTED ≠ DEPLOYED ≠ LIVE-VERIFIED ≠ CANON-ADMITTED','R125 sole CanonState admission authority'])assert.ok(ui.includes(token),`R240 operator surface missing ${token}`);
for(const token of ["data-r240-calculus-address='SPARSE_ADDRESS_FABRIC'",'20,736 ADDRESS FABRIC','179 source modes + 62 lenses','+1 DISPATCH','−1 RETURN','0 OBSERVE'])assert.ok(calculusUi.includes(token),`R240 calculus operator surface missing ${token}`);
assert.ok(suite.includes("import RecursiveSelfBuildR240 from './RecursiveSelfBuildR240'"));
assert.ok(suite.includes("import CalculusAddressFabricR240 from './CalculusAddressFabricR240'"));
assert.ok(suite.includes('<RecursiveSelfBuildR240/>'));
assert.ok(suite.includes('<CalculusAddressFabricR240 record={record}/>'));

for(const token of ['actions: write',"['push','workflow_dispatch'].includes(r.event)",'R240 EXACT CANDIDATE PASS','R240 exact two-parent source promotion PASS','pulls/$PR_NUMBER/merge','-f merge_method=merge','-f sha="$CANDIDATE_SHA"','actions/workflows/ci.yml/dispatches','--event workflow_dispatch','gh run watch "$RUN_ID"','R240 exact promoted merge is production-proven by canonical ci.yml','POLICY_BLOCKED_BRANCH_REMOVED'])assert.ok(workflow.includes(token),`R240 self-promotion workflow missing ${token}`);
assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(workflow),'R240 may not direct-push generated source to main');
assert.ok(!/gh\s+pr\s+merge/.test(workflow),'R240 must not use GitHub auto-merge/CLI merge');
assert.ok(!/actions\/workflows\/r170-governed-selfbuild\.yml\/dispatches/.test(workflow),'R240 may not dispatch itself');
assert.ok(!/^\s*workflow_run\s*:/m.test(workflow),'R240 must not create recursive workflow_run fanout');

assert.ok(ci.includes('workflow_dispatch:'),'canonical ci.yml must accept explicit exact R240 deployment dispatch');
assert.ok(ci.includes("github.event_name == 'workflow_dispatch'"),'canonical deployment must distinguish explicit R240 dispatch');
assert.ok(ci.includes("github.ref == 'refs/heads/main'"),'explicit canonical deploy must remain main-only');
assert.ok(ci.includes('Promoted main commit must be an exact two-parent merge commit'),'canonical deployment must retain exact two-parent lineage');
assert.ok(!ci.includes('workflow_run:'),'canonical deployment must not add recursive workflow fanout');

for(const token of ["get('/api/core-health')","get('/api/system/convergence')","proofClosureRevision!=='R141'","durableExecutionRevision!=='R146'","executorFabricRevision!=='R147'","canonicalAdmission?.authority!=='R125'","BRIDGE_CALCULUS_EXTENSION='R240'",'data-r237-correlation','data-r237-selected-device','data-r237-snapshot-epoch','data-r239-resource-tier','data-r238-selected-device','data-r238-snapshot-epoch','intelligenceDevice!==commandDevice','intelligenceEpoch!==epoch','.r237-presets article','.r237-state-grid article'])assert.ok(verifier.includes(token),`R240.1 semantic live verifier missing ${token}`);
assert.ok(!verifier.includes('const deckText=await deck.innerText()'),'R240.1 verifier must not derive release authority from rendered explanatory prose');
assert.ok(!verifier.includes("'HOST / JOB / MISSION / EPOCH','R239 RESOURCE ENVELOPE'"),'R240.1 verifier must not retain obsolete display-copy release gates');
assert.ok(!verifier.includes('R238 changes correlation and sampling, not execution or Canon authority'),'obsolete prose-coupled verifier must be gone');

console.log('OMEGA R240/R240.1 RECURSIVE EXACT SELF-PROMOTION PASS · actual R239 Hybrid governor contract preserved · R164 evidence-bound sparse scheduler · full 20,736 calculus surface preserved · semantic live Hybrid proof without display-copy coupling · exact production base/residual/all-green/allowlist/unchanged-base/expected-head gates · two-parent merge · canonical ci.yml exact-production proof · R125 admission unchanged');
await import('./r240-full-calculus-bridge-invariants.mjs');

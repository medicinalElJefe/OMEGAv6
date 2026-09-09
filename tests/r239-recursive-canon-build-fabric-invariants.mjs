import assert from 'node:assert/strict';
import fs from 'node:fs';
import {attachEvidencePressure,candidateScore,planParallelFrontier,rankDependencyReadyCapsules,residualPressure,R239_RESOLUTION,R239_CONTINUITY_OPERATOR} from '../scripts/lib/r239-recursive-build-fabric.mjs';

const core=fs.readFileSync('src/system/recursiveCanonBuildR239.ts','utf8');
const ui=fs.readFileSync('src/RecursiveCanonBuildR239.tsx','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const engine=fs.readFileSync('scripts/r170-selfbuild-engine.mjs','utf8');
const policy=JSON.parse(fs.readFileSync('public/omega-r239-recursive-build-fabric.json','utf8'));
const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));
const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const hybrid=fs.readFileSync('src/HybridLinkR32.tsx','utf8');

assert.deepEqual(R239_RESOLUTION,{organs:12,branches:144,cells:1728,lanes:20736,deepAddress:248832});
assert.equal(policy.resolution.physicalDimensionsClaimed,false);
assert.equal(policy.scheduler.sparseActivation,true);
assert.equal(policy.scheduler.parallelPlanningDoesNotEqualParallelMutation,true);
assert.equal(policy.pressureField.empiricalTruthClaimed,false);
assert.equal(policy.pressureField.userValueDeficitPolicy,'zero unless explicitly evidenced; never inferred');
assert.equal(policy.admission.directMainMutation,false);
assert.equal(policy.admission.schedulerAutoMerge,false);
assert.equal(policy.admission.dispatchAuthority,'R147');
assert.equal(policy.admission.hybridReturnAuthority,'R141');
assert.equal(policy.admission.durableHistoryAuthority,'R146');
assert.equal(policy.admission.canonStateAdmissionAuthority,'R125');
assert.equal(policy.organs.length,12);
assert.equal(policy.continuityOperator,R239_CONTINUITY_OPERATOR);
assert.equal(policy.inherits.hybridCorrelation,'R238 Woven Hybrid Continuity');

for(const token of ["R239_RESOLUTION=Object.freeze({organs:12,branches:144,cells:1728,lanes:20736,deepAddress:248832})",'R239_ORGANS=Object.freeze([','r239CellAddress','r239LaneRange','r239Pressure','r239CandidateScore','r239ReadyFrontier','r239MergeAdmissible'])assert.ok(core.includes(token),`R239 core missing ${token}`);
for(const token of ["admissionLaw:'MAXIMUM INTERNAL EVOLUTION + STRICT EXTERNAL ADMISSION'","canonicalAdmissionAuthority:'R125'","dispatchAuthority:'R147'","hybridReturnAuthority:'R141'","durableHistoryAuthority:'R146'"])assert.ok(core.includes(token),`R239 authority law missing ${token}`);

const roadmap=[
 {id:'A',risk:'LOW',expectedGain:.9,complexity:.2,contradictionRisk:.05,prerequisites:[]},
 {id:'B',risk:'LOW',expectedGain:.8,complexity:.2,contradictionRisk:.05,prerequisites:[]},
 {id:'C',risk:'LOW',expectedGain:1,complexity:.1,contradictionRisk:.02,prerequisites:['A']}
];
const evidence={state:'RESIDUALS_PRESENT',summary:{blocking:0,review:1,observe:1},residuals:[{id:'LOW',severity:'LOW',mode:'OBSERVE_ONLY'},{id:'MED',severity:'MEDIUM',mode:'QUEUE_FOR_REVIEW'}]};
const evidencePressure=residualPressure(evidence);
assert.equal(evidencePressure.provenance,'R164_RETURNED_RESIDUAL_EVIDENCE');
assert.equal(evidencePressure.userValueDeficit,0,'R239 may not invent a user-value deficit');
const pressured=attachEvidencePressure(roadmap,evidence);
assert.ok(pressured.every(x=>x.pressure?.provenance==='R164_RETURNED_RESIDUAL_EVIDENCE'),'roadmap pressure must carry R164 provenance');
assert.ok(pressured.find(x=>x.id==='A').pressure.bottleneck>pressured.find(x=>x.id==='B').pressure.bottleneck,'dependency centrality must expose structural bottlenecks without fabricating residuals');
let frontier=rankDependencyReadyCapsules(pressured,new Set(),12);
assert.equal(frontier.length,2,'dependency frontier must include both independent ready cells');
assert.ok(frontier.every(x=>x.id!=='C'),'dependency-blocked cell must not enter frontier');
assert.ok(candidateScore(frontier[0])>=candidateScore(frontier[1]),'ready frontier must be evidence/gain/risk ranked');
frontier=rankDependencyReadyCapsules(pressured,new Set(['A']),12);
assert.ok(frontier.some(x=>x.id==='C'),'completed prerequisite must release dependent cell');
const plan=planParallelFrontier({roadmap,admitted:new Set(),maxParallel:12,evidence});
assert.equal(plan.schema,'OMEGA_RECURSIVE_BUILD_FRONTIER_R239');
assert.equal(plan.authority,'SCHEDULING_ONLY');
assert.equal(plan.canonicalAdmission,false);
assert.equal(plan.readyCount,2);
assert.equal(plan.pressureProvenance,'R164_RETURNED_RESIDUAL_EVIDENCE_PLUS_DEPENDENCY_TOPOLOGY');

for(const token of ['attachEvidencePressure','planParallelFrontier','rankDependencyReadyCapsules','const capsule=candidates[0]||null','R239 ranks the whole dependency-ready sparse frontier',"schedulerRevision:'R239'",'canonicalAdmission:false'])assert.ok(engine.includes(token),`R239 R170 integration missing ${token}`);
assert.ok(!/git\s+push/i.test(engine),'R239 scheduler itself must not add repository push authority');
assert.equal(state.revision,'R170.2','R239 must preserve the R170 state identity');
assert.equal(governor.currentCapabilityFloor,'R238','R239 candidate must inherit the current production-proven source floor until R239/R240 production proof completes');
assert.equal(governor.successorWorkflowPolicy.autoMergeAllowed,false);

for(const token of ["data-r239-recursive-build='SPARSE_PARALLEL_PLAN_STRICT_ADMISSION'",'R239 · FULL OVERALL CANON · RECURSIVE BUILD FABRIC','R239_RESOLUTION.cells.toLocaleString()',"fetch('/omega-r170-selfbuild-state.json'",'R147 remains dispatch authority','R125 sole CanonState admission authority'])assert.ok(ui.includes(token),`R239 operator surface missing ${token}`);
assert.ok(suite.includes("import RecursiveCanonBuildR239 from './RecursiveCanonBuildR239'"),'R239 surface must be imported by specialist suite');
assert.ok(suite.includes('<RecursiveCanonBuildR239/>'),'R239 surface must be mounted in operational specialist routing');
for(const token of ['HybridRuntimeSnapshotProviderR238','HybridWovenContinuityR238','HybridHostIntelligenceR238','R141 PROOF CLOSURE','R117 CONNECTION'])assert.ok(hybrid.includes(token),`R239 must inherit converged R238 Hybrid truth ${token}`);

console.log('OMEGA R239 RECURSIVE CANON BUILD FABRIC PASS · R164 evidence-bound pressure + dependency topology · user-value deficit never inferred · 12/144/1728/20736/248832 logical addressing · sparse dependency frontier · R170 one-candidate materialization boundary · R238 inherited · R141/R146/R147/R125 preserved');

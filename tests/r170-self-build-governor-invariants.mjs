import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const enginePath=path.resolve('scripts/r170-selfbuild-engine.mjs');
const engine=fs.readFileSync(enginePath,'utf8');
const collector=fs.readFileSync('scripts/collect_selfbuild_residual_gate_r170.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const governor=JSON.parse(fs.readFileSync('public/omega-r170-self-build-governor.json','utf8'));
const cloudWorkflow=fs.readFileSync('.github/workflows/r223-cloudflare-evolution.yml','utf8');
const cloudTest=fs.readFileSync('tests/r223-cloudflare-evolution-invariants.mjs','utf8');

assert.equal(state.schema,'OMEGA_GOVERNED_SELFBUILD_STATE_R170');
assert.equal(state.revision,'R170.2');
assert.equal(state.active,true);
assert.equal(state.maxAutonomousGenerations,5);
assert.equal(state.maxParallelPlanningCells,12);
assert.equal(state.recursiveSchedulerRevision,'R240');
assert.equal(state.exactSelfPromotionRevision,'R240');
assert.equal(state.roadmap.length,5);
assert.ok(Number.isInteger(state.generation)&&state.generation>=0&&state.generation<=state.maxAutonomousGenerations,`generation out of governed range: ${state.generation}`);
const roadmapIds=new Set(state.roadmap.map(x=>x.id));
const admitted=Array.isArray(state.admittedSourceCapsules)?state.admittedSourceCapsules:[];
assert.equal(new Set(admitted).size,admitted.length,'admitted source capsules must be unique');
for(const id of admitted)assert.ok(roadmapIds.has(id),`unknown admitted capsule ${id}`);
assert.ok(admitted.length<=state.generation,'admitted capsule count cannot exceed generation');
if(state.currentCapsuleId){assert.ok(roadmapIds.has(state.currentCapsuleId));assert.ok(!admitted.includes(state.currentCapsuleId))}
for(const receipt of state.receipts||[]){assert.equal(receipt.canonicalAdmission,false);assert.ok(roadmapIds.has(receipt.capsuleId));assert.ok(Number(receipt.generation)>=1&&Number(receipt.generation)<=state.maxAutonomousGenerations)}
for(const law of ['EXACT_CURRENT_MAIN_REQUIRES_SUCCESSFUL_CANONICAL_PRODUCTION_PROOF','UNPROVEN_OR_RED_PRODUCTION_HEAD_FORCES_OBSERVE_ONLY','AUTONOMOUS_BUILD_MAY_GENERATE_ONLY_BOUNDED_ROADMAP_SOURCE','R240_PLANNING_FANOUT_NEVER_EQUALS_PARALLEL_SOURCE_MUTATION','R164_RETURNED_RESIDUAL_EVIDENCE_DRIVES_PRESSURE_WITHOUT_INFERRED_USER_VALUE','R240_EXACT_SOURCE_PROMOTION_REQUIRES_UNCHANGED_BASE_EXPECTED_HEAD_ALLOWLIST_AND_ALL_GREEN_PROOF','R240_SOURCE_PROMOTION_MUST_DISPATCH_SOLE_CANONICAL_CI_AND_REQUIRE_EXACT_PRODUCTION_SUCCESS','R240_RED_PRODUCTION_STOPS_FUTURE_AUTONOMOUS_GENERATIONS_AND_REQUIRES_FORWARD_REPAIR','R239_HYBRID_RESOURCE_GOVERNOR_REMAINS_SEPARATE_AND_PRESERVED','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'])assert.ok(state.laws.includes(law),`missing ${law}`);
for(const capsule of state.roadmap){assert.match(capsule.id,/^SG00[1-5]$/);assert.match(capsule.target,/^src\/generated\/selfbuildR170\//);assert.ok(['LOW','MEDIUM'].includes(capsule.risk))}
for(const needle of ['attachEvidencePressureR240','planParallelFrontierR240','BLOCKED_BY_RESIDUAL_GATE','PROVED_PENDING_PR','SOURCE_PROMOTED_PENDING_PRODUCTION','canonicalAdmission:false',"schedulerRevision:'R240'",'pressureProvenance'])assert.ok(engine.includes(needle),`engine missing ${needle}`);
assert.ok(!/git\s+push/i.test(engine),'scheduler engine itself has no repository push authority');
assert.ok(!/Math\.random|crypto\.random/i.test(engine),'self-build generation must remain deterministic');
for(const needle of ['api/core-health','api/release-evidence','api/runtime-attestation','api/hybrid/status','UNREACHABLE'])assert.ok(collector.includes(needle));
for(const needle of ['gh run list','headSha','production_ready','OBSERVE_ONLY','prove_successor_workflow_invariants_r175.mjs','r180-living-world-execution-dispatch-invariants.mjs','r179-living-world-durable-authorization-invariants.mjs','R240 EXACT CANDIDATE PASS','R240 exact two-parent source promotion PASS','actions/workflows/ci.yml/dispatches','gh run watch'])assert.ok(workflow.includes(needle),`self-build workflow missing ${needle}`);
assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(workflow),'R170 may not direct-push candidate source to main');
assert.ok(!/gh\s+pr\s+merge/i.test(workflow),'GitHub auto-merge/CLI merge remains unused');
assert.ok(!/gh\s+workflow\s+run/i.test(workflow),'canonical dispatch uses explicit API binding, not recursive CLI fanout');
assert.ok(!/^\s*workflow_run\s*:/m.test(workflow));
assert.match(workflow,/cron: '17 \* \* \* \*'/);
const selectIndex=workflow.indexOf('name: Select next bounded capsule');
const installIndex=workflow.indexOf('name: Prepare candidate proof dependencies');
const preGenerationProofIndex=workflow.indexOf('name: Prove current successor chain before generation');
const generateIndex=workflow.indexOf('name: Generate exactly one sandbox candidate');
assert.ok(selectIndex>0&&installIndex>selectIndex&&preGenerationProofIndex>installIndex&&generateIndex>preGenerationProofIndex,'expensive proof remains proposal-only');
assert.doesNotMatch(workflow.slice(0,selectIndex),/npm install/);
assert.match(workflow.slice(installIndex,preGenerationProofIndex),/if: steps\.select\.outputs\.status == 'PROPOSE'/);
assert.match(workflow.slice(preGenerationProofIndex,generateIndex),/if: steps\.select\.outputs\.status == 'PROPOSE'/);

assert.equal(governor.revision,'R170.5-R240');
assert.equal(governor.engineRevision,'R170.2+R240');
assert.equal(governor.currentCapabilityFloor,'R239');
assert.deepEqual(governor.promotedSuccessorContinuity,['R175','R176','R177','R178','R179','R180']);
assert.deepEqual(governor.postR180ProofContinuity,['R200','R200.1','R202','R210','R223','R236','R237','R238','R239']);
assert.equal(governor.successorWorkflowPolicy.readOnly,true);
assert.equal(governor.successorWorkflowPolicy.mainPushAllowed,false);
assert.equal(governor.successorWorkflowPolicy.recurringScheduleAllowed,false);
assert.equal(governor.successorWorkflowPolicy.autoMergeAllowed,false);
assert.equal(governor.selfBuild.schedule,'17 * * * *');
assert.equal(governor.selfBuild.observationCadence,'HOURLY');
assert.equal(governor.selfBuild.expensiveProofMode,'PROPOSE_ONLY');
assert.equal(governor.selfBuild.recursiveScheduler,'R240');
assert.equal(governor.selfBuild.latestExplicitSuccessorProof,'tests/r239-adaptive-hybrid-resource-governor-invariants.mjs');
assert.equal(governor.selfBuild.directMainMutation,false);
assert.equal(governor.selfBuild.autoMerge,false);
assert.equal(governor.selfBuild.recursiveTriggerChain,false);
assert.equal(governor.selfBuild.highOrCriticalAutoRepair,false);
assert.equal(governor.selfBuild.canonicalAdmissionAuthority,'R125');
assert.equal(governor.selfPromotion.revision,'R240');
assert.equal(governor.selfPromotion.enabled,true);
assert.equal(governor.selfPromotion.exactExpectedHeadMergeRequired,true);
assert.equal(governor.selfPromotion.exactUnchangedBaseRequired,true);
assert.equal(governor.selfPromotion.allowlistedDiffRequired,true);
assert.equal(governor.selfPromotion.githubAutoMergeFeature,false);
assert.equal(governor.selfPromotion.canonicalDeploymentWorkflow,'.github/workflows/ci.yml');
assert.equal(governor.selfPromotion.productionProofRequiredAfterSourceMerge,true);
assert.equal(governor.selfPromotion.canonStateAdmission,false);
assert.equal(governor.selfPromotion.canonicalAdmissionAuthority,'R125');
for(const [key,value] of Object.entries({livingWorldExecutionDispatch:'R180_EXPLICIT_DISPATCH_R147_AUTHORITY',deployedBrowserProof:'R200.1_EXACT_PROMOTED_SHA',operationalSourceAuthority:'R202_READ_ONLY_PROVENANCE_AND_LIFECYCLE_PROJECTION',liveTruthRecovery:'R210_FORWARD_ONLY_REFRESH_AND_RUNTIME_VERSION_REANCHOR',autonomousEvolution:'R223_CLOUD_01_CLOUDFLARE_GITHUB_PORTAL',sourceSpatialControlAttestation:'R236_FAIL_CLOSED_INDEPENDENT_TRUST_BOUNDARY',hybridCommandAuthority:'R237_AUTHENTICATED_BOUNDED_NATIVE_CONTROL',hybridHostIntelligence:'R238_RETURNED_RESOURCE_AND_MACRO_INTEGRITY_PROOF',hybridResourceGovernor:'R239_SELECTED_HOST_PRESSURE_AWARE_ADMISSION_AND_BOUNDED_WORK_SIZING',recursiveSelfBuildAndExactPromotion:'R240_R164_EVIDENCE_BOUND_SPARSE_FRONTIER_PLUS_EXACT_SOURCE_PROMOTION'}))assert.equal(governor.preservedRuntime[key],value);
assert.match(cloudWorkflow,/workflow_dispatch:/);assert.doesNotMatch(cloudWorkflow,/^\s*push\s*:/m);assert.match(cloudWorkflow,/wrangler\.evolution-machine-r223\.jsonc/);assert.match(cloudTest,/merged source advances generations/);

function baseSimulationState(){const copy=JSON.parse(JSON.stringify(state));copy.active=true;copy.generation=0;copy.currentCapsuleId=null;copy.admittedSourceCapsules=[];copy.rejected=[];copy.blocked=[];copy.receipts=[];return copy}
function runEngineSimulation({simState,residual,apply=false}){const root=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r170-selfbuild-'));fs.mkdirSync(path.join(root,'public'),{recursive:true});fs.writeFileSync(path.join(root,'public/omega-r170-selfbuild-state.json'),JSON.stringify(simState,null,2)+'\n');const residualPath=path.join(root,'residual.json');fs.writeFileSync(residualPath,JSON.stringify(residual,null,2)+'\n');const result=spawnSync(process.execPath,[enginePath],{cwd:root,encoding:'utf8',env:{...process.env,OMEGA_R170_RESIDUAL_EVIDENCE_PATH:residualPath,OMEGA_R170_SELFBUILD_APPLY:apply?'1':'0',GITHUB_SHA:'SIMULATED_PRODUCTION_HEAD'}});return{root,result}}
const passResidual={state:'OBSERVED',summary:{blocking:0,review:0,observe:0},residuals:[]};
const first=runEngineSimulation({simState:baseSimulationState(),residual:passResidual,apply:true});
try{assert.equal(first.result.status,0,`generation-1 engine simulation failed: ${first.result.stderr||first.result.stdout}`);const out=JSON.parse(first.result.stdout);assert.equal(out.status,'SANDBOX');assert.equal(out.generation,1);assert.equal(out.capsuleId,'SG001');assert.equal(out.frontier.pressureProvenance,'R164_RETURNED_RESIDUAL_EVIDENCE_PLUS_DEPENDENCY_TOPOLOGY');const next=JSON.parse(fs.readFileSync(path.join(first.root,'public/omega-r170-selfbuild-state.json'),'utf8'));const candidate=JSON.parse(fs.readFileSync(path.join(first.root,'public/omega-r170-selfbuild-candidate.json'),'utf8'));assert.equal(next.generation,1);assert.equal(next.currentCapsuleId,'SG001');assert.equal(next.receipts[0].status,'SANDBOX');assert.equal(next.receipts[0].canonicalAdmission,false);assert.equal(candidate.revision,'R170.2');assert.equal(candidate.schedulerRevision,'R240');assert.equal(candidate.receipt.pressureProvenance,'R164_RETURNED_RESIDUAL_EVIDENCE_PLUS_DEPENDENCY_TOPOLOGY');assert.equal(fs.existsSync(path.join(first.root,'src/generated/selfbuildR170/workflowCapacityModelR170.ts')),true);const waiting=spawnSync(process.execPath,[enginePath],{cwd:first.root,encoding:'utf8',env:{...process.env,OMEGA_R170_RESIDUAL_EVIDENCE_PATH:path.join(first.root,'residual.json'),OMEGA_R170_SELFBUILD_APPLY:'0',GITHUB_SHA:'SIMULATED_PRODUCTION_HEAD'}});assert.equal(JSON.parse(waiting.stdout).status,'WAITING_FOR_GOVERNED_MERGE')}finally{fs.rmSync(first.root,{recursive:true,force:true})}
const critical=runEngineSimulation({simState:baseSimulationState(),residual:{state:'BLOCKED',summary:{blocking:1},residuals:[{id:'SIM_CRITICAL',severity:'CRITICAL',mode:'BLOCK'}]},apply:false});
try{assert.equal(critical.result.status,0);const blocked=JSON.parse(critical.result.stdout);assert.equal(blocked.status,'BLOCKED_BY_RESIDUAL_GATE');assert.equal(blocked.gate.allow,false);assert.deepEqual(blocked.gate.blocking,['SIM_CRITICAL']);assert.equal(fs.existsSync(path.join(critical.root,'src/generated/selfbuildR170/workflowCapacityModelR170.ts')),false)}finally{fs.rmSync(critical.root,{recursive:true,force:true})}

console.log(`R170.5/R239/R240 GOVERNED SELF-BUILD PASS · R239 host resource governor preserved · exact production base gate · R164 evidence-bound sparse scheduling · one bounded generated target · exact expected-head self-promotion contract · canonical ci.yml production proof required · R125 unchanged · generation ${state.generation}/${state.maxAutonomousGenerations}`);

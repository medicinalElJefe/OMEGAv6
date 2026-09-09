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
assert.equal(state.roadmap.length,5);
assert.ok(Number.isInteger(state.generation)&&state.generation>=0&&state.generation<=state.maxAutonomousGenerations,`generation out of governed range: ${state.generation}`);
const roadmapIds=new Set(state.roadmap.map(x=>x.id));
const admitted=Array.isArray(state.admittedSourceCapsules)?state.admittedSourceCapsules:[];
assert.equal(new Set(admitted).size,admitted.length,'admitted source capsules must be unique');
for(const id of admitted)assert.ok(roadmapIds.has(id),`unknown admitted capsule ${id}`);
assert.ok(admitted.length<=state.generation,'admitted capsule count cannot exceed generation');
if(state.currentCapsuleId){assert.ok(roadmapIds.has(state.currentCapsuleId),`unknown current capsule ${state.currentCapsuleId}`);assert.ok(!admitted.includes(state.currentCapsuleId),'current capsule cannot already be admitted')}
for(const receipt of state.receipts||[]){assert.equal(receipt.canonicalAdmission,false,'self-build receipt may never claim Canon admission');assert.ok(roadmapIds.has(receipt.capsuleId),`receipt references unknown capsule ${receipt.capsuleId}`);assert.ok(Number(receipt.generation)>=1&&Number(receipt.generation)<=state.maxAutonomousGenerations,`receipt generation out of range ${receipt.generation}`)}
for(const law of ['EXACT_CURRENT_MAIN_REQUIRES_SUCCESSFUL_PRODUCTION_CLOUD_BRIDGE_PUSH_PROOF','UNPROVEN_OR_RED_PRODUCTION_HEAD_FORCES_OBSERVE_ONLY','AUTONOMOUS_BUILD_MAY_PROPOSE_SOURCE_BUT_MAY_NOT_MUTATE_MAIN_DIRECTLY','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY','HIGH_OR_CRITICAL_RESIDUALS_BLOCK_AUTONOMOUS_CANDIDATE_GENERATION','NO_RECURSIVE_PUSH_OR_WORKFLOW_RUN_TRIGGER_CHAIN','CURRENT_READ_ONLY_SUCCESSOR_CHAIN_MUST_PROVE_BEFORE_AUTONOMOUS_CANDIDATE'])assert.ok(state.laws.includes(law),`missing ${law}`);
for(const capsule of state.roadmap){assert.match(capsule.id,/^SG00[1-5]$/);assert.match(capsule.target,/^src\/generated\/selfbuildR170\//);assert.ok(['LOW','MEDIUM'].includes(capsule.risk))}
assert.match(engine,/BLOCKED_BY_RESIDUAL_GATE/);assert.match(engine,/PROVED_PENDING_PR/);assert.match(engine,/canonicalAdmission:false/);assert.match(engine,/revision:'R170\.2'/);assert.ok(!/git\s+push/i.test(engine));assert.ok(!/Math\.random|crypto\.random/i.test(engine));
for(const needle of ['api/core-health','api/release-evidence','api/runtime-attestation','api/hybrid/status','UNREACHABLE'])assert.ok(collector.includes(needle));
for(const needle of ['gh run list','headSha','production_ready','OBSERVE_ONLY','prove_successor_workflow_invariants_r175.mjs','r180-living-world-execution-dispatch-invariants.mjs','r179-living-world-durable-authorization-invariants.mjs'])assert.ok(workflow.includes(needle),`self-build workflow missing ${needle}`);
assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(workflow));assert.ok(!/gh\s+pr\s+merge/i.test(workflow));assert.ok(!/gh\s+workflow\s+run/i.test(workflow));assert.ok(!/^\s*workflow_run\s*:/m.test(workflow));
assert.match(workflow,/cron: '17 \* \* \* \*'/,'governed self-build must observe hourly at minute 17');
const selectIndex=workflow.indexOf('name: Select next bounded capsule');
const installIndex=workflow.indexOf('name: Prepare candidate proof dependencies');
const preGenerationProofIndex=workflow.indexOf('name: Prove current successor chain before generation');
const generateIndex=workflow.indexOf('name: Generate exactly one sandbox candidate');
assert.ok(selectIndex>0&&installIndex>selectIndex&&preGenerationProofIndex>installIndex&&generateIndex>preGenerationProofIndex,'expensive proof must run only after PROPOSE selection and before generation');
assert.doesNotMatch(workflow.slice(0,selectIndex),/npm install/,'idle observation path must not install project dependencies');
const installBlock=workflow.slice(installIndex,preGenerationProofIndex);
assert.match(installBlock,/if: steps\.select\.outputs\.status == 'PROPOSE'/,'dependency install must be PROPOSE-only');
const preGenerationBlock=workflow.slice(preGenerationProofIndex,generateIndex);
assert.match(preGenerationBlock,/if: steps\.select\.outputs\.status == 'PROPOSE'/,'successor proof must be PROPOSE-only');
assert.equal(governor.revision,'R170.4');assert.equal(governor.engineRevision,'R170.2');
assert.equal(governor.successorWorkflowPolicy.readOnly,true);assert.equal(governor.successorWorkflowPolicy.mainPushAllowed,false);assert.equal(governor.successorWorkflowPolicy.recurringScheduleAllowed,false);assert.equal(governor.successorWorkflowPolicy.dynamicProofRunner,'scripts/prove_successor_workflow_invariants_r175.mjs');
assert.equal(governor.currentCapabilityFloor,'R238');assert.deepEqual(governor.promotedSuccessorContinuity,['R175','R176','R177','R178','R179','R180']);assert.deepEqual(governor.postR180ProofContinuity,['R200','R200.1','R202','R210','R223','R236','R237','R238']);
assert.equal(governor.selfBuild.schedule,'17 * * * *');assert.equal(governor.selfBuild.observationCadence,'HOURLY');assert.equal(governor.selfBuild.expensiveProofMode,'PROPOSE_ONLY');assert.equal(governor.selfBuild.latestExplicitSuccessorProof,'tests/r238-hybrid-host-intelligence-invariants.mjs');assert.equal(governor.selfBuild.cloudEvolutionMachine,'CLOUD-01');assert.equal(governor.selfBuild.cloudEvolutionHost,'CLOUDFLARE_WORKER');
assert.equal(governor.selfBuild.directMainMutation,false);assert.equal(governor.selfBuild.autoMerge,false);assert.equal(governor.selfBuild.recursiveTriggerChain,false);assert.equal(governor.selfBuild.highOrCriticalAutoRepair,false);assert.equal(governor.selfBuild.canonicalAdmissionAuthority,'R125');
assert.equal(governor.preservedRuntime.livingWorldExecutionAuthorization,'R179_AUTHORIZED_NOT_DISPATCHED');assert.equal(governor.preservedRuntime.livingWorldExecutionDispatch,'R180_EXPLICIT_DISPATCH_R147_AUTHORITY');assert.equal(governor.preservedRuntime.deployedBrowserProof,'R200.1_EXACT_PROMOTED_SHA');assert.equal(governor.preservedRuntime.operationalSourceAuthority,'R202_READ_ONLY_PROVENANCE_AND_LIFECYCLE_PROJECTION');assert.equal(governor.preservedRuntime.liveTruthRecovery,'R210_FORWARD_ONLY_REFRESH_AND_RUNTIME_VERSION_REANCHOR');assert.equal(governor.preservedRuntime.autonomousEvolution,'R223_CLOUD_01_CLOUDFLARE_GITHUB_PORTAL');assert.equal(governor.preservedRuntime.sourceSpatialControlAttestation,'R236_FAIL_CLOSED_INDEPENDENT_TRUST_BOUNDARY');assert.equal(governor.preservedRuntime.hybridCommandAuthority,'R237_AUTHENTICATED_BOUNDED_NATIVE_CONTROL');assert.equal(governor.preservedRuntime.hybridHostIntelligence,'R238_RETURNED_RESOURCE_AND_MACRO_INTEGRITY_PROOF');
assert.match(cloudWorkflow,/workflow_dispatch:/);assert.doesNotMatch(cloudWorkflow,/^\s*push\s*:/m);assert.match(cloudWorkflow,/wrangler\.evolution-machine-r223\.jsonc/);assert.match(cloudTest,/merged source advances generations/);

function baseSimulationState(){const copy=JSON.parse(JSON.stringify(state));copy.active=true;copy.generation=0;copy.currentCapsuleId=null;copy.admittedSourceCapsules=[];copy.rejected=[];copy.blocked=[];copy.receipts=[];return copy;}
function runEngineSimulation({simState,residual,apply=false}){const root=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r170-selfbuild-'));fs.mkdirSync(path.join(root,'public'),{recursive:true});fs.writeFileSync(path.join(root,'public/omega-r170-selfbuild-state.json'),JSON.stringify(simState,null,2)+'\n');const residualPath=path.join(root,'residual.json');fs.writeFileSync(residualPath,JSON.stringify(residual,null,2)+'\n');const result=spawnSync(process.execPath,[enginePath],{cwd:root,encoding:'utf8',env:{...process.env,OMEGA_R170_RESIDUAL_EVIDENCE_PATH:residualPath,OMEGA_R170_SELFBUILD_APPLY:apply?'1':'0',GITHUB_SHA:'SIMULATED_PRODUCTION_HEAD'}});return{root,result};}
const passResidual={state:'OBSERVED',summary:{blocking:0},residuals:[]};
const first=runEngineSimulation({simState:baseSimulationState(),residual:passResidual,apply:true});
try{assert.equal(first.result.status,0,`generation-1 engine simulation failed: ${first.result.stderr||first.result.stdout}`);const firstOutput=JSON.parse(first.result.stdout);assert.equal(firstOutput.status,'SANDBOX');assert.equal(firstOutput.generation,1);assert.equal(firstOutput.capsuleId,'SG001');const nextState=JSON.parse(fs.readFileSync(path.join(first.root,'public/omega-r170-selfbuild-state.json'),'utf8'));const candidate=JSON.parse(fs.readFileSync(path.join(first.root,'public/omega-r170-selfbuild-candidate.json'),'utf8'));assert.equal(nextState.generation,1);assert.equal(nextState.currentCapsuleId,'SG001');assert.equal(nextState.receipts.length,1);assert.equal(nextState.receipts[0].canonicalAdmission,false);assert.equal(nextState.receipts[0].status,'SANDBOX');assert.equal(candidate.revision,'R170.2');assert.equal(candidate.receipt.canonicalAdmission,false);assert.equal(candidate.receipt.generation,1);assert.equal(fs.existsSync(path.join(first.root,'src/generated/selfbuildR170/workflowCapacityModelR170.ts')),true,'generation 1 must create only SG001 target');const waiting=spawnSync(process.execPath,[enginePath],{cwd:first.root,encoding:'utf8',env:{...process.env,OMEGA_R170_RESIDUAL_EVIDENCE_PATH:path.join(first.root,'residual.json'),OMEGA_R170_SELFBUILD_APPLY:'0',GITHUB_SHA:'SIMULATED_PRODUCTION_HEAD'}});assert.equal(waiting.status,0);const waitingOutput=JSON.parse(waiting.stdout);assert.equal(waitingOutput.status,'WAITING_FOR_GOVERNED_MERGE');assert.equal(waitingOutput.capsuleId,'SG001');assert.equal(waitingOutput.generation,1);}finally{fs.rmSync(first.root,{recursive:true,force:true})}
const critical=runEngineSimulation({simState:baseSimulationState(),residual:{state:'BLOCKED',residuals:[{id:'SIM_CRITICAL',severity:'CRITICAL',mode:'BLOCK'}]},apply:false});
try{assert.equal(critical.result.status,0,`critical residual simulation failed: ${critical.result.stderr||critical.result.stdout}`);const blocked=JSON.parse(critical.result.stdout);assert.equal(blocked.status,'BLOCKED_BY_RESIDUAL_GATE');assert.equal(blocked.gate.allow,false);assert.deepEqual(blocked.gate.blocking,['SIM_CRITICAL']);assert.equal(fs.existsSync(path.join(critical.root,'src/generated/selfbuildR170/workflowCapacityModelR170.ts')),false,'critical residual must block generation');const blockedState=JSON.parse(fs.readFileSync(path.join(critical.root,'public/omega-r170-selfbuild-state.json'),'utf8'));assert.equal(blockedState.generation,0);assert.equal(blockedState.currentCapsuleId,null);assert.equal(blockedState.receipts.length,0);}finally{fs.rmSync(critical.root,{recursive:true,force:true})}
console.log(`R170.4/R238 GOVERNED SELF-BUILD INVARIANTS PASS · R180 dispatch preserved · capability/proof floor advanced through R238 · R223 remains CLOUD-01 evolution authority · generation ${state.generation}/${state.maxAutonomousGenerations} · admitted ${admitted.length} · legacy generation simulation PASS · critical-residual fail-close PASS`);

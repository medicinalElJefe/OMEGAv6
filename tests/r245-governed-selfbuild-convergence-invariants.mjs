import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDevelopmentResidualGraphR164} from '../src/system/developmentResidualGraphR164.js';
import {R170_CANDIDATE_POLICY_SCHEMA,R170_RESIDUAL_POLICY_SCHEMA,R245_CAPSULE_GENERATOR_REVISION,R245_GOVERNED_SELFBUILD_CONTRACT,capsuleBodyR245,deriveResidualGateR245,isAutonomousCandidateBranchR245,validateAutonomousCandidatePolicyR245,validateResidualPolicyR245} from '../src/system/governedSelfBuildContractR245.js';
import {planGovernedCandidateR245} from '../scripts/lib/r245-governed-selfbuild-selection.mjs';
import {deriveResidualGate as deriveCloudResidualGate,selectCapsule as selectCloudCapsule} from '../cloudflare/lib/evolution-policy.mjs';
import {capsuleBody as cloudCapsuleBody} from '../cloudflare/lib/generated-capsules.mjs';

const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const engine=fs.readFileSync('scripts/r170-selfbuild-engine.mjs','utf8');
const cloudPolicy=fs.readFileSync('cloudflare/lib/evolution-policy.mjs','utf8');
const cloudMachine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/r170-governed-selfbuild.yml','utf8');
const cloudWorkflow=fs.readFileSync('.github/workflows/r223-cloudflare-evolution.yml','utf8');

assert.equal(R245_GOVERNED_SELFBUILD_CONTRACT,'OMEGA_GOVERNED_SELFBUILD_CONTRACT_R245');
assert.equal(R245_CAPSULE_GENERATOR_REVISION,'R245_SHARED_CANONICAL_GENERATOR');
assert.equal(state.residualPolicy?.schema,R170_RESIDUAL_POLICY_SCHEMA);
assert.equal(state.autonomousCandidatePolicy?.schema,R170_CANDIDATE_POLICY_SCHEMA);
const residualPolicy=validateResidualPolicyR245(state.residualPolicy);
assert.equal(residualPolicy.valid,true,`canonical residual policy invalid: ${residualPolicy.reasons.join(',')}`);
assert.deepEqual(residualPolicy.policy.blockSeverities,['HIGH','CRITICAL']);
assert.deepEqual(residualPolicy.policy.blockModes,['BLOCK']);
assert.equal(residualPolicy.policy.highOrCriticalAutoRepair,false);
assert.equal(residualPolicy.policy.canonicalMutation,false);
assert.equal(residualPolicy.policy.canonicalAdmission,false);
assert.equal(residualPolicy.policy.canonicalAdmissionAuthority,'R125');
const candidatePolicy=validateAutonomousCandidatePolicyR245(state.autonomousCandidatePolicy);
assert.equal(candidatePolicy.valid,true,`canonical candidate policy invalid: ${candidatePolicy.reasons.join(',')}`);
assert.equal(candidatePolicy.policy.maxOpenCandidatePrs,1);
assert.equal(candidatePolicy.policy.crossMachineFence,true);
assert.ok(isAutonomousCandidateBranchR245('selfbuild/r170-g1-sg001-1',candidatePolicy.policy));
assert.ok(isAutonomousCandidateBranchR245('cloud/evolution-g1-sg001-deadbeef',candidatePolicy.policy));
assert.equal(isAutonomousCandidateBranchR245('feature/unrelated',candidatePolicy.policy),false);

assert.equal(deriveResidualGateR245(null,state.residualPolicy).allow,false,'missing residual evidence must fail closed');
assert.equal(deriveResidualGateR245({state:'HEALTHY',residuals:[]},{}).allow,false,'missing/invalid canonical residual policy must fail closed');
const medium={schema:'OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164',state:'RESIDUALS_PRESENT',summary:{blocking:0,review:0,observe:1},residuals:[{id:'MEDIUM',severity:'MEDIUM',mode:'OBSERVE_ONLY'}]};
const high={schema:'OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164',state:'RESIDUALS_PRESENT',summary:{blocking:0,review:1,observe:0},residuals:[{id:'HIGH',severity:'HIGH',mode:'QUEUE_FOR_REVIEW'}]};
const critical={schema:'OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164',state:'BLOCKED',summary:{blocking:1,review:0,observe:0},residuals:[{id:'CRITICAL',severity:'CRITICAL',mode:'BLOCK'}]};
assert.equal(deriveResidualGateR245(medium,state.residualPolicy).allow,true,'MEDIUM/OBSERVE remains evidence pressure, not an autonomous source blocker');
assert.equal(deriveResidualGateR245(high,state.residualPolicy).allow,false,'HIGH residual must block autonomous source generation even when R164 mode is review');
assert.equal(deriveResidualGateR245(critical,state.residualPolicy).allow,false,'CRITICAL/BLOCK must block autonomous source generation');
assert.equal(deriveResidualGateR245({schema:'OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164',state:'BLOCKED',residuals:[]},state.residualPolicy).allow,false,'BLOCKED R164 graph state must fail closed independently of row shape');

const liveRuntime={coreHealth:{ok:true,state:'LIVE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'},releaseEvidence:{source:{sha:'A'}},runtimeAttestation:{source:{sha:'A'}},hybrid:{nativeExecutionClaimed:false,devices:[]}};
const liveGraph=buildDevelopmentResidualGraphR164({runtimeEvidence:liveRuntime});
assert.equal(liveGraph.state,'RESIDUALS_PRESENT');
assert.equal(liveGraph.residuals.some(r=>r.id==='R164-HYBRID-DEVICE-PROOF-REQUIRED'&&r.severity==='MEDIUM'&&r.mode==='OBSERVE_ONLY'),true);
assert.equal(deriveResidualGateR245(liveGraph,state.residualPolicy).allow,true,'offline optional Hybrid proof must not erase production-capable Worker self-build');
assert.equal(deriveCloudResidualGate(liveRuntime,state).allow,true,'CLOUD-01 and R170 must apply the same canonical residual gate');
const mismatchRuntime={...liveRuntime,releaseEvidence:{source:{sha:'A'}},runtimeAttestation:{source:{sha:'B'}}};
const mismatchGraph=buildDevelopmentResidualGraphR164({runtimeEvidence:mismatchRuntime});
assert.equal(mismatchGraph.residuals.some(r=>r.id==='R164-DEPLOYMENT-SOURCE-MISMATCH'&&r.severity==='HIGH'),true);
assert.equal(deriveResidualGateR245(mismatchGraph,state.residualPolicy).allow,false);
assert.equal(deriveCloudResidualGate(mismatchRuntime,state).allow,false,'CLOUD-01 may not use its former weaker SHA-only residual shortcut');

const fresh={...state,generation:0,currentCapsuleId:null,admittedSourceCapsules:[],receipts:[],selfBuildScars:[]};
const first=planGovernedCandidateR245({state:fresh,evidence:liveGraph});
assert.equal(first.state,'PROPOSE');
assert.equal(first.capsule.id,'SG001');
assert.equal(first.woven.sourceMutationCandidateId,'SG001');
assert.equal(selectCloudCapsule(fresh,liveGraph)?.id,'SG001','CLOUD-01 must select the same R240/R243 source candidate');
const afterOne={...fresh,generation:1,admittedSourceCapsules:['SG001']};
const second=planGovernedCandidateR245({state:afterOne,evidence:liveGraph});
assert.equal(second.state,'PROPOSE');
assert.equal(second.capsule.id,'SG002');
assert.equal(selectCloudCapsule(afterOne,liveGraph)?.id,'SG002');

for(const id of ['SG001','SG002','SG003','SG004','SG005']){
 const canonical=capsuleBodyR245(id);
 assert.equal(cloudCapsuleBody(id),canonical,`${id} must be byte-identical across R170 and CLOUD-01 generation`);
 assert.match(canonical,/R245_SHARED_CANONICAL_GENERATOR/);
}
const sg004=capsuleBodyR245('SG004');
for(const status of ['GENERATED_PENDING_PROOF','SANDBOX','PROVED_PENDING_PR','SOURCE_PROMOTED_PENDING_PRODUCTION','SOURCE_MERGE_OBSERVED','REJECTED'])assert.ok(sg004.includes(status),`SG004 missing unified lifecycle ${status}`);
const sg003=capsuleBodyR245('SG003');
assert.match(sg003,/ResidualPolicy/);
assert.match(sg003,/policy\.blockModes\.includes\(x\.mode\)\|\|policy\.blockSeverities\.includes\(x\.severity\)/,'generated residual projection must receive policy rather than freeze a separate threshold law');

assert.match(engine,/planGovernedCandidateR245/);
assert.match(engine,/deriveResidualGateR245/);
assert.match(engine,/capsuleBodyR245/);
assert.doesNotMatch(engine,/const\s+modules\s*=\s*\{/,'R170 may not retain a second generated capsule table');
assert.doesNotMatch(engine,/function\s+residualGate\s*\(/,'R170 may not retain a second residual threshold function');
assert.match(cloudPolicy,/planGovernedCandidateR245/);
assert.match(cloudPolicy,/deriveResidualGateR245/);
assert.match(cloudPolicy,/buildDevelopmentResidualGraphR164/);
assert.doesNotMatch(cloudPolicy,/if\s*\(!\(coreHealth\?\.ok===true/,'CLOUD-01 may not retain its former independent residual gate');
assert.match(cloudMachine,/validateAutonomousCandidatePolicyR245/);
assert.match(cloudMachine,/isAutonomousCandidateBranchR245/);
assert.match(cloudMachine,/HELD_FOR_R170_CANDIDATE/);
assert.match(cloudMachine,/multiple open governed autonomous candidate PRs/);
assert.match(workflow,/autonomousCandidatePolicy/,'R170 workflow must consume canonical cross-machine PR policy');
assert.match(workflow,/cloud\/evolution-/,'R170 workflow must fence CLOUD-01 candidates too');
assert.match(workflow,/r245-governed-selfbuild-convergence-invariants\.mjs/,'R170 candidate proof must re-prove the shared contract');
assert.match(cloudWorkflow,/r245-governed-selfbuild-convergence-invariants\.mjs/,'CLOUD-01 proof must re-prove the shared contract');
assert.doesNotMatch(cloudWorkflow,/^\s*push\s*:/m);
assert.equal(state.residualPolicy.canonicalMutation,false);
assert.equal(state.residualPolicy.canonicalAdmission,false);

console.log('R245 GOVERNED SELF-BUILD CONVERGENCE PASS · one R164 residual policy · one R240/R243 candidate selection law · one deterministic SG001–SG005 generator · one R170/CLOUD-01 open-candidate fence · R125/R141/R146/R147/R239/R240 and ci.yml authority preserved');

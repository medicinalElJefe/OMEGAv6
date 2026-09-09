import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUTHORITY_BOUNDARIES,MACHINE_ID,classifyHeldCandidates,decideCycle,reconcileObservedSource,selectCapsule} from '../cloudflare/lib/evolution-policy.mjs';

assert.equal(MACHINE_ID,'CLOUD-01');
assert.equal(AUTHORITY_BOUNDARIES.evolutionHost,'CLOUDFLARE_WORKER');
assert.equal(AUTHORITY_BOUNDARIES.canonAdmission,'R125');
assert.equal(AUTHORITY_BOUNDARIES.dispatch,'R147');
assert.equal(AUTHORITY_BOUNDARIES.durableHistory,'R146');
assert.equal(AUTHORITY_BOUNDARIES.hybridReturnProof,'R141');
assert.equal(AUTHORITY_BOUNDARIES.productionDeploymentWorkflow,'ci.yml');
assert.deepEqual([...AUTHORITY_BOUNDARIES.retiredDurableObjects],['R201','R203']);

const canonicalState=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
assert.equal(canonicalState.residualPolicy?.sourceAuthority,'R164');
assert.deepEqual(canonicalState.residualPolicy?.blockSeverities,['HIGH','CRITICAL']);
assert.deepEqual(canonicalState.autonomousCandidatePolicy?.branchPrefixes,['selfbuild/r170-','cloud/evolution-']);

const held=classifyHeldCandidates({currentMainSha:'NEW',candidates:[{receipt:{baseSha:'OLD'},branch:'old'},{receipt:{baseSha:'NEW'},branch:'exact'}]});
assert.equal(held.exact.length,1);
assert.equal(held.stale.length,1);

const state={active:true,generation:1,currentCapsuleId:'SG001',admittedSourceCapsules:[],maxParallelPlanningCells:12,selfBuildScars:[],residualPolicy:canonicalState.residualPolicy,autonomousCandidatePolicy:canonicalState.autonomousCandidatePolicy,roadmap:[
  {id:'SG001',title:'Workflow capacity model',objective:'model capacity',target:'src/generated/selfbuildR170/workflowCapacityModelR170.ts',risk:'LOW',expectedGain:.9,complexity:.2,contradictionRisk:.05,prerequisites:[]},
  {id:'SG002',title:'Deployment convergence receipt',objective:'model deployment convergence',target:'src/generated/selfbuildR170/deploymentConvergenceReceiptR170.ts',risk:'LOW',expectedGain:.99,complexity:.2,contradictionRisk:.05,prerequisites:['SG001']},
]};
const reconciled=reconcileObservedSource(state,new Set(['src/generated/selfbuildR170/workflowCapacityModelR170.ts']));
assert.deepEqual(reconciled.admittedSourceCapsules,['SG001'],'merged target must become admitted source continuity');
assert.equal(reconciled.currentCapsuleId,null,'merged current capsule must clear so the cycle advances');

const liveEvidence={coreHealth:{ok:true,state:'LIVE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'},releaseEvidence:{source:{sha:'A'}},runtimeAttestation:{source:{sha:'A'}},hybrid:{nativeExecutionClaimed:false,devices:[]}};
assert.equal(selectCapsule(reconciled,liveEvidence).id,'SG002','CLOUD-01 must use shared R240/R243 selection after observed merge');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:true,state:{...reconciled,generation:1},candidates:[{receipt:{baseSha:'OLD'}}],evidence:liveEvidence}).action,'PROPOSE');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:false,state:reconciled,candidates:[],evidence:liveEvidence}).action,'OBSERVE_ONLY');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:true,state:reconciled,candidates:[{receipt:{baseSha:'A'}}],evidence:liveEvidence}).action,'OBSERVE_ONLY');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:true,state:reconciled,candidates:[],evidence:{...liveEvidence,coreHealth:{ok:false,state:'UNPROVEN',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'}}}).action,'OBSERVE_ONLY');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:true,state:reconciled,candidates:[],evidence:{...liveEvidence,runtimeAttestation:{source:{sha:'B'}}}}).action,'OBSERVE_ONLY','HIGH deployment mismatch must block CLOUD-01 through shared R164 policy');

const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
const policy=fs.readFileSync('cloudflare/lib/evolution-policy.mjs','utf8');
const generated=fs.readFileSync('cloudflare/lib/generated-capsules.mjs','utf8');
const worker=fs.readFileSync('cloudflare/workerR223.js','utf8');
const config=fs.readFileSync('wrangler.evolution-machine-r223.jsonc','utf8');
const manifest=JSON.parse(fs.readFileSync('cloudflare/omega-cloud-machine.json','utf8'));
const workflow=fs.readFileSync('.github/workflows/r223-cloudflare-evolution.yml','utf8');
assert.match(machine,/cloud\/evolution-/,'CLOUD-01 must isolate its generated source branch namespace');
assert.match(machine,/candidate\?\.receipt\?\.baseSha/,'promotion must bind original candidate base receipt');
assert.match(machine,/head_sha=\$\{headSha\}.*event=pull_request/,'proof lookup must bind exact PR head');
assert.match(machine,/sha:headSha,merge_method:'merge'/,'merge must use expected-head locking');
assert.match(machine,/main drifted during promotion gate/,'main must be rechecked immediately before merge');
assert.match(machine,/isAutonomousCandidateBranchR245/,'CLOUD-01 must enforce the shared cross-machine candidate fence');
assert.match(machine,/HELD_FOR_R170_CANDIDATE/,'CLOUD-01 must hold when the GitHub R170 machine owns the one candidate slot');
assert.match(machine,/multiple open governed autonomous candidate PRs/);
assert.doesNotMatch(machine,/wrangler\s+deploy|CLOUDFLARE_API_TOKEN/,'evolution machine may not possess production deployment credentials');
assert.match(policy,/buildDevelopmentResidualGraphR164/);
assert.match(policy,/deriveResidualGateR245/);
assert.match(policy,/planGovernedCandidateR245/);
assert.doesNotMatch(policy,/if\s*\(!\(coreHealth\?\.ok===true/,'old independent CLOUD-01 residual threshold gate must be gone');
assert.match(generated,/R245_CAPSULE_BODIES/);
assert.match(generated,/capsuleBodyR245/);
assert.doesNotMatch(generated,/const\s+header=/,'CLOUD-01 may not retain a second generated capsule template table');
assert.match(worker,/async scheduled/,'Cloudflare machine must run from a native scheduled event');
assert.match(worker,/OMEGA_GITHUB_TOKEN_REQUIRED/,'GitHub write credential remains secret-bound');
assert.match(worker,/OMEGA_CRON_SECRET/,'manual trigger surface must be secret-bound');
assert.match(config,/"name": "omega-evolution-machine-r223"/);
assert.match(config,/"crons": \["17 \* \* \* \*"\]/);
assert.equal(manifest.singleton,true);
assert.equal(manifest.id,'CLOUD-01');
assert.equal(manifest.authority.productionDeployment,'ci.yml');
assert.match(workflow,/workflow_dispatch:/,'CLOUD-01 provisioning must be explicit infrastructure setup, not another main-push authority');
assert.doesNotMatch(workflow,/^\s*push\s*:/m,'CLOUD-01 provisioning workflow may not become a second main-push deployment authority');
assert.match(workflow,/wrangler\.evolution-machine-r223\.jsonc/);
assert.match(workflow,/r245-governed-selfbuild-convergence-invariants\.mjs/);
assert.match(workflow,/OMEGA_EVOLUTION_GITHUB_TOKEN/,'Cloudflare Worker GitHub credential must remain external secret state');
assert.match(workflow,/wrangler secret put OMEGA_GITHUB_TOKEN/,'provisioning must bind GitHub credential as encrypted Worker secret');
assert.match(workflow,/openssl rand -hex 32/,'manual-trigger secret must be generated, not committed');

console.log('R223/R245 CLOUDFLARE EVOLUTION PASS · CLOUD-01 singleton · shared R164 residual policy · shared R240/R243 selection · shared deterministic generator · cross-machine one-candidate fence · exact-head proof-gated merge · ci.yml sole canonical production writer · R125/R147/R146/R141 preserved');

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

const held=classifyHeldCandidates({currentMainSha:'NEW',candidates:[{receipt:{baseSha:'OLD'},branch:'old'},{receipt:{baseSha:'NEW'},branch:'exact'}]});
assert.equal(held.exact.length,1);
assert.equal(held.stale.length,1);

const state={active:true,generation:1,currentCapsuleId:'SG001',admittedSourceCapsules:[],roadmap:[
  {id:'SG001',target:'src/generated/selfbuildR170/workflowCapacityModelR170.ts',risk:'LOW',expectedGain:.9,complexity:.2,contradictionRisk:.05,prerequisites:[]},
  {id:'SG002',target:'src/generated/selfbuildR170/deploymentConvergenceReceiptR170.ts',risk:'LOW',expectedGain:.99,complexity:.2,contradictionRisk:.05,prerequisites:['SG001']},
]};
const reconciled=reconcileObservedSource(state,new Set(['src/generated/selfbuildR170/workflowCapacityModelR170.ts']));
assert.deepEqual(reconciled.admittedSourceCapsules,['SG001'],'merged target must become admitted source continuity');
assert.equal(reconciled.currentCapsuleId,null,'merged current capsule must clear so the cycle advances');
assert.equal(selectCapsule(reconciled).id,'SG002','next dependency-ready capsule must advance after observed merge');

const liveEvidence={coreHealth:{ok:true,state:'LIVE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'},releaseEvidence:{source:{sha:'A'}},runtimeAttestation:{source:{sha:'A'}},hybrid:{nativeExecutionClaimed:false}};
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:true,state:{...reconciled,generation:1},candidates:[{receipt:{baseSha:'OLD'}}],evidence:liveEvidence}).action,'PROPOSE');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:false,state:reconciled,candidates:[],evidence:liveEvidence}).action,'OBSERVE_ONLY');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:true,state:reconciled,candidates:[{receipt:{baseSha:'A'}}],evidence:liveEvidence}).action,'OBSERVE_ONLY');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:true,state:reconciled,candidates:[],evidence:{...liveEvidence,coreHealth:{ok:false,state:'UNPROVEN',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'}}}).action,'OBSERVE_ONLY');

const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
const worker=fs.readFileSync('cloudflare/workerR223.js','utf8');
const config=fs.readFileSync('wrangler.evolution-machine-r223.jsonc','utf8');
const manifest=JSON.parse(fs.readFileSync('cloudflare/omega-cloud-machine.json','utf8'));
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
assert.match(machine,/cloud\/evolution-/,'CLOUD-01 must isolate generated source branches');
assert.match(machine,/candidate\?\.receipt\?\.baseSha/,'promotion must bind original candidate base receipt');
assert.match(machine,/head_sha=\$\{headSha\}.*event=pull_request/,'proof lookup must bind exact PR head');
assert.match(machine,/sha:headSha,merge_method:'merge'/,'merge must use expected-head locking');
assert.match(machine,/main drifted during promotion gate/,'main must be rechecked immediately before merge');
assert.doesNotMatch(machine,/wrangler\s+deploy|CLOUDFLARE_API_TOKEN/,'evolution machine may not possess production deployment credentials');
assert.match(worker,/async scheduled/,'Cloudflare machine must run from a native scheduled event');
assert.match(worker,/OMEGA_GITHUB_TOKEN_REQUIRED/,'GitHub write credential remains secret-bound');
assert.match(worker,/OMEGA_CRON_SECRET/,'manual trigger surface must be secret-bound');
assert.match(config,/"name": "omega-evolution-machine-r223"/);
assert.match(config,/"crons": \["17 \* \* \* \*"\]/);
assert.equal(manifest.singleton,true);
assert.equal(manifest.id,'CLOUD-01');
assert.equal(manifest.authority.productionDeployment,'ci.yml');
assert.match(ci,/wrangler\.evolution-machine-r223\.jsonc/,'canonical CI must own ancillary CLOUD-01 deployment');
assert.match(ci,/Deploy CLOUD-01 evolution Worker/,'CLOUD-01 deployment must remain inside canonical main-push authority');

console.log('R223 CLOUDFLARE EVOLUTION PASS · CLOUD-01 singleton · native hourly Cloudflare pulse · stale branches do not deadlock · merged source advances generations · exact-head proof-gated merge · ci.yml sole production deployment authority · R125/R147/R146/R141 preserved');

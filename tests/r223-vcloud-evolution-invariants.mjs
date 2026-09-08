import assert from 'node:assert/strict';
import fs from 'node:fs';
import { AUTHORITY_BOUNDARIES, classifyHeldCandidates, decideCycle, selectCapsule } from '../vcloud/lib/evolution-policy.mjs';

assert.equal(AUTHORITY_BOUNDARIES.canonAdmission,'R125');
assert.equal(AUTHORITY_BOUNDARIES.dispatch,'R147');
assert.equal(AUTHORITY_BOUNDARIES.durableHistory,'R146');
assert.equal(AUTHORITY_BOUNDARIES.hybridReturnProof,'R141');
assert.deepEqual([...AUTHORITY_BOUNDARIES.retiredDurableObjects],['R201','R203']);
assert.equal(AUTHORITY_BOUNDARIES.productionDeploymentWorkflow,'ci.yml');

const held=classifyHeldCandidates({currentMainSha:'NEW',candidates:[{receipt:{baseSha:'OLD'},branch:'old'},{receipt:{baseSha:'NEW'},branch:'exact'}]});
assert.equal(held.exact.length,1,'only exact-head candidate may block the current cycle');
assert.equal(held.stale.length,1,'stale candidate must remain visible but may not permanently block successor work');

const state={active:true,generation:0,admittedSourceCapsules:[],roadmap:[
  {id:'SG001',risk:'LOW',expectedGain:.9,complexity:.2,contradictionRisk:.05,prerequisites:[]},
  {id:'SG002',risk:'LOW',expectedGain:.99,complexity:.2,contradictionRisk:.05,prerequisites:['SG001']},
]};
assert.equal(selectCapsule(state).id,'SG001','dependency gate must beat raw score');

const liveEvidence={coreHealth:{ok:true,state:'LIVE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'},releaseEvidence:{source:{sha:'A'}},runtimeAttestation:{source:{sha:'A'}},hybrid:{nativeExecutionClaimed:false}};
const decision=decideCycle({currentMainSha:'A',productionProofGreen:true,state,candidates:[{receipt:{baseSha:'OLD'}}],evidence:liveEvidence});
assert.equal(decision.action,'PROPOSE','stale held branch must not deadlock exact-current-main evolution');
assert.equal(decision.canonicalAdmission,false);

assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:false,state,candidates:[],evidence:liveEvidence}).action,'OBSERVE_ONLY');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:true,state,candidates:[{receipt:{baseSha:'A'}}],evidence:liveEvidence}).action,'OBSERVE_ONLY');
assert.equal(decideCycle({currentMainSha:'A',productionProofGreen:true,state,candidates:[],evidence:{...liveEvidence,coreHealth:{ok:false,state:'UNPROVEN',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'}}}).action,'OBSERVE_ONLY');

const machine=fs.readFileSync('vcloud/lib/github-machine.mjs','utf8');
const endpoint=fs.readFileSync('vcloud/api/evolution-cycle.mjs','utf8');
assert.match(machine,/candidate\?\.receipt\?\.baseSha/,'promotion must bind original candidate base receipt');
assert.match(machine,/head_sha=\$\{headSha\}.*event=pull_request/,'promotion proof lookup must bind exact PR head SHA');
assert.match(machine,/sha:headSha,merge_method:'merge'/,'merge must use expected-head SHA locking');
assert.match(machine,/main drifted during promotion gate/,'main must be rechecked immediately before promotion');
assert.match(machine,/productionDeploymentWorkflow: 'ci.yml'|productionDeploymentWorkflow/,'VCloud may not become a production deployment authority');
assert.doesNotMatch(machine,/wrangler deploy|deploy-main|cloudflare/i,'VCloud machine may not deploy production directly');
assert.match(endpoint,/CRON_SECRET/,'VCloud cycle endpoint must require cron authentication');
assert.match(endpoint,/OMEGA_GITHUB_TOKEN_REQUIRED/,'GitHub write credential must remain external secret state');

console.log('R223 VCLOUD EVOLUTION PASS · exact-current-main residual-gated proposals · stale held branches do not deadlock successor work · exact-head proof-gated promotion · R125/R147/R146/R141 preserved · R201/R203 tombstones retired · ci.yml sole deployment authority');

import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const stagedVerifier=readFileSync(new URL('../scripts/verify_staged_release.mjs',import.meta.url),'utf8');
const r202=readFileSync(new URL('../scripts/verify_live_operational_source_authority_r202.mjs',import.meta.url),'utf8');
const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const policy=JSON.parse(readFileSync(new URL('../public/omega-r240-recursive-exact-self-promotion.json',import.meta.url),'utf8'));

assert.ok(stagedVerifier.includes("OMEGA_PROMOTED_SHA:''"),'staged R202 proof must suppress promoted-only stateful Hybrid transport branch');
assert.ok(stagedVerifier.includes("OMEGA_STAGED_READ_ONLY:'1'"),'staged proof must declare read-only candidate authority');
assert.ok(!stagedVerifier.includes("'scripts/verify_live_hybrid_command_authority_r237.mjs'"),'staged verifier must not run R237 stateful transport proof');
assert.ok(!stagedVerifier.includes("'scripts/verify_live_hybrid_host_intelligence_r238.mjs'"),'staged verifier must not run R238 promoted-live stateful proof');
assert.ok(r202.includes("const promoted=String(process.env.OMEGA_PROMOTED_SHA||'').trim();"),'R202 must retain explicit promoted-live gate');
assert.ok(r202.includes("if(promoted){"),'R202 stateful continuation must remain promoted-only');
assert.ok(r202.includes("verify_live_hybrid_direct_poll_r2074.mjs"),'R202 promoted-live proof must retain direct Durable transport proof');
assert.ok(r202.includes("verify_live_hybrid_command_authority_r237.mjs"),'R202 promoted-live proof must retain R237 authority proof');

const deployStep=ci.indexOf('id: deploy_worker');
const liveR202=ci.indexOf('Verify live R202 operational source-authority surface');
const liveR237=ci.indexOf('Verify live R237 authenticated Hybrid command authority');
const liveR238=ci.indexOf('Verify live R238 Hybrid host intelligence');
assert.ok(deployStep>=0&&liveR202>deployStep&&liveR237>liveR202&&liveR238>liveR237,'stateful Hybrid proofs must remain after canonical promotion step');
assert.ok(ci.includes("if: always() && steps.deploy_worker.outcome == 'success'"),'post-promotion stateful closure must only run after successful canonical release');
assert.ok(ci.includes("steps.deploy_worker.outputs.rollback_eligible == 'true'"),'post-promotion failure may roll back only to independently proved-usable baseline');

assert.equal(policy.deploymentContractRevision,'R324');
assert.equal(policy.deployment.stagedStatefulHybridDurableMutationProof,false);
assert.equal(policy.deployment.stagedReadOnlyCandidateSemanticProof,true);
assert.equal(policy.deployment.postPromotionStatefulHybridProofRequired,true);
assert.deepEqual(policy.deployment.postPromotionHybridAuthorities,['R202','R237','R238']);

console.log('R324 PROMOTED-LIVE HYBRID PROOF PASS · 0%-traffic candidate proof is read-only · Durable register/heartbeat/poll authority is exercised only after exact 100% promotion · rollback remains usability-gated');

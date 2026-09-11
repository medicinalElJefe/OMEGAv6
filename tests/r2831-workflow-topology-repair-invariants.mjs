import assert from 'node:assert/strict';
import fs from 'node:fs';

const activeDir='.github/workflows';
const archiveDir='.github/workflows-archive';
const active=fs.readdirSync(activeDir).filter(name=>/\.ya?ml$/i.test(name));
const archived=fs.readdirSync(archiveDir).filter(name=>/\.ya?ml$/i.test(name));

assert.ok(!active.includes('r283-sar-proof.yml'),'R283 standalone SAR proof must not remain an active workflow authority');
assert.ok(archived.includes('r283-sar-proof.yml'),'R283 SAR proof must remain preserved in the historical workflow archive');

const r241=fs.readFileSync('.github/workflows/r241-archive-convergence.yml','utf8');
for(const required of [
  'node tests/r283-sar-full-stack-invariants.mjs',
  'for f in tests/r280-*.mjs; do node "$f"; done',
  'node tests/r2831-workflow-topology-repair-invariants.mjs'
]) assert.ok(r241.includes(required),`R241 missing converged R283.1 proof: ${required}`);
assert.ok(!/^\s{2}push:\s*$/m.test(r241),'R241 must remain PR/manual proof-only');
assert.ok(!/^\s{2}schedule:\s*$/m.test(r241),'R241 must remain unscheduled');
assert.ok(!/^\s{2}deploy-main:\s*$/m.test(r241),'R241 must not gain canonical deployment authority');

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
assert.match(ci,/^\s{2}push:\s*$/m,'canonical CI must retain its main push trigger');
assert.match(ci,/^\s{2}deploy-main:\s*$/m,'ci.yml must retain the canonical deploy-main job');
assert.match(ci,/Deploy canonical OMEGA Worker/,'ci.yml must retain canonical Worker deployment');
assert.match(ci,/if: github\.ref == 'refs\/heads\/main'/,'deploy-main must remain gated to exact main');

for(const boundary of [
  ['R125','sole CanonState admission'],
  ['R141','exact return'],
  ['R146','durable history'],
  ['R147','dispatch']
]) assert.ok(r241.includes(boundary[0]),`R241 summary must continue to name ${boundary[0]} ${boundary[1]} authority`);
assert.ok(r241.includes('R201/R203 remain retired'),'R201/R203 tombstone retirement must remain explicit');

console.log(JSON.stringify({
  schema:'OMEGA_R2831_WORKFLOW_TOPOLOGY_REPAIR_V1',
  activeWorkflowCount:active.length,
  r283StandaloneActive:false,
  r283Archived:true,
  r283ProofConvergedInto:'R241',
  canonicalProductionWriter:'ci.yml/deploy-main',
  r241DeploymentAuthority:false,
  canonAdmissionAuthority:'R125',
  exactHybridReturnAuthority:'R141',
  durableExecutionHistoryAuthority:'R146',
  dispatchAuthority:'R147',
  retiredDurableObjectTombstones:['R201','R203'],
  result:'PASS'
},null,2));

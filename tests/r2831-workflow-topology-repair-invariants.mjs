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

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
assert.match(ci,/push:/,'canonical CI must retain the production push trigger');
for(const name of active){
  if(name==='ci.yml')continue;
  const text=fs.readFileSync(`${activeDir}/${name}`,'utf8');
  assert.ok(!/^\s{2}push:\s*\n(?:[\s\S]*?\n)?\s{4}branches:\s*\[[^\]]*\bmain\b[^\]]*\]/m.test(text),`${name} must not become a second main-push production authority`);
}

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
  canonicalProductionWriter:'ci.yml',
  canonAdmissionAuthority:'R125',
  exactHybridReturnAuthority:'R141',
  durableExecutionHistoryAuthority:'R146',
  dispatchAuthority:'R147',
  retiredDurableObjectTombstones:['R201','R203'],
  result:'PASS'
},null,2));

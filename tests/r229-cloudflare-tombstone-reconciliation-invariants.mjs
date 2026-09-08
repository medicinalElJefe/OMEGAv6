import assert from 'node:assert/strict';
import fs from 'node:fs';

const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
const worker=fs.readFileSync('src/workerR116.js','utf8');
const retired=['OmegaMissionLedgerR201','OmegaHybridMissionLedgerR203'];
const live=['OmegaRuntime','OmegaSwarmCell','OmegaSwarmCoordinator','OmegaSwarmBranch','OmegaSwarmOrgan','OmegaSwarmOrganismCoordinator','OmegaSwarmAutonomicCoordinator'];

for(const name of live){
  assert.ok(wrangler.includes(`\"${name}\": {\"type\": \"durable-object\", \"storage\": \"sqlite\"}`),`live Durable Object export missing ${name}`);
}
for(const name of retired){
  assert.ok(wrangler.includes(`\"${name}\": {\"type\": \"durable-object\", \"state\": \"deleted\"}`),`provider-reported provisioned retired namespace must retain deleted reconciliation tombstone ${name}`);
  assert.ok(!wrangler.includes(`\"class_name\": \"${name}\"`),`retired Durable Object regained live binding ${name}`);
  assert.ok(!wrangler.includes(`\"${name}\": {\"type\": \"durable-object\", \"storage\": \"sqlite\"}`),`retired Durable Object regained live storage ${name}`);
  assert.ok(!worker.includes(`export class ${name}`),`retired Durable Object class restored in Worker source ${name}`);
}
assert.ok(wrangler.includes('R125 remains canonical admission authority'),'R125 authority preservation note missing');
assert.ok(wrangler.includes('reconciliation metadata only'),'deleted tombstone truth boundary missing');
console.log('R229/R235 CLOUDFLARE RETIREMENT RECONCILIATION PASS · R201/R203 remain retired while provider-required deleted tombstones reconcile orphaned namespaces · no live binding/storage/class · R125 preserved');

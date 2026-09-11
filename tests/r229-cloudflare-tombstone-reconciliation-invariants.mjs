import './r278-live-earth-woven-invariants.mjs';
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
  assert.ok(wrangler.includes(`\"${name}\": {\"type\": \"durable-object\", \"state\": \"deleted\"}`),`provider-required deleted tombstone missing ${name}`);
  assert.ok(!wrangler.includes(`\"class_name\": \"${name}\"`),`retired Durable Object regained live binding ${name}`);
  assert.ok(!wrangler.includes(`\"${name}\": {\"type\": \"durable-object\", \"storage\": \"sqlite\"}`),`retired Durable Object regained live storage ${name}`);
  assert.ok(!worker.includes(`export class ${name}`),`retired Durable Object class restored in Worker source ${name}`);
}
assert.ok(wrangler.includes('R125 remains canonical admission authority'),'R125 authority preservation note missing');
console.log('R229/R278 CLOUDFLARE TOMBSTONE RECONCILIATION PASS · R278 visual/data invariants proved first · R201/R203 remain retired as deleted export tombstones only · no live binding/storage/class restored · R125 preserved');

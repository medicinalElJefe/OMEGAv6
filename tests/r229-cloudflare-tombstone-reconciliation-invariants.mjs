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
assert.ok(wrangler.includes('Cloudflare provider-state reconciliation on 2026-09-15 proved both provisioned namespaces still exist'),'R314.1 provider-state reconciliation evidence note missing');
assert.ok(wrangler.includes('explicit deleted export tombstones as non-executable scar/history state'),'R314.1 deleted provider scar boundary missing');
assert.ok(wrangler.includes('R125 remains canonical admission authority'),'R125 authority preservation note missing');
console.log('R229/R278/R299/R314.1 CLOUDFLARE RETIREMENT RECONCILIATION PASS · R278 visual/data invariants proved first · R201/R203 absent from executable classes, live bindings and live storage · provider-required deleted tombstones retained as non-executable scar/history · seven live R116 durable authorities preserved · R125 preserved');

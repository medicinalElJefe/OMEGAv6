import assert from 'node:assert/strict';
import fs from 'node:fs';

const config=fs.readFileSync('wrangler.jsonc','utf8');
const sourceFiles=fs.readdirSync('src',{recursive:true}).filter(x=>typeof x==='string'&&/\.(?:js|ts|tsx)$/.test(x));
const source=sourceFiles.map(x=>fs.readFileSync(`src/${x}`,'utf8')).join('\n');

for(const live of ['OmegaRuntime','OmegaSwarmCell','OmegaSwarmCoordinator','OmegaSwarmBranch','OmegaSwarmOrgan','OmegaSwarmOrganismCoordinator','OmegaSwarmAutonomicCoordinator']){
 assert.ok(config.includes(`"${live}": {"type": "durable-object", "storage": "sqlite"}`),`live durable export missing ${live}`);
 assert.ok(!config.includes(`"${live}": {"type": "durable-object", "state": "deleted"}`),`live durable export must not be tombstoned ${live}`);
}
for(const retired of ['OmegaMissionLedgerR201','OmegaHybridMissionLedgerR203']){
 assert.ok(!source.includes(`export class ${retired}`),`retired namespace must not be silently restored as executable authority ${retired}`);
 assert.ok(!config.includes(`"class_name": "${retired}"`),`retired namespace must not have a live binding ${retired}`);
 assert.ok(!config.includes(`"${retired}": {"type": "durable-object", "state": "deleted"}`),`completed provider retirement must not retain a stale tombstone ${retired}`);
 assert.ok(!config.includes(`"${retired}": {"type": "durable-object", "storage": "sqlite"}`),`retired namespace must never become a live sqlite export ${retired}`);
}
assert.ok(config.includes('OMEGA R233 preserves the proven R116 Worker spine'),'R233 deployment reconciliation provenance missing');
assert.ok(config.includes('reports both deletion tombstones stale with no remaining namespaces'),'R233 completed provider-state reconciliation evidence law missing');
assert.ok(config.includes('R125 remains canonical admission authority'),'R125 admission authority guardrail missing');
console.log('R193.1/R233 CLOUDFLARE DURABLE OBJECT RECONCILIATION PASS · R201/R203 executable classes, live bindings, sqlite exports, and completed tombstones absent · all seven live R116 durable authorities intact');

import assert from 'node:assert/strict';
import fs from 'node:fs';
const config=fs.readFileSync('wrangler.jsonc','utf8');
const sourceFiles=fs.readdirSync('src',{recursive:true}).filter(x=>typeof x==='string'&&/\.(?:js|ts|tsx)$/.test(x));
const source=sourceFiles.map(x=>fs.readFileSync(`src/${x}`,'utf8')).join('\n');
const live=['OmegaRuntime','OmegaSwarmCell','OmegaSwarmCoordinator','OmegaSwarmBranch','OmegaSwarmOrgan','OmegaSwarmOrganismCoordinator','OmegaSwarmAutonomicCoordinator'];
const retired=['OmegaMissionLedgerR201','OmegaHybridMissionLedgerR203'];
assert.equal([...config.matchAll(/"class_name"\s*:/g)].length,7,'R228.1 must preserve exactly seven live Durable Object bindings');
for(const name of live){
 assert.ok(config.includes(`"${name}": {"type": "durable-object", "storage": "sqlite"}`),`live Durable Object export missing ${name}`);
 assert.ok(!config.includes(`"${name}": {"type": "durable-object", "state": "deleted"}`),`live Durable Object must not be tombstoned ${name}`);
}
for(const name of retired){
 assert.ok(config.includes(`"${name}": {"type": "durable-object", "state": "deleted"}`),`provisioned retired namespace must be represented by deleted-only export ${name}`);
 assert.ok(!config.includes(`"class_name": "${name}"`),`retired namespace must not regain a live binding ${name}`);
 assert.ok(!config.includes(`"${name}": {"type": "durable-object", "storage": "sqlite"}`),`retired namespace must not regain sqlite authority ${name}`);
 assert.ok(!source.includes(`export class ${name}`),`retired namespace must not regain executable class authority ${name}`);
}
assert.ok(config.includes('R228.1')&&config.includes('deleted export tombstones'),'R228.1 live-reconciliation provenance missing');
assert.ok(config.includes('R125 remains canonical admission authority'),'R125 authority boundary missing');
console.log('R228.1 CLOUDFLARE DO TOMBSTONE RECONCILIATION PASS · seven live durable authorities preserved · two provisioned historical namespaces deleted-only · no executable restoration');
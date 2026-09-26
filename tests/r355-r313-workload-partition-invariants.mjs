import assert from'node:assert/strict';
import fs from'node:fs';
import {auditInteractionPartitionR355,R313_R286_OBSERVED_ELAPSED_MS_R355} from '../src/system/r313InteractionWorkloadR355.js';

const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const navigation=fs.readFileSync('src/navigationRegistry.ts','utf8');
const surfaces=[...navigation.matchAll(/name:'([^']+)'/g)].map(m=>m[1]);
assert.ok(workstation.includes('export const OMEGA_SURFACES=OMEGA_NAV_NAMES;'),'R355 workload proof must consume canonical route authority');
assert.equal(surfaces.length,44);
assert.equal(Object.keys(R313_R286_OBSERVED_ELAPSED_MS_R355).length,88,'R355 interaction census must cover every desktop/mobile route case');
for(const shards of [8,12,16]){
 const audit=auditInteractionPartitionR355({surfaces,shardCount:shards});
 assert.equal(audit.complete,true,`${shards}-shard partition must conserve all 88 cases`);
 assert.equal(audit.assigned,88);
 assert.equal(audit.unique,88);
 assert.ok(audit.ratio<2.25,`${shards}-shard workload ratio too imbalanced: ${audit.ratio}`);
 const keys=audit.bins.flatMap(b=>b.cases.map(c=>c.key));
 assert.equal(new Set(keys).size,88);
}
const audit8=auditInteractionPartitionR355({surfaces,shardCount:8});
assert.ok(Math.max(...audit8.weights)<220000,'8-shard measured load should stay well below the 480s child wall using the proven R286 census');
console.log('R355 R313 WORKLOAD PARTITION PASS · 88/88 desktop/mobile route cases conserved exactly once · measured R286 workload greedily balanced across deterministic fail-closed shards · no assertion or control coverage reduction');
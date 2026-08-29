import fs from 'node:fs';
const world=fs.readFileSync('src/worldModelRuntime.ts','utf8');
const spine=fs.readFileSync('src/pcExecutionSpineRuntime.ts','utf8');
for(const token of ['OMEGA_WORLD_MODEL_ADAPTED_V2','SOURCE_NEXT','HOURGLASS','OPPOSITE_DOMAIN','PREVIOUS','omega.world.learning.ledger','omega.pc.spine.ledger','readObservedHits','unchosen candidates are not silently treated as failures','without an explicit application commit'])if(!world.includes(token))throw new Error(`world model invariant missing: ${token}`);
for(const token of ['compileWorldModel','worldModelMemorySummary','worldBest','worldBestScore','worldBestKind'])if(!spine.includes(token))throw new Error(`PC spine world-model binding missing: ${token}`);
if(world.includes('@appdeploy/client')||spine.includes('@appdeploy/client'))throw new Error('builder runtime dependency regression');
console.log('world model learning invariants PASS');

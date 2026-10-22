import fs from 'node:fs';
const adm=fs.readFileSync('src/admissibility248832Runtime.ts','utf8');
const world=fs.readFileSync('src/worldModelRuntime.ts','utf8');
for(const token of ['ADMISSIBILITY_GATE_COUNT=12','ADMISSIBILITY_STATE_COUNT=20736','ADMISSIBILITY_CELL_COUNT','CONTINUITY','PLASTICITY','CONTRADICTION','BURDEN','EVIDENCE','GEOMETRY','RSC','SYMMETRY','MOTION','FORECAST','RECONSTRUCTABILITY','ROUTE_CLOSURE','not a physical dimension count'])if(!adm.includes(token))throw new Error(`248832 admissibility invariant missing: ${token}`);
for(const token of ['evaluateAdmissibility248832','admissibilityScore','admissibilityPass','gatePassCount','admissibility_integration_248832d','12 gates × 20,736 addresses'])if(!world.includes(token))throw new Error(`world admissibility binding missing: ${token}`);
if(adm.includes('@appdeploy/client')||world.includes('@appdeploy/client'))throw new Error('builder runtime dependency regression');
console.log('248832 admissibility invariants PASS');

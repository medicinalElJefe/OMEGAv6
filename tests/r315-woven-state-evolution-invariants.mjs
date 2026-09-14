import assert from 'node:assert/strict';
import fs from 'node:fs';
import {executeWovenStateEvolutionR315,restoreWovenStateR315,R315_FIELD_SCHEMA,R315_FIELD_REVISION,R315_FIELD_OPERATOR,R315_FIELD_AUTHORITY,R315_FIELD_BOUNDARY} from '../src/system/wovenStateEvolutionR315.js';
import {runWovenSystemPathR315,R315_SCHEMA,R315_AUTHORITY} from '../src/system/wovenSystemTraversalR315.js';

const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<=t,`${a} !~= ${b}`);
const operators=[
 {ref:'M1',family:'COHERENCE',organ:'STATE_MEMORY',active:true,weight:.5,address:{address:0,deepAddress:0}},
 {ref:'M2',family:'FLOW',organ:'SWARM_ORGANISM',active:true,weight:.3,address:{address:144,deepAddress:1728}},
 {ref:'M3',family:'PROOF',organ:'PROOF_GOVERNANCE',active:true,weight:.2,address:{address:1728,deepAddress:20736}},
];

assert.equal(R315_FIELD_SCHEMA,'OMEGA_WOVEN_STATE_EVOLUTION_R315');
assert.equal(R315_FIELD_REVISION,'R315.FIELD');
assert.deepEqual(R315_FIELD_OPERATOR,['PARTITION','EXCHANGE_TRANSPORT','INVARIANT_CARRY','SCAR_HISTORY_CARRY','ORIENTATION_FRAME_REEXPRESSION','RECONTEXTUALIZE_REPARTITION','PROVE']);
assert.equal(R315_FIELD_AUTHORITY.orchestration,'R315_CROSS_SKIN_ORCHESTRATION');
assert.equal(R315_FIELD_AUTHORITY.dispatch,'R147');
assert.equal(R315_FIELD_AUTHORITY.history,'R146');
assert.equal(R315_FIELD_AUTHORITY.returnProof,'R141');
assert.equal(R315_FIELD_AUTHORITY.canonAdmission,'R125');
assert.match(R315_FIELD_BOUNDARY,/does not claim literal physical dimensions/i);

const observe=executeWovenStateEvolutionR315({operators,orientation:0,transportRate:.125,targetResolution:20736,provenance:['TEST_OBSERVE']});
near(observe.invariantBefore,1);near(observe.invariantAfterTransport,1);near(observe.invariantAfterRepartition,1);near(observe.invariantResidual,0);
assert.equal(observe.exchange.edges.length,0);assert.equal(observe.scarMagnitude,0);assert.equal(observe.proof.invariantStatus,'PASS');assert.equal(observe.proof.recoverableFromLedger,true);assert.equal(observe.receipt.executionProofClaimed,false);assert.equal(observe.receipt.canonAdmissionClaimed,false);

const outverse=executeWovenStateEvolutionR315({operators,orientation:1,transportRate:.1,targetResolution:20736,provenance:['TEST_OUTVERSE']});
near(outverse.invariantBefore,1);near(outverse.invariantAfterTransport,1);near(outverse.invariantAfterRepartition,1);near(outverse.invariantResidual,0);
assert.equal(outverse.exchange.edges.length,3);assert.ok(outverse.scarMagnitude>0);assert.equal(outverse.exchange.edges[0].fromRef,'M1');assert.equal(outverse.exchange.edges[0].toRef,'M2');
near(outverse.exchange.edges[0].amount,.05);

const inverse=executeWovenStateEvolutionR315({operators,orientation:-1,transportRate:.1,targetResolution:20736,provenance:['TEST_INVERSE']});
assert.equal(inverse.exchange.edges.length,3);assert.equal(inverse.exchange.edges[0].fromRef,'M1');assert.equal(inverse.exchange.edges[0].toRef,'M3');near(inverse.invariantResidual,0);

const restored=restoreWovenStateR315(outverse);
assert.equal(restored.recoverablePathUsed,true);assert.equal(restored.dispatchRequested,false);assert.equal(restored.canonAdmissionClaimed,false);
assert.deepEqual(restored.restored.map(x=>[x.ref,x.address,x.value]),[['M1',0,.5],['M2',144,.3],['M3',1728,.2]]);

const coarse=executeWovenStateEvolutionR315({operators,orientation:0,targetResolution:12,provenance:['TEST_COARSE']});
near(coarse.invariantAfterRepartition,1);assert.equal(coarse.proof.invariantStatus,'PASS');assert.ok(coarse.targetCount<=12);assert.ok(coarse.proof.roundTripResidual>=0);assert.equal(coarse.r265.dimensionalRelativity.physicalDimensionsClaimed,false);
const deep=executeWovenStateEvolutionR315({operators,orientation:0,targetResolution:248832,provenance:['TEST_DEEP']});
near(deep.invariantAfterRepartition,1);assert.equal(deep.proof.invariantStatus,'PASS');assert.equal(deep.r265.dimensionalRelativity.targetResolution,248832);

const path=runWovenSystemPathR315({payload:{name:'field'},operatorField:operators,orientation:1,resolution:20736,metrics:{continuity:.8,plasticity:.7,evidence:.9},provenance:['TEST_PATH']},[
 {skin:'FUNCTION',inputs:['operatorField'],outputs:['wovenField']},
 {skin:'COMPUTE',transportRate:.1,targetResolution:20736,provenance:['TEST_COMPUTE']},
 {skin:'RENDER',projection:'IDENTITY'}
]);
assert.equal(path.schema,R315_SCHEMA);assert.deepEqual(path.path,['FUNCTION','COMPUTE','RENDER']);assert.equal(path.lastFieldEvolution.schema,R315_FIELD_SCHEMA);assert.ok(path.fieldScarLedger.length>=1);assert.equal(path.authority.dispatch,'R147');assert.equal(path.authority.canonAdmission,'R125');assert.equal(R315_AUTHORITY.fieldEvolution,'R315.FIELD');

const r240=fs.readFileSync('src/system/calculusAddressFabricR240.ts','utf8');
const ui=fs.readFileSync('src/CalculusAddressFabricR240.tsx','utf8');
for(const token of ['executeActiveWovenStateR240','R315_FIELD_SCHEMA','R315_FIELD_OPERATOR','resolutionLadder','R315_CROSS_SKIN_COMPUTE'])assert.ok(r240.includes(token),`R240 missing ${token}`);
for(const token of ['R315 woven state evolution','INVARIANT CARRY','SCAR / HISTORY','RECOVERABLE PATH','ROUND-TRIP PROJECTION','+1 OUTVERSE','−1 INVERSE'])assert.ok(ui.includes(token),`R240 calculus surface missing ${token}`);
assert.ok(!ui.includes('FIELD ENERGY Σw²'),'legacy scalar energy proxy must not remain the primary woven-calculus surface');
assert.ok(!ui.includes('+1 DISPATCH'),'orientation must not be mislabeled as R147 dispatch');

console.log('OMEGA R315 WOVEN STATE EVOLUTION PASS · partition → conservative exchange/transport → invariant carry → scar/history carry → orientation/frame re-expression → re-contextualize/repartition → proof · inverse/outverse structure factored · 12→144→1728→20736→248832 software projection · recoverable ledger path · R315 orchestration with R265/R266/R314 under R240 addressing · R147/R146/R141/R125 authority unchanged');

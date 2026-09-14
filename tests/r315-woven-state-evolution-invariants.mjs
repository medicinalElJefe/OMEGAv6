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
assert.deepEqual(R315_FIELD_OPERATOR,['PARTITION','RELATIONAL_EXCHANGE_TRANSPORT','INVARIANT_CARRY','SCAR_HISTORY_CARRY','ORIENTATION_FRAME_REEXPRESSION','RECONTEXTUALIZE_REPARTITION','PROVE']);
assert.equal(R315_FIELD_AUTHORITY.orchestration,'R315_CROSS_SKIN_ORCHESTRATION');
assert.equal(R315_FIELD_AUTHORITY.dispatch,'R147');
assert.equal(R315_FIELD_AUTHORITY.history,'R146');
assert.equal(R315_FIELD_AUTHORITY.returnProof,'R141');
assert.equal(R315_FIELD_AUTHORITY.canonAdmission,'R125');
assert.match(R315_FIELD_BOUNDARY,/frame-relative/i);
assert.match(R315_FIELD_BOUNDARY,/relation-aware/i);
assert.match(R315_FIELD_BOUNDARY,/does not claim empirical truth/i);

const observe=executeWovenStateEvolutionR315({operators,orientation:0,transportRate:.125,targetResolution:20736,provenance:['TEST_OBSERVE']});
near(observe.invariantBefore,1);near(observe.invariantAfterTransport,1);near(observe.invariantAfterRepartition,1);near(observe.invariantResidual,0);
assert.equal(observe.sourceResolution,20736);assert.equal(observe.targetResolution,20736);assert.equal(observe.exchange.edges.length,0);assert.ok(observe.exchange.topology.length>0);assert.equal(observe.scarMagnitude,0);assert.equal(observe.proof.invariantStatus,'PASS');assert.equal(observe.proof.recoverableFromLedger,true);assert.equal(observe.proof.topologyPreservedAcrossFrame,true);assert.equal(observe.receipt.executionProofClaimed,false);assert.equal(observe.receipt.canonAdmissionClaimed,false);

const outverse=executeWovenStateEvolutionR315({operators,orientation:1,transportRate:.1,targetResolution:20736,provenance:['TEST_OUTVERSE']});
near(outverse.invariantBefore,1);near(outverse.invariantAfterTransport,1);near(outverse.invariantAfterRepartition,1);near(outverse.invariantResidual,0);
assert.equal(outverse.exchange.mode,'RELATIONAL');assert.equal(outverse.exchange.edges.length,2);assert.ok(outverse.scarMagnitude>0);assert.equal(outverse.exchange.edges[0].fromRef,'M1');assert.equal(outverse.exchange.edges[0].toRef,'M2');
near(outverse.exchange.edges[0].amount,.05);assert.ok(!outverse.exchange.edges.some(edge=>edge.fromRef==='M3'&&edge.toRef==='M1'),'address fallback must not wrap the field into an arbitrary ring');

const inverse=executeWovenStateEvolutionR315({operators,orientation:-1,transportRate:.1,targetResolution:20736,provenance:['TEST_INVERSE']});
assert.equal(inverse.exchange.edges.length,2);assert.equal(inverse.exchange.edges[0].fromRef,'M2');assert.equal(inverse.exchange.edges[0].toRef,'M1');near(inverse.invariantResidual,0);

const relationalOperators=[
 {ref:'A',family:'STATE',organ:'PARENT',value:.6,address:0,relations:[{ref:'C',weight:3,kind:'CONTINUITY'},{ref:'B',weight:1,kind:'INTERACTION'}]},
 {ref:'B',family:'FLOW',organ:'INTERACTION',value:.25,address:120,relations:[{ref:'C',weight:1,kind:'SCAR'}]},
 {ref:'C',family:'PROOF',organ:'CONTINUITY',value:.15,address:240,relations:[{ref:'A',weight:1,kind:'RETURN_PATH'}]}
];
const relational=executeWovenStateEvolutionR315({operators:relationalOperators,orientation:1,transportRate:.1,sourceResolution:1728,targetResolution:144,provenance:['TEST_RELATIONAL_TOPOLOGY']});
near(relational.invariantAfterTransport,1);near(relational.invariantAfterRepartition,1);assert.equal(relational.proof.invariantStatus,'PASS');assert.ok(relational.exchange.topology.some(edge=>edge.fromRef==='A'&&edge.toRef==='C'&&edge.topology==='DECLARED_RELATION'));assert.ok(relational.exchange.edges.some(edge=>edge.fromRef==='A'&&edge.toRef==='C'));assert.ok(relational.recontextualized.operators.some(row=>Array.isArray(row.relations)&&row.relations.length>0),'projected relation topology must survive frame re-contextualization');assert.ok(relational.path.projectedTopology.length>0);assert.equal(relational.proof.topologyPreservedAcrossFrame,true);
const relationalNext=executeWovenStateEvolutionR315({operators:relational.recontextualized.operators,orientation:-1,transportRate:.1,sourceResolution:144,targetResolution:1728,scarLedger:relational.carry.scarLedger,provenance:['TEST_RELATIONAL_TOPOLOGY_RETURN']});
near(relationalNext.invariantAfterRepartition,1);assert.ok(relationalNext.exchange.topology.some(edge=>edge.topology==='DECLARED_RELATION'),'projected relation must remain declared topology in the next compute cycle');

const restored=restoreWovenStateR315(outverse);
assert.equal(restored.recoverablePathUsed,true);assert.equal(restored.topologyRestored,true);assert.equal(restored.sourceResolution,20736);assert.equal(restored.dispatchRequested,false);assert.equal(restored.canonAdmissionClaimed,false);
assert.deepEqual(restored.restored.map(x=>[x.ref,x.address,x.value]),[['M1',0,.5],['M2',144,.3],['M3',1728,.2]]);

const coarse=executeWovenStateEvolutionR315({operators,orientation:0,targetResolution:12,provenance:['TEST_COARSE']});
near(coarse.invariantAfterRepartition,1);assert.equal(coarse.proof.invariantStatus,'PASS');assert.ok(coarse.targetCount<=12);assert.ok(coarse.proof.roundTripResidual>=0);assert.equal(coarse.r265.dimensionalRelativity.physicalDimensionsClaimed,false);
const deep=executeWovenStateEvolutionR315({operators,orientation:0,targetResolution:248832,provenance:['TEST_DEEP']});
near(deep.invariantAfterRepartition,1);assert.equal(deep.proof.invariantStatus,'PASS');assert.equal(deep.r265.dimensionalRelativity.targetResolution,248832);

// R315.1+: dimensional relativity must preserve the actual source frame across repeated field evolution.
const frame144=[
 {ref:'A',family:'TEST',organ:'FRAME',value:2,address:0},
 {ref:'B',family:'TEST',organ:'FRAME',value:3,address:72},
 {ref:'C',family:'TEST',organ:'FRAME',value:5,address:143}
];
const down=executeWovenStateEvolutionR315({operators:frame144,sourceResolution:144,targetResolution:12,orientation:1,transportRate:.1,provenance:['R315_1_DOWN']});
assert.equal(down.sourceResolution,144);assert.equal(down.targetResolution,12);assert.equal(down.r265.dimensionalRelativity.sourceResolution,144);assert.equal(down.r265.dimensionalRelativity.targetResolution,12);near(down.invariantBefore,10);near(down.invariantAfterTransport,10);near(down.invariantAfterRepartition,10);assert.equal(down.proof.invariantStatus,'PASS');assert.ok(down.recontextualized.operators.every(row=>row.address>=0&&row.address<12));
const up=executeWovenStateEvolutionR315({operators:down.recontextualized.operators,sourceResolution:12,targetResolution:144,orientation:-1,transportRate:.1,scarLedger:down.carry.scarLedger,provenance:['R315_1_UP']});
assert.equal(up.sourceResolution,12);assert.equal(up.targetResolution,144);near(up.invariantBefore,10);near(up.invariantAfterRepartition,10);assert.equal(up.proof.invariantStatus,'PASS');assert.ok(up.recontextualized.operators.every(row=>row.address>=0&&row.address<144));assert.ok(up.carry.scarLedger.length>down.carry.scarLedger.length);
assert.throws(()=>executeWovenStateEvolutionR315({operators:[{ref:'OUT',value:1,address:12}],sourceResolution:12,targetResolution:144}),/out of range for resolution 12/);

const framePath=runWovenSystemPathR315({payload:{name:'multi-resolution'},operatorField:frame144,orientation:1,resolution:144,metrics:{continuity:.8,plasticity:.7,evidence:.9},provenance:['R315_1_PATH']},[
 {skin:'COMPUTE',transportRate:.1,targetResolution:12,provenance:['DOWN_FRAME']},
 {skin:'COMPUTE',transportRate:.1,targetResolution:144,orientation:-1,provenance:['UP_FRAME']}
]);
assert.equal(framePath.history[0].outcome.fieldEvolution.sourceResolution,144);assert.equal(framePath.history[0].outcome.fieldEvolution.targetResolution,12);assert.ok(framePath.history[0].outcome.fieldEvolution.recontextualized.operators.every(row=>row.address<12));
assert.equal(framePath.history[1].outcome.fieldEvolution.sourceResolution,12);assert.equal(framePath.history[1].outcome.fieldEvolution.targetResolution,144);assert.equal(framePath.resolution,144);assert.ok(framePath.operatorField.every(row=>row.address<144));near(framePath.lastFieldEvolution.invariantAfterRepartition,10);

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

console.log('OMEGA R315.3 WOVEN STATE EVOLUTION PASS · partition → relation-aware conservative exchange/transport → invariant carry → scar/history/topology carry → orientation/frame re-expression → re-contextualize/repartition → proof · declared relationship paths and directional address-neighbor fallback survive projected 12^k frame transitions without arbitrary ring wrap · inverse/outverse structure factored · recoverable ledger path · R147/R146/R141/R125 authority unchanged');

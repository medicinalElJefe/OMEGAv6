import assert from 'node:assert/strict';
import {R315_SCHEMA,R315_AUTHORITY,createWovenSystemStateR315,traverseWovenSkinR315,runWovenSystemPathR315} from '../src/system/wovenSystemTraversalR315.js';

const operatorField=[
 {ref:'M1',family:'COHERENCE',organ:'STATE_MEMORY',active:true,weight:.5,address:{address:0,deepAddress:0}},
 {ref:'M2',family:'FLOW',organ:'SWARM_ORGANISM',active:true,weight:.3,address:{address:144,deepAddress:1728}},
 {ref:'M3',family:'PROOF',organ:'PROOF_GOVERNANCE',active:true,weight:.2,address:{address:1728,deepAddress:20736}}
];
const initial=createWovenSystemStateR315({
 payload:[{id:'a',kind:'signal',value:2},{id:'b',kind:'signal',value:3}],operatorField,
 frame:'SOURCE',skin:'FUNCTION',resolution:20736,orientation:1,
 metrics:{continuity:.82,plasticity:.76,contradiction:.08,burden:.12,scar:.06,evidence:.9},
 water:{flow:.74,boundary:.2,pressure:.15,memory:.7,curvature:.1,hysteresis:.08},
 invariantCarry:.86,correspondence:.83,provenance:['R315_TEST']
});
assert.equal(initial.schema,R315_SCHEMA);assert.equal(initial.physicalDimensionsClaimed,false);assert.equal(initial.operatorField.length,3);

const evidence=traverseWovenSkinR315(initial,{skin:'EVIDENCE',evidenceClass:'OBSERVED',source:'TEST_SENSOR',claim:'bounded test observation'});
assert.equal(evidence.evidenceLedger.length,1);assert.equal(evidence.evidenceLedger[0].class,'OBSERVED');assert.equal(evidence.lastR265.dimensionalRelativity.sourceSkin,'FUNCTION');assert.equal(evidence.lastR265.dimensionalRelativity.targetSkin,'EVIDENCE');

const path=runWovenSystemPathR315(initial,[
 {skin:'EVIDENCE',evidenceClass:'OBSERVED',source:'TEST_SENSOR',claim:'bounded test observation'},
 {skin:'ORGANIZE',partitionKey:'kind',targetResolution:248832},
 {skin:'COMPUTE',transportRate:.1,plan:{kind:'EVALUATE',variables:{x:2,y:3},expression:{op:'add',args:[{op:'pow',args:[{op:'var',name:'x'},{op:'const',value:2}]},{op:'var',name:'y'}]}}},
 {skin:'RENDER',projection:'LAWFUL_READ_ONLY'},
 {skin:'LEARN',evidenceClass:'RETURNED',outcome:{accepted:true,score:7}},
 {skin:'EXECUTE',request:{kind:'BOUNDED_TEST_REQUEST'}},
 {skin:'SELF_BUILD',candidate:{kind:'TEST_CANDIDATE',change:'none'}}
]);

assert.deepEqual(path.path,['EVIDENCE','ORGANIZE','COMPUTE','RENDER','LEARN','EXECUTE','SELF_BUILD']);assert.equal(path.history.length,7);assert.equal(path.scarLedger.length,7);assert.equal(path.residualLedger.length,7);assert.equal(path.evidenceLedger.length,1);
assert.equal(path.history[2].outcome.computed,true);assert.equal(path.history[2].outcome.result,7);assert.equal(path.history[2].outcome.fieldEvolution.schema,'OMEGA_WOVEN_STATE_EVOLUTION_R315');assert.equal(path.history[2].outcome.fieldEvolution.proof.invariantStatus,'PASS');assert.ok(path.fieldScarLedger.length>=1);assert.equal(path.lastFieldEvolution.reexpression.targetResolution,248832);
assert.equal(path.history[4].outcome.updated,true);assert.equal(path.history[4].outcome.foundationWeightsChanged,false);assert.equal(path.history[5].outcome.dispatchPerformed,false);assert.equal(path.history[6].outcome.sourceMutationPerformed,false);
assert.equal(path.dispatchPerformed,false);assert.equal(path.sourceMutationPerformed,false);assert.equal(path.canonicalAdmission,false);assert.equal(path.externalScientificTruthClaimed,false);assert.equal(path.physicalDimensionsClaimed,false);
assert.equal(path.authority.dispatch,'R147');assert.equal(path.authority.durableHistory,'R146');assert.equal(path.authority.hybridReturnProof,'R141');assert.equal(path.authority.canonAdmission,'R125');assert.equal(path.authority.addressAndSourceMutation,'R240');assert.equal(path.authority.fieldEvolution,'R315.FIELD');
assert.equal(R315_AUTHORITY.addsDispatchAuthority,false);assert.equal(R315_AUTHORITY.addsSourceMutationAuthority,false);assert.equal(R315_AUTHORITY.addsCanonAuthority,false);
for(const event of path.history){assert.ok(event.contract,'every skin transition must carry its R265 skin contract');assert.ok(event.r265?.woven,'every skin transition must compile Woven continuity');assert.ok(event.r265?.water,'every skin transition must compile Water transport');assert.ok(event.r265?.violet,'every skin transition must compile Violet re-expression');assert.ok(event.provenance.includes(`R315:${event.skin}`),'every skin transition must add recoverable provenance')}
assert.equal(path.lastR265.dimensionalRelativity.targetResolutionIs12Power,true);assert.equal(path.complete,true);

console.log('OMEGA R315 WOVEN SYSTEM TRAVERSAL PASS · one recoverable state path spans EVIDENCE→ORGANIZE→COMPUTE→RENDER→LEARN→EXECUTE→SELF_BUILD · COMPUTE carries R315.FIELD addressed conservative evolution plus optional R314 numerical plans · every transition recompiles Water/Woven/Violet/frame carry · scar/residual/evidence/provenance ledgers retained · R240/R147/R146/R141/R125/ci authorities unchanged');
await import('./r315-woven-state-evolution-invariants.mjs');

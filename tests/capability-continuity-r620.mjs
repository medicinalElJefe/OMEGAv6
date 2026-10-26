import test from 'node:test';
import assert from 'node:assert/strict';
import {auditCapabilityContinuityR620 as audit} from '../src/capabilityContinuityAuditR620.mjs';
const node=(id,opts={})=>({identity:{id},lineage:{sourceBindingId:id},strongestImplementation:{id:id+':v1',state:opts.gated?'TRUTH_GATED':'EXECUTES_NOW'},currentExecutor:{routable:opts.run!==false},presentationSurface:{generatedFromCapability:opts.view!==false,route:opts.view===false?'':'/omega/'+id}});
const proof=id=>({type:'PRODUCTION_BEHAVIOR',evidenceId:'receipt:'+id,implementationId:id+':v1',sourceBindingId:id});
test('graph membership alone is not live proof',()=>{const r=audit({previous:[node('A')],candidate:[node('A')]});assert.equal(r.structurePass,true);assert.equal(r.productionProven,false)});
test('executor regression blocks acceptance',()=>{const r=audit({previous:[node('A')],candidate:[node('A',{run:false})],proofs:{A:proof('A')}});assert.deepEqual(r.executorLost,['A']);assert.equal(r.productionProven,false)});
test('presentation regression independently blocks acceptance',()=>{const r=audit({previous:[node('A')],candidate:[node('A',{view:false})],proofs:{A:proof('A')}});assert.deepEqual(r.presentationLost,['A']);assert.equal(r.structurePass,false)});
test('mere disposition label cannot excuse missing capability',()=>{const r=audit({previous:[node('A')],candidate:[],dispositions:{A:{status:'SUPERSEDED'}}});assert.deepEqual(r.invalidResolutions,['A'])});
test('supersession requires replacement and governed evidence',()=>{const r=audit({previous:[node('A')],candidate:[node('B')],dispositions:{A:{status:'SUPERSEDED',replacementId:'B',evidenceId:'e',approver:'operator'}}});assert.deepEqual(r.provenResolutions,['A']);assert.equal(r.productionProven,false)});
test('CI success and archive inventory are not runtime receipts',()=>{const r=audit({previous:[node('A')],candidate:[node('A')],proofs:{A:{...proof('A'),type:'CI_PASS'}}});assert.deepEqual(r.unproven,['A'])});
test('matching caller-provided references remain unverified until independent production readback',()=>{
 const r=audit({previous:[node('A')],candidate:[node('A')],proofs:{A:proof('A')}});
 assert.equal(r.structurePass,true);
 assert.equal(r.proofReferencesComplete,true);
 assert.equal(r.productionProven,false);
 assert.equal(r.proofAuthority,'UNVERIFIED_CALLER_SUPPLIED_REFERENCES');
 assert.equal(r.requiresIndependentProductionReadback,true);
});
test('fabricated runtime receipt must never claim production proof',()=>{
 const forged={type:'TARGET_RUNTIME_READBACK',evidenceId:'fake',implementationId:'A:v1',sourceBindingId:'A'};
 const r=audit({previous:[node('A')],candidate:[node('A')],proofs:{A:forged}});
 assert.equal(r.proofReferencesComplete,true);
 assert.equal(r.productionProven,false);
});
test('missing receipt references are distinguished from forged matching references',()=>{
 const r=audit({previous:[node('A')],candidate:[node('A')]});
 assert.equal(r.proofReferencesComplete,false);
 assert.equal(r.productionProven,false);
});
test('duplicate identities fail regardless of receipts',()=>{const r=audit({previous:[node('A')],candidate:[node('A'),node('A')],proofs:{A:proof('A')}});assert.deepEqual(r.duplicateCurrent,['A']);assert.equal(r.productionProven,false)});

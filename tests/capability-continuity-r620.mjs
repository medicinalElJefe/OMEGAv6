import test from 'node:test';
import assert from 'node:assert/strict';
import {auditCapabilityContinuityR620 as audit} from '../src/capabilityContinuityAuditR620.mjs';
const node=(id,opts={})=>({identity:{id},lineage:{sourceBindingId:opts.source||id},evidence:{truthClass:opts.truth||'FORMAL_MODEL'},strongestImplementation:{id:id+':v1',state:opts.state||(opts.gated?'TRUTH_GATED':'EXECUTES_NOW')},currentExecutor:{routable:opts.run!==false},presentationSurface:{generatedFromCapability:opts.view!==false,route:opts.view===false?'':'/omega/'+id}});
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

test('newly added capability cannot silently inherit proof completeness from old graph',()=>{
 const r=audit({previous:[node('A')],candidate:[node('A'),node('B')],proofs:{A:proof('A')}});
 assert.equal(r.structurePass,true);
 assert.deepEqual(r.unproven,['B']);
 assert.equal(r.proofReferencesComplete,false);
 assert.equal(r.productionProven,false);
});
test('new capability with no historical baseline is not automatically production proven',()=>{
 const r=audit({previous:[],candidate:[node('NEW')]});
 assert.deepEqual(r.unproven,['NEW']);
 assert.equal(r.proofReferencesComplete,false);
});
test('source binding substitution requires separate lineage review',()=>{
 const r=audit({previous:[node('A')],candidate:[node('A',{source:'unrelated-donor'})],proofs:{A:proof('A')}});
 assert.deepEqual(r.sourceBindingChanged,['A']);
 assert.equal(r.structurePass,false);
});
test('truth class mutation is a blocking evidence-boundary change',()=>{
 const r=audit({previous:[node('A')],candidate:[node('A',{truth:'CANONICAL_AUTHORITY'})],proofs:{A:proof('A')}});
 assert.deepEqual(r.truthClassChanged,['A']);
 assert.equal(r.structurePass,false);
});
test('direct executor replaced by adapter is a documented downgrade',()=>{
 const r=audit({previous:[node('A')],candidate:[node('A',{state:'EXECUTES_AS_ADAPTER'})],proofs:{A:proof('A')}});
 assert.deepEqual(r.executionDowngraded,['A']);
 assert.equal(r.structurePass,false);
});
test('unknown executor state cannot count as runnable',()=>{
 const r=audit({previous:[node('A')],candidate:[node('A',{state:'UNRECOGNIZED'})]});
 assert.deepEqual(r.executorLost,['A']);
 assert.equal(r.structurePass,false);
});
test('empty or non-string receipt identifiers cannot satisfy proof reference completeness',()=>{
 for(const evidenceId of ['', '   ', 42]){
  const r=audit({previous:[node('A')],candidate:[node('A')],proofs:{A:{...proof('A'),evidenceId}}});
  assert.deepEqual(r.unproven,['A']);
  assert.equal(r.proofReferencesComplete,false);
 }
});

test('malformed new candidate cannot satisfy a crafted proof reference',()=>{
 const bad=node('BAD');delete bad.strongestImplementation.id;
 const r=audit({previous:[],candidate:[bad],proofs:{BAD:{type:'TARGET_RUNTIME_READBACK',evidenceId:'forged',sourceBindingId:'BAD'}}});
 assert.deepEqual(r.invalidCurrent,['BAD']);
 assert.deepEqual(r.unproven,['BAD']);
 assert.equal(r.structurePass,false);
 assert.equal(r.proofReferencesComplete,false);
});
test('malformed historical baseline blocks conservation even if candidate looks valid',()=>{
 const bad=node('A');delete bad.lineage.sourceBindingId;
 const r=audit({previous:[bad],candidate:[node('A')],proofs:{A:proof('A')}});
 assert.deepEqual(r.invalidHistorical,['A']);
 assert.equal(r.structurePass,false);
});

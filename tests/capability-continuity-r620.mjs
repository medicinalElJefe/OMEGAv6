import test from 'node:test';
import assert from 'node:assert/strict';
import {auditCapabilityContinuityR620 as audit} from '../src/capabilityContinuityAuditR620.mjs';
const node=(id,opts={})=>({identity:{id},lineage:{sourceBindingId:opts.source||id},evidence:{truthClass:opts.truth||'FORMAL_MODEL'},strongestImplementation:{id:id+':v1',state:opts.state||(opts.gated?'TRUTH_GATED':'EXECUTES_NOW')},currentExecutor:{routable:opts.run!==false,route:'/executor/'+id,operation:'RUN',capabilityId:id+':execution',executionDomain:'OMEGA',reality:'MODELED',admissionAuthority:'R125',receiptAuthority:'R142'},presentationSurface:{generatedFromCapability:opts.view!==false,definesCapability:false,route:opts.view===false?'':'/omega/'+id},canonicalMutation:false});
const proof=id=>({type:'PRODUCTION_BEHAVIOR',evidenceId:'receipt:'+id,implementationId:id+':v1',sourceBindingId:id});
test('graph membership alone is not live proof',()=>{const r=audit({previous:[node('A')],candidate:[node('A')]});assert.equal(r.structurePass,true);assert.equal(r.productionProven,false)});
test('executor regression blocks acceptance',()=>{const r=audit({previous:[node('A')],candidate:[node('A',{run:false})],proofs:{A:proof('A')}});assert.deepEqual(r.executorLost,['A']);assert.equal(r.productionProven,false)});
test('presentation regression independently blocks acceptance',()=>{const r=audit({previous:[node('A')],candidate:[node('A',{view:false})],proofs:{A:proof('A')}});assert.deepEqual(r.presentationLost,['A']);assert.equal(r.structurePass,false)});
test('mere disposition label cannot excuse missing capability',()=>{const r=audit({previous:[node('A')],candidate:[],dispositions:{A:{status:'SUPERSEDED'}}});assert.deepEqual(r.invalidResolutions,['A'])});
test('supersession requires replacement and governed evidence',()=>{const r=audit({previous:[node('A')],candidate:[node('B')],dispositions:{A:{status:'SUPERSEDED',replacementId:'B',evidenceId:'e',approver:'operator'}}});assert.deepEqual(r.declaredResolutions,['A']);assert.equal(r.dispositionAuthority,'UNVERIFIED_CALLER_SUPPLIED_GOVERNANCE_REFERENCES');assert.equal(r.structurePass,false);assert.equal(r.productionProven,false)});
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

test('blank disposition evidence and approver cannot manufacture governed supersession',()=>{
 for(const field of ['evidenceId','approver'])for(const value of ['', '   ']){
  const disposition={status:'SUPERSEDED',replacementId:'B',evidenceId:'e',approver:'operator',[field]:value};
  const r=audit({previous:[node('A')],candidate:[node('B')],dispositions:{A:disposition}});
  assert.deepEqual(r.invalidResolutions,['A']);
  assert.deepEqual(r.declaredResolutions,[]);
  assert.equal(r.structurePass,false);
  assert.equal(r.productionProven,false);
 }
});

test('implementation identity substitution requires independent lineage review',()=>{
 const old=node('A'),now=node('A');now.strongestImplementation.id='A:replacement';
 const r=audit({previous:[old],candidate:[now],proofs:{A:{...proof('A'),implementationId:'A:replacement'}}});
 assert.deepEqual(r.implementationChanged,['A']);
 assert.equal(r.structurePass,false);
 assert.equal(r.productionProven,false);
});
test('visible presentation route relocation is not silently conserved',()=>{
 const old=node('A'),now=node('A');now.presentationSurface.route='/omega/relocated';
 const r=audit({previous:[old],candidate:[now],proofs:{A:proof('A')}});
 assert.deepEqual(r.presentationRouteChanged,['A']);
 assert.equal(r.presentationLost.length,0);
 assert.equal(r.structurePass,false);
});
test('executor route relocation is a distinct regression review gate',()=>{
 const old=node('A'),now=node('A');old.currentExecutor.route='/executor/old';now.currentExecutor.route='/executor/new';
 const r=audit({previous:[old],candidate:[now],proofs:{A:proof('A')}});
 assert.deepEqual(r.executorRouteChanged,['A']);
 assert.equal(r.structurePass,false);
 assert.equal(r.productionProven,false);
});

test('caller-declared disposition cannot silently conserve a removed historical capability',()=>{
 for(const status of ['SUPERSEDED','INTENTIONALLY_DEPRECATED','PLATFORM_SPECIFIC','QUARANTINED']){
  const disposition={status,replacementId:'B',evidenceId:'self-declared',approver:'self-declared'};
  const r=audit({previous:[node('A')],candidate:[node('B')],dispositions:{A:disposition},proofs:{B:proof('B')}});
  assert.deepEqual(r.missing,['A']);
  assert.deepEqual(r.declaredResolutions,['A']);
  assert.deepEqual(r.invalidResolutions,[]);
  assert.equal(r.structurePass,false,'unverified '+status+' must not pass conservation');
  assert.equal(r.proofReferencesComplete,false);
  assert.equal(r.productionProven,false);
 }
});
test('visible capability cannot declare an empty or whitespace-only route',()=>{
 for(const route of ['', '  ']){
  const candidate=node('A');candidate.presentationSurface.route=route;
  const r=audit({previous:[node('A')],candidate:[candidate],proofs:{A:proof('A')}});
  assert.deepEqual(r.invalidCurrent,['A']);
  assert.equal(r.structurePass,false);
  assert.equal(r.proofReferencesComplete,false);
 }
});

test('routable executor must have a nonblank route and cannot retain runnable status without it',()=>{
 for(const route of ['', '  ', undefined]){
  const now=node('A');now.currentExecutor.route=route;
  const r=audit({previous:[node('A')],candidate:[now],proofs:{A:proof('A')}});
  assert.deepEqual(r.invalidCurrent,['A']);
  assert.deepEqual(r.executorLost,['A']);
  assert.equal(r.structurePass,false);
 }
});
test('canonical admission, receipt authority and source-derived presentation cannot be self-promoted',()=>{
 for(const mutate of [
  n=>{n.currentExecutor.admissionAuthority='CALLER';},
  n=>{n.currentExecutor.receiptAuthority='CALLER';},
  n=>{n.canonicalMutation=true;},
  n=>{n.presentationSurface.definesCapability=true;}
 ]){
  const now=node('A');mutate(now);
  const r=audit({previous:[node('A')],candidate:[now],proofs:{A:proof('A')}});
  assert.deepEqual(r.invalidCurrent,['A']);
  assert.equal(r.structurePass,false);
  assert.equal(r.productionProven,false);
 }
});
test('executor operation and capability binding changes cannot silently preserve a historical executor',()=>{
 for(const field of ['operation','capabilityId','executionDomain','reality']){
  const now=node('A');now.currentExecutor[field]='substituted';
  const r=audit({previous:[node('A')],candidate:[now],proofs:{A:proof('A')}});
  assert.deepEqual(r.executionContractChanged,['A']);
  assert.equal(r.structurePass,false);
 }
 const now=node('A');now.strongestImplementation.operation='substituted';
 const r=audit({previous:[node('A')],candidate:[now],proofs:{A:proof('A')}});
 assert.deepEqual(r.executionContractChanged,['A']);
 assert.equal(r.structurePass,false);
});

test('unverified truth-gated executor promotion is a review gate, not automatic conservation',()=>{
 const old=node('A',{state:'TRUTH_GATED'}),now=node('A',{state:'EXECUTES_NOW'});
 const r=audit({previous:[old],candidate:[now],proofs:{A:proof('A')}});
 assert.deepEqual(r.executionStateChanged,['A']);
 assert.deepEqual(r.executorLost,[],'promotion is not an executor-loss regression');
 assert.equal(r.structurePass,false,'caller receipt cannot authorize execution-state promotion');
 assert.equal(r.proofReferencesComplete,false);
 assert.equal(r.productionProven,false);
});
test('execution-state changes require review even when routes and implementation IDs match',()=>{
 const old=node('A',{state:'EXECUTES_AS_ADAPTER'}),now=node('A',{state:'EXECUTES_NOW'});
 const r=audit({previous:[old],candidate:[now]});
 assert.deepEqual(r.executionStateChanged,['A']);
 assert.equal(r.structurePass,false);
});
test('evidence requirements, dependencies, scar policy and unresolved gaps are conserved independently',()=>{
 const old=node('A');
 old.evidence.requirements=['R125','EXTERNAL_PROOF'];
 old.dependencies=['R142','EXTERNAL_PROOF'];
 old.supersession={scarPolicy:'RETAIN_REJECTIONS_AND_CONTRADICTIONS'};
 old.remainingGap='DEVICE_PROOF_REQUIRED';
 for(const [field,mutate] of [
  ['evidenceRequirementsChanged',n=>{n.evidence.requirements=['R125'];}],
  ['dependenciesChanged',n=>{n.dependencies=['R142'];}],
  ['scarPolicyChanged',n=>{n.supersession.scarPolicy='DISCARD_SCARS';}],
  ['remainingGapChanged',n=>{n.remainingGap=null;}]
 ]){
  const now=structuredClone(old);mutate(now);
  const r=audit({previous:[old],candidate:[now],proofs:{A:proof('A')}});
  assert.deepEqual(r[field],['A'],field+' must be explicit');
  assert.equal(r.structurePass,false,field+' cannot silently pass');
  assert.equal(r.productionProven,false);
 }
});
test('reordering evidence requirement and dependency sets does not manufacture a semantic regression',()=>{
 const old=node('A'),now=node('A');
 old.evidence.requirements=['R142','R125'];now.evidence.requirements=['R125','R142'];
 old.dependencies=['B','A'];now.dependencies=['A','B'];
 const r=audit({previous:[old],candidate:[now]});
 assert.deepEqual(r.evidenceRequirementsChanged,[]);
 assert.deepEqual(r.dependenciesChanged,[]);
 assert.equal(r.structurePass,true);
});

test('capability function, architectural pillar, and artifact-kind substitutions require review',()=>{
 const old=node('A');old.function='preserve reversible traversal';old.pillar='TRAVERSAL';old.primaryKind='ENGINE';old.artifactKinds=['ENGINE','MODEL'];
 for(const mutate of [
  n=>{n.function='render unrelated scenery';},
  n=>{n.pillar='APPLICATIONS';},
  n=>{n.primaryKind='DONOR';},
  n=>{n.artifactKinds=['ENGINE'];}
 ]){
  const now=structuredClone(old);mutate(now);
  const r=audit({previous:[old],candidate:[now]});
  assert.deepEqual(r.capabilityDefinitionChanged,['A']);
  assert.equal(r.structurePass,false);
  assert.equal(r.productionProven,false);
 }
});
test('lineage, supersession ancestry, and implementation selection cannot silently change',()=>{
 const old=node('A');old.lineage.domain='TRAVERSAL';old.lineage.predecessors=['HISTORICAL_SOURCE'];
 old.lineage.relations=['DERIVES_FROM','EXECUTES'];old.supersession={predecessors:['SOURCE_A'],scarPolicy:'RETAIN_REJECTIONS_AND_CONTRADICTIONS'};
 old.strongestImplementation.route='/source/engine';old.strongestImplementation.selectionRule='STRONGEST_VALID_NOT_NEWEST';
 for(const [field,mutate] of [
  ['lineageStructureChanged',n=>{n.lineage.domain='UNRELATED';}],
  ['lineageStructureChanged',n=>{n.lineage.predecessors=[];}],
  ['lineageStructureChanged',n=>{n.lineage.relations=['EXECUTES'];}],
  ['lineageStructureChanged',n=>{n.supersession.predecessors=[];}],
  ['implementationSelectionChanged',n=>{n.strongestImplementation.route='/unrelated/engine';}],
  ['implementationSelectionChanged',n=>{n.strongestImplementation.selectionRule='NEWEST_WINS';}]
 ]){
  const now=structuredClone(old);mutate(now);
  const r=audit({previous:[old],candidate:[now]});
  assert.deepEqual(r[field],['A']);
  assert.equal(r.structurePass,false);
 }
});
test('reordering unordered lineage and artifact-kind memberships is not a false regression',()=>{
 const old=node('A'),now=node('A');
 old.artifactKinds=['ENGINE','MODEL'];now.artifactKinds=['MODEL','ENGINE'];
 old.lineage.predecessors=['A','B'];now.lineage.predecessors=['B','A'];
 old.lineage.relations=['EXECUTES','DERIVES_FROM'];now.lineage.relations=['DERIVES_FROM','EXECUTES'];
 old.supersession={predecessors:['P1','P2']};now.supersession={predecessors:['P2','P1']};
 const r=audit({previous:[old],candidate:[now]});
 assert.deepEqual(r.capabilityDefinitionChanged,[]);
 assert.deepEqual(r.lineageStructureChanged,[]);
 assert.equal(r.structurePass,true);
});


test('new executor routability cannot be self-authorized by an unchanged route or state',()=>{
 const old=node('A',{run:false}),now=node('A');
 const r=audit({previous:[old],candidate:[now],proofs:{A:proof('A')}});
 assert.deepEqual(r.executorRoutabilityChanged,['A']);
 assert.deepEqual(r.executorLost,[],'a forged promotion is not a loss');
 assert.equal(r.structurePass,false);
 assert.equal(r.proofReferencesComplete,false);
 assert.equal(r.productionProven,false);
});
test('presentation generation authority cannot change merely by retaining a route',()=>{
 const old=node('A',{view:false});old.presentationSurface.route='/omega/A';
 const now=structuredClone(old);now.presentationSurface.generatedFromCapability=true;
 const r=audit({previous:[old],candidate:[now],proofs:{A:proof('A')}});
 assert.deepEqual(r.presentationGenerationChanged,['A']);
 assert.deepEqual(r.presentationLost,[]);
 assert.equal(r.structurePass,false);
 assert.equal(r.productionProven,false);
});

test('historical identity name and aliases cannot be rewritten without a conservation review',()=>{
 const old=node('A');old.identity.name='Historical Traversal';old.identity.aliases=['ARCHIVE','TRAVERSAL'];
 for(const mutate of [n=>{n.identity.name='Unrelated Engine';},n=>{n.identity.aliases=['ARCHIVE'];}]){
  const now=structuredClone(old);mutate(now);
  const r=audit({previous:[old],candidate:[now],proofs:{A:proof('A')}});
  assert.deepEqual(r.identityMetadataChanged,['A']);
  assert.equal(r.structurePass,false);
  assert.equal(r.productionProven,false);
 }
 const reordered=structuredClone(old);reordered.identity.aliases.reverse();
 assert.deepEqual(audit({previous:[old],candidate:[reordered]}).identityMetadataChanged,[]);
});
test('source evidence description cannot be substituted while truth class and requirements stay fixed',()=>{
 const old=node('A');old.evidence.currentEvidence='Original source readback still required';
 const now=structuredClone(old);now.evidence.currentEvidence='Production proved';
 const r=audit({previous:[old],candidate:[now],proofs:{A:proof('A')}});
 assert.deepEqual(r.evidenceProvenanceChanged,['A']);
 assert.deepEqual(r.truthClassChanged,[]);
 assert.deepEqual(r.evidenceRequirementsChanged,[]);
 assert.equal(r.structurePass,false);
 assert.equal(r.productionProven,false);
});
test('supersession status and capability schema changes independently require review',()=>{
 const old=node('A');old.schema='OMEGA_YEAR_CORPUS_CAPABILITY_NODE_R474';
 old.supersession={status:'CURRENT_RESOLUTION',predecessors:[],scarPolicy:'RETAIN_REJECTIONS_AND_CONTRADICTIONS'};
 for(const [field,mutate] of [
  ['supersessionStatusChanged',n=>{n.supersession.status='INTENTIONALLY_DEPRECATED';}],
  ['nodeSchemaChanged',n=>{n.schema='UNRELATED_SCHEMA';}]
 ]){
  const now=structuredClone(old);mutate(now);
  const r=audit({previous:[old],candidate:[now],proofs:{A:proof('A')}});
  assert.deepEqual(r[field],['A']);
  assert.equal(r.structurePass,false);
  assert.equal(r.productionProven,false);
 }
});


test('a declared R474 schema cannot be admitted with an incomplete synthetic record',()=>{
 const incomplete=node('A');incomplete.schema='OMEGA_YEAR_CORPUS_CAPABILITY_NODE_R474';
 const r=audit({previous:[incomplete],candidate:[incomplete]});
 assert.deepEqual(r.invalidHistorical,['A']);
 assert.deepEqual(r.invalidCurrent,['A']);
 assert.equal(r.structurePass,false);
 assert.equal(r.productionProven,false);
});

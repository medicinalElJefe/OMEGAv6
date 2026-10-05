import assert from 'node:assert/strict';
import {YEAR_CORPUS_CAPABILITY_GRAPH_R474,OMEGA_ARCHITECTURE_R474,auditYearCorpusCapabilityGraphR474,auditCapabilityConservationR474,resolveStrongestImplementationR474} from '../src/yearCorpusCapabilityGraphR474';

const audit=auditYearCorpusCapabilityGraphR474();
assert.equal(audit.pass,true,JSON.stringify(audit,null,2));
assert.equal(OMEGA_ARCHITECTURE_R474.pillars.length,12);
assert.equal(OMEGA_ARCHITECTURE_R474.convergenceUnit,'CAPABILITY_LINEAGE_NOT_ROUTE');
assert.equal(OMEGA_ARCHITECTURE_R474.presentationRule,'VIEWS_AND_TOOLS_ARE_GENERATED_FROM_CAPABILITIES_AND_NEVER_DEFINE_CANONICAL_CAPABILITY');
assert.equal(YEAR_CORPUS_CAPABILITY_GRAPH_R474.length>=69,true,'R474 may not narrow the recovered R473 corpus');
for(const node of YEAR_CORPUS_CAPABILITY_GRAPH_R474){
 assert.equal(node.schema,'OMEGA_YEAR_CORPUS_CAPABILITY_NODE_R474');
 assert.equal(node.strongestImplementation.selectionRule,'STRONGEST_VALID_NOT_NEWEST');
 assert.equal(node.currentExecutor.admissionAuthority,'R125');
 assert.equal(node.currentExecutor.receiptAuthority,'R142');
 assert.equal(node.presentationSurface.generatedFromCapability,true);
 assert.equal(node.presentationSurface.definesCapability,false);
 assert.equal(node.canonicalMutation,false);
 assert.ok(node.artifactKinds.length>0);
 assert.ok(node.evidence.requirements.includes('SCARS_RETAINED'));
}
const olderStrong={id:'older-proven',revision:'R100',chronology:1,quality:10,truthValid:true,proofValid:true,dependencyCompatible:true,governanceValid:true};
const newerWeak={id:'newer-unproven',revision:'R999',chronology:999,quality:99,truthValid:true,proofValid:false,dependencyCompatible:true,governanceValid:true};
assert.equal(resolveStrongestImplementationR474([newerWeak,olderStrong])?.id,'older-proven','newest must not defeat stronger valid implementation');
const lost=YEAR_CORPUS_CAPABILITY_GRAPH_R474[0],candidate=YEAR_CORPUS_CAPABILITY_GRAPH_R474.slice(1);
assert.equal(auditCapabilityConservationR474(YEAR_CORPUS_CAPABILITY_GRAPH_R474,candidate).pass,false,'silent capability loss must block promotion');
assert.deepEqual(auditCapabilityConservationR474(YEAR_CORPUS_CAPABILITY_GRAPH_R474,candidate).unresolvedLosses,[lost.identity.id]);
assert.equal(auditCapabilityConservationR474(YEAR_CORPUS_CAPABILITY_GRAPH_R474,candidate,{[lost.identity.id]:'SUPERSEDED'}).pass,true,'evidenced supersession may resolve loss');
assert.equal(auditCapabilityConservationR474(YEAR_CORPUS_CAPABILITY_GRAPH_R474,candidate,{[lost.identity.id]:'REGRESSION'}).pass,false,'known regression must remain blocking');
for(const id of ['HEIGHTENED','FIELD_RENDER','EARTH','SAR','BIO','LANGUAGE','SAI','HYBRID','ARCHIVE','CCR','COLLECTIONS','PROOF'])assert.ok(YEAR_CORPUS_CAPABILITY_GRAPH_R474.some(x=>x.identity.id===id),'missing cross-board lineage '+id);
console.log('R474 YEAR-CORPUS CAPABILITY GRAPH PASS · '+audit.capabilities+' typed lineages · '+audit.pillars+' architecture pillars · strongest-valid resolution · capability-conservation gate active');

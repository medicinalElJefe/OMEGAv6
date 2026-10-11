import {measureAccumulativeConvergenceR534} from '../src/accumulativeConvergenceCoverageR534';
import {executeAccumulatedCapabilityR534,R534_EXECUTABLE_BINDING_IDS} from '../src/accumulativeCapabilityExecutionR534';
import {initCorpusPack} from '../src/corpusRuntime';
import {auditAccumulativeBindingR534} from '../src/accumulativeBindingAuditR534';
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

const accumulated=auditAccumulativeBindingR534();
assert.equal(accumulated.capabilityCount,YEAR_CORPUS_CAPABILITY_GRAPH_R474.length);
assert.equal(accumulated.archiveExhaustive,false,'incomplete archive census cannot be marked exhaustive');
assert.equal(accumulated.productionPromotionClaimed,false,'read-only binding is not production authority');
assert.ok(accumulated.unresolvedListings.length>0,'unresolved archive listing must be retained');
assert.ok(accumulated.bindings.every(x=>x.canonicalMutation===false&&x.sourceBindingId));
console.log('R534 accumulated R474/R484 residual binding PASS');

await initCorpusPack();
for(const id of R534_EXECUTABLE_BINDING_IDS){
 const result=executeAccumulatedCapabilityR534(id,11498);
 assert.equal(result.capabilityId,id);
 assert.equal(result.canonicalMutation,false);
 if(id==='HYBRID'){assert.equal(result.status,'EXTERNAL_HOST_PROOF_REQUIRED');assert.equal(result.executionClaimed,false);}
 else{assert.equal(result.status,'SOURCE_MODEL_EXECUTED');assert.equal(result.executionClaimed,true);}
}
assert.equal(executeAccumulatedCapabilityR534('NOT_A_CAPABILITY',11498).status,'HELD');
assert.equal(executeAccumulatedCapabilityR534('SPHERE',20736).status,'HELD');
assert.equal(executeAccumulatedCapabilityR534('RUNTIME',11498).status,'HELD','unmapped executor must never silently execute');
console.log('R534 source-bound capability execution PASS');

const coverage=measureAccumulativeConvergenceR534();
assert.equal(coverage.totalCapabilities,YEAR_CORPUS_CAPABILITY_GRAPH_R474.length);
assert.equal(coverage.fullRestorationClaimed,false);
assert.equal(coverage.historicalParityProven,0);
assert.equal(coverage.productionExecutionProvenByThisAudit,0);
assert.equal(coverage.sourceModelExecutable,5);
assert.equal(coverage.hostGated,1);
assert.ok(coverage.notSourceModelExecutable>0,'source model subset must not be misreported as full corpus execution');
assert.ok(coverage.unresolvedArchiveListings>0);
console.log('R534 full-corpus coverage accounting PASS');

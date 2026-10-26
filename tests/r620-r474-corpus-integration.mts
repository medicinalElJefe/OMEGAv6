import assert from 'node:assert/strict';
import {YEAR_CORPUS_CAPABILITY_GRAPH_R474,OMEGA_ARCHITECTURE_R474} from '../src/yearCorpusCapabilityGraphR474';
import {auditCapabilityContinuityR620} from '../src/capabilityContinuityAuditR620.mjs';

// Bind the conservation gate to the actual recovered year-corpus graph, not only synthetic fixtures.
const previous=[...YEAR_CORPUS_CAPABILITY_GRAPH_R474];
assert.ok(previous.length>0,'R474 source graph must contain capabilities');
assert.equal(OMEGA_ARCHITECTURE_R474.pillars.length,12,'all architectural pillars remain declared');
const baseline=auditCapabilityContinuityR620({previous,candidate:previous});
assert.equal(baseline.structurePass,true,'unchanged R474 graph must pass structural conservation');
assert.equal(baseline.proofReferencesComplete,false,'graph membership cannot manufacture production references');
assert.equal(baseline.productionProven,false,'source graph is not live Worker evidence');
assert.deepEqual(baseline.missing,[]);

const lost=previous[0],replacement=previous.find(x=>x.identity.id!==lost.identity.id);
assert.ok(replacement,'at least two independent capabilities required');
const missing=auditCapabilityContinuityR620({
 previous,candidate:previous.filter(x=>x.identity.id!==lost.identity.id),
 dispositions:{[lost.identity.id]:{status:'SUPERSEDED',replacementId:replacement.identity.id,evidenceId:'caller-only',approver:'caller-only'}},
});
assert.deepEqual(missing.missing,[lost.identity.id]);
assert.deepEqual(missing.declaredResolutions,[lost.identity.id]);
assert.equal(missing.structurePass,false,'unverified declared supersession cannot erase source lineage');

const routeLost=structuredClone(previous);
routeLost[0].presentationSurface.route='  ';
const brokenRoute=auditCapabilityContinuityR620({previous,candidate:routeLost});
assert.deepEqual(brokenRoute.invalidCurrent,[lost.identity.id]);
assert.equal(brokenRoute.structurePass,false,'empty visible OMEGA7 route is not conservation');

const bindingChanged=structuredClone(previous);
bindingChanged[0].lineage.sourceBindingId='UNRELATED_DONOR';
const brokenBinding=auditCapabilityContinuityR620({previous,candidate:bindingChanged});
assert.deepEqual(brokenBinding.sourceBindingChanged,[lost.identity.id]);
assert.equal(brokenBinding.structurePass,false,'unreviewed source binding substitution cannot pass');

const direct=previous.find(x=>x.strongestImplementation.state==='EXECUTES_NOW'&&x.currentExecutor.routable);
assert.ok(direct,'real R474 graph must expose a direct executor for downgrade testing');
const downgraded=structuredClone(previous);
downgraded.find(x=>x.identity.id===direct.identity.id)!.strongestImplementation.state='EXECUTES_AS_ADAPTER';
const downgradeAudit=auditCapabilityContinuityR620({previous,candidate:downgraded});
assert.deepEqual(downgradeAudit.executionDowngraded,[direct.identity.id]);
assert.equal(downgradeAudit.structurePass,false,'actual direct-executor downgrade cannot pass');
console.log('R620/R474 real year-corpus graph conservation and negative tamper tests PASS; no production proof asserted');

const gated=previous.find(x=>x.strongestImplementation.state==='TRUTH_GATED');
assert.ok(gated,'real R474 graph must preserve at least one truth-gated capability');
const falselyPromoted=structuredClone(previous);
falselyPromoted.find(x=>x.identity.id===gated.identity.id)!.strongestImplementation.state='EXECUTES_NOW';
const promotionAudit=auditCapabilityContinuityR620({previous,candidate:falselyPromoted});
assert.deepEqual(promotionAudit.executionStateChanged,[gated.identity.id]);
assert.equal(promotionAudit.structurePass,false,'source graph truth-gated executor cannot be promoted by a field edit');

const evidenceWeakened=structuredClone(previous);
evidenceWeakened[0].evidence.requirements=[];
const evidenceAudit=auditCapabilityContinuityR620({previous,candidate:evidenceWeakened});
assert.deepEqual(evidenceAudit.evidenceRequirementsChanged,[lost.identity.id]);
assert.equal(evidenceAudit.structurePass,false,'R474 source proof obligations cannot silently disappear');

const scarsDiscarded=structuredClone(previous);
scarsDiscarded[0].supersession.scarPolicy='DISCARD_SCARS' as never;
const scarAudit=auditCapabilityContinuityR620({previous,candidate:scarsDiscarded});
assert.deepEqual(scarAudit.scarPolicyChanged,[lost.identity.id]);
assert.equal(scarAudit.structurePass,false,'historical contradiction/scar policy must be conserved');

const definitionTampered=structuredClone(previous);
definitionTampered[0].pillar='APPLICATIONS' as never;
const definitionAudit=auditCapabilityContinuityR620({previous,candidate:definitionTampered});
assert.deepEqual(definitionAudit.capabilityDefinitionChanged,[lost.identity.id]);
assert.equal(definitionAudit.structurePass,false,'R474 architectural pillar cannot be rewritten without review');

const ancestryTampered=structuredClone(previous);
ancestryTampered[0].lineage.predecessors=['UNRELATED_DONOR'];
const ancestryAudit=auditCapabilityContinuityR620({previous,candidate:ancestryTampered});
assert.deepEqual(ancestryAudit.lineageStructureChanged,[lost.identity.id]);
assert.equal(ancestryAudit.structurePass,false,'R474 historical ancestry cannot silently change');

const selectionTampered=structuredClone(previous);
selectionTampered[0].strongestImplementation.selectionRule='NEWEST_WINS' as never;
const selectionAudit=auditCapabilityContinuityR620({previous,candidate:selectionTampered});
assert.deepEqual(selectionAudit.implementationSelectionChanged,[lost.identity.id]);
assert.equal(selectionAudit.structurePass,false,'R474 strongest-valid selection cannot be replaced by newest-wins');

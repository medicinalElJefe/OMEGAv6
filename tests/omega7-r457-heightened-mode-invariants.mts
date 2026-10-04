import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_CAPABILITIES} from '../src7/capabilityRegistry.ts';
import {OMEGA7_FAMILY_CONTRACTS} from '../src7/familyParityR452.ts';
import {
 R457_SCHEMA,
 OMEGA7_HEIGHTENED_CAPABILITIES,
 OMEGA7_HEIGHTENED_SUMMARY,
 composeHeightenedR457,
 evaluateRetirementR457,
 R457_DEVELOPMENTAL_SEQUENCE,
 R457_DEWEY_KERNEL,
 R457_AUTHORITATIVE_PROOF_FAMILIES,
 evaluateDevelopmentalTransitionR457
} from '../src7/heightenedModeR457.ts';

assert.equal(OMEGA7_HEIGHTENED_CAPABILITIES.length,44,'R457 must preserve the complete accepted OMEGA7 capability universe');
assert.equal(OMEGA7_HEIGHTENED_CAPABILITIES.length,OMEGA7_CAPABILITIES.length);
assert.equal(new Set(OMEGA7_HEIGHTENED_CAPABILITIES.map(x=>x.capabilityId)).size,44);
assert.equal(new Set(OMEGA7_HEIGHTENED_CAPABILITIES.map(x=>x.legacyRoute)).size,44);
assert.equal(new Set(OMEGA7_HEIGHTENED_CAPABILITIES.map(x=>x.family)).size,OMEGA7_FAMILY_CONTRACTS.length);

for(const row of OMEGA7_HEIGHTENED_CAPABILITIES){
 assert.ok(row.capability.label&&row.capability.purpose,'capability layer must retain meaningful identity');
 assert.ok(row.capability.executionInput&&row.capability.executionOutput&&row.capability.executionProof,'capability layer must retain execution contract');
 assert.ok(row.capability.layers.length>0&&row.capability.primaryLayer,'capability layer must retain OMEGA layer contract');
 assert.equal(row.composition.futureRetention,'PRESERVE_CAPABILITY');
 assert.equal(row.composition.pruneAuthority,'EXPLICIT_PARITY_AND_REPLACEMENT_PROOF_REQUIRED');
 assert.equal(row.presentation.authority,'PRESENTATION_ONLY');
 assert.equal(row.presentation.depthPolicy,'STANDARD_FIRST_ADVANCED_CANON_ON_DEMAND');
 assert.equal(row.accepted.fullProductParity,true);
 assert.equal(row.accepted.rollbackAvailable,true);
 assert.equal(row.accepted.legacyRetired,false);
 assert.equal(row.accepted.canonicalMutation,false);
}

const plan=composeHeightenedR457(['Relativity','Atlas'],'STANDARD');
assert.equal(plan.schema,R457_SCHEMA);
assert.equal(plan.status,'READY');
assert.deepEqual(plan.resolvedRoutes,['Relativity','Atlas']);
assert.deepEqual(plan.families,['SCIENCE_RELATIVITY_ATLAS']);
assert.ok(plan.retainedFutureRoutes.includes('Reality Lab')&&plan.retainedFutureRoutes.includes('Scale Compiler'),'composition must preserve unselected future topology inside the active family');
assert.equal(plan.legacyRetirementAllowed,false);
assert.equal(plan.canonicalMutation,false);

const canonPlan=composeHeightenedR457(['Relativity','Atlas'],'CANON');
assert.deepEqual(canonPlan.resolvedRoutes,plan.resolvedRoutes,'presentation depth must not alter capability selection');
assert.deepEqual(canonPlan.families,plan.families,'presentation depth must not alter composition identity');
assert.deepEqual(canonPlan.layers,plan.layers,'presentation depth must not change computational layer topology');

const unknown=composeHeightenedR457(['NOT_A_ROUTE'],'ADVANCED');
assert.equal(unknown.status,'HELD');
assert.ok(unknown.reasons.includes('UNKNOWN_ROUTE:NOT_A_ROUTE'));
assert.equal(unknown.canonicalMutation,false);

const retirement=evaluateRetirementR457({
 legacyRoute:'Atlas',
 replacementRoutes:['Reality Lab'],
 explicitReplacementProof:true,
 rollbackStillAvailable:true
});
assert.equal(retirement.decision,'HOLD','R457 is a developmental law and must not silently retire accepted capability');
assert.ok(retirement.reasons.includes('R457_DOES_NOT_RETIRE_ACCEPTED_CAPABILITIES'));
assert.equal(retirement.futureTopologyPreserved,true);
assert.equal(retirement.canonicalMutation,false);

assert.equal(OMEGA7_HEIGHTENED_SUMMARY.capabilityCount,44);
assert.equal(OMEGA7_HEIGHTENED_SUMMARY.familyCount,8);
assert.equal(OMEGA7_HEIGHTENED_SUMMARY.presentationDomains,6);
assert.equal(OMEGA7_HEIGHTENED_SUMMARY.fullProductParity,44);
assert.equal(OMEGA7_HEIGHTENED_SUMMARY.rollbackAvailable,44);
assert.equal(OMEGA7_HEIGHTENED_SUMMARY.legacyRetired,0);
assert.equal(OMEGA7_HEIGHTENED_SUMMARY.capabilityCompositionPresentationSeparated,true);
assert.equal(OMEGA7_HEIGHTENED_SUMMARY.noNewPhysicalPrimitive,true);
assert.equal(OMEGA7_HEIGHTENED_SUMMARY.physicalDimensionClaim,false);
assert.equal(OMEGA7_HEIGHTENED_SUMMARY.canonicalMutation,false);

assert.deepEqual(R457_DEVELOPMENTAL_SEQUENCE,[
 'CANONICAL_STATE','NORMALIZED_RELATIONAL_DIFFERENCE','GROWTH_VECTOR','GROWTH_TRANSPORT','DEVELOPMENTAL_ACCELERATION','DEVELOPMENTAL_JERK','ORDER_SENSITIVITY','DEVELOPMENTAL_CURVATURE','DEVELOPMENTAL_SCAR','CONTINUITY_CONE','RECOVERABILITY','VIABILITY','GOVERNANCE_PROMOTION','GROWTH_LAW_UPDATE'
]);
assert.equal(R457_DEWEY_KERNEL.score,'S=(CΩ·Φ)/(q+Λ+ε)');
assert.equal(R457_DEWEY_KERNEL.decisionLaw,'STAY_TURN_ESCALATE');
assert.equal(R457_DEWEY_KERNEL.pruneLaw,'PRUNE_TRANSLATE_PROVE');

const parentMetrics={continuity:.80,futurePlasticity:.70,contradiction:.18,burden:.24,recoverability:.82,proofCoverage:.90,capabilityCoverage:1,humanComprehension:.62,futureTopologyRetention:1,scarPressure:.16};
const developmentalEvidence={
 parentStateRef:'main:parent',
 candidateStateRef:'pr:head',
 sourceHead:'a'.repeat(40),
 metricRefs:Object.fromEntries(Object.keys(parentMetrics).map(key=>[key,'proof:'+key])),
 proofRefs:[...R457_AUTHORITATIVE_PROOF_FAMILIES]
};
const improved=evaluateDevelopmentalTransitionR457({
 parent:parentMetrics,
 candidate:{...parentMetrics,continuity:.86,futurePlasticity:.78,contradiction:.12,burden:.20,recoverability:.90,proofCoverage:.96,humanComprehension:.80,scarPressure:.12},
 previousGrowth:{humanComprehension:.05,proofCoverage:.01},
 previousAcceleration:{humanComprehension:.01},
 authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,canonicalMutation:false,evidence:developmentalEvidence
});
assert.equal(improved.decision,'TURN','R457 must TURN toward a proof-preserving developmental improvement rather than merely count revisions');
assert.equal(improved.promotionAllowed,true);
assert.equal(improved.continuityCone.reachable,true);
assert.ok(improved.dewey.candidateScore>improved.dewey.parentScore);
assert.ok(improved.growthVector.humanComprehension>0);
assert.ok(improved.growthVector.contradiction>0,'lower contradiction must be positive developmental growth');
assert.ok(Number.isFinite(improved.developmentalCurvature));
assert.equal(improved.derivativeBasis,'DISCRETE_DEVELOPMENTAL_STEP_NOT_PHYSICAL_TIME');
assert.equal(improved.developmentalScar.retained,true);

const vocabularyOnly=evaluateDevelopmentalTransitionR457({
 parent:parentMetrics,
 candidate:{...parentMetrics},
 authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,canonicalMutation:false,evidence:developmentalEvidence
});
assert.equal(vocabularyOnly.decision,'STAY','no measured developmental change must not be promoted as growth');
assert.equal(vocabularyOnly.promotionAllowed,false);

const collapsed=evaluateDevelopmentalTransitionR457({
 parent:parentMetrics,
 candidate:{...parentMetrics,humanComprehension:.90,futureTopologyRetention:.70,recoverability:.70},
 authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,canonicalMutation:false,evidence:developmentalEvidence
});
assert.equal(collapsed.decision,'ESCALATE','cleaner presentation cannot compensate for collapsed future topology or recoverability');
assert.ok(collapsed.hardVetoes.includes('FUTURE_TOPOLOGY_COLLAPSED'));
assert.ok(collapsed.hardVetoes.includes('RECOVERABILITY_REGRESSED'));
assert.equal(collapsed.promotionAllowed,false);

const proofBroken=evaluateDevelopmentalTransitionR457({
 parent:parentMetrics,
 candidate:{...parentMetrics,humanComprehension:.90},
 authorityClosed:true,proofSurvives:false,rollbackAvailable:true,dependencyOrderPreserved:true,canonicalMutation:false,evidence:developmentalEvidence
});
assert.equal(proofBroken.decision,'ESCALATE');
assert.ok(proofBroken.hardVetoes.includes('PROOF_DID_NOT_SURVIVE_TRANSPORT'));
assert.equal(proofBroken.canonicalMutation,false);

const unboundMetrics=evaluateDevelopmentalTransitionR457({
 parent:parentMetrics,
 candidate:{...parentMetrics,humanComprehension:.90},
 authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,canonicalMutation:false,
 evidence:{parentStateRef:'',candidateStateRef:'',sourceHead:'',metricRefs:{continuity:'proof:continuity'},proofRefs:[]}
});
assert.equal(unboundMetrics.decision,'ESCALATE','developmental numbers without evidence provenance must never become promotion authority');
assert.ok(unboundMetrics.hardVetoes.includes('PARENT_STATE_UNBOUND'));
assert.ok(unboundMetrics.hardVetoes.includes('CANDIDATE_STATE_UNBOUND'));
assert.ok(unboundMetrics.hardVetoes.includes('SOURCE_HEAD_NOT_EXACT_GIT_SHA'));
assert.ok(unboundMetrics.hardVetoes.some(x=>x.startsWith('METRIC_EVIDENCE_INCOMPLETE:')));
assert.ok(unboundMetrics.hardVetoes.some(x=>x.startsWith('AUTHORITATIVE_PROOF_SET_INCOMPLETE:')));
assert.equal(unboundMetrics.promotionAllowed,false);

const partialProofSet=evaluateDevelopmentalTransitionR457({
 parent:parentMetrics,
 candidate:{...parentMetrics,humanComprehension:.90},
 authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,canonicalMutation:false,
 evidence:{...developmentalEvidence,proofRefs:['R210 Release Controller']}
});
assert.equal(partialProofSet.decision,'ESCALATE');
assert.ok(partialProofSet.hardVetoes.some(x=>x.startsWith('AUTHORITATIVE_PROOF_SET_INCOMPLETE:')));

const identityCollision=evaluateDevelopmentalTransitionR457({
 parent:parentMetrics,
 candidate:{...parentMetrics,humanComprehension:.90},
 authorityClosed:true,proofSurvives:true,rollbackAvailable:true,dependencyOrderPreserved:true,canonicalMutation:false,
 evidence:{...developmentalEvidence,parentStateRef:'same-state',candidateStateRef:'same-state'}
});
assert.equal(identityCollision.decision,'ESCALATE');
assert.ok(identityCollision.hardVetoes.includes('STATE_TRANSITION_IDENTITY_COLLISION'));

const source=fs.readFileSync('src7/heightenedModeR457.ts','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
for(const token of [
 "futureRetention:'PRESERVE_CAPABILITY'",
 "pruneAuthority:'EXPLICIT_PARITY_AND_REPLACEMENT_PROOF_REQUIRED'",
 "authority:'PRESENTATION_ONLY'",
 "contradictionAndScarPolicy:'RETAIN_DO_NOT_NORMALIZE_AWAY'",
 "futureTopologyPolicy:'PRESERVE_CAPABILITY_UNTIL_EXPLICIT_REPLACEMENT_PROOF'",
 "R457_DEVELOPMENTAL_SEQUENCE",
 "R457_AUTHORITATIVE_PROOF_FAMILIES",
 "evaluateDevelopmentalTransitionR457",
 "S=(CΩ·Φ)/(q+Λ+ε)",
 "PRUNE_TRANSLATE_PROVE"
])assert.ok(source.includes(token),'R457 source contract missing '+token);
assert.ok(root.includes("import {OMEGA7_HEIGHTENED_SUMMARY} from './heightenedModeR457'"),'OMEGA7 status must bind the Heightened Mode architecture summary');
assert.ok(root.includes('OMEGA7_HEIGHTENED_SUMMARY.capabilityCount')&&root.includes('OMEGA7_HEIGHTENED_SUMMARY.familyCount'),'System status must expose capability/composition separation without changing authority');

const developmentalLedger=JSON.parse(fs.readFileSync('src7/heightenedModeR457.ledger.json','utf8'));
assert.equal(developmentalLedger.schema,'OMEGA7_HEIGHTENED_DEVELOPMENTAL_LEDGER_R457');
assert.equal(developmentalLedger.sourceBaseMain,'5355a5c4f3438052794f2e578baa5d8ff33e3739');
assert.equal(developmentalLedger.inheritedRepair.pullRequest,896);
assert.equal(developmentalLedger.inheritedRepair.exactHead,'6300f00b63d639a3a517b5aed7848eb22daf3de3');
assert.equal(developmentalLedger.inheritedRepair.proofFamilies,'8_OF_8_SUCCESS');
assert.equal(developmentalLedger.mode.id,'HEIGHTENED_MODE');
assert.equal(developmentalLedger.mode.classification,'DERIVED_WOVEN_DEVELOPMENTAL_CONTINUITY_LENS');
assert.equal(developmentalLedger.mode.newPhysicalPrimitive,false);
assert.equal(developmentalLedger.mode.physicalDimensionClaim,false);
assert.deepEqual(developmentalLedger.resolutionBoundary.levels,[12,144,1728,20736,248832]);
assert.equal(developmentalLedger.resolutionBoundary.classification,'REPRESENTATIONAL_ADDRESS_RESOLUTION_ONLY');
assert.equal(developmentalLedger.resolutionBoundary.canonicalAddressAuthority,'R125_CANONSTATE');
assert.deepEqual(developmentalLedger.architecture.order,['CAPABILITY','COMPOSITION','PRESENTATION']);
assert.equal(developmentalLedger.architecture.presentationAuthority,'PRESENTATION_ONLY');
assert.equal(developmentalLedger.developmentalEquivalence.currentStateDistanceRequired,true);
assert.equal(developmentalLedger.developmentalEquivalence.futureConeDistanceRequired,true);
assert.equal(developmentalLedger.developmentalEquivalence.visualSimilarityAloneSufficient,false);
assert.equal(developmentalLedger.developmentalEquivalence.branchCountMayMasqueradeAsPlasticity,false);
assert.equal(developmentalLedger.retirement.legacyRetired,0);
assert.equal(developmentalLedger.retirement.defaultDecision,'HOLD');
assert.equal(developmentalLedger.retirement.zeroLossRequired,true);
assert.equal(developmentalLedger.retirement.futureRoleEquivalenceRequired,true);
assert.equal(developmentalLedger.acceptedBase.fullProductParity,44);
assert.equal(developmentalLedger.acceptedBase.rollback,44);
assert.equal(developmentalLedger.acceptedBase.legacyRetired,0);
assert.equal(developmentalLedger.authority.canonAdmission,'R125');
assert.equal(developmentalLedger.authority.sourcePromotion,'UNCHANGED');
assert.equal(developmentalLedger.authority.hybridExecution,'UNCHANGED');
assert.equal(developmentalLedger.authority.productionDeploymentWorkflow,'UNCHANGED');
assert.equal(developmentalLedger.authority.forecastingGrantsPromotion,false);
assert.equal(developmentalLedger.retention.evidence,'IMMUTABLE_REFERENCE_REQUIRED');
assert.equal(developmentalLedger.retention.provenance,'RETAIN');
assert.equal(developmentalLedger.retention.stateScars,'RETAIN');
assert.equal(developmentalLedger.retention.developmentalScars,'RETAIN');
assert.equal(developmentalLedger.proof.authoritativeFamilies.length,8);
assert.equal(developmentalLedger.proof.exactHeadRequired,true);
assert.equal(developmentalLedger.proof.bypassAllowed,false);
assert.equal(developmentalLedger.canonicalMutation,false);

console.log('R457 HEIGHTENED MODE PASS · 44 capabilities · 8 compositions · 6 human domains · capability/composition/presentation separated · future topology retained · legacy retired 0');

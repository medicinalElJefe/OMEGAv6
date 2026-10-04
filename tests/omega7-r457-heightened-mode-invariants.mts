import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_CAPABILITIES} from '../src7/capabilityRegistry.ts';
import {OMEGA7_FAMILY_CONTRACTS} from '../src7/familyParityR452.ts';
import {
 R457_SCHEMA,
 OMEGA7_HEIGHTENED_CAPABILITIES,
 OMEGA7_HEIGHTENED_SUMMARY,
 composeHeightenedR457,
 evaluateRetirementR457
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

const source=fs.readFileSync('src7/heightenedModeR457.ts','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
for(const token of [
 "futureRetention:'PRESERVE_CAPABILITY'",
 "pruneAuthority:'EXPLICIT_PARITY_AND_REPLACEMENT_PROOF_REQUIRED'",
 "authority:'PRESENTATION_ONLY'",
 "contradictionAndScarPolicy:'RETAIN_DO_NOT_NORMALIZE_AWAY'",
 "futureTopologyPolicy:'PRESERVE_CAPABILITY_UNTIL_EXPLICIT_REPLACEMENT_PROOF'"
])assert.ok(source.includes(token),'R457 source contract missing '+token);
assert.ok(root.includes("import {OMEGA7_HEIGHTENED_SUMMARY} from './heightenedModeR457'"),'OMEGA7 status must bind the Heightened Mode architecture summary');
assert.ok(root.includes('OMEGA7_HEIGHTENED_SUMMARY.capabilityCount')&&root.includes('OMEGA7_HEIGHTENED_SUMMARY.familyCount'),'System status must expose capability/composition separation without changing authority');

console.log('R457 HEIGHTENED MODE PASS · 44 capabilities · 8 compositions · 6 human domains · capability/composition/presentation separated · future topology retained · legacy retired 0');

import assert from 'node:assert/strict';
import {approvalMatchesR479,buildResearchIntakeDeltaR479,ledgerKindsR479,symmetryInteractionR479,usablePowerR479,validateLedgerRecordR479,validateMetaAtomCandidateR479,validatePixelFieldProvenanceR479} from '../src/system/researchIntakeRuntimeDeltaR479.ts';

const d=buildResearchIntakeDeltaR479();
assert.deepEqual(d.atlasResolutions,[12,144,1728,20736,248832]);
assert.ok(d.laws.includes('QUEUE_SUCCESS_IS_NOT_CANONICAL_ADMISSION'));
assert.ok(d.inheritedAuthorities.includes('R125_CANON_ADMISSION'));

assert.equal(validateLedgerRecordR479({kind:'SCAR',recordId:'s1',parentRecordId:null,payloadHash:'h',authorityRef:'R467',canonicalAdmission:false}),true);
assert.deepEqual(ledgerKindsR479([
 {kind:'PROOF',recordId:'p',parentRecordId:null,payloadHash:'h',authorityRef:'R210',canonicalAdmission:false},
 {kind:'SCAR',recordId:'s',parentRecordId:null,payloadHash:'h2',authorityRef:'R467',canonicalAdmission:false},
]),['PROOF','SCAR']);

const approval={owningAgentId:'a',resolvedToolId:'t',toolSchemaHash:'s',normalizedArgumentsHash:'x',parentStateHash:'p',approvalReceiptHash:'r',expiresAt:'2099-01-01T00:00:00Z'};
assert.equal(approvalMatchesR479(approval,{agentId:'a',toolId:'t',toolSchemaHash:'s',normalizedArgumentsHash:'x',parentStateHash:'p'},0),true);
assert.equal(approvalMatchesR479(approval,{agentId:'b',toolId:'t',toolSchemaHash:'s',normalizedArgumentsHash:'x',parentStateHash:'p'},0),false);

assert.equal(usablePowerR479({nameplateWatts:100,firmDeliverableWatts:80,coolingWatts:90,reserveFraction:.25,measuredAt:'2026-10-05T00:00:00Z'}),60);
assert.equal(symmetryInteractionR479(1,3,4,10),4);

assert.equal(validatePixelFieldProvenanceR479({sourceHash:'h',opticalTransferHash:null,polarizationStateHash:null,digitalTransformHash:null,class:'RAW_OBSERVATION'}),true);
assert.equal(validatePixelFieldProvenanceR479({sourceHash:'h',opticalTransferHash:'o',polarizationStateHash:'p',digitalTransformHash:null,class:'OPTICALLY_TRANSFORMED'}),true);
assert.equal(validatePixelFieldProvenanceR479({sourceHash:'h',opticalTransferHash:'o',polarizationStateHash:null,digitalTransformHash:null,class:'RAW_OBSERVATION'}),false);

assert.equal(validateMetaAtomCandidateR479({thetaDeg:0,lengthNm:290,widthNm:105,heightNm:575,refractiveIndex:2.4,phaseRad:0,amplitude:1,dop:1,efficiency:.8,bandwidthNm:60,fabricationPassProbability:.9}),true);
console.log('R479 research-intake runtime delta invariants: PASS');

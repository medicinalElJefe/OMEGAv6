import assert from 'node:assert/strict';
import fs from 'node:fs';
import { capabilityContractR509, contractLaneR509, r509ContractKeys, validateCapabilityContractR509, R509_CAPABILITY_CONTRACT_SCHEMA } from '../src/system/capabilityContractsR509.js';
import { parseConvergenceBacklogR388, selectNextConvergenceItemR388, evaluateCurrentConvergenceSourceR507, validateConvergenceRepairR450 } from '../src/system/convergenceBacklogR388.js';
import { finiteConvergencePotentialR507 } from '../src/system/finiteConvergenceGovernorR507.js';

const markdown=fs.readFileSync('docs/OMEGA_MISSING_CAPABILITY_CONVERGENCE_R386.md','utf8');
const rows=parseConvergenceBacklogR388(markdown);
assert.equal(rows.length,155,'R509 must qualify against the complete 155-row convergence matrix');

const dRows=rows.filter(row=>row.section==='D');
assert.equal(dRows.length,7,'SAR section identity drifted');
assert.equal(dRows[0].completed,true,'D-01 remains historical completed context');
assert.deepEqual(r509ContractKeys(),['D-02','D-03','D-04','D-05','D-06','D-07']);

for(const key of r509ContractKeys()){
 const item=rows.find(row=>row.id==='R388-'+key);
 const contract=capabilityContractR509(key);
 assert.ok(item&&contract,'missing R509 contract '+key);
 assert.equal(contract.schema,R509_CAPABILITY_CONTRACT_SCHEMA);
 assert.equal(item.acceptanceContract,contract,key+' must use the R509 contract registry');
 const checked=validateCapabilityContractR509(contract,item);
 assert.equal(checked.valid,true,key+' invalid: '+checked.reasons.join(','));
 assert.equal(contract.objectiveExact,item.objective,key+' objective must be exact and drift-detecting');
 assert.ok(contract.evidencePredicates.length>=2,key+' needs explicit positive evidence predicates');
 assert.ok(contract.falsifiers.length>=2,key+' needs explicit falsifiers');
 assert.ok(contract.requiredProofs.length>=1,key+' needs independent proof families');
 assert.ok(contract.truthBoundary.length>=80,key+' needs a concrete truth boundary');
}

for(const key of ['D-02','D-03','D-04']){
 const item=rows.find(row=>row.id==='R388-'+key);
 const lane=contractLaneR509(item);
 assert.equal(lane.mutationReady,false,key+' external/host evidence debt must not authorize product mutation');
 assert.equal(lane.externalEvidenceReady,true,key+' must remain explicit returned-evidence debt');
}

for(const key of ['D-05','D-06']){
 const item=rows.find(row=>row.id==='R388-'+key);
 const lane=contractLaneR509(item);
 assert.equal(lane.mutationReady,false,key+' proof-only contract must not authorize product mutation');
 assert.equal(lane.currentSourceProofReady,true,key+' must be eligible only for governed current-source proof');
 const files=item.acceptanceContract.currentSourceProof.requiredPathTokens.map(spec=>({path:spec.path,sha:'a'.repeat(40),text:fs.readFileSync(spec.path,'utf8')}));
 const proof=evaluateCurrentConvergenceSourceR507({item,sourceFiles:files});
 assert.equal(proof.satisfied,true,key+' exact current source failed its explicit proof: '+proof.reasons.join(','));
}

const d07=rows.find(row=>row.id==='R388-D-07');
const d07Lane=contractLaneR509(d07);
assert.equal(d07Lane.liveBrowserProofReady,true);
assert.equal(d07Lane.mutationReady,false,'D-07 cannot mutate product source merely to make visual proof easier');
assert.equal(d07Lane.currentSourceProofReady,false,'D-07 stays open until a non-text live visual-signature proof exists');

const d02=rows.find(row=>row.id==='R388-D-02');
const forbiddenMutation=validateConvergenceRepairR450({item:d02,proposal:{files:[{path:'src/SARLiveTruthR285.tsx',replacements:[{before:'x',after:'y'}]}]}});
assert.equal(forbiddenMutation.valid,false);
assert.equal(forbiddenMutation.state,'R509_CONTRACT_NOT_SOURCE_MUTATION');
assert.ok(forbiddenMutation.reasons.some(x=>x.includes('R509_SOURCE_MUTATION_NOT_AUTHORIZED')));

const currentEpoch=selectNextConvergenceItemR388({
 markdown,
 advancedItemIds:['R388-A-01','R388-A-05','R388-B-02','R388-B-03','R388-C-02','R388-C-03','R388-C-05'],
 heldItemIds:['R388-A-02','R388-A-03'],
});
assert.equal(currentEpoch.candidates.length,0,'no R509 SAR evidence/proof contract may leak into product mutation');
assert.deepEqual(currentEpoch.proofCandidates.map(x=>x.id),['R388-D-05','R388-D-06']);
assert.equal(currentEpoch.eligibleCount,0);
assert.equal(currentEpoch.proofReadyCount,2);
assert.deepEqual(currentEpoch.externalEvidenceDebt,['R388-D-02','R388-D-03','R388-D-04']);
assert.deepEqual(currentEpoch.liveBrowserProofDebt,['R388-D-07']);
assert.equal(currentEpoch.potential.mutationBudget,0);
assert.equal(currentEpoch.potential.proofBudget,2);
assert.equal(currentEpoch.potential.actionBudget,2);
assert.equal(currentEpoch.potential.state,'ACTIVE_PROOF');

const finite=finiteConvergencePotentialR507({
 selfBuildState:{maxAutonomousGenerations:5,admittedSourceCapsules:['SG001','SG002','SG003','SG004','SG005']},
 retry:{allow:false,remaining:0},
 backlog:currentEpoch,
 openAutonomousCandidates:0,
});
assert.equal(finite.mutationBudget,0,'proof-only SAR work must not inflate mutation budget');
assert.equal(finite.r388ProofRemaining,2);
assert.equal(finite.actionBudget,2);
assert.equal(finite.terminalForCurrentEvidence,false,'qualified proof-only work should re-enter the governed proof path');

const afterProofs=selectNextConvergenceItemR388({
 markdown,
 advancedItemIds:['R388-A-01','R388-A-05','R388-B-02','R388-B-03','R388-C-02','R388-C-03','R388-C-05','R388-D-05','R388-D-06'],
 heldItemIds:['R388-A-02','R388-A-03'],
});
assert.equal(afterProofs.proofReadyCount,0);
assert.equal(afterProofs.eligibleCount,0);
assert.equal(afterProofs.potential.actionBudget,0);
assert.equal(afterProofs.potential.state,'AWAIT_LIVE_BROWSER_PROOF');
assert.ok(afterProofs.needsAcceptanceContractCount>0,'remaining unqualified rows must stay visible as contract debt');
assert.deepEqual(afterProofs.externalEvidenceDebt,['R388-D-02','R388-D-03','R388-D-04']);
assert.deepEqual(afterProofs.liveBrowserProofDebt,['R388-D-07']);

const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
for(const token of ['backlog.proofCandidates','R509_QUALIFIED_NON_MUTATION_CONTRACT_NOT_YET_SATISFIED','finiteConvergence.actionBudget<=0','R509_ZERO_ACTION_BUDGET']) assert.ok(machine.includes(token),'R509 production scheduler missing '+token);

console.log('R509 FALSIFIABLE CAPABILITY CONTRACTS PASS · SAR D-02…D-07 explicitly qualified · external/host proof held · D-05/D-06 proof-only · D-07 non-text live proof debt · zero source-mutation leakage');

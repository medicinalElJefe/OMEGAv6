import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 parseConvergenceBacklogR388,
 selectNextConvergenceItemR388,
 evaluateCurrentConvergenceSourceR507,
 declineHoldDispositionR509,
} from '../src/system/convergenceBacklogR388.js';

const markdown=fs.readFileSync('docs/OMEGA_MISSING_CAPABILITY_CONVERGENCE_R386.md','utf8');
const rows=parseConvergenceBacklogR388(markdown);
const b04=rows.find(row=>row.id==='R388-B-04');
const a02=rows.find(row=>row.id==='R388-A-02');

assert.ok(b04,'B-04 must exist');
assert.equal(b04.acceptanceContract?.revision,'R509');
assert.equal(b04.acceptanceContract?.supersedesLegacyDeclines,true);
assert.ok(b04.acceptanceContract?.currentSourceProof,'B-04 must prefer exact current-source proof before mutation');
assert.deepEqual(b04.affected,[
 'src/OmegaWorkstationFullV2.tsx',
 'src/InstrumentOSShellR62.tsx',
 'src/omegaSideNavigatorR88.css',
 'src/omegaNavigationShellR411.css',
]);

const exactSources=b04.affected.map((path,index)=>({
 path,
 sha:String(index+1).repeat(40),
 text:fs.readFileSync(path,'utf8'),
}));
const sourceProof=evaluateCurrentConvergenceSourceR507({item:b04,sourceFiles:exactSources});
assert.equal(sourceProof.satisfied,true,sourceProof.reasons.join(','));
assert.equal(sourceProof.state,'CURRENT_SOURCE_SATISFIES_OBJECTIVE_PENDING_INDEPENDENT_PROOF');
assert.equal(sourceProof.sourceRefs.length,4);

const brokenMobile=evaluateCurrentConvergenceSourceR507({
 item:b04,
 sourceFiles:exactSources.map(row=>row.path==='src/omegaNavigationShellR411.css'
  ?{...row,text:row.text.replace('R411.11 · MOBILE USABLE VIEWPORT OWNERSHIP','R411.11 · REMOVED MOBILE OWNERSHIP')}
  :row),
});
assert.equal(brokenMobile.satisfied,false,'removing the mobile usable-viewport authority must invalidate B-04 source proof');

const legacyB04=declineHoldDispositionR509(b04,[{
 itemId:'R388-B-04',
 acceptanceContractRevision:null,
 state:'NO_SAFE_PATCH',
}]);
assert.equal(legacyB04.held,false,'R509 B-04 contract must supersede the pre-contract legacy decline exactly once');
assert.equal(legacyB04.superseded.length,1);

const sameEpochB04=declineHoldDispositionR509(b04,[{
 itemId:'R388-B-04',
 acceptanceContractRevision:'R509',
 state:'NO_SAFE_PATCH',
}]);
assert.equal(sameEpochB04.held,true,'a decline produced under R509 must hold another R509 attempt');
assert.equal(sameEpochB04.active.length,1);

assert.ok(a02?.acceptanceContract,'A-02 must retain its existing acceptance contract');
const legacyA02=declineHoldDispositionR509(a02,[{
 itemId:'R388-A-02',
 acceptanceContractRevision:null,
 state:'SEMANTIC_ACCEPTANCE_REJECTED',
}]);
assert.equal(legacyA02.held,true,'legacy A-02 decline remains active because its contract does not supersede legacy evidence');

const legacyFrontier=selectNextConvergenceItemR388({
 markdown,
 advancedItemIds:['R388-B-02','R388-B-03','R388-C-01','R388-C-02','R388-C-03','R388-C-05'],
 heldItemIds:['R388-A-02','R388-A-03','R388-B-04'],
});
assert.equal(legacyFrontier.selected?.id,'R388-B-04','B-04 must become the first finite successor under its new explicit R509 contract');
assert.ok(legacyFrontier.supersededDeclineEvidence.some(row=>row.itemId==='R388-B-04'));
assert.ok(legacyFrontier.heldRecentDeclines.includes('R388-A-02'));
assert.ok(legacyFrontier.heldRecentDeclines.includes('R388-A-03'));

const heldR509Frontier=selectNextConvergenceItemR388({
 markdown,
 advancedItemIds:['R388-B-02','R388-B-03','R388-C-01','R388-C-02','R388-C-03','R388-C-05'],
 heldItemIds:['R388-A-02','R388-A-03'],
 heldItemEvidence:[{itemId:'R388-B-04',acceptanceContractRevision:'R509',state:'NO_SAFE_PATCH'}],
});
assert.notEqual(heldR509Frontier.selected?.id,'R388-B-04','same-revision R509 evidence must prevent another B-04 attempt');
assert.ok(heldR509Frontier.heldRecentDeclines.includes('R388-B-04'));

const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
for(const token of [
 'recentDeclinedItemScars',
 'heldItemEvidence:recentDeclinedItemScars',
 'acceptanceContractRevision:item.acceptanceContract?.revision||null',
 "acceptanceContractRevision:item.acceptanceContract?.revision||null,state:'SEMANTIC_ACCEPTANCE_REJECTED'",
 "acceptanceContractRevision:item.acceptanceContract?.revision||null,state:'PROOF_REJECTED_PATCH_REPEAT'",
 'R507_CURRENT_SOURCE_SATISFIES_OBJECTIVE_PENDING_INDEPENDENT_PROOF',
])assert.ok(machine.includes(token),`R509 machine transport missing ${token}`);

console.log('R509 CONTRACT-EPOCH B-04 PASS · legacy scar superseded once · same-revision scar holds · exact responsive source satisfies B-04 pending full R241 proof');

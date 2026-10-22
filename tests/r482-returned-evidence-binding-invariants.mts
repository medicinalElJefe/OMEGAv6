import assert from 'node:assert/strict';
import {compileTruthGateClosureFrontierR480} from '../src/system/truthGateClosureFrontierR480';
import {evidenceIdsFromReturnedReceiptsR482,evaluateReceiptBoundClosureR482} from '../src/system/returnedEvidenceBindingR482';

const frontier=compileTruthGateClosureFrontierR480();
const by=(id:string)=>{const x=frontier.find(v=>v.capabilityId===id);assert.ok(x,id);return x!};

const hybrid=by('HYBRID');
assert.equal(evaluateReceiptBoundClosureR482(hybrid,[{kind:'HYBRID_SNAPSHOT',current:true,authenticated:true,nonRevoked:true}]).closure.closed,false);
assert.equal(evaluateReceiptBoundClosureR482(hybrid,[
 {kind:'HYBRID_SNAPSHOT',current:true,authenticated:true,nonRevoked:true},
 {kind:'HOST_PROFILE',current:true,authenticated:true,r141ExactFingerprint:true,profileReturned:true},
 {kind:'MISSION_RETURN',current:true,authenticated:true,r141ExactFingerprint:true,missionReturned:true}
]).closure.closed,true);

const optical=by('OPTICAL');
assert.equal(evaluateReceiptBoundClosureR482(optical,[{kind:'RCWA_RESULT',current:true,authenticated:true,solverHeartbeat:true,fullwaveReturned:true,converged:false,energyBalanced:true}]).closure.closed,false);
assert.equal(evaluateReceiptBoundClosureR482(optical,[{kind:'RCWA_RESULT',current:true,authenticated:true,solverHeartbeat:true,fullwaveReturned:true,converged:true,energyBalanced:true}]).closure.closed,true);

const stale=evidenceIdsFromReturnedReceiptsR482([{kind:'EARTH_PROVIDER',current:false,providerResponse:true,sourceTimestamp:true,provenance:true,stalenessClassified:true}]);
assert.equal(stale.includes('CURRENT_PROVIDER_RESPONSE'),false);
assert.equal(stale.includes('SOURCE_TIMESTAMP'),true);

const fake=evidenceIdsFromReturnedReceiptsR482([{kind:'HOST_PROFILE',current:true,authenticated:false,r141ExactFingerprint:true,profileReturned:true,gpuPresent:true}]);
assert.equal(fake.includes('RETURNED_GPU_PROFILE'),false);
assert.equal(fake.includes('CURRENT_DEVICE_OR_BROWSER_GPU_CAPABILITY'),false);

console.log('R482 RETURNED EVIDENCE BINDING PASS · closure evidence derives from returned receipt fields and cannot self-synthesize');

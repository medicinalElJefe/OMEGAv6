import assert from 'node:assert/strict';
import {compileTruthGateClosureFrontierR480,evaluateReturnedClosureR480} from '../src/system/truthGateClosureFrontierR480';

const frontier=compileTruthGateClosureFrontierR480();
for(const id of ['GPU','GPU_NATIVE_V12','HYBRID','OPTICAL','SAR','EARTH_EVIDENCE'])assert.ok(frontier.some(x=>x.capabilityId===id),id+' missing from closure frontier');
for(const id of ['GPU','GPU_NATIVE_V12','HYBRID','OPTICAL'])assert.equal(frontier.find(x=>x.capabilityId===id)?.state,'IMPLEMENTED_AWAITING_RETURN');
assert.equal(frontier.find(x=>x.capabilityId==='SAR')?.state,'EXTERNAL_EVIDENCE_REQUIRED');
assert.equal(frontier.find(x=>x.capabilityId==='EARTH_EVIDENCE')?.state,'EXTERNAL_EVIDENCE_REQUIRED');
assert.ok(frontier.some(x=>x.state==='ADAPTER_REQUIRES_DIRECT_EXECUTOR'));
assert.ok(frontier.every(x=>x.maySelfClose===false));

const hybrid=frontier.find(x=>x.capabilityId==='HYBRID')!;
const partial=evaluateReturnedClosureR480(hybrid,['CURRENT_AUTHENTICATED_NON_REVOKED_HEARTBEAT']);
assert.equal(partial.closed,false);
assert.ok(partial.missing.includes('R141_EXACT_RETURN_FINGERPRINT'));
const full=evaluateReturnedClosureR480(hybrid,hybrid.requiredEvidence);
assert.equal(full.closed,true);
assert.equal(full.canonicalAdmission,false);
assert.equal(full.admissionAuthority,'R125');

const optical=frontier.find(x=>x.capabilityId==='OPTICAL')!;
assert.equal(evaluateReturnedClosureR480(optical,['CURRENT_SOVEREIGN_SOLVER_HEARTBEAT','RETURNED_RCWA_OR_OTHER_DECLARED_FULLWAVE_RESULT']).closed,false);
assert.equal(evaluateReturnedClosureR480(optical,optical.requiredEvidence).closed,true);
console.log('R480 TRUTH-GATE CLOSURE FRONTIER PASS · no truth gate self-closes without its complete returned evidence contract');

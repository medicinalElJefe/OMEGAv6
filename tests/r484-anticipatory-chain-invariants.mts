import assert from 'node:assert/strict';import {anticipatoryChainR484,R484_CHAIN_STAGES} from '../src/system/anticipatoryChainEnvelopeR484';
const proof=['R210 Release Controller','R223 Cloudflare Evolution Authority','R202 Operational Source Authority','OMEGA Cloud Bridge CI','R170 Current Convergence','OMEGA R237 Hybrid Command Authority Proof','OMEGA R238 Woven Hybrid Continuity Convergence','R241 Archive Convergence Visual Intelligence'];
assert.equal(new Set(R484_CHAIN_STAGES.map(x=>x.id)).size,R484_CHAIN_STAGES.length);
let a=anticipatoryChainR484({dependencyChanged:true,securityAuditPassed:false,canonicalCheckPassed:true,proofFamiliesPassed:proof,browserProofPassed:true,deploymentExpected:false,returnProofPassed:false,rollbackAvailable:true});
assert.equal(a.readyForAdmission,false);assert.ok(a.missing.includes('SECURITY_AUDIT'));
a=anticipatoryChainR484({dependencyChanged:true,securityAuditPassed:true,canonicalCheckPassed:true,proofFamiliesPassed:proof,browserProofPassed:true,deploymentExpected:false,returnProofPassed:false,rollbackAvailable:true});
assert.equal(a.readyForAdmission,true);assert.equal(a.canonicalMutation,false);
console.log('R484 ANTICIPATORY CHAIN PASS · dependency→security→check→proof→browser→merge→deploy→return→recovery');

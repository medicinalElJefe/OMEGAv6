import assert from 'node:assert/strict';
import {test} from 'node:test';
import {B053_RECOVERY_R665,B053_CAPABILITIES_R665,validateRecoveryR665,capabilityAdmissionR665} from '../src7/workspaces/historicalConvergenceR665.ts';
test('verified recovery is distinguished from runtime proof',()=>{assert.equal(B053_RECOVERY_R665.verifiedFiles,1800);assert.equal(B053_RECOVERY_R665.hashErrors,0);assert.equal(B053_RECOVERY_R665.physicalMatterAccuracy,'NOT_ESTABLISHED');assert.equal(validateRecoveryR665().ok,true)});
test('source inspection cannot claim executable admission',()=>{assert.equal(capabilityAdmissionR665('b053.world','SOURCE_INSPECTED').admitted,true);assert.equal(capabilityAdmissionR665('b053.world','RUNTIME_VERIFIED').admitted,false);assert.equal(capabilityAdmissionR665('b053.world','PRODUCTION_VERIFIED').admitted,false)});
test('missing capability cannot pass gate',()=>{assert.equal(capabilityAdmissionR665('missing','ARCHIVE_HASH_VERIFIED').admitted,false)});
test('duplicate and malformed hash are rejected',()=>{const a=B053_CAPABILITIES_R665[0];assert.equal(validateRecoveryR665([a,a]).ok,false);assert.equal(validateRecoveryR665([{...a,sha256:'not-a-hash'}]).ok,false)});

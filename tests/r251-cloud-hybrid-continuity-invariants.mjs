import assert from 'node:assert/strict';
import {deriveCloudHybridContinuityR251,admitPcAssistReceiptR251,R251_CLOUD_HYBRID_CONTINUITY_CONTRACT} from '../src/system/cloudHybridContinuityR251.js';

const HEAD='bfb22c7d0a724d6d6415b0ae786affc14bbaa21f';

const offline=deriveCloudHybridContinuityR251({cloudHeadSha:HEAD,cloudProductionProof:'FAILURE',pc:null});
assert.equal(offline.schema,R251_CLOUD_HYBRID_CONTINUITY_CONTRACT);
assert.equal(offline.cloud.evolution,'CONTINUE_NON_BLOCKING');
assert.equal(offline.cloud.pcRequiredForEvolution,false);
assert.equal(offline.cloud.productionPromotion,'HELD_BY_EXISTING_PROOF_GATES');
assert.equal(offline.pc.role,'DETACHED');
assert.equal(offline.authority.pcMayOverrideCloud,false);
assert.equal(offline.authority.productionWriter,'CI_YML_ONLY');
assert.equal(offline.authority.canonicalAdmission,'R125_ONLY');

const stale=deriveCloudHybridContinuityR251({cloudHeadSha:HEAD,cloudProductionProof:'SUCCESS',pc:{online:true,stale:false,cloudHeadSha:'older',resourceTier:'HIGH_CAPACITY'},preference:'AUTO'});
assert.equal(stale.pc.role,'CATCH_UP');
assert.equal(stale.pc.catchupRequired,true);
assert.equal(stale.pc.catchupTargetSha,HEAD);
assert.equal(stale.pc.assistAdmissible,false);
assert.deepEqual(admitPcAssistReceiptR251({baseSha:'older',deviceId:'pc-1'},stale),{accepted:false,reason:'PC_ASSIST_NOT_ADMISSIBLE'});

const ready=deriveCloudHybridContinuityR251({cloudHeadSha:HEAD,cloudProductionProof:'SUCCESS',pc:{online:true,stale:false,cloudHeadSha:HEAD,resourceTier:'READY'},preference:'AUTO'});
assert.equal(ready.pc.role,'ASSIST');
assert.equal(ready.pc.synchronization,'CAUGHT_UP');
assert.equal(ready.pc.assistAdmissible,true);
assert.deepEqual(admitPcAssistReceiptR251({baseSha:HEAD,deviceId:'pc-1'},ready),{accepted:true,reason:'EXACT_CLOUD_HEAD_ASSIST_RECEIPT',canonicalAdmission:false});
assert.deepEqual(admitPcAssistReceiptR251({baseSha:'older',deviceId:'pc-1'},ready),{accepted:false,reason:'STALE_OR_MISMATCHED_CLOUD_HEAD'});

const observe=deriveCloudHybridContinuityR251({cloudHeadSha:HEAD,cloudProductionProof:'SUCCESS',pc:{online:true,stale:false,cloudHeadSha:HEAD,resourceTier:'HIGH_CAPACITY'},preference:'OBSERVE'});
assert.equal(observe.pc.role,'OBSERVE');
assert.equal(observe.pc.assistAdmissible,false);

console.log('R251 CLOUD/HYBRID CONTINUITY PASS');

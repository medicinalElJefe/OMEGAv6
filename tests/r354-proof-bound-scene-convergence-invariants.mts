import assert from'node:assert/strict';
import fs from'node:fs';
import{compileCanonicalTypedFieldR349}from'../src/system/wovenHardwareFieldR349';
import{compileProofBoundSceneR354,bindGpuCorrespondenceR354,R354_BOUNDARY,R354_SCHEMA}from'../src/system/proofBoundSceneR354';

const currentSha='29f7e0d4e1ce85fddfccededf1c99c63ac5909a4',worker='125c9d17-e2f4-4e17-b722-68ca99945d1f',receipt='c'.repeat(64);
const evidence={releaseEvidence:{source:{sha:currentSha},promotionLineage:{promotedMergeSha:currentSha},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},runtimeAttestation:{source:{sha:currentSha},bindings:{sourceSha:currentSha,packageReceiptSha256:receipt,cloudflareVersionId:worker},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},buildReceipt:{receiptSha256:receipt}};
const sampler=(a:number)=>({continuity:(a%144)/143,plasticity:(a%12)/11,burden:((a>>1)%12)/11,contradiction:((a>>2)%12)/11,scar:(a%5)/20,evidence:.8,invariantCarry:.25+(a%17)/68,motionRate:(a%9)/8,support:.5,orientation:1 as const});
const source=compileCanonicalTypedFieldR349(0,sampler);
const build=await compileProofBoundSceneR354({sourceField:source,evidence,steps:8,checkpointEvery:2,targetTick:4,nowTick:4});
const scene=build.scene;
assert.equal(scene.schema,R354_SCHEMA);assert.equal(scene.state,'CURRENT_RUNTIME_BOUND');assert.equal(scene.executionState,'CPU_REFERENCE_ONLY');assert.equal(scene.currentReleaseSha,currentSha);assert.equal(scene.currentWorkerVersion,worker);
assert.equal(scene.tick,4);assert.equal(scene.relation,'NOW');assert.equal(scene.fieldHash,build.replay.fieldHash);assert.equal(scene.packetCount,20736);assert.equal(scene.edgeCount,20735);
assert.equal(scene.proof.timelineDeterministic,true);assert.equal(scene.proof.checkpointIntegrity,true);assert.equal(scene.proof.packetExact,true);assert.equal(scene.proof.packetInputBound,true);assert.equal(scene.proof.currentRuntimeBound,true);
assert.equal(scene.proof.canonicalMutation,false);assert.equal(scene.proof.observedHistoryClaimed,false);assert.equal(scene.proof.physicalSimulationClaimed,false);assert.equal(scene.proof.durableHistoryClaimed,false);
assert.match(scene.releaseLineageSha256,/^[0-9a-f]{64}$/);assert.match(scene.sceneDigest,/^[0-9a-f]{64}$/);assert.notEqual(scene.sceneDigest,scene.releaseLineageSha256);

const verifiedGpu={state:'GPU_COMPUTE_VERIFIED',deviceExecutionProved:true,cpu:{outputHash:scene.renderStateOutputHash},gpu:{outputHash:scene.renderStateOutputHash,returnedWallMs:4.2},correspondence:{ok:true,compared:20736*4,maxAbsError:0,tolerance:2e-6}};
const gpuBound=await bindGpuCorrespondenceR354(scene,verifiedGpu);
assert.equal(gpuBound.executionState,'GPU_BOUND');assert.equal(gpuBound.proof.gpuCorrespondenceBound,true);assert.equal(gpuBound.gpu?.cpuHashMatch,true);assert.equal(gpuBound.gpu?.verified,true);assert.notEqual(gpuBound.sceneDigest,scene.sceneDigest);

const mismatch=await bindGpuCorrespondenceR354(scene,{...verifiedGpu,cpu:{outputHash:'deadbeef'}});
assert.equal(mismatch.executionState,'CPU_REFERENCE_ONLY');assert.equal(mismatch.proof.gpuCorrespondenceBound,false);assert.equal(mismatch.gpu?.cpuHashMatch,false);

const hold=await compileProofBoundSceneR354({sourceField:source,steps:2,checkpointEvery:1,targetTick:1,nowTick:1});
assert.equal(hold.scene.state,'MODEL_ONLY_HOLD');assert.equal(hold.scene.proof.currentRuntimeBound,false);assert.equal(hold.scene.proof.timelineDeterministic,true);
const defaultCorpusBuild=await compileProofBoundSceneR354({steps:0,checkpointEvery:1,targetTick:0,nowTick:0});assert.equal(defaultCorpusBuild.scene.proof.timelineDeterministic,true);assert.equal(defaultCorpusBuild.scene.packetCount,20736);

const core=fs.readFileSync('src/system/proofBoundSceneR354.ts','utf8'),surface=fs.readFileSync('src/OmegaProofBoundSceneR354.tsx','utf8'),suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8'),pkg=fs.readFileSync('package.json','utf8'),doc=fs.readFileSync('R354_PROOF_BOUND_SCENE_CONVERGENCE.md','utf8');
for(const token of['R349','R350','R351','R352','R353','NO_NEW_PHYSICAL_PRIMITIVE','sceneDigest'])assert.ok(core.includes(token),`R354 core missing ${token}`);
for(const token of['/api/release-evidence','/api/runtime-attestation','/omega-build-receipt.json','OmegaProofBoundSceneR354'])assert.ok((surface+suite).includes(token),`R354 integration missing ${token}`);
assert.ok(pkg.includes('"test:r354"'));assert.ok(pkg.includes('npm run test:r353 && npm run test:r354'));
for(const forbidden of['canonicalMutation:true','observedHistoryClaimed:true','physicalSimulationClaimed:true','durableHistoryClaimed:true'])assert.ok(!(core+surface+doc).includes(forbidden),`R354 forbidden claim ${forbidden}`);
assert.ok(R354_BOUNDARY.includes('R125')&&R354_BOUNDARY.includes('R141')&&R354_BOUNDARY.includes('ci.yml'));
console.log('R354 PROOF-BOUND SCENE PASS · current R353 runtime provenance + R350 deterministic replay + R351 exact packet/frame receipts + R352 derived render hash compose into one SHA-256 scene receipt · optional GPU return is accepted only with CPU hash correspondence · no new Canon/observation/physics/history/dispatch/production authority');

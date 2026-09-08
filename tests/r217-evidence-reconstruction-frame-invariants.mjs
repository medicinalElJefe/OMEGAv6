import assert from 'node:assert/strict';
import {executeEvidenceReconstructionFrameR217,manifestR217} from '../src/world/evidenceReconstructionFrameR217.js';

const h='a'.repeat(64),b='b'.repeat(64),c='c'.repeat(64),d='d'.repeat(64),e='e'.repeat(64),f='f'.repeat(64);
const request={state:'EVIDENCE_RECONSTRUCTION_INTENT_READY',requestSha256:h,missionId:'mission-r217',projectId:'project-r217',r214AnchorSha256:b,r213AttemptSha256:c,r211LineageSha256:d,r208WorldBindingOperationSha256:e,previousWorldHeadSha256:f,earthHash:'earth-evidence-hash',groundHash:'ground-evidence-hash',evidenceDigest:'scene-evidence-digest'};
const scene={eventAccepted:true,renderInputReady:true};
const full=await executeEvidenceReconstructionFrameR217({request,scene,performance:{continuity:.92,plasticity:.84,burden:.08,contradiction:.05}});
assert.equal(full.state,'EVIDENCE_RECONSTRUCTION_FRAME_RENDERED');
assert.equal(full.profile,'FULL_FIELD');
assert.equal(full.grid,24);
assert.equal(full.reconstructionExecuted,true);
assert.equal(full.renderedFrame,true);
assert.equal(full.renderReceipt,true);
assert.equal(full.evidenceBoundRepresentationalFrame,true);
assert.equal(full.empiricalPixelReconstruction,false);
assert.equal(full.computedPhotorealRealityProved,false);
assert.equal(full.solverValidityProved,false);
assert.equal(full.nativeExecutionClaimed,false);
assert.equal(full.federationClosureProved,false);
assert.equal(full.canonicalMutation,false);
assert.equal(full.r216RequestSha256,h);
assert.match(full.frameSha256,/^[a-f0-9]{64}$/);
assert.match(full.receiptSha256,/^[a-f0-9]{64}$/);
assert.ok(full.frameBytes>1000);
assert.match(full.frameSvg,/empirical pixels NOT reconstructed/i);
assert.match(full.frameSvg,/R217 · EVIDENCE-BOUND STATE RECONSTRUCTION/);

const repeat=await executeEvidenceReconstructionFrameR217({request,scene,performance:{continuity:.92,plasticity:.84,burden:.08,contradiction:.05}});
assert.equal(repeat.frameSha256,full.frameSha256,'same proof inputs must reproduce exact frame bytes');
assert.equal(repeat.receiptSha256,full.receiptSha256,'same proof inputs must reproduce exact receipt');

const conservative=await executeEvidenceReconstructionFrameR217({request,scene,performance:{continuity:.2,plasticity:.2,burden:.8,contradiction:.7}});
assert.equal(conservative.profile,'CONSERVATIVE');
assert.equal(conservative.grid,12);
assert.notEqual(conservative.frameSha256,full.frameSha256,'adaptive budget must materially change the bounded frame');

const changed=await executeEvidenceReconstructionFrameR217({request:{...request,evidenceDigest:'different-evidence'},scene,performance:{continuity:.92,plasticity:.84,burden:.08,contradiction:.05}});
assert.notEqual(changed.frameSha256,full.frameSha256,'evidence change must change exact frame bytes');

const held=await executeEvidenceReconstructionFrameR217({request:{...request,state:'HELD_FOR_PROOF'},scene,performance:{}});
assert.equal(held.state,'HELD_FOR_PROOF');
assert.equal(held.reconstructionExecuted,false);
assert.equal(held.renderedFrame,false);

const manifest=manifestR217();
assert.equal(manifest.revision,'R217');
assert.match(manifest.truthBoundary,/does not reconstruct empirical pixels/i);
assert.equal(manifest.authority.canonicalAdmission,'R125');
console.log('R217 evidence reconstruction frame invariants: PASS');

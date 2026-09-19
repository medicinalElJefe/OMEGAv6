import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 buildCommunicationContextR331,compileConversationMemoryR331,compileLearningMemoryR331,
 compileTrainingBatchR331,coherenceVectorR331,intelligenceManifestR331,selectMemoryR331
} from '../src/system/coherentLearningR331.js';

const user=compileConversationMemoryR331({role:'USER',text:'I prefer concise answers that preserve the proof boundary.',at:'2026-09-19T21:00:00Z'});
const model=compileConversationMemoryR331({role:'ASSISTANT',text:'Model-generated interpretation.',provider:'WORKERS_AI',evidenceStatus:'MODEL_SYNTHESIS',at:'2026-09-19T21:00:01Z'});
assert.equal(user.truthClass,'USER_STATED');
assert.equal(model.truthClass,'MODEL_SYNTHESIS');
assert.equal(user.canonicalAdmission,false);

const preference=compileLearningMemoryR331({kind:'USER_PREFERENCE',text:'Keep communication direct and retain exact SHAs when discussing builds.',trainingApproved:true,createdAt:'2026-09-19T21:01:00Z'});
const correction=compileLearningMemoryR331({kind:'CORRECTION',text:'Do not describe address resolution as literal physical dimensions.',trainingApproved:true,createdAt:'2026-09-19T21:02:00Z'});
const factualHeld=compileLearningMemoryR331({kind:'FACTUAL_LESSON',text:'Unproved factual lesson must remain held.',createdAt:'2026-09-19T21:03:00Z'});
const factual=compileLearningMemoryR331({kind:'FACTUAL_LESSON',text:'Evidence-bound fact.',evidenceReceiptIds:['proof:evidence:1'],trainingApproved:true,createdAt:'2026-09-19T21:04:00Z'});
const proceduralHeld=compileLearningMemoryR331({kind:'PROCEDURAL_LESSON',text:'Unproved procedure.',outcome:'SUCCESS',createdAt:'2026-09-19T21:05:00Z'});
const procedural=compileLearningMemoryR331({kind:'PROCEDURAL_LESSON',text:'Use exact-base two-parent promotion after full candidate proof.',outcome:'SUCCESS',proofReceiptIds:['proof:build:1'],trainingApproved:true,createdAt:'2026-09-19T21:06:00Z'});
assert.equal(preference.state,'ADMITTED_USER_PREFERENCE');
assert.equal(correction.state,'ADMITTED_USER_CORRECTION');
assert.equal(factualHeld.state,'REVIEW_REQUIRED_MISSING_EVIDENCE');
assert.equal(factual.state,'ADMITTED_EVIDENCE_BOUND');
assert.equal(proceduralHeld.state,'REVIEW_REQUIRED_MISSING_PROOF');
assert.equal(procedural.state,'ADMITTED_PROOF_BOUND');

const memory=[user,model,preference,correction,factualHeld,factual,procedural];
const selected=selectMemoryR331(memory,'How should the build promotion proof communicate exact SHA and physical dimension boundaries?',10);
assert.ok(selected.some(x=>x.memoryId===preference.memoryId));
assert.ok(selected.some(x=>x.memoryId===correction.memoryId));
const context=buildCommunicationContextR331(memory,'Explain the build and keep it direct.',{metrics:{continuity:.8,plasticity:.7,contradiction:.1,burden:.2,evidence:.9}});
assert.equal(context.canonicalAdmission,false);
assert.ok(context.coherence.communicationCoherence>0);
assert.ok(['STAY','TURN','ESCALATE'].includes(context.coherence.decision));
assert.ok(context.communicationLaws.includes('MODEL_SYNTHESIS_MEMORY_MAY_SUPPORT_CONTINUITY_BUT_NEVER_SELF_PROMOTES_TO_FACT'));

const stressed=coherenceVectorR331({metrics:{continuity:.2,plasticity:.2,contradiction:.9,burden:.9,evidence:.2}},[correction]);
assert.equal(stressed.decision,'ESCALATE');

const batch=compileTrainingBatchR331(memory);
assert.equal(batch.directWeightMutation,false);
assert.equal(batch.requiresTrainLocalReceipt,true);
assert.equal(batch.canonicalAdmission,false);
assert.ok(batch.examples.some(x=>x.memoryId===preference.memoryId));
assert.ok(batch.examples.some(x=>x.memoryId===procedural.memoryId));
assert.ok(!batch.examples.some(x=>x.memoryId===factualHeld.memoryId));
assert.ok(!batch.examples.some(x=>x.memoryId===model.memoryId));

const manifest=intelligenceManifestR331();
assert.equal(manifest.persistence,'OMEGA_RUNTIME_DURABLE_OBJECT_SESSION_SCOPED');
assert.equal(manifest.directFoundationWeightMutation,false);
assert.equal(manifest.canonicalAdmission,false);

const worker=fs.readFileSync('src/workerR331.js','utf8');
for(const token of [
 "from './workerR116.js'",
 "/api/chat",
 "/api/intelligence/r331/manifest",
 "/api/intelligence/r331/feedback",
 "/api/intelligence/r331/training-batch",
 "/intelligence/r331/context",
 "compileConversationMemoryR331",
 "compileLearningMemoryR331",
 "canonicalAdmission:false"
])assert.ok(worker.includes(token),`R331 worker missing ${token}`);
assert.ok(!/canonicalAdmission\s*:\s*true/.test(worker),'R331 worker may not self-admit CanonState');

const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
assert.match(wrangler,/"main"\s*:\s*"src\/workerR331\.js"/,'canonical Worker must promote through R331 wrapper');
assert.match(wrangler,/"OMEGA_RUNTIME"/,'R331 durable learning must reuse the existing canonical runtime Durable Object');

const fabric=fs.readFileSync('src/intelligenceFabric.ts','utf8');
assert.match(fabric,/r331-coherent-learning/,'intelligence fabric must expose R331 as an active hosted contributor');
assert.match(fabric,/durable session memory/i);
assert.match(fabric,/does not claim trained foundation weights/i);

console.log('R331 COHERENT LEARNING PASS · durable conversation continuity · typed learning · evidence/proof gates · approved TRAIN_LOCAL export · no Canon or weight-training fiction');

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
assert.ok(!selected.some(x=>x.memoryId===factualHeld.memoryId),'unproved factual lessons must remain stored but quarantined from synthesis retrieval');
assert.ok(!selected.some(x=>x.memoryId===proceduralHeld.memoryId),'unproved procedural lessons must remain stored but quarantined from synthesis retrieval');
const context=buildCommunicationContextR331(memory,'Explain the build and keep it direct.',{metrics:{continuity:.8,plasticity:.7,contradiction:.1,burden:.2,evidence:.9}});
assert.equal(context.canonicalAdmission,false);
assert.ok(context.coherence.communicationCoherence>0);
assert.ok(context.coherence.composite>0&&context.coherence.composite<=1);
assert.deepEqual(Object.keys(context.coherence.components).sort(),['causal','evidence','goal','logical','memory','temporal']);
assert.equal(context.coherence.validatedScientificMetric,false);
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
assert.ok(manifest.loops.includes('WORKING_CONTEXT'));
assert.ok(manifest.loops.includes('APPEND_ONLY_LEARNING_LEDGER'));
assert.equal(manifest.canonicalAdmission,false);

const worker=fs.readFileSync('src/workerR116.js','utf8');
const membrane=fs.readFileSync('src/system/coherentLearningWorkerR331.js','utf8');
for(const token of [
 "from './system/coherentLearningWorkerR331.js'",
 "publicLearningR331(request,env,r115.fetch.bind(r115))",
 "runtimeLearningR331(this,request)"
])assert.ok(worker.includes(token),`R331 R116 integration missing ${token}`);
for(const token of [
 "/api/chat",
 "/api/intelligence/r331/manifest",
 "/api/intelligence/r331/feedback",
 "/api/intelligence/r331/training-batch",
 "/api/intelligence/r331/state",
 "/intelligence/r331/context",
 "compileConversationMemoryR331",
 "compileLearningMemoryR331",
 "appendLedgerR331",
 "intelligenceLedgerR331",
 "previousHash",
 "lastEventHash",
 "canonicalAdmission:false"
])assert.ok(membrane.includes(token),`R331 learning membrane missing ${token}`);
assert.ok(!/canonicalAdmission\s*:\s*true/.test(membrane),'R331 membrane may not self-admit CanonState');

const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
assert.match(wrangler,/"main"\s*:\s*"src\/workerR116\.js"/,'R331 must preserve the proven R116 canonical Worker entrypoint');
assert.match(wrangler,/"OMEGA_RUNTIME"/,'R331 durable learning must reuse the existing canonical runtime Durable Object');

const orchestrator=fs.readFileSync('src/PromptOrchestrator.tsx','utf8');
for(const token of [
 '/api/intelligence/r331/training-batch',
 "op:'WRITE_TEXT'",
 "op:'TRAIN_LOCAL'",
 'approvedLessons',
 'foundationWeightsChanged=false',
 'OMEGA_SAI_LOCAL_LEARNING_REQUEST_R331'
])assert.ok(orchestrator.includes(token),`R331 local training handoff missing ${token}`);
assert.match(orchestrator,/createOnly:true/,'R331 approved lesson artifact must be bounded new-file output');

const fabric=fs.readFileSync('src/intelligenceFabric.ts','utf8');
assert.match(fabric,/r331-coherent-learning/,'intelligence fabric must expose R331 as an active hosted contributor');
assert.match(fabric,/durable session memory/i);
assert.match(fabric,/does not claim trained foundation weights/i);

console.log('R331 COHERENT LEARNING PASS · durable conversation continuity · working/episodic/semantic/procedural learning · append-only hash ledger · decomposed coherence · evidence/proof gates · approved TRAIN_LOCAL export · no Canon or weight-training fiction');

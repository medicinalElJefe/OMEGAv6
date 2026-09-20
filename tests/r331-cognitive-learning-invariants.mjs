import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 appendLearningEventR331,
 coherenceVectorR331,
 communicationContextR331,
 createMemoryR331,
 memoryGateR331,
 selectMemoriesR331,
 R331_B12_PROGRESS_RECEIPT,
} from '../src/cognitiveLearningR331.js';

const episodic=await createMemoryR331({
 kind:'EPISODIC',
 content:'User asked to keep OMEGA concise and preserve exact proof boundaries.',
 source:'WORKERS_AI:test',
 writer:'OMEGA_CHAT_R331',
 scope:'SESSION',
 confidence:.55,
 evidenceClass:'MODEL_SYNTHESIS',
 timestamp:1000,
});
assert.equal(episodic.kind,'EPISODIC');
assert.equal(episodic.gate.outcome,'PASS');
assert.equal(episodic.canonicalAdmission,false);

assert.equal(memoryGateR331({
 kind:'SEMANTIC',content:'Model guessed a fact.',scope:'SESSION',confidence:.8,evidenceClass:'MODEL_SYNTHESIS'
}).outcome,'DENY','model synthesis must not self-promote into semantic memory');

const correction=await createMemoryR331({
 kind:'SEMANTIC',
 content:'The user explicitly corrected the preferred build behavior: use exact-head proof before promotion.',
 source:'USER_FEEDBACK',
 writer:'USER_CONFIRMED_R331',
 scope:'SESSION',
 confidence:.98,
 evidenceClass:'USER_CONFIRMED',
 timestamp:2000,
});
assert.equal(correction.gate.outcome,'PASS');
assert.equal(correction.evidenceClass,'USER_CONFIRMED');

const procedure=await createMemoryR331({
 kind:'PROCEDURAL',
 content:'Before promotion, verify exact head, unchanged base, full workflow matrix, and canonical production proof.',
 source:'USER_FEEDBACK',
 writer:'USER_CONFIRMED_R331',
 scope:'SESSION',
 confidence:.98,
 evidenceClass:'USER_CONFIRMED',
 timestamp:3000,
});
const selected=selectMemoriesR331([episodic,correction,procedure],'exact head promotion proof',3,4000);
assert.equal(selected[0].id,procedure.id,'relevant confirmed procedure should outrank weak episodic recall');

let ledger=[];
ledger=await appendLearningEventR331(ledger,{id:'evt1',type:'TURN',timestamp:1000,payload:{userText:'hello',assistantReply:'hi'}});
ledger=await appendLearningEventR331(ledger,{id:'evt2',type:'FEEDBACK',timestamp:2000,payload:{signal:'CORRECTED'}});
assert.equal(ledger.length,2);
assert.equal(ledger[1].previousHash,ledger[0].eventHash,'learning ledger must be append-only hash chained');
assert.notEqual(ledger[1].eventHash,ledger[0].eventHash);

const coherence=coherenceVectorR331({
 runtimeContext:{metrics:{continuity:.8,contradiction:.1,evidence:.9}},
 selectedMemories:[correction,procedure],
 ledger,
});
assert.ok(coherence.composite>0&&coherence.composite<=1);
assert.equal(coherence.validatedScientificMetric,false);

const context=communicationContextR331({
 memories:[episodic,correction,procedure],
 ledger,
 query:'how do we promote safely?',
 runtimeContext:{metrics:{continuity:.8,contradiction:.1,evidence:.9}},
});
assert.equal(context.learningPolicy.foundationWeightsChanged,false);
assert.equal(context.learningPolicy.modelOutputMaySelfPromoteSemantic,false);
assert.equal(context.learningPolicy.canonicalAdmission,false);
assert.ok(context.selectedMemories.some(x=>x.id===procedure.id));

assert.equal(R331_B12_PROGRESS_RECEIPT.stage,'R314-B12');
assert.equal(R331_B12_PROGRESS_RECEIPT.state,'ACTIVE_PARTIAL');
assert.equal(R331_B12_PROGRESS_RECEIPT.foundationWeightsChanged,false);

const worker=fs.readFileSync('src/workerR116.js','utf8');
for(const token of [
 "path==='/api/chat'",
 "path==='/api/cognition/state'",
 "path==='/api/cognition/feedback'",
 "path==='/cognition/context'",
 "path==='/cognition/record'",
 "path==='/cognition/feedback'",
 "path==='/cognition/state'",
 'communicationContextR331',
 'createMemoryR331',
 'appendLearningEventR331',
 'foundationWeightsChanged:false',
 'canonicalAdmission:false'
])assert.ok(worker.includes(token),`R331 Worker integration missing ${token}`);

const baseWorker=fs.readFileSync('src/worker.js','utf8');
for(const token of [
 'context.cognitiveLearningR331',
 'MODEL_SYNTHESIS episodic memory as recollection/proposal rather than fact',
 'USER_CONFIRMED, RETURN_VERIFIED, and SOURCE_BOUND',
 'never claim foundation-weight training from session learning'
])assert.ok(baseWorker.includes(token),`R331 synthesis prompt missing ${token}`);

console.log('R331 COGNITIVE LEARNING PASS · typed memory · user-confirmed promotion · append-only learning ledger · coherence vector · durable chat integration · no model self-promotion · no false weight-training claim');

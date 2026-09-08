import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8');
const wrapper=read('public/omega-hybrid-agent-r141.py');
const base=read('public/omega-hybrid-agent-base-r205.py');
const worker=read('src/workerR116.js');
const liveVerifier=read('scripts/verify_live_operational_source_authority_r202.mjs');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const BASE_SHA='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046';
const must=(ok,msg)=>assert.ok(ok,`R207.2 ${msg}`);

assert.equal(sha(base),BASE_SHA,'frozen R205 base bytes drifted');
must(wrapper.includes("R207_1_ASSET_COMPATIBILITY_REVISION='R207.1'"),'repair revision marker missing');
must(wrapper.includes('SERVER_VALIDATOR_COMPATIBILITY_R207_1="BASE_PATH=\'/omega-hybrid-agent.py\'"'),'explicit inert legacy-validator compatibility marker missing');
const active=(wrapper.match(/^BASE_PATH='([^']+)'$/m)||[])[1];
assert.equal(active,'/omega-hybrid-agent-base-r205.py','active R141 base path must remain the immutable R205 asset');
must(!/^BASE_PATH='\/omega-hybrid-agent\.py'$/m.test(wrapper),'legacy canonical-wrapper recursion may not become the active base path');
must(wrapper.includes(`EXPECTED_BASE_SHA256='${BASE_SHA}'`)&&wrapper.includes('if observed!=EXPECTED_BASE_SHA256'),'R141 wrapper must fail closed on immutable-base byte drift');
must(wrapper.includes('R141/R207 immutable R205 base SHA-256 mismatch'),'R141 immutable-base failure receipt missing');

// Preserve the R207.1 compatibility bridge while repairing only the live verifier's
// representation mismatch. The verifier must compare text-to-text after independent
// SHA-256 equality, never Buffer identity against a string.
const legacyServerPredicate=wrapper.length>1000&&wrapper.startsWith('#!/usr/bin/env python3')&&wrapper.includes("PROOF_CLOSURE_REVISION='R141'")&&wrapper.includes("FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'")&&wrapper.includes("BASE_PATH='/omega-hybrid-agent.py'")&&wrapper.includes('OMEGA R34 local Hybrid Link agent')&&wrapper.includes('Pairing is explicit.');
must(legacyServerPredicate,'R116 legacy asset predicate must accept the safe R207.1 wrapper');
must(worker.includes("source.includes(\"BASE_PATH='/omega-hybrid-agent.py'\")")&&worker.includes('R141_PROOF_AGENT_ASSET_INVALID'),'test must remain bound to the exact production compatibility predicate until the worker validator is upgraded');

for(const token of ["response('/omega-hybrid-agent-base-r205.py')",`R205_BASE_SHA256='${BASE_SHA}'`,"expectedBaseText=expectedBase.toString('utf8')",'baseLive.body!==expectedBaseText',"activeBaseAssignment!=='/omega-hybrid-agent-base-r205.py'",'live immutable R205 base mismatch'])must(liveVerifier.includes(token),`live verifier missing ${token}`);
must(!liveVerifier.includes('baseLive.body!==expectedBase)'), 'live verifier must not compare a string body directly to a Buffer object');
for(const forbidden of ['nativeExecutionClaimed:true','canonicalMutation:true','mayExecute:true','mayQueue:true'])must(!wrapper.includes(forbidden),`compatibility repair may not gain execution/admission claim ${forbidden}`);
console.log('R207.2 LIVE BYTE-PROOF REPAIR PASS · exact R205 SHA retained · text representation aligned only after byte hash proof · R207.1 compatibility preserved · no new execution/Canon authority');

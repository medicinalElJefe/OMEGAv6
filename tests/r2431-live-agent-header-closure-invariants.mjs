import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const worker33=read('src/workerR33.js');
const agent=read('public/omega-hybrid-agent-r207.py');
const liveVerifier=read('scripts/verify_live_hybrid_execution_motion_r243.mjs');
const must=(ok,msg)=>assert.ok(ok,`R243.1 ${msg}`);

for(const token of [
  "const EXECUTION_MOTION_REVISION_R243='R243'",
  "source.includes(\"VERSION='R207'\")",
  "source.includes(\"PROOF_CLOSURE_REVISION='R141'\")",
  "source.includes(\"BASE_PATH='/omega-hybrid-agent-base-r205.py'\")",
  "source.includes(\"EXECUTION_MOTION_EXTENSION='R243'\")",
  "source.includes(\"'/api/hybrid/agent/progress'\")",
  "'x-omega-agent-proof-closure':'R141'",
  "'x-omega-agent-base-revision':'R205'",
  "'x-omega-execution-motion':EXECUTION_MOTION_REVISION_R243"
])must(worker33.includes(token),`canonical /api/hybrid/agent-download closure missing ${token}`);

must(worker33.includes("if(path==='/api/hybrid/agent-download'&&request.method==='GET')return hybridAgentDownloadR94(request,env)"),'canonical API download must remain served by the hardened source gate');
must(agent.includes("VERSION='R207'")&&agent.includes("EXECUTION_MOTION_EXTENSION='R243'")&&agent.includes("FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'"),'served source identity must remain R207 compatibility + R243 motion + R141 exact return closure');
must(agent.includes("EXPECTED_BASE_SHA256='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046'"),'immutable R205 byte lock must remain exact');
must(!agent.includes('shell=True'),'header closure must not widen executor authority');
must(liveVerifier.includes("agentResponse.headers.get('x-omega-execution-motion')!=='R243'"),'canonical production verifier must fail closed if response metadata loses R243 motion identity');

console.log('R243.1 LIVE AGENT HEADER CLOSURE PASS · /api/hybrid/agent-download advertises R243 only after source bytes prove R207 compatibility + R141 closure + immutable R205 base + R243 progress protocol · production verifier remains fail-closed');

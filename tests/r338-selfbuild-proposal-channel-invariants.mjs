import assert from'node:assert/strict';
import fs from'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const engine=read('scripts/r170-selfbuild-engine.mjs');
const workflow=read('.github/workflows/r170-governed-selfbuild.yml');
const r335=read('tests/r335-calibration-full-system-propagation-invariants.mjs');

for(const token of [
 "const PROPOSAL_PATH=String(process.env.OMEGA_R170_PROPOSAL_PATH||'').trim()",
 'function emitProposal(payload,pretty=false)',
 "fs.writeFileSync(PROPOSAL_PATH,body,'utf8')",
 "emitProposal({status:'PROPOSE'",
 "emitProposal({status:'OBSERVE'",
 "emitProposal({status:'BLOCKED_BY_RESIDUAL_GATE'",
 "emitProposal({status:'SANDBOX'"
])assert.ok(engine.includes(token),`R338 engine proposal channel missing ${token}`);

for(const token of [
 'rm -f /tmp/r170-proposal.json',
 'OMEGA_R170_PROPOSAL_PATH=/tmp/r170-proposal.json node scripts/r170-selfbuild-engine.mjs | tee /tmp/r170-engine-output.log',
 "if(!fs.existsSync(p))throw new Error('R338 selector emitted no clean proposal artifact')",
 "typeof parsed.status!=='string'",
 'STATUS=$(node -e "const x=require(\'/tmp/r170-proposal.json\')'
])assert.ok(workflow.includes(token),`R338 workflow transport missing ${token}`);

assert.ok(!workflow.includes("R170 selector emitted no parseable final top-level JSON proposal"),'R338 must not recover authority by scraping mixed stdout');
assert.ok(!workflow.includes("raw.slice(start,i+1)"),'R338 must not reconstruct candidate authority from ad-hoc brace scanning');
assert.ok(r335.includes('R338 must bind an out-of-band clean proposal artifact'),'R335 inherited full-system proof must recognize R338 transport');

console.log('R338 SELF-BUILD PROPOSAL CHANNEL PASS · selector stdout retained only for diagnosis · authoritative status is written directly by engine to a dedicated JSON artifact · missing/invalid artifact fails closed · no mixed-log brace parser remains');

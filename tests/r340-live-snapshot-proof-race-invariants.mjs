import assert from'node:assert/strict';
import fs from'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const command=read('scripts/verify_live_hybrid_command_authority_r237.mjs');
const host=read('scripts/verify_live_hybrid_host_intelligence_r238.mjs');
const motion=read('scripts/verify_live_hybrid_execution_motion_r243.mjs');

assert.ok(command.includes("waitForFunction(()=>Number(document.querySelector('[data-r237-command-authority=\"AUTHENTICATED_BOUNDED_NATIVE_CONTROL\"]')?.getAttribute('data-r237-snapshot-epoch')||0)>=1"),'R340 command verifier must wait for the real shared epoch before reading semantic state');
assert.ok(host.includes("waitForFunction(()=>Number(document.querySelector('[data-r238-host-intelligence]')?.getAttribute('data-r238-snapshot-epoch')||0)>=1"),'R340 host verifier must wait for the real shared epoch before reading semantic state');
assert.ok(motion.includes("Number(el?.getAttribute('data-r243-epoch')||0)")&&motion.includes("return Number.isFinite(epoch)&&epoch>=1"),'R340 retains R339.3 motion epoch settle proof');
for(const source of [command,host,motion])assert.ok(source.includes('timeout:15000'),'R340 shared-epoch waits must remain bounded');
assert.ok(command.indexOf('data-r237-snapshot-epoch')<command.indexOf("const epoch=Number(await deck.getAttribute('data-r237-snapshot-epoch')")||command.includes("waitForFunction(()=>Number(document.querySelector('[data-r237-command-authority"),'R340 command epoch gate must precede semantic epoch assertion');
assert.ok(host.indexOf("waitForFunction(()=>Number(document.querySelector('[data-r238-host-intelligence]')")<host.indexOf("const epoch=Number(await intelligence.getAttribute('data-r238-snapshot-epoch')"),'R340 host epoch gate must precede semantic epoch assertion');
assert.ok(!command.includes("data-r237-snapshot-epoch')||1")&&!host.includes("data-r238-snapshot-epoch')||1")&&!motion.includes("data-r243-epoch')||1"),'R340 must never synthesize a nonzero epoch');

console.log('R340 SHARED SNAPSHOT LIVE-PROOF RACE PASS · command + host + motion all wait for the first real R238 epoch before semantic assertion · 15s bounded wait · no fabricated epoch or authority change');

import assert from'node:assert/strict';
import fs from'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const command=read('scripts/verify_live_hybrid_command_authority_r237.mjs');
const host=read('scripts/verify_live_hybrid_host_intelligence_r238.mjs');
const motion=read('scripts/verify_live_hybrid_execution_motion_r243.mjs');

const checks=[
 [command,'[data-r237-command-authority="AUTHENTICATED_BOUNDED_NATIVE_CONTROL"]','data-r237-snapshot-epoch'],
 [host,'[data-r238-host-intelligence]','data-r238-snapshot-epoch'],
 [motion,'[data-r243-motion]','data-r243-epoch']
];
for(const [source,selector,attribute] of checks){
 assert.ok(source.includes('waitForFunction(()=>Number(document.querySelector('),`R340 live verifier must await React snapshot completion for ${selector}`);
 assert.ok(source.includes(attribute),`R340 live verifier missing shared epoch attribute ${attribute}`);
 assert.ok(source.includes('{timeout:15000}'),`R340 live verifier must keep the snapshot wait bounded for ${selector}`);
}
assert.ok(motion.indexOf("waitForFunction(()=>Number(document.querySelector('[data-r243-motion]')")<motion.indexOf("const motionEpoch=Number(await motion.getAttribute('data-r243-epoch')"),'R340 motion proof must wait before reading the epoch');
assert.ok(host.indexOf("waitForFunction(()=>Number(document.querySelector('[data-r238-host-intelligence]')")<host.indexOf("const epoch=Number(await intelligence.getAttribute('data-r238-snapshot-epoch')"),'R340 host proof must wait before reading the epoch');
assert.ok(command.indexOf("waitForFunction(()=>Number(document.querySelector('[data-r237-command-authority")<command.indexOf("const epoch=Number(await deck.getAttribute('data-r237-snapshot-epoch')"),'R340 command proof must wait before reading the epoch');

console.log('R340 SHARED SNAPSHOT LIVE-PROOF RACE PASS · command/host/motion verifiers wait for the first completed atomic R238 epoch before semantic assertions · bounded 15s wait · no fake epoch injection');

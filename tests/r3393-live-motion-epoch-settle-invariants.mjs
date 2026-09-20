import assert from'node:assert/strict';
import fs from'node:fs';

const verifier=fs.readFileSync('scripts/verify_live_hybrid_execution_motion_r243.mjs','utf8');

for(const token of [
 "const motion=page.locator('[data-r243-motion]')",
 "await motion.waitFor({state:'visible'})",
 "await page.waitForFunction(()=>{",
 "document.querySelector('[data-r243-motion]')",
 "Number(el?.getAttribute('data-r243-epoch')||0)",
 "return Number.isFinite(epoch)&&epoch>=1",
 "},{timeout:15000})",
 "if(!Number.isFinite(motionEpoch)||motionEpoch<1)throw new Error"
])assert.ok(verifier.includes(token),`R339.3 live motion proof missing ${token}`);

const visibleAt=verifier.indexOf("await motion.waitFor({state:'visible'})");
const epochWaitAt=verifier.indexOf("return Number.isFinite(epoch)&&epoch>=1");
const epochReadAt=verifier.indexOf("const motionEpoch=Number(await motion.getAttribute('data-r243-epoch')||0)");
assert.ok(visibleAt>=0&&epochWaitAt>visibleAt&&epochReadAt>epochWaitAt,'R339.3 must settle the shared provider epoch before reading proof state');

assert.ok(!verifier.includes("data-r243-epoch')||1"),'R339.3 must not fabricate a nonzero epoch');
assert.ok(!verifier.includes('motionEpoch=1'),'R339.3 must not hard-code epoch truth');

console.log('R339.3 LIVE MOTION EPOCH SETTLE PASS · proof waits for the existing shared R238 provider to complete a real epoch before evaluating R243/R244 motion · no runtime authority change · no synthetic epoch');

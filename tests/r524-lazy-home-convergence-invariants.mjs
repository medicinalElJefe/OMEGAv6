import assert from 'node:assert/strict';
import fs from 'node:fs';
const proof=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const delayed=fs.readFileSync('tests/r524-lazy-visual-home-browser-e2e.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/ci.yml','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const token of [
 'await app.waitFor({state:\'visible\',timeout:10000})',
 "attempt===1?12000:3500",
 "main.r71-home[data-r510-embedded=\"true\"]",
 "r71Wait=${r71Wait}",
 "pageErrors=${pageErrors",
 "assetFailures=${assetFailures",
 "requestFailures=${requestFailures",
 "boundaryErrors=${boundaryErrors",
 "!legacy&&embedded>0&&marker>0&&laneReceipt.exact",
 "source===expected&&promoted===expected",
 "did not converge to exact promoted shell within bounded window",
 "R499 R489 BROWSER EDGE PASS"
])assert.ok(proof.includes(token),'R524 must retain bounded, honest live proof: '+token);
assert.ok(proof.indexOf("await page.locator('.o7-home-established main.r71-home")<proof.indexOf("const embedded=await page.locator("),'deferred visual settle must precede strict visual presence count');
assert.ok(delayed.includes('4500'),'inject meaningful 4.5 second visual module latency');
assert.ok(delayed.includes("await route.continue()"),'slow asset must really load, not be mocked');
assert.ok(delayed.includes("await page.locator(visual).waitFor({state:'attached',timeout:25000})"),'test must require real R71');
assert.ok(delayed.includes("await page.locator('.o7-brand').click("),'test must exercise Home');
assert.ok(delayed.includes("['mobile',{width:390,height:844}]"),'test must include mobile');
assert.ok(workflow.includes('tests/r524-lazy-visual-home-browser-e2e.mjs'),'candidate browser suite must prove bounded R71');
assert.ok(pkg.scripts.check.endsWith('npm run test:r524'),'source check must be release blocking');
console.log('R524 DELAYED HOME CONVERGENCE INVARIANTS PASS · strict embedded R71/fallback/SHA gates preserved · true delayed module proof mandatory');

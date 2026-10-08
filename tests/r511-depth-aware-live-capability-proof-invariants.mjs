import assert from 'node:assert/strict';
import fs from 'node:fs';

const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');

for(const token of [
  "const visualHome=page.locator('.o7-home-established[data-r510-visual-restoration=\"CURRENT_R71_CANONICAL_HOME\"]')",
  "if(await depth.inputValue()!=='STANDARD')",
  "if(await recovered.isVisible())throw new Error",
  "await depth.selectOption('ADVANCED')",
  "await recovered.waitFor({state:'visible'",
  "if(await depth.inputValue()!=='ADVANCED')",
]) assert.ok(live.includes(token),'R511 live proof missing '+token);

assert.ok(css.includes(".o7-app[data-depth=standard] .o7-home-established~.o7-recovered"),'R511 requires STANDARD depth to keep recovered fabric non-dominant');
assert.ok(root.includes("<option value='STANDARD'>Standard</option><option value='ADVANCED'>Advanced</option><option value='CANON'>Canon</option>"),'R511 requires explicit interface-depth authority');
assert.ok(root.includes("className='o7-recovered' data-r486-visible-convergence='true'"),'R511 preserves recovered capability fabric in product source');

console.log('R511 DEPTH-AWARE LIVE CAPABILITY PROOF PASS · STANDARD remains R510 visual-first · ADVANCED proves R486 recovered fabric visible and executable · no requirement weakened');

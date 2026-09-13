import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.tsx','utf8');
const settle=fs.readFileSync('src/navigationScrollIntegrityR313.ts','utf8');
assert.ok(main.includes("installNavigationScrollIntegrityR313"),'R313.12 navigation scroll settlement must be installed at runtime');
assert.ok(settle.includes("omega-capability-change"),'R313.12 must settle only from the canonical capability-change transition signal');
assert.ok(settle.includes("requestAnimationFrame(()=>window.requestAnimationFrame"),'R313.12 must settle after the legacy route-reset frame, not before it');
assert.ok(settle.includes("behavior:'auto'"),'R313.12 settlement must terminate the in-flight smooth transition deterministically');
assert.ok(settle.includes(".workstation-main")&&settle.includes('window.scrollTo'),'R313.12 must settle both historical scroll owners');
for(const forbidden of ['CanonState','dispatch','execution history','DEVICE_PROOF','EARTH_PROOF','ci.yml'])assert.ok(!settle.includes(forbidden),`R313.12 scroll compatibility layer must not acquire ${forbidden} authority`);
console.log('R313.12 NAVIGATION SCROLL SETTLEMENT INVARIANTS PASS');

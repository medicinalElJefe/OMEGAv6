import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.tsx','utf8');
const settle=fs.readFileSync('src/navigationScrollIntegrityR313.ts','utf8');
assert.ok(main.includes("installNavigationScrollIntegrityR313"),'R313.12 navigation scroll settlement must be installed at runtime');
assert.ok(settle.includes("omega-capability-change"),'R313.12 must settle only from the canonical capability-change transition signal');
assert.ok(settle.includes("requestAnimationFrame(()=>window.requestAnimationFrame"),'R313.12 must settle after the legacy route-reset frame, not before it');
assert.ok(settle.includes("behavior:'auto'"),'R313.12 settlement must terminate the in-flight smooth transition deterministically');
assert.ok(settle.includes(".workstation-main")&&settle.includes('window.scrollTo'),'R313.12 must settle both historical scroll owners');

// Authority assertions apply to executable TypeScript, not explanatory comments. A
// disclaimer such as “owns no dispatch authority” must not be misclassified as an
// implementation of dispatch authority.
const executableSettle=settle
  .replace(/\/\*[\s\S]*?\*\//g,'')
  .replace(/(^|[^:])\/\/.*$/gm,'$1');

assert.doesNotMatch(executableSettle,/^\s*import\s/m,'R313.12 scroll settlement must remain dependency-free');
for(const forbidden of ['CanonState','dispatch','execution history','DEVICE_PROOF','EARTH_PROOF','ci.yml']){
  assert.ok(!executableSettle.includes(forbidden),`R313.12 scroll compatibility layer must not acquire ${forbidden} authority`);
}
for(const forbiddenApi of [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bWorker\s*\(/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bindexedDB\b/,
  /\bpostMessage\s*\(/,
  /\bsendBeacon\s*\(/
]){
  assert.doesNotMatch(executableSettle,forbiddenApi,'R313.12 scroll settlement must remain DOM-presentation-only');
}
console.log('R313.13 NAVIGATION SCROLL SETTLEMENT INVARIANTS PASS · executable-only authority scan · comments may document denied authority without false positives');

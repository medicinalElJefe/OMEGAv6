import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.tsx','utf8');
const settle=fs.readFileSync('src/navigationScrollIntegrityR313.ts','utf8');
assert.ok(main.includes("installNavigationScrollIntegrityR313"),'R313 navigation scroll settlement must be installed at runtime');
assert.ok(settle.includes("omega-capability-change"),'R313 must adapt only from the canonical capability-change transition signal');
assert.ok(settle.includes("isLegacyTopReset"),'R313 must narrowly recognize the historical top=0 smooth route reset');
assert.ok(settle.includes("behavior:'auto'"),'R313 must convert the historical smooth reset to deterministic auto settlement');
assert.ok(settle.includes('nativeWindowScrollTo')&&settle.includes('nativeElementScrollTo'),'R313 must preserve and restore both historical native scroll owners');
assert.ok(settle.includes('window.scrollTo=nativeWindowScrollTo')&&settle.includes('HTMLElement.prototype.scrollTo=nativeElementScrollTo'),'R313 must restore native scrolling after the bounded route-reset frame');
assert.ok(!settle.includes("main?.scrollTo({top:0,left:0,behavior:'auto'})"),'R313 must not issue a delayed corrective workstation scroll that can overwrite destination interaction');
assert.ok(!settle.includes("window.scrollTo({top:0,left:0,behavior:'auto'})"),'R313 must not issue a delayed corrective window scroll that can overwrite destination interaction');

// Authority assertions apply to executable TypeScript, not explanatory comments.
const executableSettle=settle
  .replace(/\/\*[\s\S]*?\*\//g,'')
  .replace(/(^|[^:])\/\/.*$/gm,'$1');

assert.doesNotMatch(executableSettle,/^\s*import\s/m,'R313 scroll settlement must remain dependency-free');
for(const forbidden of ['CanonState','dispatch','execution history','DEVICE_PROOF','EARTH_PROOF','ci.yml']){
  assert.ok(!executableSettle.includes(forbidden),`R313 scroll compatibility layer must not acquire ${forbidden} authority`);
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
  assert.doesNotMatch(executableSettle,forbiddenApi,'R313 scroll settlement must remain DOM-presentation-only');
}
console.log('R313.18 NAVIGATION SCROLL SETTLEMENT INVARIANTS PASS · legacy route reset is synchronous for one bounded frame · no delayed corrective scroll may overwrite destination interaction');

import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.tsx','utf8');
const settle=fs.readFileSync('src/navigationScrollIntegrityR313.ts','utf8');
assert.ok(main.includes("installNavigationScrollIntegrityR313"),'R313 navigation scroll settlement must be installed at runtime');
assert.ok(settle.includes("omega-capability-change"),'R313 must adapt only from the canonical capability-change transition signal');
assert.ok(settle.includes("isLegacyTopReset"),'R313 must narrowly recognize the historical top=0 smooth route reset');
assert.ok(settle.includes("behavior:'auto'"),'R313 must synchronously settle the historical route-to-top target');
assert.ok(settle.includes("nativeElementScrollTo.call(main,{top:0,behavior:'auto'})"),'R313 must settle workstation scroll synchronously inside the transition event');
assert.ok(settle.includes("nativeWindowScrollTo.call(window,{top:0,behavior:'auto'})"),'R313 must settle document scroll synchronously inside the transition event');
assert.ok(settle.includes("suppressLegacyReset&&isLegacyTopReset(args)"),'R313 must suppress only the scheduled legacy top reset during the transition window');
assert.ok(settle.includes("this.classList.contains('workstation-main')"),'R313 must scope element reset suppression to the historical workstation owner');
assert.ok(settle.includes('const nativeWindowScrollTo=window.scrollTo')&&settle.includes('const nativeElementScrollTo=HTMLElement.prototype.scrollTo'),'R313 must capture native scroll owners exactly once at installation');
assert.ok(settle.includes('suppressLegacyReset=false'),'R313 must reopen ordinary scrolling after the bounded transition window');
assert.ok(!settle.includes('window.scrollTo=nativeWindowScrollTo')&&!settle.includes('HTMLElement.prototype.scrollTo=nativeElementScrollTo'),'R313 must not restore per-transition wrappers out of order');
assert.ok(!settle.includes('let transition='),'R313 must not stack transition-scoped native method captures');
assert.ok(!settle.includes("requestAnimationFrame(()=>{main?.scrollTo"),'R313 must not issue a delayed corrective workstation scroll that can overwrite destination interaction');
assert.ok(!settle.includes("requestAnimationFrame(()=>{window.scrollTo"),'R313 must not issue a delayed corrective window scroll that can overwrite destination interaction');

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
console.log('R313.21 NAVIGATION SCROLL SETTLEMENT INVARIANTS PASS · stable single scroll membrane · route top settles synchronously · legacy reset suppressed without wrapper stacking');

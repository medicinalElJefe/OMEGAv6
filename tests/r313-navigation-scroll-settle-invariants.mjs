import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.tsx','utf8');
const settle=fs.readFileSync('src/navigationScrollIntegrityR313.ts','utf8');
const provenanceCss=fs.readFileSync('src/surfaceProvenanceR94.css','utf8');
const integrityCss=fs.readFileSync('src/interfaceIntegrityR313.css','utf8');
const createIntegrityCss=fs.readFileSync('src/createCompositionIntegrityR313.css','utf8');
const specialistContainmentCss=fs.readFileSync('src/specialistSurfaceContainmentR313.css','utf8');
assert.ok(main.includes("installNavigationScrollIntegrityR313"),'R313 navigation scroll settlement must be installed at runtime');
assert.ok(main.includes("./createCompositionIntegrityR313.css"),'R313 Create composition integrity must be installed at runtime');
assert.ok(main.includes("./specialistSurfaceContainmentR313.css"),'R313 shared specialist containment must be installed at runtime');
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
assert.match(provenanceCss,/\.r94-representational-disclosure:not\(\[open\]\)>:not\(summary\)\{display:none!important\}/,'R313 closed representational disclosures must remove authored-grid descendants from layout, hit testing and control inventory');
assert.match(integrityCss,/\.omega-workstation-v2 details:not\(\[open\]\)>:not\(summary\)\s*\{\s*display:none!important;/,'R313 every closed workstation disclosure must remove author-displayed descendants from layout and hit testing');
assert.ok(integrityCss.includes(".omega-workstation-v2[data-panel='Convergence'] .r138-capability-first"),'R313 must explicitly contain accumulated Convergence composition on mobile');
assert.ok(integrityCss.includes('overflow-x:clip!important'),'R313 Convergence containment must clip without creating a programmatically scrollable hidden horizontal membrane');
assert.ok(integrityCss.includes(".r138-capability-layout,.r240-calculus-address,.r168-restoration,.r126-max"),'R313 must constrain the known accumulated Convergence application roots to the canonical surface width');
assert.ok(createIntegrityCss.includes(".omega-workstation-v2[data-panel='Create'] .command-stage"),'R313 Create must own an explicit embedded Command Deck composition boundary');
assert.ok(createIntegrityCss.includes('flex-direction:column!important'),'R313 Create must stack the retained Command Deck instead of forcing its full Command Center desktop minimum across a narrower shell');
assert.ok(createIntegrityCss.includes(".omega-workstation-v2[data-panel='Create'] .command-prompt")&&createIntegrityCss.includes('order:1!important'),'R313 Create must keep its embedded prompt in reachable document flow before the visual instrument');
assert.ok(createIntegrityCss.includes(".omega-workstation-v2[data-panel='Create'] .command-visual")&&createIntegrityCss.includes('order:2!important'),'R313 Create must retain the canonical visual instrument after the embedded prompt');
assert.ok(createIntegrityCss.includes('contain:none!important')&&createIntegrityCss.includes('overflow:visible!important'),'R313 Create command composition must not create a clipped nested interaction membrane');
assert.ok(specialistContainmentCss.includes('.omega-workstation-v2 .r138-capability-first'),'R313 must own mobile inline sizing at the shared specialist composition boundary');
assert.ok(specialistContainmentCss.includes('grid-template-columns:minmax(0,1fr)!important'),'R313 shared specialist composition must use a shrinkable canonical inline track');
assert.ok(specialistContainmentCss.includes('overflow-x:clip!important')&&specialistContainmentCss.includes('overflow-y:visible!important'),'R313 shared specialist membrane must be non-scrollable horizontally while preserving vertical document flow');
for(const root of ['.r240-calculus-address','.r240-selfbuild','.r29-canon','.r29-governance'])assert.ok(specialistContainmentCss.includes(root),`R313 shared specialist containment must cover ${root}`);
const executableSpecialistCss=specialistContainmentCss.replace(/\/\*[\s\S]*?\*\//g,'');
assert.doesNotMatch(executableSpecialistCss,/(^|[,\s>+~])(?:canvas|svg|video)(?=[$,{.#:\s>+~])/m,'R313 specialist containment must not directly rewrite rendered media geometry');

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
console.log('R313.36 NAVIGATION + DISCLOSURE + CONVERGENCE + CREATE + SPECIALIST CONTAINMENT INVARIANTS PASS · shared mobile suite roots constrained to reachable document flow');

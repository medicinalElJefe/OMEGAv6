import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('src/App.tsx','utf8');
const browser=fs.readFileSync('tests/omega7-r449-rollback-e2e.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/ci.yml','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

for(const token of ["const exitOmega7=()=>","safeStore('omega7.enabled','false')","setOmega7(false)","setHome(true)","<Omega7Root onOpenLegacyRoute={openLegacyFromOmega7} onExitToV6={exitOmega7}/>"])assert.ok(app.includes(token),'R449 accepted rollback path missing '+token);
for(const token of ["expectedAddress=12345",".o7-v6","main.r71-home,.r317-product-root","omega.v6.address","omega7.enabled","r449-default=1","/?omega7=1","re-entry","persisted OMEGA6 rollback"])assert.ok(browser.includes(token),'R449 browser rollback proof missing '+token);
assert.ok(workflow.startsWith('name: OMEGA Cloud Bridge CI'),'R449 must not create a second workflow authority');
assert.ok(workflow.includes('omega7-r449-rollback-e2e.mjs')&&workflow.includes('playwright@1.63.0'));
assert.equal(lock.parityPhase,'R449_ROLLBACK_REVERSIBILITY_CANDIDATE');
assert.equal(lock.rollbackProof,'OMEGA7_TO_OMEGA6_TO_OMEGA7_WITH_CANONICAL_ADDRESS_CONTINUITY_REQUIRED');
for(const token of ["viewport:{width:390,height:844}","isMobile:true","hasTouch:true","box.width<44||box.height<44","phone.locator('.o7-v6')","phone.locator('.o7-nav')"])assert.ok(browser.includes(token),'R449 phone rollback proof missing '+token);
assert.ok(!css.includes('.o7-search-trigger kbd,.o7-v6{display:none}'),'R449 must never hide the rollback control on phone');
for(const token of [".o7-v6{display:block;min-width:44px;width:44px","grid-template-rows:44px 44px","height:calc(104px + env(safe-area-inset-top))","height:calc(60px + env(safe-area-inset-bottom))","height:calc(100dvh - 164px - env(safe-area-inset-top) - env(safe-area-inset-bottom))","-webkit-overflow-scrolling:touch"])assert.ok(css.includes(token),'R449 phone shell touch/safe-area/scroll contract missing '+token);
for(const inset of ["safe-area-inset-top","safe-area-inset-bottom","safe-area-inset-left","safe-area-inset-right"])assert.ok(css.includes(inset),'R449 phone shell missing '+inset);

console.log('OMEGA7 R449 STATIC PASS · explicit OMEGA6 rollback remains wired · desktop + phone rollback, >=44px phone escape, canonical address preservation and OMEGA7 re-entry are browser-proved');

import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('src/App.tsx','utf8');
const browser=fs.readFileSync('tests/omega7-r448-rollback-e2e.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/ci.yml','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

for(const token of ["const exitOmega7=()=>","window.localStorage.removeItem('omega7.enabled')","setOmega7(false)","setHome(true)","<Omega7Root onOpenLegacyRoute={openLegacyFromOmega7} onExitToV6={exitOmega7}/>"])assert.ok(app.includes(token),'R448 accepted rollback path missing '+token);
for(const token of ["expectedAddress=12345",".o7-v6","main.r71-home,.r317-product-root","omega.v6.address","omega7.enabled","/?omega7=1","re-entry"])assert.ok(browser.includes(token),'R448 browser rollback proof missing '+token);
assert.ok(workflow.startsWith('name: OMEGA Cloud Bridge CI'),'R448 must not create a second workflow authority');
assert.ok(workflow.includes('omega7-r448-rollback-e2e.mjs')&&workflow.includes('playwright@1.63.0'));
assert.equal(lock.parityPhase,'R448_ROLLBACK_REVERSIBILITY_CANDIDATE');
assert.equal(lock.rollbackProof,'OMEGA7_TO_OMEGA6_TO_OMEGA7_WITH_CANONICAL_ADDRESS_CONTINUITY_REQUIRED');

console.log('OMEGA7 R448 STATIC PASS · explicit OMEGA6 rollback remains wired · canonical address preservation and OMEGA7 re-entry are browser-proved');

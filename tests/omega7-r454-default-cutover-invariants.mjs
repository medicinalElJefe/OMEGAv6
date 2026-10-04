import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('src/App.tsx','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));
const workflow=fs.readFileSync('.github/workflows/ci.yml','utf8');

for(const token of [
 "params.get('omega6')==='1'",
 "params.get('omega7')==='1'",
 "window.localStorage.getItem('omega.product.shell')!=='OMEGA6'",
 "safeStore('omega.product.shell','OMEGA6')",
 "safeStore('omega.product.shell','OMEGA7')",
 "className='omega7-return-control'",
 "Return to OMEGA7",
 "window.localStorage.removeItem('omega7.enabled')"
])assert.ok(app.includes(token),'R454 default-cutover contract missing '+token);

assert.ok(css.includes('.omega7-return-control{'),'R454 explicit rollback re-entry control must be styled');
assert.ok(css.includes('@media(max-width:760px)')&&css.includes('min-height:44px'),'R454 rollback re-entry must remain touch-usable');
assert.equal(lock.acceptedParityCounts.fullProductParity,44,'R454 cutover requires accepted 44/44 parity');
assert.equal(lock.acceptedParityCounts.legacyRetired,0,'R454 may not delete legacy surfaces');
assert.equal(lock.acceptedParityNextWork,'CUT_OVER_OMEGA7_AS_DEFAULT_WITH_OMEGA6_ROLLBACK_PRESERVED_AND_PROVE_DEFAULT_STARTUP');
assert.ok(workflow.startsWith('name: OMEGA Cloud Bridge CI'),'R454 may not create a second workflow authority');

console.log('OMEGA7 R454 STATIC PASS · clean-session default OMEGA7 · explicit OMEGA6 rollback · explicit re-entry · 44/44 accepted parity retained · zero legacy retirement');

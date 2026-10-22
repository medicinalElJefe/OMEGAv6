import assert from 'node:assert/strict';
import fs from 'node:fs';

const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const css=fs.readFileSync('src7/omega7.css','utf8');
const r202=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');

assert.ok(css.includes('.o7-recovered>header span')&&css.includes('text-transform:uppercase'),'R490 regression premise: recovered eyebrow is rendered uppercase');
assert.ok(css.includes('.o7-recovered-summary span')&&css.includes('text-transform:uppercase'),'R490 regression premise: recovered summary labels are rendered uppercase');

for(const token of [
 'const initialText=await recovered.innerText(),initialTextNormalized=initialText.toLocaleLowerCase()',
 'initialTextNormalized.includes(token.toLocaleLowerCase())',
 'R486 visible convergence missing rendered label',
 '.o7-recovered[data-r486-visible-convergence="true"]',
 "recovered.waitFor({state:'visible'",
 "['All','Understand','Explore','Create','Build','Work','Recover']",
 "selectOption('ADVANCED')",
 "'R142'",
 "'R125'",
 "['Earth Now','Workspace','System Atlas']",
 'OMEGA_EXPECTED_SHA'
])assert.ok(live.includes(token),`R490 live rendered-text acceptance missing ${token}`);

assert.ok(!live.includes('if(!initialText.includes(token))'),'R490 must not compare CSS-transformed innerText case-sensitively');
assert.ok(r202.includes("tests/r489-live-visible-capability-browser-e2e.mjs"),'R490 must keep the visible proof inside R202 post-promotion acceptance');
assert.ok(r202.includes('R489 exact-production visible capability proof failed'),'R490 must keep live visible failure release-blocking');

console.log('R490 VISIBLE TEXT NORMALIZATION PASS · rendered innerText remains mandatory · CSS case transform is normalized only for comparison · recovered fabric/groups/proof/executors/exact-SHA acceptance preserved');

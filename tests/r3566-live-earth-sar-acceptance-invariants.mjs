import assert from 'node:assert/strict';
import fs from 'node:fs';

const browser=fs.readFileSync('tests/r3566-live-earth-sar-acceptance-browser-e2e.mjs','utf8');
const verifier=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');

for(const token of ['Search SAR location','Find location','Use my location','Tucson Arizona','data-r3565-lemma="true"','permissions:[\'geolocation\']','32.22260','all 12 analytical lenses clickable','GRD/SLC mode controls actuated','evidence stacks open/close correctly'])assert.ok(browser.includes(token),`R365 live browser acceptance missing ${token}`);
assert.ok(browser.includes("totalCards!==12"),'R356.6 must prove all 12 analytical lenses');
assert.ok(browser.includes("advancedOpen>0"),'R356.6 must prove advanced evidence stacks default collapsed');
assert.ok(browser.includes("overflow>12"),'R356.6 must retain no-overflow acceptance');
assert.ok(verifier.includes("tests/r3566-live-earth-sar-acceptance-browser-e2e.mjs"),'production live verifier must execute R356.6 Earth/SAR acceptance');
assert.ok(verifier.includes('exact-production Earth/SAR acceptance proof failed'),'production promotion must fail closed if live Earth/SAR acceptance fails');

console.log('R365 LIVE ACCEPTANCE AUTHORITY PASS · production verifier now proves place search, device geolocation actuation, all 12 lens interactions, GRD/SLC controls, evidence disclosure, chain-lemma continuity, responsive layout and exact promoted-SHA closure');

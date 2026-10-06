import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('src/App.tsx','utf8');
const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const live=fs.readFileSync('tests/r489-live-visible-capability-browser-e2e.mjs','utf8');
const r202=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');
const r200=fs.readFileSync('tests/r200-current-browser-proof-e2e.mjs','utf8');
const r284=fs.readFileSync('tests/r284-live-earth-browser-e2e.mjs','utf8');
const r370=fs.readFileSync('tests/r370-live-earth-sar-closure-browser-e2e.mjs','utf8');
const r372=fs.readFileSync('tests/r372-live-earth-total-interaction-browser-e2e.mjs','utf8');

for(const token of [
 "params.get('omega6')==='1'",
 "explicit==='0'",
 "explicit==='1'",
 "window.localStorage.getItem('omega7.enabled')!=='false'",
 "catch{return true}",
 "safeStore('omega7.enabled','true')",
 "safeStore('omega7.enabled','false')",
 "<Omega7Root onOpenLegacyRoute={openLegacyFromOmega7} onExitToV6={exitOmega7}/>"
])assert.ok(app.includes(token),`R489 canonical successor cutover missing ${token}`);

for(const token of [
 "data-r486-visible-convergence='true'",
 'Recovered capability fabric',
 'Your recovered work is connected to the product',
 'Browse recovered capabilities',
 "['ALL','UNDERSTAND','EXPLORE','CREATE','BUILD','WORK','RECOVER']",
 'Lineage & proof',
 'receiptAuthority',
 'admissionAuthority'
])assert.ok(root.includes(token),`R489 must preserve visible recovered capability surface ${token}`);

for(const token of [
 "omega-build-receipt.json",
 ".o7-app[data-omega7=\"true\"]",
 ".o7-recovered[data-r486-visible-convergence=\"true\"]",
 'plain canonical URL still mounted OMEGAv6',
 "['All','Understand','Explore','Create','Build','Work','Recover']",
 'executes_now',
 'executes_as_adapter',
 'truth_gated',
 "selectOption('ADVANCED')",
 "'R142'",
 "'R125'",
 "['Earth Now','Workspace','System Atlas']",
 'OMEGA_EXPECTED_SHA'
])assert.ok(live.includes(token),`R489 live visible acceptance missing ${token}`);

for(const legacy of [r200,r284,r370,r372])assert.ok(legacy.includes('omega6=1'), 'R489 legacy browser acceptance must explicitly select OMEGA6 compatibility');

const r284Index=r202.indexOf("tests/r284-live-earth-browser-e2e.mjs");
const r370Index=r202.indexOf("tests/r370-live-earth-sar-closure-browser-e2e.mjs");
const r372Index=r202.indexOf("tests/r372-live-earth-total-interaction-browser-e2e.mjs");
const r489Index=r202.indexOf("tests/r489-live-visible-capability-browser-e2e.mjs");
assert.ok(r284Index>=0&&r370Index>r284Index&&r372Index>r370Index&&r489Index>r372Index,'R489 visible acceptance must run only after R284/R370/R372 promoted live truth gates');
assert.ok(r202.includes('R489 exact-production visible capability proof failed'),'R489 production failure must fail the canonical R202 deployment membrane');

console.log('R489 CANONICAL DEFAULT + VISIBLE CONVERGENCE PASS · plain URL OMEGA7 · explicit OMEGA6 rollback · recovered fabric retained · exact-SHA desktop/mobile live proof wired after R284/R370/R372');

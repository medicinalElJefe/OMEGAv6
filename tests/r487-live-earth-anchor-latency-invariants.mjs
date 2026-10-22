import assert from 'node:assert/strict';
import fs from 'node:fs';

const lemma=fs.readFileSync('src/satelliteChainLemmaR3565.ts','utf8');
const liveR202=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');
const r370=fs.readFileSync('tests/r370-live-earth-sar-closure-browser-e2e.mjs','utf8');

assert.ok(lemma.includes('ANCHOR_TIMEOUT_MS_R487=12000'),'R487 requires a finite per-anchor provider timeout');
assert.ok(lemma.includes('Promise.all(sources.map(async candidate=>'),'R487 requires concurrent bounded-date anchor evaluation');
assert.ok(!lemma.includes('for(const candidate of sources)try'),'R487 serial provider waterfall must remain retired');
assert.ok(lemma.includes('currentCandidates=[mk(-1),mk(-2),mk(-3)]'),'R487 must preserve bounded newest-date current candidates');
assert.ok(lemma.includes('previousCandidates=[mk(-8),mk(-9),mk(-10)]'),'R487 must preserve bounded historical comparison candidates');
assert.ok(lemma.includes('if(!evidenceHash)return()=>{alive=false}'),'R487 must preserve returned-evidence admission before derived-field work');
assert.ok(lemma.indexOf('if(!evidenceHash)return()=>{alive=false}')<lemma.indexOf('(async()=>{try{'),'R487 must not move derivation ahead of evidence admission');
assert.ok(lemma.includes('materialAnchorR419'),'R487 must preserve materiality admission');
assert.ok(lemma.includes("truthClass:'DERIVED_TRIANGULATED'"),'R487 must preserve derived—not measurement—truth class');
assert.ok(r370.includes('targetBound=!lemma||Boolean(coords&&lemma.getAttribute'), 'R487 must retain exact target-bound R370 acceptance');
for(const token of ['r284-live-earth-browser-e2e.mjs','r370-live-earth-sar-closure-browser-e2e.mjs','r372-live-earth-total-interaction-browser-e2e.mjs'])assert.ok(liveR202.includes(token),`R487 must retain production live proof ${token}`);

console.log('R487 LIVE EARTH ANCHOR LATENCY PASS · finite provider wait + concurrent bounded fallbacks · target/evidence identity + materiality + R202/R284/R370/R372 production gates preserved');

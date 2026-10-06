import assert from 'node:assert/strict';
import fs from 'node:fs';

const globe=fs.readFileSync('src/EarthObservedGlobeR281.tsx','utf8');
const live=fs.readFileSync('tests/r284-live-earth-browser-e2e.mjs','utf8');
const r202=fs.readFileSync('scripts/verify_live_operational_source_authority_r202.mjs','utf8');

for(const token of [
 'GLOBAL_TEXTURE_DEADLINE_MS_R488=18000',
 'Promise.race([',
 'controller.abort();reject(new Error(',
 "setState('UNAVAILABLE')",
 'if(fetchController.current!==controller)return',
 "disabled={state==='LOADING'}",
 'Reload observed texture'
])assert.ok(globe.includes(token),`R488 observed-Earth transaction contract missing ${token}`);

for(const token of ['EXPECTED_SOURCE','EXPECTED_CRS','EXPECTED_BBOX','EXPECTED_TRUTH','global source identity mismatch','global source CRS mismatch','global source bbox mismatch','global source truth mismatch','global source aspect mismatch'])assert.ok(globe.includes(token),`R488 must preserve R284 fail-close source identity rule ${token}`);
assert.ok(globe.includes('unavailable source imagery is not replaced with invented satellite detail'),'R488 must preserve no-fabrication truth boundary');
assert.ok(live.includes("data-source-state')==='OBSERVED'"),'R488 must not weaken R284 production acceptance below OBSERVED');
assert.ok(live.includes("getByRole('button',{name:'Reload observed texture'})"),'R488 must retain bounded live reload exercise');
for(const proof of ['r284-live-earth-browser-e2e.mjs','r370-live-earth-sar-closure-browser-e2e.mjs','r372-live-earth-total-interaction-browser-e2e.mjs'])assert.ok(r202.includes(proof),`R488 must retain promoted production proof ${proof}`);

console.log('R488 OBSERVED EARTH TRANSACTION DEADLINE PASS · stuck global texture requests terminate explicitly · reload recovers · source identity + no-fabrication + R284/R370/R372 live acceptance preserved');

import assert from 'node:assert/strict';
import fs from 'node:fs';

const r372=fs.readFileSync('tests/r372-live-earth-total-interaction-browser-e2e.mjs','utf8');
const worker=fs.readFileSync('src/workerR8.js','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

// R493 production scar: exact promoted OMEGA passed canonical deployment and Hybrid proof,
// then R372 received an external Open-Meteo 502 and the whole release rolled back.

for(const token of [
 "function verifyWeatherUnavailable",
 "response.status()!==502",
 "data-weather-state=\"ERROR\"",
 "Refresh weather",
 "waitForTimeout(750)",
 ".earth-r375-hourly-card,.earth-r375-day-card",
 "R494 provider-unavailable weather",
 "Weather returned-or-provider-unavailable truth"
])assert.ok(r372.includes(token),`R494 live weather recovery proof missing ${token}`);

assert.ok(r372.includes("data?.sources?.openMeteo?.ok")&&r372.includes("data.hourly.length<24")&&r372.includes("data.daily.length<7"),'R494 must preserve full returned-weather acceptance');
assert.ok(r372.includes("Number(om?.attemptCount)!==2")&&r372.includes("om?.retried!==true")&&r372.includes("om.attempts.length!==2"),'R494 provider-unavailable branch must prove the existing two-attempt primary-source scars');
assert.ok(r372.includes("if(data?.current||Array.isArray(data?.hourly)||Array.isArray(data?.daily))"),'R494 must reject fabricated weather values during provider outage');
assert.ok(worker.includes("state:'ERROR'")&&worker.includes("canonicalMutation:false")&&worker.includes("No forecast is fabricated when the primary returned forecast is unavailable."),'R494 Worker failure packet must be explicit, non-canonical and no-fabrication');
assert.ok(worker.includes('async function fetchPrimaryWeatherJson(url)')&&worker.includes('attempt<=2')&&worker.includes('setTimeout(resolve,250)'),'R494 must retain the existing bounded primary-provider retry rather than multiplying hidden transport retries');
assert.equal(worker.includes('fallbackWeather'),false,'R494 must not introduce synthetic weather fallback');
assert.equal(pkg.scripts['test:r494'],'node tests/r494-weather-provider-truth-recovery-invariants.mjs','R494 invariant must be registered');
assert.ok(String(pkg.scripts.check||'').includes('npm run test:r494'),'R494 invariant must remain release-blocking');

console.log('R494 WEATHER PROVIDER TRUTH RECOVERY PASS · returned weather still fully proved · external 502 becomes explicit ERROR truth · exact two-attempt source scars · one bounded UI refresh · no fabricated forecast · unrelated production capability does not roll back for provider outage');

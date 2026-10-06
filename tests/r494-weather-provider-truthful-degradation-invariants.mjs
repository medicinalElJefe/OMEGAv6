import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker=fs.readFileSync('src/workerR8.js','utf8');
const live=fs.readFileSync('tests/r372-live-earth-total-interaction-browser-e2e.mjs','utf8');
const r375=fs.readFileSync('tests/r375-weather-source-first-invariants.mjs','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of [
 "state:'PROVIDER_UNAVAILABLE'",
 "current:null,hourly:[],daily:[]",
 "canonicalMutation:false",
 "No forecast values or derived continuity are emitted",
 "payload.evidenceHash=await sha256(payload);return payload"
])assert.ok(worker.includes(token),`R494 worker provider-error envelope missing ${token}`);

for(const token of [
 "weatherResponse.status()===502",
 "Weather provider outage",
 "R494 weather provider-error truth envelope invalid",
 "R494 weather provider-error attempt scars missing",
 "data-weather-state')==='ERROR'",
 ".earth-r375-error",
 ".earth-r375-hourly-card,.earth-r375-day-card"
])assert.ok(live.includes(token),`R494 live proof missing truthful degradation token ${token}`);

assert.equal(live.includes("if(!weatherResponse.ok())throw new Error"),false,'R494 must not equate a truthful upstream weather 502 with OMEGA runtime failure');
assert.ok(live.includes("if(weatherResponse.ok())")&&live.includes("weather.hourly.length<24")&&live.includes("weather.daily.length<7"),'R494 must preserve full returned-weather acceptance when the provider succeeds');
assert.ok(worker.includes("fetchPrimaryWeatherJson(source)")&&worker.includes("attempt<=2"),'R494 must preserve the bounded primary-source retry before admitting provider unavailable');
assert.ok(worker.includes("return json(result,result.ok?200:502)"),'R494 endpoint must continue reporting provider unavailability as HTTP 502 rather than masking it as success');
assert.equal(worker.includes('fallbackWeather'),false,'R494 must not synthesize fallback weather');
assert.ok(r375.includes("state:'PROVIDER_UNAVAILABLE'")&&r375.includes("payload.evidenceHash=await sha256(payload);return payload"),'R494 must remain covered by the inherited R375 source-first invariant');
assert.equal(pkg.scripts['test:r494'],'node tests/r494-weather-provider-truthful-degradation-invariants.mjs','R494 package script missing');
assert.ok(String(pkg.scripts.check||'').includes('npm run test:r494'),'R494 must remain release-blocking through npm run check');

console.log('R494 WEATHER PROVIDER TRUTHFUL DEGRADATION PASS · returned forecast still strict · bounded retry preserved · 502 provider outage becomes explicit hashed ERROR truth · no forecast fabrication · unrelated Earth/runtime capability does not fail solely because an external weather source is temporarily unavailable');

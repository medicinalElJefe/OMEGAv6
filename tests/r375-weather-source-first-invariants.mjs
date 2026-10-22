import assert from 'node:assert/strict';
import fs from 'node:fs';

const earth=fs.readFileSync('src/EarthObservatoryR8.tsx','utf8');
const weather=fs.readFileSync('src/EarthWeatherR375.tsx','utf8');
const css=fs.readFileSync('src/earthWeatherR375.css','utf8');
const worker=fs.readFileSync('src/workerR8.js','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const liveEarth=fs.readFileSync('tests/r284-live-earth-browser-e2e.mjs','utf8');

for(const token of ["'WEATHER'","label:'Weather'","<EarthWeatherR375 lat={lat} lon={lon}/>","Weather forecast"])assert.ok(earth.includes(token),'R375 Earth integration missing '+token);
assert.ok(earth.includes("copy:'current conditions · seismic · events · space'")&&!earth.includes("copy:'weather · seismic · events · space'"),'R375 must keep Weather navigation text unambiguous from Evidence');
for(const token of ['R375 · SOURCE-FIRST WEATHER','Hourly · 48 h','Weekly · 7 day','earth-r375-hourly-card','earth-r375-day-card','Forecast evidence + scar ledger','agreement is not a skill probability','cannot mutate CanonState'])assert.ok(weather.includes(token),'R375 Weather surface missing '+token);
assert.ok(weather.includes("Date.now()-60*60*1000")&&weather.includes("future.length?future:all"),'R375 hourly surface must begin at the current forecast hour rather than local midnight');
for(const token of ["url.pathname==='/api/earth/weather'","OMEGA_EARTH_WEATHER_R375","forecast_days=8&timezone=auto","api.weather.gov/points/","satelliteWeatherContext","openMeteoNwsAgreement","FORECAST_SOURCE_DISAGREEMENT","canonicalMutation:false","RELATIONAL_FORECAST_STRUCTURE_ONLY_NOT_A_CALIBRATED_SKILL_SCORE"])assert.ok(worker.includes(token),'R375 weather endpoint missing '+token);
assert.ok(worker.includes('temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability'),'R375 hourly forecast must retain the core returned meteorological vector');
assert.ok(worker.includes('HEMISPHERIC_OBSERVATION_FRESHNESS_ONLY_NO_LOCAL_PIXEL_ASSIMILATION'),'R375 satellite context must not be relabeled as local pixel assimilation');
assert.ok(worker.includes("Target is outside the bounded GOES-18/19 weather-context footprint")&&worker.includes("forwardHourly=hourly.filter"),'R375 must bound GOES context geographically and anchor quality/continuity to forward forecast hours');
assert.ok(worker.includes('async function fetchPrimaryWeatherJson(url)')&&worker.includes('attempt<=2')&&worker.includes('setTimeout(resolve,250)'),'R424 primary weather transport must use exactly one bounded retry');
assert.ok(worker.includes('fetchPrimaryWeatherJson(source)'),'R424 weather forecast must use the bounded primary-source retry helper');
assert.ok(worker.includes("error:last?.error||'PRIMARY_FORECAST_UNAVAILABLE'")&&worker.includes('attemptCount:attempts.length')&&worker.includes('attempts}'),'R424 must retain exact primary-provider attempt scars when both attempts fail');
assert.ok(worker.includes('attemptCount:om.attemptCount||1')&&worker.includes('retried:om.retried===true'),'R424 successful weather evidence must disclose whether bounded retry was required');
assert.ok(worker.includes("if(!om.ok){const payload={ok:false,schema:'OMEGA_EARTH_WEATHER_R375'")&&worker.includes("state:'PROVIDER_UNAVAILABLE'")&&worker.includes("canonicalMutation:false")&&worker.includes("payload.evidenceHash=await sha256(payload);return payload"),'R494 must fail closed as an explicit hashed non-canonical provider-unavailable truth envelope when both primary weather attempts fail');
assert.equal(worker.includes('fallbackWeather'),false,'R424 must not introduce synthetic or alternate fallback weather');
assert.ok(css.includes('.earth-r375-hourly')&&css.includes('overflow-x:auto'),'R375 hourly forecast must scroll inside its own stage rather than overflow the viewport');
assert.ok(css.includes('@media(max-width:620px)')&&css.includes('.earth-r375-weekly{grid-template-columns:1fr}'),'R375 weekly forecast must retain a single-column small-phone mode');
assert.equal(pkg.scripts['test:r375'],'node tests/r375-weather-source-first-invariants.mjs','R375 invariant must be registered');
assert.ok(String(pkg.scripts.check||'').includes('npm run test:r375'),'R375 invariant must remain part of canonical npm check');
assert.ok(liveEarth.includes('count!==9')&&liveEarth.includes('including Weather and SAR Truth'),'R375 live production Earth proof must require all nine surfaces including Weather and SAR Truth');

console.log('R375/R424 WEATHER PASS · ninth Earth view · 48 h hourly + 7 day weekly · Open-Meteo remains required primary returned forecast · one bounded primary retry with exact attempt scars · NWS hourly cross-check · NOAA/GOES freshness gate · continuity/transition/scar diagnostics remain derived · CanonState mutation denied · responsive containment retained');

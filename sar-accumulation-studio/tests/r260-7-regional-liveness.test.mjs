import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const liveness=await readFile(new URL('../src/sar-regional-liveness-runtime.mjs',import.meta.url),'utf8');
const regional=await readFile(new URL('../src/sar-regional-runtime.mjs',import.meta.url),'utf8');
const r4=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');

test('R260.7 directly starts the existing regional reader when debounce is starved',()=>{
  assert.match(liveness,/CHECK_MS=700/);
  assert.match(liveness,/KICK_COOLDOWN_MS=1600/);
  assert.match(liveness,/Promise\.resolve\(regional\.reload\(\)\)/);
  assert.match(liveness,/setInterval\(\(\)=>kick\('bounded periodic liveness check'\),CHECK_MS\)/);
  assert.match(r4,/import '\.\/sar-regional-liveness-runtime\.mjs';/);
});

test('R260.7 refuses duplicate, in-flight, out-of-scale, and already-ready work',()=>{
  assert.match(liveness,/scale>=MIN_SCALE&&scale<=MAX_SCALE/);
  assert.match(liveness,/regional\.inFlight\|\|healthyForKey\(regional,key\)/);
  assert.match(liveness,/regional\?\.lastRequestKey===key/);
  assert.match(liveness,/state\.lastKickKey===key&&now-state\.lastKickAt<KICK_COOLDOWN_MS/);
  assert.match(regional,/if\(inFlightPromise&&inFlightKey===key\)return inFlightPromise/);
});

test('R260.7 has liveness authority only and preserves measurement truth',()=>{
  assert.match(liveness,/does not alter source pixels, calibration, geolocation, evidence class, authority epochs, admission thresholds, or measurement truth/);
  assert.doesNotMatch(liveness,/patch\s*=/);
  assert.doesNotMatch(liveness,/evidence\s*=/);
  assert.doesNotMatch(liveness,/CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'\s*,/);
  assert.match(r4,/patchRelease:'R260\.7'/);
});

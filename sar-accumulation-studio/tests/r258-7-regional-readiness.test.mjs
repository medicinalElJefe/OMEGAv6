import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const regional=await readFile(new URL('../src/sar-regional-runtime.mjs',import.meta.url),'utf8');
const runtime=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');

test('R258.7 reuses the same authoritative regional COG read instead of redraw-cancelling it',()=>{
  assert.match(regional,/if\(inFlightPromise&&inFlightKey===key\)return inFlightPromise/);
  assert.match(regional,/if\(inFlightPromise&&key&&key===inFlightKey\)return/);
  assert.match(regional,/omega-camera-motion-settled/);
  assert.match(regional,/LOAD_BUDGET_MS=105000/);
});

test('R258.7 keeps camera changes authoritative while retaining previous surface during the read',()=>{
  assert.match(regional,/sarAuthority\.accepts\(snapshot,\{target:true,camera:true,scene:true\}\)/);
  assert.match(regional,/AUTHORITY_EPOCH_CHANGED_DURING_REGIONAL_READ/);
  assert.match(regional,/Only a materially new/);
  assert.doesNotMatch(regional,/measurementPromotion:true|evidence:\{[^}]*measured:true/);
});

test('R258.7 metadata binds the scheduler repair to Unified Coherence without changing truth boundaries',()=>{
  assert.match(runtime,/patchRelease:'R258\.7'/);
  assert.match(runtime,/SAME_KEY_REGIONAL_READ_REUSE/);
  assert.match(runtime,/mode188:'EVIDENCE_ADMISSION_STATE_TRANSLATION_WITHOUT_PHYSICAL_PROMOTION'/);
  assert.match(runtime,/globalFabricIsCalibratedMosaic:false/);
  assert.match(runtime,/browseIsMeasurement:false/);
});

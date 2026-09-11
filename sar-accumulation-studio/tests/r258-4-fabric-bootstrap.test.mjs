import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const boot=await readFile(new URL('../src/sar-global-fabric-bootstrap-runtime.mjs',import.meta.url),'utf8');
const runtime=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');

test('R258.4 invokes the actual global-fabric refresh outside map-view debounce',()=>{
  assert.match(boot,/await g\.refresh\(\)/);
  assert.match(boot,/queueMicrotask\(bootstrap\)/);
  assert.match(boot,/CAMERA_SETTLED/);
  assert.match(boot,/INITIALIZATION_WATCHDOG/);
});

test('R258.4 bootstrap has no authority to create source records or measurement',()=>{
  assert.match(boot,/cannot create records, coverage, calibrated pixels or measurements/i);
  assert.doesNotMatch(boot,/records\.push|buildFabric|translateFabricCell|measurementPromotion:true/);
  assert.match(runtime,/sar-global-fabric-bootstrap-runtime\.mjs/);
  assert.match(runtime,/patchRelease:'R258\.4'/);
});

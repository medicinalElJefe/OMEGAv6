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

test('R258.4 bootstrap has no authority to create source records or measurement in later releases',()=>{
  assert.match(boot,/cannot create records, coverage, calibrated pixels or measurements/i);
  assert.doesNotMatch(boot,/records\.push|buildFabric|translateFabricCell|measurementPromotion:true/);
  assert.match(runtime,/sar-global-fabric-bootstrap-runtime\.mjs/);
  const r258=runtime.match(/featureRelease:'R258'[\s\S]*?patchRelease:'R258\.(\d+)'/);
  const r259=runtime.match(/featureRelease:'R259'[\s\S]*?patchRelease:'R259\.(\d+)'/);
  assert.ok(r258||r259,'release-forward patch metadata is missing');
  if(r258)assert.ok(Number(r258[1])>=4,`bootstrap invariant requires R258.4+; found R258.${r258[1]}`);
  if(r259)assert.ok(Number(r259[1])>=0,`unexpected R259 patch metadata: R259.${r259[1]}`);
  assert.match(runtime,/unresolvedFabricSectorCreatesCoverage:false/);
});
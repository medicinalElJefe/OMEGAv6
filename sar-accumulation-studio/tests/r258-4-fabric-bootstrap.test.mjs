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

  const feature=runtime.match(/featureRelease:'R(\d+)'/);
  const patch=runtime.match(/patchRelease:'R(\d+)\.(\d+)'/);
  assert.ok(feature&&patch,'release-forward release metadata is missing');
  const featureMajor=Number(feature[1]),patchMajor=Number(patch[1]),patchMinor=Number(patch[2]);
  assert.ok(featureMajor>=258,`bootstrap invariant requires feature lineage R258+; found R${featureMajor}`);
  assert.ok(patchMajor>258||(patchMajor===258&&patchMinor>=4),`bootstrap invariant requires patch lineage R258.4+; found R${patchMajor}.${patchMinor}`);

  // The release may preserve an older feature contract while advancing a visual/patch
  // release. What matters here is that no later layer grants bootstrap measurement authority.
  assert.match(runtime,/unresolvedFabricSectorCreatesCoverage:false/);
  assert.match(runtime,/globalFabricIsCalibratedMosaic:false/);
  assert.match(runtime,/mode188CreatesPhysicalLaw:false/);
});
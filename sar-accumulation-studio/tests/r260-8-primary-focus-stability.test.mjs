import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const focus=await readFile(new URL('../src/sar-primary-focus-stability-runtime.mjs',import.meta.url),'utf8');
const r4=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');

test('R260.8 explicit SAR focus deterministically settles the existing target at 420x',()=>{
  assert.match(focus,/REGIONAL_SCALE=420/);
  assert.match(focus,/SETTLE_DELAYS=\[0,90,240,520\]/);
  assert.match(focus,/r\.fitLocation\(Number\(point\.lon\),Number\(point\.lat\),REGIONAL_SCALE\)/);
  assert.match(focus,/button\.onclick=focusSarStable/);
  assert.match(focus,/primary\.focusSar=focusSarStable/);
});

test('R260.8 bounded settling yields to trusted manual map input and target changes',()=>{
  assert.match(focus,/if\(epoch!==manualEpoch\|\|key\(target\(\)\)!==key\(point\)\)return false/);
  assert.match(focus,/if\(event\.isTrusted\)manual\(\)/);
  assert.match(focus,/const epoch=manualEpoch/);
  assert.match(focus,/for\(const delay of SETTLE_DELAYS\)setTimeout\(\(\)=>commit\(point,epoch\),delay\)/);
});

test('R260.8 is camera-command only and preserves visual/measurement release identities',()=>{
  assert.match(focus,/never selects a new target, creates\/reclassifies evidence, changes source SAR pixels, calibration, geolocation, terrain admission, Canon state, or measurement truth/);
  assert.doesNotMatch(focus,/setPoint\(/);
  assert.doesNotMatch(focus,/bindMeasurement/);
  assert.match(r4,/import '\.\/sar-primary-focus-stability-runtime\.mjs';/);
  assert.match(r4,/patchRelease:'R260\.3'/);
  assert.match(r4,/livenessRelease:'R260\.7'/);
  assert.match(r4,/navigationRelease:'R260\.8'/);
});

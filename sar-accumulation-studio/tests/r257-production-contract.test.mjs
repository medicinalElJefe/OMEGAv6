import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');
test('R257 lineage keeps high-detail measured-Earth truth boundary under later releases',()=>{
  assert.match(source,/release:'R4-R257'/);
  assert.match(source,/featureRelease:'R25[89]'/);
  assert.match(source,/CALIBRATED_DEEP_TARGET_SAR/);
  assert.match(source,/MEASURED_SPATIAL_CALCULUS_DISPLAY/);
  assert.match(source,/inferenceIsObservation:false/);
  assert.match(source,/canonicalShapeCreatesMeasurement:false/);
  assert.match(source,/realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true/);
});
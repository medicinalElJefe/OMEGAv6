import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');

test('R257 assembles detail promotion after the data-native surface and experience orchestration last',()=>{
  assert.match(source,/release:'R4-R257'/);
  const surface=source.indexOf("import './data-native-surface-runtime.mjs'");
  const detail=source.indexOf("import './sar-r257-detail-runtime.mjs'");
  const experience=source.indexOf("import './sar-r257-experience-orchestrator.mjs'");
  assert.ok(surface>=0&&detail>surface&&experience>detail);
});

test('R257 metadata keeps high detail distinct from invented measurement',()=>{
  assert.match(source,/deepDetailCreatesMeasurement:false/);assert.match(source,/terrainShapedDisplayCreatesMeasurement:false/);assert.match(source,/realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true/);
});

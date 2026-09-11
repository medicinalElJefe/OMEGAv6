import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');
test('R257 lineage keeps high-detail measured-Earth truth boundary under R258',()=>{assert.match(source,/Measured Data Plane|High-Detail Measured Earth/);assert.match(source,/release:'R4-R257'/);assert.match(source,/featureRelease:'R258'/);assert.match(source,/realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true/);});

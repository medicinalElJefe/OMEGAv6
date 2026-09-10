import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');
test('R257 advertises high-detail measured Earth without claiming continuous live radar',()=>{assert.match(source,/High-Detail Measured Earth/);assert.match(source,/realtimeLabelMeansProviderFreshnessNotContinuousRadarSampling:true/);});

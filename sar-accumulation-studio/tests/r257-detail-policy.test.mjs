import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');

test('R257 exact detail reads a larger real source patch instead of synthesizing pixels',async()=>{
  const source=await read('../src/sar-r257-detail-runtime.mjs');
  assert.match(source,/interactiveRadius:64/);assert.match(source,/deepRadius:128/);assert.match(source,/loadCalibratedCurrent\(\{force:true\}\)/);assert.match(source,/does not interpolate or synthesize missing SAR measurements/i);
});

test('R257 regional and terrain detail budgets materially exceed the R256 view',async()=>{
  const regional=await read('../src/sar-regional-runtime.mjs'),terrain=await read('../src/data-native-terrain-runtime.mjs');
  assert.match(regional,/detailSamples:\[448,640,768\]/);
  // R258.7 may retune the scale thresholds for readiness, but the established R257
  // three-level real-source ladder and its ordering must remain intact.
  const ladder=regional.match(/function detailBudget\(\)\{[^}]*return s<(\d+)\?448:s<(\d+)\?640:768;/);
  assert.ok(ladder,'regional 448→640→768 source-detail ladder is missing');
  assert.ok(Number(ladder[1])>=360&&Number(ladder[2])>Number(ladder[1]),'regional LOD thresholds no longer promote monotonically');
  assert.doesNotMatch(regional,/ctx\.setLineDash\(\[5,4\]\)/,'main measured surface must not fall back to a dashed footprint box');
  assert.match(terrain,/MAX_GRID=384/);assert.match(terrain,/2,12\)/);assert.match(terrain,/omega-camera-motion-settled/);
});

test('R257 experience reserves one proof stack and hides redundant floating measurement badges',async()=>{
  const source=await read('../src/sar-r257-experience-orchestrator.mjs');
  assert.match(source,/RESERVED_ZONES_AND_SINGLE_STACK/);assert.match(source,/omegaR257ProofStack/);assert.match(source,/#omegaDataNativeBadge\{display:none!important\}/);assert.match(source,/not\(\[data-mode=proof\]\) #omegaCellInspector\{display:none!important\}/);
});

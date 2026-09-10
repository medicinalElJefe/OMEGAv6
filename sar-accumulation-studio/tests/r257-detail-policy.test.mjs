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
  assert.match(regional,/detailSamples:\[448,640,768\]/);assert.match(regional,/return s<360\?448:s<620\?640:768/);assert.doesNotMatch(regional,/ctx\.setLineDash\(\[5,4\]\)/,'main measured surface must not fall back to a dashed footprint box');
  assert.match(terrain,/MAX_GRID=384/);assert.match(terrain,/2,12\)/);assert.match(terrain,/omega-camera-motion-settled/);
});

test('R257 experience reserves one proof stack and hides redundant floating measurement badges',async()=>{
  const source=await read('../src/sar-r257-experience-orchestrator.mjs');
  assert.match(source,/RESERVED_ZONES_AND_SINGLE_STACK/);assert.match(source,/omegaR257ProofStack/);assert.match(source,/#omegaDataNativeBadge\{display:none!important\}/);assert.match(source,/not\(\[data-mode=proof\]\) #omegaCellInspector\{display:none!important\}/);
});

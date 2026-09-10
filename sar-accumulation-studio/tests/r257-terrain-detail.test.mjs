import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/data-native-terrain-runtime.mjs',import.meta.url),'utf8');

test('R257 terrain uses a larger bounded source grid and remains context, not SAR measurement',()=>{
  assert.match(source,/MAX_GRID=384/);assert.match(source,/maxZoom:12/);assert.match(source,/rawDem:true,measuredSar:false/);assert.match(source,/not SAR measurements/);
});

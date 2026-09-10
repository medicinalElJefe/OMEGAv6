import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/sar-focus-runtime.mjs',import.meta.url),'utf8');

test('deep focus keeps canonical FIT state and only expands camera when real source pixels are present',()=>{
  assert.match(source,/state:'CALIBRATED_PATCH_FIT_EXPLICIT'/);assert.match(source,/detailState:deep\?'DEEP_SOURCE_PATCH':'INTERACTIVE_SOURCE_PATCH'/);assert.match(source,/maxScale:deep\?7600:5200/);assert.match(source,/sourcePixels:\[candidate\.width,candidate\.height\]/);
});

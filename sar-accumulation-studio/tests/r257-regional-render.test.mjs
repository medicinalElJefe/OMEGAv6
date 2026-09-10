import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/sar-regional-runtime.mjs',import.meta.url),'utf8');

test('regional main image uses blade-warped measured pixels and no dashed footprint decoration',()=>{
  assert.match(source,/drawMeshCellByBlades/);assert.match(source,/alpha:\.94/);assert.doesNotMatch(source,/setLineDash/);assert.match(source,/footprint proof remains available in DATA\/PROOF/i);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const runtime=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');
const detail=await readFile(new URL('../src/sar-r257-detail-runtime.mjs',import.meta.url),'utf8');

test('R257 explicitly forbids detail promotion from being called new physical measurement',()=>{
  assert.match(runtime,/deepDetailCreatesMeasurement:false/);assert.match(detail,/does not interpolate or synthesize missing SAR measurements/);
});

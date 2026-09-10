import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/sentinel-console.mjs',import.meta.url),'utf8');

test('exact patch cache key includes source radius and adaptive blade mesh density',()=>{
  assert.match(source,/patchKey\(record,target,pol,quantity,radius\)/);assert.match(source,/\|r\$\{radius\}/);assert.match(source,/Math\.ceil\(span\/24\)/);assert.match(source,/Math\.min\(12,Math\.max\(6/);
});

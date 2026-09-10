import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/sar-regional-runtime.mjs',import.meta.url),'utf8');
test('R257 detail ladder stays bounded to the supported COG read budget',()=>{assert.match(source,/448/);assert.match(source,/640/);assert.match(source,/768/);assert.match(source,/LOAD_BUDGET_MS=32000/);});

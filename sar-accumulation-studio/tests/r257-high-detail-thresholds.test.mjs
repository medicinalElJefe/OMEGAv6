import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const regional=await readFile(new URL('../src/sar-regional-runtime.mjs',import.meta.url),'utf8');
const exact=await readFile(new URL('../src/sar-r257-detail-runtime.mjs',import.meta.url),'utf8');
test('R257 raises both regional and exact measured source budgets',()=>{assert.match(regional,/768/);assert.match(exact,/deepRadius:128/);});

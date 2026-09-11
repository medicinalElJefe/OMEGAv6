import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/sar-regional-runtime.mjs',import.meta.url),'utf8');
test('R257 detail ladder stays bounded to the supported COG read budget',()=>{
  assert.match(source,/detailSamples:\[448,640,768\]/);
  const budget=source.match(/LOAD_BUDGET_MS=(\d+)/);assert.ok(budget,'regional COG load budget is missing');
  const ms=Number(budget[1]);assert.ok(ms>=32000&&ms<=120000,`regional COG budget must remain bounded between 32s and 120s; found ${ms}`);
  assert.match(source,/REGIONAL_COG_BUDGET/);
});

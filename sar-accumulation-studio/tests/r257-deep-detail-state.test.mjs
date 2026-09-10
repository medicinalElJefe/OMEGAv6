import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/sar-r257-detail-runtime.mjs',import.meta.url),'utf8');
test('deep detail reports its own state while preserving measured evidence from the patch',()=>{assert.match(source,/state\.deepPatch=\{id:patch\.id,width:patch\.width,height:patch\.height,validCount:patch\.stats\?\.validCount\|\|0,sourceWindow:patch\.sourceWindow,evidence:patch\.evidence\}/);assert.match(source,/state\.state='DEEP_READY'/);});

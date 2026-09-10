import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/sar-r257-experience-orchestrator.mjs',import.meta.url),'utf8');
test('proof stack reserves space from top-right navigation and lower transport',()=>{assert.match(source,/right:52px;top:52px/);assert.match(source,/max-height:calc\(100% - 118px\)/);});

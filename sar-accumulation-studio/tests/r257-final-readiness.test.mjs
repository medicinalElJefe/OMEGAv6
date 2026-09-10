import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const runtime=await readFile(new URL('../src/r4-runtime.mjs',import.meta.url),'utf8');
test('R257 final runtime imports both progressive detail and collision-free experience organs',()=>{assert.match(runtime,/sar-r257-detail-runtime/);assert.match(runtime,/sar-r257-experience-orchestrator/);});

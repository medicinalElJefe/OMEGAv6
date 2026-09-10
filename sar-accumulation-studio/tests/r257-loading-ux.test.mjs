import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const ui=await readFile(new URL('../src/sar-r257-experience-orchestrator.mjs',import.meta.url),'utf8');
test('R257 uses compact progressive loading and canvas transitions',()=>{assert.match(ui,/progressiveLoading:true/);assert.match(ui,/transition:opacity \.28s/);assert.match(ui,/omega-r257-stage/);});

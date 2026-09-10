import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const ui=await readFile(new URL('../src/sar-r257-experience-orchestrator.mjs',import.meta.url),'utf8');
test('drawers suppress proof stack and map nav during focused panel work',()=>{assert.match(ui,/data-drawer\] \.omega-r257-proof-stack\{display:none!important/);assert.match(ui,/data-drawer\] \.omega-map-nav\{opacity:0!important/);});

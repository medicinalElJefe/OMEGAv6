import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const ui=await readFile(new URL('../src/sar-r257-experience-orchestrator.mjs',import.meta.url),'utf8');
const regional=await readFile(new URL('../src/sar-regional-runtime.mjs',import.meta.url),'utf8');
test('proof telemetry is reserved UI while measured geometry stays in the image plane',()=>{assert.match(ui,/omega-r257-proof-stack/);assert.doesNotMatch(regional,/ctx\.fillText|ctx\.strokeRect/);});

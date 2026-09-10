import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/sar-r257-experience-orchestrator.mjs',import.meta.url),'utf8');
test('R257 exposes one compact load stage in the primary command strip',()=>{assert.match(source,/omegaR257Stage/);assert.match(source,/host\.prepend\(stageEl\)/);assert.match(source,/MEASURED SAR/);assert.match(source,/EARTH DETAIL/);});

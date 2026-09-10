import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/sar-r257-experience-orchestrator.mjs',import.meta.url),'utf8');
test('R257 progressive status is contained inside primary controls, not another floating panel',()=>{assert.match(source,/const host=\$\('#omegaSarPrimaryControls'\)/);assert.match(source,/host\.prepend\(stageEl\)/);assert.doesNotMatch(source,/stageEl\.style\.position\s*=\s*['"]fixed/);});

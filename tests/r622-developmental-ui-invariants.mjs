import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
test('OMEGA7 recovery screen runs derived motion from conserved boundary exchanges',async()=>{
 const s=await readFile(new URL('../src7/CapabilityRecoveryAuditR705.tsx',import.meta.url),'utf8');
 for(const marker of ['traverseDevelopmentalContinuityR622','data-r622-run-traversal','data-r622-traversal-result','velocity:r.velocity','acceleration:r.acceleration','jerk:r.jerk','curvature:r.curvature'])assert.ok(s.includes(marker),marker);
 assert.match(s,/not physical dimensions or established historical parity/);
});

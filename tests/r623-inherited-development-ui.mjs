import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
test('OMEGA7 inherited developmental replay retains R651/R653 source of state',async()=>{
 const s=await readFile(new URL('../src7/CapabilityRecoveryAuditR705.tsx',import.meta.url),'utf8');
 for(const part of ['replayInheritedDevelopmentR623','data-r623-run-inherited-replay','data-r623-inherited-result','developmental:result.developmental','proof:result.proof'])assert.ok(s.includes(part),part);
 assert.ok(s.includes('does not certify production or full historical parity'));
});

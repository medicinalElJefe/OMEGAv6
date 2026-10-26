import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('OMEGA7 wires executable woven continuity operator and marks it experimental',async()=>{
 const source=await readFile(new URL('../src7/CapabilityRecoveryAuditR705.tsx',import.meta.url),'utf8');
 assert.match(source,/import \{evaluateWovenExchangeR621\}/);
 assert.match(source,/data-r621-run-exchange/);
 assert.match(source,/data-r621-exchange-result/);
 assert.match(source,/not historical parity or physical simulation/);
});
